const appRoot = require("app-root-path");

const requiredParam = require(`${appRoot}/helpers/requiredParam`);
const collectionName = "Accounts";

const accountRegister = async ({
  accountDetails = requiredParam("accountDetails"),
  db = requiredParam("db"),
}) => {
  const account = await db.collection(collectionName).insertOne(accountDetails);
  return account;
};

const fetchAccounts = async ({
  criteria = requiredParam("criteria"),
  db = requiredParam("db"),
}) => {
  const accounts = await db.collection(collectionName).find(criteria).toArray();
  return accounts;
};

const bulkUpdateAccounts = async ({
  criteria = requiredParam("criteria"),
  updateDetails = requiredParam("updateDetails"),
  db = requiredParam("db"),
}) => {
  var bulk = db.collection(collectionName).initializeUnorderedBulkOp();
  bulk
    .find(criteria[0])
    .update({ $set: updateDetails[0] }, { returnOriginal: false });
  bulk
    .find(criteria[1])
    .update({ $set: updateDetails[1] }, { returnOriginal: false });
  bulk.execute();
  return bulk;
};

const updateAccount = async ({
  filterObj = requiredParam("filterObj"),
  db = requiredParam("db"),
  updateParameters = requiredParam("updateParameters"),
}) => {
  console.log("filterObj>>>>>>>>>>>>>>>>>>", filterObj);
  console.log("updateParameters>>>>>>>>>>>", updateParameters);
  const updatedAccount = await db
    .collection(collectionName)
    .findOneAndUpdate(filterObj, updateParameters);
  return updatedAccount;
};

const transferAccount = async ({
  filterObj = requiredParam("filterObj"),
  orgDB = requiredParam("orgDB"),
  updateParameters = requiredParam("updateParameters"),
}) => {
  const db = orgDB.db;
  const client = orgDB.client;
  const session = client.startSession();
  session.startTransaction();
  try {
    const opts = { session, returnOriginal: false };
    const updateSourceAccount = await db
      .collection(collectionName)
      .findOneAndUpdate(filterObj[0], updateParameters[0], opts)
      .catch((err) => {
        console.log("ERROR IN TRANSFERRING FUNDS IN SOURCE:", err);
        throw new Error("ERROR IN TRANSFERRING FUNDS IN SOURCE: ", err);
      });
    if (updateSourceAccount.lastErrorObject.updatedExisting == false) {
      throw new Error("ERROR IN TRANSFERRING FUNDS IN SOURCE");
    }
    const updateDestAccount = await db
      .collection(collectionName)
      .findOneAndUpdate(filterObj[1], updateParameters[1], opts)
      .catch((err) => {
        console.log("ERROR IN TRANSFERRING FUNDS IN DESTINATION:", err);
        throw new Error("ERROR IN TRANSFERRING FUNDS IN DESTINATION: ", err);
      });
    if (updateDestAccount.lastErrorObject.updatedExisting == false) {
      throw new Error("ERROR IN TRANSFERRING FUNDS IN DESTINATION");
    }
    await session.commitTransaction();
    await session.endSession();
    return true;
  } catch (err) {
    console.log("ERROR IN PAYMENT PROCESS", err);
    await session.abortTransaction();
    session.endSession();
    return false;
  }
};

module.exports = Object.assign(
  {},
  {
    accountRegister,
    fetchAccounts,
    bulkUpdateAccounts,
    updateAccount,
    transferAccount,
  }
);
