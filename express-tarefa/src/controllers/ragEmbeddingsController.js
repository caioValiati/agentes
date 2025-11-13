const RagEmbeddingsService = require('../services/ragEmbeddingsService');

class RagEmbeddingsController {
    constructor() {
        this.ragService = new RagEmbeddingsService();
    }

    async processarPergunta(req, res) {
        try {
            const { pergunta } = req.body;

            if (!pergunta) {
                return res.status(400).json({
                    sucesso: false,
                    erro: 'A pergunta é obrigatória'
                });
            }

            console.log('Recebendo pergunta para RAG Embeddings:', pergunta);
            
            const resultado = await this.ragService.processarPergunta(pergunta);
            
            if (resultado.sucesso) {
                res.json(resultado);
            } else {
                res.status(500).json(resultado);
            }

        } catch (error) {
            console.error('Erro no controlador RAG Embeddings:', error);
            res.status(500).json({
                sucesso: false,
                erro: 'Erro interno ao processar pergunta',
                detalhes: error.message
            });
        }
    }

    async healthCheck(req, res) {
        try {
            res.json({
                status: 'ok',
                servico: 'RAG Embeddings',
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            res.status(500).json({
                status: 'erro',
                erro: error.message
            });
        }
    }
}

module.exports = RagEmbeddingsController;