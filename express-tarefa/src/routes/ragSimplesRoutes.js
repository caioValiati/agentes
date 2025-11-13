const express = require('express');
const RagSimplesController = require('../controllers/ragSimplesController');

const router = express.Router();
const ragSimplesController = new RagSimplesController();

// Rota para processar perguntas com RAG Simples
router.post('/rag-simples/perguntar', (req, res) => {
    ragSimplesController.processarPergunta(req, res);
});

// Rota de health check
router.get('/rag-simples/health', (req, res) => {
    ragSimplesController.healthCheck(req, res);
});

module.exports = router;