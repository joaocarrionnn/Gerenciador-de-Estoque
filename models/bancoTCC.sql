-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.11.0.7065
-- --------------------------------------------------------

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET NAMES utf8 */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;


-- Copiando estrutura do banco de dados para sistema_estoque
CREATE DATABASE IF NOT EXISTS `sistema_estoque` /*!40100 DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci */;
USE `sistema_estoque`;

-- Copiando estrutura para tabela sistema_estoque.vidrarias
CREATE TABLE IF NOT EXISTS `vidrarias` (
  `id_vidraria` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 0,
  `capacidade` varchar(50) DEFAULT NULL,
  `material` varchar(50) DEFAULT NULL,
  `categoria` varchar(50) DEFAULT NULL,
  `localizacao` varchar(100) DEFAULT NULL,
  `status` enum('disponivel','baixo_estoque','indisponivel') DEFAULT 'disponivel',
  `fornecedor` varchar(100) DEFAULT NULL,
  `data_aquisicao` date DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_vidraria`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.vidrarias: ~8 rows (aproximadamente)
INSERT INTO `vidrarias` (`id_vidraria`, `nome`, `quantidade`, `capacidade`, `material`, `categoria`, `localizacao`, `status`, `fornecedor`, `data_aquisicao`, `observacoes`, `data_criacao`, `data_atualizacao`) VALUES
	(1, 'Balão Volumétrico', 12, '250 mL', 'Vidro borossilicato', 'Volumétrico', 'Armário A - Prateleira 1', 'disponivel', 'Sigma-Aldrich', '2024-01-15', 'Precisão classe A', '2025-10-03 16:04:17', '2025-10-03 16:04:17'),
	(2, 'Béquer', 25, '500 mL', 'Vidro temperado', 'Utilidade geral', 'Armário B - Prateleira 2', 'disponivel', 'Vetec', '2024-02-20', 'Para uso geral', '2025-10-03 16:04:17', '2025-10-03 16:04:17'),
	(3, 'Erlenmeyer', 18, '250 mL', 'Vidro borossilicato', 'Aquecimento', 'Armário A - Prateleira 3', 'disponivel', 'Merck', '2024-01-30', 'Resistente ao calor', '2025-10-03 16:04:17', '2025-10-03 16:04:17'),
	(4, 'Pipeta Graduada', 3, '10 mL', 'Vidro borossilicato', 'Medição', 'Armário C - Prateleira 1', 'baixo_estoque', 'Sigma-Aldrich', '2024-03-10', 'Precisão ±0.02 mL', '2025-10-03 16:04:17', '2025-10-03 16:04:17'),
	(5, 'Bureta', 8, '50 mL', 'Vidro borossilicato', 'Titulação', 'Armário B - Prateleira 1', 'disponivel', 'Vetec', '2024-02-15', 'Com torneira de vidro', '2025-10-03 16:04:17', '2025-10-03 16:04:17'),
	(6, 'Condensador de Liebig', 0, '300 mm', 'Vidro borossilicato', 'Destilação', 'Armário D - Prateleira 2', 'indisponivel', 'Merck', '2024-01-25', 'Precisa repor estoque', '2025-10-03 16:04:17', '2025-10-03 16:04:17'),
	(7, 'Funil de Separação', 5, '250 mL', 'Vidro borossilicato', 'Separação', 'Armário C - Prateleira 2', 'disponivel', 'Sigma-Aldrich', '2024-03-05', 'Com torneja de Teflon', '2025-10-03 16:04:17', '2025-10-03 16:04:17'),
	(8, 'Proveta', 2, '100 mL', 'Vidro borossilicato', 'Medição', 'Armário A - Prateleira 2', 'baixo_estoque', 'Vetec', '2024-02-28', 'Precisão ±1%', '2025-10-03 16:04:17', '2025-10-03 16:04:17');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
