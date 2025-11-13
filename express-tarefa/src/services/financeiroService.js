const {
  ClassificacaoRepository,
} = require("../repositories/classificacaoRepository");
const { PessoaRepository } = require("../repositories/pessoaRepository");
const { MovimentoRepository } = require("../repositories/movimentoRepository");
const { ParcelaRepository } = require("../repositories/parcelaRepository");

/**
 * Business logic / orquestração entre repos
 */
const FinanceiroService = {
  // Pessoas
  async getOrCreatePessoa(data) {
    if (data.documento) {
      const byDoc = await PessoaRepository.findByDocumento(data.documento);
      if (byDoc) return byDoc;
    }
    const byRazao = await PessoaRepository.findByRazaoSocial(data.razaosocial);
    if (byRazao) return byRazao;
    return PessoaRepository.create({ ...data, ativo: true });
  },

  // Classificações
  async getOrCreateClassificacao(data) {
    const found = await ClassificacaoRepository.findByDescricao(
      data.justificativa
    );
    if (found) return found;
    return ClassificacaoRepository.create({ ...data, ativo: true });
  },

  // Movimentos + Parcelas (transação)
  async createMovimentoWithParcels(movimento) {
    // usa repositório que executa transação
    return MovimentoRepository.createWithParcelsAndClassifications(movimento);
  },

  // Consultas utilitárias
  async listarMovimentos() {
    return MovimentoRepository.listAll();
  },

  async listarPessoas() {
    return PessoaRepository.listAll();
  },

  async listarClassificacoes() {
    return ClassificacaoRepository.listAll();
  },

  async listarParcelasPorMovimento(idMovimento) {
    return ParcelaRepository.listByMovimento(idMovimento);
  },
};

module.exports = { FinanceiroService };
