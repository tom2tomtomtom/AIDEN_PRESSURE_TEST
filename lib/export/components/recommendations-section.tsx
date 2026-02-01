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
    borderBottomColor: '#6366f1',
    paddingBottom: spacing.small,
  },
  intro: {
    fontSize: fontSize.body,
    color: colors.whiteMuted,
    marginBottom: spacing.section,
    lineHeight: 1.5,
  },
  recommendationCard: {
    backgroundColor: colors.recommendationBg,
    borderLeftWidth: 4,
    padding: spacing.item,
    marginBottom: spacing.item,
  },
  cardMustFix: {
    borderLeftColor: colors.redHot,
  },
  cardShouldImprove: {
    borderLeftColor: colors.orange,
  },
  cardNiceToHave: {
    borderLeftColor: '#3b82f6',
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.small,
  },
  priorityBadge: {
    fontSize: fontSize.tiny,
    paddingHorizontal: 8,
    paddingVertical: 3,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: spacing.small,
  },
  priorityMustFix: {
    backgroundColor: colors.redHot,
    color: colors.white,
  },
  priorityShouldImprove: {
    backgroundColor: colors.orange,
    color: colors.white,
  },
  priorityNiceToHave: {
    backgroundColor: '#3b82f6',
    color: colors.white,
  },
  effortBadge: {
    fontSize: fontSize.tiny,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.blackCard,
    color: colors.whiteMuted,
  },
  recommendationTitle: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
    color: colors.white,
    flex: 1,
    marginBottom: spacing.small,
  },
  recommendationRationale: {
    fontSize: fontSize.small,
    color: colors.whiteMuted,
    lineHeight: 1.5,
    marginTop: spacing.tiny,
  },
  badgeContainer: {
    flexDirection: 'row',
  },
  summarySection: {
    marginTop: spacing.section,
    backgroundColor: colors.blackCard,
    padding: spacing.section,
  },
  summaryTitle: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.item,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.small,
  },
  summaryLabel: {
    fontSize: fontSize.body,
    color: colors.whiteMuted,
  },
  summaryValue: {
    fontSize: fontSize.body,
    fontFamily: fonts.heading,
    color: colors.white,
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

interface Recommendation {
  recommendation: string
  rationale: string
  priority: 'must_fix' | 'should_improve' | 'nice_to_have'
  effort?: 'low' | 'medium' | 'high'
}

interface RecommendationsSectionProps {
  recommendations: Recommendation[]
}

export function RecommendationsSection({ recommendations }: RecommendationsSectionProps) {
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case 'must_fix':
        return { badge: styles.priorityMustFix, card: styles.cardMustFix }
      case 'should_improve':
        return { badge: styles.priorityShouldImprove, card: styles.cardShouldImprove }
      default:
        return { badge: styles.priorityNiceToHave, card: styles.cardNiceToHave }
    }
  }

  const formatPriority = (priority: string) => {
    return priority.replace('_', ' ')
  }

  // Sort by priority - must_fix first
  const sortedRecommendations = [...recommendations].sort((a, b) => {
    const order: Record<string, number> = { must_fix: 0, should_improve: 1, nice_to_have: 2 }
    return (order[a.priority] ?? 2) - (order[b.priority] ?? 2)
  })

  // Count by priority
  const counts = {
    must_fix: recommendations.filter((r) => r.priority === 'must_fix').length,
    should_improve: recommendations.filter((r) => r.priority === 'should_improve').length,
    nice_to_have: recommendations.filter((r) => r.priority === 'nice_to_have').length,
  }

  return (
    <Page size="A4" style={styles.page}>
      <Text style={styles.sectionTitle}>Recommendations</Text>
      <Text style={styles.intro}>
        Prioritized actions based on panel feedback. Focus on Must Fix items first for
        maximum impact.
      </Text>

      {sortedRecommendations.map((rec, index) => {
        const priorityStyle = getPriorityStyle(rec.priority)
        return (
          <View key={index} style={[styles.recommendationCard, priorityStyle.card]}>
            <View style={styles.recommendationHeader}>
              <View style={styles.badgeContainer}>
                <Text style={[styles.priorityBadge, priorityStyle.badge]}>
                  {formatPriority(rec.priority)}
                </Text>
                {rec.effort && (
                  <Text style={styles.effortBadge}>{rec.effort} effort</Text>
                )}
              </View>
            </View>
            <Text style={styles.recommendationTitle}>{rec.recommendation}</Text>
            {rec.rationale && (
              <Text style={styles.recommendationRationale}>{rec.rationale}</Text>
            )}
          </View>
        )
      })}

      <View style={styles.summarySection}>
        <Text style={styles.summaryTitle}>Action Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Must Fix</Text>
          <Text style={[styles.summaryValue, { color: colors.redHot }]}>{counts.must_fix}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Should Improve</Text>
          <Text style={[styles.summaryValue, { color: colors.orange }]}>{counts.should_improve}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Nice to Have</Text>
          <Text style={[styles.summaryValue, { color: '#3b82f6' }]}>{counts.nice_to_have}</Text>
        </View>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>AIDEN Pressure Test</Text>
        <Text style={styles.footerText}>Page 6</Text>
      </View>
    </Page>
  )
}
