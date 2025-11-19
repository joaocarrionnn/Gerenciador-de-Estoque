-- --------------------------------------------------------
-- Servidor:                     127.0.0.1
-- Versão do servidor:           10.4.32-MariaDB - mariadb.org binary distribution
-- OS do Servidor:               Win64
-- HeidiSQL Versão:              12.12.0.7122
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

-- Copiando estrutura para tabela sistema_estoque.movimentacoes
CREATE TABLE IF NOT EXISTS `movimentacoes` (
  `id_movimentacao` int(11) NOT NULL AUTO_INCREMENT,
  `id_produto` int(11) NOT NULL,
  `tipo` enum('entrada','saida') NOT NULL,
  `quantidade` decimal(10,2) NOT NULL,
  `unidade_medida` varchar(20) NOT NULL,
  `responsavel` varchar(100) NOT NULL,
  `projeto_experimento` varchar(200) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `data_movimentacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id_movimentacao`),
  KEY `id_produto` (`id_produto`),
  CONSTRAINT `movimentacoes_ibfk_1` FOREIGN KEY (`id_produto`) REFERENCES `produtos` (`id_produto`)
) ENGINE=InnoDB AUTO_INCREMENT=76 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.movimentacoes: ~2 rows (aproximadamente)
INSERT INTO `movimentacoes` (`id_movimentacao`, `id_produto`, `tipo`, `quantidade`, `unidade_medida`, `responsavel`, `projeto_experimento`, `observacoes`, `data_movimentacao`) VALUES
	(72, 50, 'entrada', 0.10, 'L', 'ca', NULL, 'Entrada registrada por ca. ', '2025-11-19 11:20:45'),
	(73, 47, 'saida', 1.00, 'L', 'a', '', 'Saída registrada por a', '2025-11-19 12:11:50'),
	(74, 48, 'entrada', 1.00, 'kg', 'car', NULL, 'Entrada registrada por car. ', '2025-11-19 13:04:03'),
	(75, 48, 'saida', 0.70, 'kg', 'a', '', 'Saída registrada por a', '2025-11-19 13:23:24');

-- Copiando estrutura para tabela sistema_estoque.movimentacoes_vidracarias
CREATE TABLE IF NOT EXISTS `movimentacoes_vidracarias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `vidraria_id` int(11) NOT NULL,
  `tipo` enum('retirada','reposicao') NOT NULL,
  `quantidade` int(11) NOT NULL,
  `usuario` varchar(255) NOT NULL,
  `observacao` text DEFAULT NULL,
  `data_movimentacao` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `vidraria_id` (`vidraria_id`),
  CONSTRAINT `movimentacoes_vidracarias_ibfk_1` FOREIGN KEY (`vidraria_id`) REFERENCES `vidracarias` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.movimentacoes_vidracarias: ~1 rows (aproximadamente)
INSERT INTO `movimentacoes_vidracarias` (`id`, `vidraria_id`, `tipo`, `quantidade`, `usuario`, `observacao`, `data_movimentacao`) VALUES
	(6, 8, 'reposicao', 1, 'joao Carrion', 'Fornecedor: a', '2025-11-19 12:10:54'),
	(7, 8, 'retirada', 1, 'joao Carrion', '', '2025-11-19 13:40:44'),
	(8, 8, 'retirada', 1, 'joao Carrion', '', '2025-11-19 13:40:52'),
	(9, 8, 'retirada', 1, 'joao Carrion', '', '2025-11-19 13:40:59'),
	(10, 8, 'reposicao', 1, 'joao Carrion', '', '2025-11-19 13:41:04');

-- Copiando estrutura para tabela sistema_estoque.produtos
CREATE TABLE IF NOT EXISTS `produtos` (
  `id_produto` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descricao` text DEFAULT NULL,
  `grau_periculosidade` varchar(20) DEFAULT NULL,
  `orgao_regulador` varchar(50) DEFAULT NULL,
  `instrucoes_seguranca` text DEFAULT NULL,
  `quantidade` decimal(10,2) NOT NULL DEFAULT 0.00,
  `estoque_minimo` int(11) DEFAULT 0,
  `unidade_medida` varchar(20) NOT NULL,
  `localizacao` varchar(100) DEFAULT NULL,
  `disponivel` tinyint(1) DEFAULT 1,
  `fornecedor` varchar(100) DEFAULT NULL,
  `data_aquisicao` date DEFAULT NULL,
  `data_validade` date DEFAULT NULL,
  `data_validade_nova` date DEFAULT NULL,
  `produto_renovado` tinyint(1) DEFAULT 0,
  `id_produto_original` int(11) DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_produto`)
) ENGINE=InnoDB AUTO_INCREMENT=53 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.produtos: ~6 rows (aproximadamente)
INSERT INTO `produtos` (`id_produto`, `nome`, `tipo`, `descricao`, `grau_periculosidade`, `orgao_regulador`, `instrucoes_seguranca`, `quantidade`, `estoque_minimo`, `unidade_medida`, `localizacao`, `disponivel`, `fornecedor`, `data_aquisicao`, `data_validade`, `data_validade_nova`, `produto_renovado`, `id_produto_original`, `observacoes`, `data_criacao`, `data_atualizacao`) VALUES
	(47, 'Acetato de Etila', 'solvente', 'CH₃COOCH₂CH₃ - Pureza: 99,5% - Densidade: 0,897 g/cm³ - MM: 88,11 g/mol', 'alto', 'policia-federal', 'Inflamável e irritante. Armazenar em local ventilado, longe de fontes de ignição.', 0.00, 1, 'L', 'Armário 1 – Prateleira 1 – Posição 1', 1, 'Synth', NULL, '2020-07-06', NULL, 0, NULL, 'Classificação GHS: Inflamável, irritante. Volume do frasco: 1000 ml', '2025-11-05 18:33:45', '2025-11-19 12:11:50'),
	(48, 'Bicarbonato de Sódio', 'reagente_quimico', 'NaHCO₃ - Pureza: 99,7-100,3% - MM: 84,01 g/mol', 'baixo', 'policia-federal', 'Armazenar em local seco e arejado.', 1.30, 1, 'kg', 'Armário 6 - Prateleira 2 - Posição 2', 1, 'Dinâmica', NULL, '2028-08-08', NULL, 0, NULL, 'Volume do frasco: 1000g. Quantidade mínima: 0,5Kg. Quantidade máxima: 1Kg', '2025-11-05 18:33:45', '2025-11-19 13:23:24'),
	(49, 'Hidróxido de Sódio', 'base', 'NaOH - Pureza: 49% - Densidade: 1,5-1,54 g/cm³ - MM: 40,00 g/mol', 'alto', 'policia-civil', 'Corrosivo. Usar equipamento de proteção individual. Manipular em capela.', 1.00, 2, 'L', 'Armário 2 – Prateleira 2 – Posição 1', 1, 'Êxodo científica', NULL, '2027-09-25', NULL, 0, NULL, 'Classificação GHS: corrosivo para metais. Volume do frasco: 1000ml. Quantidade mínima: 2Kg. Quantidade máxima: 5Kg', '2025-11-05 18:33:45', '2025-11-05 18:33:45'),
	(50, 'Ácido Clorídrico', 'acido', 'HCl - Pureza: 37,1% - Densidade: 1,188 g/cm³ - MM: 36,46 g/mol', 'alto', 'policia-federal', 'Corrosivo. Manipular em capela com exaustor. Usar luvas e óculos de proteção.', 1.00, 1, 'L', 'Armário 3 – Prateleira 2 – Posição 1', 1, 'Reatec', '0000-00-00', '2025-11-12', NULL, 0, NULL, 'Volume do frasco: 1000ml. Quantidade mínima: 1L. Quantidade máxima: 4L', '2025-11-05 18:33:45', '2025-11-19 13:30:35'),
	(51, 'Ácido Sulfúrico', 'acido', 'H₂SO₄ - Pureza: 90,0-91,0% - Densidade: 1,815-1,821 g/ml - MM: 98,08 g/mol', 'extremo', 'policia-federal', 'Altamente corrosivo. Manipular exclusivamente em capela. Usar equipamento de proteção completo.', 1.00, 1, 'L', 'Armário 3 – Prateleira 3 – Posição 2', 1, 'Química Moderna', NULL, NULL, NULL, 0, NULL, 'Classificação GHS: corrosivo, tóxico, irritante. Volume do frasco: 1000ml. Quantidade mínima: 1L. Quantidade máxima: 4L', '2025-11-05 18:33:45', '2025-11-05 18:33:45'),
	(52, 'Cloreto de Bário Dihidratado', 'sal', '', 'alto', 'não tem', '', 1000.00, 500, 'gramas', '', 1, '', '0000-00-00', NULL, NULL, 0, NULL, '', '2025-11-19 17:20:56', '2025-11-19 17:20:56');

-- Copiando estrutura para tabela sistema_estoque.produto_pdfs
CREATE TABLE IF NOT EXISTS `produto_pdfs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `id_produto` int(11) NOT NULL,
  `nome_arquivo` varchar(255) NOT NULL,
  `nome_original` varchar(255) NOT NULL,
  `caminho_arquivo` varchar(500) NOT NULL,
  `tamanho_arquivo` int(11) NOT NULL COMMENT 'Tamanho em bytes',
  `tipo_documento` varchar(100) DEFAULT NULL COMMENT 'Ex: FISPQ, Certificado, Manual, etc',
  `descricao` text DEFAULT NULL,
  `data_upload` timestamp NOT NULL DEFAULT current_timestamp(),
  `usuario_upload` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_produto` (`id_produto`),
  KEY `idx_produto_id` (`id_produto`),
  KEY `idx_data_upload` (`data_upload`),
  CONSTRAINT `produto_pdfs_ibfk_1` FOREIGN KEY (`id_produto`) REFERENCES `produtos` (`id_produto`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=16 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.produto_pdfs: ~0 rows (aproximadamente)
INSERT INTO `produto_pdfs` (`id`, `id_produto`, `nome_arquivo`, `nome_original`, `caminho_arquivo`, `tamanho_arquivo`, `tipo_documento`, `descricao`, `data_upload`, `usuario_upload`) VALUES
	(15, 47, 'product-1763557476873-135880109-Boletim__1_.pdf', 'Boletim (1).pdf', 'U:\\Users\\55926559839\\Desktop\\Gerenciador-de-Estoque\\public\\uploads\\product-pdfs\\product-1763557476873-135880109-Boletim__1_.pdf', 91479, NULL, NULL, '2025-11-19 13:04:36', 'joao Carrion');

-- Copiando estrutura para tabela sistema_estoque.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nome_completo` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `telefone` varchar(20) DEFAULT NULL,
  `cpf` varchar(14) DEFAULT NULL,
  `senha` varchar(255) NOT NULL,
  `palavra_chave` varchar(255) DEFAULT NULL,
  `turma` varchar(50) DEFAULT NULL,
  `foto_perfil` varchar(255) DEFAULT NULL,
  `status` enum('pendente','aprovado','rejeitado') DEFAULT 'aprovado',
  `tipo` enum('admin','usuario') DEFAULT 'usuario',
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NULL DEFAULT NULL,
  `data_aprovacao` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `email` (`email`),
  UNIQUE KEY `unique_usuario` (`usuario`),
  UNIQUE KEY `unique_email` (`email`),
  UNIQUE KEY `unique_cpf` (`cpf`)
) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.usuarios: ~12 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `nome_completo`, `usuario`, `email`, `telefone`, `cpf`, `senha`, `palavra_chave`, `turma`, `foto_perfil`, `status`, `tipo`, `data_criacao`, `data_atualizacao`, `data_aprovacao`) VALUES
	(1, 'Administrador', 'admin', 'admin@empresa.com', NULL, NULL, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, NULL, 'aprovado', 'admin', '2025-09-10 22:30:33', NULL, NULL),
	(3, 'joao Carrion', 'joao', 'joao@outlook.org.br', '18981121784', NULL, '$2b$10$ZYqEVnvQdTDnM8X36taqd.N7oZ/c8RChpVWYImD.jVMLuA8SjboyK', NULL, 'quimica2B', 'profile-1762342984731-771921612.jpg', 'aprovado', 'admin', '2025-09-10 22:47:27', '2025-11-05 19:39:15', NULL),
	(4, 'joao', 'carrion', 'aluno@gmail.com', NULL, '222.222.222-22', '$2b$10$zPeUgETe/5PyB5B2OOoKp.4zjjSCsWztkIDzwT7VBY7V3haBQV.q2', '$2b$10$vjzCUdDCSLh1g5ZRg6YixuI6YGPqrBTQlYL2jdLo9c.UUwi2En3zO', 'quimica1A', NULL, 'aprovado', 'usuario', '2025-10-22 11:52:45', NULL, NULL),
	(5, 'aaaaaaaaaaaaaaa', 'aaa', 'carrion@gmail.com', NULL, '333.333.333-33', '$2b$10$RkxKYzWdP8YhVre8buBkS.1e8otOVC6e6IdyASLBPh.vOwG4HKZW2', '$2b$10$anfHC/DqJ0Nf.lP4h6brvujajTWAioAR6IgMtQPHz.ubudBxsXKYu', 'quimica1B', NULL, 'aprovado', 'usuario', '2025-10-22 11:54:33', NULL, NULL),
	(6, 'Carriao', 'aaaa', 'adadad@gmail.com', NULL, '33333333333', '$2b$10$OUi1UwurK./fU8cw1DEn/.J0DT6kUjHhds9LEZreTwZ8Z/uzUJZD.', '$2b$10$sXt4.szdVJ6mqSjS..TdreaDhrlqVA.wcW1y6gQbjHrQqc/5ZaFU2', 'quimica1A', NULL, 'aprovado', 'usuario', '2025-10-22 12:03:35', NULL, NULL),
	(7, 'carrionnn', 'miguelll', 'miguel@gmail.com', NULL, '44444444444', '$2b$10$c49NayWOK.yqqpbldspOAe7dnqy5TwSZgy6VIOAE59pJLhpDdiG/6', '$2b$10$APm6AmrLlKHIvH0jayoLOeVG7fUAHpXoio8uZR5qo/thbytdXNut2', 'quimica1A', NULL, 'aprovado', 'usuario', '2025-10-22 12:05:27', NULL, NULL),
	(8, 'joao1', 'joao1', 'joao1@gmail.com', NULL, '88888888888', '$2b$10$XcVhaz9wxQYDK48gUn9QseyDhL6/0SQQnlFgFJIS3NlGnqRnBr.PS', '$2b$10$A1U8ZwgvliEoEUje/gr8Iepbx2nPkF5qi/iI1bLPahGTL2KIRyLn2', 'quimica1A', NULL, 'aprovado', 'usuario', '2025-10-22 17:07:09', NULL, NULL),
	(9, 'João Miguel', 'joao miguel', 'joaomiguelcg54@gmail.com', '', '55926559839', '$2b$10$pMmcU6BIws99CHRDwH2IVeyL9IBj.HOKEUkG6wFWa/dwC76bhmN5.', '$2b$10$a36R3KhfRX8/eOociNyrvOitfgObJwL96I3zh/H0TIZXd/S5kh92i', 'quimica2A', 'profile-1762344701717-957083961.jpg', 'aprovado', 'usuario', '2025-10-29 12:59:39', '2025-11-05 14:01:29', NULL),
	(10, 'Carrion rei das curvas', 'carriola', 'carrionzinxl@gmail.com', NULL, '41251543154', '$2b$10$/Bb5dOwNPAO.P4sYqg3l3OaltcCGRdIKmB1gJfeo6kINQkM9Zby2e', '$2b$10$AJw.jV4c9GD91Wd/wfFUJuvFLcFjwOLTVbMEEEptxBTs5o046IHmK', 'quimica1A', NULL, 'aprovado', 'usuario', '2025-10-31 19:22:29', NULL, NULL),
	(11, 'João Vitor', 'jaovls', 'jaovls@gmail.com', NULL, '21212121221', '$2b$10$FqORegC7zVvAKq/6IWtIT.CPUuN8QwMXwUBf.3V1ly8Yl2G0x2Uiu', '$2b$10$htWUmo7ET4gI60BmzvYtGePBgFKqgRGPWVY/i5g/YvJawF2vRE6.y', 'quimica1B', 'profile-1762343543296-33584110.webp', 'aprovado', 'admin', '2025-11-05 11:50:57', '2025-11-19 19:24:28', NULL),
	(12, 'João Gabriel Policate', 'Policate', 'joao.policate@aluno.senai.br', NULL, '47803167829', '$2b$10$DV65DhGERsuyBH./fXyM.eOw4fdlO8E.Kq4AsHUeJ67GrZVpgtaSC', '$2b$10$mbjDdgzZ6uxQh2XUhl7CBO1xnIIPkImAU9MRJQhBmMSqIWF8j2.Ve', 'quimica2B', 'profile-1762365432376-374099110.jpg', 'aprovado', 'usuario', '2025-11-05 11:52:08', '2025-11-05 18:38:40', NULL),
	(13, 'adan', 'car', 'mail@gmail.com', NULL, '63636215621', '$2b$10$oCy1iIxWss3xfjr5Fs76jOeDW/mPYnmXqP32kxf3KkAeLi2M4MrDu', '$2b$10$r5Dxp57N4lLM5pnWOItP9.DKaHCbYlSJqFHL0KZ1tcoiN6UAHdYXi', 'quimica1B', NULL, 'aprovado', 'usuario', '2025-11-05 13:46:22', NULL, NULL);

-- Copiando estrutura para tabela sistema_estoque.vidracarias
CREATE TABLE IF NOT EXISTS `vidracarias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(255) NOT NULL,
  `categoria` varchar(100) DEFAULT NULL,
  `capacidade` varchar(50) DEFAULT NULL,
  `material` varchar(100) DEFAULT NULL,
  `descricao` text DEFAULT NULL,
  `quantidade` int(11) DEFAULT 0,
  `estoque_minimo` int(11) DEFAULT 5,
  `localizacao` varchar(255) DEFAULT NULL,
  `fornecedor` varchar(255) DEFAULT NULL,
  `data_aquisicao` date DEFAULT NULL,
  `observacoes` text DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.vidracarias: ~1 rows (aproximadamente)
INSERT INTO `vidracarias` (`id`, `nome`, `categoria`, `capacidade`, `material`, `descricao`, `quantidade`, `estoque_minimo`, `localizacao`, `fornecedor`, `data_aquisicao`, `observacoes`, `data_criacao`, `data_atualizacao`) VALUES
	(8, 'aa', 'transferencia', 'aa', 'vidro', 'a', 9, 5, 'a', '', '0000-00-00', '', '2025-11-19 12:10:34', '2025-11-19 13:41:04');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
