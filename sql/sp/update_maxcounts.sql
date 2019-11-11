BEGIN
SELECT max(at_times_ranked) INTO @maxlistcountall
FROM wp_re_boardgames;

UPDATE wp_re_boardgames_maxcounts
SET max_list_count = @maxlistcountall
WHERE max_list_type = "A";

SELECT max(cy_times_ranked) INTO @maxlistcountyear
FROM wp_re_boardgames;

UPDATE wp_re_boardgames_maxcounts
SET max_list_count = @maxlistcountyear
WHERE max_list_type = "Y";

SELECT max(d30_times_ranked) INTO @maxlistcountdays
FROM wp_re_boardgames;

UPDATE wp_re_boardgames_maxcounts
SET max_list_count = @maxlistcountdays
WHERE max_list_type = "D";

END