BEGIN
SET @game = game;
SET @rownum = 0;
SET @rank = 1;
TRUNCATE TABLE re_suggestions_lists_temp;
TRUNCATE TABLE re_suggestions;
WHILE (@rank < 11) DO
    INSERT INTO re_suggestions_lists_temp (id, list_id)
	SELECT @rownum := @rownum+1 AS id, list_id
	FROM(
    SELECT re_final_d.list_id
    FROM re_final_d
	JOIN re_final_h on re_final_d.list_id = re_final_h.list_id
    WHERE CASE WHEN re_final_d.item_name_fixed is null then re_final_d.item_name else re_final_d.item_name_fixed END = @game
    AND item_rank = @rank
	AND bgg_flag <> 2
	GROUP BY re_final_d.list_id) AS lists;
    SET @rank = @rank+1;
END WHILE;
SET @id = 1;
SELECT max(id) INTO @maxid
FROM re_suggestions_lists_temp;
WHILE (@id <= @maxid) DO
    INSERT INTO re_suggestions (item_name, item_rank)
    SELECT item_name, item_rank
    FROM re_final_d
    JOIN re_suggestions_lists_temp on re_final_d.list_id = re_suggestions_lists_temp.list_id
    WHERE re_suggestions_lists_temp.id = @id
    ORDER BY item_rank ASC
    LIMIT 5;
SET @id = @id+1;
END WHILE;
SELECT re_suggestions.item_name
, count(re_suggestions.item_name) as num
, avg(re_suggestions.item_rank) AS avgrank
, count(re_suggestions.item_name) - avg(re_suggestions.item_rank) AS suggtotal
, total_rank
FROM re_suggestions
RIGHT JOIN re_rank_bg on re_suggestions.item_name = re_rank_bg.item_name
WHERE re_suggestions.item_name <> @game
AND re_rank_bg.rank_type = "all"
GROUP BY re_suggestions.item_name
ORDER BY total_rank DESC;
END