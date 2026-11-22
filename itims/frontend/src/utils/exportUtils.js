// PDF and Excel export - done fully in the browser (frontend)
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

// columns = [{ header: 'Name', key: 'name' }], rows = array of plain objects
export function exportPDF({ title, columns, rows, filtersText }) {
  const doc = new jsPDF({ orientation: columns.length > 6 ? 'landscape' : 'portrait' });
  const width = doc.internal.pageSize.getWidth();

  // Header band
  doc.setFillColor(79, 70, 229);
  doc.rect(0, 0, width, 22, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.text('ITIMS - IT Infrastructure Management System', 14, 10);
  doc.setFontSize(10);
  doc.text(title, 14, 17);

  doc.setTextColor(100);
  doc.setFontSize(9);
  doc.text(`Generated: ${new Date().toLocaleString('en-IN')}   |   Records: ${rows.length}${filtersText ? '   |   Filters: ' + filtersText : ''}`, 14, 29);

  autoTable(doc, {
    startY: 33,
    head: [columns.map((c) => c.header)],
    body: rows.map((r) => columns.map((c) => r[c.key] ?? '')),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [79, 70, 229] },
    alternateRowStyles: { fillColor: [245, 247, 255] },
  });

  doc.save(`${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportExcel({ title, columns, rows }) {
  // Convert rows to { "Header": value } objects so Excel has nice column names
  const data = rows.map((r) => Object.fromEntries(columns.map((c) => [c.header, r[c.key] ?? ''])));
  const sheet = XLSX.utils.json_to_sheet(data);
  sheet['!cols'] = columns.map((c) => ({ wch: Math.max(c.header.length + 2, 16) }));
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, title.slice(0, 30));
  XLSX.writeFile(book, `${title.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.xlsx`);
}
