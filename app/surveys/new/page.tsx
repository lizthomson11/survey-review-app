"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  AlignLeft, ArrowLeft, BarChart2, Check, CheckSquare,
  Clock, Globe, GripVertical, List, MessageSquare,
  PenLine, Plus, Star, ThumbsUp, TrendingUp, Trash2, Zap,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { quickstartTemplates, getTemplateQuestions, type QuestionType } from "@/lib/survey-templates"

// ─── Types ────────────────────────────────────────────────────────────────────

type Step      = "start" | "editor"
type EditorTab = "details" | "questions" | "target" | "preview"

interface Question {
  id: string
  text: string
  type: QuestionType
  options: string[]
  required: boolean
}

// ─── Question type config ─────────────────────────────────────────────────────

const QUESTION_TYPES: { id: QuestionType; label: string; icon: React.ElementType }[] = [
  { id: "rating-5",        label: "Rating (1–5)",    icon: Star          },
  { id: "rating-10",       label: "Scale (1–10)",    icon: BarChart2     },
  { id: "nps",             label: "NPS (0–10)",      icon: TrendingUp    },
  { id: "multiple-choice", label: "Multiple choice", icon: List          },
  { id: "multi-select",    label: "Multi-select",    icon: CheckSquare   },
  { id: "open-text",       label: "Open text",       icon: AlignLeft     },
  { id: "yes-no",          label: "Yes / No",        icon: ThumbsUp      },
]

function qTypeConfig(type: QuestionType) {
  return QUESTION_TYPES.find(t => t.id === type) ?? QUESTION_TYPES[0]
}

// ─── Buildings data ───────────────────────────────────────────────────────────

const buildings = [
  { id: "t1", name: "Tower One",    tenants: 3, users: 68 },
  { id: "hp", name: "Harbor Plaza", tenants: 2, users: 52 },
]

// ─── Shared ───────────────────────────────────────────────────────────────────

const CARD = "rounded-xl border bg-card shadow-sm"

// ─── Quickstart step ──────────────────────────────────────────────────────────

function QuickstartStep({ onSelect, onBlank }: {
  onSelect: (id: string) => void
  onBlank: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className={cn(CARD, "overflow-hidden")}>
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            <h2 className="text-base font-semibold">Start from a template</h2>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">Pre-built question sets — edit anything after.</p>
        </div>
        <div className="grid grid-cols-2 divide-x divide-y">
          {quickstartTemplates.map((t) => (
            <button
              key={t.id}
              onClick={() => onSelect(t.id)}
              className="flex flex-col gap-1 p-5 text-left hover:bg-zinc-50 transition-colors"
            >
              <span className="text-sm font-semibold">{t.title}</span>
              <span className="text-xs text-muted-foreground leading-snug">{t.description}</span>
              {t.questions > 0 && (
                <span className="mt-1 text-xs text-muted-foreground">{t.questions} questions</span>
              )}
            </button>
          ))}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="h-px flex-1 bg-border" />
        <span className="text-xs text-muted-foreground">or</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      <button
        onClick={onBlank}
        className={cn(CARD, "flex flex-col gap-0.5 p-5 text-left hover:bg-zinc-50 transition-colors")}
      >
        <span className="text-sm font-semibold">Start from scratch</span>
        <span className="text-xs text-muted-foreground">Build your own survey with custom questions.</span>
      </button>
    </div>
  )
}

// ─── Sidebar tab nav ──────────────────────────────────────────────────────────

function TabNav({ tab, setTab, questionCount, detailsDone, targetDone }: {
  tab: EditorTab
  setTab: (t: EditorTab) => void
  questionCount: number
  detailsDone: boolean
  targetDone: boolean
}) {
  const tabs: { id: EditorTab; label: string; badge?: React.ReactNode }[] = [
    {
      id: "details",
      label: "Details",
      badge: detailsDone ? <Check className="size-4 text-emerald-500" /> : null,
    },
    {
      id: "questions",
      label: "Questions",
      badge: questionCount > 0
        ? <span className="text-xs text-muted-foreground">{questionCount}</span>
        : null,
    },
    {
      id: "target",
      label: "Target",
      badge: targetDone ? <Check className="size-4 text-emerald-500" /> : null,
    },
    { id: "preview", label: "Preview" },
  ]

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => setTab(t.id)}
          className={cn(
            "flex w-full items-center justify-between border-b px-5 py-3.5 text-sm last:border-0 transition-colors",
            tab === t.id
              ? "font-semibold text-foreground"
              : "font-medium text-muted-foreground hover:bg-zinc-50"
          )}
        >
          <span className="flex items-center gap-3">
            {tab === t.id && (
              <div className="h-4 w-0.5 -ml-1 rounded-full bg-primary" />
            )}
            {t.label}
          </span>
          {t.badge}
        </button>
      ))}
    </div>
  )
}

// ─── Details tab ──────────────────────────────────────────────────────────────

type DetailsData = {
  name: string; language: string; opens: string
  opensTime: string; closes: string; description: string
}

function DetailsTab({ data, onChange, templateLabel }: {
  data: DetailsData
  onChange: (patch: Partial<DetailsData>) => void
  templateLabel?: string
}) {
  const now = new Date()
  const today = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
  const currentTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  const [publishMode, setPublishMode] = React.useState<"now" | "schedule">("now")

  function handlePublishMode(mode: "now" | "schedule") {
    setPublishMode(mode)
    onChange({ opens: mode === "now" ? today : "", opensTime: mode === "now" ? currentTime : "" })
  }

  React.useEffect(() => {
    onChange({ opens: today, opensTime: currentTime })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={CARD}>
      {templateLabel ? (
        <div className="flex items-center gap-2 border-b bg-amber-50 px-5 py-3">
          <Zap className="size-3.5 text-amber-500 shrink-0" />
          <p className="text-xs text-amber-800">Using template: <span className="font-medium">{templateLabel}</span></p>
        </div>
      ) : (
        <div className="flex items-center gap-2 border-b bg-zinc-50 px-5 py-3">
          <PenLine className="size-3.5 text-zinc-400 shrink-0" />
          <p className="text-xs text-zinc-500">Starting from scratch — fill in the details below.</p>
        </div>
      )}
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Survey details</h2>
      </div>
      <div className="grid gap-5 px-5 py-6 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Survey name <span className="text-red-500">*</span></label>
          <Input
            placeholder={templateLabel ? `e.g. ${templateLabel} — Q2 2026` : "e.g. Tenant satisfaction Q3"}
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            className="rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">Language</label>
          <Select value={data.language} onValueChange={(v) => onChange({ language: v })}>
            <SelectTrigger className="rounded-lg">
              <Globe className="mr-2 size-4 text-muted-foreground" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="en">English</SelectItem>
              <SelectItem value="fr">French</SelectItem>
              <SelectItem value="de">German</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Publish date <span className="text-red-500">*</span></label>
          <div className="inline-flex w-fit rounded-lg border bg-background text-sm overflow-hidden">
            <button
              type="button"
              onClick={() => handlePublishMode("now")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 font-medium transition-colors",
                publishMode === "now" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-zinc-50"
              )}
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => handlePublishMode("schedule")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 font-medium border-l transition-colors",
                publishMode === "schedule" ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-zinc-50"
              )}
            >
              <Clock className="size-3.5" /> Schedule
            </button>
          </div>
          {publishMode === "now" && (
            <p className="text-xs text-muted-foreground">Goes live immediately — {today} at {currentTime}</p>
          )}
          {publishMode === "schedule" && (
            <div className="flex gap-2">
              <Input
                placeholder="MM/DD/YYYY"
                value={data.opens}
                onChange={(e) => onChange({ opens: e.target.value })}
                className="rounded-lg"
                autoFocus
              />
              <Input
                placeholder="12:00 PM"
                value={data.opensTime}
                onChange={(e) => onChange({ opensTime: e.target.value })}
                className="rounded-lg w-32 shrink-0"
              />
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium">End date <span className="text-red-500">*</span></label>
          <Input
            placeholder="MM/DD/YYYY"
            value={data.closes}
            onChange={(e) => onChange({ closes: e.target.value })}
            className="rounded-lg"
          />
        </div>
        <div className="flex flex-col gap-1.5 sm:col-span-2">
          <label className="text-sm font-medium">
            Description <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <textarea
            placeholder="What is this survey measuring?"
            rows={3}
            value={data.description}
            onChange={(e) => onChange({ description: e.target.value })}
            className="rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>
    </div>
  )
}

// ─── Questions tab ────────────────────────────────────────────────────────────

function QuestionsTab({ questions, onChange }: {
  questions: Question[]
  onChange: (qs: Question[]) => void
}) {
  const [showTypeMenu, setShowTypeMenu] = React.useState(false)
  const menuRef = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowTypeMenu(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [])

  function addQuestion(type: QuestionType) {
    onChange([...questions, {
      id: Math.random().toString(36).slice(2),
      text: "",
      type,
      options: (type === "multiple-choice" || type === "multi-select")
        ? ["Option 1", "Option 2", "Option 3"]
        : [],
      required: false,
    }])
    setShowTypeMenu(false)
  }

  function update(id: string, patch: Partial<Question>) {
    onChange(questions.map(q => q.id === id ? { ...q, ...patch } : q))
  }

  function remove(id: string) {
    onChange(questions.filter(q => q.id !== id))
  }

  return (
    <div className="flex flex-col gap-3">
      {questions.length === 0 && (
        <div className={cn(CARD, "py-12 text-center")}>
          <p className="text-sm font-medium text-muted-foreground">No questions yet</p>
          <p className="mt-1 text-xs text-muted-foreground">Add your first question below.</p>
        </div>
      )}

      {questions.map((q, i) => {
        const cfg = qTypeConfig(q.type)
        const Icon = cfg.icon
        return (
          <div key={q.id} className={cn(CARD, "overflow-hidden")}>
            <div className="flex items-start gap-3 p-4">
              <GripVertical className="mt-2.5 size-4 shrink-0 text-muted-foreground/30 cursor-grab" />
              <div className="flex-1 flex flex-col gap-3">
                {/* Question row */}
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground w-5 shrink-0">{i + 1}.</span>
                  <Input
                    placeholder="Type your question here…"
                    value={q.text}
                    onChange={(e) => update(q.id, { text: e.target.value })}
                    className="rounded-lg flex-1"
                  />
                  <Select
                    value={q.type}
                    onValueChange={(v) => {
                      const t = v as QuestionType
                      update(q.id, {
                        type: t,
                        options: (t === "multiple-choice" || t === "multi-select")
                          ? (q.options.length ? q.options : ["Option 1", "Option 2", "Option 3"])
                          : [],
                      })
                    }}
                  >
                    <SelectTrigger className="w-44 rounded-lg shrink-0">
                      <Icon className="mr-1.5 size-3.5 shrink-0 text-muted-foreground" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {QUESTION_TYPES.map(t => (
                        <SelectItem key={t.id} value={t.id}>
                          <span className="flex items-center gap-2">
                            <t.icon className="size-3.5 shrink-0" /> {t.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <button
                    onClick={() => remove(q.id)}
                    className="shrink-0 rounded-md p-1.5 text-muted-foreground hover:bg-zinc-100 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="size-4" />
                  </button>
                </div>

                {/* Options */}
                {(q.type === "multiple-choice" || q.type === "multi-select") && (
                  <div className="ml-7 flex flex-col gap-1.5">
                    {q.options.map((opt, oi) => (
                      <div key={oi} className="flex items-center gap-2">
                        <div className={cn(
                          "size-3.5 shrink-0 border border-zinc-300",
                          q.type === "multi-select" ? "rounded-sm" : "rounded-full"
                        )} />
                        <Input
                          value={opt}
                          onChange={(e) => {
                            const opts = [...q.options]
                            opts[oi] = e.target.value
                            update(q.id, { options: opts })
                          }}
                          className="h-8 rounded-md text-sm"
                        />
                        <button
                          onClick={() => update(q.id, { options: q.options.filter((_, j) => j !== oi) })}
                          className="text-muted-foreground hover:text-destructive transition-colors"
                        >
                          <Trash2 className="size-3.5" />
                        </button>
                      </div>
                    ))}
                    <button
                      onClick={() => update(q.id, { options: [...q.options, `Option ${q.options.length + 1}`] })}
                      className="ml-5 text-xs text-primary hover:underline text-left w-fit"
                    >
                      + Add option
                    </button>
                  </div>
                )}

                {/* Rating / scale previews */}
                {q.type === "rating-5" && (
                  <div className="ml-7 flex gap-1.5">
                    {[1,2,3,4,5].map(n => (
                      <span key={n} className="flex h-8 w-8 items-center justify-center rounded-lg border text-xs text-muted-foreground">{n}</span>
                    ))}
                  </div>
                )}
                {(q.type === "rating-10" || q.type === "nps") && (
                  <div className="ml-7 flex flex-wrap gap-1">
                    {Array.from({ length: q.type === "nps" ? 11 : 10 }, (_, i) => i + (q.type === "nps" ? 0 : 1)).map(n => (
                      <span key={n} className="flex h-7 w-7 items-center justify-center rounded border text-xs text-muted-foreground">{n}</span>
                    ))}
                  </div>
                )}
                {q.type === "yes-no" && (
                  <div className="ml-7 flex gap-2">
                    <span className="rounded-full border px-4 py-1 text-xs text-muted-foreground">Yes</span>
                    <span className="rounded-full border px-4 py-1 text-xs text-muted-foreground">No</span>
                  </div>
                )}
                {q.type === "open-text" && (
                  <div className="ml-7 rounded-md border bg-zinc-50 px-3 py-2 text-xs italic text-muted-foreground">
                    Respondent types their answer here…
                  </div>
                )}

                {/* Required toggle */}
                <div className="ml-7 flex items-center gap-2">
                  <button
                    onClick={() => update(q.id, { required: !q.required })}
                    className={cn(
                      "relative inline-flex h-4 w-7 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors",
                      q.required ? "bg-primary" : "bg-zinc-200"
                    )}
                  >
                    <span className={cn(
                      "pointer-events-none inline-block h-3 w-3 rounded-full bg-white shadow transition-transform",
                      q.required ? "translate-x-3" : "translate-x-0"
                    )} />
                  </button>
                  <span className="text-xs text-muted-foreground">Required</span>
                </div>
              </div>
            </div>
          </div>
        )
      })}

      {/* Add question */}
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setShowTypeMenu(v => !v)}
          className={cn(CARD, "flex w-full items-center justify-center gap-2 py-3.5 text-sm font-medium text-primary hover:bg-zinc-50 transition-colors")}
        >
          <Plus className="size-4" /> Add question
        </button>
        {showTypeMenu && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 rounded-xl border bg-popover shadow-lg overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-y">
              {QUESTION_TYPES.map(t => (
                <button
                  key={t.id}
                  onClick={() => addQuestion(t.id)}
                  className="flex items-center gap-2.5 px-4 py-3 text-sm text-left hover:bg-zinc-50 transition-colors"
                >
                  <t.icon className="size-4 text-muted-foreground shrink-0" />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Target tab ───────────────────────────────────────────────────────────────

function TargetTab({ selected, onToggle }: {
  selected: string[]
  onToggle: (id: string) => void
}) {
  const totalInvited = buildings
    .filter(b => selected.includes(b.id))
    .reduce((s, b) => s + b.users, 0)

  return (
    <div className={CARD}>
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Target</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Select which buildings receive this survey.</p>
      </div>
      <div className="divide-y">
        {buildings.map(b => (
          <button
            key={b.id}
            onClick={() => onToggle(b.id)}
            className={cn(
              "flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-zinc-50",
              selected.includes(b.id) && "bg-blue-50/60 hover:bg-blue-50"
            )}
          >
            <div className={cn(
              "flex size-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
              selected.includes(b.id) ? "border-primary bg-primary" : "border-zinc-300"
            )}>
              {selected.includes(b.id) && <Check className="size-3 text-white" />}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium">{b.name}</div>
              <div className="text-xs text-muted-foreground">{b.tenants} tenants · {b.users} users</div>
            </div>
          </button>
        ))}
      </div>
      {selected.length > 0 && (
        <div className="border-t bg-zinc-50 px-5 py-3">
          <p className="text-xs text-muted-foreground">
            <span className="font-medium text-foreground">{totalInvited} users</span> will receive this survey
          </p>
        </div>
      )}
    </div>
  )
}

// ─── Preview tab ──────────────────────────────────────────────────────────────

function PreviewTab({ surveyName, questions }: {
  surveyName: string
  questions: Question[]
}) {
  const [current, setCurrent] = React.useState(0)
  const [answers, setAnswers] = React.useState<Record<string, string | string[]>>({})

  if (questions.length === 0) {
    return (
      <div className={cn(CARD, "py-16 text-center")}>
        <MessageSquare className="mx-auto mb-3 size-8 text-muted-foreground/30" />
        <p className="text-sm font-medium text-muted-foreground">Add questions to see a preview</p>
        <p className="mt-1 text-xs text-muted-foreground">Switch to the Questions tab to get started.</p>
      </div>
    )
  }

  const q = questions[Math.min(current, questions.length - 1)]
  const pct = (current / questions.length) * 100

  return (
    <div className={cn(CARD, "overflow-hidden")}>
      {/* Preview header */}
      <div className="border-b px-5 py-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-medium text-muted-foreground">Respondent preview</span>
          <span className="text-xs text-muted-foreground">{current + 1} / {questions.length}</span>
        </div>
        <div className="mt-2 h-1.5 rounded-full bg-zinc-100">
          <div className="h-1.5 rounded-full bg-primary transition-all duration-300" style={{ width: `${pct}%` }} />
        </div>
      </div>

      {/* Question */}
      <div className="flex min-h-72 flex-col gap-5 px-6 py-8">
        {surveyName && (
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{surveyName}</p>
        )}
        <p className="text-xl font-semibold leading-snug">
          {q.text || <span className="italic text-muted-foreground/50">Untitled question</span>}
        </p>

        {q.type === "rating-5" && (
          <div className="flex gap-2">
            {[1,2,3,4,5].map(n => (
              <button key={n} onClick={() => setAnswers(a => ({ ...a, [q.id]: String(n) }))}
                className={cn("flex h-12 w-12 items-center justify-center rounded-xl border text-sm font-semibold transition-colors",
                  answers[q.id] === String(n) ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40"
                )}>
                {n}
              </button>
            ))}
          </div>
        )}

        {(q.type === "rating-10" || q.type === "nps") && (
          <div className="flex flex-wrap gap-1.5">
            {Array.from({ length: q.type === "nps" ? 11 : 10 }, (_, i) => i + (q.type === "nps" ? 0 : 1)).map(n => (
              <button key={n} onClick={() => setAnswers(a => ({ ...a, [q.id]: String(n) }))}
                className={cn("flex h-11 w-11 items-center justify-center rounded-xl border text-sm font-semibold transition-colors",
                  answers[q.id] === String(n) ? "border-primary bg-primary text-primary-foreground" : "hover:border-primary/40"
                )}>
                {n}
              </button>
            ))}
          </div>
        )}

        {q.type === "multiple-choice" && (
          <div className="flex flex-col gap-2">
            {q.options.map(opt => (
              <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left transition-colors",
                  answers[q.id] === opt ? "border-primary bg-blue-50" : "hover:border-zinc-400"
                )}>
                <div className={cn("flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                  answers[q.id] === opt ? "border-primary bg-primary" : "border-zinc-300"
                )}>
                  {answers[q.id] === opt && <div className="size-1.5 rounded-full bg-white" />}
                </div>
                {opt}
              </button>
            ))}
          </div>
        )}

        {q.type === "multi-select" && (
          <div className="flex flex-col gap-2">
            {q.options.map(opt => {
              const sel = Array.isArray(answers[q.id]) && (answers[q.id] as string[]).includes(opt)
              return (
                <button key={opt}
                  onClick={() => {
                    const cur = (answers[q.id] as string[]) ?? []
                    setAnswers(a => ({ ...a, [q.id]: sel ? cur.filter(o => o !== opt) : [...cur, opt] }))
                  }}
                  className={cn("flex items-center gap-3 rounded-xl border px-4 py-3 text-sm text-left transition-colors",
                    sel ? "border-primary bg-blue-50" : "hover:border-zinc-400"
                  )}>
                  <div className={cn("flex size-4 shrink-0 items-center justify-center rounded border-2 transition-colors",
                    sel ? "border-primary bg-primary" : "border-zinc-300"
                  )}>
                    {sel && <Check className="size-2.5 text-white" />}
                  </div>
                  {opt}
                </button>
              )
            })}
          </div>
        )}

        {q.type === "open-text" && (
          <textarea
            placeholder="Type your answer…"
            rows={4}
            value={(answers[q.id] as string) ?? ""}
            onChange={(e) => setAnswers(a => ({ ...a, [q.id]: e.target.value }))}
            className="w-full rounded-xl border bg-background px-4 py-3 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          />
        )}

        {q.type === "yes-no" && (
          <div className="flex gap-3">
            {["Yes", "No"].map(opt => (
              <button key={opt} onClick={() => setAnswers(a => ({ ...a, [q.id]: opt }))}
                className={cn("flex-1 rounded-xl border py-3.5 text-sm font-semibold transition-colors",
                  answers[q.id] === opt ? "border-primary bg-primary text-primary-foreground" : "hover:border-zinc-400"
                )}>
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t px-5 py-4">
        <button
          onClick={() => setCurrent(c => Math.max(0, c - 1))}
          disabled={current === 0}
          className="text-sm text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          ← Back
        </button>
        {current < questions.length - 1 ? (
          <button
            onClick={() => setCurrent(c => c + 1)}
            className="rounded-xl bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            Next →
          </button>
        ) : (
          <button className="rounded-xl bg-emerald-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors">
            Submit ✓
          </button>
        )}
      </div>
    </div>
  )
}

// ─── Main page ────────────────────────────────────────────────────────────────

function NewSurveyPageInner() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateParam = searchParams.get("template")
  const scratchParam  = searchParams.get("scratch")

  const [step, setStep] = React.useState<Step>(
    (templateParam !== null || scratchParam !== null) ? "editor" : "start"
  )
  const [template,  setTemplate]  = React.useState<string | null>(templateParam)
  const [tab,       setTab]       = React.useState<EditorTab>("details")
  const [details,   setDetails]   = React.useState<DetailsData>({
    name: "", language: "en", opens: "", opensTime: "", closes: "", description: "",
  })
  const [questions, setQuestions] = React.useState<Question[]>(() =>
    getTemplateQuestions(templateParam)
  )
  const [targets, setTargets] = React.useState<string[]>([])

  const templateLabel = quickstartTemplates.find(t => t.id === template)?.title
  const detailsDone   = Boolean(details.name && details.opens && details.closes)
  const targetDone    = targets.length > 0

  function handleSelect(id: string) {
    setTemplate(id)
    setQuestions(getTemplateQuestions(id))
    setStep("editor")
    setTab("details")
  }

  function handleBlank() {
    setTemplate(null)
    setQuestions([])
    setStep("editor")
    setTab("details")
  }

  // ── Start step ──────────────────────────────────────────────────────────────
  if (step === "start") {
    return (
      <div className="min-h-screen bg-zinc-100">
        <div className="mx-auto max-w-2xl px-4 py-10">
          <button
            onClick={() => router.push("/surveys")}
            className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" /> All surveys
          </button>
          <h1 className="mb-6 text-2xl font-bold">Create survey</h1>
          <QuickstartStep onSelect={handleSelect} onBlank={handleBlank} />
        </div>
      </div>
    )
  }

  // ── Editor ──────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-zinc-100">
      {/* Sticky header */}
      <div className="sticky top-0 z-10 border-b bg-white/95 backdrop-blur px-6 py-3">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <button
            onClick={() => setStep("start")}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
          </button>
          <input
            value={details.name}
            onChange={(e) => setDetails(d => ({ ...d, name: e.target.value }))}
            placeholder="Untitled survey"
            className="flex-1 bg-transparent text-lg font-semibold focus:outline-none placeholder:text-muted-foreground/40"
          />
          <span className="rounded-full bg-zinc-100 px-2.5 py-0.5 text-xs font-medium text-zinc-500">
            Draft
          </span>
          <Button
            variant="outline"
            size="sm"
            className="rounded-lg"
            onClick={() => router.push("/surveys")}
          >
            Save draft
          </Button>
          <Button size="sm" className="rounded-lg">
            Publish
          </Button>
        </div>
      </div>

      {/* Two-column layout */}
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="flex gap-6 items-start">
          {/* Sidebar */}
          <div className="w-52 shrink-0 sticky top-[61px]">
            <TabNav
              tab={tab}
              setTab={setTab}
              questionCount={questions.length}
              detailsDone={detailsDone}
              targetDone={targetDone}
            />
          </div>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {tab === "details"   && (
              <DetailsTab
                data={details}
                onChange={(p) => setDetails(d => ({ ...d, ...p }))}
                templateLabel={templateLabel}
              />
            )}
            {tab === "questions" && (
              <QuestionsTab questions={questions} onChange={setQuestions} />
            )}
            {tab === "target"    && (
              <TargetTab
                selected={targets}
                onToggle={(id) => setTargets(s => s.includes(id) ? s.filter(b => b !== id) : [...s, id])}
              />
            )}
            {tab === "preview"   && (
              <PreviewTab surveyName={details.name} questions={questions} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewSurveyPage() {
  return (
    <React.Suspense>
      <NewSurveyPageInner />
    </React.Suspense>
  )
}
