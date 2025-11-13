const db = require("../db");

const PessoaRepository = {
  async findById(id) {
    const { rows } = await db.query("SELECT * FROM pessoas WHERE id = $1", [
      id,
    ]);
    return rows[0] ?? null;
  },

  async findByDocumento(documento) {
    if (!documento) return null;
    const { rows } = await db.query(
      "SELECT * FROM pessoas WHERE documento = $1 LIMIT 1",
      [documento]
    );
    return rows[0] ?? null;
  },

  async findByRazaoSocial(razao) {
    const { rows } = await db.query(
      "SELECT * FROM pessoas WHERE LOWER(razaosocial) = LOWER($1) LIMIT 1",
      [razao]
    );
    return rows[0] ?? null;
  },

  async listAll() {
    const { rows } = await db.query("SELECT * FROM pessoas ORDER BY id");
    return rows;
  },

  async create(p) {
    const { rows } = await db.query(
      `INSERT INTO pessoas (tipo, razaosocial, fantasia, documento, ativo)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [
        p.tipo,
        p.razaosocial,
        p.fantasia ?? null,
        p.documento ?? null,
        p.ativo ?? true,
      ]
    );
    return rows[0];
  },

  async updateStatus(id, ativo) {
    const { rows } = await db.query(
      "UPDATE pessoas SET ativo = $1 WHERE id = $2 RETURNING *",
      [ativo, id]
    );
    return rows[0] ?? null;
  },
};

module.exports = { PessoaRepository };
