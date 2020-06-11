
-- Get result lists with the most matching items as possible
SET @result = 36616;

DROP TABLE IF EXISTS `pubmeepl_re`.`suggest_master_results`;
CREATE TABLE `pubmeepl_re`.`suggest_master_results` 
( `id` INT NOT NULL AUTO_INCREMENT
, `result_id` INT NOT NULL  
, `bgg_id` INT NOT NULL 
, `item_rank` INT NOT NULL
, `item_count` INT NOT NULL
, PRIMARY KEY (`id`)
) ENGINE = MyISAM;

INSERT INTO suggest_master_results (result_id, bgg_id, item_rank, item_count)
SELECT d.result_id, d.bgg_id, d.item_rank, h.item_count
FROM wp_re_results_d d
JOIN wp_re_results_h h ON d.result_id = h.result_id
WHERE d.result_id = @result
AND d.bgg_id <> 0;

DROP TABLE IF EXISTS `pubmeepl_re`.`suggest_ref_results`;
CREATE TABLE `pubmeepl_re`.`suggest_ref_results` 
( `id` INT NOT NULL AUTO_INCREMENT
,  `result_id` INT NOT NULL 
, `item_count` INT NOT NULL 
, `bgg_id` INT NOT NULL 
, `item_rank` INT NOT NULL
, `rank_diff` INT DEFAULT 0
, PRIMARY KEY (`id`)
) ENGINE = MyISAM;

INSERT INTO `pubmeepl_re`.`suggest_ref_results` (result_id, item_count, bgg_id, item_rank)
SELECT h.result_id, h.item_count, d.bgg_id, d.item_rank
FROM wp_re_results_d d
JOIN wp_re_results_h h ON d.result_id = h.result_id
WHERE d.bgg_id IN (SELECT bgg_id FROM suggest_master_results)
AND h.result_id IN (
    SELECT distinct d.result_id
    FROM wp_re_results_d d
    JOIN wp_re_results_h h ON d.result_id = h.result_id
    WHERE bgg_id IN (SELECT bgg_id FROM suggest_master_results)
    AND item_count > 20
    AND list_category = 2
    AND bgg_id <> 0
    AND d.result_id <> @result
    GROUP BY d.result_id, item_count
    HAVING count(d.bgg_id) > 30
);

-- ALTER TABLE `pubmeepl_re`.`suggest_results` ADD INDEX `result-bgg_id` (`id`, `result_id`);

DROP TABLE IF EXISTS `pubmeepl_re`.`suggest_diff_results`;
CREATE TABLE `pubmeepl_re`.`suggest_diff_results` 
( `id` INT NOT NULL AUTO_INCREMENT
, `result_id` INT NOT NULL  
, `rank_diff` FLOAT NOT NULL
, PRIMARY KEY (`id`)
) ENGINE = MyISAM;

-- Calculate the relative difference between ranks (depending on list sizes)
INSERT INTO suggest_diff_results (result_id, rank_diff)
SELECT result_id, avg(rank_diff) as rank_diff
FROM (SELECT s.result_id, m.bgg_id
    , abs(((m.item_count - m.item_rank +1) / m.item_count) * 100 - ((s.item_count - s.item_rank +1) / s.item_count) * 100) as rank_diff
    FROM suggest_master_results m
    JOIN suggest_ref_results s ON m.bgg_id = s.bgg_id) as diff
GROUP BY result_id
HAVING rank_diff < 30
ORDER BY rank_diff ASC;

SELECT d.bgg_id, bg_name, round(count(d.bgg_id)/avg(s.rank_diff), 5) as score, count(d.bgg_id) as coungbggid, avg(s.rank_diff) as avgrankdiff, avg(item_rank) as avgitemrank, round(count(d.bgg_id)/avg(item_rank), 5) as score2
FROM wp_re_results_d d
JOIN suggest_diff_results s ON d.result_id = s.result_id
JOIN wp_re_boardgames b ON d.bgg_id = b.bgg_id
WHERE d.result_id IN (SELECT result_id FROM suggest_diff_results)
AND d.bgg_id NOT IN (SELECT bgg_id FROM suggest_master_results)
AND d.bgg_id <> 0
and item_rank <= 10
GROUP BY d.bgg_id
ORDER BY score2 DESC
LIMIT 200;

SELECT d.bgg_id, bg_name, round(count(d.bgg_id)/avg(s.rank_diff), 5) as score, count(d.bgg_id) as coungbggid, avg(s.rank_diff) as avgrankdiff, avg(item_rank) as avgitemrank, round(count(d.bgg_id)/avg(item_rank)/avg(s.rank_diff), 5) as score2
FROM wp_re_results_d d
JOIN suggest_diff_results s ON d.result_id = s.result_id
JOIN wp_re_boardgames b ON d.bgg_id = b.bgg_id
WHERE d.result_id IN (SELECT result_id FROM suggest_diff_results)
AND d.bgg_id NOT IN (SELECT bgg_id FROM suggest_master_results)
AND d.bgg_id <> 0
and item_rank <= 10
GROUP BY d.bgg_id
ORDER BY score2 DESC
LIMIT 200;







-- ----------------------------------------------------------------------------------


SET @result = 36616;

DROP TABLE IF EXISTS `pubmeepl_re`.`suggest_results` 
CREATE TABLE `pubmeepl_re`.`suggest_results` 
( `result_id` INT NOT NULL 
, `item_count` INT NOT NULL 
, `bgg_id` INT NOT NULL 
, `item_rank` INT NOT NULL 
, PRIMARY KEY (`result_id`)
) ENGINE = MyISAM;

INSERT INTO `pubmeepl_re`.`suggest_results` (result_id, item_count, bgg_id, item_rank)
SELECT h.result_id, h.item_count, d.bgg_id, d.item_rank
FROM wp_re_results_d d
JOIN wp_re_results_h h ON d.result_id = h.result_id
WHERE d.bgg_id IN (SELECT bgg_id FROM wp_re_results_d WHERE result_id = @result)
AND h.result_id IN (
    SELECT d.result_id, count(d.bgg_id) as bggidcount, h.item_count
    FROM wp_re_results_d d
    JOIN wp_re_results_h h ON d.result_id = h.result_id
    WHERE bgg_id IN (SELECT bgg_id FROM wp_re_results_d WHERE result_id = @result)
    AND item_count > 20
    AND list_category = 2
    AND bgg_id <> 0
    AND d.result_id <> @result
    GROUP BY d.result_id, item_count
    ORDER BY bggidcount DESC
    LIMIT 100
)

CREATE TABLE `pubmeepl_re`. ( `id` INT NOT NULL AUTO_INCREMENT , PRIMARY KEY (`id`)) ENGINE = MyISAM;


SELECT d.result_id, count(d.bgg_id) as bggidcount, h.item_count
FROM wp_re_results_d d
JOIN wp_re_results_h h ON d.result_id = h.result_id
WHERE bgg_id IN (SELECT bgg_id FROM wp_re_results_d WHERE result_id = @result)
AND item_count > 20
AND list_category = 2
AND bgg_id <> 0
AND d.result_id <> @result
GROUP BY d.result_id, item_count
ORDER BY bggidcount DESC
LIMIT 100;













-- -------------------------------------------------------------------------------------

SET @bgg_id = 237182;

SELECT count(bgg_id)
FROM wp_re_results_d
WHERE bgg_id = @bgg_id;

SELECT distinct d.result_id
FROM wp_re_results_d d
JOIN wp_re_results_h h ON d.result_id = h.result_id
WHERE bgg_id = @bgg_id
AND item_rank < 4
AND item_count > 10;

SELECT d.result_id, avg(case when d.item_rank - m.item_rank < 0 then (d.item_rank - m.item_rank)*-1 ELSE d.item_rank - m.item_rank END) as rank_diff
FROM wp_re_results_d d
JOIN (SELECT bgg_id, item_rank
FROM wp_re_results_d
WHERE result_id = @result) as m
ON d.bgg_id = m.bgg_id
WHERE d.result_id <> @result
GROUP BY result_id
HAVING rank_diff <> 0
ORDER BY rank_diff ASC;



SELECT d.result_id, count(d.bgg_id), h.item_count
FROM wp_re_results_d d
JOIN wp_re_results_h h ON d.result_id = h.result_id
GROUP BY d.result_id, item_count


SET @result = 36638;

SELECT d.result_id, count(d.bgg_id), h.item_count, count(d.bgg_id) / h.item_count as match_pct
FROM wp_re_results_d d
JOIN wp_re_results_h h ON d.result_id = h.result_id
WHERE bgg_id IN (SELECT bgg_id FROM wp_re_results_d WHERE result_id = @result)
AND item_count > 10
GROUP BY d.result_id, item_count
ORDER BY match_pct DESC

SET @result = 36638;

SELECT item_count INTO @m_count 
FROM wp_re_results_h 
WHERE result_id = @result;

SELECT d.result_id, count(d.bgg_id) as bggidcount, h.item_count, count(d.bgg_id) / h.item_count as match_pct, count(d.bgg_id) / @m_count AS master_match
FROM wp_re_results_d d
JOIN wp_re_results_h h ON d.result_id = h.result_id
WHERE bgg_id IN (SELECT bgg_id FROM wp_re_results_d WHERE result_id = @result)
AND item_count > 20
AND list_category = 2
GROUP BY d.result_id, item_count
ORDER BY master_match DESC
LIMIT 100;