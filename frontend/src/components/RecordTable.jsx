function RecordTable({
  records,
  fields,
  onView,
  onEdit,
  onDelete,
  loading
}) {
  if (loading && records.length === 0) {
    return (
      <div className="loading">
        Loading records...
      </div>
    );
  }

  if (!loading && records.length === 0) {
    return (
      <div className="empty-state">
        No records found.
      </div>
    );
  }

  return (
    <div className="table-container">
      <table>
        <thead>
          <tr>
            {fields.map((field) => (
              <th key={field.name}>
                {field.name}
              </th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {records.map((record) => (
            <tr key={record.Id}>
              {fields.map((field) => (
                <td key={field.name}>
                  {record[field.name] ?? "-"}
                </td>
              ))}

              <td className="actions">
                <button
                  onClick={() => onView(record)}
                >
                  View
                </button>

                <button
                  onClick={() => onEdit(record)}
                >
                  Edit
                </button>

                <button
                  className="delete-button"
                  onClick={() => onDelete(record)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {loading && (
        <div className="loading-more">
          Loading more records...
        </div>
      )}
    </div>
  );
}

export default RecordTable;