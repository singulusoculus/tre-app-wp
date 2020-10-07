BEGIN
    SET @t = concat("temp_",replace(uuid(), '-', ''));

    CALL calc_bg_list_info;

    -- Create Temp Table
    SET @s = CONCAT('CREATE TABLE ', @t, '  
    ( `bgg_id` INT(11) NULL
    , `at_list_score` FLOAT NULL 
    , `at_times_ranked` INT NULL
    , `at_ba_score` FLOAT NULL
    , `cy_list_score` FLOAT NULL 
    , `cy_times_ranked` INT NULL
    , `cy_ba_score` FLOAT NULL
    , `d30_list_score` FLOAT NULL 
    , `d30_times_ranked` INT NULL
    , `d30_ba_score` FLOAT NULL)
    ENGINE = MyISAM CHARSET=utf8mb4 
    COLLATE utf8mb4_unicode_ci;');
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Populate Temp Table
    SET @s = CONCAT(
    'INSERT INTO ', @t, ' (bgg_id, at_list_score, at_times_ranked, cy_list_score, cy_times_ranked, d30_list_score, d30_times_ranked)
    SELECT bgg_id
    , at_list_score
    , at_times_ranked
    , cy_list_score
    , cy_times_ranked
    , d30_list_score
    , d30_times_ranked
    FROM wp_re_boardgames
    WHERE at_times_ranked > 0;'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Calculate All Time
    SET @s = CONCAT(
        'UPDATE ', @t, '
        CROSS JOIN wp_re_boardgames_list_info
        SET at_ba_score = round(((at_times_ranked*at_list_score)+(avg_times_ranked*avg_list_score))/(at_times_ranked+avg_times_ranked), 3)
        WHERE list_type = "A" AND at_times_ranked > 0;  '
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Calculate Current Year
    SET @s = CONCAT(
        'UPDATE ', @t, '
        CROSS JOIN wp_re_boardgames_list_info
        SET cy_ba_score = round(((cy_times_ranked*cy_list_score)+(avg_times_ranked*avg_list_score))/(cy_times_ranked+avg_times_ranked), 3)
        WHERE list_type = "Y" AND cy_times_ranked > 0;'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Calculate Last 30 Days
    SET @s = CONCAT(
        'UPDATE ', @t, '
        CROSS JOIN wp_re_boardgames_list_info
        SET d30_ba_score = round(((d30_times_ranked*d30_list_score)+(avg_times_ranked*avg_list_score))/(d30_times_ranked+avg_times_ranked), 3)
        WHERE list_type = "D" AND d30_times_ranked > 0;'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Update wp_re_boardgames
    SET @s = CONCAT(
        'UPDATE wp_re_boardgames
        JOIN ', @t, ' ON wp_re_boardgames.bgg_id = ', @t, '.bgg_id
        SET at_rank_score = at_ba_score,
        cy_rank_score = cy_ba_score,
        d30_rank_score = d30_ba_score;'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Drop Table
    SET @s = CONCAT('DROP TABLE ', @t, ';');
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

END