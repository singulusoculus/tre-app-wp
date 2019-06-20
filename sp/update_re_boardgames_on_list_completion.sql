BEGIN

  -- Take in final list id
  SET @FinalListID = listid;

  -- Clean and Fix item names and any Weird Spaces in list
  CALL fix_item_names_in_list(@FinalListID);

  -- Create a temp table - re_boardgames_update_temp
  DROP TABLE IF EXISTS `re_boardgames_update_temp`;
  CREATE TABLE `rankingengine_wordpress`.`re_boardgames_update_temp` 
  (`id` INT(11) NOT NULL
  , `bg_id` INT(11) 
  , `bg_name` VARCHAR(200) NOT NULL
  , `status` VARCHAR(1) NOT NULL
  , `times_ranked` INT NULL
  , `at_list_score` FLOAT NULL 
  , `at_times_ranked` INT NULL
  , `cy_list_score` FLOAT NULL 
  , `cy_times_ranked` INT NULL
  , `d30_list_score` FLOAT NULL 
  , `d30_times_ranked` INT NULL
  , `bgg_id` INT(11) NULL
  , PRIMARY KEY (`id`))
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;

  ALTER TABLE `re_boardgames_update_temp` ADD UNIQUE(`bg_id`);

  -- Insert final list into temp table
  INSERT INTO re_boardgames_update_temp (id, bg_id, bg_name, status, bgg_id)
  SELECT id
  , re_boardgames.bg_id
  , item_name
  , (CASE WHEN re_boardgames.bg_id IS NULL THEN 'P' ELSE 'A' END) AS status
  , re_results_d.bgg_id
  FROM re_results_d
  JOIN re_results_h on re_results_d.result_id = re_results_h.result_id
  LEFT JOIN re_boardgames ON item_name = re_boardgames.bg_name
  WHERE re_results_d.result_id = @FinalListID;

  -- Get times ranked for list items
  UPDATE re_boardgames_update_temp
  JOIN (SELECT item_name
  , count(item_name) AS item_name_count
  FROM re_results_d
  JOIN re_boardgames_update_temp ON item_name = re_boardgames_update_temp.bg_name
  JOIN re_results_h ON re_results_d.result_id = re_results_h.result_id
  WHERE re_results_h.list_category = 2  
  AND item_count > 10
  GROUP BY item_name) AS re_results_d_count
  ON re_boardgames_update_temp.bg_name = re_results_d_count.item_name
  SET re_boardgames_update_temp.times_ranked = re_results_d_count.item_name_count;

  UPDATE re_boardgames_update_temp
  JOIN (SELECT item_name
  , count(item_name) AS item_name_count
  FROM re_results_d
  JOIN re_boardgames_update_temp ON item_name = re_boardgames_update_temp.bg_name
  JOIN re_results_h ON re_results_d.result_id = re_results_h.result_id
  WHERE re_results_h.list_category = 2  AND
        (re_results_h.finish_date) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND item_count > 10
  GROUP BY item_name) AS re_results_d_count
  ON re_boardgames_update_temp.bg_name = re_results_d_count.item_name
  SET re_boardgames_update_temp.d30_times_ranked = re_results_d_count.item_name_count;

  -- Set items Status to A if they get a 1 popularity score based on the previous year or have been rated 25 times in the last 30 days

  UPDATE re_boardgames_update_temp
  CROSS JOIN re_boardgames_maxcounts_hist
  SET status = 'N'
  WHERE period_type = 'Y'
  AND period = year(now())-1 -- last year
  AND status = 'P'
  AND (times_ranked > (max_list_count*.1)) OR (d30_times_ranked > 25);

  -- delete items that are still pending - that haven't met the criteria yet
  DELETE FROM re_boardgames_update_temp
  WHERE status = 'P'

  -- INSERT ON DUPLICATE KEY UPDATE to re_boardgames - bg_id, bg_name, crtd_datetime, lupd_datetime
  INSERT INTO re_boardgames (bg_name, crtd_datetime, lupd_datetime, bg_status)
  SELECT bg_name
  , now() AS crtd_datetime
  , now() AS lupd_datetime
  , 'A' AS bg_status
  FROM re_boardgames_update_temp
  ON DUPLICATE KEY UPDATE
  lupd_datetime = now();

  -- Update any inserted games with their new bg_id
  UPDATE re_boardgames_update_temp
  LEFT JOIN re_boardgames ON re_boardgames_update_temp.bg_name = re_boardgames.bg_name
  SET re_boardgames_update_temp.bg_id = re_boardgames.bg_id;

    -- Write back bg_id to re_results_d
  UPDATE re_results_d
  JOIN re_boardgames_update_temp ON re_results_d.id = re_boardgames_update_temp.id
  SET re_results_d.bg_id = re_boardgames_update_temp.bg_id;

  -- Update re_results_d - applies bg_id to newly added games
  UPDATE re_results_d
  JOIN (SELECT bg_id, bg_name
  FROM re_boardgames_update_temp
  WHERE status = 'N') as NewGames
  ON item_name = NewGames.bg_name
  JOIN re_results_h ON re_results_d.result_id = re_results_h.result_id
  SET re_results_d.bg_id = NewGames.bg_id
  WHERE re_results_h.list_category = 2;

  -- All time - list score and times ranked
  INSERT INTO re_boardgames_update_temp (bg_id, at_list_score, at_times_ranked)
  SELECT re_results_d.bg_id
  , round(avg(((item_count-item_rank+1)/item_count)*100), 3) AS list_score
  , count(re_results_d.bg_id) as times_ranked
  FROM re_results_d
  JOIN re_results_h on re_results_d.result_id = re_results_h.result_id
  JOIN re_boardgames_update_temp ON re_results_d.bg_id = re_boardgames_update_temp.bg_id
  WHERE item_count > 10
  GROUP BY re_results_d.bg_id
  ON DUPLICATE KEY UPDATE
  at_list_score = VALUES(at_list_score)
  , at_times_ranked = VALUES(at_times_ranked);
  
  -- Current Year - list score and times ranked
  INSERT INTO re_boardgames_update_temp (bg_id, cy_list_score, cy_times_ranked)
  SELECT re_results_d.bg_id
  , round(avg(((item_count-item_rank+1)/item_count)*100), 3) AS list_score
  , count(re_results_d.bg_id) as times_ranked
  FROM re_results_d
  JOIN re_results_h on re_results_d.result_id = re_results_h.result_id
  JOIN re_boardgames_update_temp ON re_results_d.bg_id = re_boardgames_update_temp.bg_id
  WHERE year(finish_date) = year(now())
  AND item_count > 10
  GROUP BY re_results_d.bg_id
  ON DUPLICATE KEY UPDATE
  cy_list_score = VALUES(cy_list_score)
  , cy_times_ranked = VALUES(cy_times_ranked);

  -- 30 Days - list score and times ranked
  INSERT INTO re_boardgames_update_temp (bg_id, d30_list_score, d30_times_ranked)
  SELECT re_results_d.bg_id
  , round(avg(((item_count-item_rank+1)/item_count)*100), 3) AS list_score
  , count(re_results_d.bg_id) as times_ranked
  FROM re_results_d
  JOIN re_results_h on re_results_d.result_id = re_results_h.result_id
  JOIN re_boardgames_update_temp ON re_results_d.bg_id = re_boardgames_update_temp.bg_id
  WHERE (re_results_h.finish_date) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND item_count > 10
  GROUP BY re_results_d.bg_id
  ON DUPLICATE KEY UPDATE
  d30_list_score = VALUES(d30_list_score)
  , d30_times_ranked = VALUES(d30_times_ranked);

  -- Get previous scores for trend calc
  DROP TABLE IF EXISTS `re_boardgames_score_temp`;
  CREATE TABLE `rankingengine_wordpress`.`re_boardgames_score_temp` 
  (`bg_id` INT(11) NOT NULL
  , `prev_at_score` FLOAT NOT NULL
  , `prev_cy_score` FLOAT NOT NULL
  , `prev_d30_score` FLOAT NOT NULL 
  , PRIMARY KEY (`bg_id`))
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;

  INSERT INTO re_boardgames_score_temp (bg_id, prev_at_score, prev_cy_score, prev_d30_score)
  SELECT bg_id
  , at_list_score + at_pop_score AS prev_at_score
  , cy_list_score + cy_pop_score AS prev_cy_score
  , d30_list_score + d30_pop_score AS prev_d30_score
  FROM re_boardgames;

  -- Update re_boardgames
  UPDATE re_boardgames
  JOIN re_boardgames_update_temp ON re_boardgames.bg_id = re_boardgames_update_temp.bg_id
  set re_boardgames.at_list_score = re_boardgames_update_temp.at_list_score
  , re_boardgames.at_times_ranked = re_boardgames_update_temp.at_times_ranked
  , re_boardgames.cy_list_score = re_boardgames_update_temp.cy_list_score
  , re_boardgames.cy_times_ranked = re_boardgames_update_temp.cy_times_ranked
  , re_boardgames.d30_list_score = re_boardgames_update_temp.d30_list_score
  , re_boardgames.d30_times_ranked = re_boardgames_update_temp.d30_times_ranked;

  CALL update_maxcounts;

  -- Update popularity
  UPDATE re_boardgames
  CROSS JOIN (SELECT max_list_count FROM re_boardgames_maxcounts WHERE max_list_type = 'A') AS MaxList 
  SET at_pop_score = round((at_times_ranked)*20/MaxList.max_list_count, 3);

  UPDATE re_boardgames
  CROSS JOIN (SELECT max_list_count FROM re_boardgames_maxcounts WHERE max_list_type = 'Y') AS MaxList 
  SET cy_pop_score = round((cy_times_ranked)*20/MaxList.max_list_count, 3);

  UPDATE re_boardgames
  CROSS JOIN (SELECT max_list_count FROM re_boardgames_maxcounts WHERE max_list_type = 'D') AS MaxList 
  SET d30_pop_score = round((d30_times_ranked)*20/MaxList.max_list_count, 3);

  -- Calc and write back score trend
  UPDATE re_boardgames
  JOIN re_boardgames_score_temp ON re_boardgames.bg_id = re_boardgames_score_temp.bg_id
  SET re_boardgames.at_score_trend = round(at_score_trend + ((at_list_score + at_pop_score) - prev_at_score), 5)
  , re_boardgames.cy_score_trend = round(cy_score_trend + ((cy_list_score + cy_pop_score) - prev_cy_score), 5)
  , re_boardgames.d30_score_trend = round(d30_score_trend + ((d30_list_score + d30_pop_score) - prev_d30_score), 5);
  
    -- Capture BGGID
  UPDATE re_boardgames 
  JOIN re_boardgames_update_temp ON re_boardgames.bg_id = re_boardgames_update_temp.bg_id
  SET re_boardgames.bgg_id = re_boardgames_update_temp.bgg_id
  WHERE re_boardgames_update_temp.bgg_id IS NOT NULL AND re_boardgames.bgg_id = 0;
  
  -- Drop temp table
  DROP TABLE re_boardgames_update_temp;
  DROP TABLE re_boardgames_score_temp;

  CALL update_boardgame_ranks;

END