-- phpMyAdmin SQL Dump
-- version 4.8.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Sep 26, 2019 at 01:39 AM
-- Server version: 5.6.43
-- PHP Version: 5.6.40

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `db_matcha`
--

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `user_ID` int(11) NOT NULL,
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
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`user_ID`, `last_name`, `first_name`, `login`, `email`, `password`, `localisation_auto`, `localisation_manual`, `departement`, `geo_consent`, `gender`, `orientation`, `age`, `bio`, `hashtag`, `nb_like`, `nb_nope`, `score`, `image_1`, `image_2`, `image_3`, `image_4`, `image_5`, `profile_picture`, `email_confirmation`, `recup_password`, `connected`) VALUES
(26, 'test2', 'test2', 'test2', '2test@test.fr', '$2a$12$BjAfDsOpGBN0kaDFeniMz.funLSlVDQUXsdv.YpS2mZ8U8NwzZ4I6', '48.9002,5.3095', '48.8882176,5.3175168', '8', 'Oui', 'Homme', 'Bi', 55, 'paulVICTOR@42', 'foot,asmfc,monaco,Les tchoins,Les chtis a monaco,basket', 1, 1, 50, '/images/7e0ed82ac66a3b272bbd4f3f55d3677c', NULL, NULL, NULL, NULL, '/images/7e0ed82ac66a3b272bbd4f3f55d3677c', '1', NULL, 0),
(28, 'Victor', 'Paul', 'pv', 'p.victor@outlook.fr', '$2a$12$CmUxf6y6ic7h74n6KT/j3OFa3lrvVd1VimySFvBV.2hqF7MQvA8R6', '48.9002,2.3095', '48.8966748,2.3183526999999997', '75 (1)', 'Oui', 'Homme', 'Bi', 55, 'paulVICTOR@42', 'Les tchoins,Les chtis a monaco,tennis,foot', 4, 0, 100, '/images/d5d9b9fca9648a75e9ecc91a36913bbf', '/images/cd8560ed70d86f47f86a5fd9a11fdc92', '/images/b24332fa98533b30d5358af37706d120', '/images/d812234b60ff425628355dc5985fdb27', '/images/17ebe005761ac14094dbc96918f78941', '/images/d5d9b9fca9648a75e9ecc91a36913bbf', '1', NULL, 1),
(29, 'test1', 'test1', 'test1', 'test1@test1.fr', '$2a$12$syyubvChPsOOPf5tkLdXreWR6LTItnwU5SveWP7At/LkJE9oInwzu', '48.8582,6.3387', NULL, '98', '', 'Femme', 'Bi', 45, 'paulVICTOR@42', 'tamere', 0, 0, NULL, '/images/b79d9ecaf03ebd373929900c5549fc7b', NULL, NULL, NULL, NULL, '/images/b79d9ecaf03ebd373929900c5549fc7b', '1', NULL, 0),
(30, 'test6', 'test6', 'test6', 'test6@test.fr', '$2a$12$gucGKCybzucco7lZb86a7uUEHFgouukfTyX5J0DGXQiELdQlkBl9a', '48.8582,2.3387', NULL, '1', '', 'Femme', 'Autres', 21, 'paulVICTOR@42', 'foot,tennis', 10, 0, 100, '/images/162336dffba20680e7684aaf0c333549', NULL, NULL, NULL, NULL, '/images/162336dffba20680e7684aaf0c333549', '1', NULL, 0),
(31, 'test4', 'test4', 'test4', 'test4@test.fr', '$2a$12$JLTe05d77cGMuecdUKJPSuF6BG63oINrpnulzEN.Zq74W8d5SfyuK', '48.8582,2.3387', NULL, '88', '', 'Autre', 'Bi', 18, 'paulVICTOR@42', '', 1, 0, 100, '/images/559ad6d95d61c488ab4bf4129d7543f5', NULL, NULL, NULL, NULL, '/images/559ad6d95d61c488ab4bf4129d7543f5', '1', NULL, 0),
(32, 'test7', 'test7', 'test7', 'test7@test.fr', '$2a$12$1a1lKp3U928b/fLofPb6heme.PskMnw3XqzQHkQNY3OuO/fpvhgqq', '48.8582,2.3387', NULL, '87', '', 'Homme', 'Bi', 18, 'paulVICTOR@42', '', 2, 0, 100, '/images/1b071bf01c4ed927ce593a85ff08df53', NULL, NULL, NULL, NULL, '/images/1b071bf01c4ed927ce593a85ff08df53', '1', NULL, 0),
(35, 'test8', 'test8', 'test8', 'test8@test.fr', '$2a$12$SEM5wcMDJ8R2WFP1ikmfYegGOJe2xOHkA8Tf4mnLCCfKB8F5DTeni', '48.8582,50.3387', NULL, '75 (13)', '', 'Femme', 'Bi', 65, 'paulVICTOR@42', '', 1, 1, 50, '/images/ddcb50a579d16ed20de3ea5dfbd91bd7', NULL, NULL, NULL, NULL, '/images/ddcb50a579d16ed20de3ea5dfbd91bd7', '1', NULL, 0),
(36, 'matt', 'matt', 'matt', 'matt@matt.matt', '$2a$12$2e6MCyMl5clibDfSeKbvN.AyeSTSIucymxpytxcuktWPXMHpIIX6G', '48.9002,2.3095', '58.887398399999995,2.3134208', '4', 'Oui', 'Homme', 'Femmes', 28, 'ouioui', 'foot,basket', 1, 0, 100, '/images/cc2f395d0cddfeef4b84ec7253b4658f', NULL, NULL, NULL, NULL, '/images/cc2f395d0cddfeef4b84ec7253b4658f', '1', NULL, 0),
(37, 'Gasparotto', 'Arthur', 'bolosse', 'gg@gg.com', '$2a$12$.dUx8hu8okubRwfjN8kzHOR4yIx9RBsC4ukYlzXFXvRLmv8es/fNW', NULL, NULL, '05', '', NULL, NULL, NULL, NULL, '', 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '1', NULL, 0),
(38, 'test12', 'test12', 'test12', 'test12@test.fr', '$2a$12$Lhwk1b.Syw4iH7dev8K8rOYi1viZ2ArqPXg8uv.JUN5Jy26oMYNJu', '48.9002,2.3095', NULL, '0', 'Non', 'Femme', 'Bi', 25, 'paulVICTOR@42', '', 0, 0, NULL, '/images/9eec1f69e7000b280705e21c73a23e6a', NULL, NULL, NULL, NULL, '/images/ee9daedcecd0b1ae043feef00af3a946', '1', NULL, 0),
(39, 'test13', 'test13', 'test13', 'test@13.fr', '$2a$12$MYbbjUOxn2hkwn6Gy7HTIOpcwXru5GFjWwQl2aLFsx8UPMIUvVVue', '48.9002,2.3095', '48.887398399999995,2.3134208', '75 (16)', 'Oui', 'Autre', 'Bi', 24, 'paulVICTOR@42', NULL, 0, 0, NULL, '/images/ee9daedcecd0b1ae043feef00af3a946', NULL, NULL, NULL, NULL, '/images/ee9daedcecd0b1ae043feef00af3a946', '1', NULL, 0),
(40, 'toto', 'toto', 'toto', 'toto@42.fr', '$2a$12$nlb5y/HXSFaLt7AQyYvk3el7Kd4H8z2qFjq/K0QVdi.oVn/g6IjnO', '48.9002,2.3095', '48.887398399999995,2.3134208', '6', 'Non', 'Femme', 'Bi', 89, '/*-+sadtfyguhi\r\n', 'foot,asmfc,monaco,Les tchoins,Les chtis a monaco,tennis,basket', 0, 0, 42, '/images/b4f6df2179637dd5f2bcbc552b0dc853', NULL, NULL, NULL, NULL, '/images/b4f6df2179637dd5f2bcbc552b0dc853', '1', NULL, 0),
(42, 'kik', 'kik', 'kik*/=', 'kik@ikk.fr', '$2a$12$.ZxpLI8GpePD2AxzEs.V8uVBlmvPkSQ/YlWMXXSb3NBYSVv/SbYzO', NULL, NULL, '', '', NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '58781d7c-35ca-4286-9057-0e17b9fba958', NULL, 0),
(43, 'Victor', 'Paul', 'kiki', 'kiki@kiki.kiki', '$2a$12$jE6DaB4zl1Shyv1CMMeK/eneIIRCuHkGi53bW9xpBgw/61C1KJpeK', NULL, NULL, '', '', NULL, NULL, NULL, NULL, NULL, 0, 0, NULL, NULL, NULL, NULL, NULL, NULL, NULL, '13740998-5e98-4f37-8ce5-699cfea11da4', NULL, 0),
(44, 'tata', 'tata', 'tata', 'tata@test.test', '$2a$12$YTBruDIZkWIb46Aspa4/be8Pg58HRKOB5Y/IGXG7LTXtXcZ4DVtQe', '48.9002,2.3095', NULL, '98', 'Non', 'Homme', 'Bi', 55, 'paulVICTOR@42', 'tennis,basket,foot,amsfc', 0, 0, NULL, '/images/27aeca9aae4db66378c9ee989b19864a', NULL, NULL, NULL, NULL, '/images/27aeca9aae4db66378c9ee989b19864a', '1', NULL, 0),
(45, 'gg', '<h1 style=\'color:red;\'>gg</h1>', 'ght', 'ss@ss.com', '$2a$12$/ybZjle9HvpbnvUy4nSkk.IVykh5rVScFzd/Kp.HJKo4em45Os7cO', '48.9002,2.3095', NULL, '75 (2)', 'Oui', 'Homme', 'Femmes', 45, 'paul', NULL, 0, 0, NULL, '/images/049569af5e016341a5de54bfd558ee9a', NULL, NULL, NULL, NULL, '/images/049569af5e016341a5de54bfd558ee9a', '1', NULL, 0),
(46, 'Test15', 'Test15', 'Test15', 'asdfgh@qwertyu.dsfghj', '$2a$12$noGuk8pygfr6xNBqECeuV.IbdCfrsabI.o4uJ9g58AyqHgRXCTJ2u', '48.9002,2.3095', '48.8966748,2.3183526999999997', '12', 'Oui', 'Femme', 'Bi', 65, 'paulVICTOR@42', 'tennis,foot,basket', 1, 0, 100, '/images/6e0a66709778ef75681825e1d0ee29d6', NULL, NULL, NULL, NULL, '/images/6e0a66709778ef75681825e1d0ee29d6', '1', NULL, 0),
(47, 'test16', 'test16', 'test16', 'terst16@test.fr', '$2a$12$YhTRqo//lGWs3yfJUziqEemmZ8wla3XdbGsCIp8QP0/vYyIhIdpeW', '48.9002,2.3095', '48.8966618,2.3183362', '98', 'Oui', 'Femme', 'Bi', 54, 'paulVICTOR@42', NULL, 0, 0, NULL, '/images/6213e57e8fba6638d47f54832f9a1f60', NULL, NULL, NULL, NULL, '/images/6213e57e8fba6638d47f54832f9a1f60', '1', NULL, 0),
(48, 'test17', 'test17', 'test17', 'eyo@yo.yo', '$2a$12$tviD4WYwdnbrxV4qtjhrWeY73G2zaV/4wBI7UudkF0dgiYTeQCnDy', '48.9002,2.3095', '', '1', 'Oui', 'Homme', 'Bi', 54, 'paulVICTOR@42', 'basket,tennis', 1, 0, 100, '/images/04c598de9b060044e127361c87752899', NULL, NULL, NULL, NULL, '/images/04c598de9b060044e127361c87752899', '1', NULL, 0);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`user_ID`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `user_ID` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=49;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
