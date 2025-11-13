const db = require("../db");

const MovimentoRepository = {
  async findByNumeroNota(numeroNota) {
    if (!numeroNota) return null;
    const { rows } = await db.query(
      "SELECT * FROM movimentos WHERE numero_notafiscal = $1 LIMIT 1",
      [numeroNota]
    );
    return rows[0] ?? null;
  },

  async create(m) {
    const { rows } = await db.query(
      `INSERT INTO movimentos
        (tipo, numero_notafiscal, data_emissao, descricao, valor_total, id_fornecedorcliente, id_faturado, ativo)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
      [
        m.tipo,
        m.numeroNotaFiscal ?? null,
        m.dataEmissao ?? null,
        m.descricao ?? null,
        m.valorTotal,
        m.idFornecedorCliente ?? null,
        m.idFaturado ?? null,
        m.ativo ?? true,
      ]
    );
    return rows[0];
  },

  async createClassificationLinks(client, movimentoId, classificacoes) {
    if (!classificacoes || classificacoes.length === 0) return;
    const text = `INSERT INTO movimento_classificacao (id_movimento, id_classificacao) VALUES ${classificacoes
      .map((_, i) => `($1, $${i + 2})`)
      .join(",")}`;
    const params = [movimentoId, ...classificacoes];
    await client.query(text, params);
  },

  async createWithParcelsAndClassifications(m) {
    const client = await db.getClient();
    try {
      await client.query("BEGIN");
      const insertMovText = `INSERT INTO movimentos
        (tipo, numero_notafiscal, data_emissao, descricao, valor_total, id_fornecedorcliente, id_faturado, ativo)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`;
      console.log(m);
      const movRes = await client.query(insertMovText, [
        m.tipo ?? null,
        m.numeroNotaFiscal ?? null,
        m.dataEmissao ?? null,
        m.descricao ?? null,
        m.valorTotal,
        m.fornecedorId ?? null,
        m.faturadoId ?? null,
        m.ativo ?? true,
      ]);
      const movimento = movRes.rows[0];

      // Se m.classificacoes existir, inserir links
      if (m.classificaoId) {
        const text = `INSERT INTO movimento_classificacao (id_movimento, id_classificacao) VALUES ($1, $2)`;
        const params = [movimento.id, m.classificaoId];
        await client.query(text, params);
      }

      // inserir parcelas
      for (const p of m.parcelas) {
        await client.query(
          `INSERT INTO parcelas (id_movimento, identificacao, data_vencimento, valor_parcela, valor_pago, valor_saldo, status_parcela)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [
            movimento.id,
            p.numero ?? null,
            p.dataVencimento ?? null,
            p.valor,
            0,
            p.valor,
            "ABERTA",
          ]
        );
      }

      await client.query("COMMIT");
      return movimento;
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  },

  async listAll() {
    const { rows } = await db.query(
      "SELECT * FROM movimentos ORDER BY id DESC"
    );
    return rows;
  },

  async updateStatus(id, ativo) {
    const { rows } = await db.query(
      "UPDATE movimentos SET ativo = $1 WHERE id = $2 RETURNING *",
      [ativo, id]
    );
    return rows[0] ?? null;
  },

  async findById(id) {
    const { rows } = await db.query("SELECT * FROM movimentos WHERE id = $1", [
      id,
    ]);
    return rows[0] ?? null;
  },
};

module.exports = { MovimentoRepository };
