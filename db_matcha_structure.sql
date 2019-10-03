SET SQL_MODE = 'NO_AUTO_VALUE_ON_ZERO';
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = '+00:00';


CREATE TABLE IF NOT EXISTS `block` (
  `block_ID` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `blocker_ID` int(11) DEFAULT NULL,
  `blocked_ID` int(11) DEFAULT NULL,
  `valid_block` int(11) DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS `history` (
  `action_ID` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `from_ID` int(11) DEFAULT NULL,
  `to_ID` int(11) DEFAULT NULL,
  `history_first_name` text NOT NULL,
  `action` varchar(10) DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS `interests` (
  `interest_ID` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `topic` varchar(50) DEFAULT NULL,
  `topic_score` int(11) NOT NULL
);


CREATE TABLE IF NOT EXISTS `like` (
  `like_ID` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `liker_ID` int(11) DEFAULT NULL,
  `liked_ID` int(11) DEFAULT NULL,
  `valid_like` int(11) DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS `match` (
  `match_ID` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `liker_ID` int(11) DEFAULT NULL,
  `liked_ID` int(11) DEFAULT NULL,
  `valid_match` int(11) DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS `message` (
  `message_ID` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `sender_ID` int(11) DEFAULT NULL,
  `recipient_ID` int(11) DEFAULT NULL,
  `message` text,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS `notifications` (
  `notification_ID` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `notified_ID` int(11) DEFAULT NULL,
  `notifier_ID` int(11) DEFAULT NULL,
  `notifier_first_name` text NOT NULL,
  `motive` text,
  `valid_notification` int(11) DEFAULT NULL,
  `date` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE IF NOT EXISTS `report` (
  `report_ID` int(11) NOT NULL PRIMARY KEY AUTO_INCREMENT,
  `reporter_ID` int(11) DEFAULT NULL,
  `reported_ID` int(11) DEFAULT NULL,
  `valid_report` int(11) DEFAULT NULL
);


CREATE TABLE IF NOT EXISTS `users` (
  `user_ID` INT(11) NOT NULL PRIMARY KEY AUTO_INCREMENT, 
  `last_name` varchar(255) DEFAULT NULL,
  `first_name` varchar(255) DEFAULT NULL,
  `login` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `password` text,
  `localisation_auto` text,
  `localisation_manual` text,
  `departement` varchar(11) NOT NULL,
  `geo_consent` text NOT NULL,
  `gender` varchar(10) DEFAULT NULL,
  `orientation` varchar(10) DEFAULT NULL,
  `age` int(11) DEFAULT NULL,
  `bio` text,
  `hashtag` text,
  `nb_like` int(11) NOT NULL,
  `nb_nope` int(11) NOT NULL,
  `score` int(11) DEFAULT NULL,
  `image_1` text,
  `image_2` text,
  `image_3` text,
  `image_4` text,
  `image_5` text,
  `profile_picture` text,
  `email_confirmation` text,
  `recup_password` text,
  `connected` int(11) NOT NULL DEFAULT '0'
);


CREATE TABLE IF NOT EXISTS `villes_france_free` (
  `ville_id` mediumint(8) unsigned NOT NULL AUTO_INCREMENT,
  `ville_departement` varchar(3) DEFAULT NULL,
  `ville_slug` varchar(255) DEFAULT NULL,
  `ville_nom` varchar(45) DEFAULT NULL,
  `ville_nom_simple` varchar(45) DEFAULT NULL,
  `ville_nom_reel` varchar(45) DEFAULT NULL,
  `ville_nom_soundex` varchar(20) DEFAULT NULL,
  `ville_nom_metaphone` varchar(22) DEFAULT NULL,
  `ville_code_postal` varchar(255) DEFAULT NULL,
  `ville_commune` varchar(3) DEFAULT NULL,
  `ville_code_commune` varchar(5) NOT NULL,
  `ville_arrondissement` smallint(3) unsigned DEFAULT NULL,
  `ville_canton` varchar(4) DEFAULT NULL,
  `ville_amdi` smallint(5) unsigned DEFAULT NULL,
  `ville_population_2010` mediumint(11) unsigned DEFAULT NULL,
  `ville_population_1999` mediumint(11) unsigned DEFAULT NULL,
  `ville_population_2012` mediumint(10) unsigned DEFAULT NULL COMMENT 'approximatif',
  `ville_densite_2010` int(11) DEFAULT NULL,
  `ville_surface` float DEFAULT NULL,
  `ville_longitude_deg` float DEFAULT NULL,
  `ville_latitude_deg` float DEFAULT NULL,
  `ville_longitude_grd` varchar(9) DEFAULT NULL,
  `ville_latitude_grd` varchar(8) DEFAULT NULL,
  `ville_longitude_dms` varchar(9) DEFAULT NULL,
  `ville_latitude_dms` varchar(8) DEFAULT NULL,
  `ville_zmin` mediumint(4) DEFAULT NULL,
  `ville_zmax` mediumint(4) DEFAULT NULL,
  PRIMARY KEY (`ville_id`),
  KEY `ville_departement` (`ville_departement`),
  KEY `ville_nom` (`ville_nom`),
  KEY `ville_nom_reel` (`ville_nom_reel`),
  KEY `ville_code_commune` (`ville_code_commune`),
  KEY `ville_code_postal` (`ville_code_postal`),
  KEY `ville_longitude_latitude_deg` (`ville_longitude_deg`,`ville_latitude_deg`),
  KEY `ville_nom_soundex` (`ville_nom_soundex`),
  KEY `ville_nom_metaphone` (`ville_nom_metaphone`),
  KEY `ville_population_2010` (`ville_population_2010`),
  KEY `ville_nom_simple` (`ville_nom_simple`)
) ENGINE=MyISAM  DEFAULT CHARSET=utf8 AUTO_INCREMENT=36831 ;
