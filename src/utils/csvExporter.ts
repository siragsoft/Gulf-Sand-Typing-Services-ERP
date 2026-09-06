/**
 * CSV Exporter Utility with UTF-8 BOM support for Arabic text
 * Gulfsand Typing & Commercial Services ERP - Al Ain, UAE
 */

export function downloadCSV(filename: string, headers: string[], rows: (string | number | boolean | null | undefined)[][]) {
  // Escape cell content for CSV
  const escapeCell = (cell: any): string => {
    if (cell === null || cell === undefined) return '""';
    const str = String(cell).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(',');
  const rowLines = rows.map((r) => r.map(escapeCell).join(','));
  const csvContent = [headerLine, ...rowLines].join('\r\n');

  // \uFEFF is the UTF-8 Byte Order Mark (BOM) ensuring Excel displays Arabic correctly
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
