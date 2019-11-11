-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Nov 07, 2019 at 06:24 PM
-- Server version: 10.1.40-MariaDB
-- PHP Version: 7.3.5

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `pubmeepl_re`
--

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_boardgames`
--

CREATE TABLE `wp_re_boardgames` (
  `bg_id` int(11) NOT NULL,
  `bgg_id` int(11) NOT NULL,
  `bg_name` varchar(200) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bg_type` varchar(11) CHARACTER SET utf8 COLLATE utf8_unicode_ci DEFAULT NULL,
  `at_list_score` float NOT NULL,
  `at_pop_score` float NOT NULL,
  `at_times_ranked` int(11) NOT NULL,
  `at_rank` int(11) NOT NULL,
  `at_rank_change` int(11) NOT NULL,
  `at_score_trend` float NOT NULL,
  `cy_list_score` float NOT NULL,
  `cy_pop_score` float NOT NULL,
  `cy_times_ranked` int(11) NOT NULL,
  `cy_rank` int(11) NOT NULL,
  `cy_rank_change` int(11) NOT NULL,
  `cy_score_trend` float NOT NULL,
  `d30_list_score` float NOT NULL,
  `d30_pop_score` float NOT NULL,
  `d30_times_ranked` int(11) NOT NULL,
  `d30_rank` int(11) NOT NULL,
  `d30_rank_change` int(11) NOT NULL,
  `d30_score_trend` float NOT NULL,
  `crtd_datetime` datetime NOT NULL,
  `lupd_datetime` datetime NOT NULL,
  `bgg_year_published` int(4) DEFAULT NULL,
  `image_url` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `image_original_url` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `min_players` int(11) DEFAULT NULL,
  `max_players` int(11) DEFAULT NULL,
  `playing_time` int(11) DEFAULT NULL,
  `min_age` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_boardgames_hist_maxcounts`
--

CREATE TABLE `wp_re_boardgames_hist_maxcounts` (
  `id` int(11) NOT NULL,
  `period_type` varchar(1) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `period` varchar(6) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `max_list_count` int(11) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_boardgames_hist_month`
--

CREATE TABLE `wp_re_boardgames_hist_month` (
  `id` int(11) NOT NULL,
  `bg_id` int(11) NOT NULL,
  `bgg_id` int(11) NOT NULL,
  `period` varchar(6) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bg_rank` int(11) NOT NULL,
  `list_score` float NOT NULL,
  `pop_score` float NOT NULL,
  `total_score` float NOT NULL,
  `times_ranked` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_boardgames_hist_year`
--

CREATE TABLE `wp_re_boardgames_hist_year` (
  `id` int(11) NOT NULL,
  `bg_id` int(11) NOT NULL,
  `bgg_id` int(11) NOT NULL,
  `period` varchar(4) COLLATE utf8mb4_unicode_ci NOT NULL,
  `bg_rank` int(11) NOT NULL,
  `list_score` float NOT NULL,
  `pop_score` float NOT NULL,
  `total_score` float NOT NULL,
  `times_ranked` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_boardgames_maxcounts`
--

CREATE TABLE `wp_re_boardgames_maxcounts` (
  `max_list_type` varchar(1) COLLATE utf8mb4_unicode_ci NOT NULL,
  `max_list_count` int(11) NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_list_templates`
--

CREATE TABLE `wp_re_list_templates` (
  `template_id` int(11) NOT NULL,
  `wpuid` int(11) NOT NULL,
  `template_uuid` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `template_desc` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_date` date NOT NULL,
  `updated_date` date DEFAULT NULL,
  `item_count` int(11) NOT NULL,
  `rank_count` int(11) NOT NULL,
  `list_category` int(11) NOT NULL,
  `template_data` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `re_version` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shared` int(1) NOT NULL DEFAULT '0',
  `ranked` int(1) NOT NULL DEFAULT '0',
  `results_public` int(1) NOT NULL DEFAULT '0'
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_rank_progress`
--

CREATE TABLE `wp_re_rank_progress` (
  `progress_id` int(11) NOT NULL,
  `wpuid` int(11) NOT NULL,
  `progress_uuid` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `parent_list_id` int(11) DEFAULT NULL,
  `progress_desc` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `created_date` date NOT NULL,
  `save_date` date NOT NULL,
  `percent_complete` int(11) NOT NULL,
  `item_count` int(11) NOT NULL,
  `list_category` int(11) NOT NULL,
  `progress_data` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `re_version` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_results_d`
--

CREATE TABLE `wp_re_results_d` (
  `id` int(11) NOT NULL,
  `result_id` int(11) NOT NULL,
  `bg_id` int(11) DEFAULT NULL,
  `item_name` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_rank` int(11) NOT NULL,
  `bgg_id` int(11) DEFAULT NULL,
  `bgg_year_published` int(4) DEFAULT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_results_h`
--

CREATE TABLE `wp_re_results_h` (
  `result_id` int(11) NOT NULL,
  `parent_list_id` int(11) DEFAULT NULL,
  `finish_date` date NOT NULL,
  `item_count` int(11) NOT NULL,
  `bgg_flag` int(11) NOT NULL,
  `list_category` int(11) NOT NULL,
  `re_version` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `wp_re_results_user`
--

CREATE TABLE `wp_re_results_user` (
  `result_id` int(11) NOT NULL,
  `wpuid` int(11) NOT NULL,
  `result_uuid` varchar(40) COLLATE utf8mb4_unicode_ci NOT NULL,
  `result_desc` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `finish_date` date NOT NULL,
  `item_count` int(11) NOT NULL,
  `template_id` int(11) NOT NULL,
  `list_category` int(11) NOT NULL,
  `result_data` mediumtext COLLATE utf8mb4_unicode_ci NOT NULL,
  `re_version` varchar(11) COLLATE utf8mb4_unicode_ci NOT NULL
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `wp_re_boardgames`
--
ALTER TABLE `wp_re_boardgames`
  ADD PRIMARY KEY (`bg_id`) USING BTREE,
  ADD UNIQUE KEY `bgg_id` (`bgg_id`);

--
-- Indexes for table `wp_re_boardgames_hist_maxcounts`
--
ALTER TABLE `wp_re_boardgames_hist_maxcounts`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wp_re_boardgames_hist_month`
--
ALTER TABLE `wp_re_boardgames_hist_month`
  ADD PRIMARY KEY (`id`),
  ADD KEY `bg_id` (`bg_id`);

--
-- Indexes for table `wp_re_boardgames_hist_year`
--
ALTER TABLE `wp_re_boardgames_hist_year`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `wp_re_boardgames_maxcounts`
--
ALTER TABLE `wp_re_boardgames_maxcounts`
  ADD PRIMARY KEY (`max_list_type`);

--
-- Indexes for table `wp_re_list_templates`
--
ALTER TABLE `wp_re_list_templates`
  ADD PRIMARY KEY (`template_id`),
  ADD KEY `template_uuid` (`template_uuid`);

--
-- Indexes for table `wp_re_rank_progress`
--
ALTER TABLE `wp_re_rank_progress`
  ADD PRIMARY KEY (`progress_id`);

--
-- Indexes for table `wp_re_results_d`
--
ALTER TABLE `wp_re_results_d`
  ADD PRIMARY KEY (`id`),
  ADD KEY `result_id` (`result_id`,`item_rank`),
  ADD KEY `bg_id` (`bg_id`) USING BTREE,
  ADD KEY `bgg_id` (`bgg_id`);

--
-- Indexes for table `wp_re_results_h`
--
ALTER TABLE `wp_re_results_h`
  ADD PRIMARY KEY (`result_id`);

--
-- Indexes for table `wp_re_results_user`
--
ALTER TABLE `wp_re_results_user`
  ADD PRIMARY KEY (`result_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `wp_re_boardgames`
--
ALTER TABLE `wp_re_boardgames`
  MODIFY `bg_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wp_re_boardgames_hist_maxcounts`
--
ALTER TABLE `wp_re_boardgames_hist_maxcounts`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wp_re_boardgames_hist_month`
--
ALTER TABLE `wp_re_boardgames_hist_month`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wp_re_boardgames_hist_year`
--
ALTER TABLE `wp_re_boardgames_hist_year`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wp_re_list_templates`
--
ALTER TABLE `wp_re_list_templates`
  MODIFY `template_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wp_re_rank_progress`
--
ALTER TABLE `wp_re_rank_progress`
  MODIFY `progress_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wp_re_results_d`
--
ALTER TABLE `wp_re_results_d`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wp_re_results_h`
--
ALTER TABLE `wp_re_results_h`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `wp_re_results_user`
--
ALTER TABLE `wp_re_results_user`
  MODIFY `result_id` int(11) NOT NULL AUTO_INCREMENT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
