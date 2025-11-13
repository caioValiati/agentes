const app = require("./app");
const config = require("./config");

const PORT = config.port || process.env.PORT || 3002;

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
