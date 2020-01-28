BEGIN

    SET @yperiod = year;
    SET @rownum = 0;

    SELECT score_basis, max_pop, list_score_calc, version
    INTO @sb, @maxpop, @list_score_calc, @scoring_version
    FROM wp_re_boardgames_scoring
    WHERE status = 'A';

    SELECT count(bgg_id) INTO @existscheck
    FROM wp_re_boardgames_hist
    WHERE period = @yperiod;

    IF @existscheck <> 0 THEN
        -- IF data from that period exists, clear it from wp_re_boardgames_hist so it can be recalculated
        DELETE FROM wp_re_boardgames_hist
        WHERE period = @yperiod;

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

    -- Get all results from the year period
    INSERT INTO temp_hist_results (id, result_id, bg_id, item_name, item_rank, bgg_id, item_count, finish_date)
    SELECT wp_re_results_d.id, wp_re_results_d.result_id, wp_re_results_d.bg_id, wp_re_results_d.item_name, item_rank, wp_re_results_d.bgg_id, item_count, finish_date
    FROM wp_re_results_d
    JOIN wp_re_results_h ON wp_re_results_d.result_id = wp_re_results_h.result_id
    WHERE year(finish_date) = @yperiod
    AND item_count > 10
    AND list_category = 2
    AND bgg_id <> 0;

    -- INSERT new period history or UPDATE max_list_count if the period already exists
    INSERT INTO wp_re_boardgames_hist_periods (period_type, period, max_list_count, period_key, scoring_version)
    SELECT "Y" AS period_type
    , @yperiod AS period
    , count(`temp_hist_results`.bgg_id) AS counted
    , CONCAT("Y", @yperiod) AS period_key
    , @scoring_version AS scoring_version
    FROM `temp_hist_results`
    GROUP BY bgg_id
    ORDER BY counted DESC
    LIMIT 1
    ON DUPLICATE KEY UPDATE
    max_list_count = VALUES(max_list_count);

    --  Insert history into wp_re_boardgames_hist
    SET @s = CONCAT(
    'INSERT INTO wp_re_boardgames_hist (bg_id, bgg_id, bg_name, period, bg_rank, list_score, pop_score, total_raw, times_ranked, hist_type)
    SELECT bg_id, bgg_id, NULL AS bg_name, period, @rownum := @rownum+1, list_score, pop_score, total_score, times_ranked, "', 'Y','" as hist_type
    FROM
    (SELECT bg_id
    , bgg_id
    , item_name as bg_name
    , @yperiod AS period
    ,', @list_score_calc ,' as list_score
    , round(count(bgg_id) * @maxpop / MaxList.max_list_count, 3) AS pop_score
    ,', @list_score_calc ,' + round(count(bgg_id) * @maxpop / MaxList.max_list_count, 3) AS total_score
    , count(bgg_id) as times_ranked
    FROM temp_hist_results
    CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_hist_periods WHERE period = @yperiod AND period_type = "Y") AS MaxList
    GROUP BY bgg_id
    HAVING pop_score > 1
    ORDER BY total_score DESC) as bghist;'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    DROP TABLE `temp_hist_results`;

    -- Update history table with names
    UPDATE wp_re_boardgames_hist
    JOIN wp_re_boardgames ON wp_re_boardgames_hist.bgg_id = wp_re_boardgames.bgg_id
    SET wp_re_boardgames_hist.bg_name = wp_re_boardgames.bg_name
    WHERE wp_re_boardgames_hist.bg_name IS NULL
    AND wp_re_boardgames_hist.hist_type = 'Y';
    
    UPDATE wp_re_boardgames_hist
    SET total_adjust = round(total_raw/@sb, 3)
    WHERE period = @yperiod;

END