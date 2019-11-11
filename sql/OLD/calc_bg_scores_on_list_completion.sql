BEGIN

  -- Take in final list id
  SET @FinalListID = listid;

  -- Create a temp table - wp_re_boardgames_update_temp
  DROP TABLE IF EXISTS `wp_re_boardgames_update_temp`;
  CREATE TABLE `wp_re_boardgames_update_temp` 
  ( `id` INT(11) NOT NULL
  , `bgg_id` INT(11) NULL
  , `bg_name` VARCHAR(200) NOT NULL
  , `times_ranked` INT NULL
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

  -- ALTER TABLE `wp_re_boardgames_update_temp` ADD UNIQUE(`bgg_id`);

  -- Insert final list into temp table
  INSERT INTO wp_re_boardgames_update_temp (id, bg_name, bgg_id)
  SELECT id
  , item_name
  , wp_re_results_d.bgg_id
  FROM wp_re_results_d
  WHERE wp_re_results_d.result_id = @FinalListID;

  -- Try to add bgg_id to items where the name matches
  UPDATE wp_re_boardgames_update_temp
  JOIN wp_re_boardgames ON wp_re_boardgames_update_temp.bg_name = wp_re_boardgames.bg_name
  SET wp_re_boardgames_update_temp.bgg_id = wp_re_boardgames.bgg_id
  WHERE wp_re_boardgames_update_temp.bgg_id IS NULL;

  -- apply bg_id
  UPDATE wp_re_boardgames_update_temp
  JOIN wp_re_boardgames ON wp_re_boardgames_update_temp.bgg_id = wp_re_boardgames.bgg_id
  SET wp_re_boardgames_update_temp.bg_id = wp_re_boardgames.bg_id;

  UPDATE wp_re_results_d
  JOIN wp_re_boardgames_update_temp ON wp_re_results_d.id = wp_re_boardgames_update_temp.id
  SET wp_re_results_d.bg_id = wp_re_boardgames_update_temp.bg_id;

  -- Get times ranked for list items
  UPDATE wp_re_boardgames_update_temp
  JOIN (  SELECT item_name
  , wp_re_boardgames_update_temp.bgg_id
  , count(wp_re_results_d.id) AS item_count
  FROM wp_re_results_d
  JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
  JOIN wp_re_results_h ON wp_re_results_d.result_id = wp_re_results_h.result_id
  WHERE wp_re_results_h.list_category = 2  
  AND item_count > 10
  GROUP BY wp_re_boardgames_update_temp.bgg_id) AS wp_re_results_d_count
  ON wp_re_boardgames_update_temp.bgg_id = wp_re_results_d_count.bgg_id
  SET wp_re_boardgames_update_temp.times_ranked = wp_re_results_d_count.item_count;

  -- Set Null items to 0
  UPDATE wp_re_boardgames_update_temp
  SET times_ranked = 0
  WHERE times_ranked IS NULL;

    -- Write back bgg_id to wp_re_results_d
  UPDATE wp_re_results_d
  JOIN wp_re_boardgames_update_temp ON wp_re_results_d.id = wp_re_boardgames_update_temp.id
  SET wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
  WHERE wp_re_results_d.bgg_id IS NULL;

  -- All time - list score and times ranked
  INSERT INTO wp_re_boardgames_update_temp (bgg_id, at_list_score, at_times_ranked)
  SELECT wp_re_results_d.bgg_id
  , round(avg(((item_count-item_rank+1)/item_count)*100), 3) AS list_score
  , count(wp_re_results_d.bgg_id) as times_ranked
  FROM wp_re_results_d
  JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
  JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
  WHERE item_count > 10
  GROUP BY wp_re_results_d.bgg_id
  ON DUPLICATE KEY UPDATE
  at_list_score = VALUES(at_list_score)
  , at_times_ranked = VALUES(at_times_ranked);
  
  -- Current Year - list score and times ranked
  INSERT INTO wp_re_boardgames_update_temp (bgg_id, cy_list_score, cy_times_ranked)
  SELECT wp_re_results_d.bgg_id
  , round(avg(((item_count-item_rank+1)/item_count)*100), 3) AS list_score
  , count(wp_re_results_d.bgg_id) as times_ranked
  FROM wp_re_results_d
  JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
  JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
  WHERE year(finish_date) = year(now())
  AND item_count > 10
  GROUP BY wp_re_results_d.bgg_id
  ON DUPLICATE KEY UPDATE
  cy_list_score = VALUES(cy_list_score)
  , cy_times_ranked = VALUES(cy_times_ranked);

  -- 30 Days - list score and times ranked
  INSERT INTO wp_re_boardgames_update_temp (bgg_id, d30_list_score, d30_times_ranked)
  SELECT wp_re_results_d.bgg_id
  , round(avg(((item_count-item_rank+1)/item_count)*100), 3) AS list_score
  , count(wp_re_results_d.bgg_id) as times_ranked
  FROM wp_re_results_d
  JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
  JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
  WHERE (wp_re_results_h.finish_date) >= DATE_SUB(NOW(), INTERVAL 30 DAY)
  AND item_count > 10
  GROUP BY wp_re_results_d.bgg_id
  ON DUPLICATE KEY UPDATE
  d30_list_score = VALUES(d30_list_score)
  , d30_times_ranked = VALUES(d30_times_ranked);

  -- Get previous scores for trend calc
  DROP TABLE IF EXISTS `wp_re_boardgames_score_temp`;
  CREATE TABLE `wp_re_boardgames_score_temp` 
  (`bgg_id` INT(11) NOT NULL
  , `prev_at_score` FLOAT NOT NULL
  , `prev_cy_score` FLOAT NOT NULL
  , `prev_d30_score` FLOAT NOT NULL 
  , PRIMARY KEY (`bgg_id`))
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;

  INSERT INTO wp_re_boardgames_score_temp (bgg_id, prev_at_score, prev_cy_score, prev_d30_score)
  SELECT bgg_id
  , at_list_score + at_pop_score AS prev_at_score
  , cy_list_score + cy_pop_score AS prev_cy_score
  , d30_list_score + d30_pop_score AS prev_d30_score
  FROM wp_re_boardgames;

  -- Update wp_re_boardgames
  UPDATE wp_re_boardgames
  JOIN wp_re_boardgames_update_temp ON wp_re_boardgames.bgg_id = wp_re_boardgames_update_temp.bgg_id
  SET wp_re_boardgames.at_list_score = wp_re_boardgames_update_temp.at_list_score
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
  JOIN wp_re_boardgames_score_temp ON wp_re_boardgames.bgg_id = wp_re_boardgames_score_temp.bgg_id
  SET wp_re_boardgames.at_score_trend = round(at_score_trend + ((at_list_score + at_pop_score) - prev_at_score), 5)
  , wp_re_boardgames.cy_score_trend = round(cy_score_trend + ((cy_list_score + cy_pop_score) - prev_cy_score), 5)
  , wp_re_boardgames.d30_score_trend = round(d30_score_trend + ((d30_list_score + d30_pop_score) - prev_d30_score), 5);
  
  -- Drop temp table
  DROP TABLE wp_re_boardgames_update_temp;
  DROP TABLE wp_re_boardgames_score_temp;

  CALL calc_bg_ranks;

END