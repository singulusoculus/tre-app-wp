BEGIN

UPDATE wp_re_boardgames
CROSS JOIN wp_re_boardgames_list_info
SET at_ba_score = round(((at_times_ranked*at_list_score)+(avg_times_ranked*avg_list_score))/(at_times_ranked+avg_times_ranked), 3)
WHERE list_type = 'A' AND at_times_ranked > 0;

UPDATE wp_re_boardgames
CROSS JOIN wp_re_boardgames_list_info
SET cy_ba_score = round(((cy_times_ranked*cy_list_score)+(avg_times_ranked*avg_list_score))/(cy_times_ranked+avg_times_ranked), 3)
WHERE list_type = 'Y' AND cy_times_ranked > 0;

UPDATE wp_re_boardgames
CROSS JOIN wp_re_boardgames_list_info
SET d30_ba_score = round(((d30_times_ranked*d30_list_score)+(avg_times_ranked*avg_list_score))/(d30_times_ranked+avg_times_ranked), 3)
WHERE list_type = 'D' AND d30_times_ranked > 0;

END