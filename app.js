var express = require("express");
var app = express();
const config = require("./config");
const router = require("./routes.js");
const bodyParser = require("body-parser");

async function startApp() {
  const db = await config.getDB();
  if (db == null) {
    console.log(`DB cannot be connected Stopping the APP`);
    process.exit(1);
  }
  // parse application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: false }));

  // parse application/json
  app.use(bodyParser.json());
  app.use((req, res, next) => {
    req.db = {
      GiveIndia: db.database,
      client: db.client,
    };
    next();
  });
  app.use("/GiveIndia/api/v1", router);
  console.log("Booting GiveIndia App Done");
  console.log("Staring the Application");
  return app;
}
module.exports = startApp;
