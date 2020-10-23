-- Put site into maintenace mode
-- Upload and activate v2.1.12

-- BACKUP

-- Take a backup of all Stored Procedures from live site - this is done - copied to backup database.

-- Take a backup of all tables that will be altered:
-- - wp_re_boardgames
-- - wp_re_boardgames_hist
-- - wp_re_boardgames_hist_periods
-- - wp_re_boardgames_scoring
DROP TABLE IF EXISTS pubmeepl_re_backup.wp_re_boardgames;
CREATE TABLE IF NOT EXISTS pubmeepl_re_backup.wp_re_boardgames LIKE wp_re_boardgames;
INSERT pubmeepl_re_backup.wp_re_boardgames
SELECT * FROM wp_re_boardgames;

DROP TABLE IF EXISTS pubmeepl_re_backup.wp_re_boardgames_hist;
CREATE TABLE IF NOT EXISTS pubmeepl_re_backup.wp_re_boardgames_hist LIKE wp_re_boardgames_hist;
INSERT pubmeepl_re_backup.wp_re_boardgames_hist
SELECT * FROM wp_re_boardgames_hist;

DROP TABLE IF EXISTS pubmeepl_re_backup.wp_re_boardgames_hist_periods;
CREATE TABLE IF NOT EXISTS pubmeepl_re_backup.wp_re_boardgames_hist_periods LIKE wp_re_boardgames_hist_periods;
INSERT pubmeepl_re_backup.wp_re_boardgames_hist_periods
SELECT * FROM wp_re_boardgames_hist_periods;

DROP TABLE IF EXISTS pubmeepl_re_backup.wp_re_boardgames_scoring;
CREATE TABLE IF NOT EXISTS pubmeepl_re_backup.wp_re_boardgames_scoring LIKE wp_re_boardgames_scoring;
INSERT pubmeepl_re_backup.wp_re_boardgames_scoring
SELECT * FROM wp_re_boardgames_scoring;

-- STORED PROCEDURES

-- Change the following stored procedures:
-- - activate_scoring_version
-- - calc_bg_scores_on_list_completion
-- - update_bg_history_month_alltime
-- - update_bg_history_year


-- Add the following stored procedures:
-- - calc_bg_list_info
-- - calc_bg_ranks
-- - calc_rank_score_v1
-- - calc_rank_score_v2
-- - calc_rank_score_v3


-- CHANGE/ADD TABLES

-- re_boardgames - add rank_score columns
ALTER TABLE `wp_re_boardgames` ADD `at_rank_score` FLOAT NOT NULL DEFAULT '0' AFTER `at_times_ranked`;
ALTER TABLE `wp_re_boardgames` ADD `cy_rank_score` FLOAT NOT NULL DEFAULT '0' AFTER `cy_times_ranked`;
ALTER TABLE `wp_re_boardgames` ADD `d30_rank_score` FLOAT NOT NULL DEFAULT '0' AFTER `d30_times_ranked`;

-- re_boardgames - drop unneeded columns
ALTER TABLE `wp_re_boardgames`  DROP `at_pop_score`, DROP `at_total_raw`, DROP `at_total_adjust`;
ALTER TABLE `wp_re_boardgames`  DROP `cy_pop_score`, DROP `cy_total_raw`, DROP `cy_total_adjust`;
ALTER TABLE `wp_re_boardgames`  DROP `d30_pop_score`, DROP `d30_total_raw`, DROP `d30_total_adjust`;

-- re_boardgames_hist - add rank_score
ALTER TABLE `wp_re_boardgames_hist` ADD `rank_score` FLOAT NOT NULL DEFAULT '0' AFTER `times_ranked`;

-- re_boardgames_hist - drop columns
ALTER TABLE `wp_re_boardgames_hist`  DROP `pop_score`, DROP `total_raw`, DROP `total_adjust`;

-- re_boardgames_hist_periods - change column name
ALTER TABLE `wp_re_boardgames_hist_periods` CHANGE `max_list_count` `max_times_ranked` INT(11) NULL DEFAULT NULL;

-- re_boardgames_hist_periods - add new columns
ALTER TABLE `wp_re_boardgames_hist_periods` ADD `avg_times_ranked` INT NOT NULL DEFAULT '0' AFTER `max_times_ranked`;
ALTER TABLE `wp_re_boardgames_hist_periods` ADD `avg_list_score` FLOAT NOT NULL DEFAULT '0' AFTER `avg_times_ranked`;

-- re_boardgames_list_info - create table
CREATE TABLE `pubmeepl_re`.`wp_re_boardgames_list_info` 
( `list_type` VARCHAR(1) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL 
, `max_times_ranked` INT(11) NOT NULL , `avg_times_ranked` FLOAT NOT NULL 
, `avg_list_score` FLOAT NOT NULL ) 
ENGINE = MyISAM CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO wp_re_boardgames_list_info (list_type, max_times_ranked)
SELECT max_list_type, max_list_count
FROM wp_re_boardgames_maxcounts;

-- re_board_games_list_info - update average columns
-- times ranked
UPDATE wp_re_boardgames_list_info
SET avg_times_ranked = 0;

UPDATE wp_re_boardgames_list_info
SET avg_times_ranked = (SELECT round(avg(at_times_ranked), 0) FROM wp_re_boardgames WHERE at_times_ranked > 0)
WHERE list_type = 'A';

UPDATE wp_re_boardgames_list_info
SET avg_times_ranked = (SELECT round(avg(cy_times_ranked), 0) FROM wp_re_boardgames WHERE cy_times_ranked > 0)
WHERE list_type = 'Y';

UPDATE wp_re_boardgames_list_info
SET avg_times_ranked = (SELECT round(avg(d30_times_ranked), 0) FROM wp_re_boardgames WHERE d30_times_ranked > 0)
WHERE list_type = 'D';

-- list score
UPDATE wp_re_boardgames_list_info
SET avg_list_score = 0;

UPDATE wp_re_boardgames_list_info
SET avg_list_score = (SELECT round(avg(at_list_score), 3) FROM wp_re_boardgames WHERE at_times_ranked > 0)
WHERE list_type = 'A';

UPDATE wp_re_boardgames_list_info
SET avg_list_score = (SELECT round(avg(cy_list_score), 3) FROM wp_re_boardgames WHERE cy_times_ranked > 0)
WHERE list_type = 'Y';

UPDATE wp_re_boardgames_list_info
SET avg_list_score = (SELECT round(avg(d30_list_score), 3) FROM wp_re_boardgames WHERE d30_times_ranked > 0)
WHERE list_type = 'D';

--re_boardgames_scoring - alter table
ALTER TABLE `wp_re_boardgames_scoring` ADD `rank_score_calc` VARCHAR(25) NULL DEFAULT NULL AFTER `list_score_calc`;
ALTER TABLE `wp_re_boardgames`  DROP `score_basis`, DROP `max_pop`;

-- Add scoring version to wp_re_boardgames_scoring
INSERT INTO wp_re_boardgames_scoring (version, list_score_calc, rank_score_calc)
SELECT 3, 'round(avg(CASE WHEN item_rank <= 100 THEN (100 - item_rank + 1) ELSE 0 END), 3', 'rank_score_calc_v3';

-- Change scoring - this will recalc wp_re_boardgames
CALL `pubmeepl_re`.`activate_scoring_version`(3);


-- truncate re_boardgames_hist to recalc
TRUNCATE TABLE wp_re_boardgames_hist;
TRUNCATE TABLE wp_re_boardgames_hist_periods;

-- OR just drop these tables, recalc locally and then copy the tables up.
-- recalc history - I can do this locally then import the tables into the live site


-- Don't forget to take site out of maintenance mode