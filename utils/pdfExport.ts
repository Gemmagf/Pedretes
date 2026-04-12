import jsPDF from 'jspdf';
import { Project } from '../types';

// Typical Swiss CHF VAT rate
const MwSt_RATE = 0.081; // 8.1%
const HOURLY_RATE = 120; // CHF / hour

const formatCHF = (amount: number) =>
  `CHF ${amount.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const formatDate = (iso: string) => {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

const typeLabel = (type: string) => {
  switch (type) {
    case 'Alliance': return 'Alliance · Ringfassung';
    case 'Fassung': return 'Steinfassung';
    case 'Pave': return 'Pavé · Steinpflasterung';
    default: return type;
  }
};

export const exportProjectQuote = (project: Project, atelierName = 'Pedretes Atelier') => {
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageW = 210;
  const pageH = 297;
  const margin = 20;
  const contentW = pageW - margin * 2;

  // ── Colors ─────────────────────────────────────────────────────────────────
  const gold = [184, 115, 51] as [number, number, number];      // #b87333 copper
  const darkGray = [40, 40, 40] as [number, number, number];
  const midGray = [100, 100, 100] as [number, number, number];
  const lightGray = [240, 238, 234] as [number, number, number];
  const white = [255, 255, 255] as [number, number, number];

  // ── Header bar ─────────────────────────────────────────────────────────────
  pdf.setFillColor(...gold);
  pdf.rect(0, 0, pageW, 28, 'F');

  pdf.setTextColor(...white);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(20);
  pdf.text(atelierName.toUpperCase(), margin, 18);

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.text('Schmuckatelier · Zürich', margin, 24);

  // Quote label top-right
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.text('OFFERTE', pageW - margin, 14, { align: 'right' });
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.text(`Nr. ${project.id?.substring(0, 8).toUpperCase() ?? '—'}`, pageW - margin, 19, { align: 'right' });
  pdf.text(`Datum: ${formatDate(new Date().toISOString())}`, pageW - margin, 24, { align: 'right' });

  // ── Client + Project info ──────────────────────────────────────────────────
  let y = 38;

  pdf.setTextColor(...darkGray);
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(10);
  pdf.text('Auftraggeber', margin, y);
  pdf.text('Projekt', pageW / 2, y);

  y += 5;
  pdf.setDrawColor(...lightGray);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageW - margin, y);
  y += 5;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(10);
  pdf.text(project.client || '—', margin, y);
  pdf.setFont('helvetica', 'bold');
  pdf.text(project.projectName || '—', pageW / 2, y);

  y += 5;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9);
  pdf.setTextColor(...midGray);
  pdf.text(typeLabel(project.sheetType), pageW / 2, y);
  if (project.deadline) {
    pdf.text(`Liefertermin: ${formatDate(project.deadline)}`, margin, y);
  }

  // ── Section: Leistungsbeschreibung ────────────────────────────────────────
  y += 14;
  pdf.setFillColor(...lightGray);
  pdf.rect(margin, y - 4, contentW, 8, 'F');
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(...darkGray);
  pdf.text('Leistungsbeschreibung', margin + 2, y + 0.5);
  pdf.text('Menge', 130, y + 0.5, { align: 'right' });
  pdf.text('Einzelpreis', 158, y + 0.5, { align: 'right' });
  pdf.text('Betrag', pageW - margin, y + 0.5, { align: 'right' });

  y += 10;
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);

  const rows: { desc: string; qty: string; unit: string; price: number }[] = [];

  // --- Build rows based on project type ---
  const timeHours = ((project.actualTime || project.totalTime || 0) / 60);

  // Working time
  if (timeHours > 0) {
    rows.push({
      desc: 'Arbeitszeit · Steinsetzerarbeit',
      qty: `${timeHours.toFixed(1)} h`,
      unit: `${HOURLY_RATE.toFixed(2)} CHF/h`,
      price: timeHours * HOURLY_RATE,
    });
  }

  // Stones
  if (project.stoneCount && project.pricePerStone) {
    rows.push({
      desc: `Steine · ${project.stoneType || 'n/a'} ${project.stoneSize ? `(${project.stoneSize} mm)` : ''}`.trim(),
      qty: `${project.stoneCount} Stk.`,
      unit: `${project.pricePerStone.toFixed(2)} CHF/Stk.`,
      price: project.stoneCount * project.pricePerStone,
    });
  }

  // Gold
  if (project.goldWeight && project.goldWeight > 0) {
    rows.push({
      desc: `Gold zurück · ${project.material || ''}`.trim(),
      qty: `${project.goldWeight.toFixed(2)} g`,
      unit: '—',
      price: 0,
    });
  }

  // Style / method details (informational row, no price)
  const details = [
    project.style ? `Stil: ${project.style}` : null,
    project.layout ? `Layout: ${project.layout}` : null,
    project.fixation ? `Fixierung: ${project.fixation}` : null,
    project.shape ? `Form: ${project.shape}` : null,
  ].filter(Boolean).join(' · ');

  if (details) {
    rows.push({ desc: details, qty: '', unit: '', price: 0 });
  }

  // Render rows
  rows.forEach((row, i) => {
    if (i % 2 === 0) {
      pdf.setFillColor(253, 251, 247);
      pdf.rect(margin, y - 4, contentW, 7, 'F');
    }
    pdf.setTextColor(...darkGray);
    pdf.text(row.desc, margin + 2, y);
    if (row.qty) pdf.text(row.qty, 130, y, { align: 'right' });
    if (row.unit) pdf.text(row.unit, 158, y, { align: 'right' });
    if (row.price > 0) {
      pdf.text(formatCHF(row.price), pageW - margin, y, { align: 'right' });
    }
    y += 8;
  });

  y += 4;
  pdf.setDrawColor(...lightGray);
  pdf.setLineWidth(0.3);
  pdf.line(margin, y, pageW - margin, y);
  y += 6;

  // ── Totals ─────────────────────────────────────────────────────────────────
  const subtotal = project.agreedPrice
    ? project.agreedPrice / (1 + MwSt_RATE)
    : rows.reduce((sum, r) => sum + r.price, 0);
  const mwst = subtotal * MwSt_RATE;
  const total = project.agreedPrice ?? subtotal + mwst;

  const totalsX = 130;
  const valX = pageW - margin;

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(9.5);
  pdf.setTextColor(...midGray);
  pdf.text('Zwischensumme', totalsX, y, { align: 'right' });
  pdf.setTextColor(...darkGray);
  pdf.text(formatCHF(subtotal), valX, y, { align: 'right' });
  y += 7;

  pdf.setTextColor(...midGray);
  pdf.text(`MwSt. ${(MwSt_RATE * 100).toFixed(1)}%`, totalsX, y, { align: 'right' });
  pdf.setTextColor(...darkGray);
  pdf.text(formatCHF(mwst), valX, y, { align: 'right' });
  y += 4;

  // Total bar
  pdf.setFillColor(...gold);
  pdf.rect(totalsX - 50, y, contentW - (totalsX - 50 - margin), 10, 'F');
  y += 7;
  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(11);
  pdf.setTextColor(...white);
  pdf.text('TOTAL', totalsX - 48 + 2, y);
  pdf.text(formatCHF(total), valX, y, { align: 'right' });

  y += 14;

  // ── Notes ──────────────────────────────────────────────────────────────────
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...midGray);
  const notes = [
    'Zahlungsbedingungen: 30 Tage netto ab Rechnungsdatum',
    'Gültigkeit des Angebots: 30 Tage',
    'Alle Preise in CHF inkl. MwSt.',
  ];
  notes.forEach(note => {
    pdf.text(`· ${note}`, margin, y);
    y += 5;
  });

  // ── Footer ─────────────────────────────────────────────────────────────────
  pdf.setFillColor(...lightGray);
  pdf.rect(0, pageH - 18, pageW, 18, 'F');
  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(8);
  pdf.setTextColor(...midGray);
  pdf.text(atelierName, margin, pageH - 10);
  pdf.text('Zürich, Schweiz', margin, pageH - 5);
  pdf.text('www.pedretes.ch', pageW / 2, pageH - 10, { align: 'center' });
  pdf.text('info@pedretes.ch', pageW / 2, pageH - 5, { align: 'center' });
  pdf.text(`Offerte ${project.id?.substring(0, 8).toUpperCase() ?? ''}`, pageW - margin, pageH - 10, { align: 'right' });
  pdf.text(`Seite 1 von 1`, pageW - margin, pageH - 5, { align: 'right' });

  // ── Save ───────────────────────────────────────────────────────────────────
  const filename = `Offerte_${project.projectName?.replace(/\s+/g, '_') ?? 'projekt'}_${new Date().toISOString().split('T')[0]}.pdf`;
  pdf.save(filename);
};
