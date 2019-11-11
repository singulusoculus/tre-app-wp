DELIMITER $$
CREATE DEFINER=`pubmeepl`@`localhost` PROCEDURE `new_re_item_name_fixes`(IN `finditemname` TEXT CHARSET utf8, IN `replaceitemname` TEXT CHARSET utf8)
BEGIN

SELECT find_item_name INTO @itemnamecheck
from wp_re_item_name_fixes 
where find_item_name = finditemname; 

IF @itemnamecheck IS NULL THEN
    INSERT INTO `wp_re_item_name_fixes` (`id`, `find_item_name`, `replace_item_name`)
    VALUES (NULL, finditemname, replaceitemname);
END IF;

CREATE TABLE `wp_re_results_d_temp` 
( `id` INT NOT NULL , `item_name` TEXT NOT NULL  ) 
ENGINE = MyISAM
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO wp_re_results_d_temp (id, item_name)
SELECT wp_re_results_d.id, wp_re_results_d.item_name
FROM wp_re_results_d 
WHERE item_name = finditemname;

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