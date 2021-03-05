const routes = require("express").Router();
const root = require("app-root-path");
const account = require(`${root}/controllers/account.js`);
const accountTransfer = require(`${root}/controllers/accountTransfers.js`);

routes.post("/register", account.registerAccount);
routes.get("/accounts", account.fetchAccounts);
routes.put("/transfer", accountTransfer.moneyTransfer);
module.exports = routes;
