BEGIN 

  -- Take in final list id
  SET @FinalListID = listid;
  SET @t = concat("temp_",replace(uuid(), '-', ''));

    SELECT score_basis, max_pop, list_score_calc
    INTO @sb, @maxpop, @list_score_calc
    FROM wp_re_boardgames_scoring
    WHERE status = 'A';

  -- Create a temp table
  SET @s = CONCAT('CREATE TABLE ', @t, ' 
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
  , `result_id` INT(11) NULL
  , `crtd_datetime` datetime NULL
  , PRIMARY KEY (`id`))
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;');

  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Insert final list into temp table
  SET @s = CONCAT(
  'INSERT INTO ', @t, ' (id, bg_name, bgg_id, result_id, crtd_datetime)
  SELECT id
  , item_name
  , wp_re_results_d.bgg_id
  , @FinalListID
  , now()
  FROM wp_re_results_d
  WHERE wp_re_results_d.result_id = @FinalListID;'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Delete items that have the same bg_name where one has a bggid and the other does not
  SET @s = CONCAT('DELETE ', @t ,'
  FROM ', @t ,'
  JOIN (
    SELECT id
    FROM ', @t ,'
    WHERE bg_name IN (
      SELECT bg_name
      FROM ', @t ,'
      GROUP BY bg_name
      HAVING count(bg_name) > 1)
      AND bgg_id is null) as dup ON dup.id = ', @t ,'.id'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Try to add bgg_id to items where the name matches
  SET @s = CONCAT(
  'UPDATE ', @t, '
  JOIN wp_re_boardgames ON ', @t, '.bg_name = wp_re_boardgames.bg_name
  SET ', @t, '.bgg_id = wp_re_boardgames.bgg_id
  WHERE ', @t, '.bgg_id IS NULL OR ', @t , '.bgg_id = 0;'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- apply bg_id and bgg_id
  SET @s = CONCAT(
  'UPDATE ', @t, '
  JOIN wp_re_boardgames ON ', @t, '.bgg_id = wp_re_boardgames.bgg_id
  SET ', @t, '.bg_id = wp_re_boardgames.bg_id;'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  SET @s = CONCAT(
  'UPDATE wp_re_results_d
  JOIN ', @t, ' ON wp_re_results_d.id = ', @t, '.id
  SET wp_re_results_d.bg_id = ', @t, '.bg_id
  , wp_re_results_d.bgg_id = ', @t, '.bgg_id;'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Delete items with NULL or 0 for bgg_id
  SET @s = CONCAT(
  'DELETE FROM ', @t, '
  WHERE bgg_id IS NULL OR bgg_id = 0;'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Get times ranked for list items
  SET @s = CONCAT(
  'UPDATE ', @t, '
  JOIN (  SELECT item_name
  , ', @t, '.bgg_id
  , count(wp_re_results_d.id) AS item_count
  FROM wp_re_results_d
  JOIN ', @t, ' ON wp_re_results_d.bgg_id = ', @t, '.bgg_id
  JOIN wp_re_results_h ON wp_re_results_d.result_id = wp_re_results_h.result_id
  WHERE wp_re_results_h.list_category = 2  
  AND item_count > 10
  GROUP BY ', @t, '.bgg_id) AS wp_re_results_d_count
  ON ', @t, '.bgg_id = wp_re_results_d_count.bgg_id
  SET ', @t, '.times_ranked = wp_re_results_d_count.item_count;'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Set Null items to 0
  SET @s = CONCAT(
  'UPDATE ', @t, '
  SET times_ranked = 0
  WHERE times_ranked IS NULL;'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- make bgg_id unique
  SET @s = CONCAT(
    'ALTER TABLE ', @t, ' ADD UNIQUE(`bgg_id`);'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;


  -- All time - list score and times ranked
  SET @s = CONCAT(
  'INSERT INTO ', @t, ' (bgg_id, at_list_score, at_times_ranked)
  SELECT wp_re_results_d.bgg_id
  ,', @list_score_calc ,' as list_score
  , count(wp_re_results_d.bgg_id) as times_ranked
  FROM wp_re_results_d
  JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
  JOIN ', @t, ' ON wp_re_results_d.bgg_id = ', @t, '.bgg_id
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
  'INSERT INTO ', @t, ' (bgg_id, cy_list_score, cy_times_ranked)
  SELECT wp_re_results_d.bgg_id
  ,', @list_score_calc ,' as list_score
  , count(wp_re_results_d.bgg_id) as times_ranked
  FROM wp_re_results_d
  JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
  JOIN ', @t, ' ON wp_re_results_d.bgg_id = ', @t, '.bgg_id
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
  'INSERT INTO ', @t, ' (bgg_id, d30_list_score, d30_times_ranked)
  SELECT wp_re_results_d.bgg_id
  ,', @list_score_calc ,' as list_score
  , count(wp_re_results_d.bgg_id) as times_ranked
  FROM wp_re_results_d
  JOIN wp_re_results_h on wp_re_results_d.result_id = wp_re_results_h.result_id
  JOIN ', @t, ' ON wp_re_results_d.bgg_id = ', @t, '.bgg_id
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
  SET @s = CONCAT(
  'UPDATE wp_re_boardgames
  JOIN ', @t, ' ON wp_re_boardgames.bgg_id = ', @t, '.bgg_id
  SET wp_re_boardgames.at_list_score = ', @t, '.at_list_score
  , wp_re_boardgames.at_times_ranked = ', @t, '.at_times_ranked
  , wp_re_boardgames.cy_list_score = ', @t, '.cy_list_score
  , wp_re_boardgames.cy_times_ranked = ', @t, '.cy_times_ranked
  , wp_re_boardgames.d30_list_score = ', @t, '.d30_list_score
  , wp_re_boardgames.d30_times_ranked = ', @t, '.d30_times_ranked
  , wp_re_boardgames.lupd_datetime = now();'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

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
  SET @s = CONCAT(
  'DROP TABLE ', @t, ';'
  );
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Update raw and adjust columns
    UPDATE wp_re_boardgames
    SET at_total_raw = round(at_list_score + at_pop_score, 3),
    at_total_adjust = round((at_list_score + at_pop_score)/@sb, 3),
    cy_total_raw = round(cy_list_score + cy_pop_score, 3),
    cy_total_adjust = round((cy_list_score + cy_pop_score)/@sb, 3),
    d30_total_raw = round(d30_list_score + d30_pop_score, 3),
    d30_total_adjust = round((d30_list_score + d30_pop_score)/@sb, 3);

  CALL calc_bg_ranks;

END