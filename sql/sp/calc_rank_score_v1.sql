BEGIN
    SET @t = concat("temp_",replace(uuid(), '-', ''));
    SET @sb = 1.20;
    SET @maxpop = 20;

    CALL calc_bg_list_info;

    -- Create Temp Table
    SET @s = CONCAT('CREATE TABLE ', @t, '  
    ( `bgg_id` INT(11) NULL
    , `at_list_score` FLOAT NULL 
    , `at_times_ranked` INT NULL
    , `at_pop_score` FLOAT NULL
    , `at_total` FLOAT NULL
    , `cy_list_score` FLOAT NULL 
    , `cy_times_ranked` INT NULL
    , `cy_pop_score` FLOAT NULL
    , `cy_total` FLOAT NULL
    , `d30_list_score` FLOAT NULL 
    , `d30_times_ranked` INT NULL
    , `d30_pop_score` FLOAT NULL
    , `d30_total` FLOAT NULL)
    ENGINE = MyISAM CHARSET=utf8mb4 
    COLLATE utf8mb4_unicode_ci;');
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Populate Temp Table
    SET @s = CONCAT(
    'INSERT INTO ', @t, ' (bgg_id, at_list_score, at_times_ranked, cy_list_score, cy_times_ranked, d30_list_score, d30_times_ranked)
    SELECT bgg_id
    , at_list_score
    , at_times_ranked
    , cy_list_score
    , cy_times_ranked
    , d30_list_score
    , d30_times_ranked
    FROM wp_re_boardgames
    WHERE at_times_ranked > 0;'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Calculate Popularity
    SET @s = CONCAT(
        'UPDATE ', @t, '
        CROSS JOIN (SELECT max_times_ranked FROM wp_re_boardgames_list_info WHERE list_type = "A") AS ListInfo 
        SET at_pop_score = round((at_times_ranked)*@maxpop/ListInfo.max_times_ranked, 3);'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    SET @s = CONCAT(
        'UPDATE ', @t, '
        CROSS JOIN (SELECT max_times_ranked FROM wp_re_boardgames_list_info WHERE list_type = "Y") AS ListInfo 
        SET cy_pop_score = round((cy_times_ranked)*@maxpop/ListInfo.max_times_ranked, 3);'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    SET @s = CONCAT(
        'UPDATE ', @t, '
        CROSS JOIN (SELECT max_times_ranked FROM wp_re_boardgames_list_info WHERE list_type = "D") AS ListInfo 
        SET d30_pop_score = round((d30_times_ranked)*@maxpop/ListInfo.max_times_ranked, 3);'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    SET @s = CONCAT(
        'UPDATE ', @t, '
        SET at_total = round((at_list_score + at_pop_score)/@sb, 3)
        , cy_total = round((cy_list_score + cy_pop_score)/@sb, 3)
        , d30_total = round((d30_list_score + d30_pop_score)/@sb, 3);'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Update wp_re_boardgames
    -- AT
    SET @s = CONCAT(
        'UPDATE wp_re_boardgames
        JOIN ', @t, ' ON wp_re_boardgames.bgg_id = ', @t, '.bgg_id
        SET at_rank_score = at_total
        WHERE wp_re_boardgames.at_times_ranked > 150; -- a game must be ranked 250 time for it to be in the at rankings'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- CY
    SET @s = CONCAT(
        'UPDATE wp_re_boardgames
        JOIN ', @t, ' ON wp_re_boardgames.bgg_id = ', @t, '.bgg_id
        SET cy_rank_score = cy_total
        WHERE ', @t, '.cy_pop_score > 1 OR wp_re_boardgames.cy_times_ranked > 100;'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- D30
    SET @s = CONCAT(
        'UPDATE wp_re_boardgames
        JOIN ', @t, ' ON wp_re_boardgames.bgg_id = ', @t, '.bgg_id
        SET d30_rank_score = d30_total
        WHERE ', @t, '.cy_pop_score > .7;'
    );
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

    -- Drop Table
    SET @s = CONCAT('DROP TABLE ', @t, ';');
    PREPARE stmt1 FROM @s;
    EXECUTE stmt1;
    DEALLOCATE PREPARE stmt1;

END