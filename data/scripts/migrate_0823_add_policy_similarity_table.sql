CREATE TABLE `diffusion2017vis`.`policy_similarity` (
  `policy_id_1` VARCHAR(80) NOT NULL,
  `policy_id_2` VARCHAR(80) NOT NULL,
  `policy_text_similarity` DECIMAL(3,2) NULL DEFAULT NULL,
  `policy_cascade_similarity` DECIMAL(3,2) NULL DEFAULT NULL,
  PRIMARY KEY (`policy_id_1`, `policy_id_2`),
  INDEX `policy_similarity_ibfk_2_idx` (`policy_id_2` ASC),
  CONSTRAINT `policy_similarity_ibfk_1`
    FOREIGN KEY (`policy_id_1`)
    REFERENCES `diffusion2017vis`.`policy` (`policy_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT `policy_similarity_ibfk_2`
    FOREIGN KEY (`policy_id_2`)
    REFERENCES `diffusion2017vis`.`policy` (`policy_id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE)
ENGINE = InnoDB
DEFAULT CHARACTER SET = latin1;
