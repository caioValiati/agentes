const { FinanceiroService } = require("../services/financeiroService");
/**
 * Controller mantém a lógica de request/response
 */

const PessoaController = {
  list: async (req, res) => {
    const list = await FinanceiroService.listarPessoas();
    return res.json(list);
  },

  create: async (req, res) => {
    const payload = req.body;
    try {
      const pessoa = await FinanceiroService.getOrCreatePessoa(payload);
      return res.status(201).json(pessoa);
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  },
};

const ClassificacaoController = {
  list: async (req, res) => {
    const list = await FinanceiroService.listarClassificacoes();
    return res.json(list);
  },

  create: async (req, res) => {
    const payload = req.body;
    try {
      const c = await FinanceiroService.getOrCreateClassificacao(payload);
      return res.status(201).json(c);
    } catch (err) {
      return res.status(500).json({ error: String(err) });
    }
  },
};

const MovimentoController = {
  create: async (req, res) => {
    const movimento = req.body;
    try {
      const created = await FinanceiroService.createMovimentoWithParcels(
        movimento
      );
      return res.status(201).json(created);
    } catch (err) {
      console.error("Erro criar movimento:", err);
      return res.status(500).json({ error: String(err) });
    }
  },

  list: async (req, res) => {
    const list = await FinanceiroService.listarMovimentos();
    return res.json(list);
  },

  parcelas: async (req, res) => {
    const id = Number(req.params.id);
    const parcelas = await FinanceiroService.listarParcelasPorMovimento(id);
    return res.json(parcelas);
  },
};

module.exports = {
  PessoaController,
  ClassificacaoController,
  MovimentoController,
};
