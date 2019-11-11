BEGIN

SET @yperiod = year;
SET @rownum = 0;

SELECT max_list_count INTO @existscheck
FROM wp_re_boardgames_hist_maxcounts
WHERE period = @yperiod;

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
    SELECT wp_re_results_d.id, wp_re_results_d.result_id, wp_re_results_d.bg_id, wp_re_results_d.item_name, item_rank, wp_re_results_d.bgg_id, item_count, finish_date
    FROM wp_re_results_d
    JOIN wp_re_results_h ON wp_re_results_d.result_id = wp_re_results_h.result_id
    WHERE year(finish_date) = @yperiod
    AND item_count > 10
    AND list_category = 2;

    -- Update wp_re_boardgames_hist_maxcounts
    INSERT INTO wp_re_boardgames_hist_maxcounts (period_type, period, max_list_count)
    SELECT "Y" AS period_type
    , @yperiod AS period
    , count(`temp_hist_results`.bgg_id) AS counted
    FROM `temp_hist_results`
    GROUP BY bgg_id
    ORDER BY counted DESC
    LIMIT 1;

    --  Insert history into wp_re_boardgames_hist_month
    INSERT INTO wp_re_boardgames_hist_year (bg_id, bgg_id, period, bg_rank, list_score, pop_score, total_score, times_ranked)
    SELECT bg_id, bgg_id, period, @rownum := @rownum+1, list_score, pop_score, total_score, times_ranked
    FROM
    (SELECT bg_id
    , bgg_id
    , @yperiod AS period
    , round(avg(((item_count - item_rank + 1) / item_count)*100), 3) AS list_score
    , round(count(bgg_id) * 20 / MaxList.max_list_count, 3) AS pop_score
    , round(avg(((item_count - item_rank + 1) / item_count)*100), 3) + round(count(bgg_id) * 20 / MaxList.max_list_count, 3) AS total_score
    , count(bgg_id) as times_ranked
    FROM temp_hist_results
    CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_hist_maxcounts WHERE period = @yperiod AND period_type = "Y") AS MaxList
    GROUP BY bgg_id
    HAVING pop_score > 1
    ORDER BY total_score DESC) as bghist;

    DROP TABLE `temp_hist_results`;

END IF;

END