  -- Create a temp table - wp_re_boardgames_update_temp
  DROP TABLE IF EXISTS `wp_re_boardgames_update_temp`;
  CREATE TABLE `wp_re_boardgames_update_temp` 
  ( `id` INT(11) NOT NULL
  , `bgg_id` INT(11) NULL
  , `bg_name` VARCHAR(200) NOT NULL
  , `v1_list_score` FLOAT NULL 
  , `v1_times_ranked` INT NULL
  , `v1_pop_score` FLOAT NULL
  , `v1_rank` INT NULL
  , `v2_list_score` FLOAT NULL 
  , `v2_times_ranked` INT NULL
  , `v2_pop_score` FLOAT NULL
  , `v2_rank` INT NULL
  , `v3_list_score` FLOAT NULL 
  , `v3_times_ranked` INT NULL
  , `v3_pop_score` FLOAT NULL
  , `v3_rank` INT NULL
  , `bg_id` INT(11) NULL
  , PRIMARY KEY (`id`)
  , UNIQUE KEY (bgg_id))
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;

  -- Insert boardgames into temp table
  INSERT INTO wp_re_boardgames_update_temp (id, bg_name, bgg_id)
  SELECT bg_id, bg_name, bgg_id
  FROM wp_re_boardgames;

    -- V1 - top 100 get scores, the rest do not
    -- list score and times ranked
  INSERT INTO wp_re_boardgames_update_temp (bgg_id, v1_list_score, v1_times_ranked)
  SELECT wp_re_results_d.bgg_id
  -- , round(avg(CASE WHEN item_rank <= 100 THEN (100 - item_rank + 1) ELSE 0 END), 3) AS list_score
  , CASE WHEN item_rank <= 100 THEN round(avg((100 - item_rank + 1)), 3) END AS list_score
  , count(wp_re_results_d.bgg_id) as times_ranked
  FROM wp_re_results_d
  JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
  JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
  WHERE item_count > 10
  GROUP BY wp_re_results_d.bgg_id
    ON DUPLICATE KEY UPDATE
  v1_list_score = VALUES(v1_list_score)
  , v1_times_ranked = VALUES(v1_times_ranked);

    -- Update popularity
  UPDATE wp_re_boardgames_update_temp
  CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_maxcounts WHERE max_list_type = 'A') AS MaxList 
  SET v1_pop_score = round((v1_times_ranked)*20/MaxList.max_list_count, 3);


  DROP TABLE IF EXISTS `wp_re_boardgames_rank_temp`;
  CREATE TABLE `wp_re_boardgames_rank_temp` 
  ( `bgg_id` VARCHAR(11) NOT NULL 
  , `bg_rank` FLOAT NOT NULL ) 
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;

  -- Calc Ranks
  -- Calc AT ranks
  SET @rownum = 0;

  INSERT INTO wp_re_boardgames_rank_temp
  SELECT bgg_id, @rownum := @rownum +1 AS bg_rank
  FROM wp_re_boardgames_update_temp
  WHERE v1_times_ranked > 150 -- a game must be ranked 250 time for it to be in the at rankings
  ORDER BY v1_list_score + v1_pop_score DESC;

  UPDATE wp_re_boardgames_update_temp
  JOIN wp_re_boardgames_rank_temp ON wp_re_boardgames_update_temp.bgg_id = wp_re_boardgames_rank_temp.bgg_id
  SET v1_rank = wp_re_boardgames_rank_temp.bg_rank;


  -- V2 - Top 100 get scored and the rest get 0s
    INSERT INTO wp_re_boardgames_update_temp (bgg_id, v2_list_score, v2_times_ranked)
  SELECT wp_re_results_d.bgg_id
  , round(avg(CASE WHEN item_rank <= 100 THEN (100 - item_rank + 1) ELSE 0 END), 3) AS list_score
  -- , CASE WHEN item_rank <= 100 THEN round(avg((100 - item_rank + 1)), 3) END AS list_score
  , count(wp_re_results_d.bgg_id) as times_ranked
  FROM wp_re_results_d
  JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
  JOIN wp_re_boardgames_update_temp ON wp_re_results_d.bgg_id = wp_re_boardgames_update_temp.bgg_id
  WHERE item_count > 10
  GROUP BY wp_re_results_d.bgg_id
    ON DUPLICATE KEY UPDATE
  v2_list_score = VALUES(v2_list_score)
  , v2_times_ranked = VALUES(v2_times_ranked);


    -- Update popularity
  UPDATE wp_re_boardgames_update_temp
  CROSS JOIN (SELECT max_list_count FROM wp_re_boardgames_maxcounts WHERE max_list_type = 'A') AS MaxList 
  SET v2_pop_score = round((v2_times_ranked)*20/MaxList.max_list_count, 3);


  DROP TABLE IF EXISTS `wp_re_boardgames_rank_temp`;
  CREATE TABLE `wp_re_boardgames_rank_temp` 
  ( `bgg_id` VARCHAR(11) NOT NULL 
  , `bg_rank` FLOAT NOT NULL ) 
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;

  -- Calc Ranks
  -- Calc AT ranks
  SET @rownum = 0;

  INSERT INTO wp_re_boardgames_rank_temp
  SELECT bgg_id, @rownum := @rownum +1 AS bg_rank
  FROM wp_re_boardgames_update_temp
  WHERE v2_times_ranked > 150 -- a game must be ranked 250 time for it to be in the at rankings
  ORDER BY v2_list_score + v2_pop_score DESC;

  UPDATE wp_re_boardgames_update_temp
  JOIN wp_re_boardgames_rank_temp ON wp_re_boardgames_update_temp.bgg_id = wp_re_boardgames_rank_temp.bgg_id
  SET v2_rank = wp_re_boardgames_rank_temp.bg_rank;



  -- ---------------------------------------------------------------------------------------------


-- Compare
    SELECT t.bgg_id, t.bg_name
    , t.at_rank as trank, t.at_list_score as tlscore, t.at_pop_score as tpscore, round(t.at_list_score + t.at_pop_score, 3) as ttotal
    , b.at_rank, b.at_list_score, b.at_pop_score, round(b.at_list_score + b.at_pop_score, 3) as btotal
    , b.at_rank - t.at_rank as rank_change
    FROM `wp_re_boardgames_update_temp` as t
    JOIN wp_re_boardgames as b ON t.bgg_id = b.bgg_id
    WHERE t.at_rank IS NOT NULL
    ORDER BY trank ASC


    -- Using 150 - how many lists/items would be left out:
    SELECT count(result_id), sum(item_count-150)
    FROM `wp_re_results_h`
    WHERE list_category = 2
    AND item_count > 150

    -- excludes 2742 lists and 206,216 items

    SELECT count(result_id), sum(150 - item_count)
    FROM `wp_re_results_h`
    WHERE list_category = 2
    AND item_count > 10
    AND item_count < 150

    -- includes 16997 lists and 1,524,381 items


    SELECT bgg_id
    FROM `wp_re_results_h`
    JOIN wp_re_results_d ON wp_re_results_d.result_id = wp_re_results_h.result_id
    WHERE list_category = 2
    AND item_count > 100
    AND EXISTS (SELECT bgg_id
                    FROM `wp_re_results_h`
    				JOIN wp_re_results_d ON wp_re_results_d.result_id = wp_re_results_h.result_id
                    WHERE item_count > 10
                    AND item_count < 100
    )
    GROUP by bgg_id