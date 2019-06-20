BEGIN

  -- Fix Weird Space on new lists
  DROP TABLE IF EXISTS `re_namefix_temp`;
  CREATE TABLE `rankingengine_wordpress`.`re_namefix_temp` 
  ( `id` INT NOT NULL 
  , `item_name` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL 
  , `new_item_name` TEXT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL ) 
  ENGINE = MyISAM CHARSET=utf8mb4 
  COLLATE utf8mb4_unicode_ci;

  INSERT INTO re_namefix_temp (id, item_name, new_item_name)
  SELECT re_results_d.id, item_name, substring(item_name, 1, char_length(item_name)-1) as new_item_name
  FROM `re_results_d`
  JOIN re_results_h ON re_results_d.result_id = re_results_h.result_id
  WHERE list_category = 2
  AND re_results_d.result_id = listid
  AND substring(item_name, length(item_name)-1, 1) = " "
  AND char_length(item_name)+1 = length(item_name)
  AND trim(replace(item_name, " ", "")) like '% %';

  UPDATE re_results_d
  JOIN re_namefix_temp ON re_results_d.id = re_namefix_temp.id
  SET re_results_d.item_name = re_namefix_temp.new_item_name;

  DROP TABLE re_namefix_temp;

-- Add item_name_fixed
  DROP TABLE IF EXISTS `re_results_d_temp`;
  CREATE TABLE `rankingengine_wordpress`.`re_results_d_temp` 
  ( `id` INT NOT NULL , `item_name` TEXT NOT NULL ) 
  ENGINE = MyISAM
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

  INSERT INTO re_results_d_temp (id, item_name)
  SELECT re_results_d.id, re_results_d.item_name
  FROM re_results_d 
  WHERE result_id = listid;

  UPDATE re_results_d_temp
  LEFT OUTER JOIN re_item_name_fixes on re_results_d_temp.item_name = re_item_name_fixes.find_item_name
  SET re_results_d_temp.item_name = re_item_name_fixes.replace_item_name
  WHERE re_item_name_fixes.find_item_name is not null;

  UPDATE re_results_d
  JOIN re_results_d_temp on re_results_d.id = re_results_d_temp.id
  SET re_results_d.item_name = re_results_d_temp.item_name;

  DROP TABLE re_results_d_temp;

END