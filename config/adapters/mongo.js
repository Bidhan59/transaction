const mongodb = require("mongodb");
const appRoot = require("app-root-path");

const isError = require(`${appRoot}/helpers/isError`);
const { MongoClient } = mongodb;
let dbForClose = null;
module.exports.init = initMongoDB;

async function initMongoDB(mongoURL, database, logger) {
  // connecting Mongo
  const db = await MongoClient.connect(mongoURL, {
    useUnifiedTopology: true,
    useNewUrlParser: true,
  }).catch((err) => err);
  if (isError(db)) {
    console.log(`Error connecting to the ${mongoURL}`);
  }
  if (db != null) {
    console.log(`Connected to remote db-GiveIndia`);
  }
  // If the Node process ends, cleanup existing connections
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);
  process.on("SIGHUP", cleanup);
  process.on("uncaughtException", (err) => {
    if (err.message === "dbForClose.close is not a function") process.exit(0);
  });
  dbForClose = db;
  return { client: db, database: db.db(database) };
}

function cleanup() {
  dbForClose.close(() => {
    console.log("Closing DB connection and Stopping the app. Bye bye.");
    process.exit(0);
  });
}
