-- phpMyAdmin SQL Dump
-- version 4.9.2
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jun 02, 2020 at 12:47 AM
-- Server version: 10.4.11-MariaDB
-- PHP Version: 7.2.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `3d`
--

-- --------------------------------------------------------

--
-- Table structure for table `delivery_data`
--

CREATE TABLE `delivery_data` (
  `id` int(11) NOT NULL,
  `uid` int(11) DEFAULT NULL,
  `name` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `postal_code` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `city` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `address` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `mobile` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `fix_products`
--

CREATE TABLE `fix_products` (
  `id` int(11) NOT NULL,
  `url` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `img_url` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `img_showcase` varchar(1024) COLLATE utf8mb4_bin NOT NULL,
  `price` int(11) NOT NULL,
  `size` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `name` varchar(255) CHARACTER SET utf8 NOT NULL,
  `category` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `description` varchar(1024) COLLATE utf8mb4_bin NOT NULL,
  `date_added` date NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `uid` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `rvas` enum('0.12','0.16','0.20','0.28','0.2') COLLATE utf8mb4_bin NOT NULL,
  `suruseg` enum('10','20','30','40','50','60','70','80','90','100') COLLATE utf8mb4_bin NOT NULL,
  `scale` enum('0.7','1','1.3','1.0') COLLATE utf8mb4_bin NOT NULL,
  `color` enum('Fekete','Fehér','Kék','Piros','Zöld','Sárga') COLLATE utf8mb4_bin NOT NULL,
  `fvas` enum('0.4','1.2','2.0','2.8','3.6','2') COLLATE utf8mb4_bin NOT NULL,
  `quantity` int(11) NOT NULL,
  `is_transfer` tinyint(1) NOT NULL,
  `transfer_id` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `is_fix_prod` tinyint(1) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `order_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(320) COLLATE utf8mb4_bin NOT NULL,
  `password` varchar(512) COLLATE utf8mb4_bin NOT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `ip_addr` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `register_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Indexes for table `delivery_data`
--
ALTER TABLE `delivery_data`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `fix_products`
--
ALTER TABLE `fix_products`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `delivery_data`
--
ALTER TABLE `delivery_data`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT for table `fix_products`
--
ALTER TABLE `fix_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
