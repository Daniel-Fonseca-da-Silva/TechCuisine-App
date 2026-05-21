import { canvasToPdfPages } from '../canvas-to-pdf-pages'

export interface ReportKpiLabels {
  ingredients: string
  recipes: string
  plates: string
  suppliers: string
  salesRecords: string
  totalSales: string
  totalRecipeCost: string
  users?: string
  countsSection?: string
  financialsSection?: string
}

export interface ReportMeta {
  title: string
  subtitle: string
  generatedLabel: string
  date: string
}

export interface TenantReportData {
  ingredients: number
  recipes: number
  plates: number
  suppliers: number
  sales_records: number
  total_sales_line_total: string
  total_recipe_cost: string
  users?: number
}

function _fmt(value: string): string {
  const n = parseFloat(value)
  return isNaN(n) ? '0.00' : n.toFixed(2)
}

function buildReportHtml(data: TenantReportData, labels: ReportKpiLabels, meta: ReportMeta): string {
  const countKpis: Array<{ label: string; value: string }> = []

  if (data.users !== undefined && labels.users) {
    countKpis.push({ label: labels.users, value: String(data.users) })
  }
  countKpis.push(
    { label: labels.ingredients, value: String(data.ingredients) },
    { label: labels.recipes, value: String(data.recipes) },
    { label: labels.plates, value: String(data.plates) },
    { label: labels.suppliers, value: String(data.suppliers) },
    { label: labels.salesRecords, value: String(data.sales_records) },
  )

  const monetaryKpis = [
    { label: labels.totalSales, value: `€ ${_fmt(data.total_sales_line_total)}` },
    { label: labels.totalRecipeCost, value: `€ ${_fmt(data.total_recipe_cost)}` },
  ]

  const kpiCards = (items: Array<{ label: string; value: string }>, monetary = false) =>
    items
      .map(
        (k) => `
      <div class="kpi-card${monetary ? ' kpi-monetary' : ''}">
        <div class="kpi-label">${k.label}</div>
        <div class="kpi-value">${k.value}</div>
      </div>`
      )
      .join('')

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
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      margin-bottom: 20px;
    }
    .kpi-grid-2 {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin-bottom: 32px;
    }
    .kpi-card {
      background: #f8f9fa;
      border: 1px solid #e9ecef;
      border-radius: 10px;
      padding: 18px 20px;
    }
    .kpi-label {
      font-size: 11px;
      color: #6c757d;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 8px;
    }
    .kpi-value { font-size: 28px; font-weight: 700; color: #1a1a2e; }
    .kpi-monetary .kpi-value { font-size: 22px; color: #198754; }
    .footer {
      border-top: 1px solid #e9ecef;
      padding-top: 14px;
      text-align: center;
      color: #adb5bd;
      font-size: 11px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>${meta.title}</h1>
    <p>${meta.subtitle}</p>
  </div>

  ${labels.countsSection ? `<p class="section-label">${labels.countsSection}</p>` : ''}
  <div class="kpi-grid">
    ${kpiCards(countKpis)}
  </div>

  ${labels.financialsSection ? `<p class="section-label">${labels.financialsSection}</p>` : ''}
  <div class="kpi-grid-2">
    ${kpiCards(monetaryKpis, true)}
  </div>

  <div class="footer">${meta.generatedLabel} ${meta.date} · Tech Cuisine</div>
</body>
</html>`
}

export async function generateSummaryReportPdf(
  data: TenantReportData,
  labels: ReportKpiLabels,
  meta: ReportMeta,
  filename: string
): Promise<void> {
  if (typeof window === 'undefined') throw new Error('generateSummaryReportPdf is client-only')

  const html2canvas = (await import('html2canvas-pro')).default
  const { jsPDF } = await import('jspdf')

  const htmlContent = buildReportHtml(data, labels, meta)

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
