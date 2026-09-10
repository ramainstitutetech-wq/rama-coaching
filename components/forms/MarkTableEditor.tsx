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
}: {
  rows: MarkRow[];
  errors?: string;
  onChange: (index: number, field: keyof MarkRow, value: string) => void;
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
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.paper}>
                <td className="mark-editor-paper">{row.paper}</td>
                <td className="mark-editor-subject">{row.subject}</td>
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
