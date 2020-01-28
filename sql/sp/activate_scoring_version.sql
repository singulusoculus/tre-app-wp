BEGIN
    -- IN score_version
    SET @score_version_new = score_version;

	SELECT version INTO @score_version_current
    FROM wp_re_boardgames_scoring
    WHERE status = 'A';

    IF @score_version_new <> @score_version_current THEN

        SELECT score_basis, max_pop, list_score_calc
        INTO @sb, @maxpop, @list_score_calc
        FROM wp_re_boardgames_scoring
        WHERE version = @score_version_new;

        UPDATE wp_re_boardgames_scoring
        SET status = 'A'
        WHERE version = @score_version_new;

        UPDATE wp_re_boardgames_scoring
        SET status = ''
        WHERE version <> @score_version_new;

        -- Create a temp table - wp_re_boardgames_update_temp
        DROP TABLE IF EXISTS `wp_re_boardgames_update_temp`;
        CREATE TABLE `wp_re_boardgames_update_temp` 
        ( `id` INT(11) NOT NULL
        , `bgg_id` INT(11) NULL
        , `bg_name` VARCHAR(200) NOT NULL
        , `at_list_score` FLOAT NULL 
        , `at_times_ranked` INT NULL
        , `cy_list_score` FLOAT NULL 
        , `cy_times_ranked` INT NULL
        , `d30_list_score` FLOAT NULL 
        , `d30_times_ranked` INT NULL
        , `bg_id` INT(11) NULL
        , PRIMARY KEY (`id`)
        , UNIQUE KEY (bgg_id))
        ENGINE = MyISAM CHARSET=utf8mb4 
        COLLATE utf8mb4_unicode_ci;

        -- Insert boardgames into temp table
        INSERT INTO wp_re_boardgames_update_temp (id, bg_name, bgg_id)
        SELECT bg_id, bg_name, bgg_id
        FROM wp_re_boardgames;

        -- All time - list score and times ranked
          SET @s = CONCAT(
        'INSERT INTO wp_re_boardgames_update_temp (bgg_id, at_list_score, at_times_ranked)
        SELECT wp_re_results_d.bgg_id
        ,', @list_score_calc ,' as list_score
        , count(wp_re_results_d.bgg_id) as times_ranked
        FROM wp_re_results_d
        JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
        JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
        WHERE item_count > 10
        GROUP BY wp_re_results_d.bgg_id
        ON DUPLICATE KEY UPDATE
        at_list_score = VALUES(at_list_score)
        , at_times_ranked = VALUES(at_times_ranked);'
        );
        PREPARE stmt1 FROM @s;
        EXECUTE stmt1;
        DEALLOCATE PREPARE stmt1;
        
        -- Current Year - list score and times ranked
        SET @s = CONCAT(
        'INSERT INTO wp_re_boardgames_update_temp (bgg_id, cy_list_score, cy_times_ranked)
        SELECT wp_re_results_d.bgg_id
        ,', @list_score_calc ,' as list_score
        , count(wp_re_results_d.bgg_id) as times_ranked
        FROM wp_re_results_d
        JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
        JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
        WHERE year(finish_date) = year(now())
        AND item_count > 10
        GROUP BY wp_re_results_d.bgg_id
        ON DUPLICATE KEY UPDATE
        cy_list_score = VALUES(cy_list_score)
        , cy_times_ranked = VALUES(cy_times_ranked);'
        );
        PREPARE stmt1 FROM @s;
        EXECUTE stmt1;
        DEALLOCATE PREPARE stmt1;

        -- 30 Days - list score and times ranked
        SET @s = CONCAT(
        'INSERT INTO wp_re_boardgames_update_temp (bgg_id, d30_list_score, d30_times_ranked)
        SELECT wp_re_results_d.bgg_id
        ,', @list_score_calc ,' as list_score
        , count(wp_re_results_d.bgg_id) as times_ranked
        FROM wp_re_results_d
        JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
        JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
        WHERE (wp_re_results_h.finish_date) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
        AND item_count > 10
        GROUP BY wp_re_results_d.bgg_id
        ON DUPLICATE KEY UPDATE
        d30_list_score = VALUES(d30_list_score)
        , d30_times_ranked = VALUES(d30_times_ranked);'
        );
        PREPARE stmt1 FROM @s;
        EXECUTE stmt1;
        DEALLOCATE PREPARE stmt1;


        -- Update wp_re_boardgames
        UPDATE wp_re_boardgames
        JOIN wp_re_boardgames_update_temp ON wp_re_boardgames.bgg_id = wp_re_boardgames_update_temp.bgg_id
        SET wp_re_boardgames.at_list_score = wp_re_boardgames_update_temp.at_list_score
        , wp_re_boardgames.at_times_ranked = wp_re_boardgames_update_temp.at_times_ranked
        , wp_re_boardgames.cy_list_score = wp_re_boardgames_update_temp.cy_list_score
        , wp_re_boardgames.cy_times_ranked = wp_re_boardgames_update_temp.cy_times_ranked
        , wp_re_boardgames.d30_list_score = wp_re_boardgames_update_temp.d30_list_score
        , wp_re_boardgames.d30_times_ranked = wp_re_boardgames_update_temp.d30_times_ranked;

        CALL calc_bg_maxcounts;

        -- Update popularity
        UPDATE wp_re_boardgames
        CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_maxcounts WHERE max_list_type = 'A') AS MaxList 
        SET at_pop_score = round((at_times_ranked)*@maxpop/MaxList.max_list_count, 3);

        UPDATE wp_re_boardgames
        CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_maxcounts WHERE max_list_type = 'Y') AS MaxList 
        SET cy_pop_score = round((cy_times_ranked)*@maxpop/MaxList.max_list_count, 3);

        UPDATE wp_re_boardgames
        CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_maxcounts WHERE max_list_type = 'D') AS MaxList 
        SET d30_pop_score = round((d30_times_ranked)*@maxpop/MaxList.max_list_count, 3);
        
        -- Drop temp table
        DROP TABLE wp_re_boardgames_update_temp;

        CALL calc_bg_ranks;
        
        -- Update raw and adjust columns
        UPDATE wp_re_boardgames
        SET at_total_raw = round(at_list_score + at_pop_score, 3),
        at_total_adjust = round((at_list_score + at_pop_score)/@sb, 3),
        cy_total_raw = round(cy_list_score + cy_pop_score, 3),
        cy_total_adjust = round((cy_list_score + cy_pop_score)/@sb, 3),
        d30_total_raw = round(d30_list_score + d30_pop_score, 3),
        d30_total_adjust = round((d30_list_score + d30_pop_score)/@sb, 3);

    END IF;


END