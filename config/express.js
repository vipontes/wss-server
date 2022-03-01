const express = require("express");
const compression = require("compression");
const bodyParser = require("body-parser");
const consign = require("consign");
var cors = require("cors");

require("dotenv-safe").config({ allowEmptyValues: true });

module.exports = () => {

  const app = express();

  app.set("port", process.env.SERVER_PORT);

  var corsOptions = {
    credentials: true,
    origin: true,
    methods: "GET,POST,PUT,DELETE",
    exposedHeaders: "*",
    allowedHeaders: "*",
  };

  app.use(cors(corsOptions));

  app.set("port", process.env.PORT);

  app.use(bodyParser.json({ limit: "50mb" }));
  app.use(
    bodyParser.urlencoded({
      limit: "50mb",
      extended: true,
      parameterLimit: 50000,
      preflightContinue: true,
      optionsSuccessStatus: 200,
    })
  );

  app.use(compression());

  const db = require("../database/conn")();

  consign({ cwd: "./api" }).then("routes").into(app, db);

  return app;
};
