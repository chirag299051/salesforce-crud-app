const axios = require("axios");

const API_VERSION = "v66.0";

function getSalesforceClient(req) {
  if (!req.session.salesforce) {
    throw new Error("NOT_AUTHENTICATED");
  }

  const { accessToken, instanceUrl } = req.session.salesforce;

  return axios.create({
    baseURL: `${instanceUrl}/services/data/${API_VERSION}`,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });
}

async function queryRecords(req, soql) {
  const client = getSalesforceClient(req);

  const response = await client.get("/query", {
    params: {
      q: soql,
    },
  });

  return response.data;
}

// async function queryNextRecords(req, nextRecordsUrl) {
//   const client = getSalesforceClient(req);

//   if (
//     !nextRecordsUrl ||
//     !nextRecordsUrl.startsWith(`/services/data/${API_VERSION}/query/`)
//   ) {
//     throw new Error("INVALID_QUERY_CURSOR");
//   }

//   const response = await client.get(nextRecordsUrl);

//   return response.data;
// }

async function getRecord(req, objectName, recordId) {
  const client = getSalesforceClient(req);

  const response = await client.get(`/sobjects/${objectName}/${recordId}`);

  return response.data;
}

async function createRecord(req, objectName, fields) {
  const client = getSalesforceClient(req);

  const response = await client.post(`/sobjects/${objectName}`, fields);

  return response.data;
}

async function updateRecord(req, objectName, recordId, fields) {
  const client = getSalesforceClient(req);

  const response = await client.patch(
    `/sobjects/${objectName}/${recordId}`,
    fields,
  );

  return response.data;
}

async function deleteRecord(req, objectName, recordId) {
  const client = getSalesforceClient(req);

  const response = await client.delete(`/sobjects/${objectName}/${recordId}`);

  return response.data;
}

module.exports = {
  getSalesforceClient,
  queryRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
};
