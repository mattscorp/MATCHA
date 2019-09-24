USE `matcha`;

CREATE TABLE `users` (`user_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `last_name` VARCHAR(255), `first_name` VARCHAR(255), `login` VARCHAR(20), `email` VARCHAR(255), `password` TEXT, `localisation_auto` TEXT, `localisation_manual` TEXT, `departement` VARCHAR(11) NOT NULL, `geo_consent` TEXT, `gender` VARCHAR(10), `orientation` VARCHAR(10), `age` INT, `bio` TEXT, `hashtag` TEXT, `nb_like` INT, `nb_nope` INT, `score` INT, `image_1` TEXT, `image_2` TEXT, `image_3` TEXT, `image_4` TEXT, `image_5` TEXT, `profile_picture` TEXT, `email_confirmation` TEXT, `recup_password` TEXT);

CREATE TABLE `match` (`match_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `liker_ID` INT, `liked_ID` INT, `valid_match` INT);

CREATE TABLE `like` (`like_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `liker_ID` INT, `liked_ID` INT, `valid_like` INT);

CREATE TABLE `block` (`block_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `blocker_ID` INT, `blocked_ID` INT, `valid_block` INT);

CREATE TABLE `notifications` (`notification_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `notified_ID` INT, `notifier_ID` INT, `notifier_first_name` TEXT, `motive` TEXT, `valid_notification` INT, `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE `report` (`report_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `reporter_ID` INT, `reported_ID` INT, `valid_report` INT);

CREATE TABLE `message` (`message_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `sender_ID` INT, `recipient_ID` INT, `message` TEXT, `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE `history` (`action_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `from_ID` INT, `to_ID` INT, `history_first_name` TEXT, `action` VARCHAR(10), `date` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE `interests` (`interests_ID` INT NOT NULL PRIMARY KEY AUTO_INCREMENT, `topic` VARCHAR(255), `topic_score` INT NOT NULL);

SET GLOBAL time_zone = '+2:00';
