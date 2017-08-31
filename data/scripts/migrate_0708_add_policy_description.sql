ALTER TABLE `diffusion2017vis`.`policy` 
ADD COLUMN `policy_description` VARCHAR(250) NULL DEFAULT NULL AFTER `policy_end`;

UPDATE `diffusion2017vis`.`policy` SET `policy_description` = `policy_name`
WHERE `policy_id` IS NOT NULL;
