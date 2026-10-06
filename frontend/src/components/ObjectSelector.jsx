const objects = [
  "Account",
  "Opportunity",
  "Lead",
  "Contact",
  "Case"
];

function ObjectSelector({ selectedObject, onChange }) {
  return (
    <div className="object-selector">
      <label htmlFor="object-select">
        Salesforce Object
      </label>

      <select
        id="object-select"
        value={selectedObject}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {objects.map((object) => (
          <option key={object} value={object}>
            {object}
          </option>
        ))}
      </select>
    </div>
  );
}

export default ObjectSelector;