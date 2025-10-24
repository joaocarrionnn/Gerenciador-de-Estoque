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
) ENGINE=InnoDB AUTO_INCREMENT=67 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.movimentacoes: ~28 rows (aproximadamente)
INSERT INTO `movimentacoes` (`id_movimentacao`, `id_produto`, `tipo`, `quantidade`, `unidade_medida`, `responsavel`, `projeto_experimento`, `observacoes`, `data_movimentacao`) VALUES
	(2, 19, 'entrada', 5.00, 'L', 'Policate', 'Fornecedor: Senai', 'Entrada registrada por Policate. Data de compra: 2025-10-08', '2025-10-08 11:46:39'),
	(3, 19, 'saida', 5.00, 'L', 'Policate', 'Químico', 'Saída registrada por Policate', '2025-10-08 11:47:17'),
	(6, 19, 'entrada', 1.00, 'L', 'aa', 'Fornecedor: aa', 'aaa', '2025-10-08 11:53:58'),
	(7, 19, 'entrada', 1.00, 'L', 'aa', 'Fornecedor: aa', 'a', '2025-10-08 11:55:47'),
	(13, 19, 'saida', 1.00, 'L', 'aaa', 'aaa', 'aa', '2025-10-08 12:03:04'),
	(22, 17, 'saida', 2.00, 'g', 'aa', 'aa', 'aa', '2025-10-08 13:30:04'),
	(26, 13, 'saida', 2.00, 'L', 'Carrion', 'Faze Agua', 'Saída registrada por Carrion', '2025-10-08 16:58:22'),
	(27, 13, 'entrada', 2.00, 'L', 'Carrion', 'Fornecedor: SEnai', 'Entrada registrada por Carrion. Data de compra: 2025-10-08', '2025-10-08 16:59:22'),
	(29, 28, 'entrada', 1.00, 'kg', 'carriao', 'Fornecedor: senai', 'Entrada registrada por carriao. ', '2025-10-10 12:10:49'),
	(30, 28, 'entrada', 5.00, 'kg', 'car', 'Fornecedor: car', 'Entrada registrada por car. Data de compra: 2025-10-10', '2025-10-10 12:11:20'),
	(31, 17, 'entrada', 11.00, 'g', 'car', 'Fornecedor: car', 'Entrada registrada por car. ', '2025-10-10 12:11:58'),
	(33, 29, 'entrada', 3.00, 'mL', 'a', 'Fornecedor: aa', 'Entrada registrada por a. ', '2025-10-10 14:08:34'),
	(34, 9, 'saida', 8.00, 'L', 'aaaaaaaaaaaaaa', 'aa', 'Saída registrada por aa', '2025-10-10 17:09:00'),
	(49, 19, 'entrada', 0.50, 'L', 'aa', 'Fornecedor: aa', 'Entrada registrada por aa. ', '2025-10-17 12:04:26'),
	(50, 19, 'saida', 0.10, 'L', 'aa', 'a', 'Saída registrada por aa', '2025-10-17 12:05:10'),
	(51, 19, 'saida', 0.30, 'L', 'aaa', 'aa', 'Saída registrada por aaa', '2025-10-17 12:15:12'),
	(52, 19, 'saida', 0.40, 'L', 'aa', 'a', 'Saída registrada por aa', '2025-10-17 13:02:44'),
	(55, 19, 'saida', 0.30, 'L', 'aa', 'a', 'Saída registrada por aa', '2025-10-17 13:26:48'),
	(56, 19, 'entrada', 0.30, 'L', 'aa', 'Fornecedor: aa', 'Entrada registrada por aa. ', '2025-10-17 13:28:03'),
	(57, 19, 'saida', 0.30, 'L', 'aa', 'aa', 'a', '2025-10-17 13:28:15'),
	(59, 9, 'saida', 0.20, 'L', 'aa', 'aa', 'Saída registrada por aa', '2025-10-17 13:29:38'),
	(60, 19, 'saida', 0.50, 'L', 'aa', 'a', 'Saída registrada por aa', '2025-10-22 11:29:54'),
	(61, 19, 'saida', 0.50, 'L', 'aaaa', 'a', 'Saída registrada por aaaa', '2025-10-22 11:30:08'),
	(62, 25, 'saida', 0.10, 'g', 'a', 'aa', 'Saída registrada por a', '2025-10-22 11:32:22'),
	(63, 25, 'entrada', 0.20, 'g', 'a', 'Fornecedor: a', 'Entrada registrada por a. ', '2025-10-22 11:32:40'),
	(64, 25, 'saida', 0.20, 'g', 'a', 'aa', 'Saída registrada por a', '2025-10-22 11:35:10'),
	(65, 19, 'entrada', 0.60, 'L', 'aa', 'Fornecedor: a', 'Entrada registrada por aa. ', '2025-10-22 11:37:30'),
	(66, 19, 'saida', 0.50, 'L', 'a', 'a', 'Saída registrada por a', '2025-10-22 11:37:42');

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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.movimentacoes_vidracarias: ~5 rows (aproximadamente)
INSERT INTO `movimentacoes_vidracarias` (`id`, `vidraria_id`, `tipo`, `quantidade`, `usuario`, `observacao`, `data_movimentacao`) VALUES
	(1, 5, 'retirada', 1, 'joao', 'Projeto: senai', '2025-10-15 18:52:30'),
	(2, 5, 'reposicao', 1, 'joao', 'Fornecedor: 123', '2025-10-15 18:53:06'),
	(3, 2, 'retirada', 1, 'joao', 'Projeto: Senai', '2025-10-15 18:54:45'),
	(4, 2, 'reposicao', 1, 'joao', 'Fornecedor: senai', '2025-10-15 18:55:13'),
	(5, 5, 'retirada', 1, 'joao', 'Projeto: aa | Obs: a', '2025-10-15 19:00:58');

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
  `observacoes` text DEFAULT NULL,
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_atualizacao` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id_produto`)
) ENGINE=InnoDB AUTO_INCREMENT=41 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.produtos: ~29 rows (aproximadamente)
INSERT INTO `produtos` (`id_produto`, `nome`, `tipo`, `descricao`, `grau_periculosidade`, `orgao_regulador`, `instrucoes_seguranca`, `quantidade`, `estoque_minimo`, `unidade_medida`, `localizacao`, `disponivel`, `fornecedor`, `data_aquisicao`, `observacoes`, `data_criacao`, `data_atualizacao`) VALUES
	(2, 'Hidróxido de Sódio', 'base', 'NaOH - 1kg', '', 'policia-federal', '', 10.00, 0, 'unidade', 'Prateleira B2', 1, '', '0000-00-00', '', '2025-09-19 13:47:38', '2025-09-24 11:21:54'),
	(6, 'Sulfato de Cobre II', 'Reagente Químico', 'Sulfato de cobre penta-hidratado', 'moderado', 'ANVISA', 'Tóxico se ingerido. Lavar as mãos após o uso.', 3.00, 2, 'kg', 'Armário 2 – Prateleira 3 – Posição 12', 1, 'Vetec', '2024-03-10', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(7, 'Tampão Fosfato pH 7.4', 'Solução Tampão', 'Tampão fosfato salino 10x concentrado', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 10.00, 10, 'L', 'Armário 1 – Prateleira 4 – Posição 5', 1, 'Invitrogen', '2024-01-30', NULL, '2025-09-24 13:54:36', '2025-10-08 11:38:34'),
	(8, 'Solução de Lugol', 'Reagente Químico', 'Solução de iodo e iodeto de potássio', 'moderado', 'ANVISA', 'Evitar contato com metais. Manter em frasco âmbar.', 6.00, 4, 'L', 'Armário 4 – Prateleira 1 – Posição 3', 1, 'Dinâmica', '2024-02-14', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(9, 'Azul de Metileno 1%', 'Corante', 'Solução de azul de metileno para histologia', 'baixo', 'exercito', 'Manter longe de luz direta.', 6.00, 6, 'L', 'Armário 5 – Prateleira 2 – Posição 7', 1, 'Synth', '2024-03-05', '', '2025-09-24 13:54:36', '2025-10-24 16:01:35'),
	(10, 'Tripsina 0.25%', 'Enzima', 'Tripsina para cultura celular', 'baixo', 'ANVISA', 'Armazenar a -20°C. Evitar ciclos de congelamento.', 25.00, 15, 'mL', 'Freezer 2 – Prateleira 1 – Posição 4', 1, 'Gibco', '2024-01-22', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(11, 'DNA Polimerase Taq', 'Enzima', 'Enzima para PCR termoestável', 'baixo', 'ANVISA', 'Armazenar a -20°C. Manter em gelo durante o uso.', 18.00, 12, 'U', 'Freezer 1 – Prateleira 3 – Posição 9', 1, 'Thermo Fisher', '2024-02-28', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(13, 'DMEM Alto Glucose', 'Meio de Cultura', 'Meio Dulbecco Modified Eagle Medium', 'baixo', 'ANVISA', 'Armazenar refrigerado. Proteger da luz.', 22.00, 15, 'L', 'Geladeira 1 – Prateleira 4 – Posição 11', 1, 'Cultilab', '2024-01-18', NULL, '2025-09-24 13:54:36', '2025-10-08 16:59:22'),
	(15, 'RPMI 1640', 'Meio de Cultura', 'Meio para cultivo de células hematopoiéticas', 'baixo', 'ANVISA', 'Armazenar a 4°C. Completar com soro.', 17.00, 12, 'L', 'Geladeira 2 – Prateleira 1 – Posição 3', 1, 'Vitrocell', '2024-03-08', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(17, 'Cloreto de Mercúrio II', 'Reagente Químico', 'Composto de mercúrio altamente tóxico', 'extremo', 'ANVISA', 'Manipular em capela química. Descarte específico obrigatório.', 11.00, 1, 'g', 'Armário Blindado – Prateleira 1 – Posição 2', 1, 'Merck', '2024-02-12', NULL, '2025-09-24 13:54:36', '2025-10-10 12:11:58'),
	(18, 'Benzopireno', 'Composto Orgânico', 'Hidrocarboneto policíclico cancerígeno', 'extremo', 'ANVISA', 'Uso com equipamento de proteção respiratória. Capela obrigatória.', 1.00, 1, 'g', 'Armário Blindado – Prateleira 2 – Posição 1', 1, 'Sigma-Aldrich', '2024-03-01', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(19, 'Acetoneta P.A.', 'Solvente', 'Acetoneta grau HPLC 99.9%', 'alto', 'ANVISA', 'Altamente inflamável. Trabalhar em área ventilada.', 5.10, 8, 'L', 'Armário 7 – Prateleira 1 – Posição 4', 1, 'Tedia', '2024-01-28', NULL, '2025-09-24 13:54:36', '2025-10-22 11:37:42'),
	(20, 'Clorofórmio P.A.', 'Solvente', 'Clorofórmio estabilizado com etanol', 'alto', 'ANVISA', 'Cancerígeno suspeito. Usar em capela com exaustor.', 7.00, 5, 'L', 'Armário 7 – Prateleira 2 – Posição 6', 1, 'Cromato', '2024-02-16', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(21, 'Metanol HPLC', 'Solvente', 'Metanol grau cromatografia líquida', 'alto', 'ANVISA', 'Tóxico e inflamável. Armazenar em local ventilado.', 9.00, 6, 'L', 'Armário 7 – Prateleira 3 – Posição 2', 1, 'J.T. Baker', '2024-03-14', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(22, 'Fenolftaleína 1%', 'Indicador', 'Solução alcoólica de fenolftaleína', 'moderado', 'ANVISA', 'Tóxico. Evitar contato com pele.', 13.00, 10, 'mL', 'Armário 8 – Prateleira 1 – Posição 7', 1, 'Synth', '2024-01-08', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(24, 'Verde de Bromocresol', 'Indicador', 'Indicador de pH para titulações', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 5.00, 3, 'g', 'Armário 8 – Prateleira 2 – Posição 9', 1, 'Vetec', '2024-03-18', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(25, 'Azida Sódica', 'Conservante', 'Conservante para soluções biológicas', 'alto', 'ANVISA', 'Altamente tóxico. Manipular com extremo cuidado.', 3.90, 2, 'g', 'Armário 9 – Prateleira 1 – Posição 1', 1, 'Sigma-Aldrich', '2024-01-12', NULL, '2025-09-24 13:54:36', '2025-10-22 11:35:10'),
	(26, 'DMSO Grau Analítico', 'Solvente', 'Dimetilsulfóxido grau espectroscopia', 'moderado', 'ANVISA', 'Penetra na pele rapidamente. Usar luvas adequadas.', 15.00, 10, 'L', 'Armário 9 – Prateleira 2 – Posição 4', 1, 'Merck', '2024-02-09', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(27, 'Formaldeído 37%', 'Fixador', 'Solução de formaldeído para histologia', 'alto', 'ANVISA', 'Cancerígeno conhecido. Uso exclusivo em capela.', 6.00, 4, 'L', 'Armário 9 – Prateleira 3 – Posição 7', 1, 'Dinâmica', '2024-03-22', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(28, 'Permanganato de Potássio', 'Reagente Químico', 'Sal inorgânico oxidante forte', 'alto', 'ANVISA', 'Manter longe de materiais orgânicos. Oxidante forte.', 6.00, 3, 'kg', 'Armário 10 – Prateleira 1 – Posição 2', 0, 'Synth', '2024-01-25', NULL, '2025-09-24 13:54:36', '2025-10-10 12:11:20'),
	(29, 'Brometo de Etídio', 'Corante', 'Corante para visualização de DNA', 'extremo', 'ANVISA', 'Mutagênico. Uso com equipamento de proteção completo.', 3.00, 2, 'mL', 'Armário Blindado – Prateleira 3 – Posição 5', 0, 'Invitrogen', '2024-02-28', NULL, '2025-09-24 13:54:36', '2025-10-10 14:08:34'),
	(30, 'Cloreto Férrico', 'Reagente Químico', 'Sal de ferro para síntese orgânica', 'moderado', 'ANVISA', 'Corrosivo. Evitar contato com umidade.', 1.00, 5, 'kg', 'Armário 10 – Prateleira 2 – Posição 8', 1, 'Vetec', '2024-03-05', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(31, 'Nitrato de Prata', 'Reagente Químico', 'Sal inorgânico para análises', 'alto', 'ANVISA', 'Corrosivo e tóxico. Manter em frasco âmbar.', 2.00, 5, 'g', 'Armário 11 – Prateleira 1 – Posição 3', 1, 'Sigma-Aldrich', '2024-01-30', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(32, 'Sulfato de Amônio', 'Reagente Químico', 'Sal para precipitação de proteínas', 'baixo', 'ANVISA', 'Armazenar em local seco.', 4.00, 10, 'kg', 'Armário 11 – Prateleira 2 – Posição 6', 1, 'Merck', '2024-02-14', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(33, 'EDTA 0.5M pH 8.0', 'Quelante', 'Solução de EDTA para molecular', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 3.00, 8, 'L', 'Armário 11 – Prateleira 3 – Posição 9', 1, 'Ambion', '2024-03-10', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(34, 'Glicerol P.A.', 'Reagente Químico', 'Glicerol para molecular biology', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 20.00, 15, 'L', 'Armário 12 – Prateleira 1 – Posição 5', 1, 'Sigma-Aldrich', '2024-01-17', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(35, 'Tween 20', 'Detergente', 'Detergente não iônico para biologia', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 12.00, 8, 'L', 'Armário 12 – Prateleira 2 – Posição 7', 1, 'Merck', '2024-02-24', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(36, 'SDS 10%', 'Detergente', 'Dodecil sulfato de sódio para eletroforese', 'moderado', 'ANVISA', 'Irritante. Usar máscara ao manipular pó.', 8.00, 6, 'L', 'Armário 12 – Prateleira 3 – Posição 2', 1, 'Bio-Rad', '2024-03-19', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(39, 'aa', 'base', 'aa', 'alto', 'policia-federal', 'aa', 12.00, 10, 'kg', '12', 1, 'Vitrocell', '2025-10-24', '', '2025-10-24 13:18:52', '2025-10-24 13:18:52');

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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.produto_pdfs: ~1 rows (aproximadamente)
INSERT INTO `produto_pdfs` (`id`, `id_produto`, `nome_arquivo`, `nome_original`, `caminho_arquivo`, `tamanho_arquivo`, `tipo_documento`, `descricao`, `data_upload`, `usuario_upload`) VALUES
	(3, 39, 'product-1761315371637-264408340-Boletim.pdf', 'Boletim.pdf', 'U:\\Users\\55926559839\\Desktop\\Gerenciador-de-Estoque\\public\\uploads\\product-pdfs\\product-1761315371637-264408340-Boletim.pdf', 91479, NULL, NULL, '2025-10-24 14:16:11', 'joao Carrion');

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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.usuarios: ~7 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `nome_completo`, `usuario`, `email`, `telefone`, `cpf`, `senha`, `palavra_chave`, `turma`, `foto_perfil`, `status`, `tipo`, `data_criacao`, `data_atualizacao`, `data_aprovacao`) VALUES
	(1, 'Administrador', 'admin', 'admin@empresa.com', NULL, NULL, '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', NULL, NULL, NULL, 'aprovado', 'admin', '2025-09-10 22:30:33', NULL, NULL),
	(3, 'joao Carrion', 'joao', 'joao@outlook.org.br', '18981121784', NULL, '$2b$10$ZYqEVnvQdTDnM8X36taqd.N7oZ/c8RChpVWYImD.jVMLuA8SjboyK', NULL, 'quimica2B', 'profile-1761150229350-921169363.jpg', 'aprovado', 'usuario', '2025-09-10 22:47:27', '2025-10-24 11:29:43', NULL),
	(4, 'joao', 'carrion', 'aluno@gmail.com', NULL, '222.222.222-22', '$2b$10$zPeUgETe/5PyB5B2OOoKp.4zjjSCsWztkIDzwT7VBY7V3haBQV.q2', '$2b$10$vjzCUdDCSLh1g5ZRg6YixuI6YGPqrBTQlYL2jdLo9c.UUwi2En3zO', 'quimica1A', NULL, 'aprovado', 'usuario', '2025-10-22 11:52:45', NULL, NULL),
	(5, 'aaaaaaaaaaaaaaa', 'aaa', 'carrion@gmail.com', NULL, '333.333.333-33', '$2b$10$RkxKYzWdP8YhVre8buBkS.1e8otOVC6e6IdyASLBPh.vOwG4HKZW2', '$2b$10$anfHC/DqJ0Nf.lP4h6brvujajTWAioAR6IgMtQPHz.ubudBxsXKYu', 'quimica1B', NULL, 'aprovado', 'usuario', '2025-10-22 11:54:33', NULL, NULL),
	(6, 'Carriao', 'aaaa', 'adadad@gmail.com', NULL, '33333333333', '$2b$10$OUi1UwurK./fU8cw1DEn/.J0DT6kUjHhds9LEZreTwZ8Z/uzUJZD.', '$2b$10$sXt4.szdVJ6mqSjS..TdreaDhrlqVA.wcW1y6gQbjHrQqc/5ZaFU2', 'quimica1A', NULL, 'aprovado', 'usuario', '2025-10-22 12:03:35', NULL, NULL),
	(7, 'carrionnn', 'miguelll', 'miguel@gmail.com', NULL, '44444444444', '$2b$10$c49NayWOK.yqqpbldspOAe7dnqy5TwSZgy6VIOAE59pJLhpDdiG/6', '$2b$10$APm6AmrLlKHIvH0jayoLOeVG7fUAHpXoio8uZR5qo/thbytdXNut2', 'quimica1A', NULL, 'aprovado', 'usuario', '2025-10-22 12:05:27', NULL, NULL),
	(8, 'joao1', 'joao1', 'joao1@gmail.com', NULL, '88888888888', '$2b$10$XcVhaz9wxQYDK48gUn9QseyDhL6/0SQQnlFgFJIS3NlGnqRnBr.PS', '$2b$10$A1U8ZwgvliEoEUje/gr8Iepbx2nPkF5qi/iI1bLPahGTL2KIRyLn2', 'quimica1A', NULL, 'aprovado', 'usuario', '2025-10-22 17:07:09', NULL, NULL);

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
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.vidracarias: ~6 rows (aproximadamente)
INSERT INTO `vidracarias` (`id`, `nome`, `categoria`, `capacidade`, `material`, `descricao`, `quantidade`, `estoque_minimo`, `localizacao`, `fornecedor`, `data_aquisicao`, `observacoes`, `data_criacao`, `data_atualizacao`) VALUES
	(2, 'Béquer', 'volumetrico', '250 mL', 'vidro borossilicato', '', 12, 5, 'Prateleira A1, Armário B2  ', 'Senai', '2025-10-15', '', '2025-10-15 16:39:42', '2025-10-15 18:55:13'),
	(3, 'Erlenmeyer 500ml', 'Frasco de Reação', '500ml', 'Vidro Borossilicato', 'Frasco cônico para titulações', 25, 5, 'Prateleira B2', 'LabSupply', '2024-02-10', NULL, '2025-10-15 17:04:42', '2025-10-15 17:04:42'),
	(4, 'Pipeta Graduada 10ml', 'Pipetas', '10ml', 'Vidro Sodocalcico', 'Pipeta graduada classe A', 40, 10, 'Gaveta P1', 'Precision Glass', '2024-01-20', NULL, '2025-10-15 17:04:42', '2025-10-15 17:04:42'),
	(5, 'Bureta 50ml', 'Buretas', '50ml', 'Vidro Borossilicato', 'Bureta para titulações com torneira', 7, 2, 'Prateleira C1', 'Analytical Instruments', '2024-03-05', NULL, '2025-10-15 17:04:42', '2025-10-15 19:00:58'),
	(6, 'Proveta 100ml', 'volumetrico', '100ml', 'vidro borossilicato', 'Proveta com base estável', 18, 4, 'Prateleira A1', 'LabWare Solutionss', '2024-02-28', '', '2025-10-15 17:04:42', '2025-10-15 19:16:15'),
	(7, 'Kitassato 1000ml', 'Filtração', '1000ml', 'Vidro Borossilicato', 'Frasco kitassato para filtração a vácuo', 2, 5, 'Prateleira D4', 'VacuumTech', '2024-03-15', 'ESTOQUE BAIXO - Solicitar reposição urgente', '2025-10-15 17:05:11', '2025-10-15 17:05:11');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
