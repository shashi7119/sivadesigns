import React, { useState, useRef, useEffect } from "react";
import "../css/MultiSelectFilter.css";

// Dropdown with a search box and tick boxes - picks one or more options.
// value: array of selected names, onChange(newArray)
function MultiSelectFilter({ options, value, onChange, placeholder = "All" }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const boxRef = useRef();

  // close when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const selected = value || [];
  const text = search.trim().toLowerCase();
  const shown = options.filter((opt) =>
    String(opt.name).toLowerCase().includes(text),
  );

  const toggle = (name) =>
    onChange(
      selected.includes(name)
        ? selected.filter((v) => v !== name)
        : [...selected, name],
    );

  const selectShown = () =>
    onChange([...new Set([...selected, ...shown.map((opt) => opt.name)])]);

  return (
    <div className="msf" ref={boxRef}>
      <button
        type="button"
        className="form-select msf-toggle"
        onClick={() => setOpen((o) => !o)}
        title={selected.join(", ")}
      >
        {selected.length === 0
          ? placeholder
          : selected.length === 1
            ? selected[0]
            : `${selected.length} selected`}
      </button>

      {open && (
        <div className="msf-menu">
          <input
            className="form-control form-control-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            autoFocus
          />
          <div className="msf-actions">
            <button type="button" onClick={selectShown}>
              Select all{text ? " shown" : ""}
            </button>
            <button type="button" onClick={() => onChange([])}>
              Clear
            </button>
          </div>
          <div className="msf-list">
            {shown.length === 0 && <div className="msf-empty">No match</div>}
            {shown.map((opt) => (
              <label key={opt.id || opt.name} className="msf-option">
                <input
                  type="checkbox"
                  checked={selected.includes(opt.name)}
                  onChange={() => toggle(opt.name)}
                />
                <span>{opt.name}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {selected.length > 0 && (
        <div className="msf-chips">
          {selected.map((name) => (
            <span key={name} className="msf-chip">
              {name}
              <button
                type="button"
                onClick={() => toggle(name)}
                aria-label={`Remove ${name}`}
              >
                &times;
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default MultiSelectFilter;
