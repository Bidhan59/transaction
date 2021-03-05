const mongo = require("./adapters/mongo");
const keys = require("./keys");

const connectTodb = async () => {
  const mongoURI = keys.MONGO_URI;
  const db = await mongo.init(mongoURI, keys.DB_NAME);
  return db;
};
module.exports = {
  getDB: connectTodb,
};
