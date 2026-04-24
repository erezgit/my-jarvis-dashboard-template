import type { TableSection } from "../types";

export function TableSection({ section }: { section: TableSection }) {
  return (
    <div className="overflow-x-auto rounded-lg border">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b bg-muted/40">
            {section.headers.map((h, i) => (
              <th key={i} className="px-3 py-2 text-left font-medium text-muted-foreground">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {section.rows.map((row, ri) => (
            <tr key={ri} className="border-b last:border-b-0">
              {row.map((cell, ci) => (
                <td key={ci} className="px-3 py-2 text-foreground">
                  {cell ?? ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
