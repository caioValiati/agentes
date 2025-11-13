const db = require("../db");

const ParcelaRepository = {
  async listByMovimento(idMovimento) {
    const { rows } = await db.query(
      "SELECT * FROM parcelas WHERE id_movimento = $1 ORDER BY id",
      [idMovimento]
    );
    return rows;
  },

  async create(p) {
    const { rows } = await db.query(
      `INSERT INTO parcelas (id_movimento, identificacao, data_vencimento, valor_parcela, valor_pago, valor_saldo, status_parcela)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [
        p.idMovimento,
        p.identificacao ?? null,
        p.dataVencimento ?? null,
        p.valorParcela,
        p.valorPago ?? 0,
        p.valorSaldo ?? p.valorParcela,
        p.statusParcela ?? "ABERTA",
      ]
    );
    return rows[0];
  },

  async update(id, dados) {
    const fields = Object.keys(dados);
    const sets = fields.map((f, i) => `${f} = $${i + 2}`).join(", ");
    const values = fields.map((k) => dados[k]);
    if (!fields.length) return null;
    const { rows } = await db.query(
      `UPDATE parcelas SET ${sets} WHERE id = $1 RETURNING *`,
      [id, ...values]
    );
    return rows[0];
  },
};

module.exports = { ParcelaRepository };
