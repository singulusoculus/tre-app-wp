BEGIN

SELECT find_item_name INTO @itemnamecheck
from re_item_name_fixes 
where find_item_name = finditemname; 

IF @itemnamecheck IS NULL THEN
    INSERT INTO `re_item_name_fixes` (`id`, `find_item_name`, `replace_item_name`)
    VALUES (NULL, finditemname, replaceitemname);
END IF;

CREATE TABLE `re_results_d_temp` 
( `id` INT NOT NULL , `item_name` TEXT NOT NULL  ) 
ENGINE = MyISAM
CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO re_results_d_temp (id, item_name)
SELECT re_results_d.id, re_results_d.item_name
FROM re_results_d 
WHERE item_name = finditemname;

UPDATE re_results_d_temp
LEFT OUTER JOIN re_item_name_fixes on re_results_d_temp.item_name = re_item_name_fixes.find_item_name
SET re_results_d_temp.item_name = re_item_name_fixes.replace_item_name
WHERE re_item_name_fixes.find_item_name is not null;

UPDATE re_results_d
JOIN re_results_d_temp on re_results_d.id = re_results_d_temp.id
SET re_results_d.item_name = re_results_d_temp.item_name_fixed;
DROP TABLE re_results_d_temp;

END