CREATE TABLE IF NOT EXISTS pessoas (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL,
  razaosocial TEXT NOT NULL,
  fantasia TEXT,
  documento TEXT,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS classificacoes (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(20) NOT NULL,
  descricao TEXT NOT NULL,
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movimentos (
  id SERIAL PRIMARY KEY,
  tipo VARCHAR(10),
  numero_notafiscal TEXT,
  data_emissao DATE,
  descricao TEXT,
  valor_total NUMERIC(18,2) NOT NULL,
  id_fornecedorcliente INTEGER REFERENCES pessoas(id),
  id_faturado INTEGER REFERENCES pessoas(id),
  ativo BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS movimento_classificacao (
  id_movimento INTEGER REFERENCES movimentos(id),
  id_classificacao INTEGER REFERENCES classificacoes(id),
  PRIMARY KEY (id_movimento, id_classificacao)
);

CREATE TABLE IF NOT EXISTS parcelas (
  id SERIAL PRIMARY KEY,
  id_movimento INTEGER REFERENCES movimentos(id),
  identificacao TEXT,
  data_vencimento DATE,
  valor_parcela NUMERIC(18,2),
  valor_pago NUMERIC(18,2) DEFAULT 0,
  valor_saldo NUMERIC(18,2),
  status_parcela VARCHAR(20) DEFAULT 'ABERTA',
  created_at TIMESTAMP DEFAULT now()
);