// Interface para a entidade Pessoas
export interface Pessoa {
  id?: number;
  tipo: string; // VARCHAR(20) NOT NULL
  razaosocial: string; // TEXT NOT NULL
  fantasia?: string; // TEXT (opcional, pode ser null)
  documento?: string; // TEXT (opcional, pode ser null)
  ativo?: boolean; // BOOLEAN DEFAULT TRUE
  created_at?: Date; // TIMESTAMP DEFAULT now()
}

// Interface para a entidade Classificações
export interface Classificacao {
  id?: number;
  tipo: string; // VARCHAR(20) NOT NULL
  descricao: string; // TEXT NOT NULL
  ativo?: boolean; // BOOLEAN DEFAULT TRUE
  created_at?: Date; // TIMESTAMP DEFAULT now()
}

// Interface para a entidade Movimentos
export interface Movimento {
  id?: number;
  tipo: string; // VARCHAR(10) NOT NULL
  numero_notafiscal?: string; // TEXT (opcional, pode ser null)
  data_emissao?: Date; // DATE (opcional, pode ser null)
  descricao?: string; // TEXT (opcional, pode ser null)
  valor_total: number; // NUMERIC(18,2) NOT NULL
  id_fornecedorcliente?: number; // INTEGER REFERENCES pessoas(id)
  id_faturado?: number; // INTEGER REFERENCES pessoas(id)
  ativo?: boolean; // BOOLEAN DEFAULT TRUE
  created_at?: Date; // TIMESTAMP DEFAULT now()
}

// Interface para a entidade Movimento_Classificacao (tabela de relação)
export interface MovimentoClassificacao {
  id_movimento: number; // INTEGER REFERENCES movimentos(id)
  id_classificacao: number; // INTEGER REFERENCES classificacoes(id)
}

// Interface para a entidade Parcelas
export interface Parcela {
  id?: number;
  id_movimento: number; // INTEGER REFERENCES movimentos(id)
  identificacao?: string; // TEXT (opcional, pode ser null)
  data_vencimento?: Date; // DATE (opcional, pode ser null)
  valor_parcela?: number; // NUMERIC(18,2) (opcional, pode ser null)
  valor_pago?: number; // NUMERIC(18,2) DEFAULT 0
  valor_saldo?: number; // NUMERIC(18,2) (opcional, pode ser null)
  status_parcela?: string; // VARCHAR(20) DEFAULT 'ABERTA'
  created_at?: Date; // TIMESTAMP DEFAULT now()
}
