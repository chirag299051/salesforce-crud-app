import { useEffect, useState } from "react";

function RecordModal({
  record,
  fields,
  objectName,
  mode,
  onClose,
  onSave,
  saving
}) {
  const [formData, setFormData] = useState({});
  const isCreate = mode === "create";
  const isEdit = mode === "edit";

  useEffect(() => {
    const initialData = {};

    fields.forEach((field) => {
      initialData[field.name] =
        isCreate ? "" : record?.[field.name] ?? "";
    });

    setFormData(initialData);
  }, [record, fields, isCreate]);

  if (!record && !isCreate) {
    return null;
  }

  function handleChange(fieldName, value) {
    setFormData((previous) => ({
      ...previous,
      [fieldName]: value
    }));
  }

  function handleSubmit(event) {
    event.preventDefault();

    const data = {};

    fields.forEach((field) => {
      if (
        field.name !== "Id" &&
        !field.readOnly &&
        formData[field.name] !== ""
      ) {
        data[field.name] = formData[field.name];
      }
    });

    onSave(data);
  }

  function renderInput(field) {
    const value = formData[field.name] ?? "";

    if (field.readOnly || (!isCreate && field.name === "Id")) {
      return (
        <div className="field-value">
          {value || "-"}
        </div>
      );
    }

    if (field.type === "select") {
      return (
        <select
          value={value}
          onChange={(event) =>
            handleChange(
              field.name,
              event.target.value
            )
          }
          required={field.required}
          disabled={saving}
        >
          <option value="">
            Select {field.name}
          </option>

          {field.options?.map((option) => (
            <option
              key={option}
              value={option}
            >
              {option}
            </option>
          ))}
        </select>
      );
    }

    return (
      <input
        type={field.type || "text"}
        value={value}
        onChange={(event) =>
          handleChange(
            field.name,
            event.target.value
          )
        }
        required={field.required}
        disabled={saving}
        step={
          field.type === "number"
            ? "any"
            : undefined
        }
      />
    );
  }

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>
            {isCreate
              ? `Create ${objectName}`
              : isEdit
              ? `Edit ${objectName}`
              : `${objectName} Details`}
          </h2>

          <button
            type="button"
            className="close-button"
            onClick={onClose}
            disabled={saving}
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {fields.map((field) => (
            <div
              className="form-field"
              key={field.name}
            >
              <label htmlFor={`field-${field.name}`}>
                {field.name}

                {field.required &&
                  !field.readOnly && (
                    <span className="required">
                      {" "}
                      *
                    </span>
                  )}
              </label>

              {renderInput(field)}
            </div>
          ))}

          <div className="modal-actions">
            <button
              type="button"
              onClick={onClose}
              disabled={saving}
            >
              Close
            </button>

            {(isCreate || isEdit) && (
              <button
                type="submit"
                disabled={saving}
              >
                {saving
                  ? isCreate
                    ? "Creating..."
                    : "Saving..."
                  : isCreate
                  ? `Create ${objectName}`
                  : "Save Changes"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}

export default RecordModal;