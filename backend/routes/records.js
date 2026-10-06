const express = require("express");
const {
  queryRecords,
  queryNextRecords,
  getRecord,
  createRecord,
  updateRecord,
  deleteRecord,
} = require("../services/salesforceApi");

const router = express.Router();

const ALLOWED_OBJECTS = {
  Account: {
    fields: [
      "Id",
      "Name",
      "Phone",
      "Website",
      "Industry",
      "Type",
      "BillingCity",
      "BillingState",
      "BillingCountry",
    ],
  },
  Opportunity: {
    fields: [
      "Id",
      "Name",
      "Amount",
      "StageName",
      "CloseDate",
      "Probability",
      "Type",
      "LeadSource",
    ],
  },
  Lead: {
    fields: [
      "Id",
      "FirstName",
      "LastName",
      "Company",
      "Email",
      "Phone",
      "Status",
      "LeadSource",
      "Industry",
    ],
  },
  Contact: {
    fields: [
      "Id",
      "FirstName",
      "LastName",
      "Email",
      "Phone",
      "Title",
      "Department",
      "AccountId",
    ],
  },
  Case: {
    fields: [
      "Id",
      "CaseNumber",
      "Subject",
      "Status",
      "Priority",
      "Origin",
      "Type",
      "ContactId",
      "AccountId",
    ],
  },
};

function validateObject(objectName) {
  return Object.prototype.hasOwnProperty.call(ALLOWED_OBJECTS, objectName);
}

function requireAuthentication(req, res, next) {
  if (!req.session.salesforce) {
    return res.status(401).json({
      error: "Not authenticated",
      message: "Please login with Salesforce first.",
    });
  }

  next();
}

function escapeSoqlString(value) {
  return `'${String(value).replace(/\\/g, "\\\\").replace(/'/g, "\\'")}'`;
}

router.get("/:objectName", requireAuthentication, async (req, res) => {
  try {
    const { objectName } = req.params;

    if (!validateObject(objectName)) {
      return res.status(400).json({
        error: "Invalid Salesforce object",
        allowedObjects: Object.keys(ALLOWED_OBJECTS),
      });
    }

    const fields = ALLOWED_OBJECTS[objectName].fields.join(", ");

    const offset = Math.max(parseInt(req.query.offset, 10) || 0, 0);

    const orderField =
      objectName === "Opportunity" ? "CloseDate" : "CreatedDate";

    const soql = `
      SELECT ${fields}
      FROM ${objectName}
      ORDER BY ${orderField} DESC, Id DESC
      LIMIT 20
      OFFSET ${offset}
    `;

    const data = await queryRecords(req, soql);

    res.json({
      object: objectName,
      records: data.records,
      totalSize: data.totalSize,
      done: data.done,
      limit: 20,
      offset,
      nextOffset: data.records.length === 20 ? offset + 20 : null,
    });
  } catch (error) {
    console.error("Get records error:", error.response?.data || error.message);

    if (error.message === "NOT_AUTHENTICATED") {
      return res.status(401).json({
        error: "Not authenticated",
        message: "Please login with Salesforce first.",
      });
    }

    res.status(error.response?.status || 500).json({
      error: "Failed to retrieve Salesforce records",
      details: error.response?.data || error.message,
    });
  }
});

router.post("/:objectName", requireAuthentication, async (req, res) => {
  try {
    const { objectName } = req.params;

    if (!validateObject(objectName)) {
      return res.status(400).json({
        error: "Invalid Salesforce object",
        allowedObjects: Object.keys(ALLOWED_OBJECTS),
      });
    }

    if (
      !req.body ||
      typeof req.body !== "object" ||
      Array.isArray(req.body) ||
      Object.keys(req.body).length === 0
    ) {
      return res.status(400).json({
        error: "Request body must contain fields",
      });
    }

    const allowedFields = ALLOWED_OBJECTS[objectName].fields;

    const createFields = {};

    for (const [field, value] of Object.entries(req.body)) {
      if (field !== "Id" && allowedFields.includes(field)) {
        createFields[field] = value;
      }
    }

    if (Object.keys(createFields).length === 0) {
      return res.status(400).json({
        error: "No valid fields provided",
        allowedFields,
      });
    }

    const result = await createRecord(req, objectName, createFields);

    res.status(201).json({
      success: true,
      object: objectName,
      result,
    });
  } catch (error) {
    console.error(
      "Create record error:",
      error.response?.data || error.message,
    );

    if (error.message === "NOT_AUTHENTICATED") {
      return res.status(401).json({
        error: "Not authenticated",
      });
    }

    res.status(error.response?.status || 500).json({
      error: "Failed to create Salesforce record",
      details: error.response?.data || error.message,
    });
  }
});

router.get(
  "/:objectName/:recordId",
  requireAuthentication,
  async (req, res) => {
    try {
      const { objectName, recordId } = req.params;

      if (!validateObject(objectName)) {
        return res.status(400).json({
          error: "Invalid Salesforce object",
          allowedObjects: Object.keys(ALLOWED_OBJECTS),
        });
      }

      const record = await getRecord(req, objectName, recordId);

      res.json({
        object: objectName,
        record,
      });
    } catch (error) {
      console.error("Get record error:", error.response?.data || error.message);

      if (error.message === "NOT_AUTHENTICATED") {
        return res.status(401).json({
          error: "Not authenticated",
        });
      }

      res.status(error.response?.status || 500).json({
        error: "Failed to retrieve Salesforce record",
        details: error.response?.data || error.message,
      });
    }
  },
);

router.patch(
  "/:objectName/:recordId",
  requireAuthentication,
  async (req, res) => {
    try {
      const { objectName, recordId } = req.params;

      if (!validateObject(objectName)) {
        return res.status(400).json({
          error: "Invalid Salesforce object",
          allowedObjects: Object.keys(ALLOWED_OBJECTS),
        });
      }

      if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body) ||
        Object.keys(req.body).length === 0
      ) {
        return res.status(400).json({
          error: "Request body must contain fields to update",
        });
      }

      const allowedFields = ALLOWED_OBJECTS[objectName].fields;

      const updateFields = {};

      for (const [field, value] of Object.entries(req.body)) {
        if (field === "Id") {
          continue;
        }

        if (allowedFields.includes(field)) {
          updateFields[field] = value;
        }
      }

      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({
          error: "No valid fields provided for update",
          allowedFields,
        });
      }

      const result = await updateRecord(
        req,
        objectName,
        recordId,
        updateFields,
      );

      res.json({
        success: true,
        object: objectName,
        recordId,
        result,
      });
    } catch (error) {
      console.error(
        "Update record error:",
        error.response?.data || error.message,
      );

      if (error.message === "NOT_AUTHENTICATED") {
        return res.status(401).json({
          error: "Not authenticated",
        });
      }

      res.status(error.response?.status || 500).json({
        error: "Failed to update Salesforce record",
        details: error.response?.data || error.message,
      });
    }
  },
);

router.delete(
  "/:objectName/:recordId",
  requireAuthentication,
  async (req, res) => {
    try {
      const { objectName, recordId } = req.params;

      if (!validateObject(objectName)) {
        return res.status(400).json({
          error: "Invalid Salesforce object",
          allowedObjects: Object.keys(ALLOWED_OBJECTS),
        });
      }

      const result = await deleteRecord(req, objectName, recordId);

      res.json({
        success: true,
        object: objectName,
        recordId,
        result,
      });
    } catch (error) {
      console.error(
        "Delete record error:",
        error.response?.data || error.message,
      );

      if (error.message === "NOT_AUTHENTICATED") {
        return res.status(401).json({
          error: "Not authenticated",
        });
      }

      res.status(error.response?.status || 500).json({
        error: "Failed to delete Salesforce record",
        details: error.response?.data || error.message,
      });
    }
  },
);

module.exports = router;
