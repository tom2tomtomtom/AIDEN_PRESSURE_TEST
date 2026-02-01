import { Page, View, Text, StyleSheet } from '@react-pdf/renderer'
import { colors, fonts, fontSize, spacing, getScoreColor, safeText } from '../report-styles'

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
    borderBottomColor: colors.whiteDim,
    paddingBottom: spacing.small,
  },
  intro: {
    fontSize: fontSize.body,
    color: colors.whiteMuted,
    marginBottom: spacing.section,
    lineHeight: 1.5,
  },
  personaCard: {
    backgroundColor: colors.blackCard,
    padding: spacing.item,
    marginBottom: spacing.section,
    borderWidth: 1,
    borderColor: colors.whiteDim,
  },
  personaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.item,
    paddingBottom: spacing.small,
    borderBottomWidth: 1,
    borderBottomColor: colors.whiteDim,
  },
  personaInfo: {
    flex: 1,
  },
  personaName: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
    color: colors.white,
    marginBottom: spacing.tiny,
  },
  archetypeBadge: {
    fontSize: fontSize.tiny,
    color: colors.redHot,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  metricsContainer: {
    flexDirection: 'row',
    gap: spacing.item,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricValue: {
    fontSize: fontSize.h3,
    fontFamily: fonts.heading,
  },
  metricLabel: {
    fontSize: fontSize.tiny,
    color: colors.whiteDim,
    textTransform: 'uppercase',
  },
  responseSection: {
    marginTop: spacing.small,
  },
  responseLabel: {
    fontSize: fontSize.tiny,
    color: colors.whiteDim,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: spacing.tiny,
  },
  responseText: {
    fontSize: fontSize.small,
    color: colors.white,
    lineHeight: 1.5,
    marginBottom: spacing.small,
  },
  emotionalBadge: {
    fontSize: fontSize.tiny,
    paddingHorizontal: 6,
    paddingVertical: 2,
    backgroundColor: colors.blackDeep,
    color: colors.whiteMuted,
    alignSelf: 'flex-start',
    marginTop: spacing.tiny,
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

interface PersonaResponse {
  id: string
  archetype_id: string
  archetype: {
    id: string
    name: string
    slug: string
    category: string
    baseline_skepticism: string
  }
  generated_name: string
  response_data: {
    gut_reaction: string
    considered_view: string
    social_response: string
    private_thought: string
    purchase_intent: number
    credibility_rating: number
    emotional_response: string
    key_concerns: string[]
    what_would_convince: string[]
    what_works?: string[]
  }
  memories_used: string[]
  created_at: string
}

interface PersonaAppendixProps {
  responses: PersonaResponse[]
}

export function PersonaAppendix({ responses }: PersonaAppendixProps) {
  // Split responses into pages (2 per page for readability)
  const responsesPerPage = 2
  const pages: PersonaResponse[][] = []

  for (let i = 0; i < responses.length; i += responsesPerPage) {
    pages.push(responses.slice(i, i + responsesPerPage))
  }

  return (
    <>
      {pages.map((pageResponses, pageIndex) => (
        <Page key={pageIndex} size="A4" style={styles.page}>
          {pageIndex === 0 && (
            <>
              <Text style={styles.sectionTitle}>Appendix: Full Panel Responses</Text>
              <Text style={styles.intro}>
                Detailed responses from each phantom consumer in the panel.
              </Text>
            </>
          )}

          {pageResponses.map((response) => (
            <View key={response.id} style={styles.personaCard}>
              <View style={styles.personaHeader}>
                <View style={styles.personaInfo}>
                  <Text style={styles.personaName}>{safeText(response.generated_name)}</Text>
                  <Text style={styles.archetypeBadge}>{safeText(response.archetype?.name)}</Text>
                </View>
                <View style={styles.metricsContainer}>
                  <View style={styles.metricItem}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: getScoreColor((response.response_data?.purchase_intent || 0) * 10) },
                      ]}
                    >
                      {safeText(response.response_data?.purchase_intent)}
                    </Text>
                    <Text style={styles.metricLabel}>Intent</Text>
                  </View>
                  <View style={styles.metricItem}>
                    <Text
                      style={[
                        styles.metricValue,
                        { color: getScoreColor((response.response_data?.credibility_rating || 0) * 10) },
                      ]}
                    >
                      {safeText(response.response_data?.credibility_rating)}
                    </Text>
                    <Text style={styles.metricLabel}>Credibility</Text>
                  </View>
                </View>
              </View>

              <View style={styles.responseSection}>
                <Text style={styles.responseLabel}>Gut Reaction</Text>
                <Text style={styles.responseText}>{safeText(response.response_data?.gut_reaction)}</Text>
              </View>

              <View style={styles.responseSection}>
                <Text style={styles.responseLabel}>Considered View</Text>
                <Text style={styles.responseText}>{safeText(response.response_data?.considered_view)}</Text>
              </View>

              {response.response_data?.private_thought && (
                <View style={styles.responseSection}>
                  <Text style={styles.responseLabel}>Private Thought</Text>
                  <Text style={styles.responseText}>{safeText(response.response_data.private_thought)}</Text>
                </View>
              )}

              <Text style={styles.emotionalBadge}>
                {safeText(response.response_data?.emotional_response)}
              </Text>
            </View>
          ))}

          <View style={styles.footer}>
            <Text style={styles.footerText}>AIDEN Pressure Test</Text>
            <Text style={styles.footerText}>Page {7 + pageIndex}</Text>
          </View>
        </Page>
      ))}
    </>
  )
}
