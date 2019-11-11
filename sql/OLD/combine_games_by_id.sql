DELIMITER $$
CREATE DEFINER=`pubmeepl`@`localhost` PROCEDURE `combine_games_by _id`(IN `olditemid` INT, IN `newitemid` INT)
BEGIN

-- check if ids exist
SELECT bg_id INTO @oldidcheck FROM wp_re_boardgames WHERE bg_id = olditemid;
SELECT bg_id INTO @newidcheck FROM wp_re_boardgames WHERE bg_id = newitemid;

IF @oldidcheck IS NOT NULL AND @newidcheck IS NOT NULL THEN

  -- Get bg_names

  SELECT bg_name INTO @finditemname FROM wp_re_boardgames where bg_id = olditemid;
  SELECT bg_name INTO @replaceitemname FROM wp_re_boardgames where bg_id = newitemid;

  -- update wp_re_item_name_fixes and wp_re_results_d
  CALL new_re_item_name_fixes(@finditemname, @replaceitemname);

    -- Get previous scores for trend calc
    DROP TABLE IF EXISTS `wp_re_boardgames_score_temp`;
    CREATE TABLE `wp_re_boardgames_score_temp` 
    (`bg_id` INT(11) NOT NULL
    , `prev_at_score` FLOAT NOT NULL
    , `prev_cy_score` FLOAT NOT NULL
    , `prev_d30_score` FLOAT NOT NULL 
    , PRIMARY KEY (`bg_id`))
    ENGINE = MyISAM CHARSET=utf8mb4 
    COLLATE utf8mb4_unicode_ci;

    INSERT INTO wp_re_boardgames_score_temp (bg_id, prev_at_score, prev_cy_score, prev_d30_score)
    SELECT bg_id
    , at_list_score + at_pop_score AS prev_at_score
    , cy_list_score + cy_pop_score AS prev_cy_score
    , d30_list_score + d30_pop_score AS prev_d30_score
    FROM wp_re_boardgames
    WHERE bg_id = newitemid;

    -- Fix bg_ids in wp_re_results_d
    UPDATE wp_re_results_d
    SET bg_id = newitemid
    WHERE bg_id = olditemid;

      -- Create a temp table - wp_re_boardgames_update_temp
    DROP TABLE IF EXISTS `wp_re_boardgames_update_temp`;
    CREATE TABLE `wp_re_boardgames_update_temp` 
    ( `bg_id` INT(11) 
    , `at_list_score` FLOAT NOT NULL 
    , `at_times_ranked` INT NOT NULL
    , `cy_list_score` FLOAT NOT NULL 
    , `cy_times_ranked` INT NOT NULL
    , `d30_list_score` FLOAT NOT NULL 
    , `d30_times_ranked` INT NOT NULL
    , PRIMARY KEY (`bg_id`))
    ENGINE = MyISAM CHARSET=utf8mb4 
    COLLATE utf8mb4_unicode_ci;

    ALTER TABLE `wp_re_boardgames_update_temp` ADD UNIQUE(`bg_id`);

    INSERT INTO wp_re_boardgames_update_temp (bg_id)
    VALUES (newitemid);

      -- All time - list score and times ranked
    INSERT INTO wp_re_boardgames_update_temp (bg_id, at_list_score, at_times_ranked)
    SELECT wp_re_results_d.bg_id
    , round(avg(((item_count-item_rank+1)/item_count)*100), 3) AS list_score
    , count(wp_re_results_d.bg_id) as times_ranked
    FROM wp_re_results_d
    JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
    JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bg_id = wp_re_boardgames_update_temp.bg_id
    GROUP BY wp_re_results_d.bg_id
    ON DUPLICATE KEY UPDATE
    at_list_score = VALUES(at_list_score)
    , at_times_ranked = VALUES(at_times_ranked);
    
    -- Current Year - list score and times ranked
    INSERT INTO wp_re_boardgames_update_temp (bg_id, cy_list_score, cy_times_ranked)
    SELECT wp_re_results_d.bg_id
    , round(avg(((item_count-item_rank+1)/item_count)*100), 3) AS list_score
    , count(wp_re_results_d.bg_id) as times_ranked
    FROM wp_re_results_d
    JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
    JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bg_id = wp_re_boardgames_update_temp.bg_id
    WHERE year(finish_date) = year(now())
    GROUP BY wp_re_results_d.bg_id
    ON DUPLICATE KEY UPDATE
    cy_list_score = VALUES(cy_list_score)
    , cy_times_ranked = VALUES(cy_times_ranked);

    -- 30 Days - list score and times ranked
    INSERT INTO wp_re_boardgames_update_temp (bg_id, d30_list_score, d30_times_ranked)
    SELECT wp_re_results_d.bg_id
    , round(avg(((item_count-item_rank+1)/item_count)*100), 3) AS list_score
    , count(wp_re_results_d.bg_id) as times_ranked
    FROM wp_re_results_d
    JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
    JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bg_id = wp_re_boardgames_update_temp.bg_id
    WHERE (wp_re_results_h.finish_date) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
    GROUP BY wp_re_results_d.bg_id
    ON DUPLICATE KEY UPDATE
    d30_list_score = VALUES(d30_list_score)
    , d30_times_ranked = VALUES(d30_times_ranked);

      -- Update wp_re_boardgames
    UPDATE wp_re_boardgames
    JOIN wp_re_boardgames_update_temp ON wp_re_boardgames.bg_id = wp_re_boardgames_update_temp.bg_id
    set wp_re_boardgames.at_list_score = wp_re_boardgames_update_temp.at_list_score
    , wp_re_boardgames.at_times_ranked = wp_re_boardgames_update_temp.at_times_ranked
    , wp_re_boardgames.cy_list_score = wp_re_boardgames_update_temp.cy_list_score
    , wp_re_boardgames.cy_times_ranked = wp_re_boardgames_update_temp.cy_times_ranked
    , wp_re_boardgames.d30_list_score = wp_re_boardgames_update_temp.d30_list_score
    , wp_re_boardgames.d30_times_ranked = wp_re_boardgames_update_temp.d30_times_ranked;

    CALL update_maxcounts;

    -- Update popularity
    UPDATE wp_re_boardgames
    CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_maxcounts WHERE max_list_type = 'A') AS MaxList 
    SET at_pop_score = round((at_times_ranked)*20/MaxList.max_list_count, 3);

    UPDATE wp_re_boardgames
    CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_maxcounts WHERE max_list_type = 'Y') AS MaxList 
    SET cy_pop_score = round((cy_times_ranked)*20/MaxList.max_list_count, 3);

    UPDATE wp_re_boardgames
    CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_maxcounts WHERE max_list_type = 'D') AS MaxList 
    SET d30_pop_score = round((d30_times_ranked)*20/MaxList.max_list_count, 3);

      -- Calc and write back score trend
    UPDATE wp_re_boardgames
    JOIN wp_re_boardgames_score_temp ON wp_re_boardgames.bg_id = wp_re_boardgames_score_temp.bg_id
    SET wp_re_boardgames.at_score_trend = round(at_score_trend + ((at_list_score + at_pop_score) - prev_at_score), 5)
    , wp_re_boardgames.cy_score_trend = round(cy_score_trend + ((cy_list_score + cy_pop_score) - prev_cy_score), 5)
    , wp_re_boardgames.d30_score_trend = round(d30_score_trend + ((d30_list_score + d30_pop_score) - prev_d30_score), 5);
    
  -- delete row of old entry
    DELETE FROM wp_re_boardgames
    WHERE bg_id = olditemid;

    -- Drop temp table
    DROP TABLE wp_re_boardgames_update_temp;
    DROP TABLE wp_re_boardgames_score_temp;

    CALL update_boardgame_ranks_only;
    
    SELECT "IDs combined" AS message;

  ELSE
  
    SELECT "ID(s) do not exist" AS message;

  END IF;

END$$
DELIMITER ;