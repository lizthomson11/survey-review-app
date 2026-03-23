"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  ArrowLeft,
  Calendar,
  Check,
  ChevronDown,
  ClipboardList,
  Download,
  FilterX,
  Globe,
  MoreHorizontal,
  Search,
  UserPlus,
  Users,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ─── Types ────────────────────────────────────────────────────────────────────

type NavId = "details" | "target" | "view"

type SummaryCard =
  | { label: string; icon: React.ElementType; iconClass: string; value: string; sub: string }
  | { label: string; icon: React.ElementType; iconClass: string; value: string; progress: number }

// ─── Static data ──────────────────────────────────────────────────────────────

const CARD_CLASS = "rounded-xl border bg-card shadow-sm"

const navItems: { id: NavId; label: string; complete: boolean }[] = [
  { id: "details", label: "Details", complete: true },
  { id: "target", label: "Target", complete: true },
  { id: "view", label: "View surveys", complete: false },
]

const summaryCards: SummaryCard[] = [
  { label: "Survey", icon: Calendar, iconClass: "text-blue-600", value: "Closes in 14 days", sub: "06/30/2026 • 11:59 PM" },
  { label: "Responses", icon: Users, iconClass: "text-violet-600", value: "42 of 120", progress: 35 },
  { label: "Completion", icon: ClipboardList, iconClass: "text-muted-foreground", value: "78%", sub: "Avg. time 3m 20s" },
]

type RowResponse =
  | { type: "rating"; score: number; label: string }
  | { type: "text"; snippet: string }

const rows: {
  name: string; email: string; tenant: string; building: string; updated: string; response: RowResponse
}[] = [
  { name: "Jordan Lee",  email: "jordan.lee@acme.com",     tenant: "Acme Corp", building: "Tower One",    updated: "Mar 18, 2026 • 2:04 PM", response: { type: "rating", score: 5, label: "Very satisfied" } },
  { name: "Sam Rivera",  email: "sam.rivera@northwind.com", tenant: "Northwind", building: "Harbor Plaza", updated: "Mar 17, 2026 • 9:12 AM", response: { type: "rating", score: 3, label: "Neutral" } },
  { name: "Alex Kim",    email: "alex.kim@contoso.com",     tenant: "Contoso",   building: "Tower One",    updated: "Mar 16, 2026 • 4:51 PM", response: { type: "text",   snippet: "Love the natural light and collaborative spaces" } },
]

const questionBreakdowns = [
  {
    question: "How satisfied are you with your workspace overall?",
    type: "rating" as const,
    bars: [
      { label: "Very satisfied",    pct: 38, color: "bg-emerald-500" },
      { label: "Satisfied",         pct: 29, color: "bg-emerald-300" },
      { label: "Neutral",           pct: 18, color: "bg-zinc-300"    },
      { label: "Dissatisfied",      pct: 10, color: "bg-amber-400"   },
      { label: "Very dissatisfied", pct:  5, color: "bg-red-400"     },
    ],
  },
  {
    question: "What do you like most about your workplace?",
    type: "multi" as const,
    note: "Multiple choice — percentages exceed 100%",
    bars: [
      { label: "Natural light",        pct: 72, color: "bg-blue-500" },
      { label: "Collaborative spaces", pct: 58, color: "bg-blue-400" },
      { label: "Amenities",            pct: 45, color: "bg-blue-300" },
      { label: "Location",             pct: 40, color: "bg-blue-200" },
      { label: "Quiet zones",          pct: 31, color: "bg-blue-100" },
    ],
  },
  {
    question: "What needs the most improvement?",
    type: "multi" as const,
    note: "Multiple choice — percentages exceed 100%",
    bars: [
      { label: "Air quality",               pct: 52, color: "bg-rose-400" },
      { label: "Meeting room availability", pct: 48, color: "bg-rose-300" },
      { label: "Noise levels",              pct: 35, color: "bg-rose-200" },
      { label: "Temperature control",       pct: 28, color: "bg-rose-100" },
      { label: "Parking",                   pct: 22, color: "bg-rose-100" },
    ],
  },
  {
    question: "Would you recommend this workplace to a colleague?",
    type: "rating" as const,
    bars: [
      { label: "Yes",   pct: 62, color: "bg-emerald-500" },
      { label: "Maybe", pct: 24, color: "bg-amber-400"   },
      { label: "No",    pct: 14, color: "bg-red-400"     },
    ],
  },
]

// ─── Small components ─────────────────────────────────────────────────────────

function FilterSelect({ defaultValue, label, width, options }: {
  defaultValue: string
  label: string
  width: number
  options: { value: string; label: string }[]
}) {
  return (
    <Select defaultValue={defaultValue}>
      <SelectTrigger className={`h-10 w-[${width}px] rounded-lg`}>
        <SelectValue placeholder={label} />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={defaultValue}>{label}</SelectItem>
        {options.map((o) => (
          <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function SectionCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border bg-card shadow-sm", className)}>
      {children}
    </div>
  )
}

// ─── Panel: Details ───────────────────────────────────────────────────────────

function DetailsPanel() {
  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Survey details</h2>
        </div>
        <div className="grid gap-5 px-5 py-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Survey name</label>
            <Input defaultValue="Tenant satisfaction Q2" className="rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Language</label>
            <Select defaultValue="en">
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
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Opens</label>
            <Input defaultValue="04/01/2026" className="rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Closes</label>
            <Input defaultValue="06/30/2026" className="rounded-lg" />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <label className="text-sm font-medium">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea
              defaultValue="This survey measures tenant satisfaction across all managed buildings for Q2 2026. Results will inform facility improvements and tenant engagement strategies."
              rows={3}
              className="rounded-lg border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Status</h2>
        </div>
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <p className="text-sm font-medium">Survey is live</p>
            <p className="text-sm text-muted-foreground">Respondents can currently submit responses.</p>
          </div>
          <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">Live</Badge>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button className="rounded-lg">Save details</Button>
      </div>
    </div>
  )
}

// ─── Panel: Target audience ───────────────────────────────────────────────────

const buildings = [
  { id: "t1", name: "Tower One",    tenants: 3, invited: 68 },
  { id: "hp", name: "Harbor Plaza", tenants: 2, invited: 52 },
]

function TargetPanel() {
  const [selected, setSelected] = React.useState<string[]>(["t1", "hp"])

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((b) => b !== id) : [...prev, id]
    )
  }

  const totalInvited = buildings
    .filter((b) => selected.includes(b.id))
    .reduce((sum, b) => sum + b.invited, 0)

  return (
    <div className="flex flex-col gap-6">
      <SectionCard>
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Buildings</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Select which buildings receive this survey.</p>
        </div>
        <div className="divide-y">
          {buildings.map((b) => {
            const active = selected.includes(b.id)
            return (
              <label key={b.id} className="flex cursor-pointer items-center gap-4 px-5 py-4 hover:bg-muted/40">
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggle(b.id)}
                  className="size-4 rounded accent-blue-600"
                />
                <div className="flex-1">
                  <p className="text-sm font-medium">{b.name}</p>
                  <p className="text-xs text-muted-foreground">{b.tenants} tenants · {b.invited} invited</p>
                </div>
                {active && <Check className="size-4 text-emerald-600" strokeWidth={2.5} />}
              </label>
            )
          })}
        </div>
        <div className="border-t bg-muted/30 px-5 py-3">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{totalInvited}</span> respondents invited across {selected.length} building{selected.length !== 1 ? "s" : ""}
          </p>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Reminders</h2>
        </div>
        <div className="grid gap-5 px-5 py-6 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Send reminder</label>
            <Select defaultValue="3">
              <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="1">1 day before close</SelectItem>
                <SelectItem value="3">3 days before close</SelectItem>
                <SelectItem value="7">7 days before close</SelectItem>
                <SelectItem value="none">No reminder</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium">Reminder channel</label>
            <Select defaultValue="email">
              <SelectTrigger className="rounded-lg"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="email">Email</SelectItem>
                <SelectItem value="push">Push notification</SelectItem>
                <SelectItem value="both">Email + Push</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-end">
        <Button className="rounded-lg">Save audience</Button>
      </div>
    </div>
  )
}

// ─── Panel: View surveys ──────────────────────────────────────────────────────

function ViewPanel() {
  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {summaryCards.map((card) => (
          <Card key={card.label} className={CARD_CLASS}>
            <CardContent className="flex flex-col gap-3 p-5">
              <div className="flex items-center gap-2">
                <card.icon className={cn("size-5 shrink-0", card.iconClass)} />
                <span className="flex-1 text-center text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {card.label}
                </span>
              </div>
              <p className="text-xl font-semibold leading-tight">{card.value}</p>
              {"sub" in card && <p className="text-sm text-muted-foreground">{card.sub}</p>}
              {"progress" in card && <Progress value={card.progress} className="h-2" />}
            </CardContent>
          </Card>
        ))}
      </div>

      <SectionCard>
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Response breakdown</h2>
          <p className="mt-0.5 text-sm text-muted-foreground">Based on 42 responses</p>
        </div>
        <div className="divide-y">
          {questionBreakdowns.map((q) => (
            <div key={q.question} className="px-5 py-5">
              <p className="mb-1 text-sm font-medium">{q.question}</p>
              {q.note && <p className="mb-3 text-xs text-muted-foreground">{q.note}</p>}
              <div className="flex flex-col gap-2.5 mt-3">
                {q.bars.map((bar) => (
                  <div key={bar.label} className="flex items-center gap-3">
                    <span className="w-44 shrink-0 text-xs text-muted-foreground truncate">{bar.label}</span>
                    <div className="flex-1 h-2.5 rounded-full bg-muted overflow-hidden">
                      <div className={cn("h-full rounded-full", bar.color)} style={{ width: `${bar.pct}%` }} />
                    </div>
                    <span className="w-9 shrink-0 text-right text-xs font-medium tabular-nums">{bar.pct}%</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      <SectionCard>
        <div className="border-b px-5 py-4">
          <h2 className="text-lg font-semibold">Responses</h2>
        </div>
        <div className="flex flex-col gap-4 border-b px-5 py-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by name or email" className="h-10 rounded-lg bg-background pl-9" />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <FilterSelect defaultValue="all-tenants" label="Tenant" width={140}
              options={[{ value: "acme", label: "Acme Corp" }, { value: "northwind", label: "Northwind" }]} />
            <FilterSelect defaultValue="all-buildings" label="Building" width={140}
              options={[{ value: "t1", label: "Tower One" }, { value: "hp", label: "Harbor Plaza" }]} />
            <FilterSelect defaultValue="all-status" label="Status" width={128}
              options={[{ value: "submitted", label: "Submitted" }, { value: "progress", label: "In progress" }]} />
            <Button variant="outline" size="icon" className="rounded-lg" aria-label="Clear filters">
              <FilterX className="size-4" />
            </Button>
            <Button variant="outline" size="icon" className="rounded-lg" aria-label="Download CSV">
              <Download className="size-4" />
            </Button>
            <Button size="sm" className="rounded-lg gap-2">
              <UserPlus className="size-4" />
              Add respondent
            </Button>
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead>Name</TableHead>
              <TableHead>Tenant</TableHead>
              <TableHead>
                <span className="inline-flex items-center gap-1">
                  Last updated <ChevronDown className="size-4" />
                </span>
              </TableHead>
              <TableHead>Response</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.email}>
                <TableCell>
                  <div className="font-semibold">{row.name}</div>
                  <a href={`mailto:${row.email}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
                    {row.email}
                  </a>
                </TableCell>
                <TableCell>
                  <div className="font-medium">{row.tenant}</div>
                  <div className="text-sm text-muted-foreground">{row.building}</div>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.updated}</TableCell>
                <TableCell>
                  {row.response.type === "rating" ? (
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm tracking-tight">
                        {"★".repeat(row.response.score)}{"☆".repeat(5 - row.response.score)}
                      </span>
                      <span className="text-xs text-muted-foreground">{row.response.label}</span>
                    </div>
                  ) : (
                    <span className="text-sm italic text-muted-foreground truncate block max-w-[200px]">
                      "{row.response.snippet}"
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </SectionCard>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const PANELS: Record<NavId, React.ReactNode> = {
  details: <DetailsPanel />,
  target:  <TargetPanel />,
  view:    <ViewPanel />,
}

export default function SurveyDetailPage() {
  const router = useRouter()
  const [activeNav, setActiveNav] = React.useState<NavId>("view")

  return (
    <div className="min-h-screen bg-zinc-100 text-foreground dark:bg-background">
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
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

        <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">Tenant satisfaction Q2</h1>
            <Badge className="rounded-full bg-emerald-600 text-white hover:bg-emerald-600">Live</Badge>
            <span className="text-sm text-muted-foreground">EN</span>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" className="rounded-md">Save</Button>
            <Button size="icon" variant="outline" className="rounded-md" aria-label="More options">
              <MoreHorizontal className="size-4" />
            </Button>
          </div>
        </header>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:w-[220px]">
            <Card className={cn("overflow-hidden", CARD_CLASS)}>
              <CardContent className="p-2">
                <nav className="flex flex-col gap-0.5" aria-label="Survey sections">
                  {navItems.map((item) => {
                    const active = activeNav === item.id
                    return (
                      <button
                        key={item.id}
                        type="button"
                        aria-current={active ? "page" : undefined}
                        onClick={() => setActiveNav(item.id)}
                        className={cn(
                          "relative flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm font-medium transition-colors",
                          active
                            ? "bg-muted/80 text-foreground"
                            : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                        )}
                      >
                        {active && (
                          <span className="absolute left-0 top-1 bottom-1 w-1 rounded-full bg-blue-600" aria-hidden />
                        )}
                        <span className={cn(active && "pl-2")}>{item.label}</span>
                        {item.complete && (
                          <Check className="size-4 shrink-0 text-emerald-600" strokeWidth={2.5} />
                        )}
                      </button>
                    )
                  })}
                </nav>
              </CardContent>
            </Card>
          </aside>

          <div className="min-w-0 flex-1">
            {PANELS[activeNav]}
          </div>
        </div>
      </div>
    </div>
  )
}
