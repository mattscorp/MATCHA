CREATE DATABASE `matcha`;

USE `matcha`;

CREATE TABLE `users` (`user_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `last_name` VARCHAR(255), `first_name` VARCHAR(255), `login` VARCHAR(20), `email` VARCHAR(255), `password` TEXT, `localisation_auto` TEXT, `localisation_manual` TEXT, `departement` VARCHAR(11) NOT NULL DEFAULT '0', `geo_consent` TEXT, `gender` VARCHAR(10), `orientation` VARCHAR(10), `age` INT, `bio` TEXT, `hashtag` TEXT, `nb_like` INT, `nb_nope` INT, `score` INT, `image_1` TEXT, `image_2` TEXT, `image_3` TEXT, `image_4` TEXT, `image_5` TEXT, `profile_picture` TEXT, `email_confirmation` TEXT, `recup_password` TEXT, `connected` INT NOT NULL DEFAULT '0');

CREATE TABLE `match` (`match_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `liker_ID` INT, `liked_ID` INT, `valid_match` INT);

CREATE TABLE `like` (`like_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `liker_ID` INT, `liked_ID` INT, `valid_like` INT);

CREATE TABLE `block` (`block_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `blocker_ID` INT, `blocked_ID` INT, `valid_block` INT);

CREATE TABLE `notifications` (`notification_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `notified_ID` INT, `notifier_ID` INT, `notifier_first_name` TEXT, `motive` TEXT, `valid_notification` INT, `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE `report` (`report_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `reporter_ID` INT, `reported_ID` INT, `valid_report` INT);

CREATE TABLE `message` (`message_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `sender_ID` INT, `recipient_ID` INT, `message` TEXT, `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE `history` (`action_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `from_ID` INT, `to_ID` INT, `history_first_name` TEXT, `action` VARCHAR(10), `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE `interests` (`interests_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `topic` VARCHAR(255), `topic_score` INT NOT NULL DEFAULT '0');

CREATE TABLE `villes_france_free` ( `ville_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT, `ville_departement` varchar(3) DEFAULT NULL, `ville_slug` varchar(255) DEFAULT NULL, `ville_nom` varchar(45) DEFAULT NULL, `ville_nom_simple` varchar(45) DEFAULT NULL, `ville_nom_reel` varchar(45) DEFAULT NULL, `ville_nom_soundex` varchar(20) DEFAULT NULL, `ville_nom_metaphone` varchar(22) DEFAULT NULL, `ville_code_postal` varchar(255) DEFAULT NULL, `ville_commune` varchar(3) DEFAULT NULL, `ville_code_commune` varchar(5) NOT NULL, `ville_arrondissement` smallint(3) unsigned DEFAULT NULL, `ville_canton` varchar(4) DEFAULT NULL, `ville_amdi` smallint(5) unsigned DEFAULT NULL,`ville_population_2010` mediumint(11) unsigned DEFAULT NULL, `ville_population_1999` mediumint(11) unsigned DEFAULT NULL, `ville_population_2012` mediumint(10) unsigned DEFAULT NULL COMMENT 'approximatif', `ville_densite_2010` int(11) DEFAULT NULL, `ville_surface` float DEFAULT NULL, `ville_longitude_deg` float DEFAULT NULL, `ville_latitude_deg` float DEFAULT NULL, `ville_longitude_grd` varchar(9) DEFAULT NULL, `ville_latitude_grd` varchar(8) DEFAULT NULL, `ville_longitude_dms` varchar(9) DEFAULT NULL, `ville_latitude_dms` varchar(8) DEFAULT NULL, `ville_zmin` mediumint(4) DEFAULT NULL, `ville_zmax` mediumint(4) DEFAULT NULL, PRIMARY KEY (`ville_id`), UNIQUE KEY `ville_code_commune_2` (`ville_code_commune`), UNIQUE KEY `ville_slug` (`ville_slug`), KEY `ville_departement` (`ville_departement`), KEY `ville_nom` (`ville_nom`), KEY `ville_nom_reel` (`ville_nom_reel`), KEY `ville_code_commune` (`ville_code_commune`), KEY `ville_code_postal` (`ville_code_postal`), KEY `ville_longitude_latitude_deg` (`ville_longitude_deg`,`ville_latitude_deg`), KEY `ville_nom_soundex` (`ville_nom_soundex`), KEY `ville_nom_metaphone` (`ville_nom_metaphone`), KEY `ville_population_2010` (`ville_population_2010`), KEY `ville_nom_simple` (`ville_nom_simple`)) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=36831 ;

SET GLOBAL time_zone = '+2:00';
