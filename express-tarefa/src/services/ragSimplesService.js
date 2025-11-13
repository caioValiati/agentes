const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pool } = require("pg");
require("dotenv").config();

class RagSimplesService {
  constructor() {
    // Inicializar provedor de IA
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelo = process.env.GEMINI_MODEL || "gemini-1.5-flash";
    try {
      this.model = this.genAI.getGenerativeModel({ model: modelo });
    } catch (e) {
      console.warn(
        "Aviso: falha ao inicializar modelo de IA. O serviço usará respostas resumidas locais."
      );
      this.model = null;
    }

    this.pool = new Pool({
      host: process.env.DB_HOST || "localhost",
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || "taskdb",
      user: process.env.DB_USER || "postgres",
      password: process.env.DB_PASSWORD || "postgres",
      ssl: {
        require: true,
        rejectUnauthorized: false,
      },
    });
  }

  async consultarBancoDeDados(pergunta) {
    try {
      // Análise simples da pergunta para determinar que tipo de consulta fazer
      const perguntaLower = pergunta.toLowerCase();

      let query = "";
      let params = [];
      let contexto = "";

      // Consultas baseadas em palavras-chave
      if (
        perguntaLower.includes("cliente") ||
        perguntaLower.includes("fornecedor")
      ) {
        query = `
                    SELECT p.tipo, p.razaosocial, p.fantasia, p.documento, p.ativo
                    FROM pessoas p
                    WHERE p.ativo = true
                    ORDER BY p.razaosocial
                    LIMIT 10
                `;
        contexto = "Informações sobre clientes e fornecedores ativos:";
      } else if (
        perguntaLower.includes("movimento") ||
        perguntaLower.includes("nota")
      ) {
        query = `
                    SELECT m.tipo, m.numero_notafiscal, m.data_emissao, m.descricao, m.valor_total,
                           p.razaosocial as fornecedor_cliente
                    FROM movimentos m
                    JOIN pessoas p ON m.id_fornecedorcliente = p.id
                    WHERE m.ativo = true
                    ORDER BY m.data_emissao DESC
                    LIMIT 10
                `;
        contexto = "Informações sobre movimentos e notas fiscais:";
      } else if (
        perguntaLower.includes("parcela") ||
        perguntaLower.includes("pagamento")
      ) {
        query = `
                    SELECT p.identificacao, p.data_vencimento, p.valor_parcela, p.valor_pago, p.valor_saldo, p.status_parcela,
                           m.numero_notafiscal, m.descricao
                    FROM parcelas p
                    JOIN movimentos m ON p.id_movimento = m.id
                    ORDER BY p.data_vencimento
                    LIMIT 10
                `;
        contexto = "Informações sobre parcelas e pagamentos:";
      } else if (
        perguntaLower.includes("classificação") ||
        perguntaLower.includes("categoria")
      ) {
        query = `
                    SELECT c.tipo, c.descricao, c.ativo
                    FROM classificacoes c
                    WHERE c.ativo = true
                    ORDER BY c.tipo, c.descricao
                `;
        contexto = "Informações sobre classificações e categorias:";
      } else {
        // Consulta geral de vendas/compras
        query = `
                    SELECT m.tipo, COUNT(*) as quantidade, SUM(m.valor_total) as valor_total
                    FROM movimentos m
                    WHERE m.ativo = true
                    GROUP BY m.tipo
                `;
        contexto = "Resumo geral de movimentos:";
      }

      const result = await this.pool.query(query, params);

      return {
        contexto,
        dados: result.rows,
        total_registros: result.rows.length,
      };
    } catch (error) {
      console.error("Erro ao consultar banco de dados:", error);
      throw new Error("Erro ao consultar banco de dados: " + error.message);
    }
  }

  async gerarRespostaComLLM(pergunta, dadosConsultados) {
    try {
      console.log("Gerando resposta com IA...");

      if (!dadosConsultados || Object.keys(dadosConsultados).length === 0) {
        return "Não foram encontradas informações relevantes no banco de dados para responder à sua pergunta.";
      }
      const contexto = dadosConsultados.contexto;
      const dados = dadosConsultados.dados || [];
      const total = dadosConsultados.total_registros ?? dados.length;

      const prompt =
        `Com base nas seguintes informações consultadas no banco de dados:\n\n` +
        `Contexto: ${contexto}\n` +
        `Total de registros encontrados: ${total}\n\n` +
        `Registros (formato JSON):\n${JSON.stringify(dados, null, 2)}\n\n` +
        `Pergunta: ${pergunta}\n\n` +
        `Forneça uma resposta clara e objetiva em português, resumindo as informações mais relevantes.`;

      if (!this.model) {
        throw new Error("Modelo de IA não inicializado");
      }
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Erro ao gerar resposta com IA:", error);
      // Fallback para resposta baseada nos dados consultados
      const dados = dadosConsultados?.dados || [];
      if (!dados.length) {
        return "Não foram encontradas informações relevantes no banco de dados para responder à sua pergunta.";
      }
      const linhas = dados.slice(0, 5).map((d, idx) => {
        const tipo = d.tipo || d.movimento_tipo || d.pessoa_tipo || "N/A";
        const desc =
          d.descricao ||
          d.movimento_descricao ||
          d.identificacao ||
          d.numero_notafiscal ||
          "Sem descrição";
        const valor = d.valor_total ?? d.valor_parcela ?? 0;
        const valorFmt = valor ? `R$ ${Number(valor).toFixed(2)}` : "";
        const data = d.data_emissao || d.data_vencimento || "";
        return `${idx + 1}. ${tipo} - ${desc}${
          valorFmt ? " | Valor: " + valorFmt : ""
        }${data ? " | Data: " + data : ""}`;
      });
      const totalValor = dados.reduce(
        (sum, d) => sum + Number(d.valor_total ?? d.valor_parcela ?? 0),
        0
      );
      const totalLinha = totalValor
        ? `\nTotal agregado: R$ ${totalValor.toFixed(2)}`
        : "";
      return `Resumo baseado nos dados encontrados (sem geração de IA):\nContexto: ${
        dadosConsultados?.contexto
      }\nPergunta: ${pergunta}\nItens:\n${linhas.join("\n")}${totalLinha}`;
    }
  }

  async processarPergunta(pergunta) {
    try {
      console.log("Processando pergunta com RAG Simples:", pergunta);

      // 1. Consultar banco de dados
      const dadosDoBanco = await this.consultarBancoDeDados(pergunta);

      // 2. Gerar resposta com LLM
      const respostaLLM = await this.gerarRespostaComLLM(
        pergunta,
        dadosDoBanco
      );

      return {
        sucesso: true,
        pergunta,
        resposta: respostaLLM,
        dados_consultados: dadosDoBanco,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro no processamento RAG Simples:", error);
      return {
        sucesso: false,
        erro: error.message,
        pergunta,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = RagSimplesService;
