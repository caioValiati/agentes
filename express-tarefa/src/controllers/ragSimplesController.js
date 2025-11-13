const RagSimplesService = require('../services/ragSimplesService');

class RagSimplesController {
    constructor() {
        this.ragService = new RagSimplesService();
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

            console.log('Recebendo pergunta para RAG Simples:', pergunta);
            
            const resultado = await this.ragService.processarPergunta(pergunta);
            
            if (resultado.sucesso) {
                res.json(resultado);
            } else {
                res.status(500).json(resultado);
            }

        } catch (error) {
            console.error('Erro no controlador RAG Simples:', error);
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
                servico: 'RAG Simples',
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

module.exports = RagSimplesController;