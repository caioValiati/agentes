const express = require("express");
const router = express.Router();

const financeiroRoutes = require("./financeiroRoutes");

// autenticação
router.use("/", financeiroRoutes);

module.exports = router;
