-- phpMyAdmin SQL Dump
-- version 4.9.5
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Jul 02, 2020 at 09:22 PM
-- Server version: 10.3.23-MariaDB-log
-- PHP Version: 7.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET AUTOCOMMIT = 0;
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `zaccordc_3d`
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
  `description` varchar(1024) CHARACTER SET utf8mb4 NOT NULL,
  `stl_path` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `priority` int(11) NOT NULL,
  `is_best` tinyint(1) NOT NULL DEFAULT 0,
  `date_added` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Dumping data for table `fix_products`
--

INSERT INTO `fix_products` (`id`, `url`, `img_url`, `img_showcase`, `price`, `size`, `name`, `category`, `description`, `stl_path`, `priority`, `is_best`, `date_added`) VALUES
(1, 'item/product=1', 'images/pizza7nagy.png', 'pizza3.png,pizza_4.png,pizza6.png', 690, '40x7x28', 'Pizzás Papírcsipesz', 'Csipesz', 'Pizza alakú papírcsipesz rendszerezésre, mindennapos használatra.\r\nSegítségével könnyedén össze tudod fogni papírpénzed, kártyáid, papírlapokat és ehhez hasonló tárgyakat.\r\nMegfelelő választás lehet hétköznapi dolgok összefogására olyanoknak, akik szeretnék egyedien rendszerezni a dolgaikat.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>40mm x 7mm x 28mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/3.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:445805\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/tosh/about\" class=\"bld\">Tosh</a> készítette. &#169; <!--DATE--> Tosh. Minden jog fenntartva.', 'pizza_clip', 1, 0, '2020-05-01 00:00:00'),
(2, 'item/product=2', 'images/csipesz.png', 'csipesz_nagy.png,csipesz_nagy_harmonia.png', 890, '58x12x25', 'Gyémántos Pénzcsipesz', 'Csipesz', 'Igényes pénzcsipesz hétköznapi tárgyak összefogására. Magas feszítésnek is ellenáll deformálódás nélkül, könnyen kezelhető.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>58mm x 12mm x 25mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/3.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:1385206\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/ysoft_be3d/about\" class=\"bld\">YSoft_be3D</a> készítette. &#169; <!--DATE--> YSoft_be3D. Minden jog fenntartva.\r\n ', 'diamond', 2, 1, '2020-05-14 00:00:00'),
(3, 'item/product=3', 'images/duplacsipesz2.png', 'duplacsipesz.png,duplacsipesz3.png', 1190, '85x20x55', 'Duplacsipesz', 'Csipesz', 'Minimalista dupla csipesz készpénz és kártyák tárolására, rendszerezésére. Pénztárcával együtt vagy ahelyett is használható.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>85mm x 20mm x 55mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2832388\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/kenversus/about\" class=\"bld\">KenVersus</a> készítette. &#169; <!--DATE--> KenVersus. Minden jog fenntartva.', '3D_Printed_Double_Money_Clip_Wallet', 3, 0, '2020-05-01 00:00:00'),
(4, 'item/product=4', 'images/delfin_tarto.png', 'delfin_telefontarto2.png', 1390, '50x65x15', 'Delfines Telefontartó', 'Telefontartó', 'Könnyen kezelhető delfines telefontartó. A termék állítva használandó és ebben a helyzetben állítva és fektetve is stabilan tartja a készüléket. A további stabilitás elérése érdekében ajánljuk az x1.3-as méretezést beállítani a specifikációknál.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>55mm x 65mm x 15mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/3.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:1686467\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/goraering/about\" class=\"bld\">goraering</a> készítette. &#169; <!--DATE--> goraering. Minden jog fenntartva.\r\n ', 'delfin_tarto', 4, 1, '2020-05-14 00:00:00'),
(5, 'item/product=5', 'images/macska_tarto.png', 'macska_telefontarto1.png,macska_telefontarto2.png,macska_telefontarto4.png', 1690, '60x30x68 ', 'Macskás Telefontartó', 'Telefontartó', 'Könnyen kezelhető macskás telefontartó. A termék állítva használandó és ebben a helyzetben állítva és fektetve is stabilan tartja a készüléket. A további stabilitás elérése érdekében ajánljuk az x1.3-as méretezést beállítani a specifikációknál.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>65mm x 30mm x 68mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/3.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:1012788\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/tinyeyes/about\" class=\"bld\">Tinyeyes</a> készítette. &#169; <!--DATE--> Tinyeyes. Minden jog fenntartva.', 'catstand', 5, 0, '2020-05-01 00:00:00'),
(6, 'item/product=6', 'images/sarkany_tarto.png', 'sarkany_telefontarto2.png,sarkany_telefontarto4.png,sarkany_telefontarto1.png', 2290, '92x60x32', 'Sárkányos Telefontartó', 'Telefontartó', 'Könnyen kezelhető sárkányos telefontartó. A termék állítva használandó és ebben a helyzetben állítva és fektetve is stabilan tartja a készüléket. A további stabilitás elérése érdekében ajánljuk az x1.3-as méretezést beállítani a specifikációknál.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>92mm x 60mm x 32mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:1702891\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/t1000777/about\" class=\"bld\">T1000777</a> készítette. &#169; <!--DATE--> T1000777. Minden jog fenntartva.', 'sarkany', 6, 1, '2020-05-14 00:00:00'),
(7, 'item/product=7', 'images/cipo_tarto.png', 'cipo_telefontarto1.png,cipo_telefontarto3.png', 2590, '75x63x74', 'Magassarkú Telefontartó', 'Telefontartó', 'Könnyen kezelhető magassarkú formájú telefontartó. A termék állítva használandó és ebben a helyzetben állítva és fektetve is stabilan tartja a készüléket. A további stabilitás elérése érdekében ajánljuk az x1.3-as méretezést beállítani a specifikációknál.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>75mm x 63mm x 74mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2027751\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/workshopbob/about\" class=\"bld\">workshopbob</a> készítette. &#169; <!--DATE--> workshopbob. Minden jog fenntartva.', 'Shoe_Phone_Holder', 7, 0, '2020-05-01 00:00:00'),
(8, 'item/product=8', 'images/toltotarto.png', 'tolto_telefontarto2.png,tolto_telefontarto1.png', 3290, '140x80x12', 'Töltőre Akasztható Telefontartó', 'Telefontartó', 'Könnyen kezelhető töltőre akasztható telefontartó. Nagyon hasznos lehet rövid töltőkábelek esetén vagy túl magasan lévő konnektorokhoz.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>140mm x 80mm x 12mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2855426\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/demosth1997/about\" class=\"bld\">Demosth1997</a> készítette. &#169; <!--DATE--> Demosth1997. Minden jog fenntartva.', 'phone_holder_imp_2', 8, 1, '2020-05-14 00:00:00'),
(9, 'item/product=9', 'images/foldable_tarto.png', 'tobballasu_telefontarto3.png,tobballasu_telefontarto1.png,tobballasu_telefontarto2.png', 4290, '115x121x53', 'Többszögű Telefontartó', 'Telefontartó', 'Könnyen kezelhető többállású telefontartó. Stabil tartást biztosít a telefonnak, emellett a csúszkával a kívánt dőlésszög is egyszerűen beállítható.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>115mm x 121mm x 53mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2835254\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/wabbitguy/about\" class=\"bld\">wabbitguy</a> készítette. &#169; <!--DATE--> wabbitguy. Minden jog fenntartva.', 'Foldable_Tablet_Stand_Bottom', 9, 0, '2020-05-01 00:00:00'),
(10, 'item/product=10', 'images/tobballasu_tarto.png', 'kihajthato_telefontarto2.png,kihajthato_telefontarto1.png', 2990, '90x64x25', 'Többállású Telefontartó', 'Telefontartó', 'Könnyen kezelhető többállású telefontartó. Stabil tartást biztosít a telefonnak, emellett a csúszkával a kívánt dőlésszög is egyszerűen beállítható.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>115mm x 121mm x 53mm</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/3.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2835254\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/wabbitguy/about\" class=\"bld\">wabbitguy</a> készítette. &#169; <!--DATE--> wabbitguy. Minden jog fenntartva.', 'Phone_Holder_V2_Mix', 10, 1, '2020-05-14 00:00:00'),
(11, 'item/product=11', 'images/cica_flex.png', 'cica_flex2.png,cica_flex1.png', 1990, '134x106x13 ', 'Flexibilis Cica', 'Flexibilis', 'Flexibilis műanyag macska figura mozgatható részekkel. Ideális választás lehet gyerekek számára vagy díszként a lakásba.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>134mm x 116mm x 13mm</li>\r\n<li>Az illesztések mentén kis mértékben mozgatható</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/3.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:3576952\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/feketeimre/about\" class=\"bld\">feketeimre</a> készítette. &#169; <!--DATE--> feketeimre. Minden jog fenntartva.', 'flexicat_flat', 11, 0, '2020-05-01 00:00:00'),
(12, 'item/product=12', 'images/rak_flex.png', 'rak_flex2.png,rak_flex1.png', 1890, '121x95x8 ', 'Flexibilis Rák', 'Flexibilis', 'Flexibilis műanyag rák figura mozgatható részekkel. Ideális választás lehet gyerekek számára vagy díszként a lakásba.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>121mm x 95mm x 8mm</li>\r\n<li>Az illesztések mentén kis mértékben mozgatható</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:3629031\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/edsparks/about\" class=\"bld\">EDSparks</a> készítette. &#169; <!--DATE--> EDSparks. Minden jog fenntartva.', 'Flexi_Crab', 12, 1, '2020-05-14 00:00:00'),
(13, 'item/product=13', 'images/sas_flex.png', 'sas_flex2.png,sas_flex1.png', 1590, '163x90x5', 'Flexibilis Sas', 'Flexibilis', 'Flexibilis műanyag sas figura mozgatható részekkel. Ideális választás lehet gyerekek számára vagy díszként a lakásba.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>163mm x 90mm x 5mm</li>\r\n<li>Az illesztések mentén kis mértékben mozgatható</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2939444\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/airwavested/about\" class=\"bld\">AirwavesTed</a> készítette. &#169; <!--DATE--> AirwavesTed. Minden jog fenntartva.', 'Articulated_Soaring_Eagle', 13, 0, '2020-05-01 00:00:00'),
(14, 'item/product=14', 'images/csontvaz_flex.png', 'csontvaz_flex2.png,csontvaz_flex1.png', 2890, '207x101x9', 'Flexibilis Csontváz', 'Flexibilis', 'Flexibilis műanyag csontváz figura mozgatható részekkel. Ideális választás lehet gyerekek számára vagy díszként a lakásba.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>163mm x 90mm x 5mm</li>\r\n<li>Az illesztések mentén kis mértékben mozgatható</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2939444\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/airwavested/about\" class=\"bld\">AirwavesTed</a> készítette. &#169; <!--DATE--> AirwavesTed. Minden jog fenntartva.', 'Skeleton', 14, 1, '2020-05-14 00:00:00'),
(15, 'item/product=15', 'images/unikornis_flex.png', 'unikornis_flex2.png,unikornis_flex3.png,unikornis_flex1.png', 1990, '102x79x13', 'Flexibilis Unikornis', 'Flexibilis', 'Flexibilis műanyag unikornis figura mozgatható részekkel. Ideális választás lehet gyerekek számára vagy díszként a lakásba.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>102mm x 79mm x 13mm</li>\r\n<li>Az illesztések mentén kis mértékben mozgatható</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2835053\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/benchy4life/about\" class=\"bld\">Benchy4Life</a> készítette. &#169; <!--DATE--> Benchy4Life. Minden jog fenntartva.', 'Flexi-UnicornFlat', 15, 1, '2020-05-01 00:00:00'),
(16, 'item/product=16', 'images/dino_flex.png', 'dino2.png,dino1.png', 1590, '81x67x13', 'Flexibilis Dinoszaurusz', 'Flexibilis', 'Flexibilis műanyag dinoszaurusz figura mozgatható részekkel. Ideális választás lehet gyerekek számára vagy díszként a lakásba.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>81mm x 67mm x 13mm</li>\r\n<li>Az illesztések mentén kis mértékben mozgatható</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2901355\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/cavedog/about\" class=\"bld\">Cavedog</a> készítette. &#169; <!--DATE--> Cavedog. Minden jog fenntartva.', 'Flexi-Rex', 16, 1, '2020-06-00 00:00:00'),
(17, 'item/product=17', 'images/vizilo_flex.png', 'vizilo_flex2.png,vizilo_flex1.png', 1890, '99x50x10', 'Flexibilis Viziló', 'Flexibilis', 'Flexibilis műanyag dinoszaurusz figura mozgatható részekkel. Ideális választás lehet gyerekek számára vagy díszként a lakásba.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>99mm x 50mm x10</li>\r\n<li>Az illesztések mentén kis mértékben mozgatható</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/3.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:3811306\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/joanabos/about\" class=\"bld\">joanabos</a> készítette. &#169; <!--DATE--> joanabos. Minden jog fenntartva.', 'hipo', 17, 1, '0000-00-00 00:00:00'),
(18, 'item/product=18', 'images/sarkany_flex_1.png', 'sarkany_flex.png,sarkany_flex1.png', 2690, '105x60x10', 'Flexibilis Sárkány', 'Flexibilis', 'Flexibilis műanyag sárkány figura mozgatható részekkel. Ideális választás lehet gyerekek számára vagy díszként a lakásba.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>105mm x 60mm x 10mm + 2x (69mm x 52mm x 6mm)</li>\r\n<li>Az illesztések mentén kis mértékben mozgatható</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/3.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:3505423\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/benchy4life/about\" class=\"bld\">Benchy4Life</a> készítette. &#169; <!--DATE--> Benchy4Life. Minden jog fenntartva.', 'Flexi-Dragon_Body_rev_B', 18, 1, '2020-06-00 00:00:00'),
(19, 'item/product=19', 'images/raptor_flex.png', 'raptor_flex2.png,raptor_flex1.png', 1990, '160x66x13', 'Flexibilis Raptor', 'Flexibilis', 'Flexibilis műanyag raptor figura mozgatható részekkel. Ideális választás lehet gyerekek számára vagy díszként a lakásba.<br><br>\r\n\r\nTulajdonságok:\r\n<ul class=\"dul\">\r\n<li>3DJAKE ecoPLA filament (környezetbarát, biológiai úton lebomló anyag)</li>\r\n<li>Környezetbarát csomagolás</li>\r\n<li>160mm x 66mm x 13mm</li>\r\n<li>Az illesztések mentén kis mértékben mozgatható</li>\r\n</ul>\r\n\r\nA termék szabad <a href=\"https://creativecommons.org/licenses/by-sa/4.0/\" class=\"bld\">licensszel</a>\r\nvan forgalomban, így te is <a href=\"https://www.thingiverse.com/thing:2901355\" class=\"bld\">megtekintheted</a>\r\nés kedved szerint módosíthatod.\r\nAbban az esetben, ha a szeretnéd a saját modelledet kinyomtatni használd a\r\n<a href=\"/print\" class=\"bld\">bérnyomtatás</a> funkciót.<br><br>\r\n\r\nA terméket <a href=\"https://www.thingiverse.com/cavedog/about\" class=\"bld\">Cavedog</a> készítette. &#169; <!--DATE--> Cavedog. Minden jog fenntartva.', 'raptor', 19, 1, '2020-06-00 00:00:00'),
(22, 'item/product=22', 'images/microsd.png', 'microsdkartya_tarolo2.png,microsdkartya_tarolo1.png', 1790, '45x45x16', 'Micro SD Kártya Tároló', 'Tároló', 'reggeli rutinhoz tökéletes', 'microsdcardholderbottomv1', 21, 1, '2020-06-00 00:00:00'),
(24, 'item/product=24', 'images/titoktarolo.png', 'titkostarolo_tarolo1.png,titkostarolo_tarolo2.png,titkostarolo_tarolo3.png', 3790, '135x62x18', 'Titkos Falirekesz', 'Tároló', 'reggeli rutinhoz tökéletes', 'shelf_inside', 23, 1, '2020-06-00 00:00:00'),
(25, 'item/product=25', 'images/pen_sd.png', 'sdkartya_tarolo2.png,sdkartya_tarolo3.png,sdkartya_tarolo1.png', 2790, '150x32x18', 'Pendrive, SD Kártya Tároló', 'Tároló', 'reggeli rutinhoz tökéletes', 'USB_Stick_SD_Card_Holder_-_8_USB', 24, 1, '2020-06-00 00:00:00'),
(26, 'item/product=26', 'images/koponya.png', 'csontvazfej_tarolo2.png,csontvazfej_tarolo3.png', 2690, '63x43x54', 'Koponya Tolltartó', 'Tároló', 'reggeli rutinhoz tökéletes', 'skull_art', 25, 0, '2020-06-00 00:00:00'),
(27, 'item/product=27', 'images/irodaiszortirozo.png', 'rendszerezo_rend2.png,rendszerezo_rend1.png', 11990, '140x140x98', 'Íróasztal Rendszerező', 'Rendszerező', 'reggeli rutinhoz tökéletes', 'organizer_ultra_small', 26, 1, '2020-06-00 00:00:00'),
(28, 'item/product=28', 'images/kisebbtarto.png', 'kisebbrendszerezo_rend2.png,kisebbrendszerezo_rend1.png', 8990, '125x120x78', 'Munkaasztal Szelektáló', 'Rendszerező', 'reggeli rutinhoz tökéletes', 'holder', 27, 0, '2020-06-00 00:00:00'),
(29, 'item/product=29', 'images/kabel_rend1.png', 'kabel_rend2.png', 890, '18x18x13', 'Kábel Menet', 'Rendszerező', 'reggeli rutinhoz tökéletes', 'SmartPhone_Cable_Organizer_r1', 28, 0, '2020-06-00 00:00:00'),
(32, 'item/product=32', 'images/aaa_elem1.png', 'aaa_elem2.png', 990, '101x22x20', 'AAA Elemtároló', 'Elem', 'reggeli rutinhoz tökéletes', 'AAAHolder', 30, 0, '2020-06-00 00:00:00'),
(33, 'item/product=33', 'images/aa_elem1.png', 'aa_elem2.png', 990, '101x26x20', 'AA Elemtároló', 'Elem', 'reggeli rutinhoz tökéletes', 'AAholder', 31, 0, '2020-06-00 00:00:00'),
(34, 'item/product=34', 'images/9v_elem1.png', '9v_elem2.png', 990, '101x30x20 ', '9V-os Elemtároló', 'Elem', 'reggeli rutinhoz tökéletes', '9VHolder', 32, 0, '2020-06-00 00:00:00'),
(35, 'item/product=35', 'images/pika_allat1.png', 'pika_allat2.png', 2790, '70x64x100', 'Pikachu', 'Állat', 'reggeli rutinhoz tökéletes', 'Pikachu', 33, 0, '2020-06-00 00:00:00'),
(36, 'item/product=36', 'images/parduc_allat1.png', 'parduc_allat1.png', 1890, '108x26x36', 'Fekete Párduc', 'Állat', 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris ipsum ante, ullamcorper ac lacus eget, mattis consequat purus. Ut porta enim nec egestas sodales. Nunc porta neque a ante aliquet dapibus. Sed id pulvinar nunc. Donec aliquet porttitor aliquet. Vivamus sapien dolor, tincidunt quis lacinia eu, vestibulum at orci. Donec ac nisl ligula. Proin consectetur ac lectus nec tristique. Nullam blandit imperdiet venenatis. Quisque enim tortor, aliquam eu ullamcorper a, semper pellentesque felis. Duis at tellus sed massa malesuada malesuada gravida sed dui. Vivamus quis urna at ante pellentesque accumsan. Etiam mattis et lacus in viverra. Nam sollicitudin sapien id enim pharetra faucibus.', 'panter', 34, 0, '2020-06-00 00:00:00'),
(37, 'item/product=37', 'images/kor_negyszog_ill0.png', 'kor_negyszog_ill2.png,kor_negyszog_ill3.png', 4490, '130x123x50', 'Körből Négyzet Illúzió', 'Illúzió', 'reggeli rutinhoz tökéletes', 'Sugihara_Cylinder_V4.1_Flat_Bottom', 35, 0, '2020-06-00 00:00:00'),
(38, 'item/product=38', 'images/akaszto2_furdo2.png', 'akaszto2_furdo1.png', 990, '64x58x10', 'Törölközőszárító Akasztó', 'Fürdő', 'reggeli rutinhoz tökéletes', 'TowelHolderBathroom_B_224mm_96mm', 36, 0, '2020-06-00 00:00:00'),
(39, 'item/product=39', 'images/akaszto_furdo2.png', 'akaszto_furdo3.png', 790, '50x50x50', 'Törölközőszárító Radiátor Akasztó', 'Fürdő', 'reggeli rutinhoz tökéletes', 'hanger1_fi23_13', 37, 0, '2020-06-00 00:00:00'),
(40, 'item/product=40', 'images/kinyomo_furdo2.png', 'kinyomo_furdo1.png', 690, '73x35x8', 'Fogkrém Kinyomó', 'Fürdő', 'reggeli rutinhoz tökéletes', 'toothpaste-key', 38, 0, '2020-06-00 00:00:00'),
(41, 'item/product=41', 'images/kinyomo2_furdo1.png', 'kinyomo2_furdo1.png', 590, '66x10x10', 'Fogkrém Kinyomó', 'Fürdő', 'reggeli rutinhoz tökéletes', 'Exquisite_Wolt-Habbi_2', 39, 0, '2020-06-00 00:00:00'),
(42, 'item/product=42', 'images/vaza_ill1.png', 'vaza_ill2.png', 5490, '85x85x100', 'Arc-Váza Illúzió', 'Illúzió', 'reggeli rutinhoz tökéletes', 'Vase', 40, 0, '2020-06-00 00:00:00'),
(43, 'item/product=43', 'images/gorbe_tarto.png', 'lebego_telefontarto2.png,lebego_telefontarto3.png,lebego_telefontarto.png', 3990, '87x56x106', 'Görbe Telefontartó', 'Telefontartó', 'reggeli rutinhoz tökéletes', 'telefontarto_lebego', 41, 0, '2020-06-00 00:00:00'),
(44, 'item/product=44', 'images/konyvtarto.png', 'konyv_tarto2.png,konyv_tarto3.png,konyv_tarto.png', 3690, '120x85x135', 'Könyv, Füzet Állvány', 'Tartó, állvány', 'reggeli rutinhoz tökéletes', 'konyv_tarto', 42, 0, '2020-06-00 00:00:00'),
(45, 'item/product=45\r\n', 'images/kanaltarto.png', 'kanal_tarto2.png,kanal_tarto1.png', 1490, '96x41x52', 'Kanál Állvány', 'Tartó, állvány', 'reggeli rutinhoz tökéletes', 'kanal_tarto', 43, 0, '2020-06-00 00:00:00'),
(46, 'item/product=46\r\n', 'images/telefonkihangosito.png', 'kihangosito_telefontarto2.png,kihangosito_telefontarto3.png,kihangosito_telefontarto.png', 6590, '100x84x145', 'Kihangosító', 'Telefontartó', 'reggeli rutinhoz tökéletes', 'SP3_FINAL', 44, 0, '2020-06-00 00:00:00'),
(47, 'item/product=47\r\n', 'images/fagyitarto.png', 'fagylalt_tarto2.png,fagylalt_tarto3.png,fagylalt_tarto1.png', 1890, '56x56x87', 'Fagylalt Tartó', 'Tároló', 'reggeli rutinhoz tökéletes', 'fagylalt_tarto', 45, 0, '2020-06-00 00:00:00'),
(49, 'item/product=49', 'images/csontvazfej.png', 'csontvaz.kulcs2.png,csontvaz.kulcs.png', 1790, '54x74x5 ', 'Csontvázos Kulcstartó', 'Kulcstartók', 'reggeli rutinhoz tökéletes', 'skull_keychain', 46, 0, '2020-06-00 00:00:00'),
(50, 'item/product=50', 'images/sokallasu_tarto.png', 'sokallasu_telefontarto2.png,sokallasu_telefontarto3.png,sokallasu_telefontarto1.png', 1590, '70x15x15 ', 'Telefonkitámasztó Kulcstartó', 'Tartó, állvány', 'reggeli rutinhoz tökéletes', 'modBodyRing', 47, 0, '2020-06-00 00:00:00'),
(51, 'item/product=51', 'images/ecsettarto.png', 'ecsettarto2.png,ecsettarto1.png', 990, '60x50x9 ', 'Ecset Tartó', 'Tartó, állvány', 'reggeli rutinhoz tökéletes', 'Paintbrush_Holder_-_3brushes', 48, 0, '2020-06-00 00:00:00'),
(52, 'item/product=52', 'images/katapult0.png', 'katapult.png', 1790, '56x52x68', 'Katapult', 'Játék', 'reggeli rutinhoz tökéletes', 'Micro_Catapult_INC._TOL.', 49, 0, '2020-06-00 00:00:00'),
(53, 'item/product=53', 'images/gekko.png', 'kameleon2.png,kameleon1.png', 1590, '70x44x13', 'Gekko Kulcstartó', 'Kulcstartók', 'reggeli rutinhoz tökéletes', 'gecko', 50, 0, '2020-06-00 00:00:00'),
(54, 'item/product=54', 'images/2drugo1.png', '2drugo2.png', 1790, '54x74x5 ', '2D-s Rugó', 'Játék', 'reggeli rutinhoz tökéletes', 'spring2d', 51, 0, '2020-06-00 00:00:00'),
(55, 'item/product=55', 'images/dino1_1.png', 'madar_kulcs2.png,madar_kulcs1.png', 1490, '50x65x5 ', 'Pteranodon Kulcstartó', 'Kulcstartók', 'reggeli rutinhoz tökéletes', 'dino_8bit4', 52, 0, '2020-06-00 00:00:00'),
(56, 'item/product=56', 'images/dino4.png', 'dino2_kulcs2.png,dino2_kulcs1.png', 1890, '77x51x5 ', 'Hylaeosaurus Kulcstartó', 'Kulcstartók', 'reggeli rutinhoz tökéletes', 'dino_8bit5', 53, 0, '2020-06-00 00:00:00'),
(57, 'item/product=57', 'images/dino3.png', 'dino3_kulcs2.png,dino3_kulcs1.png', 1790, '68x45x5 ', 'Triceratops Kulcstartó', 'Kulcstartók', 'reggeli rutinhoz tökéletes', 'dino_8bit3', 54, 0, '2020-06-00 00:00:00'),
(58, 'item/product=58', 'images/dino2_1.png', 'dino4_kulcs2.png,dino4_kulcs1.png', 1390, '70x45x5 ', 'Psittacosaurus Kulcstartó', 'Kulcstartók', 'reggeli rutinhoz tökéletes', 'dino_8bit2', 55, 0, '2020-06-00 00:00:00'),
(59, 'item/product=59', 'images/dino5.png', 'dino5_kulcs2.png,dino5_kulcs1.png', 1590, '70x37x5 ', 'Tyrannosaurus Kulcstartó', 'Kulcstartók', 'reggeli rutinhoz tökéletes', 'dino_8bit1', 56, 0, '2020-06-00 00:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `uid` int(11) NOT NULL,
  `item_id` int(11) NOT NULL,
  `price` int(11) NOT NULL,
  `rvas` enum('0.12','0.20','0.28','0.2') COLLATE utf8mb4_bin NOT NULL,
  `suruseg` enum('10','20','40','60','80') COLLATE utf8mb4_bin NOT NULL,
  `scale` enum('0.7','1','1.3','1.0') COLLATE utf8mb4_bin NOT NULL,
  `color` enum('Fekete','Fehér','Kék','Piros','Zöld','Sárga') COLLATE utf8mb4_bin NOT NULL,
  `fvas` enum('0.8','1.2','1.6','2.0','2.4','2') COLLATE utf8mb4_bin NOT NULL,
  `lit_sphere` enum('Domború','Homorú','Sima','') COLLATE utf8mb4_bin DEFAULT NULL,
  `lit_size` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `lit_fname` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `quantity` int(11) NOT NULL,
  `is_transfer` tinyint(1) NOT NULL,
  `transfer_id` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `is_fix_prod` tinyint(1) NOT NULL,
  `status` tinyint(1) NOT NULL DEFAULT 0,
  `shipping_price` int(11) NOT NULL,
  `cp_fname` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `same_billing_addr` tinyint(1) NOT NULL DEFAULT 1,
  `billing_name` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `billing_country` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `billing_city` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `billing_pcode` int(11) DEFAULT NULL,
  `billing_address` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `billing_compname` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `billing_comp_tax_num` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `order_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `email` varchar(320) COLLATE utf8mb4_bin NOT NULL,
  `password` varchar(512) COLLATE utf8mb4_bin NOT NULL,
  `temp_password` varchar(255) COLLATE utf8mb4_bin DEFAULT NULL,
  `user_agent` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `ip_addr` varchar(255) COLLATE utf8mb4_bin NOT NULL,
  `register_time` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_bin;

--
-- Indexes for dumped tables
--

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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=24;

--
-- AUTO_INCREMENT for table `fix_products`
--
ALTER TABLE `fix_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=60;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=31;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=36;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
