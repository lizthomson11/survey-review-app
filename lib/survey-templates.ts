export type QuestionType =
  | "rating-5"
  | "rating-10"
  | "nps"
  | "multiple-choice"
  | "multi-select"
  | "open-text"
  | "yes-no"

export interface TemplateQuestion {
  text: string
  type: QuestionType
  options?: string[]
  required?: boolean
}

export interface SurveyTemplate {
  id: string
  title: string
  description: string
  questions: number
  defaultQuestions: TemplateQuestion[]
}

export const quickstartTemplates: SurveyTemplate[] = [
  {
    id: "tenant-satisfaction",
    title: "Tenant satisfaction",
    description: "Measure overall workplace satisfaction across key dimensions.",
    questions: 8,
    defaultQuestions: [
      { text: "How satisfied are you with your workspace overall?",          type: "rating-5",        required: true },
      { text: "What do you like most about your workplace?",                 type: "multiple-choice", required: false, options: ["Natural light", "Collaborative spaces", "Amenities", "Location", "Quiet zones"] },
      { text: "What needs the most improvement?",                            type: "multiple-choice", required: false, options: ["Air quality", "Meeting room availability", "Noise levels", "Temperature control", "Parking"] },
      { text: "Would you recommend this workplace to a colleague?",          type: "yes-no",          required: true },
      { text: "How would you rate the quality of building amenities?",       type: "rating-5",        required: false },
      { text: "How satisfied are you with the building management team?",    type: "rating-5",        required: false },
      { text: "How likely are you to renew your lease?",                     type: "nps",             required: false },
      { text: "Any additional comments or suggestions?",                     type: "open-text",       required: false },
    ],
  },
  {
    id: "amenities",
    title: "Amenities & services",
    description: "Rate building amenities, services, and common areas.",
    questions: 6,
    defaultQuestions: [
      { text: "How would you rate the overall quality of building amenities?", type: "rating-5",     required: true },
      { text: "Which amenities do you use most frequently?",                   type: "multi-select", required: false, options: ["Gym", "Café", "Meeting rooms", "Parking", "Bike storage", "Lockers"] },
      { text: "How satisfied are you with cleaning and maintenance?",          type: "rating-5",     required: false },
      { text: "How would you rate building security?",                         type: "rating-5",     required: false },
      { text: "What amenity would you most like to see added?",                type: "open-text",    required: false },
      { text: "Overall, how would you rate building services?",                type: "rating-5",     required: true },
    ],
  },
  {
    id: "nps",
    title: "Net Promoter Score",
    description: "Single-question NPS with optional follow-up.",
    questions: 2,
    defaultQuestions: [
      { text: "On a scale of 0–10, how likely are you to recommend this workplace to a colleague?", type: "nps",       required: true },
      { text: "What is the main reason for your score?",                                             type: "open-text", required: false },
    ],
  },
  {
    id: "trivia-giveaway",
    title: "Trivia & giveaway",
    description: "Run a contest or trivia game. Define your own questions.",
    questions: 0,
    defaultQuestions: [],
  },
]

export function getTemplateQuestions(templateId: string | null): Array<{
  id: string; text: string; type: QuestionType; options: string[]; required: boolean
}> {
  if (!templateId) return []
  const tpl = quickstartTemplates.find(t => t.id === templateId)
  if (!tpl) return []
  return tpl.defaultQuestions.map((q, i) => ({
    id: `${templateId}-${i}`,
    text: q.text,
    type: q.type,
    options: q.options ?? [],
    required: q.required ?? false,
  }))
}
