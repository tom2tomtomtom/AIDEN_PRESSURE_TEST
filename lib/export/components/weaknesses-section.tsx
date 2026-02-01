import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fonts, fontSize, spacing } from '../report-styles'

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.black,
    padding: spacing.page,
    fontFamily: fonts.body,
    color: colors.white,
  },
  sectionTitle: {
    fontSize: fontSize.h1,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.section,
    borderBottomWidth: 2,
    borderBottomColor: colors.scoreLow,
    paddingBottom: spacing.small,
  },
  intro: {
    fontSize: fontSize.body,
    color: colors.whiteMuted,
    marginBottom: spacing.section,
    lineHeight: 1.5,
  },
  weaknessCard: {
    backgroundColor: colors.weaknessBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.weaknessBorder,
    padding: spacing.item,
    marginBottom: spacing.item,
  },
  weaknessHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  weaknessTitle: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
    color: colors.white,
    flex: 1,
  },
  severityBadge: {
    fontSize: fontSize.tiny,
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  severityCritical: {
    backgroundColor: colors.redHot,
    color: colors.white,
  },
  severityMajor: {
    backgroundColor: colors.orange,
    color: colors.white,
  },
  severityMinor: {
    backgroundColor: colors.whiteDim,
    color: colors.white,
  },
  evidenceContainer: {
    marginTop: spacing.small,
  },
  evidenceLabel: {
    fontSize: fontSize.tiny,
    color: colors.whiteDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.tiny,
  },
  evidenceItem: {
    fontSize: fontSize.small,
    color: colors.whiteMuted,
    marginBottom: spacing.tiny,
    paddingLeft: spacing.small,
  },
  quoteSection: {
    marginTop: spacing.section,
  },
  quoteSectionTitle: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.item,
  },
  quoteCard: {
    backgroundColor: colors.blackCard,
    padding: spacing.item,
    marginBottom: spacing.item,
    borderLeftWidth: 3,
    borderLeftColor: colors.scoreLow,
  },
  quoteText: {
    fontSize: fontSize.body,
    fontStyle: 'italic',
    color: colors.white,
    lineHeight: 1.5,
    marginBottom: spacing.tiny,
  },
  quoteAttribution: {
    fontSize: fontSize.small,
    color: colors.whiteMuted,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: spacing.page,
    right: spacing.page,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: colors.whiteDim,
    paddingTop: spacing.small,
  },
  footerText: {
    fontSize: fontSize.tiny,
    color: colors.whiteDim,
  },
})

interface Weakness {
  point: string
  evidence: string[]
  severity: 'critical' | 'major' | 'minor'
}

interface VerbatimHighlight {
  persona_name: string
  archetype: string
  quote: string
  topic: 'strength' | 'weakness' | 'general'
}

interface WeaknessesSectionProps {
  weaknesses: Weakness[]
  verbatimHighlights?: VerbatimHighlight[]
}

export function WeaknessesSection({ weaknesses, verbatimHighlights = [] }: WeaknessesSectionProps) {
  const weaknessQuotes = verbatimHighlights.filter((v) => v.topic === 'weakness').slice(0, 3)

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'critical':
        return styles.severityCritical
      case 'major':
        return styles.severityMajor
      default:
        return styles.severityMinor
    }
  }

  // Sort by severity - critical first
  const sortedWeaknesses = [...weaknesses].sort((a, b) => {
    const order: Record<string, number> = { critical: 0, major: 1, minor: 2 }
    return (order[a.severity] ?? 2) - (order[b.severity] ?? 2)
  })

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Key Weaknesses</Text>
      <Text style={styles.intro}>
        These friction points and credibility gaps were identified by the panel. Addressing these
        issues will significantly improve performance.
      </Text>

      {sortedWeaknesses.map((weakness, index) => (
        <View key={index} style={styles.weaknessCard}>
          <View style={styles.weaknessHeader}>
            <Text style={styles.weaknessTitle}>{weakness.point}</Text>
            <Text style={[styles.severityBadge, getSeverityStyle(weakness.severity)]}>
              {weakness.severity}
            </Text>
          </View>
          {weakness.evidence && weakness.evidence.length > 0 && (
            <View style={styles.evidenceContainer}>
              <Text style={styles.evidenceLabel}>Panel Feedback</Text>
              {weakness.evidence.slice(0, 3).map((evidence, i) => (
                <Text key={i} style={styles.evidenceItem}>
                  {evidence}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}

      {weaknessQuotes.length > 0 && (
        <View style={styles.quoteSection}>
          <Text style={styles.quoteSectionTitle}>Critical Voices</Text>
          {weaknessQuotes.map((quote, index) => (
            <View key={index} style={styles.quoteCard}>
              <Text style={styles.quoteText}>&ldquo;{quote.quote}&rdquo;</Text>
              <Text style={styles.quoteAttribution}>
                {quote.persona_name} ({quote.archetype})
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>AIDEN Pressure Test</Text>
        <Text style={styles.footerText}>Page 5</Text>
      </View>
    </Page>
  )
}
