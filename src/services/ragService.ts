import axios from 'axios';

const API_BASE_URL = (import.meta as any).env?.VITE_API_URL || 'http://localhost:3002/api';

export interface RAGResponse {
    sucesso: boolean;
    pergunta: string;
    resposta?: string;
    dados_consultados?: any;
    dados_relevantes?: any[];
    total_encontrado?: number;
    erro?: string;
    timestamp: string;
}

export interface RAGSimplesService {
    perguntar: (pergunta: string) => Promise<RAGResponse>;
}

export interface RAGEmbeddingsService {
    perguntar: (pergunta: string) => Promise<RAGResponse>;
}

class RAGService {
    private api = axios.create({
        baseURL: API_BASE_URL,
        timeout: 30000, // 30 segundos timeout
        headers: {
            'Content-Type': 'application/json',
        },
    });

    // RAG Simples
    async perguntarRAGSimples(pergunta: string): Promise<RAGResponse> {
        try {
            const response = await this.api.post('/rag-simples/perguntar', {
                pergunta: pergunta.trim()
            });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao chamar RAG Simples:', error);
            return {
                sucesso: false,
                erro: error.response?.data?.erro || error.message || 'Erro desconhecido',
                pergunta,
                timestamp: new Date().toISOString()
            };
        }
    }

    // RAG com Embeddings
    async perguntarRAGEmbeddings(pergunta: string): Promise<RAGResponse> {
        try {
            const response = await this.api.post('/rag-embeddings/perguntar', {
                pergunta: pergunta.trim()
            });
            return response.data;
        } catch (error: any) {
            console.error('Erro ao chamar RAG Embeddings:', error);
            return {
                sucesso: false,
                erro: error.response?.data?.erro || error.message || 'Erro desconhecido',
                pergunta,
                timestamp: new Date().toISOString()
            };
        }
    }

    // Health checks
    async healthCheckRAGSimples(): Promise<boolean> {
        try {
            const response = await this.api.get('/rag-simples/health');
            return response.data.status === 'ok';
        } catch (error) {
            console.error('Health check RAG Simples falhou:', error);
            return false;
        }
    }

    async healthCheckRAGEmbeddings(): Promise<boolean> {
        try {
            const response = await this.api.get('/rag-embeddings/health');
            return response.data.status === 'ok';
        } catch (error) {
            console.error('Health check RAG Embeddings falhou:', error);
            return false;
        }
    }
}

export const ragService = new RAGService();