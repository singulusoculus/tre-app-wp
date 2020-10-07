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
  WHERE at_times_ranked > 0
  ORDER BY at_ba_score DESC;');
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
  WHERE cy_times_ranked > 0
  ORDER BY cy_ba_score DESC;');
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
  WHERE d30_times_ranked > 0 
  ORDER BY d30_ba_score DESC;');
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