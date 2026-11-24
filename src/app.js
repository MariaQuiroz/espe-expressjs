const express = require("express");
const routes = require("./routes");
const logger = require("./middlewares/logger");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(express.json());
app.use(logger);

app.get("/", (req, res) => {
  res.json({ servicio: "API Farmacia", estado: "ok" });
});

app.use("/api", routes);

app.use((req, res) => {
  res.status(404).json({ error: "Ruta no encontrada" });
});

app.use(errorHandler);

module.exports = app;
