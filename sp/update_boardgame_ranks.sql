BEGIN 

	-- SELECT date(max(lupd_datetime)), CURRENT_DATE() 
	-- INTO @lastUpdated, @currentDate
	-- FROM `re_boardgames`;
    
    -- IF @lastUpdated <> @currentDate  THEN

    -- Get previous ranks for rank move calc
    -- DROP TABLE IF EXISTS `re_boardgames_prerank_temp`;
    -- CREATE TABLE `rankingengine_wordpress`.`re_boardgames_prerank_temp` 
    -- (`bg_id` INT(11) NOT NULL
    -- , `prev_at_rank` FLOAT NOT NULL
    -- , `prev_cy_rank` FLOAT NOT NULL
    -- , `prev_d30_rank` FLOAT NOT NULL 
    -- , PRIMARY KEY (`bg_id`))
    -- ENGINE = MyISAM CHARSET=utf8mb4 
    -- COLLATE utf8mb4_unicode_ci;

    -- INSERT INTO re_boardgames_prerank_temp
    -- SELECT bg_id
    -- , at_rank
    -- , cy_rank
    -- , d30_rank
    -- FROM re_boardgames;

    -- Before calculating new ranks set current ranks to 0
    UPDATE re_boardgames
    SET at_rank = 0
    , cy_rank = 0
    , d30_rank = 0;

    -- Create temp table
    DROP TABLE IF EXISTS `re_boardgames_rank_temp`;
    CREATE TABLE `rankingengine_wordpress`.`re_boardgames_rank_temp` 
    ( `bg_id` VARCHAR(11) NOT NULL 
    , `bg_rank` FLOAT NOT NULL ) 
    ENGINE = MyISAM CHARSET=utf8mb4 
    COLLATE utf8mb4_unicode_ci;

    -- Calc Ranks
    -- Calc AT ranks
    SET @rownum = 0;

    INSERT INTO re_boardgames_rank_temp
    SELECT bg_id, @rownum := @rownum +1 AS bg_rank
    FROM re_boardgames
    WHERE at_pop_score > 1
    AND bg_status = 'A'
    ORDER BY at_list_score + at_pop_score DESC;

    UPDATE re_boardgames
    JOIN re_boardgames_rank_temp ON re_boardgames.bg_id = re_boardgames_rank_temp.bg_id
    SET at_rank = re_boardgames_rank_temp.bg_rank;

    -- Calc CY ranks
    TRUNCATE TABLE re_boardgames_rank_temp;
    SET @rownum = 0;

    INSERT INTO re_boardgames_rank_temp
    SELECT bg_id, @rownum := @rownum +1 AS bg_rank
    FROM re_boardgames
    WHERE cy_pop_score > 1
    AND bg_status = 'A'
    ORDER BY cy_list_score + cy_pop_score DESC;

    UPDATE re_boardgames
    JOIN re_boardgames_rank_temp ON re_boardgames.bg_id = re_boardgames_rank_temp.bg_id
    SET cy_rank = re_boardgames_rank_temp.bg_rank;

    -- Calc D30 ranks
    TRUNCATE TABLE re_boardgames_rank_temp;

    SET @rownum = 0;

    INSERT INTO re_boardgames_rank_temp
    SELECT bg_id, @rownum := @rownum +1 AS bg_rank
    FROM re_boardgames
    WHERE d30_pop_score > 1    
    AND bg_status = 'A'
    ORDER BY d30_list_score + d30_pop_score DESC;

    UPDATE re_boardgames
    JOIN re_boardgames_rank_temp ON re_boardgames.bg_id = re_boardgames_rank_temp.bg_id
    SET d30_rank = re_boardgames_rank_temp.bg_rank;

    DROP TABLE re_boardgames_rank_temp;

    -- Calc rank movement
    -- UPDATE re_boardgames
    -- JOIN re_boardgames_prerank_temp ON re_boardgames.bg_id = re_boardgames_prerank_temp.bg_id
    -- SET at_rank_change = prev_at_rank - at_rank
    -- , cy_rank_change = prev_cy_rank - cy_rank
    -- , d30_rank_change = prev_d30_rank - d30_rank;

    -- -- Set rank movement of items that were previously unranked to 0
    -- UPDATE re_boardgames
    -- JOIN re_boardgames_prerank_temp ON re_boardgames.bg_id = re_boardgames_prerank_temp.bg_id
    -- SET at_rank_change = 0
    -- WHERE re_boardgames_prerank_temp.prev_at_rank = 0;

    -- UPDATE re_boardgames
    -- JOIN re_boardgames_prerank_temp ON re_boardgames.bg_id = re_boardgames_prerank_temp.bg_id
    -- SET cy_rank_change = 0
    -- WHERE re_boardgames_prerank_temp.prev_cy_rank = 0;

    -- UPDATE re_boardgames
    -- JOIN re_boardgames_prerank_temp ON re_boardgames.bg_id = re_boardgames_prerank_temp.bg_id
    -- SET d30_rank_change = 0
    -- WHERE re_boardgames_prerank_temp.prev_d30_rank = 0;

    -- DROP TABLE re_boardgames_prerank_temp;
    
    -- SELECT "Updated Rankings and Changes" as message;
    
    -- ELSE 
    
    -- 	SELECT "Did not update" AS message;
    
    -- END IF;

END