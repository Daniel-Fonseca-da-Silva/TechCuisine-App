import { canvasToPdfPages } from '../canvas-to-pdf-pages'
import { BestPrice, PriceObservation } from '@/types/price-observation.types'

export interface PriceHistoryPdfLabels {
  title: string
  subtitle: string
  generatedLabel: string
  date: string
  bestPricesSection: string
  historySection: string
  rankCol: string
  supplierCol: string
  priceCol: string
  unitCol: string
  currencyCol: string
  observedAtCol: string
  packLabelCol: string
  noSupplier: string
  noPack: string
}

function _fmtDate(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))
  } catch {
    return iso
  }
}

function _fmtPrice(value: string): string {
  const n = parseFloat(value)
  return isNaN(n) ? value : n.toFixed(2)
}

function buildBestPricesRows(items: BestPrice[], labels: PriceHistoryPdfLabels, supplierMap: Map<string, string>): string {
  if (!items.length) return '<tr><td colspan="6" style="text-align:center;color:#6c757d;padding:12px;">—</td></tr>'
  return items
    .map(
      (b) => `
    <tr>
      <td>${b.rank}</td>
      <td>${b.supplier_id ? (supplierMap.get(b.supplier_id) ?? b.supplier_id) : labels.noSupplier}</td>
      <td style="font-weight:600;color:#198754;">${_fmtPrice(b.price_per_unit)} ${b.currency}</td>
      <td>${b.unit}</td>
      <td>${_fmtDate(b.observed_at)}</td>
      <td>${b.pack_label ?? labels.noPack}</td>
    </tr>`
    )
    .join('')
}

function buildHistoryRows(items: PriceObservation[], labels: PriceHistoryPdfLabels, supplierMap: Map<string, string>): string {
  if (!items.length) return '<tr><td colspan="5" style="text-align:center;color:#6c757d;padding:12px;">—</td></tr>'
  return items
    .map(
      (h) => `
    <tr>
      <td>${_fmtDate(h.observed_at)}</td>
      <td>${_fmtPrice(h.price_per_unit)} ${h.currency}</td>
      <td>${h.unit}</td>
      <td>${h.supplier_id ? (supplierMap.get(h.supplier_id) ?? h.supplier_id) : labels.noSupplier}</td>
      <td>${h.pack_label ?? labels.noPack}</td>
    </tr>`
    )
    .join('')
}

function buildHtml(
  ingredientName: string,
  bestPrices: BestPrice[],
  history: PriceObservation[],
  labels: PriceHistoryPdfLabels,
  supplierMap: Map<string, string>
): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', Arial, sans-serif;
      background: #fff;
      color: #1a1a2e;
      width: 800px;
      padding: 40px;
    }
    .header {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      color: white;
      padding: 36px 40px;
      border-radius: 12px;
      margin-bottom: 32px;
    }
    .header h1 { font-size: 26px; font-weight: 700; margin-bottom: 8px; }
    .header p { font-size: 14px; opacity: 0.72; }
    .section-label {
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: #6c757d;
      font-weight: 600;
      margin-bottom: 12px;
      margin-top: 28px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 24px;
      font-size: 13px;
    }
    th {
      background: #f8f9fa;
      border-bottom: 2px solid #dee2e6;
      padding: 10px 12px;
      text-align: left;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: #6c757d;
    }
    td {
      padding: 10px 12px;
      border-bottom: 1px solid #f1f3f5;
      color: #1a1a2e;
    }
    tr:last-child td { border-bottom: none; }
    .footer {
      border-top: 1px solid #e9ecef;
      padding-top: 14px;
      text-align: center;
      color: #adb5bd;
      font-size: 11px;
      margin-top: 16px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${labels.title}: ${ingredientName}</h1>
    <p>${labels.subtitle}</p>
  </div>

  <p class="section-label">${labels.bestPricesSection}</p>
  <table>
    <thead>
      <tr>
        <th>${labels.rankCol}</th>
        <th>${labels.supplierCol}</th>
        <th>${labels.priceCol}</th>
        <th>${labels.unitCol}</th>
        <th>${labels.observedAtCol}</th>
        <th>${labels.packLabelCol}</th>
      </tr>
    </thead>
    <tbody>${buildBestPricesRows(bestPrices, labels, supplierMap)}</tbody>
  </table>

  <p class="section-label">${labels.historySection}</p>
  <table>
    <thead>
      <tr>
        <th>${labels.observedAtCol}</th>
        <th>${labels.priceCol}</th>
        <th>${labels.unitCol}</th>
        <th>${labels.supplierCol}</th>
        <th>${labels.packLabelCol}</th>
      </tr>
    </thead>
    <tbody>${buildHistoryRows(history, labels, supplierMap)}</tbody>
  </table>

  <div class="footer">${labels.generatedLabel} ${labels.date} · Tech Cuisine</div>
</body>
</html>`
}

export async function generatePriceHistoryPdf(
  ingredientName: string,
  bestPrices: BestPrice[],
  history: PriceObservation[],
  labels: PriceHistoryPdfLabels,
  supplierMap: Map<string, string>,
  filename: string
): Promise<void> {
  if (typeof window === 'undefined') throw new Error('generatePriceHistoryPdf is client-only')

  const html2canvas = (await import('html2canvas-pro')).default
  const { jsPDF } = await import('jspdf')

  const htmlContent = buildHtml(ingredientName, bestPrices, history, labels, supplierMap)

  const iframe = document.createElement('iframe')
  iframe.style.cssText =
    'position:absolute;left:-9999px;top:-9999px;width:800px;height:auto;border:none;background:white'
  document.body.appendChild(iframe)

  await new Promise<void>((resolve) => {
    iframe.onload = () => resolve()
    iframe.src = 'about:blank'
  })

  const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
  if (iframeDoc) iframeDoc.documentElement.innerHTML = htmlContent

  await new Promise((resolve) => setTimeout(resolve, 500))

  const body = iframe.contentDocument?.body
  if (!body) {
    document.body.removeChild(iframe)
    throw new Error('Cannot access iframe body')
  }

  const canvas = await html2canvas(body, {
    scale: 1.5,
    useCORS: true,
    allowTaint: true,
    backgroundColor: '#ffffff',
    logging: false,
    width: 800,
  })

  document.body.removeChild(iframe)

  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  canvasToPdfPages(pdf, canvas)
  pdf.save(filename)
}
