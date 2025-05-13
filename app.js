const express = require("express");
const app = express();
const analysisRoutes = require("./routes/analysisRoutes");

app.use(express.json());
app.use("/api", analysisRoutes);

module.exports = app;