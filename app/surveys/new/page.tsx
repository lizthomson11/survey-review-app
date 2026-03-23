"use client"

import * as React from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Check, Clock, Globe, PenLine, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { quickstartTemplates } from "@/lib/survey-templates"

// ─── Types & constants ────────────────────────────────────────────────────────

type Step = "start" | "details" | "target" | "review"

const steps: { id: Step; label: string }[] = [
  { id: "details", label: "Details" },
  { id: "target",  label: "Audience" },
  { id: "review",  label: "Review" },
]

const CARD_CLASS = "rounded-xl border bg-card shadow-sm"

// Audiences follow the "[Building] - All Users (Automated)" model per PRD
const audiences = [
  { id: "t1-auto",  label: "Tower One - All Users (Automated)" },
  { id: "hp-auto",  label: "Harbor Plaza - All Users (Automated)" },
  { id: "rc-auto",  label: "River Court - All Users (Automated)" },
  { id: "custom-1", label: "Premium tenants - Multi-building" },
]

// ─── Step panels ──────────────────────────────────────────────────────────────

function QuickstartStep({ onSelect, onBlank }: {
  onSelect: (templateId: string) => void
  onBlank: () => void
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className={cn(CARD_CLASS, "overflow-hidden")}>
        <div className="border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <Zap className="size-4 text-amber-500" />
            <h2 className="text-base font-semibold">Start from a template</h2>
          </div>
          <p className="mt-0.5 text-sm text-muted-foreground">Pre-built question sets — edit anything after.</p>
        </div>
        <div className="grid gap-px bg-border sm:grid-cols-2">
          {quickstartTemplates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className="flex flex-col gap-1 bg-card px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">{t.title}</span>
              <span className="text-xs text-muted-foreground">{t.description}</span>
              {t.questions > 0 && <span className="mt-1 text-xs text-muted-foreground">{t.questions} questions</span>}
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
        type="button"
        onClick={onBlank}
        className={cn(CARD_CLASS, "px-5 py-4 text-left hover:bg-muted/40 transition-colors w-full")}
      >
        <p className="text-sm font-medium">Start from scratch</p>
        <p className="text-xs text-muted-foreground mt-0.5">Build your own survey with custom questions.</p>
      </button>
    </div>
  )
}

function DetailsStep({ data, onChange, template }: {
  data: { name: string; language: string; opens: string; closes: string; description: string }
  onChange: (patch: Partial<typeof data>) => void
  template: string | null
}) {
  const templateLabel = quickstartTemplates.find((t) => t.id === template)?.title
  const now = new Date()
  const today = now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })
  const currentTime = now.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true })
  const [publishMode, setPublishMode] = React.useState<"now" | "schedule">("now")
  const [opensTime, setOpensTime] = React.useState("")

  function handlePublishMode(mode: "now" | "schedule") {
    setPublishMode(mode)
    onChange({ opens: mode === "now" ? today : "" })
    if (mode === "schedule") setOpensTime("")
  }

  React.useEffect(() => {
    if (publishMode === "now") onChange({ opens: today })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className={CARD_CLASS}>
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
                publishMode === "now"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-zinc-50"
              )}
            >
              Now
            </button>
            <button
              type="button"
              onClick={() => handlePublishMode("schedule")}
              className={cn(
                "flex items-center gap-1.5 px-4 py-2 font-medium border-l transition-colors",
                publishMode === "schedule"
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-zinc-50"
              )}
            >
              <Clock className="size-3.5" /> Schedule
            </button>
          </div>
          {publishMode === "now" && (
            <p className="text-xs text-muted-foreground">Goes live immediately on save — {today} at {currentTime}</p>
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
                value={opensTime}
                onChange={(e) => setOpensTime(e.target.value)}
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

function AudienceStep({ selected, onToggle }: {
  selected: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className={CARD_CLASS}>
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Target audience</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Select one or more audiences. The survey will appear in the list for every building represented in the selected audience(s). Audience is required to save.
        </p>
      </div>
      <div className="divide-y">
        {audiences.map((a) => {
          const active = selected.includes(a.id)
          return (
            <label key={a.id} className="flex cursor-pointer items-center gap-4 px-5 py-4 hover:bg-muted/40">
              <input
                type="checkbox"
                checked={active}
                onChange={() => onToggle(a.id)}
                className="size-4 rounded accent-blue-600"
              />
              <div className="flex-1">
                <p className="text-sm font-medium">{a.label}</p>
                {a.id.endsWith("-auto") && (
                  <p className="text-xs text-muted-foreground">Auto-generated · all users in building</p>
                )}
              </div>
              {active && <Check className="size-4 shrink-0 text-emerald-600" strokeWidth={2.5} />}
            </label>
          )
        })}
      </div>
      {selected.length === 0 && (
        <div className="border-t bg-amber-50 px-5 py-3">
          <p className="text-xs text-amber-700">At least one audience is required before you can save or launch.</p>
        </div>
      )}
      {selected.length > 0 && (
        <div className="border-t bg-muted/30 px-5 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{selected.length}</span> audience{selected.length !== 1 ? "s" : ""} selected
          </p>
        </div>
      )}
    </div>
  )
}

function ReviewStep({ details, selectedAudiences, template }: {
  details: { name: string; language: string; opens: string; closes: string; description: string }
  selectedAudiences: string[]
  template: string | null
}) {
  const templateLabel = quickstartTemplates.find((t) => t.id === template)?.title
  const chosenAudiences = audiences.filter((a) => selectedAudiences.includes(a.id))
  const langLabels: Record<string, string> = { en: "English", fr: "French", de: "German" }

  const rows = [
    { label: "Survey name",  value: details.name || "—" },
    { label: "Template",     value: templateLabel ?? "From scratch" },
    { label: "Language",     value: langLabels[details.language] ?? details.language },
    { label: "Publish date", value: details.opens || "—" },
    { label: "End date",     value: details.closes || "—" },
    { label: "Audience",     value: chosenAudiences.length ? chosenAudiences.map((a) => a.label).join("; ") : "None selected" },
  ]

  return (
    <div className={CARD_CLASS}>
      <div className="border-b px-5 py-4">
        <h2 className="text-lg font-semibold">Review & launch</h2>
        <p className="mt-0.5 text-sm text-muted-foreground">Check everything looks right before launching.</p>
      </div>
      <dl className="divide-y">
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-4 px-5 py-3.5">
            <dt className="text-sm text-muted-foreground shrink-0">{row.label}</dt>
            <dd className="text-sm font-medium text-right">{row.value}</dd>
          </div>
        ))}
        {details.description && (
          <div className="px-5 py-3.5">
            <dt className="text-sm text-muted-foreground mb-1">Description</dt>
            <dd className="text-sm">{details.description}</dd>
          </div>
        )}
      </dl>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function NewSurveyPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateParam = searchParams.get("template")
  const scratchParam  = searchParams.get("scratch")

  const [step, setStep] = React.useState<Step>((templateParam !== null || scratchParam !== null) ? "details" : "start")
  const [template, setTemplate] = React.useState<string | null>(templateParam)
  const [details, setDetails] = React.useState({
    name: "", language: "en", opens: "", closes: "", description: "",
  })
  const [selectedAudiences, setSelectedAudiences] = React.useState<string[]>([])

  const visibleSteps = steps // always show details/target/review in indicator
  const stepIndex = visibleSteps.findIndex((s) => s.id === step)

  function toggleAudience(id: string) {
    setSelectedAudiences((prev) =>
      prev.includes(id) ? prev.filter((a) => a !== id) : [...prev, id]
    )
  }

  function handleNext() {
    if (step === "details") setStep("target")
    else if (step === "target") setStep("review")
    else router.push("/surveys")
  }

  function handleBack() {
    if (step === "start" || step === "details") router.push("/surveys")
    else if (step === "target") setStep("details")
    else setStep("target")
  }

  const canProceed =
    step === "details"
      ? details.name.trim() !== "" && details.opens !== "" && details.closes !== ""
    : step === "target"
      ? selectedAudiences.length > 0
    : true

  return (
    <div className="min-h-screen bg-zinc-100 text-foreground dark:bg-background">
      <div className="mx-auto max-w-2xl px-4 py-6 md:px-6">
        <div className="mb-4">
          <button
            type="button"
            onClick={() => router.push("/surveys")}
            className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="size-4" />
            All surveys
          </button>
        </div>

        <header className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">Create survey</h1>
        </header>

        {/* Step indicator — only shown after quickstart selection */}
        {step !== "start" && (
          <div className="mb-6 flex items-center">
            {visibleSteps.map((s, i) => {
              const done = i < stepIndex
              const active = s.id === step
              return (
                <React.Fragment key={s.id}>
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "flex size-6 items-center justify-center rounded-full text-xs font-semibold",
                      done  ? "bg-emerald-600 text-white"
                      : active ? "bg-blue-600 text-white"
                      : "bg-muted text-muted-foreground"
                    )}>
                      {done ? <Check className="size-3.5" strokeWidth={3} /> : i + 1}
                    </div>
                    <span className={cn("text-sm", active ? "font-medium" : "text-muted-foreground")}>
                      {s.label}
                    </span>
                  </div>
                  {i < visibleSteps.length - 1 && (
                    <div className={cn("mx-3 h-px flex-1 max-w-[40px]", done ? "bg-emerald-400" : "bg-muted")} />
                  )}
                </React.Fragment>
              )
            })}
          </div>
        )}

        {/* Panels */}
        {step === "start" && (
          <QuickstartStep
            onSelect={(id) => { setTemplate(id); setStep("details") }}
            onBlank={() => { setTemplate(null); setStep("details") }}
          />
        )}
        {step === "details" && (
          <DetailsStep
            data={details}
            onChange={(p) => setDetails((d) => ({ ...d, ...p }))}
            template={template}
          />
        )}
        {step === "target" && (
          <AudienceStep selected={selectedAudiences} onToggle={toggleAudience} />
        )}
        {step === "review" && (
          <ReviewStep details={details} selectedAudiences={selectedAudiences} template={template} />
        )}

        {/* Footer nav */}
        {step !== "start" && (
          <div className="mt-6 flex items-center justify-between">
            <Button variant="outline" className="rounded-lg" onClick={handleBack}>
              {step === "details" ? "Cancel" : "Back"}
            </Button>
            <Button className="rounded-lg" onClick={handleNext} disabled={!canProceed}>
              {step === "review" ? "Launch survey" : "Continue"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
