// server/reportGenerator.js
import PDFDocument from "pdfkit";
import stream from "stream";

export function generateReport(kpis, aiSummary) {
  const doc = new PDFDocument({ margin: 50 });
  const bufferStream = new stream.PassThrough();

  doc.pipe(bufferStream);

  // Title
  doc.fontSize(20).text("AI-Generated Financial Summary Report", { align: "center" });
  doc.moveDown();

  // KPI Section
  doc.fontSize(14).text("Key Performance Indicators:", { underline: true });
  doc.moveDown(0.5);
  for (const [key, value] of Object.entries(kpis)) {
    doc.text(`${key}: ${value}`);
  }
  doc.moveDown(1.5);

  // AI Summary
  doc.fontSize(14).text("AI Summary:", { underline: true });
  doc.moveDown(0.5);
  doc.fontSize(12).text(aiSummary, {
    align: "justify",
    lineGap: 6,
  });

  doc.end();

  return bufferStream;
}
