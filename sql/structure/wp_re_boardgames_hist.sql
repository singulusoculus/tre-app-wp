CREATE TABLE `wp_re_boardgames_hist` (
 `id` int(11) NOT NULL AUTO_INCREMENT,
 `bg_id` int(11) NOT NULL,
 `bgg_id` int(11) NOT NULL,
 `bg_name` varchar(200) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
 `period` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
 `bg_rank` int(11) NOT NULL,
 `list_score` float NOT NULL,
 `pop_score` float NOT NULL,
 `total_score` float NOT NULL,
 `times_ranked` int(11) NOT NULL,
 `hist_type` varchar(6) NOT NULL,
 PRIMARY KEY (`id`)
) ENGINE=MyISAM AUTO_INCREMENT=0 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci