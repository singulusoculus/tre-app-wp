BEGIN
-- Max Times Ranked
SELECT max(at_times_ranked) INTO @maxlistcountall
FROM wp_re_boardgames;

UPDATE wp_re_boardgames_list_info
SET max_times_ranked = @maxlistcountall
WHERE list_type = "A";

SELECT max(cy_times_ranked) INTO @maxlistcountyear
FROM wp_re_boardgames;

UPDATE wp_re_boardgames_list_info
SET max_times_ranked = @maxlistcountyear
WHERE list_type = "Y";

SELECT max(d30_times_ranked) INTO @maxlistcountdays
FROM wp_re_boardgames;

UPDATE wp_re_boardgames_list_info
SET max_times_ranked = @maxlistcountdays
WHERE list_type = "D";

-- Average Times Ranked
UPDATE wp_re_boardgames_list_info
SET avg_times_ranked = (SELECT round(avg(at_times_ranked), 0) FROM wp_re_boardgames WHERE at_times_ranked > 0)
WHERE list_type = 'A';

UPDATE wp_re_boardgames_list_info
SET avg_times_ranked = (SELECT round(avg(cy_times_ranked), 0) FROM wp_re_boardgames WHERE cy_times_ranked > 0)
WHERE list_type = 'Y';

UPDATE wp_re_boardgames_list_info
SET avg_times_ranked = (SELECT round(avg(d30_times_ranked), 0) FROM wp_re_boardgames WHERE d30_times_ranked > 0)
WHERE list_type = 'D';


-- Average List Score
UPDATE wp_re_boardgames_list_info
SET avg_list_score = (SELECT round(avg(at_list_score), 3) FROM wp_re_boardgames WHERE at_times_ranked > 0)
WHERE list_type = 'A';

UPDATE wp_re_boardgames_list_info
SET avg_list_score = (SELECT round(avg(cy_list_score), 3) FROM wp_re_boardgames WHERE cy_times_ranked > 0)
WHERE list_type = 'Y';

UPDATE wp_re_boardgames_list_info
SET avg_list_score = (SELECT round(avg(d30_list_score), 3) FROM wp_re_boardgames WHERE d30_times_ranked > 0)
WHERE list_type = 'D';

END