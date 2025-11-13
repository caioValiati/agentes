export interface Supplier {
  razaoSocial: string;
  fantasia: string;
  cnpj: string;
}

export interface Customer {
  nomeCompleto: string;
  cpfCnpj: string;
}

export interface Product {
  descricao: string;
  quantidade?: number;
  valorUnitario?: number;
  valorTotal?: number;
}

export interface Installment {
  numero: number;
  dataVencimento: string;
  valor: number;
}

export type ExpenseCategory =
  | "INSUMOS_AGRICOLAS"
  | "MANUTENCAO_E_OPERACAO"
  | "RECURSOS_HUMANOS"
  | "SERVICOS_OPERACIONAIS"
  | "INFRAESTRUTURA_E_UTILIDADES"
  | "ADMINISTRATIVAS"
  | "SEGUROS_E_PROTECAO"
  | "IMPOSTOS_E_TAXAS"
  | "INVESTIMENTOS";

export interface ExpenseClassification {
  categoria: ExpenseCategory;
  subcategoria?: string;
  justificativa: string;
}

export interface InvoiceData {
  fornecedor: Supplier;
  faturado: Customer;
  numeroNotaFiscal: string;
  dataEmissao: string;
  produtos: Product[];
  quantidadeParcelas: number;
  parcelas: Installment[];
  valorTotal: number;
  classificacaoDespesa: ExpenseClassification;
  fornecedorId: number;
  faturadoId: number;
  idClassificacao: number;
  idMovimento: number;
}
