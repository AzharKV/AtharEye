// pdf.ts — client-side PDF export (jsPDF, dynamically imported so it stays out of the main bundle).
// §6 fixes: ~3 pages (cover+exec on p1, findings on p2+, methodology on final); scoped coverage;
// no dev language; scan evidence per finding; NSR works breakdown; depth split (zone vs project).
// All colours from locked Blueprint+teal tokens only.
import type { ReportModel } from './reports';
import type { NsrItem } from '../types';

const hex = (h: string): [number, number, number] => [
  parseInt(h.slice(1, 3), 16),
  parseInt(h.slice(3, 5), 16),
  parseInt(h.slice(5, 7), 16),
];

// Locked token RGB values (SPEC §6.2)
const INK = hex('#1B2A3D');
const NAVY = hex('#1E3A66');
const TEAL = hex('#18837E');
const AMBER = hex('#B5781A');
const RED = hex('#C0492F');
const MUTED = hex('#64748B');
const CANVAS = hex('#EDF1F6');
const HAIRLINE = hex('#D8E1EC');
const WHITE: [number, number, number] = [255, 255, 255];
const GREEN = TEAL;

const SEVERITY_COLOR: Record<string, [number, number, number]> = {
  Critical: RED,
  Major: AMBER,
  Minor: hex('#9AA7B6'),
  Cosmetic: hex('#94A3B8'),
};

const SEVERITY_DEF: Record<string, string> = {
  Critical: 'Affects safety, structural integrity or weather-tightness; fix immediately.',
  Major: 'Affects function or fails to meet spec; fix before handover.',
  Minor: 'Noticeable but does not affect function; fix within agreed time.',
  Cosmetic: 'Surface blemish only; address during snagging.',
};

const PAGE_W = 210;
const PAGE_H = 297;
const ML = 18;
const MR = 18;
const MT = 20;
const CONTENT_W = PAGE_W - ML - MR;

// Decode image via Canvas → clean JPEG data URL. Avoids jsPDF colour-space/alpha issues.
async function toDataUrl(url: string): Promise<string | null> {
  return new Promise<string | null>((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      try {
        const w = img.naturalWidth || img.width;
        const h = img.naturalHeight || img.height;
        if (!w || !h) { resolve(null); return; }
        const canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      } catch {
        resolve(null);
      }
    };
    img.onerror = () => resolve(null);
    img.src = url;
  });
}

export async function generatePdf(report: ReportModel, scope: 'project' | 'zone', activeZoneId?: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const activeZone = scope === 'zone' && activeZoneId
    ? report.project.zones.find((z) => z.id === activeZoneId)
    : null;

  // Scoped coverage: zone export shows the zone's %, project export shows project %
  const displayCoverage = activeZone ? activeZone.coverage : report.coverage;

  const issues = activeZone
    ? report.openIssues.filter((i) => i.zone === activeZone.name)
    : report.openIssues;

  const zones = activeZone
    ? report.zones.filter((z) => z.id === activeZoneId)
    : report.zones;

  const scopeLabel = activeZone ? activeZone.name : 'Whole project';
  const contractor = report.project.contractor ?? 'Cairn Refurbishment Ltd';
  const preparedBy = report.project.preparedBy ?? 'J. Mackay · Site Supervisor';

  // Zone-scoped exec summary — avoids project-level prose when drilling into a single zone
  const displaySummary = activeZone
    ? (() => {
        const nf = issues.length;
        if (nf === 0) {
          return `${displayCoverage}% of the ${activeZone.name} zone verified — ${activeZone.stage.toLowerCase()} stage. No findings raised in this zone.`;
        }
        const sevCounts = (['Critical', 'Major', 'Minor', 'Cosmetic'] as const)
          .map((s) => ({ s, n: issues.filter((i) => i.severity === s).length }))
          .filter((x) => x.n > 0);
        const sevStr = sevCounts.map((x) => `${x.n} ${x.s.toLowerCase()}`).join(', ');
        return `${displayCoverage}% of the ${activeZone.name} zone verified — ${activeZone.stage.toLowerCase()} stage. ${nf} finding${nf > 1 ? 's' : ''} raised: ${sevStr}.`;
      })()
    : report.summary;

  // Pre-fetch finding thumbnails for evidence images
  const thumbnailDataUrls: Record<string, string | null> = {};
  await Promise.all(
    issues.map(async (issue) => {
      if (issue.thumbnail) {
        thumbnailDataUrls[issue.id] = await toDataUrl(issue.thumbnail);
      }
    }),
  );

  let y = 0;
  let pageNum = 0;

  const drawHeader = (pageTitle: string) => {
    doc.setFillColor(...NAVY);
    doc.rect(0, 0, PAGE_W, 22, 'F');
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    doc.text('OptiSync', ML, 14);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(180, 195, 215);
    doc.text(pageTitle, PAGE_W - MR, 14, { align: 'right' });
  };

  const drawFooter = (n: number) => {
    doc.setDrawColor(...HAIRLINE);
    doc.line(ML, PAGE_H - 14, PAGE_W - MR, PAGE_H - 14);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text('Generated by OptiSync · OptiSync P Ltd · Confidential', ML, PAGE_H - 9);
    doc.text(`Page ${n}`, PAGE_W - MR, PAGE_H - 9, { align: 'right' });
  };

  const addPage = (title: string) => {
    if (pageNum > 0) doc.addPage();
    pageNum++;
    drawHeader(title);
    y = MT + 8;
  };

  const BODY_MAX = PAGE_H - 22;

  const ensureSpace = (needed: number, title: string) => {
    if (y + needed > BODY_MAX) {
      drawFooter(pageNum);
      addPage(title);
    }
  };

  // ────────────────────────────────────────────────────────────────────────
  // PAGE 1 — COVER + EXEC SUMMARY (combined to reduce empty pages)
  // ────────────────────────────────────────────────────────────────────────
  addPage('Progress Report');

  // Teal accent bar
  doc.setFillColor(...TEAL);
  doc.rect(ML, 28, 4, 32, 'F');

  // Project name
  doc.setFontSize(17);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  const nameLines = doc.splitTextToSize(report.project.name, CONTENT_W - 12) as string[];
  doc.text(nameLines, ML + 10, 40);

  // Scope label
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(`Progress Report · ${scopeLabel}`, ML + 10, 40 + nameLines.length * 7 + 3);

  // Meta block
  const metaY = 65;
  doc.setFillColor(...CANVAS);
  doc.roundedRect(ML, metaY, CONTENT_W, 60, 3, 3, 'F');

  const meta: [string, string][] = [
    ['Project', report.project.name],
    ['Address', report.project.location],
    ['Client', report.project.client],
    ['Contractor', contractor],
    ['Scope', scopeLabel],
    ['Report date', report.date],
    ['Prepared by', preparedBy],
    ['BIM model', `${report.project.bim.file} (LOD ${report.project.bim.lod})`],
    ['Coverage', `${displayCoverage}%`],
    ['Accuracy', '±17 mm'],
  ];

  doc.setFontSize(8);
  let my = metaY + 7;
  meta.forEach(([k, v]) => {
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED);
    doc.text(k, ML + 5, my);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    const vStr = v.length > 38 ? v.slice(0, 37) + '…' : v;
    doc.text(vStr, ML + 36, my);
    my += 5.5;
  });

  // Coverage donut
  const cx = PAGE_W - MR - 22;
  const cy = metaY + 30;
  doc.setFillColor(...NAVY);
  doc.circle(cx, cy, 17, 'F');
  doc.setFillColor(...WHITE);
  doc.circle(cx, cy, 11, 'F');
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  doc.text(`${displayCoverage}%`, cx, cy + 3.5, { align: 'center' });

  // Executive summary (on same page)
  y = metaY + 66;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Executive Summary', ML, y);
  y += 7;

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...INK);
  const summaryLines = doc.splitTextToSize(displaySummary, CONTENT_W) as string[];
  doc.text(summaryLines, ML, y);
  y += summaryLines.length * 4.5 + 8;

  // Severity tally (compact, same page if space)
  ensureSpace(30, 'Findings');

  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Severity Tally', ML, y);
  y += 7;

  const sevs = ['Critical', 'Major', 'Minor', 'Cosmetic'] as const;
  const tileW = CONTENT_W / 4 - 2;
  sevs.forEach((sev, i) => {
    const count = issues.filter((iss) => iss.severity === sev).length;
    const tx = ML + i * (tileW + 2.6);
    doc.setFillColor(...CANVAS);
    doc.roundedRect(tx, y, tileW, 18, 2, 2, 'F');
    doc.setFillColor(...SEVERITY_COLOR[sev]);
    doc.circle(tx + 5, y + 5, 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(String(count), tx + tileW / 2, y + 10, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SEVERITY_COLOR[sev]);
    doc.text(sev, tx + tileW / 2, y + 15.5, { align: 'center' });
  });
  y += 24;

  drawFooter(pageNum);

  // ────────────────────────────────────────────────────────────────────────
  // ZONE PROGRESS (project scope only — not shown for zone export)
  // ────────────────────────────────────────────────────────────────────────
  if (scope === 'project' && zones.length > 0) {
    addPage('Zone Progress');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text('Progress by Zone', ML, y);
    y += 8;

    zones.forEach((z) => {
      ensureSpace(14, 'Zone Progress');
      const barW = CONTENT_W - 30;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      doc.text(z.name, ML, y);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(`${z.coverage}%`, PAGE_W - MR, y, { align: 'right' });
      y += 4;
      doc.setFillColor(...HAIRLINE);
      doc.roundedRect(ML, y, barW, 4, 2, 2, 'F');
      const fillW = (z.coverage / 100) * barW;
      const fillColor = z.coverage >= 100 ? TEAL : NAVY;
      doc.setFillColor(...fillColor);
      if (fillW > 0) doc.roundedRect(ML, y, fillW, 4, 2, 2, 'F');
      y += 10;
    });

    drawFooter(pageNum);
  }

  // ────────────────────────────────────────────────────────────────────────
  // FINDINGS REGISTER (one card per finding, with scan evidence image)
  // ────────────────────────────────────────────────────────────────────────
  addPage('Findings Register');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Findings Register', ML, y);
  y += 8;

  if (issues.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(activeZone ? 'No findings raised in this zone.' : 'No open findings for this scope.', ML, y);
    y += 8;
  }

  for (const issue of issues) {
    const thumbDataUrl = thumbnailDataUrls[issue.id] ?? null;
    const thumbH = thumbDataUrl ? 28 : 0;

    const rows: [string, string][] = [
      ['Location', `${issue.zone}${issue.location_detail ? ' — ' + issue.location_detail : ''}`],
      ['Finding', issue.finding ?? issue.title],
      ['Measured', issue.measured ?? '—'],
      ['Tolerance', issue.tolerance ?? '—'],
      ['Deviation', issue.deviation ?? '—'],
      ['Impact', issue.impact ?? '—'],
      ['Action', issue.action ?? '—'],
      ['Responsible', issue.responsible ?? '—'],
      ['Status', `${issue.status} · raised ${issue.raised}`],
    ];

    const lineH = 4.5;
    const cardPad = 5;
    let estH = 12 + cardPad * 2 + thumbH;
    rows.forEach(([, v]) => {
      const lines = doc.splitTextToSize(v, CONTENT_W - 48) as string[];
      estH += lines.length * lineH + 1.5;
    });

    ensureSpace(estH, 'Findings Register (continued)');

    doc.setFillColor(...CANVAS);
    doc.roundedRect(ML, y, CONTENT_W, estH, 3, 3, 'F');
    doc.setDrawColor(...HAIRLINE);
    doc.roundedRect(ML, y, CONTENT_W, estH, 3, 3, 'S');

    // Header
    doc.setFillColor(...SEVERITY_COLOR[issue.severity]);
    doc.circle(ML + cardPad + 2, y + cardPad + 2.5, 2.5, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(`${issue.id} · ${issue.severity}`, ML + cardPad + 7, y + cardPad + 3.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(`Raised ${issue.raised}`, PAGE_W - MR - cardPad, y + cardPad + 3.5, { align: 'right' });

    doc.setDrawColor(...HAIRLINE);
    doc.line(ML + cardPad, y + cardPad + 6.5, PAGE_W - MR - cardPad, y + cardPad + 6.5);

    let ry = y + cardPad + 11;

    // Scan evidence image
    if (thumbDataUrl) {
      try {
        const imgX = ML + cardPad;
        const imgW = CONTENT_W - cardPad * 2;
        doc.addImage(thumbDataUrl, 'JPEG', imgX, ry, imgW, thumbH - 2, undefined, 'MEDIUM');
      } catch {
        // If image fails, skip silently
      }
      ry += thumbH;
    }

    rows.forEach(([k, v]) => {
      const vLines = doc.splitTextToSize(v, CONTENT_W - 48) as string[];
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...MUTED);
      doc.text(k, ML + cardPad, ry);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...INK);
      doc.text(vLines, ML + 40, ry);
      ry += vLines.length * lineH + 1.5;
    });

    y += estH + 5;
  }

  drawFooter(pageNum);

  // ────────────────────────────────────────────────────────────────────────
  // NSR WORKS BREAKDOWN
  // ────────────────────────────────────────────────────────────────────────
  const zonesWithWorks = scope === 'zone' && activeZone
    ? (activeZone.works && activeZone.works.length > 0 ? [activeZone] : [])
    : report.project.zones.filter((z) => z.works && z.works.length > 0);

  if (zonesWithWorks.length > 0) {
    addPage('NSR Works Schedule');

    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...NAVY);
    doc.text('NSR Works Schedule', ML, y);
    y += 5;
    doc.setFontSize(8.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text('National Schedule of Rates — works items by zone', ML, y);
    y += 9;

    if (scope === 'project') {
      // Project: rollup summary first
      const totalItems = zonesWithWorks.reduce((s, z) => s + (z.works?.length ?? 0), 0);
      const doneItems = zonesWithWorks.reduce((s, z) => s + (z.works?.filter((w) => w.status === 'Done').length ?? 0), 0);

      ensureSpace(14, 'NSR Works Schedule');
      doc.setFillColor(...CANVAS);
      doc.roundedRect(ML, y, CONTENT_W, 10, 2, 2, 'F');
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      doc.text(`${doneItems} of ${totalItems} scheduled items complete`, ML + 5, y + 6.5);
      const barX = ML + 100;
      const barW2 = CONTENT_W - 105;
      doc.setFillColor(...HAIRLINE);
      doc.roundedRect(barX, y + 3, barW2, 4, 2, 2, 'F');
      const fillW2 = totalItems > 0 ? (doneItems / totalItems) * barW2 : 0;
      doc.setFillColor(...TEAL);
      if (fillW2 > 0) doc.roundedRect(barX, y + 3, fillW2, 4, 2, 2, 'F');
      y += 15;
    }

    // Table per zone
    zonesWithWorks.forEach((zone) => {
      const works = zone.works ?? [];
      if (works.length === 0) return;

      const tableH = 8 + works.length * 7 + 5;
      ensureSpace(tableH + 14, 'NSR Works Schedule');

      if (scope === 'project') {
        // Zone sub-header
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...NAVY);
        doc.text(zone.name, ML, y);
        y += 5;
      }

      // Column headers
      const cols = ['Code', 'Description', 'Unit', 'Qty', 'Status'];
      const colW = [30, 78, 12, 12, 42];
      let cx2 = ML;
      doc.setFontSize(7.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...MUTED);
      cols.forEach((h, i) => { doc.text(h, cx2, y); cx2 += colW[i]; });
      y += 2;
      doc.setDrawColor(...HAIRLINE);
      doc.line(ML, y, PAGE_W - MR, y);
      y += 4;

      works.forEach((w: NsrItem, ri: number) => {
        if (ri % 2 === 0) {
          doc.setFillColor(...CANVAS);
          doc.rect(ML, y - 3, CONTENT_W, 7, 'F');
        }
        let rwx = ML;
        doc.setFontSize(7.5);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(...MUTED);
        doc.text(w.code, rwx, y); rwx += colW[0];
        doc.setTextColor(...INK);
        const descStr = w.description.length > 34 ? w.description.slice(0, 33) + '…' : w.description;
        doc.text(descStr, rwx, y); rwx += colW[1];
        doc.setTextColor(...MUTED);
        doc.text(w.unit, rwx, y); rwx += colW[2];
        doc.text(String(w.qty), rwx, y); rwx += colW[3];
        const statusColor = w.status === 'Done' ? GREEN : w.status === 'In progress' ? AMBER : MUTED;
        doc.setTextColor(...statusColor);
        doc.setFont('helvetica', 'bold');
        doc.text(w.status, rwx, y);
        y += 7;
      });
      y += 5;
    });

    drawFooter(pageNum);
  }

  // ────────────────────────────────────────────────────────────────────────
  // FINAL PAGE — METHODOLOGY + SIGN-OFF
  // ────────────────────────────────────────────────────────────────────────
  addPage('Methodology & Sign-off');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Methodology & Limitations', ML, y);
  y += 8;

  const methodology = [
    'Geometry captured using iPhone LiDAR (ARKit Scene Reconstruction). Coverage computed by comparing the captured point cloud against the BIM reference model.',
    `BIM reference: ${report.project.bim.file} (LOD ${report.project.bim.lod}, ${report.project.bim.disciplines.join(', ')}). Last aligned ${report.project.bim.last_aligned}.`,
    'Positional accuracy: ±17 mm. Works schedule follows the NSR (National Schedule of Rates) standard. Surface defects (cracks, dampness, finish quality) are outside scope.',
    'Tolerances: NHBC Standards 2024 / Scottish Building Standards where applicable.',
    'This report reflects site conditions at the time of scanning only. Subsequent works are not represented.',
  ];
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...INK);
  methodology.forEach((para) => {
    const lines = doc.splitTextToSize(para, CONTENT_W) as string[];
    ensureSpace(lines.length * 4.5 + 6, 'Methodology & Sign-off');
    doc.text(lines, ML, y);
    y += lines.length * 4.5 + 4;
  });

  // Severity definitions
  y += 4;
  ensureSpace(40, 'Methodology & Sign-off');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Severity Definitions', ML, y);
  y += 7;
  sevs.forEach((sev) => {
    doc.setFillColor(...SEVERITY_COLOR[sev]);
    doc.circle(ML + 2.5, y - 1, 2, 'F');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(sev, ML + 7, y);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text(SEVERITY_DEF[sev], ML + 28, y);
    y += 6;
  });

  y += 6;
  ensureSpace(44, 'Methodology & Sign-off');

  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Sign-off', ML, y);
  y += 8;

  doc.setFillColor(...CANVAS);
  doc.roundedRect(ML, y, CONTENT_W, 36, 3, 3, 'F');

  const signoffs: [string, string][] = [
    ['Prepared by', `${preparedBy} · ${contractor}`],
    ['Reviewed by', '——————————————'],
    ['Date', report.date],
    ['Report ID', `RPT-${report.project.id.toUpperCase()}-${report.project.scans.filter((s) => s.status === 'Ready').length.toString().padStart(3, '0')}`],
  ];
  let sy = y + 7;
  signoffs.forEach(([k, v]) => {
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...MUTED);
    doc.text(k, ML + 5, sy);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...INK);
    doc.text(v, ML + 45, sy);
    sy += 7;
  });

  drawFooter(pageNum);

  return doc.output('blob');
}

// ─── Client progress summary — single page, visual, client-facing ───────────
// Donut + headline + severity tally + top findings (title/severity/zone only).
// No NSR tables, no methodology, no full finding fields.
export async function generateClientPdf(report: ReportModel, scope: 'project' | 'zone', activeZoneId?: string): Promise<Blob> {
  const { jsPDF } = await import('jspdf');
  const doc = new jsPDF({ unit: 'mm', format: 'a4', orientation: 'portrait' });

  const activeZone = scope === 'zone' && activeZoneId
    ? report.project.zones.find((z) => z.id === activeZoneId)
    : null;
  const displayCoverage = activeZone ? activeZone.coverage : report.coverage;
  const scopeLabel = activeZone ? activeZone.name : 'Whole project';
  const issues = activeZone
    ? report.openIssues.filter((i) => i.zone === activeZone.name)
    : report.openIssues;

  // Header
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, PAGE_W, 22, 'F');
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...WHITE);
  doc.text('OptiSync', ML, 14);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(180, 195, 215);
  doc.text('Client Progress Summary', PAGE_W - MR, 14, { align: 'right' });

  let y = 30;

  // Project name
  const nameLines = doc.splitTextToSize(report.project.name, CONTENT_W - 56) as string[];
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  doc.text(nameLines, ML, y);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text(`${scopeLabel} · ${report.date}`, ML, y + nameLines.length * 7 + 2);

  // Donut (right of title)
  const dCx = PAGE_W - MR - 24;
  const dCy = y + 11;
  doc.setFillColor(...NAVY);
  doc.circle(dCx, dCy, 20, 'F');
  doc.setFillColor(...WHITE);
  doc.circle(dCx, dCy, 13, 'F');
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  doc.text(`${displayCoverage}%`, dCx, dCy + 4, { align: 'center' });

  y += nameLines.length * 7 + 14;

  // Teal rule
  doc.setFillColor(...TEAL);
  doc.rect(ML, y, CONTENT_W, 2, 'F');
  y += 9;

  // Headline
  const stageText = activeZone ? activeZone.stage.toLowerCase() : 'in progress';
  const headline = `${displayCoverage}% of the BIM model verified — ${stageText} stage.`;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...INK);
  const headLines = doc.splitTextToSize(headline, CONTENT_W) as string[];
  doc.text(headLines, ML, y);
  y += headLines.length * 6.5 + 11;

  // Severity tally
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Findings', ML, y);
  y += 7;

  const sevs = ['Critical', 'Major', 'Minor', 'Cosmetic'] as const;
  const tileW = CONTENT_W / 4 - 2;
  sevs.forEach((sev, i) => {
    const count = issues.filter((iss) => iss.severity === sev).length;
    const tx = ML + i * (tileW + 2.6);
    doc.setFillColor(...CANVAS);
    doc.roundedRect(tx, y, tileW, 18, 2, 2, 'F');
    doc.setFillColor(...SEVERITY_COLOR[sev]);
    doc.circle(tx + 5, y + 5, 2, 'F');
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...INK);
    doc.text(String(count), tx + tileW / 2, y + 10, { align: 'center' });
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...SEVERITY_COLOR[sev]);
    doc.text(sev, tx + tileW / 2, y + 15.5, { align: 'center' });
  });
  y += 28;

  // Top findings — compact list (title + severity dot + zone only)
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...NAVY);
  doc.text('Open Findings', ML, y);
  y += 7;

  if (issues.length === 0) {
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...MUTED);
    doc.text('No open findings raised for this scope.', ML, y);
    y += 8;
  } else {
    const topN = Math.min(issues.length, 6);
    issues.slice(0, topN).forEach((issue) => {
      doc.setFillColor(...CANVAS);
      doc.roundedRect(ML, y, CONTENT_W, 11, 2, 2, 'F');
      doc.setFillColor(...SEVERITY_COLOR[issue.severity]);
      doc.circle(ML + 5, y + 5.5, 2.2, 'F');
      doc.setFontSize(8.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...INK);
      const titleStr = (issue.title ?? issue.finding ?? issue.id).slice(0, 52);
      doc.text(titleStr, ML + 11, y + 7);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(issue.zone, PAGE_W - MR, y + 7, { align: 'right' });
      y += 14;
    });
    if (issues.length > topN) {
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...MUTED);
      doc.text(`+ ${issues.length - topN} further findings — see Detailed site report`, ML, y);
    }
  }

  // Footer
  doc.setDrawColor(...HAIRLINE);
  doc.line(ML, PAGE_H - 14, PAGE_W - MR, PAGE_H - 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...MUTED);
  doc.text('Generated by OptiSync · OptiSync P Ltd · Confidential', ML, PAGE_H - 9);
  doc.text('Page 1 of 1', PAGE_W - MR, PAGE_H - 9, { align: 'right' });

  return doc.output('blob');
}
