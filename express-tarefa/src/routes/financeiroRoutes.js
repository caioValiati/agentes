const { Router } = require("express");
const {
  PessoaController,
  ClassificacaoController,
  MovimentoController,
} = require("../controllers/financeiroController");

const router = Router();

// Pessoas
router.get("/pessoas", PessoaController.list);
router.post("/pessoas", PessoaController.create);

// Classificações
router.get("/classificacoes", ClassificacaoController.list);
router.post("/classificacoes", ClassificacaoController.create);

// Movimentos
router.post("/movimentos", MovimentoController.create);
router.get("/movimentos", MovimentoController.list);
router.get("/movimentos/:id/parcelas", MovimentoController.parcelas);

module.exports = router;
