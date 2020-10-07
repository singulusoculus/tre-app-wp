BEGIN

    SET @mperiod = month;
    SET @rownum = 0;
    SET @month = substring(@mperiod, 5, 2);
    SET @year = substring(@mperiod, 1, 4);
    SET @last_period = cast(case when @month = '01' then concat(@year-1, 12) else @mperiod -1 END as unsigned);

    SELECT list_score_calc, version
    INTO @list_score_calc, @scoring_version
    FROM wp_re_boardgames_scoring
    WHERE status = 'A';

    SELECT count(bgg_id) INTO @existscheck
    FROM wp_re_boardgames_hist
    WHERE period = @mperiod;

    IF @existscheck <> 0 THEN
        -- IF data from that period exists, clear it from wp_re_boardgames_hist so it can be recalculated
        DELETE FROM wp_re_boardgames_hist
        WHERE period = @mperiod;

    END IF;

    DROP TABLE IF EXISTS `temp_hist_results`;
    CREATE TABLE `temp_hist_results` (
    `id` int(11) NOT NULL,
    `result_id` int(11) NOT NULL,
    `bg_id` int(11) NULL,
    `item_name` text COLLATE utf8mb4_unicode_ci NOT NULL,
    `item_rank` int(11) NOT NULL,
    `bgg_id` int(11) NULL,
    `item_count` int(11),
    `finish_date` date,
    PRIMARY KEY (`id`),
    KEY `bg_id` (`bg_id`) USING BTREE,
    KEY `bgg_id` (`bgg_id`)
    ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

    INSERT INTO temp_hist_results (id, result_id, bg_id, item_name, item_rank, bgg_id, item_count, finish_date)
    SELECT wp_re_results_d.id, wp_re_results_d.result_id, wp_re_results_d.bg_id, item_name, item_rank, wp_re_results_d.bgg_id, item_count, finish_date
    FROM wp_re_results_d
    JOIN wp_re_results_h ON wp_re_results_d.result_id = wp_re_results_h.result_id
    WHERE concat(year(finish_date), case when month(finish_date) < 10 THEN concat(0, month(finish_date)) ELSE month(finish_date) END) = @mperiod
    AND item_count > 10
    AND list_category = 2
    AND wp_re_results_d.bgg_id <> 0;

    -- Update wp_re_boardgames_hist_periods - month
    INSERT INTO wp_re_boardgames_hist_periods (period_type, period, max_times_ranked, period_key, scoring_version)
    SELECT "M" AS period_type
    , @mperiod AS period
    , count(`temp_hist_results`.bgg_id) AS counted
    , CONCAT("M", @mperiod) AS period_key
    , @scoring_version AS scoring_version
    FROM `temp_hist_results`
    GROUP BY bgg_id
    ORDER BY counted DESC
    LIMIT 1
    ON DUPLICATE KEY UPDATE
    max_times_ranked = VALUES(max_times_ranked);

    SELECT count(`temp_hist_results`.bgg_id) INTO @temp_count FROM temp_hist_results GROUP BY bgg_id ORDER BY count(`temp_hist_results`.bgg_id) DESC LIMIT 1;

    -- Update wp_re_boardgames_hist_periods - all time
    INSERT INTO wp_re_boardgames_hist_periods (period_type, period, max_times_ranked, period_key, scoring_version)
    SELECT "A" AS period_type
    , @mperiod AS period
    , (@temp_count + l.max_times_ranked) AS count
    , CONCAT("A", @mperiod) AS period_key
    , @scoring_version AS scoring_version
    FROM `temp_hist_results`
    CROSS JOIN (SELECT max_times_ranked from wp_re_boardgames_hist_periods where period = @last_period and period_type = 'A') AS l
    GROUP BY bgg_id
    ORDER BY count DESC
    LIMIT 1
    ON DUPLICATE KEY UPDATE
    max_times_ranked = VALUES(max_times_ranked);

    -----------------  MONTH  --------------------

    --  Capture current month history - no ranks yet
    SET @s = CONCAT(
    'INSERT INTO wp_re_boardgames_hist (bg_id, bgg_id, bg_name, period, list_score, times_ranked, hist_type)
    SELECT bg_id, bgg_id, NULL as bg_name, period, list_score, times_ranked, "', 'M','" as hist_type
    FROM
    (SELECT bg_id
    , bgg_id
    , item_name AS bg_name
    , @mperiod AS period
    ,', @list_score_calc ,' as list_score
    , count(bgg_id) as times_ranked
    FROM temp_hist_results
    WHERE concat(year(finish_date), case when month(finish_date) < 10 THEN concat(0, month(finish_date)) ELSE month(finish_date) END) = @mperiod
    GROUP BY bgg_id) as bghist;'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    DROP TABLE `temp_hist_results`;

    -- wp_re_boardgames_hist_periods - average times ranked
    UPDATE wp_re_boardgames_hist_periods
    SET avg_times_ranked = (SELECT avg(times_ranked) FROM wp_re_boardgames_hist WHERE hist_type = 'M' and period = @mperiod)
    WHERE period_type = 'M' AND period = @mperiod;

    -- wp_re_boardgames_hist_periods - average list score
    UPDATE wp_re_boardgames_hist_periods
    SET avg_list_score = (SELECT avg(list_score) FROM wp_re_boardgames_hist WHERE hist_type = 'M' and period = @mperiod)
    WHERE period_type = 'M' AND period = @mperiod;

    -- Update history table with names
    UPDATE wp_re_boardgames_hist
    JOIN wp_re_boardgames ON wp_re_boardgames_hist.bgg_id = wp_re_boardgames.bgg_id
    SET wp_re_boardgames_hist.bg_name = wp_re_boardgames.bg_name
    WHERE wp_re_boardgames_hist.bg_name IS NULL
    AND hist_type = 'M';

    -- Rank Score Calculations
    IF @scoring_version = 3 THEN
        -- Use BA method
        UPDATE wp_re_boardgames_hist
        CROSS JOIN	(SELECT avg_times_ranked, avg_list_score FROM wp_re_boardgames_hist_periods WHERE period_type = 'M' AND period = @mperiod) as p
        SET rank_score = round(((times_ranked*list_score)+(p.avg_times_ranked*p.avg_list_score))/(times_ranked+p.avg_times_ranked), 3)
        WHERE hist_type = 'M' AND period = @mperiod;
    
    ELSEIF @scoring_version = 2 THEN
        SET @sb = 1.16;
        SET @maxpop = 16;

        DELETE wp_re_boardgames_hist
        FROM wp_re_boardgames_hist
        CROSS JOIN	(SELECT max_times_ranked FROM wp_re_boardgames_hist_periods WHERE period_type = 'M' AND period = @mperiod) as p
        WHERE hist_type = 'M' AND period = @mperiod AND (times_ranked*@maxpop/p.max_times_ranked) < .7;

        UPDATE wp_re_boardgames_hist
        CROSS JOIN	(SELECT max_times_ranked FROM wp_re_boardgames_hist_periods WHERE period_type = 'M' AND period = @mperiod) as p
        SET rank_score = round((list_score + (times_ranked*@maxpop/p.max_times_ranked))/@sb , 3)
        WHERE hist_type = 'M' AND period = @mperiod;

    ELSEIF @scoring_version = 1 THEN
        SET @sb = 1.20;
        SET @maxpop = 20;

        DELETE wp_re_boardgames_hist
        FROM wp_re_boardgames_hist
        CROSS JOIN	(SELECT max_times_ranked FROM wp_re_boardgames_hist_periods WHERE period_type = 'M' AND period = @mperiod) as p
        WHERE hist_type = 'M' AND period = @mperiod AND (times_ranked*@maxpop/p.max_times_ranked) < .7;

        UPDATE wp_re_boardgames_hist
        CROSS JOIN	(SELECT max_times_ranked FROM wp_re_boardgames_hist_periods WHERE period_type = 'M' AND period = @mperiod) as p
        SET rank_score = round((list_score + (times_ranked*@maxpop/p.max_times_ranked))/@sb , 3)
        WHERE hist_type = 'M' AND period = @mperiod;

    END IF;

    -- Update Ranks based on Rank Score
    INSERT INTO wp_re_boardgames_hist (id, bg_rank)
    SELECT id, @rownum := @rownum+1
    FROM wp_re_boardgames_hist
    WHERE hist_type = 'M' AND period = @mperiod
    ORDER BY rank_score DESC
    ON DUPLICATE KEY UPDATE bg_rank = VALUES(bg_rank);


-----------------  ALL TIME  --------------------

    IF @mperiod = 201805 THEN

        INSERT INTO wp_re_boardgames_hist_periods (period_type, period, max_times_ranked, avg_times_ranked, avg_list_score)
        SELECT 'A' as period_type, period, max_times_ranked, avg_times_ranked, avg_list_score
        FROM wp_re_boardgames_hist_periods
        WHERE period_type = 'M' AND period = 201805;

        INSERT INTO wp_re_boardgames_hist (bg_id, bgg_id, bg_name, period, bg_rank, list_score, times_ranked, rank_score, hist_type)
        SELECT bg_id, bgg_id, bg_name, period, bg_rank, list_score, times_ranked, rank_score, 'A' as hist_type
        FROM wp_re_boardgames_hist
        WHERE period = 201805
        AND hist_type = 'M';

    ELSE

        -- Reset rownum
        SET @rownum = 0;

        DROP TABLE IF EXISTS `temp_hist_results_at`;
        CREATE TABLE `temp_hist_results_at` (
        `bg_id` int(11) NULL,
        `bgg_id` int(11) NULL,
        `bg_name` text COLLATE utf8mb4_unicode_ci NULL,
        `period` varchar(6) COLLATE utf8mb4_unicode_ci NULL, 
        `bg_rank` int(11) NULL,
        `c_list_score` float DEFAULT 0,
        `l_list_score` float DEFAULT 0,
        `c_times_ranked` int(11) DEFAULT 0,
        `l_times_ranked` int(11) DEFAULT 0,
        `list_score` float DEFAULT 0,
        `times_ranked` int(11) DEFAULT 0,
        `rank_score` float DEFAULT 0,
        PRIMARY KEY (`bgg_id`)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


        -- Insert all possible board games
        INSERT INTO temp_hist_results_at (bg_id, bgg_id, bg_name, period)
        SELECT bg_id, bgg_id, bg_name, @mperiod
        FROM wp_re_boardgames;

        -- Insert current month data
        INSERT INTO temp_hist_results_at (bgg_id, c_list_score, c_times_ranked)
        SELECT c.bgg_id, c.list_score, c.times_ranked
        FROM wp_re_boardgames_hist AS c 
        JOIN temp_hist_results_at AS t ON c.bgg_id = t.bgg_id
        WHERE c.period = @mperiod
        AND c.hist_type = 'M'
        ON DUPLICATE KEY UPDATE c_list_score = VALUES(c_list_score), c_times_ranked = VALUES(c_times_ranked);

        -- Insert last months at data
        INSERT INTO temp_hist_results_at (bgg_id, l_list_score, l_times_ranked)
        SELECT l.bgg_id, l.list_score, l.times_ranked
        FROM wp_re_boardgames_hist AS l
        JOIN temp_hist_results_at AS t ON l.bgg_id = t.bgg_id
        WHERE l.period = @last_period
        AND l.hist_type = 'A'
        ON DUPLICATE KEY UPDATE l_list_score = VALUES(l_list_score), l_times_ranked = VALUES(l_times_ranked);

        -- Calculate Scores
        UPDATE temp_hist_results_at
        SET list_score = round(((c_list_score * c_times_ranked) + (l_list_score * l_times_ranked)) / (c_times_ranked + l_times_ranked), 3),
        times_ranked = c_times_ranked + l_times_ranked;

        DELETE FROM temp_hist_results_at
        WHERE times_ranked = 0;

        -- wp_re_boardgames_hist_periods - average times ranked
        UPDATE wp_re_boardgames_hist_periods
        SET avg_times_ranked = (SELECT avg(times_ranked) FROM temp_hist_results_at)
        WHERE period_type = 'A' AND period = @mperiod;

        -- wp_re_boardgames_hist_periods - average list score
        UPDATE wp_re_boardgames_hist_periods
        SET avg_list_score = (SELECT avg(list_score) FROM temp_hist_results_at)
        WHERE period_type = 'A' AND period = @mperiod;

        UPDATE temp_hist_results_at
        CROSS JOIN	(SELECT avg_times_ranked, avg_list_score FROM wp_re_boardgames_hist_periods WHERE period_type = 'A' AND period = @mperiod) as p
        SET rank_score = round(((times_ranked*list_score)+(p.avg_times_ranked*p.avg_list_score))/(times_ranked+p.avg_times_ranked), 3);

        -- Insert results into wp_re_boardgames_hist
        INSERT INTO wp_re_boardgames_hist (bg_id, bgg_id, bg_name, period, bg_rank, list_score, times_ranked, rank_score, hist_type)
        SELECT bg_id, bgg_id, bg_name, period, @rownum := @rownum+1 as bg_rank, list_score, times_ranked, rank_score, 'A' as hist_type
        FROM temp_hist_results_at
        ORDER BY rank_score DESC;

        DROP TABLE temp_hist_results_at;


    END IF;

END