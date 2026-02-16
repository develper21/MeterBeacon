// CSV Export utility
export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map(row =>
      headers.map(h => {
        const val = row[h] ?? "";
        const str = String(val).replace(/"/g, '""');
        return str.includes(",") || str.includes('"') || str.includes("\n") ? `"${str}"` : str;
      }).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.csv`;
  link.click();
  URL.revokeObjectURL(link.href);
}

// Simple PDF-like text export (no external dependency)
export function exportToText(data: Record<string, any>[], filename: string, title: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const colWidths = headers.map(h => Math.max(h.length, ...data.map(r => String(r[h] ?? "").length)));

  const separator = colWidths.map(w => "-".repeat(w + 2)).join("+");
  const headerRow = headers.map((h, i) => ` ${h.padEnd(colWidths[i])} `).join("|");

  const lines = [
    `=== ${title} ===`,
    `Generated: ${new Date().toLocaleString("en-IN")}`,
    `Total Records: ${data.length}`,
    "",
    separator,
    headerRow,
    separator,
    ...data.map(row => headers.map((h, i) => ` ${String(row[h] ?? "").padEnd(colWidths[i])} `).join("|")),
    separator,
  ];

  const blob = new Blob([lines.join("\n")], { type: "text/plain;charset=utf-8;" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `${filename}_${new Date().toISOString().split("T")[0]}.txt`;
  link.click();
  URL.revokeObjectURL(link.href);
}
