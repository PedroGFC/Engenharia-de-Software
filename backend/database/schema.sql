-- ===================================================================
-- 1) Criação do banco / uso do banco
-- ===================================================================
CREATE DATABASE IF NOT EXISTS site_voluntariado;
USE site_voluntariado;

-- ===================================================================
-- 2) Tabela de ONGs
--    - id       (PK, AUTO_INCREMENT)
--    - nome     (UNIQUE, NOT NULL)
--    - endereco (NULL permitido)
-- ===================================================================
CREATE TABLE IF NOT EXISTS ongs (
    id       INT AUTO_INCREMENT PRIMARY KEY,
    nome     VARCHAR(100) NOT NULL UNIQUE,
    endereco VARCHAR(100)
);

-- ===================================================================
-- 3) Tabela de Oportunidades
--    - id           (PK, AUTO_INCREMENT)
--    - data_pub     (DATETIME, default CURRENT_TIMESTAMP)
--    - titulo       (NOT NULL)
--    - descricao    (NOT NULL)
--    - ong_id       (FK → ongs.id, NOT NULL)
--    - ong_nome     (duplicado para histórico, NOT NULL)
-- ===================================================================
CREATE TABLE IF NOT EXISTS oportunidades (
    id          INT AUTO_INCREMENT PRIMARY KEY,
    data_pub    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    titulo      VARCHAR(100) NOT NULL,
    descricao   TEXT         NOT NULL,
    ong_id      INT          NOT NULL,
    ong_nome    VARCHAR(100) NOT NULL,
    CONSTRAINT fk_oportunidade_ong
      FOREIGN KEY (ong_id)
      REFERENCES ongs(id)
      ON DELETE CASCADE
);

-- ===================================================================
-- 4) Tabela de Voluntários
--    - id         (PK, AUTO_INCREMENT)
--    - nome       (NOT NULL)
--    - nascimento (DATE, NULL)
--    - cpf        (VARCHAR(11), NOT NULL UNIQUE)
--    - mensagem   (TEXT, NULL)
-- ===================================================================
CREATE TABLE IF NOT EXISTS voluntarios (
    id         INT AUTO_INCREMENT PRIMARY KEY,
    nome       VARCHAR(100) NOT NULL,
    nascimento DATE NOT NULL,
    cpf        VARCHAR(11) NOT NULL UNIQUE,
    mensagem   TEXT
);

-- ===================================================================
-- 5) Tabela de Inscrições
--    - id               (PK, AUTO_INCREMENT)
--    - voluntario_id    (FK → voluntarios.id, NOT NULL)
--    - voluntario_nome  (duplicado para histórico, NOT NULL)
--    - oportunidade_id  (FK → oportunidades.id, NOT NULL)
--    - data_inscricao   (DATETIME, default CURRENT_TIMESTAMP, NOT NULL)
--    - status           (ENUM: 'pendente'|'aprovado'|'rejeitado', default 'pendente')
-- ===================================================================
CREATE TABLE IF NOT EXISTS inscricoes (
    id               INT AUTO_INCREMENT PRIMARY KEY,
    voluntario_id    INT          NOT NULL,
    oportunidade_id  INT          NOT NULL,
    data_inscricao   DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status           ENUM('pendente','aprovado','rejeitado') NOT NULL DEFAULT 'pendente',
    CONSTRAINT fk_inscricao_voluntario
      FOREIGN KEY (voluntario_id)
      REFERENCES voluntarios(id)
      ON DELETE CASCADE,
    CONSTRAINT fk_inscricao_oportunidade
      FOREIGN KEY (oportunidade_id)
      REFERENCES oportunidades(id)
      ON DELETE CASCADE
);

-- ===================================================================
-- 6) Dados de exemplo para testes iniciais
--    (1 ONG, 1 oportunidade, 1 voluntário, 1 inscrição)
-- ===================================================================
INSERT INTO ongs (nome, endereco) 
VALUES ('Teste ONG', 'Rua Exemplo, 123')
  ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id);

INSERT INTO oportunidades (titulo, descricao, ong_id, ong_nome)
VALUES (
  'Oportunidade de Voluntariado',
  'Ajude a nossa ONG com atividades sociais!',
  1,
  'Teste ONG'
);


INSERT INTO inscricoes (voluntario_id, oportunidade_id)
VALUES (1, 1);


-- 7) Usuários (login básico)
CREATE TABLE IF NOT EXISTS usuarios (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nome VARCHAR(100) NOT NULL,
  email VARCHAR(120) NOT NULL UNIQUE,
  senha_hash VARCHAR(255) NOT NULL,
  role ENUM('volunteer','ngo') NOT NULL,
  cnpj VARCHAR(18),
  criado_em DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);



-- FIM DO SCHEMA
