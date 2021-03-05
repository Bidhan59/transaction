const root = require("app-root-path");
const _ = require("lodash");
const isError = require(`${root}/helpers/isError`);
const accountModel = require(`${root}/models/account`);

async function moneyTransfer(req, res, next) {
  const orgDB = req.db.GiveIndia;
  const client = req.db.client;
  const body = req.body;
  if (
    _.isNil(body.accountFrom) ||
    _.isNil(body.accountTo) ||
    _.isNil(body.amount)
  ) {
    return res.status(404).json({
      status: "Failure",
      statusCode: 404,
      message: "MANDETORY FIELDS ARE MISSING",
    });
  }

  const sourceAccount = await accountModel
    .fetchAccounts({
      criteria: {
        account_id: body.accountFrom,
        account_balance: { $gte: body.amount },
      },
      db: orgDB,
    })
    .catch((err) => {
      console.log(
        "GIVEN AMOUNT TRANSFER IS NOT POSSIBLE FROM THE GIVEN ACCOUNT:",
        err
      );
      return res.status(400).json({
        status: "Failure",
        statusCode: 400,
        message: "GIVEN AMOUNT TRANSFER IS NOT POSSIBLE FROM THE GIVEN ACCOUNT",
      });
    });
  if (isError(sourceAccount) || sourceAccount.length == 0) {
    console.log(
      "GIVEN AMOUNT TRANSFER IS NOT POSSIBLE FROM THE GIVEN ACCOUNT:",
      sourceAccount
    );
    return res.status(400).json({
      status: "Failure",
      statusCode: 400,
      message: "GIVEN AMOUNT TRANSFER IS NOT POSSIBLE FROM THE GIVEN ACCOUNT",
    });
  }
  const destinationAccount = await accountModel
    .fetchAccounts({
      criteria: {
        account_id: body.accountTo,
      },
      db: orgDB,
    })
    .catch((err) => {
      console.log("INVALID DESTINATION ACCOUNT:", err);
      return res.status(400).json({
        status: "Failure",
        statusCode: 400,
        message: "INVALID DESTINATION ACCOUNT",
      });
    });
  if (isError(destinationAccount) || destinationAccount.length == 0) {
    console.log("INVALID DESTINATION ACCOUNT:", account);
    return res.status(400).json({
      status: "Failure",
      statusCode: 400,
      message: "INVALID DESTINATION ACCOUNT",
    });
  }
  if (sourceAccount[0].email_id === destinationAccount[0].email_id) {
    return res.status(400).json({
      status: "Failure",
      statusCode: 400,
      message: "TRANSFER WITHIN THE ACCOUNTS OF SAME CUSTOMER IS NOT ALLOWED",
    });
  }
  let sourceInitialAmount = sourceAccount[0].account_balance;
  let sourceFinalAmount = sourceAccount[0].account_balance - body.amount;
  let destinationInitialAmount = destinationAccount[0].account_balance;
  let destinationFinalAmount =
    destinationAccount[0].account_balance + body.amount;

  if (
    destinationAccount[0].account_type == "Savings" &&
    destinationFinalAmount > 50000
  ) {
    return res.status(400).json({
      status: "Failure",
      statusCode: 400,
      message:
        "FINAL AMOUNT OF THE DESTINATION ACCOUNT EXCEEDS THE SAVINGS ACCOUNT LIMIT",
    });
  }
  let filterObjs = [
    { account_id: sourceAccount[0].account_id },
    { account_id: destinationAccount[0].account_id },
  ];
  let updateParameters = [
    { $set: { account_balance: sourceFinalAmount } },
    { $set: { account_balance: destinationFinalAmount } },
  ];
  const accountTransfer = await accountModel.transferAccount({
    filterObj: filterObjs,
    orgDB: { db: orgDB, client: client },
    updateParameters: updateParameters,
  });
  if (accountTransfer == false) {
    return res.status(400).json({
      status: "Failure",
      statusCode: 400,
      message: "ERROR WHILE TRANSFERRING THE AMOUNT",
    });
  }
  return res.status(200).json({
    status: "success",
    statusCode: 200,
    data: {
      newSrcBalance: sourceFinalAmount,
      totalDestBalance: destinationFinalAmount,
      transferredAt: new Date().toISOString(),
    },
  });
}
module.exports = {
  moneyTransfer: moneyTransfer,
};
