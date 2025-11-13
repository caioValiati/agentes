const db = require("../db");

const ClassificacaoRepository = {
  async findByDescricao(descricao) {
    const { rows } = await db.query(
      "SELECT * FROM classificacoes WHERE LOWER(descricao) = LOWER($1) LIMIT 1",
      [descricao]
    );
    return rows[0] ?? null;
  },

  async create(c) {
    const { rows } = await db.query(
      `INSERT INTO classificacoes (tipo, descricao, ativo) VALUES ($1,$2,$3) RETURNING *`,
      [c.categoria, c.justificativa, c.ativo ?? true]
    );
    return rows[0];
  },

  async listAll() {
    const { rows } = await db.query("SELECT * FROM classificacoes ORDER BY id");
    return rows;
  },

  async updateStatus(id, ativo) {
    const { rows } = await db.query(
      "UPDATE classificacoes SET ativo = $1 WHERE id = $2 RETURNING *",
      [ativo, id]
    );
    return rows[0] ?? null;
  },
};

module.exports = { ClassificacaoRepository };
