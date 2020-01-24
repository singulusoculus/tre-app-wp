BEGIN

SET @mperiod = month;
SET @rownum = 0;
SET @month = substring(@mperiod, 5, 2);
SET @year = substring(@mperiod, 1, 4);
SET @last_period = cast(case when @month = '01' then concat(@year-1, 12) else @mperiod -1 END as unsigned);


SELECT max_list_count INTO @existscheck
FROM wp_re_boardgames_hist_maxcounts
WHERE period = @mperiod
AND period_type = 'M';

IF @existscheck IS NULL THEN

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

    -- Update wp_re_boardgames_hist_maxcounts - month
    INSERT INTO wp_re_boardgames_hist_maxcounts (period_type, period, max_list_count)
    SELECT "M" AS period_type
    , @mperiod AS period
    , count(`temp_hist_results`.bgg_id) AS counted
    FROM `temp_hist_results`
    GROUP BY bgg_id
    ORDER BY counted DESC
    LIMIT 1;

    SELECT count(`temp_hist_results`.bgg_id) INTO @temp_count FROM temp_hist_results GROUP BY bgg_id ORDER BY count(`temp_hist_results`.bgg_id) DESC LIMIT 1;

        -- Update wp_re_boardgames_hist_maxcounts - all time
    INSERT INTO wp_re_boardgames_hist_maxcounts (period_type, period, max_list_count)
    SELECT "A" AS period_type
    , @mperiod AS period
    , (@temp_count + l.max_list_count) AS count
    FROM `temp_hist_results`
    CROSS JOIN (SELECT max_list_count from wp_re_boardgames_hist_maxcounts where period = @last_period and period_type = 'A') AS l
    GROUP BY bgg_id
    ORDER BY count DESC
    LIMIT 1;

    --  Capture current month history
    INSERT INTO wp_re_boardgames_hist (bg_id, bgg_id, bg_name, period, bg_rank, list_score, pop_score, total_score, times_ranked, hist_type)
    SELECT bg_id, bgg_id, NULL as bg_name, period, @rownum := @rownum+1, list_score, pop_score, total_score, times_ranked, 'M' as hist_type
    FROM
    (SELECT bg_id
    , bgg_id
    , item_name AS bg_name
    , @mperiod AS period
    , round(avg(((item_count - item_rank + 1) / item_count)*100), 3) AS list_score
    , round(count(bgg_id) * 20 / MaxList.max_list_count, 3) AS pop_score
    , round(avg(((item_count - item_rank + 1) / item_count)*100), 3) + round(count(bgg_id) * 20 / MaxList.max_list_count, 3) AS total_score
    , count(bgg_id) as times_ranked
    FROM temp_hist_results
    CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_hist_maxcounts WHERE period = @mperiod AND period_type = "M") AS MaxList
    WHERE concat(year(finish_date), case when month(finish_date) < 10 THEN concat(0, month(finish_date)) ELSE month(finish_date) END) = @mperiod
    GROUP BY bgg_id
    HAVING pop_score > .7
    ORDER BY total_score DESC) as bghist;

    DROP TABLE `temp_hist_results`;

    -- Update history table with names
    UPDATE wp_re_boardgames_hist
    JOIN wp_re_boardgames ON wp_re_boardgames_hist.bgg_id = wp_re_boardgames.bgg_id
    SET wp_re_boardgames_hist.bg_name = wp_re_boardgames.bg_name
    WHERE wp_re_boardgames_hist.bg_name IS NULL
    AND hist_type = 'M';

    IF @mperiod = 201805 THEN

        INSERT INTO wp_re_boardgames_hist_maxcounts (period_type, period, max_list_count)
        SELECT 'A' as period_type, period, max_list_count
        FROM wp_re_boardgames_hist_maxcounts
        WHERE period_type = 'M' AND period = 201805;

        INSERT INTO wp_re_boardgames_hist (bg_id, bgg_id, bg_name, period, bg_rank, list_score, pop_score, total_score, times_ranked, hist_type)
        SELECT bg_id, bgg_id, bg_name, period, bg_rank, list_score, pop_score, total_score, times_ranked, 'A' as hist_type
        FROM wp_re_boardgames_hist
        WHERE period = 201805
        AND pop_score > 1
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
        `pop_score` float DEFAULT 0,
        `total_score` float DEFAULT 0,
        `times_ranked` int(11) DEFAULT 0,
        `max_list_count` int(11),
        `keep` varchar(1),
        PRIMARY KEY (`bgg_id`)
        ) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;


        -- Insert all possible board games
        INSERT INTO temp_hist_results_at (bg_id, bgg_id, bg_name, period, max_list_count)
        SELECT bg_id, bgg_id, bg_name, @mperiod, max_list_count
        FROM wp_re_boardgames
        CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_hist_maxcounts WHERE period = @mperiod AND period_type = "A") AS MaxList;

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

        -- Remove NULL rows
        DELETE FROM temp_hist_results_at
        WHERE l_times_ranked = 0 AND c_times_ranked = 0;

        -- Calculate Scores
        UPDATE temp_hist_results_at
        SET list_score = round(((c_list_score * c_times_ranked) + (l_list_score * l_times_ranked)) / (c_times_ranked + l_times_ranked), 3),
        pop_score = round(((c_times_ranked + l_times_ranked) *20) / max_list_count, 3),
        times_ranked = c_times_ranked + l_times_ranked;

        UPDATE temp_hist_results_at
        SET keep = 'Y'
        WHERE l_times_ranked + c_times_ranked >= 150 OR pop_score > 1;

        DELETE FROM temp_hist_results_at
        WHERE `keep` IS NULL;

        UPDATE temp_hist_results_at
        SET total_score = list_score + pop_score;

        -- Insert results into wp_re_boardgames_hist
        INSERT INTO wp_re_boardgames_hist (bg_id, bgg_id, bg_name, period, bg_rank, list_score, pop_score, total_score, times_ranked, hist_type)
        SELECT bg_id, bgg_id, bg_name, period, @rownum := @rownum+1 as bg_rank, list_score, pop_score, total_score, times_ranked, 'A' as hist_type
        FROM temp_hist_results_at
        ORDER BY total_score DESC;

        DROP TABLE temp_hist_results_at;


    END IF;

END IF;

END