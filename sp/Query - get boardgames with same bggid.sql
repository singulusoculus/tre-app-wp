SELECT bgg_id, count(bg_name) 
FROM `wp_re_boardgames` 
WHERE bgg_id > 0
GROUP BY bgg_id
HAVING count(bg_name) > 1
ORDER BY count(bg_name) DESC