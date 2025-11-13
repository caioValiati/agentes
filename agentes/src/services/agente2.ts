import { GoogleGenerativeAI } from "@google/generative-ai";
import { Movimento } from "../types/typ";
import { InvoiceData } from "../types/invoice";
import api from "./api";
import { getPessoas } from "./financeiroService";

const tools = [
  {
    functionDeclarations: [
      {
        name: "get_pessoas",
        description:
          "Retrieve the list of all registered pessoas to check for existing suppliers or customers.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: [],
        },
      },
      {
        name: "create_pessoa",
        description:
          "Create a new pessoa (supplier or customer) if not already registered. Use type 'PJ' for suppliers and 'PF' or 'PJ' for customers based on cpfCnpj length.",
        parameters: {
          type: "OBJECT",
          properties: {
            tipo: {
              type: "STRING",
              description:
                "Type of pessoa: 'PF' for physical person, 'PJ' for juridical person.",
              enum: ["PF", "PJ"],
            },
            razaosocial: {
              type: "STRING",
              description: "Razao social (for PJ and PF).",
            },
            fantasia: {
              type: "STRING",
              description: "Nome fantasia (for PJ).",
            },
            documento: {
              type: "STRING",
              description: "CPF or CNPJ.",
            },
          },
          required: ["tipo", "documento"],
        },
      },
      {
        name: "get_classificacoes",
        description:
          "Retrieve the list of all registered classificacoes to check for existing expense classification.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: [],
        },
      },
      {
        name: "create_classificacao",
        description: "Create a new classificacao if not already registered.",
        parameters: {
          type: "OBJECT",
          properties: {
            tipo: {
              type: "STRING",
              description: "Category of the expense.",
              enum: [
                "INSUMOS_AGRICOLAS",
                "MANUTENCAO_E_OPERACAO",
                "RECURSOS_HUMANOS",
                "SERVICOS_OPERACIONAIS",
                "INFRAESTRUTURA_E_UTILIDADES",
                "ADMINISTRATIVAS",
                "SEGUROS_E_PROTECAO",
                "IMPOSTOS_E_TAXAS",
                "INVESTIMENTOS",
              ],
            },
            descricao: {
              type: "STRING",
              description: "Descriptions of the expense.",
            },
          },
          required: ["descricao", "tipo"],
        },
      },
      {
        name: "create_movimento",
        description:
          "Always create a new movimento with the provided details, using the IDs of pessoa and classificacao.",
        parameters: {
          type: "OBJECT",
          properties: {
            idFornecedor: {
              type: "NUMBER",
              description: "ID of the supplier pessoa.",
            },
            idFaturado: {
              type: "NUMBER",
              description: "ID of the customer pessoa.",
            },
            numeroNotaFiscal: {
              type: "STRING",
              description: "Invoice number.",
            },
            dataEmissao: {
              type: "STRING",
              description: "Emission date.",
            },
            produtos: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  descricao: { type: "STRING" },
                  quantidade: { type: "NUMBER" },
                  valorUnitario: { type: "NUMBER" },
                  valorTotal: { type: "NUMBER" },
                },
              },
              description: "List of products.",
            },
            quantidadeParcelas: {
              type: "NUMBER",
              description: "Number of installments.",
            },
            parcelas: {
              type: "ARRAY",
              items: {
                type: "OBJECT",
                properties: {
                  numero: { type: "NUMBER" },
                  dataVencimento: { type: "STRING" },
                  valor: { type: "NUMBER" },
                },
              },
              description: "List of installments.",
            },
            valorTotal: {
              type: "NUMBER",
              description: "Total value.",
            },
            idClassificacao: {
              type: "NUMBER",
              description: "ID of the classification.",
            },
          },
          required: [
            "idFornecedor",
            "idFaturado",
            "numeroNotaFiscal",
            "dataEmissao",
            "produtos",
            "quantidadeParcelas",
            "parcelas",
            "valorTotal",
            "idClassificacao",
          ],
        },
      },
    ],
  },
];

export interface ApiCallPlan {
  calls: Array<{
    endpoint: string;
    method: "GET" | "POST";
    data?: undefined;
    description: string;
  }>;
  ids: {
    fornecedorId?: number;
    faturadoId?: number;
    classificacaoId?: number;
  };
  finalMovimentoData?: Partial<Movimento>;
}

export async function processInvoiceWithGeminiAgent(
  data: InvoiceData
): Promise<ApiCallPlan> {
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY!);

  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `
      You are an AI agent that analyzes NF-e invoice data and creates a PLAN of API calls to process it.
      
      YOUR TASK: Do NOT execute any API calls. Instead, return a JSON object with the exact sequence of API calls needed.
      
      STEPS TO FOLLOW:
      1. For SUPPLIER (fornecedor):
         - First call: GET /pessoas
         - Check if exists by CNPJ. If yes, note ID. If not, plan POST /pessoas with {tipo: 'PJ', razaoSocial, fantasia, cnpj}
      
      2. For CUSTOMER (faturado):
         - If pessoas list not fetched yet, call GET /pessoas
         - Check if exists by documento. Determine tipo ('PF' if 11 digits, 'PJ' if 14 digits)
         - If not exists, plan POST /pessoas with {tipo, fantasia, documento}
      
      3. For CLASSIFICATION:
         - Call GET /classificacoes
         - Check if exact match exists (categoria + subcategoria + justificativa)
         - If not, plan POST /classificacoes with {categoria, subcategoria, justificativa}
      
      4. Always plan: POST /movimentos with collected IDs and invoice data
      
      OUTPUT FORMAT - EXACTLY:
      {
        "calls": [
          {
            "endpoint": "/pessoas",
            "method": "GET",
            "data": null,
            "description": "Fetch existing pessoas"
          },
          {
            "endpoint": "/pessoas",
            "method": "POST",
            "data": { ... },
            "description": "Create new supplier"
          }
        ],
        "ids": {
          "fornecedorId": 123,
          "faturadoId": 456,
          "classificacaoId": 789
        },
        "finalMovimentoData": { ... }
      }
      
      Return ONLY valid JSON. No explanations.
    `,
  });

  const pessoas = await getPessoas();

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: `Analyze this invoice and return the API call plan: ${JSON.stringify(
              data
            )} here are the existing pessoas: ${JSON.stringify(
              pessoas
            )}, remember to use them to avoid duplicates and return the id of the existing ones.`,
          },
        ],
      },
    ],
  });

  const responseText = result.response.candidates[0].content.parts[0].text
    .replace(/^```json\s*/, "")
    .replace(/```$/, "")
    .trim();

  // Parse the JSON response from Gemini
  try {
    const apiPlan: ApiCallPlan = JSON.parse(responseText);
    return apiPlan;
  } catch (error) {
    console.error("Failed to parse API plan:", error);
    console.error("Raw response:", responseText);
    throw new Error("Gemini did not return valid JSON plan");
  }
}

// Function to execute the API call plan (optional - call this separately)
export async function executeApiPlan(plan: ApiCallPlan) {
  const results = [];

  for (const call of plan.calls) {
    try {
      let response;

      switch (call.method) {
        case "GET":
          if (call.endpoint === "/pessoas") {
            response = await api.get("/pessoas");
          } else if (call.endpoint === "/classificacoes") {
            response = await api.get("/classificacoes");
          }
          break;

        case "POST":
          if (call.endpoint === "/pessoas") {
            response = await api.post("/pessoas", call.data);
          } else if (call.endpoint === "/classificacoes") {
            response = await api.post("/classificacoes", call.data);
          } else if (call.endpoint === "/movimentos") {
            response = await api.post("/movimentos", plan.finalMovimentoData);
          }
          break;
      }

      results.push({
        endpoint: call.endpoint,
        method: call.method,
        success: true,
        data: response?.data,
        description: call.description,
      });
    } catch (error) {
      results.push({
        endpoint: call.endpoint,
        method: call.method,
        success: false,
        error: error.message,
        description: call.description,
      });
    }
  }

  return results;
}
