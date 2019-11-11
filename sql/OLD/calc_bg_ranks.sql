BEGIN 

    -- Before calculating new ranks set current ranks to 0
    UPDATE wp_re_boardgames
    SET at_rank = 0
    , cy_rank = 0
    , d30_rank = 0;

    -- Create temp table
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
    FROM wp_re_boardgames
    WHERE at_times_ranked > 150 -- a game must be ranked 250 time for it to be in the at rankings
    ORDER BY at_list_score + at_pop_score DESC;

    UPDATE wp_re_boardgames
    JOIN wp_re_boardgames_rank_temp ON wp_re_boardgames.bgg_id = wp_re_boardgames_rank_temp.bgg_id
    SET at_rank = wp_re_boardgames_rank_temp.bg_rank;

    -- Calc CY ranks
    TRUNCATE TABLE wp_re_boardgames_rank_temp;
    SET @rownum = 0;

    INSERT INTO wp_re_boardgames_rank_temp
    SELECT bgg_id, @rownum := @rownum +1 AS bg_rank
    FROM wp_re_boardgames
    WHERE cy_pop_score > 1 OR cy_times_ranked > 100 -- a game must have a pop score of  > 1 OR be ranked at least 150 time to be in the rankings
    ORDER BY cy_list_score + cy_pop_score DESC;

    UPDATE wp_re_boardgames
    JOIN wp_re_boardgames_rank_temp ON wp_re_boardgames.bgg_id = wp_re_boardgames_rank_temp.bgg_id
    SET cy_rank = wp_re_boardgames_rank_temp.bg_rank;

    -- Calc D30 ranks
    TRUNCATE TABLE wp_re_boardgames_rank_temp;

    SET @rownum = 0;

    INSERT INTO wp_re_boardgames_rank_temp
    SELECT bgg_id, @rownum := @rownum +1 AS bg_rank
    FROM wp_re_boardgames
    WHERE d30_pop_score > .7  
    ORDER BY d30_list_score + d30_pop_score DESC;

    UPDATE wp_re_boardgames
    JOIN wp_re_boardgames_rank_temp ON wp_re_boardgames.bgg_id = wp_re_boardgames_rank_temp.bgg_id
    SET d30_rank = wp_re_boardgames_rank_temp.bg_rank;

    DROP TABLE wp_re_boardgames_rank_temp;

END