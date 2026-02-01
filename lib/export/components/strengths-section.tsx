import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fonts, fontSize, spacing, safeText } from '../report-styles'

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
    borderBottomColor: colors.scoreHigh,
    paddingBottom: spacing.small,
  },
  intro: {
    fontSize: fontSize.body,
    color: colors.whiteMuted,
    marginBottom: spacing.section,
    lineHeight: 1.5,
  },
  strengthCard: {
    backgroundColor: colors.strengthBg,
    borderLeftWidth: 4,
    borderLeftColor: colors.strengthBorder,
    padding: spacing.item,
    marginBottom: spacing.item,
  },
  strengthHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.small,
  },
  strengthTitle: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
    color: colors.white,
    flex: 1,
  },
  confidenceBadge: {
    fontSize: fontSize.tiny,
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  confidenceHigh: {
    backgroundColor: colors.scoreHigh,
    color: colors.black,
  },
  confidenceMedium: {
    backgroundColor: colors.scoreMedium,
    color: colors.black,
  },
  confidenceLow: {
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
    borderLeftColor: colors.scoreHigh,
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

interface Strength {
  point: string
  evidence: string[]
  confidence: 'high' | 'medium' | 'low'
}

interface VerbatimHighlight {
  persona_name: string
  archetype: string
  quote: string
  topic: 'strength' | 'weakness' | 'general'
}

interface StrengthsSectionProps {
  strengths: Strength[]
  verbatimHighlights?: VerbatimHighlight[]
}

export function StrengthsSection({ strengths, verbatimHighlights = [] }: StrengthsSectionProps) {
  const strengthQuotes = verbatimHighlights.filter((v) => v.topic === 'strength').slice(0, 3)

  const getConfidenceStyle = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return styles.confidenceHigh
      case 'medium':
        return styles.confidenceMedium
      default:
        return styles.confidenceLow
    }
  }

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Key Strengths</Text>
      <Text style={styles.intro}>
        These elements resonated positively with the phantom consumer panel and represent areas of
        competitive advantage.
      </Text>

      {strengths.map((strength, index) => (
        <View key={index} style={styles.strengthCard}>
          <View style={styles.strengthHeader}>
            <Text style={styles.strengthTitle}>{safeText(strength.point)}</Text>
            <Text style={[styles.confidenceBadge, getConfidenceStyle(strength.confidence)]}>
              {safeText(strength.confidence)}
            </Text>
          </View>
          {strength.evidence && strength.evidence.length > 0 && (
            <View style={styles.evidenceContainer}>
              <Text style={styles.evidenceLabel}>Supporting Evidence</Text>
              {strength.evidence.slice(0, 3).map((evidence, i) => (
                <Text key={i} style={styles.evidenceItem}>
                  {safeText(evidence)}
                </Text>
              ))}
            </View>
          )}
        </View>
      ))}

      {strengthQuotes.length > 0 && (
        <View style={styles.quoteSection}>
          <Text style={styles.quoteSectionTitle}>Supporting Voices</Text>
          {strengthQuotes.map((quote, index) => (
            <View key={index} style={styles.quoteCard}>
              <Text style={styles.quoteText}>&ldquo;{safeText(quote.quote)}&rdquo;</Text>
              <Text style={styles.quoteAttribution}>
                {safeText(quote.persona_name)} ({safeText(quote.archetype)})
              </Text>
            </View>
          ))}
        </View>
      )}

      <View style={styles.footer}>
        <Text style={styles.footerText}>AIDEN Pressure Test</Text>
        <Text style={styles.footerText}>Page 4</Text>
      </View>
    </Page>
  )
}
