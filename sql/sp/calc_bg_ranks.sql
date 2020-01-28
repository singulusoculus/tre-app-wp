BEGIN 

  SET @t = concat("temp_",replace(uuid(), '-', ''));

  -- Before calculating new ranks set current ranks to 0
  UPDATE wp_re_boardgames
  SET at_rank = 0
  , cy_rank = 0
  , d30_rank = 0;

  -- Create temp table
  SET @s = CONCAT('  CREATE TABLE ', @t, '  
  ( `bgg_id` VARCHAR(11) NOT NULL 
  , `bg_rank` FLOAT NOT NULL ) 
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Calc Ranks
  -- Calc AT ranks
  SET @rownum = 0;

  SET @s = CONCAT('INSERT INTO ', @t, '
  SELECT bgg_id, @rownum := @rownum +1 AS bg_rank
  FROM wp_re_boardgames
  WHERE at_times_ranked > 150 -- a game must be ranked 150 time for it to be in the at rankings
  ORDER BY at_list_score + at_pop_score DESC;');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  SET @s = CONCAT('  UPDATE wp_re_boardgames
  JOIN ', @t, ' ON wp_re_boardgames.bgg_id = ', @t, '.bgg_id
  SET at_rank = ', @t, '.bg_rank;');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Calc CY ranks
  SET @s = CONCAT('TRUNCATE TABLE ', @t, ';');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  SET @rownum = 0;

  SET @s = CONCAT('INSERT INTO ', @t, '
  SELECT bgg_id, @rownum := @rownum +1 AS bg_rank
  FROM wp_re_boardgames
  WHERE cy_pop_score > 1 OR cy_times_ranked > 100 -- a game must have a pop score of  > 1 OR be ranked at least 100 time to be in the rankings
  ORDER BY cy_list_score + cy_pop_score DESC;');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  SET @s = CONCAT('UPDATE wp_re_boardgames
  JOIN ', @t, ' ON wp_re_boardgames.bgg_id = ', @t, '.bgg_id
  SET cy_rank = ', @t, '.bg_rank;');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  -- Calc D30 ranks
    SET @s = CONCAT('TRUNCATE TABLE ', @t, ';');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  SET @rownum = 0;

  SET @s = CONCAT('INSERT INTO ', @t, '
  SELECT bgg_id, @rownum := @rownum +1 AS bg_rank
  FROM wp_re_boardgames
  WHERE d30_pop_score > .7  
  ORDER BY d30_list_score + d30_pop_score DESC;');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  SET @s = CONCAT('UPDATE wp_re_boardgames
  JOIN ', @t, ' ON wp_re_boardgames.bgg_id = ', @t, '.bgg_id
  SET d30_rank = ', @t, '.bg_rank;');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

  SET @s = CONCAT('DROP TABLE ', @t, ';');
  PREPARE stmt1 FROM @s;
  EXECUTE stmt1;
  DEALLOCATE PREPARE stmt1;

END