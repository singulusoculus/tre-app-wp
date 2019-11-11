DELIMITER $$
CREATE DEFINER=`pubmeepl`@`localhost` PROCEDURE `fix_item_names_in_list`(IN `listid` INT)
BEGIN

  -- Fix Weird Space on new lists
  DROP TABLE IF EXISTS `wp_re_namefix_temp`;
  CREATE TABLE `wp_re_namefix_temp` 
  ( `id` INT NOT NULL 
  , `item_name` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL 
  , `new_item_name` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL ) 
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;

  INSERT INTO wp_re_namefix_temp (id, item_name, new_item_name)
  SELECT wp_re_results_d.id, item_name, substring(item_name, 1, char_length(item_name)-1) as new_item_name
  FROM `wp_re_results_d`
  JOIN wp_re_results_h ON wp_re_results_d.result_id = wp_re_results_h.result_id
  WHERE list_category = 2
  AND wp_re_results_d.result_id = listid
  AND substring(item_name, length(item_name)-1, 1) = " "
  AND char_length(item_name)+1 = length(item_name)
  AND trim(replace(item_name, " ", "")) like '% %';

  UPDATE wp_re_results_d
  JOIN wp_re_namefix_temp ON wp_re_results_d.id = wp_re_namefix_temp.id
  SET wp_re_results_d.item_name = wp_re_namefix_temp.new_item_name;

  DROP TABLE wp_re_namefix_temp;

-- Add item_name_fixed
  DROP TABLE IF EXISTS `wp_re_results_d_temp`;
  CREATE TABLE `wp_re_results_d_temp` 
  ( `id` INT NOT NULL , `item_name` TEXT NOT NULL ) 
  ENGINE = MyISAM
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  INSERT INTO wp_re_results_d_temp (id, item_name)
  SELECT wp_re_results_d.id, wp_re_results_d.item_name
  FROM wp_re_results_d 
  WHERE result_id = listid;

  UPDATE wp_re_results_d_temp
  LEFT OUTER JOIN wp_re_item_name_fixes on wp_re_results_d_temp.item_name = wp_re_item_name_fixes.find_item_name
  SET wp_re_results_d_temp.item_name = wp_re_item_name_fixes.replace_item_name
  WHERE wp_re_item_name_fixes.find_item_name is not null;

  UPDATE wp_re_results_d
  JOIN wp_re_results_d_temp on wp_re_results_d.id = wp_re_results_d_temp.id
  SET wp_re_results_d.item_name = wp_re_results_d_temp.item_name;

  DROP TABLE wp_re_results_d_temp;

END$$
DELIMITER ;