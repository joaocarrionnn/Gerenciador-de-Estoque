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
) ENGINE=InnoDB AUTO_INCREMENT=48 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.movimentacoes: ~14 rows (aproximadamente)
INSERT INTO `movimentacoes` (`id_movimentacao`, `id_produto`, `tipo`, `quantidade`, `unidade_medida`, `responsavel`, `projeto_experimento`, `observacoes`, `data_movimentacao`) VALUES
	(2, 19, 'entrada', 5.00, 'L', 'Policate', 'Fornecedor: Senai', 'Entrada registrada por Policate. Data de compra: 2025-10-08', '2025-10-08 11:46:39'),
	(3, 19, 'saida', 5.00, 'L', 'Policate', 'Químico', 'Saída registrada por Policate', '2025-10-08 11:47:17'),
	(4, 19, 'entrada', 1.00, 'L', 'aa', 'Fornecedor: aaa', 'aa', '2025-10-08 11:51:45'),
	(6, 19, 'entrada', 1.00, 'L', 'aa', 'Fornecedor: aa', 'aaa', '2025-10-08 11:53:58'),
	(7, 19, 'entrada', 1.00, 'L', 'aa', 'Fornecedor: aa', 'a', '2025-10-08 11:55:47'),
	(13, 19, 'saida', 1.00, 'L', 'aaa', 'aaa', 'aa', '2025-10-08 12:03:04'),
	(22, 17, 'saida', 2.00, 'g', 'aa', 'aa', 'aa', '2025-10-08 13:30:04'),
	(26, 13, 'saida', 2.00, 'L', 'Carrion', 'Faze Agua', 'Saída registrada por Carrion', '2025-10-08 16:58:22'),
	(27, 13, 'entrada', 2.00, 'L', 'Carrion', 'Fornecedor: SEnai', 'Entrada registrada por Carrion. Data de compra: 2025-10-08', '2025-10-08 16:59:22'),
	(28, 19, 'entrada', 1.00, 'L', 'carriao', 'Fornecedor: senai', 'Entrada registrada por carriao. ', '2025-10-10 12:10:16'),
	(29, 28, 'entrada', 1.00, 'kg', 'carriao', 'Fornecedor: senai', 'Entrada registrada por carriao. ', '2025-10-10 12:10:49'),
	(30, 28, 'entrada', 5.00, 'kg', 'car', 'Fornecedor: car', 'Entrada registrada por car. Data de compra: 2025-10-10', '2025-10-10 12:11:20'),
	(31, 17, 'entrada', 11.00, 'g', 'car', 'Fornecedor: car', 'Entrada registrada por car. ', '2025-10-10 12:11:58'),
	(32, 16, 'entrada', 10.10, 'g', 'aa', 'Fornecedor: aa', 'Entrada registrada por aa. ', '2025-10-10 14:01:35'),
	(33, 29, 'entrada', 3.00, 'mL', 'a', 'Fornecedor: aa', 'Entrada registrada por a. ', '2025-10-10 14:08:34'),
	(34, 9, 'saida', 8.00, 'L', 'aa', 'aa', 'Saída registrada por aa', '2025-10-10 14:09:42'),
	(35, 25, 'saida', 1.00, 'g', 'a', '', 'Saída registrada por a', '2025-10-10 16:13:06');

-- Copiando estrutura para tabela sistema_estoque.produtos
CREATE TABLE IF NOT EXISTS `produtos` (
  `id_produto` int(11) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `tipo` varchar(50) NOT NULL,
  `descricao` text DEFAULT NULL,
  `grau_periculosidade` varchar(20) DEFAULT NULL,
  `orgao_regulador` varchar(50) DEFAULT NULL,
  `instrucoes_seguranca` text DEFAULT NULL,
  `quantidade` int(11) NOT NULL DEFAULT 0,
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
) ENGINE=InnoDB AUTO_INCREMENT=38 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.produtos: ~31 rows (aproximadamente)
INSERT INTO `produtos` (`id_produto`, `nome`, `tipo`, `descricao`, `grau_periculosidade`, `orgao_regulador`, `instrucoes_seguranca`, `quantidade`, `estoque_minimo`, `unidade_medida`, `localizacao`, `disponivel`, `fornecedor`, `data_aquisicao`, `observacoes`, `data_criacao`, `data_atualizacao`) VALUES
	(2, 'Hidróxido de Sódio', 'base', 'NaOH - 1kg', '', 'policia-federal', '', 10, 0, 'unidade', 'Prateleira B2', 1, '', '0000-00-00', '', '2025-09-19 13:47:38', '2025-09-24 11:21:54'),
	(5, 'Hidróxido de Sódio P.A.', 'Reagente Químico', 'Hidróxido de sódio em péletes 99%', 'alto', 'ANVISA', 'Evitar contato com água. Usar equipamento de proteção completo.', 12, 8, 'kg', 'Armário 3 – Prateleira 1 – Posição 8', 1, 'Merck', '2024-02-20', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(6, 'Sulfato de Cobre II', 'Reagente Químico', 'Sulfato de cobre penta-hidratado', 'moderado', 'ANVISA', 'Tóxico se ingerido. Lavar as mãos após o uso.', 3, 2, 'kg', 'Armário 2 – Prateleira 3 – Posição 12', 1, 'Vetec', '2024-03-10', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(7, 'Tampão Fosfato pH 7.4', 'Solução Tampão', 'Tampão fosfato salino 10x concentrado', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 10, 10, 'L', 'Armário 1 – Prateleira 4 – Posição 5', 1, 'Invitrogen', '2024-01-30', NULL, '2025-09-24 13:54:36', '2025-10-08 11:38:34'),
	(8, 'Solução de Lugol', 'Reagente Químico', 'Solução de iodo e iodeto de potássio', 'moderado', 'ANVISA', 'Evitar contato com metais. Manter em frasco âmbar.', 6, 4, 'L', 'Armário 4 – Prateleira 1 – Posição 3', 1, 'Dinâmica', '2024-02-14', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(9, 'Azul de Metileno 1%', 'Corante', 'Solução de azul de metileno para histologia', 'baixo', 'ANVISA', 'Manter longe de luz direta.', 1, 6, 'L', 'Armário 5 – Prateleira 2 – Posição 7', 1, 'Synth', '2024-03-05', NULL, '2025-09-24 13:54:36', '2025-10-10 14:09:42'),
	(10, 'Tripsina 0.25%', 'Enzima', 'Tripsina para cultura celular', 'baixo', 'ANVISA', 'Armazenar a -20°C. Evitar ciclos de congelamento.', 25, 15, 'mL', 'Freezer 2 – Prateleira 1 – Posição 4', 1, 'Gibco', '2024-01-22', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(11, 'DNA Polimerase Taq', 'Enzima', 'Enzima para PCR termoestável', 'baixo', 'ANVISA', 'Armazenar a -20°C. Manter em gelo durante o uso.', 18, 12, 'U', 'Freezer 1 – Prateleira 3 – Posição 9', 1, 'Thermo Fisher', '2024-02-28', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(13, 'DMEM Alto Glucose', 'Meio de Cultura', 'Meio Dulbecco Modified Eagle Medium', 'baixo', 'ANVISA', 'Armazenar refrigerado. Proteger da luz.', 22, 15, 'L', 'Geladeira 1 – Prateleira 4 – Posição 11', 1, 'Cultilab', '2024-01-18', NULL, '2025-09-24 13:54:36', '2025-10-08 16:59:22'),
	(15, 'RPMI 1640', 'Meio de Cultura', 'Meio para cultivo de células hematopoiéticas', 'baixo', 'ANVISA', 'Armazenar a 4°C. Completar com soro.', 17, 12, 'L', 'Geladeira 2 – Prateleira 1 – Posição 3', 1, 'Vitrocell', '2024-03-08', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(16, 'Cianeto de Potássio', 'Reagente Químico', 'Sal inorgânico altamente tóxico', 'extremo', 'ANVISA', 'Uso exclusivo em capela com sistema exaustor. Equipamento completo obrigatório.', 11, 1, 'g', 'Armário Blindado – Prateleira 1 – Posição 1', 1, 'Sigma-Aldrich', '2024-01-05', NULL, '2025-09-24 13:54:36', '2025-10-10 14:01:35'),
	(17, 'Cloreto de Mercúrio II', 'Reagente Químico', 'Composto de mercúrio altamente tóxico', 'extremo', 'ANVISA', 'Manipular em capela química. Descarte específico obrigatório.', 11, 1, 'g', 'Armário Blindado – Prateleira 1 – Posição 2', 1, 'Merck', '2024-02-12', NULL, '2025-09-24 13:54:36', '2025-10-10 12:11:58'),
	(18, 'Benzopireno', 'Composto Orgânico', 'Hidrocarboneto policíclico cancerígeno', 'extremo', 'ANVISA', 'Uso com equipamento de proteção respiratória. Capela obrigatória.', 1, 1, 'g', 'Armário Blindado – Prateleira 2 – Posição 1', 1, 'Sigma-Aldrich', '2024-03-01', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(19, 'Acetoneta P.A.', 'Solvente', 'Acetoneta grau HPLC 99.9%', 'alto', 'ANVISA', 'Altamente inflamável. Trabalhar em área ventilada.', 9, 8, 'L', 'Armário 7 – Prateleira 1 – Posição 4', 1, 'Tedia', '2024-01-28', NULL, '2025-09-24 13:54:36', '2025-10-10 12:10:16'),
	(20, 'Clorofórmio P.A.', 'Solvente', 'Clorofórmio estabilizado com etanol', 'alto', 'ANVISA', 'Cancerígeno suspeito. Usar em capela com exaustor.', 7, 5, 'L', 'Armário 7 – Prateleira 2 – Posição 6', 1, 'Cromato', '2024-02-16', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(21, 'Metanol HPLC', 'Solvente', 'Metanol grau cromatografia líquida', 'alto', 'ANVISA', 'Tóxico e inflamável. Armazenar em local ventilado.', 9, 6, 'L', 'Armário 7 – Prateleira 3 – Posição 2', 1, 'J.T. Baker', '2024-03-14', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(22, 'Fenolftaleína 1%', 'Indicador', 'Solução alcoólica de fenolftaleína', 'moderado', 'ANVISA', 'Tóxico. Evitar contato com pele.', 13, 10, 'mL', 'Armário 8 – Prateleira 1 – Posição 7', 1, 'Synth', '2024-01-08', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(23, 'Padrão de Glicose', 'Padrão Analítico', 'Solução padrão de glicose 1000 mg/dL', 'baixo', 'INMETRO', 'Armazenar refrigerado. Estável por 6 meses.', 8, 5, 'mL', 'Geladeira 4 – Prateleira 3 – Posição 5', 1, 'Labtest', '2024-02-22', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(24, 'Verde de Bromocresol', 'Indicador', 'Indicador de pH para titulações', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 5, 3, 'g', 'Armário 8 – Prateleira 2 – Posição 9', 1, 'Vetec', '2024-03-18', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(25, 'Azida Sódica', 'Conservante', 'Conservante para soluções biológicas', 'alto', 'ANVISA', 'Altamente tóxico. Manipular com extremo cuidado.', 3, 2, 'g', 'Armário 9 – Prateleira 1 – Posição 1', 1, 'Sigma-Aldrich', '2024-01-12', NULL, '2025-09-24 13:54:36', '2025-10-10 16:13:06'),
	(26, 'DMSO Grau Analítico', 'Solvente', 'Dimetilsulfóxido grau espectroscopia', 'moderado', 'ANVISA', 'Penetra na pele rapidamente. Usar luvas adequadas.', 15, 10, 'L', 'Armário 9 – Prateleira 2 – Posição 4', 1, 'Merck', '2024-02-09', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(27, 'Formaldeído 37%', 'Fixador', 'Solução de formaldeído para histologia', 'alto', 'ANVISA', 'Cancerígeno conhecido. Uso exclusivo em capela.', 6, 4, 'L', 'Armário 9 – Prateleira 3 – Posição 7', 1, 'Dinâmica', '2024-03-22', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(28, 'Permanganato de Potássio', 'Reagente Químico', 'Sal inorgânico oxidante forte', 'alto', 'ANVISA', 'Manter longe de materiais orgânicos. Oxidante forte.', 6, 3, 'kg', 'Armário 10 – Prateleira 1 – Posição 2', 0, 'Synth', '2024-01-25', NULL, '2025-09-24 13:54:36', '2025-10-10 12:11:20'),
	(29, 'Brometo de Etídio', 'Corante', 'Corante para visualização de DNA', 'extremo', 'ANVISA', 'Mutagênico. Uso com equipamento de proteção completo.', 3, 2, 'mL', 'Armário Blindado – Prateleira 3 – Posição 5', 0, 'Invitrogen', '2024-02-28', NULL, '2025-09-24 13:54:36', '2025-10-10 14:08:34'),
	(30, 'Cloreto Férrico', 'Reagente Químico', 'Sal de ferro para síntese orgânica', 'moderado', 'ANVISA', 'Corrosivo. Evitar contato com umidade.', 1, 5, 'kg', 'Armário 10 – Prateleira 2 – Posição 8', 1, 'Vetec', '2024-03-05', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(31, 'Nitrato de Prata', 'Reagente Químico', 'Sal inorgânico para análises', 'alto', 'ANVISA', 'Corrosivo e tóxico. Manter em frasco âmbar.', 2, 5, 'g', 'Armário 11 – Prateleira 1 – Posição 3', 1, 'Sigma-Aldrich', '2024-01-30', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(32, 'Sulfato de Amônio', 'Reagente Químico', 'Sal para precipitação de proteínas', 'baixo', 'ANVISA', 'Armazenar em local seco.', 4, 10, 'kg', 'Armário 11 – Prateleira 2 – Posição 6', 1, 'Merck', '2024-02-14', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(33, 'EDTA 0.5M pH 8.0', 'Quelante', 'Solução de EDTA para molecular', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 3, 8, 'L', 'Armário 11 – Prateleira 3 – Posição 9', 1, 'Ambion', '2024-03-10', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(34, 'Glicerol P.A.', 'Reagente Químico', 'Glicerol para molecular biology', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 20, 15, 'L', 'Armário 12 – Prateleira 1 – Posição 5', 1, 'Sigma-Aldrich', '2024-01-17', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(35, 'Tween 20', 'Detergente', 'Detergente não iônico para biologia', 'baixo', 'ANVISA', 'Armazenar em temperatura ambiente.', 12, 8, 'L', 'Armário 12 – Prateleira 2 – Posição 7', 1, 'Merck', '2024-02-24', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36'),
	(36, 'SDS 10%', 'Detergente', 'Dodecil sulfato de sódio para eletroforese', 'moderado', 'ANVISA', 'Irritante. Usar máscara ao manipular pó.', 8, 6, 'L', 'Armário 12 – Prateleira 3 – Posição 2', 1, 'Bio-Rad', '2024-03-19', NULL, '2025-09-24 13:54:36', '2025-09-24 13:54:36');

-- Copiando estrutura para tabela sistema_estoque.usuarios
CREATE TABLE IF NOT EXISTS `usuarios` (
  `id_usuario` int(11) NOT NULL AUTO_INCREMENT,
  `nome_completo` varchar(100) NOT NULL,
  `usuario` varchar(50) NOT NULL,
  `email` varchar(100) NOT NULL,
  `senha` varchar(255) NOT NULL,
  `departamento` varchar(50) NOT NULL,
  `justificativa` text NOT NULL,
  `status` enum('pendente','aprovado','rejeitado') DEFAULT 'pendente',
  `tipo` enum('admin','usuario') DEFAULT 'usuario',
  `data_criacao` timestamp NOT NULL DEFAULT current_timestamp(),
  `data_aprovacao` timestamp NULL DEFAULT NULL,
  PRIMARY KEY (`id_usuario`),
  UNIQUE KEY `usuario` (`usuario`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Copiando dados para a tabela sistema_estoque.usuarios: ~2 rows (aproximadamente)
INSERT INTO `usuarios` (`id_usuario`, `nome_completo`, `usuario`, `email`, `senha`, `departamento`, `justificativa`, `status`, `tipo`, `data_criacao`, `data_aprovacao`) VALUES
	(1, 'Administrador', 'admin', 'admin@empresa.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'administrativo', 'Usuário administrador do sistema', 'aprovado', 'admin', '2025-09-10 22:30:33', NULL),
	(3, 'joao', 'joao', 'joao@23', '$2b$10$E0Z.F69I9ap0StjiN25Y4eXp4tuQjquHxZ1kZwfpIfkk9Vzt7PKD6', 'laboratorio', 'jao', 'aprovado', 'usuario', '2025-09-10 22:47:27', NULL);

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
	(1, 'Balão Volumétrico', 12, '250 mL', 'Vidro borossilicato', 'Volumétrico', 'Armário A - Prateleira 1', 'disponivel', 'Sigma-Aldrich', '2024-01-15', 'Precisão classe A', '2025-10-03 19:04:17', '2025-10-03 19:04:17'),
	(2, 'Béquer', 25, '500 mL', 'Vidro temperado', 'Utilidade geral', 'Armário B - Prateleira 2', 'disponivel', 'Vetec', '2024-02-20', 'Para uso geral', '2025-10-03 19:04:17', '2025-10-03 19:04:17'),
	(3, 'Erlenmeyer', 18, '250 mL', 'Vidro borossilicato', 'Aquecimento', 'Armário A - Prateleira 3', 'disponivel', 'Merck', '2024-01-30', 'Resistente ao calor', '2025-10-03 19:04:17', '2025-10-03 19:04:17'),
	(4, 'Pipeta Graduada', 3, '10 mL', 'Vidro borossilicato', 'Medição', 'Armário C - Prateleira 1', 'baixo_estoque', 'Sigma-Aldrich', '2024-03-10', 'Precisão ±0.02 mL', '2025-10-03 19:04:17', '2025-10-03 19:04:17'),
	(5, 'Bureta', 8, '50 mL', 'Vidro borossilicato', 'Titulação', 'Armário B - Prateleira 1', 'disponivel', 'Vetec', '2024-02-15', 'Com torneira de vidro', '2025-10-03 19:04:17', '2025-10-03 19:04:17'),
	(6, 'Condensador de Liebig', 0, '300 mm', 'Vidro borossilicato', 'Destilação', 'Armário D - Prateleira 2', 'indisponivel', 'Merck', '2024-01-25', 'Precisa repor estoque', '2025-10-03 19:04:17', '2025-10-03 19:04:17'),
	(7, 'Funil de Separação', 5, '250 mL', 'Vidro borossilicato', 'Separação', 'Armário C - Prateleira 2', 'disponivel', 'Sigma-Aldrich', '2024-03-05', 'Com torneja de Teflon', '2025-10-03 19:04:17', '2025-10-03 19:04:17'),
	(8, 'Proveta', 2, '100 mL', 'Vidro borossilicato', 'Medição', 'Armário A - Prateleira 2', 'baixo_estoque', 'Vetec', '2024-02-28', 'Precisão ±1%', '2025-10-03 19:04:17', '2025-10-03 19:04:17');

/*!40103 SET TIME_ZONE=IFNULL(@OLD_TIME_ZONE, 'system') */;
/*!40101 SET SQL_MODE=IFNULL(@OLD_SQL_MODE, '') */;
/*!40014 SET FOREIGN_KEY_CHECKS=IFNULL(@OLD_FOREIGN_KEY_CHECKS, 1) */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40111 SET SQL_NOTES=IFNULL(@OLD_SQL_NOTES, 1) */;
