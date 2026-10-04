import type { MarkRow } from "@/types/certificate";

const COLUMNS: { field: keyof MarkRow; label: string }[] = [
  { field: "theoryMax", label: "Theory Max" },
  { field: "theoryMin", label: "Theory Min" },
  { field: "practicalMax", label: "Prac Max" },
  { field: "practicalMin", label: "Prac Min" },
  { field: "total", label: "Total" },
  { field: "grade", label: "Grade" },
];

export function MarkTableEditor({
  rows,
  errors,
  onChange,
  onRemove,
  onAdd,
}: {
  rows: MarkRow[];
  errors?: string;
  onChange: (index: number, field: keyof MarkRow, value: string) => void;
  onRemove?: (index: number) => void;
  onAdd?: () => void;
}) {
  return (
    <div className="mark-editor">
      {errors ? (
        <p className="field-error" role="alert">
          {errors}
        </p>
      ) : null}
      <div className="mark-editor-scroll">
        <table className="mark-editor-table">
          <thead>
            <tr>
              <th className="mark-editor-paper">#</th>
              <th className="mark-editor-subject">Subject</th>
              {COLUMNS.map((c) => (
                <th key={c.field}>{c.label}</th>
              ))}
              {onRemove ? <th style={{ width: 32 }} /> : null}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.paper}>
                <td className="mark-editor-paper">{i + 1}</td>
                {/* Subject — now editable */}
                <td className="mark-editor-subject">
                  <input
                    className="mark-editor-input"
                    value={row.subject}
                    placeholder="Subject name"
                    aria-label={`Subject ${i + 1}`}
                    onChange={(e) => onChange(i, "subject", e.target.value)}
                  />
                </td>
                {COLUMNS.map((c) => (
                  <td key={c.field}>
                    <input
                      className="mark-editor-input"
                      value={row[c.field]}
                      aria-label={`${row.subject} ${c.label}`}
                      onChange={(e) => onChange(i, c.field, e.target.value)}
                    />
                  </td>
                ))}
                {onRemove ? (
                  <td style={{ textAlign: "center", padding: "2px 4px" }}>
                    <button
                      type="button"
                      aria-label={`Remove row ${i + 1}`}
                      title="Remove subject"
                      disabled={rows.length <= 1}
                      onClick={() => onRemove(i)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        justifyContent: "center",
                        width: 24,
                        height: 24,
                        borderRadius: 4,
                        border: "none",
                        background: rows.length <= 1 ? "#f1f5f9" : "#fee2e2",
                        color: rows.length <= 1 ? "#cbd5e1" : "#dc2626",
                        cursor: rows.length <= 1 ? "not-allowed" : "pointer",
                        fontSize: 16,
                        lineHeight: 1,
                      }}
                    >
                      ×
                    </button>
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add Subject row button */}
      {onAdd ? (
        <button
          type="button"
          onClick={onAdd}
          style={{
            marginTop: 8,
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            fontSize: 13,
            fontWeight: 600,
            color: "#1F3354",
            background: "#f0f4ff",
            border: "1px dashed #1F3354",
            borderRadius: 6,
            padding: "5px 12px",
            cursor: "pointer",
          }}
        >
          <span style={{ fontSize: 18, lineHeight: 1 }}>+</span> Add Subject
        </button>
      ) : null}
    </div>
  );
}
