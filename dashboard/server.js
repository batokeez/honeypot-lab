const express = require("express");
const path = require("path");
const { getStats } = require("./logs");

const app = express();
const PORT = 3000;

// Serve ficheiros estáticos (HTML, CSS, JS do browser) a partir da pasta "public"
app.use(express.static(path.join(__dirname, "public")));

// Rota de API: devolve os dados processados em JSON
app.get("/api/stats", (req, res) => {
    const stats = getStats();
    res.json(stats);
});

app.listen(PORT, () => {
    console.log(`Dashboard a correr em http://localhost:${PORT}`);
});