ALTER TABLE `diffusion2017vis`.`policy` 
ADD COLUMN `policy_lda_1` INT NULL DEFAULT NULL AFTER `policy_description`,
ADD COLUMN `policy_lda_2` INT NULL DEFAULT NULL AFTER `policy_lda_1`;

ALTER TABLE `diffusion2017vis`.`subject` 
ADD COLUMN `subject_valid` INT NULL DEFAULT 0 AFTER `subject_name`;

-- update subject table
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Macroeconomics' WHERE `subject_id`='1';
UPDATE `diffusion2017vis`.`subject` SET `subject_valid`='1' WHERE `subject_id`='1';
UPDATE `diffusion2017vis`.`subject` SET `subject_valid`='1' WHERE `subject_id`='2';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Health', `subject_valid`='1' WHERE `subject_id`='3';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Agriculture', `subject_valid`='1' WHERE `subject_id`='4';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Labor', `subject_valid`='1' WHERE `subject_id`='5';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Education', `subject_valid`='1' WHERE `subject_id`='6';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Environment', `subject_valid`='1' WHERE `subject_id`='7';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Energy', `subject_valid`='1' WHERE `subject_id`='8';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Immigration', `subject_valid`='1' WHERE `subject_id`='9';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Transportation', `subject_valid`='1' WHERE `subject_id`='10';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Law and Crime', `subject_valid`='1' WHERE `subject_id`='12';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Social Welfare', `subject_valid`='1' WHERE `subject_id`='13';
UPDATE `diffusion2017vis`.`subject` SET `subject_name`='Housing', `subject_valid`='1' WHERE `subject_id`='14';
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('15', 'Domestic Commerce', '1');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('16', 'Defense', '1');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('17', 'Technology', '1');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('18', 'Foreign Trade', '1');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('19', 'International Affairs', '1');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('20', 'Government Operations', '1');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('21', 'Public Lands', '1');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('23', 'Arts and Entertainment', '0');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('24', 'Government Administration', '0');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('26', 'Weather', '0');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('27', 'Fires', '0');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('29', 'Sports', '0');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('30', 'Death Notices', '0');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('31', 'Religion', '0');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('99', 'Other', '0');
INSERT INTO `diffusion2017vis`.`subject` (`subject_id`, `subject_name`, `subject_valid`) VALUES ('98', 'Unknown', '1');

-- label subjects that insufficient in policy amount to generate network
UPDATE `diffusion2017vis`.`subject` SET `subject_valid`='0' WHERE `subject_id`='4';
UPDATE `diffusion2017vis`.`subject` SET `subject_valid`='0' WHERE `subject_id`='16';
UPDATE `diffusion2017vis`.`subject` SET `subject_valid`='0' WHERE `subject_id`='18';
UPDATE `diffusion2017vis`.`subject` SET `subject_valid`='0' WHERE `subject_id`='9';
UPDATE `diffusion2017vis`.`subject` SET `subject_valid`='0' WHERE `subject_id`='21';
UPDATE `diffusion2017vis`.`subject` SET `subject_valid`='0' WHERE `subject_id`='17';
UPDATE `diffusion2017vis`.`subject` SET `subject_valid`='0' WHERE `subject_id`='19';