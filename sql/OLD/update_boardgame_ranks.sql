DELIMITER $$
CREATE DEFINER=`pubmeepl`@`localhost` PROCEDURE `update_boardgame_ranks`()
BEGIN 

    -- Before calculating new ranks set current ranks to 0
    UPDATE wp_re_boardgames
    SET at_rank = 0
    , cy_rank = 0
    , d30_rank = 0;

    -- Create temp table
    DROP TABLE IF EXISTS `wp_re_boardgames_rank_temp`;
    CREATE TABLE `wp_re_boardgames_rank_temp` 
    ( `bg_id` VARCHAR(11) NOT NULL 
    , `bg_rank` FLOAT NOT NULL ) 
    ENGINE = MyISAM CHARSET=utf8mb4 
    COLLATE utf8mb4_unicode_ci;

    -- Calc Ranks
    -- Calc AT ranks
    SET @rownum = 0;

    INSERT INTO wp_re_boardgames_rank_temp
    SELECT bg_id, @rownum := @rownum +1 AS bg_rank
    FROM wp_re_boardgames
    WHERE at_pop_score > 1
    AND bg_status = 'A'
    ORDER BY at_list_score + at_pop_score DESC;

    UPDATE wp_re_boardgames
    JOIN wp_re_boardgames_rank_temp ON wp_re_boardgames.bg_id = wp_re_boardgames_rank_temp.bg_id
    SET at_rank = wp_re_boardgames_rank_temp.bg_rank;

    -- Calc CY ranks
    TRUNCATE TABLE wp_re_boardgames_rank_temp;
    SET @rownum = 0;

    INSERT INTO wp_re_boardgames_rank_temp
    SELECT bg_id, @rownum := @rownum +1 AS bg_rank
    FROM wp_re_boardgames
    WHERE cy_pop_score > 1
    AND bg_status = 'A'
    ORDER BY cy_list_score + cy_pop_score DESC;

    UPDATE wp_re_boardgames
    JOIN wp_re_boardgames_rank_temp ON wp_re_boardgames.bg_id = wp_re_boardgames_rank_temp.bg_id
    SET cy_rank = wp_re_boardgames_rank_temp.bg_rank;

    -- Calc D30 ranks
    TRUNCATE TABLE wp_re_boardgames_rank_temp;

    SET @rownum = 0;

    INSERT INTO wp_re_boardgames_rank_temp
    SELECT bg_id, @rownum := @rownum +1 AS bg_rank
    FROM wp_re_boardgames
    WHERE d30_pop_score > 1    
    AND bg_status = 'A'
    ORDER BY d30_list_score + d30_pop_score DESC;

    UPDATE wp_re_boardgames
    JOIN wp_re_boardgames_rank_temp ON wp_re_boardgames.bg_id = wp_re_boardgames_rank_temp.bg_id
    SET d30_rank = wp_re_boardgames_rank_temp.bg_rank;

    DROP TABLE wp_re_boardgames_rank_temp;

END$$
DELIMITER ;