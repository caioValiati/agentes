import React, { useEffect, useState } from "react";
import { InvoiceData } from "@/types/invoice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  User,
  FileText,
  Calendar,
  Package,
  CreditCard,
  DollarSign,
  Tag,
} from "lucide-react";
import { getClassificacoes } from "@/services/financeiroService";

interface InvoiceResultsProps {
  data: InvoiceData;
}

const CATEGORY_LABELS: Record<string, string> = {
  INSUMOS_AGRICOLAS: "Insumos Agrícolas",
  MANUTENCAO_E_OPERACAO: "Manutenção e Operação",
  RECURSOS_HUMANOS: "Recursos Humanos",
  SERVICOS_OPERACIONAIS: "Serviços Operacionais",
  INFRAESTRUTURA_E_UTILIDADES: "Infraestrutura e Utilidades",
  ADMINISTRATIVAS: "Administrativas",
  SEGUROS_E_PROTECAO: "Seguros e Proteção",
  IMPOSTOS_E_TAXAS: "Impostos e Taxas",
  INVESTIMENTOS: "Investimentos",
};

export const InvoiceResults: React.FC<InvoiceResultsProps> = ({ data }) => {
  const [moCount, setMoCount] = useState<number | null>(null);
  const fornecedorExists = data.fornecedorId !== undefined && data.fornecedorId !== null;
  const faturadoExists = data.faturadoId !== undefined && data.faturadoId !== null;

  useEffect(() => {
    let mounted = true;
    async function fetchCounts() {
      try {
        const classificacoes = await getClassificacoes();
        const countMO = Array.isArray(classificacoes)
          ? classificacoes.filter((c: any) => c?.tipo === "MANUTENCAO_E_OPERACAO").length
          : 0;
        if (mounted) setMoCount(countMO);
      } catch (e) {
        if (mounted) setMoCount(null);
      }
    }
    fetchCounts();
    return () => {
      mounted = false;
    };
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "Não informado";
    const [year, month, day] = dateString.split("-").map(Number);
    return new Date(year, month - 1, day).toLocaleDateString("pt-BR");
  };

  const formatCNPJ = (cnpj: string) => {
    return cnpj.replace(
      /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
      "$1.$2.$3/$4-$5"
    );
  };

  const formatCPF = (cpf: string) => {
    if (!cpf) return "Não informado";
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">
          Análise da Nota Fiscal Concluída
        </h2>
        <p className="text-muted-foreground">
          Dados extraídos e classificados automaticamente
        </p>
      </div>

      {/* Main Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Info */}
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Fornecedor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={fornecedorExists ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                {fornecedorExists ? `Existe (ID ${data.fornecedorId})` : "Não existe"}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Razão Social
              </label>
              <p className="text-foreground">{data.fornecedor.razaoSocial}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nome Fantasia
              </label>
              <p className="text-foreground">
                {data.fornecedor.fantasia || "Não informado"}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                CNPJ
              </label>
              <p className="text-foreground font-mono">
                {formatCNPJ(data.fornecedor.cnpj)}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Customer Info */}
        <Card className="shadow-soft bg-gradient-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Faturado
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge className={faturadoExists ? "bg-green-600 text-white" : "bg-red-600 text-white"}>
                {faturadoExists ? `Existe (ID ${data.faturadoId})` : "Não existe"}
              </Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Nome Completo
              </label>
              <p className="text-foreground">{data.faturado.nomeCompleto}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                CPF
              </label>
              <p className="text-foreground font-mono">
                {formatCPF(data.faturado.cpfCnpj)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invoice Details */}
      <Card className="shadow-soft bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-primary" />
            Dados da Nota Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Número da NF
              </label>
              <p className="text-foreground font-semibold">
                {data.numeroNotaFiscal}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Data de Emissão
              </label>
              <p className="text-foreground">{formatDate(data.dataEmissao)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Valor Total
              </label>
              <p className="text-2xl font-bold text-success">
                {formatCurrency(data.valorTotal)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Products */}
      <Card className="shadow-soft bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Produtos/Serviços
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.produtos.map((produto, index) => (
              <div key={index} className="p-3 bg-secondary rounded-lg">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      {produto.descricao}
                    </p>
                    {produto.quantidade && (
                      <p className="text-sm text-muted-foreground">
                        Quantidade: {produto.quantidade}
                      </p>
                    )}
                  </div>
                  {produto.valorTotal && (
                    <p className="font-semibold text-foreground ml-4">
                      {formatCurrency(produto.valorTotal)}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Payment Info */}
      <Card className="shadow-soft bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5 text-primary" />
            Informações de Pagamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Quantidade de Parcelas
              </label>
              <p className="text-foreground">{data.quantidadeParcelas}x</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Data de Vencimento
              </label>
              <p className="text-foreground">
                {formatDate(data.parcelas[0]?.dataVencimento)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Expense Classification */}
      <Card className="shadow-soft bg-gradient-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5 text-primary" />
            Classificação da Despesa
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="text-lg px-3 py-1">
                {CATEGORY_LABELS[data.classificacaoDespesa.categoria]}
              </Badge>
              {(data as any).idClassificacao != null ? (
                <Badge className="bg-green-600 text-white">Despesa existe (ID {(data as any).idClassificacao})</Badge>
              ) : (
                <Badge className="bg-red-600 text-white">Despesa não existe</Badge>
              )}
              {data.classificacaoDespesa.subcategoria && (
                <Badge variant="outline">
                  {data.classificacaoDespesa.subcategoria}
                </Badge>
              )}
            </div>
            {data.classificacaoDespesa.categoria === "MANUTENCAO_E_OPERACAO" && (
              <div>
                <label className="text-sm font-medium text-muted-foreground">Contagem no banco</label>
                <p className="text-foreground mt-1">Total de classificações em "Manutenção e Operação": {moCount ?? "—"}</p>
              </div>
            )}
            <div>
              <label className="text-sm font-medium text-muted-foreground">
                Justificativa
              </label>
              <p className="text-foreground mt-1">
                {data.classificacaoDespesa.justificativa}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
