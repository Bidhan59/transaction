const root = require("app-root-path");
const uuidv1 = require("uuid/v1");
const _ = require("lodash");
const isError = require(`${root}/helpers/isError`);
const accountModel = require(`${root}/models/account`);

async function registerAccount(req, res, next) {
  const orgDB = req.db.GiveIndia;
  const body = req.body;
  if (
    _.isNil(body.accountType) ||
    _.isNil(body.customerName) ||
    _.isNil(body.ifscCode) ||
    _.isNil(body.emailId)
  ) {
    return res.status(404).json({
      status: "Failure",
      statusCode: 404,
      message: "MANDETORY FIELDS ARE MISSING",
    });
  }

  const accounts = await accountModel
    .fetchAccounts({
      criteria: { email_id: body.emailId },
      db: orgDB,
    })
    .catch((err) => {
      console.log("ERROR IN REGISTERING THE ACCOUNT:", err);
      return res.status(400).json({
        status: "Failure",
        statusCode: 400,
        message: "ERROR IN REGISTERING THE ACCOUNT",
      });
    });
  if (isError(accounts)) {
    console.log("ERROR IN REGISTERING THE ACCOUNT:", accounts);
    return res.status(400).json({
      status: "Failure",
      statusCode: 400,
      message: "ERROR IN REGISTERING THE ACCOUNT",
    });
  }
  if (body.newCustomer == 1 && accounts.length > 0) {
    return res.status(400).json({
      status: "Failure",
      statusCode: 400,
      message: "GIVEN EMAILID IS ALREADY REGISTERED",
    });
  }
  let customerId = null;
  if (body.newCustomer == 0) {
    if (accounts.length == 0) {
      return res.status(400).json({
        status: "Failure",
        statusCode: 400,
        message: "NOT A VALID CUSTOMER",
      });
    } else {
      customerId = accounts[0].customer_id;
    }
  }
  let accountObj = {
    account_id: uuidv1(),
    account_type: body.accountType,
    customer_name: body.customerName,
    customer_id: body.newCustomer == 1 ? uuidv1() : customerId,
    account_balance: body.accountBalance,
    branch_name: body.branchName,
    ifsc_code: body.ifscCode,
    email_id: body.emailId,
  };
  const registeredAccount = await accountModel
    .accountRegister({ accountDetails: accountObj, db: orgDB })
    .catch((err) => {
      console.log("ERROR IN REGISTERING THE ACCOUNT:", err);
      return res.status(400).json({
        status: "Failure",
        statusCode: 400,
        message: "ERROR IN REGISTERING THE ACCOUNT",
      });
    });
  if (isError(registeredAccount)) {
    console.log("ERROR IN REGISTERING THE ACCOUNT:", registeredAccount);
    return res.status(400).json({
      status: "Failure",
      statusCode: 400,
      message: "ERROR IN REGISTERING THE ACCOUNT",
    });
  }
  return res.status(200).json({
    status: "success",
    statusCode: 200,
    message: `Account Registered`,
  });
}

async function fetchAccounts(req, res, next) {
  const orgDB = req.db.GiveIndia;
  const accounts = await accountModel
    .fetchAccounts({
      criteria: {},
      db: orgDB,
    })
    .catch((err) => {
      console.log("ERROR IN FETCHING ACCOUNT:", err);
      return res.status(400).json({
        status: "Failure",
        statusCode: 400,
        message: "ERROR IN FETCHING ACCOUNT",
      });
    });
  if (isError(accounts)) {
    console.log("ERROR IN FETCHING ACCOUNT:", accounts);
    return res.status(400).json({
      status: "Failure",
      statusCode: 400,
      message: "ERROR IN FETCHING ACCOUNT",
    });
  }
  let responseData = [];
  accounts.forEach((a) => {
    let response = {
      accountType: a.account_type,
      accountId: a.account_id,
      customerId: a.customer_id,
      customerName: a.customer_name,
      accountBalance: a.account_balance,
      emailId: a.email_id,
      branchName: a.branch_name,
      ifscCode: a.ifsc_code,
    };
    responseData.push(response);
  });

  return res.status(200).json({
    status: "success",
    statusCode: 200,
    data: responseData,
  });
}
module.exports = {
  registerAccount: registerAccount,
  fetchAccounts: fetchAccounts,
};
