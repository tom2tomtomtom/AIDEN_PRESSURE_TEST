/**
 * Moderator Module
 * AI-powered focus group moderation system
 */

export {
  analyzeBrief,
  detectLiteralInterpretation,
  summarizeModerationNeeds,
  type BriefAnalysis,
  type ToneIntent,
  type CreativeDevice,
  type LiteralInterpretationRedFlag
} from './brief-analyzer'

export {
  determineFollowUpNeeded,
  generateClarification,
  generateProbe,
  generateDrawOut,
  generateAcknowledgment,
  generateFollowUp,
  selectForFollowUp,
  type FollowUpType,
  type FollowUpResult
} from './follow-up-generator'

export {
  orchestrateConversation,
  storeConversationTurns,
  getFinalResponses,
  type ConversationTurn,
  type ConversationResult,
  type OrchestratorConfig
} from './conversation-orchestrator'
