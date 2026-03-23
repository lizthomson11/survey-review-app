"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import { ArrowDown, ArrowUp, ArrowUpDown, ChevronDown, Download, Plus, Search, SlidersHorizontal, X, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
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
import { quickstartTemplates } from "@/lib/survey-templates"

// ─── Types ────────────────────────────────────────────────────────────────────

type Status = "Live" | "Scheduled" | "Draft" | "Archived"

interface Survey {
  id: string
  name: string
  status: Status
  publishDate: string
  submissions: number
  audience: string
  lastEditedBy: string
  lastEditedAt: string
}

// ─── Mock data ────────────────────────────────────────────────────────────────
// Sorted by most recently updated (descending) per PRD default

const surveys: Survey[] = [
  {
    id: "tenant-satisfaction-q2",
    name: "Tenant satisfaction Q2",
    status: "Live",
    publishDate: "Apr 1, 2026",
    submissions: 42,
    audience: "Tower One - All Users (Automated)",
    lastEditedBy: "Liz Thomson",
    lastEditedAt: "Mar 18, 2026",
  },
  {
    id: "building-amenities-feedback",
    name: "Building amenities feedback",
    status: "Scheduled",
    publishDate: "Apr 15, 2026",
    submissions: 0,
    audience: "Tower One - All Users (Automated)",
    lastEditedBy: "Jordan Lee",
    lastEditedAt: "Mar 15, 2026",
  },
  {
    id: "harbor-plaza-q2",
    name: "Harbor Plaza resident check-in",
    status: "Draft",
    publishDate: "—",
    submissions: 0,
    audience: "Harbor Plaza - All Users (Automated)",
    lastEditedBy: "Sam Rivera",
    lastEditedAt: "Mar 10, 2026",
  },
  {
    id: "post-renovation-survey",
    name: "Post-renovation survey",
    status: "Archived",
    publishDate: "Jan 5, 2026",
    submissions: 73,
    audience: "Harbor Plaza - All Users (Automated)",
    lastEditedBy: "Alex Kim",
    lastEditedAt: "Feb 28, 2026",
  },
]

// Default: show Draft, Scheduled, Live — hide Archived per PRD
const DEFAULT_STATUSES: Status[] = ["Draft", "Scheduled", "Live"]

const STATUS_STYLES: Record<Status, string> = {
  Live:      "bg-emerald-100 text-emerald-700",
  Scheduled: "bg-blue-100 text-blue-700",
  Draft:     "bg-zinc-100 text-zinc-600",
  Archived:  "bg-zinc-100 text-zinc-400",
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function QuickstartModal({ onClose, onSelect }: {
  onClose: () => void
  onSelect: (templateId: string | null) => void
}) {
  // Close on backdrop click
  function onBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
      onClick={onBackdrop}
    >
      <div className="relative w-full max-w-lg rounded-2xl border bg-card shadow-xl">
        <div className="flex items-start justify-between border-b px-5 py-4">
          <div>
            <div className="flex items-center gap-2">
              <Zap className="size-4 text-amber-500" />
              <h2 className="text-base font-semibold">Start from a template</h2>
            </div>
            <p className="mt-0.5 text-sm text-muted-foreground">Pre-built question sets — edit anything after.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            aria-label="Close"
          >
            <X className="size-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-px bg-border">
          {quickstartTemplates.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => onSelect(t.id)}
              className="flex flex-col gap-1 bg-card px-5 py-4 text-left hover:bg-muted/50 transition-colors"
            >
              <span className="text-sm font-medium">{t.title}</span>
              <span className="text-xs text-muted-foreground leading-snug">{t.description}</span>
              {t.questions > 0 && <span className="mt-1 text-xs text-muted-foreground">{t.questions} questions</span>}
            </button>
          ))}
        </div>

        <div className="border-t px-5 py-4">
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="w-full rounded-lg border px-4 py-3 text-left hover:bg-muted/50 transition-colors"
          >
            <p className="text-sm font-medium">Start from scratch</p>
            <p className="text-xs text-muted-foreground mt-0.5">Build your own survey with custom questions.</p>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function SurveysListPage() {
  const router = useRouter()
  const [search, setSearch] = React.useState("")
  const [statusFilter, setStatusFilter] = React.useState<string>("active")
  const [dateFilter, setDateFilter] = React.useState<string>("all")
  const [showModal, setShowModal] = React.useState(false)
  const [sortCol, setSortCol] = React.useState<"name" | "publishDate" | "submissions" | "lastEditedAt" | null>("lastEditedAt")
  const [sortDir, setSortDir] = React.useState<"asc" | "desc">("desc")

  function toggleSort(col: typeof sortCol) {
    if (sortCol === col) setSortDir(d => d === "asc" ? "desc" : "asc")
    else { setSortCol(col); setSortDir("asc") }
  }

  function SortIcon({ col }: { col: typeof sortCol }) {
    if (sortCol !== col) return <ArrowUpDown className="size-3.5 text-muted-foreground/50" />
    return sortDir === "asc"
      ? <ArrowUp className="size-3.5 text-foreground" />
      : <ArrowDown className="size-3.5 text-foreground" />
  }

  function handleTemplateSelect(templateId: string | null) {
    const url = templateId ? `/surveys/new?template=${templateId}` : "/surveys/new?scratch=true"
    router.push(url)
  }

  const filtered = surveys.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase())
    const matchesStatus =
      statusFilter === "active"
        ? DEFAULT_STATUSES.includes(s.status)
        : statusFilter === "all"
        ? true
        : s.status.toLowerCase() === statusFilter.toLowerCase()
    const matchesDate = (() => {
      if (dateFilter === "all") return true
      if (s.publishDate === "—") return false
      const d = new Date(s.publishDate)
      if (isNaN(d.getTime())) return false
      const now = new Date()
      if (dateFilter === "this-month") return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
      const ms = now.getTime() - d.getTime()
      if (dateFilter === "last-30") return ms <= 30 * 24 * 60 * 60 * 1000
      if (dateFilter === "last-90") return ms <= 90 * 24 * 60 * 60 * 1000
      return true
    })()
    return matchesSearch && matchesStatus && matchesDate
  }).sort((a, b) => {
    if (!sortCol) return 0
    const dir = sortDir === "asc" ? 1 : -1
    if (sortCol === "name") return dir * a.name.localeCompare(b.name)
    if (sortCol === "submissions") return dir * (a.submissions - b.submissions)
    if (sortCol === "publishDate") {
      const da = a.publishDate === "—" ? 0 : new Date(a.publishDate).getTime()
      const db = b.publishDate === "—" ? 0 : new Date(b.publishDate).getTime()
      return dir * (da - db)
    }
    if (sortCol === "lastEditedAt") {
      return dir * (new Date(a.lastEditedAt).getTime() - new Date(b.lastEditedAt).getTime())
    }
    return 0
  })

  return (
    <div className="min-h-screen bg-zinc-100 text-foreground dark:bg-background">
      {showModal && (
        <QuickstartModal
          onClose={() => setShowModal(false)}
          onSelect={handleTemplateSelect}
        />
      )}
      <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">Surveys</h1>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon" className="rounded-lg" aria-label="Export">
              <Download className="size-4" />
            </Button>
            <Button className="rounded-lg gap-2" onClick={() => setShowModal(true)}>
              <Plus className="size-4" />
              Create survey
            </Button>
          </div>
        </header>

        <div className="rounded-xl border bg-card shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-col gap-3 border-b px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search surveys"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 rounded-lg bg-background pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" />
              {/* Status filter — pinned per PRD */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-9 w-[160px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active (default)</SelectItem>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="live">Live</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="archived">Archived</SelectItem>
                </SelectContent>
              </Select>
              {/* Date filter */}
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="h-9 w-[160px] rounded-lg">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All publish dates</SelectItem>
                  <SelectItem value="this-month">This month</SelectItem>
                  <SelectItem value="last-30">Last 30 days</SelectItem>
                  <SelectItem value="last-90">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Table */}
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent">
                <TableHead>
                  <button onClick={() => toggleSort("name")} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    Name <SortIcon col="name" />
                  </button>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead>
                  <button onClick={() => toggleSort("publishDate")} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    Publish date <SortIcon col="publishDate" />
                  </button>
                </TableHead>
                <TableHead>
                  <button onClick={() => toggleSort("submissions")} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    Submissions <SortIcon col="submissions" />
                  </button>
                </TableHead>
                <TableHead>Audience</TableHead>
                <TableHead>
                  <button onClick={() => toggleSort("lastEditedAt")} className="inline-flex items-center gap-1.5 hover:text-foreground">
                    Last edited <SortIcon col="lastEditedAt" />
                  </button>
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((survey) => (
                <TableRow
                  key={survey.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/surveys/${survey.id}`)}
                >
                  <TableCell className="font-medium">{survey.name}</TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
                      STATUS_STYLES[survey.status]
                    )}>
                      {survey.status}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{survey.publishDate}</TableCell>
                  <TableCell className="text-sm tabular-nums">
                    {survey.submissions > 0 ? survey.submissions.toLocaleString() : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell className="max-w-[220px]">
                    <span className="block truncate text-sm text-muted-foreground">{survey.audience}</span>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    <div>{survey.lastEditedBy}</div>
                    <div className="text-xs">{survey.lastEditedAt}</div>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-sm text-muted-foreground">
                    No surveys match your filters.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {/* Footer count */}
          <div className="border-t px-5 py-3">
            <p className="text-xs text-muted-foreground">
              {filtered.length} survey{filtered.length !== 1 ? "s" : ""}
              {statusFilter === "active" ? " · Archived surveys hidden" : ""}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
