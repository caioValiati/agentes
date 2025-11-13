const express = require('express');
const RagEmbeddingsController = require('../controllers/ragEmbeddingsController');

const router = express.Router();
const ragEmbeddingsController = new RagEmbeddingsController();

// Rota para processar perguntas com RAG Embeddings
router.post('/rag-embeddings/perguntar', (req, res) => {
    ragEmbeddingsController.processarPergunta(req, res);
});

// Rota de health check
router.get('/rag-embeddings/health', (req, res) => {
    ragEmbeddingsController.healthCheck(req, res);
});

module.exports = router;