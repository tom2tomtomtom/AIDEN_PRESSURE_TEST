/**
 * PDF Generator using jsPDF (no React dependency)
 */
import { jsPDF } from 'jspdf'

// AIDEN brand colors
const colors = {
  black: '#050505',
  white: '#ffffff',
  whiteMuted: '#999999',
  whiteDim: '#666666',
  redHot: '#ff2e2e',
  scoreHigh: '#22c55e',
  scoreMedium: '#eab308',
  scoreLow: '#ef4444',
}

function getScoreColor(score: number): string {
  if (score >= 70) return colors.scoreHigh
  if (score >= 50) return colors.scoreMedium
  return colors.scoreLow
}

function getScoreVerdict(score: number): string {
  if (score >= 80) return 'Excellent'
  if (score >= 70) return 'Strong'
  if (score >= 60) return 'Good'
  if (score >= 50) return 'Fair'
  if (score >= 40) return 'Needs Work'
  if (score >= 30) return 'Weak'
  return 'Critical'
}

// Safe text conversion
function safeText(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number' || typeof value === 'boolean') return String(value)
  if (typeof value === 'object') {
    if (Array.isArray(value)) return value.map(v => safeText(v)).join(', ')
    try { return JSON.stringify(value) } catch { return '[Object]' }
  }
  return String(value)
}

interface TestData {
  name: string
  stimulus_type: string
  created_at: string
  completed_at?: string
}

interface ProjectData {
  name: string
}

interface TestResultData {
  pressure_score: number
  gut_attraction_index: number
  credibility_score: number
  one_line_verdict?: string
  key_strengths?: Array<{ point: string; evidence: string[] }>
  key_weaknesses?: Array<{ point: string; evidence: string[] }>
  recommendations?: Array<{ recommendation: string; priority: string }>
}

export function generatePDF(
  test: TestData,
  project: ProjectData,
  result: TestResultData
): ArrayBuffer {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const contentWidth = pageWidth - margin * 2
  let y = margin

  // Helper function to add wrapped text
  function addWrappedText(text: string, x: number, yPos: number, maxWidth: number, lineHeight: number = 5): number {
    const lines = doc.splitTextToSize(safeText(text), maxWidth)
    doc.text(lines, x, yPos)
    return yPos + lines.length * lineHeight
  }

  // Helper to check if we need a new page
  function checkNewPage(neededSpace: number): void {
    if (y + neededSpace > pageHeight - margin) {
      doc.addPage()
      y = margin
    }
  }

  // === COVER PAGE ===
  doc.setFillColor(5, 5, 5) // colors.black
  doc.rect(0, 0, pageWidth, pageHeight, 'F')

  // Brand label
  doc.setTextColor(255, 46, 46) // colors.redHot
  doc.setFontSize(10)
  doc.text('PRESSURE TEST REPORT', margin, 50)

  // Decorative line
  doc.setDrawColor(255, 46, 46)
  doc.setLineWidth(0.5)
  doc.line(margin, 55, margin + 30, 55)

  // Title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(28)
  y = addWrappedText(safeText(test.name), margin, 70, contentWidth, 10)

  // Project name
  doc.setTextColor(153, 153, 153)
  doc.setFontSize(16)
  doc.text(safeText(project.name), margin, y + 10)

  // Meta info
  doc.setFontSize(10)
  doc.setTextColor(102, 102, 102)
  const formattedDate = new Date(test.completed_at || test.created_at).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
  doc.text(`Type: ${safeText(test.stimulus_type)}`, margin, y + 30)
  doc.text(`Date: ${formattedDate}`, margin, y + 37)

  // AIDEN logo at bottom
  doc.setTextColor(255, 46, 46)
  doc.setFontSize(20)
  doc.text('AIDEN', pageWidth / 2, pageHeight - 40, { align: 'center' })
  doc.setTextColor(102, 102, 102)
  doc.setFontSize(8)
  doc.text('SYNTHETIC QUALITATIVE RESEARCH', pageWidth / 2, pageHeight - 32, { align: 'center' })

  // === EXECUTIVE SUMMARY PAGE ===
  doc.addPage()
  doc.setFillColor(5, 5, 5)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  y = margin

  // Section title
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.text('Executive Summary', margin, y)
  doc.setDrawColor(255, 46, 46)
  doc.line(margin, y + 3, margin + 60, y + 3)
  y += 20

  // Score box
  doc.setFillColor(15, 15, 15)
  doc.roundedRect(margin, y, contentWidth, 50, 3, 3, 'F')

  // Pressure Score
  doc.setTextColor(102, 102, 102)
  doc.setFontSize(8)
  doc.text('PRESSURE SCORE', pageWidth / 2, y + 10, { align: 'center' })

  const scoreColor = getScoreColor(result.pressure_score)
  const [r, g, b] = hexToRgb(scoreColor)
  doc.setTextColor(r, g, b)
  doc.setFontSize(48)
  doc.text(String(Math.round(result.pressure_score)), pageWidth / 2, y + 35, { align: 'center' })

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(14)
  doc.text(getScoreVerdict(result.pressure_score), pageWidth / 2, y + 45, { align: 'center' })
  y += 60

  // One line verdict
  if (result.one_line_verdict) {
    doc.setTextColor(153, 153, 153)
    doc.setFontSize(10)
    y = addWrappedText(result.one_line_verdict, margin, y, contentWidth)
    y += 10
  }

  // Key takeaways
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(12)
  doc.text('KEY TAKEAWAYS', margin, y)
  y += 8

  let takeawayNum = 1
  if (result.key_strengths?.[0]) {
    doc.setTextColor(255, 46, 46)
    doc.text(String(takeawayNum), margin, y)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    y = addWrappedText(`Strength: ${result.key_strengths[0].point}`, margin + 8, y, contentWidth - 8)
    y += 5
    takeawayNum++
  }

  if (result.key_weaknesses?.[0]) {
    doc.setTextColor(255, 46, 46)
    doc.setFontSize(12)
    doc.text(String(takeawayNum), margin, y)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    y = addWrappedText(`Concern: ${result.key_weaknesses[0].point}`, margin + 8, y, contentWidth - 8)
    y += 5
    takeawayNum++
  }

  if (result.recommendations?.[0]) {
    doc.setTextColor(255, 46, 46)
    doc.setFontSize(12)
    doc.text(String(takeawayNum), margin, y)
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    y = addWrappedText(`Priority: ${result.recommendations[0].recommendation}`, margin + 8, y, contentWidth - 8)
  }

  // Footer
  addFooter(doc, 'Page 2')

  // === SCORES DASHBOARD ===
  doc.addPage()
  doc.setFillColor(5, 5, 5)
  doc.rect(0, 0, pageWidth, pageHeight, 'F')
  y = margin

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(18)
  doc.text('Scores Dashboard', margin, y)
  doc.setDrawColor(255, 46, 46)
  doc.line(margin, y + 3, margin + 55, y + 3)
  y += 30

  // Score cards
  const scores = [
    { value: result.pressure_score, label: 'Pressure Score' },
    { value: result.gut_attraction_index, label: 'Gut Attraction' },
    { value: result.credibility_score, label: 'Credibility' }
  ]

  const cardWidth = (contentWidth - 20) / 3
  scores.forEach((score, i) => {
    const x = margin + i * (cardWidth + 10)
    const color = getScoreColor(score.value)
    const [r, g, b] = hexToRgb(color)

    doc.setTextColor(r, g, b)
    doc.setFontSize(32)
    doc.text(String(Math.round(score.value)), x + cardWidth / 2, y, { align: 'center' })

    doc.setTextColor(153, 153, 153)
    doc.setFontSize(8)
    doc.text(score.label.toUpperCase(), x + cardWidth / 2, y + 10, { align: 'center' })

    // Score bar
    doc.setFillColor(30, 30, 30)
    doc.rect(x, y + 15, cardWidth, 3, 'F')
    doc.setFillColor(r, g, b)
    doc.rect(x, y + 15, cardWidth * (score.value / 100), 3, 'F')
  })

  addFooter(doc, 'Page 3')

  // === STRENGTHS ===
  if (result.key_strengths && result.key_strengths.length > 0) {
    doc.addPage()
    doc.setFillColor(5, 5, 5)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')
    y = margin

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text('Key Strengths', margin, y)
    doc.setDrawColor(34, 197, 94) // scoreHigh
    doc.line(margin, y + 3, margin + 45, y + 3)
    y += 15

    result.key_strengths.slice(0, 4).forEach(strength => {
      checkNewPage(30)
      doc.setFillColor(5, 46, 22)
      doc.setDrawColor(34, 197, 94)
      doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'FD')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      y = addWrappedText(safeText(strength.point), margin + 5, y + 8, contentWidth - 10)
      y += 20
    })

    addFooter(doc, 'Page 4')
  }

  // === WEAKNESSES ===
  if (result.key_weaknesses && result.key_weaknesses.length > 0) {
    doc.addPage()
    doc.setFillColor(5, 5, 5)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')
    y = margin

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text('Key Weaknesses', margin, y)
    doc.setDrawColor(239, 68, 68) // scoreLow
    doc.line(margin, y + 3, margin + 50, y + 3)
    y += 15

    result.key_weaknesses.slice(0, 4).forEach(weakness => {
      checkNewPage(30)
      doc.setFillColor(69, 10, 10)
      doc.setDrawColor(239, 68, 68)
      doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'FD')

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      y = addWrappedText(safeText(weakness.point), margin + 5, y + 8, contentWidth - 10)
      y += 20
    })

    addFooter(doc, 'Page 5')
  }

  // === RECOMMENDATIONS ===
  if (result.recommendations && result.recommendations.length > 0) {
    doc.addPage()
    doc.setFillColor(5, 5, 5)
    doc.rect(0, 0, pageWidth, pageHeight, 'F')
    y = margin

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(18)
    doc.text('Recommendations', margin, y)
    doc.setDrawColor(99, 102, 241) // indigo
    doc.line(margin, y + 3, margin + 55, y + 3)
    y += 15

    result.recommendations.slice(0, 5).forEach(rec => {
      checkNewPage(30)
      doc.setFillColor(30, 27, 75)
      doc.setDrawColor(99, 102, 241)
      doc.roundedRect(margin, y, contentWidth, 25, 2, 2, 'FD')

      // Priority badge
      const priorityColors: Record<string, [number, number, number]> = {
        'must_fix': [255, 46, 46],
        'should_improve': [255, 107, 0],
        'nice_to_have': [59, 130, 246]
      }
      const [pr, pg, pb] = priorityColors[rec.priority] || [102, 102, 102]
      doc.setFillColor(pr, pg, pb)
      doc.roundedRect(margin + 5, y + 3, 25, 6, 1, 1, 'F')
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(6)
      doc.text(rec.priority.replace('_', ' ').toUpperCase(), margin + 7, y + 7)

      doc.setTextColor(255, 255, 255)
      doc.setFontSize(11)
      y = addWrappedText(safeText(rec.recommendation), margin + 5, y + 15, contentWidth - 10)
      y += 15
    })

    addFooter(doc, 'Page 6')
  }

  return doc.output('arraybuffer')
}

function addFooter(doc: jsPDF, pageNum: string): void {
  const pageHeight = doc.internal.pageSize.getHeight()
  const pageWidth = doc.internal.pageSize.getWidth()
  doc.setDrawColor(102, 102, 102)
  doc.line(20, pageHeight - 15, pageWidth - 20, pageHeight - 15)
  doc.setTextColor(102, 102, 102)
  doc.setFontSize(8)
  doc.text('AIDEN Pressure Test', 20, pageHeight - 10)
  doc.text(pageNum, pageWidth - 20, pageHeight - 10, { align: 'right' })
}

function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? [parseInt(result[1] || 'ff', 16), parseInt(result[2] || 'ff', 16), parseInt(result[3] || 'ff', 16)]
    : [255, 255, 255]
}
