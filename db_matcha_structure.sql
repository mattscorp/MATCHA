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
