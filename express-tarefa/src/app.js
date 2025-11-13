const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const financeiroRoutes = require("./routes/financeiroRoutes");
const ragSimplesRoutes = require("./routes/ragSimplesRoutes");
const ragEmbeddingsRoutes = require("./routes/ragEmbeddingsRoutes");

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/financeiro", financeiroRoutes);
app.use("/api", ragSimplesRoutes);
app.use("/api", ragEmbeddingsRoutes);

app.get("/", (req, res) => res.send("API Financeiro rodando"));

module.exports = app; // <-- AQUI exportamos o app sem rodar o servidor
