const db = require("../db");
const fs = require("fs");
const path = require("path");

const init = async () => {
  try {
    const sqlPath = path.join(__dirname, "..", "..", "sql", "create_tables.sql");

    const sql = fs.readFileSync(sqlPath, "utf8");
    await db.query(`${sql}`);

    console.log("✅ Tabelas criadas com sucesso!");
  } catch (error) {
    console.error("❌ Erro ao criar tabelas:", error);
  }
};

init();
