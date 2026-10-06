import { useEffect, useState, useRef } from "react";
import Login from "./components/Login";
import ObjectSelector from "./components/ObjectSelector";
import RecordTable from "./components/RecordTable";
import RecordModal from "./components/RecordModal";
import {
  getAuthStatus,
  logout,
  getRecords,
  createRecord,
  updateRecord,
  deleteRecord
} from "./services/api";

const OBJECT_FIELDS = {
  Account: [
    { name: "Id", type: "text", readOnly: true },
    { name: "Name", type: "text", required: true },
    { name: "Phone", type: "tel" },
    { name: "Website", type: "url" },
    { name: "Industry", type: "text" },
    { name: "Type", type: "text" }
  ],
  Opportunity: [
    { name: "Id", type: "text", readOnly: true },
    { name: "Name", type: "text", required: true },
    { name: "Amount", type: "number" },
    {
      name: "StageName",
      type: "select",
      required: true,
      options: [
        "Prospecting",
        "Qualification",
        "Needs Analysis",
        "Value Proposition",
        "Id. Decision Makers",
        "Perception Analysis",
        "Proposal/Price Quote",
        "Negotiation/Review",
        "Closed Won",
        "Closed Lost"
      ]
    },
    { name: "CloseDate", type: "date", required: true },
    { name: "Probability", type: "number" }
  ],
  Lead: [
    { name: "Id", type: "text", readOnly: true },
    { name: "FirstName", type: "text" },
    { name: "LastName", type: "text", required: true },
    { name: "Company", type: "text", required: true },
    { name: "Email", type: "email" },
    { name: "Phone", type: "tel" },
    {
      name: "Status",
      type: "select",
      required: true,
      options: [
        "Open - Not Contacted",
        "Working - Contacted",
        "Closed - Converted",
        "Closed - Not Converted"
      ]
    }
  ],
  Contact: [
    { name: "Id", type: "text", readOnly: true },
    { name: "FirstName", type: "text" },
    { name: "LastName", type: "text", required: true },
    { name: "Email", type: "email" },
    { name: "Phone", type: "tel" },
    { name: "Title", type: "text" }
  ],
  Case: [
    { name: "Id", type: "text", readOnly: true },
    { name: "CaseNumber", type: "text", readOnly: true },
    { name: "Subject", type: "text" },
    {
      name: "Status",
      type: "select",
      options: [
        "New",
        "Working",
        "Escalated",
        "Closed"
      ]
    },
    {
      name: "Priority",
      type: "select",
      options: [
        "High",
        "Medium",
        "Low"
      ]
    },
    {
      name: "Origin",
      type: "select",
      options: [
        "Phone",
        "Email",
        "Web"
      ]
    }
  ]
};

function App() {
  const [authenticated, setAuthenticated] =
    useState(false);

  const [checkingAuth, setCheckingAuth] =
    useState(true);

  const [selectedObject, setSelectedObject] =
    useState("Account");

  const [records, setRecords] = useState([]);

  const loadingMoreRef = useRef(false);

  const [offset, setOffset] = useState(0);

  const [hasMore, setHasMore] = useState(true);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [selectedRecord, setSelectedRecord] =
    useState(null);

  const [modalMode, setModalMode] =
    useState(null);

  const [saving, setSaving] = useState(false);

  const fields = OBJECT_FIELDS[selectedObject];

  useEffect(() => {
    checkAuthentication();
  }, []);

  useEffect(() => {
    if (authenticated) {
      loadInitialRecords();
    }
  }, [selectedObject, authenticated]);

  async function checkAuthentication() {
    try {
      const result = await getAuthStatus();

      setAuthenticated(
        result.authenticated === true
      );
    } catch (error) {
      setAuthenticated(false);
    } finally {
      setCheckingAuth(false);
    }
  }

  async function loadInitialRecords() {
  try {
    setLoading(true);
    setError("");
    setRecords([]);
    setOffset(0);
    setHasMore(true);

    const data = await getRecords(
      selectedObject,
      0
    );

    setRecords(data.records);
    setOffset(data.records.length);
    setHasMore(
      data.records.length === 20
    );
  } catch (error) {
    setError(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load records."
    );
  } finally {
    setLoading(false);
  }
}

  async function loadMoreRecords() {
  if (loading || !hasMore) {
    return;
  }

  try {
    setLoading(true);
    setError("");

    const data = await getRecords(
      selectedObject,
      offset
    );

    setRecords((previous) => [
      ...previous,
      ...data.records
    ]);

    setOffset(
      (previous) =>
        previous + data.records.length
    );

    setHasMore(
      data.records.length === 20
    );
  } catch (error) {
    setError(
      error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load more records."
    );
  } finally {
    setLoading(false);
  }
}

useEffect(() => {
  function handleScroll() {
    const scrollPosition =
      window.innerHeight +
      window.scrollY;

    const threshold =
      document.documentElement.scrollHeight -
      500;

    if (
      scrollPosition >= threshold &&
      !loadingMoreRef.current &&
      hasMore &&
      !loading
    ) {
      loadingMoreRef.current = true;

      loadMoreRecords().finally(() => {
        loadingMoreRef.current = false;
      });
    }
  }

  window.addEventListener(
    "scroll",
    handleScroll
  );

  return () => {
    window.removeEventListener(
      "scroll",
      handleScroll
    );
  };
}, [
  offset,
  hasMore,
  loading,
  selectedObject
]);

  async function handleLogout() {
    try {
      await logout();
      setAuthenticated(false);
    } catch (error) {
      setError("Logout failed.");
    }
  }

  function handleView(record) {
    setSelectedRecord(record);
    setModalMode("view");
  }

  function handleCreate() {
  setSelectedRecord({});
  setModalMode("create");
}

async function handleCreateSave(fields) {
  try {
    setSaving(true);
    setError("");
    await createRecord(
      selectedObject,
      fields
    );
    const newRecord = await getRecords(
  selectedObject,
  0
);

setRecords(newRecord.records);
setOffset(newRecord.records.length);
setHasMore(
  newRecord.records.length === 20
);
    setSelectedRecord(null);
    setModalMode(null);
  } catch (error) {
    setError(
      error.response?.data?.details ||
        error.response?.data?.error ||
        "Failed to create record."
    );
  } finally {
    setSaving(false);
  }
}

  function handleEdit(record) {
    setSelectedRecord(record);
    setModalMode("edit");
  }

  async function handleDelete(record) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${record.Name || record.Subject || record.CaseNumber || record.Id}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteRecord(
        selectedObject,
        record.Id
      );

      setRecords((previous) =>
        previous.filter(
          (item) => item.Id !== record.Id
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.details ||
          "Failed to delete record."
      );
    }
  }

  async function handleSave(updates) {
    try {
      setSaving(true);

      await updateRecord(
        selectedObject,
        selectedRecord.Id,
        updates
      );

      setRecords((previous) =>
        previous.map((record) =>
          record.Id === selectedRecord.Id
            ? {
                ...record,
                ...updates
              }
            : record
        )
      );

      setSelectedRecord(null);
      setModalMode(null);
    } catch (error) {
      setError(
        error.response?.data?.details ||
          "Failed to update record."
      );
    } finally {
      setSaving(false);
    }
  }

  if (checkingAuth) {
    return (
      <div className="loading-page">
        Checking Salesforce authentication...
      </div>
    );
  }

  if (!authenticated) {
    return <Login />;
  }

  return (
    <div className="app">
      <header className="header">
        <div>
          <h1>Salesforce CRUD Manager</h1>
          <p>
            Manage your Salesforce records
          </p>
        </div>

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </header>

      <main className="main-content">
        <div className="selector-row">
  <ObjectSelector
    selectedObject={selectedObject}
    onChange={setSelectedObject}
  />

  <button
    className="create-button"
    onClick={handleCreate}
  >
    + Create {selectedObject}
  </button>
</div>

        {error && (
          <div className="error-message">
            {error}
            <button
              onClick={() => setError("")}
            >
              ×
            </button>
          </div>
        )}

        <div className="record-count">
          {records.length} records loaded
        </div>

        <RecordTable
          records={records}
          fields={fields}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </main>

<RecordModal
  record={selectedRecord}
  fields={fields}
  objectName={selectedObject}
  mode={modalMode}
  onClose={() => {
    setSelectedRecord(null);
    setModalMode(null);
  }}
  onSave={
    modalMode === "create"
      ? handleCreateSave
      : handleSave
  }
  saving={saving}
/>
    </div>
  );
}

export default App;