ALTER TABLE `diffusion2017vis`.`policy` 
CHANGE COLUMN `policy_id` `policy_id` VARCHAR(80) NOT NULL ,
CHANGE COLUMN `policy_name` `policy_name` VARCHAR(250) NULL DEFAULT NULL ;

ALTER TABLE `diffusion2017vis`.`cascade` 
DROP FOREIGN KEY `cascade_ibfk_1`;
ALTER TABLE `diffusion2017vis`.`cascade` 
CHANGE COLUMN `policy_id` `policy_id` VARCHAR(80) NOT NULL ;
ALTER TABLE `diffusion2017vis`.`cascade` 
ADD CONSTRAINT `cascade_ibfk_1`
  FOREIGN KEY (`policy_id`)
  REFERENCES `diffusion2017vis`.`policy` (`policy_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

ALTER TABLE `diffusion2017vis`.`root_state` 
DROP FOREIGN KEY `root_ibfk_1`;
ALTER TABLE `diffusion2017vis`.`root_state` 
CHANGE COLUMN `policy_id` `policy_id` VARCHAR(80) NOT NULL ;
ALTER TABLE `diffusion2017vis`.`root_state` 
ADD CONSTRAINT `root_ibfk_1`
  FOREIGN KEY (`policy_id`)
  REFERENCES `diffusion2017vis`.`policy` (`policy_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;
