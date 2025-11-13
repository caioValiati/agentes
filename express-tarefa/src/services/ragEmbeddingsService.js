const { GoogleGenerativeAI } = require("@google/generative-ai");
const { Pool } = require("pg");
require("dotenv").config();

class RagEmbeddingsService {
  constructor() {
    // Inicializar provedor de IA
    this.genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const modelo = process.env.GEMINI_MODEL || "gemini-2.5-flash";
    try {
      this.model = this.genAI.getGenerativeModel({ model: modelo });
    } catch (e) {
      console.warn(
        "Aviso: falha ao inicializar modelo de IA. O serviço usará respostas resumidas locais."
      );
      this.model = null;
    }

    // Conexão com banco de dados
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

  // Gerar embeddings usando uma técnica simples com Gemini
  async gerarEmbedding(texto) {
    try {
      // Como não temos acesso direto ao embedding do Gemini, vamos criar uma representação vetorial simples
      // baseada em palavras-chave e sua frequência
      const palavras = texto.toLowerCase().split(/\s+/);
      const vetor = new Array(100).fill(0); // Vetor de 100 dimensões

      // Preencher o vetor com base nas palavras (hash simples)
      palavras.forEach((palavra) => {
        let hash = 0;
        for (let i = 0; i < palavra.length; i++) {
          hash = (hash << 5) - hash + palavra.charCodeAt(i);
          hash = hash & hash; // Converter para 32-bit integer
        }

        // Distribuir o hash no vetor
        const indice = Math.abs(hash) % 100;
        vetor[indice] += 1;
      });

      // Normalizar o vetor
      const magnitude = Math.sqrt(
        vetor.reduce((sum, val) => sum + val * val, 0)
      );
      if (magnitude > 0) {
        return vetor.map((val) => val / magnitude);
      }

      return vetor;
    } catch (error) {
      console.error("Erro ao gerar embedding:", error);
      throw error;
    }
  }

  // Calcular similaridade cosseno entre dois vetores
  calcularSimilaridadeCosseno(vetor1, vetor2) {
    if (vetor1.length !== vetor2.length) return 0;

    let produtoEscalar = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vetor1.length; i++) {
      produtoEscalar += vetor1[i] * vetor2[i];
      magnitude1 += vetor1[i] * vetor1[i];
      magnitude2 += vetor2[i] * vetor2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return produtoEscalar / (magnitude1 * magnitude2);
  }

  // Buscar dados relevantes com base na similaridade
  async buscarDadosRelevantes(pergunta, limite = 5) {
    try {
      console.log("Interpretando pergunta para gerar query dinâmica...");

      // 1️⃣ Tentar gerar uma query SQL com base na pergunta via LLM
      let queryGerada;
      try {
        if (!this.model) throw new Error("Modelo de IA não inicializado");

        const prompt = `
  Você é um assistente especializado em SQL e PostgreSQL.
  Gere uma query SQL para responder à seguinte pergunta de negócio, 
  usando apenas as tabelas e colunas abaixo (todas pertencem ao mesmo schema público).
  
  Tabelas disponíveis:
  
  Tabela: classificacoes
    - id (integer)
    - tipo (character varying)
    - descricao (text)
    - ativo (boolean)
    - created_at (timestamp)
  
  Tabela: movimento_classificacao
    - id_movimento (integer)
    - id_classificacao (integer)
  
  Tabela: movimentos
    - id (integer)
    - tipo (character varying)
    - numero_notafiscal (text)
    - data_emissao (date)
    - descricao (text)
    - valor_total (numeric)
    - id_fornecedorcliente (integer)
    - id_faturado (integer)
    - ativo (boolean)
    - created_at (timestamp)
  
  Tabela: parcelas
    - id (integer)
    - id_movimento (integer)
    - identificacao (text)
    - data_vencimento (date)
    - valor_parcela (numeric)
    - valor_pago (numeric)
    - valor_saldo (numeric)
    - status_parcela (character varying)
    - created_at (timestamp)
  
  Tabela: pessoas
    - id (integer)
    - tipo (character varying)
    - razaosocial (text)
    - fantasia (text)
    - documento (text)
    - ativo (boolean)
    - created_at (timestamp)
  
  Restrições:
  - Gere apenas SELECTs seguros (sem UPDATE, DELETE, DROP, etc).
  - Não utilize JOINS e nem aplique nenhum filtro, faça apenas um SELECT em todos os casos.
  - Retorne no máximo 50 linhas (use LIMIT 50).
  - Não inclua explicações, apenas a query SQL pura.

  Quando precisar filtrar pessoas para saber se é fornecedor ou cliente, filtre a coluna tipo por PJ e PF, PJ para fornecedor e PF para clientes.
  
  Pergunta: "${pergunta}"
        `;

        const result = await this.model.generateContent(prompt);
        const respostaIA = result.response.text().trim();

        // Extrair apenas o SQL (remove blocos de markdown se houver)
        queryGerada = respostaIA
          .replace(/```sql/gi, "")
          .replace(/```/g, "")
          .trim();

        console.log("Query SQL gerada pela IA:", queryGerada);
      } catch (e) {
        console.warn("Falha ao gerar query dinâmica com IA:", e.message);
      }

      // 2️⃣ Se a IA não gerar query válida, usar fallback padrão
      const query =
        queryGerada ||
        `
        SELECT 
          m.id as movimento_id,
          m.tipo as movimento_tipo,
          m.numero_notafiscal,
          m.data_emissao,
          m.descricao as movimento_descricao,
          m.valor_total,
          p.razaosocial as pessoa_nome,
          p.tipo as pessoa_tipo,
          p.documento as pessoa_documento,
          array_agg(c.descricao) as classificacoes
        FROM movimentos m
        JOIN pessoas p ON m.id_fornecedorcliente = p.id
        LEFT JOIN movimento_classificacao mc ON m.id = mc.id_movimento
        LEFT JOIN classificacoes c ON mc.id_classificacao = c.id
        WHERE m.ativo = true
        GROUP BY m.id, p.razaosocial, p.tipo, p.documento
        ORDER BY m.data_emissao DESC
        LIMIT 50;
        `;

      // 3️⃣ Executar a query
      const result = await this.pool.query(query);
      const registros = result.rows;

      // 4️⃣ Gerar embedding da pergunta
      const embeddingPergunta = await this.gerarEmbedding(pergunta);

      // 5️⃣ Calcular similaridade semântica entre os registros retornados e a pergunta
      const registrosComSimilaridade = [];

      for (const reg of registros) {
        const texto = Object.entries(reg)
          .map(([k, v]) => `${k}: ${v}`)
          .join(", ");

        const embeddingRegistro = await this.gerarEmbedding(texto);
        const similaridade = this.calcularSimilaridadeCosseno(
          embeddingPergunta,
          embeddingRegistro
        );

        registrosComSimilaridade.push({
          ...reg,
          texto_representativo: texto,
          similaridade,
        });
      }

      // 6️⃣ Ordenar por similaridade
      registrosComSimilaridade.sort((a, b) => b.similaridade - a.similaridade);

      // 7️⃣ Retornar os resultados
      return {
        movimentos_relevantes: registrosComSimilaridade.slice(0, limite),
        pergunta_embedding: embeddingPergunta,
        total_encontrado: registros.length,
        query_usada: query,
      };
    } catch (error) {
      console.error("Erro ao buscar dados relevantes:", error);
      throw error;
    }
  }

  async gerarRespostaComLLM(pergunta, dadosRelevantes) {
    try {
      console.log("Gerando resposta com Google Gemini...");

      if (
        !dadosRelevantes ||
        dadosRelevantes.movimentos_relevantes.length === 0
      ) {
        return "Não foram encontradas informações relevantes no banco de dados para responder à sua pergunta.";
      }

      // Construir contexto a partir dos movimentos relevantes
      const contexto = dadosRelevantes.movimentos_relevantes
        .map((mov) => JSON.stringify(mov))
        .join("\n\n");

      const prompt = `Com base nas seguintes informações encontradas no banco de dados (ordenadas por relevância baseada em similaridade semântica):

${contexto}

Responda à seguinte pergunta: ${pergunta}

Forneça uma resposta clara e objetiva em português, sintetizando as informações mais relevantes.`;

      if (!this.model) {
        throw new Error("Modelo de IA não inicializado");
      }
      console.log("Prompt para LLM:", prompt);
      const result = await this.model.generateContent(prompt);
      return result.response.text();
    } catch (error) {
      console.error("Erro ao gerar resposta:", error);
      // Fallback: gerar resposta resumida localmente sem IA
      const movimentos = dadosRelevantes?.movimentos_relevantes || [];
      if (movimentos.length === 0) {
        return "Não foram encontradas informações relevantes no banco de dados para responder à sua pergunta.";
      }
      const total = movimentos.reduce(
        (sum, m) => sum + Number(m.valor_total || 0),
        0
      );
      const linhas = movimentos.map(
        (m, idx) =>
          `${idx + 1}. ${m.movimento_tipo} - ${
            m.movimento_descricao || "Sem descrição"
          } | Pessoa: ${m.pessoa_nome} (${m.pessoa_tipo}) | Valor: R$ ${Number(
            m.valor_total || 0
          ).toFixed(2)} | Data: ${
            new Date(m.data_emissao).toISOString().split("T")[0]
          }`
      );
      return `Resumo baseado nos dados encontrados (sem geração de IA):\nPergunta: ${pergunta}\nItens mais relevantes:\n${linhas.join(
        "\n"
      )}\nTotal agregado: R$ ${total.toFixed(2)}`;
    }
  }

  async processarPergunta(pergunta) {
    try {
      console.log("Processando pergunta com RAG Embeddings:", pergunta);

      // 1. Buscar dados relevantes usando embeddings
      const dadosRelevantes = await this.buscarDadosRelevantes(pergunta);

      console.log(dadosRelevantes);

      // 2. Gerar resposta com LLM
      const respostaLLM = await this.gerarRespostaComLLM(
        pergunta,
        dadosRelevantes
      );

      return {
        sucesso: true,
        pergunta,
        resposta: respostaLLM,
        dados_relevantes: dadosRelevantes.movimentos_relevantes.map((mov) => ({
          id: mov.movimento_id,
          tipo: mov.movimento_tipo,
          descricao: mov.movimento_descricao,
          valor_total: mov.valor_total,
          data_emissao: mov.data_emissao,
          pessoa_nome: mov.pessoa_nome,
          pessoa_tipo: mov.pessoa_tipo,
          similaridade: mov.similaridade,
        })),
        total_encontrado: dadosRelevantes.total_encontrado,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Erro no processamento RAG Embeddings:", error);
      return {
        sucesso: false,
        erro: error.message,
        pergunta,
        timestamp: new Date().toISOString(),
      };
    }
  }
}

module.exports = RagEmbeddingsService;
