import { useEffect, useState } from 'react'
import { getAllResumes, deleteResume, searchBySkill, ResumeRecord } from '../lib/api'
import {
  Search, Trash2, User, Clock, Tag as TagIcon, Loader2, X, RefreshCw,
  Mail, Phone, MapPin, Github, Linkedin, Briefcase, GraduationCap,
  FolderGit2, Award, Globe, Cpu, ChevronLeft, FileText, ExternalLink
} from 'lucide-react'
import { cn, ensureUrl } from '../lib/utils'

const SkillBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
    bg-accent text-accent-foreground border border-accent-foreground/10">
    <TagIcon size={9}/> {label}
  </span>
)

const Tag = ({ label }: { label: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
    bg-accent text-accent-foreground border border-accent-foreground/10">
    {label}
  </span>
)

function formatTime(dateStr: string): string {
  const d = new Date(dateStr + 'Z')
  const now = new Date()
  const diff = now.getTime() - d.getTime()
  const mins = Math.floor(diff / 60000)
  const hrs = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hrs < 24) return `${hrs}h ago`
  if (days < 7) return `${days}d ago`
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: d.getFullYear() !== now.getFullYear() ? 'numeric' : undefined })
}

function formatFullDate(dateStr: string): string {
  return new Date(dateStr + 'Z').toLocaleString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric',
    year: 'numeric', hour: 'numeric', minute: '2-digit'
  })
}

export default function HistoryPage() {
  const [resumes, setResumes]     = useState<ResumeRecord[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searching, setSearching] = useState(false)
  const [total, setTotal]         = useState(0)
  const [deleting, setDeleting]   = useState<number | null>(null)
  const [selected, setSelected]   = useState<ResumeRecord | null>(null)

  const loadAll = async () => {
    setLoading(true)
    try {
      const res = await getAllResumes()
      setResumes(res.data.resumes)
      setTotal(res.data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  // Auto-select first resume when list loads
  useEffect(() => {
    if (resumes.length > 0 && !selected) {
      setSelected(resumes[0])
    }
    // If selected was deleted, clear it
    if (selected && !resumes.find(r => r.id === selected.id)) {
      setSelected(resumes.length > 0 ? resumes[0] : null)
    }
  }, [resumes])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) { loadAll(); return }
    setSearching(true)
    try {
      const res = await searchBySkill(search)
      setResumes(res.data.resumes)
      setTotal(res.data.total)
      setSelected(res.data.resumes.length > 0 ? res.data.resumes[0] : null)
    } finally { setSearching(false) }
  }

  const handleDelete = async (id: number, e?: React.MouseEvent) => {
    e?.stopPropagation()
    setDeleting(id)
    try {
      await deleteResume(id)
      setResumes(prev => prev.filter(r => r.id !== id))
      setTotal(prev => prev - 1)
    } finally { setDeleting(null) }
  }

  const clearSearch = () => { setSearch(''); setSelected(null); loadAll() }

  const d = selected?.extracted_data

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Resume History</h1>
          <p className="text-sm text-muted-foreground">
            {total} resume{total !== 1 ? 's' : ''} stored
          </p>
        </div>

        <form onSubmit={handleSearch} className="flex items-center gap-2">
          <div className="relative">
            <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"/>
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Filter by skill…"
              className="pl-8 pr-8 py-1.5 text-sm border rounded-lg bg-background
                focus:outline-none focus:ring-2 focus:ring-primary/30 w-44 transition"
            />
            {search && (
              <button type="button" onClick={clearSearch}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                <X size={12}/>
              </button>
            )}
          </div>
          <button type="submit" disabled={searching}
            className="px-3 py-1.5 text-sm bg-primary text-primary-foreground rounded-lg
              hover:opacity-90 transition disabled:opacity-50 flex items-center gap-1">
            {searching ? <Loader2 size={13} className="animate-spin"/> : <Search size={13}/>}
            Search
          </button>
          <button type="button" onClick={loadAll} title="Refresh"
            className="p-1.5 border rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition">
            <RefreshCw size={14}/>
          </button>
        </form>
      </div>

      {/* Loading */}
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="animate-spin text-primary" size={30}/>
        </div>
      ) : resumes.length === 0 ? (
        /* Empty State */
        <div className="text-center py-20 space-y-3">
          <div className="w-14 h-14 rounded-full bg-muted mx-auto flex items-center justify-center">
            <User className="text-muted-foreground" size={22}/>
          </div>
          <p className="font-semibold">
            {search ? `No resumes found with skill "${search}"` : 'No resumes yet'}
          </p>
          <p className="text-sm text-muted-foreground">
            {search ? 'Try a different keyword' : 'Upload a resume on the Extract tab to get started'}
          </p>
          {search && (
            <button onClick={clearSearch}
              className="text-sm text-primary hover:underline">Clear filter</button>
          )}
        </div>
      ) : (
        /* Chat-History Layout: Sidebar + Detail Panel */
        <div className="flex gap-4 min-h-[65vh]">

          {/* ─── Sidebar: Resume List ─── */}
          <div className="w-72 shrink-0 border rounded-xl bg-card overflow-hidden flex flex-col">
            <div className="px-3 py-2.5 border-b bg-muted/30 flex items-center gap-2">
              <FileText size={13} className="text-primary"/>
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Conversations
              </span>
              <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full font-medium">
                {total}
              </span>
            </div>
            <div className="flex-1 overflow-y-auto divide-y">
              {resumes.map(r => (
                <button
                  key={r.id}
                  onClick={() => setSelected(r)}
                  className={cn(
                    "w-full text-left px-3 py-3 transition-colors group relative",
                    selected?.id === r.id
                      ? "bg-accent/60 border-l-2 border-l-primary"
                      : "hover:bg-muted/40 border-l-2 border-l-transparent"
                  )}
                >
                  <div className="flex items-start gap-2.5">
                    <div className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      selected?.id === r.id
                        ? "bg-primary/15 border border-primary/25"
                        : "bg-muted border border-border"
                    )}>
                      <User size={14} className={cn(
                        selected?.id === r.id ? "text-primary" : "text-muted-foreground"
                      )}/>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm truncate",
                        selected?.id === r.id ? "font-semibold" : "font-medium"
                      )}>
                        {r.extracted_data.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {r.tags.slice(0, 3).join(' · ') || r.filename}
                      </p>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock size={9} className="text-muted-foreground"/>
                        <span className="text-[10px] text-muted-foreground">
                          {formatTime(r.uploaded_at)}
                        </span>
                      </div>
                    </div>
                    {/* Delete button on hover */}
                    <button
                      onClick={(e) => handleDelete(r.id, e)}
                      disabled={deleting === r.id}
                      aria-label="Delete resume"
                      className={cn(
                        "p-1 rounded-md transition-all shrink-0 opacity-0 group-hover:opacity-100",
                        deleting === r.id
                          ? "text-muted-foreground opacity-100"
                          : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                      )}>
                      {deleting === r.id
                        ? <Loader2 size={12} className="animate-spin"/>
                        : <Trash2 size={12}/>}
                    </button>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* ─── Detail Panel ─── */}
          <div className="flex-1 border rounded-xl bg-card overflow-hidden flex flex-col">
            {!selected || !d ? (
              <div className="flex-1 flex items-center justify-center text-muted-foreground text-sm">
                <div className="text-center space-y-2">
                  <ChevronLeft size={20} className="mx-auto"/>
                  <p>Select a resume from the sidebar</p>
                </div>
              </div>
            ) : (
              <>
                {/* Detail Header */}
                <div className="px-5 py-4 border-b bg-muted/20 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
                      <User className="text-primary" size={20}/>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold">{d.name}</h2>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mt-0.5">
                        <FileText size={10}/>
                        <span>{selected.filename}</span>
                        <span className="mx-1">·</span>
                        <Clock size={10}/>
                        <span>{formatFullDate(selected.uploaded_at)}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(selected.id)}
                    disabled={deleting === selected.id}
                    className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete this resume"
                  >
                    {deleting === selected.id
                      ? <Loader2 size={15} className="animate-spin"/>
                      : <Trash2 size={15}/>}
                  </button>
                </div>

                {/* Detail Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                  <div className="p-5 space-y-5">

                    {/* Summary */}
                    {d.summary && (
                      <div className="rounded-xl bg-muted/30 border p-4">
                        <p className="text-sm leading-relaxed text-foreground/80">{d.summary}</p>
                      </div>
                    )}

                    {/* Contact Info Bar */}
                    <div className="flex flex-wrap gap-3">
                      {d.email && (
                        <a href={`mailto:${d.email}`}
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-2.5 py-1.5 rounded-lg border">
                          <Mail size={12}/> {d.email}
                        </a>
                      )}
                      {d.phone && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg border">
                          <Phone size={12}/> {d.phone}
                        </span>
                      )}
                      {d.location && (
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground bg-muted/40 px-2.5 py-1.5 rounded-lg border">
                          <MapPin size={12}/> {d.location}
                        </span>
                      )}
                      {d.linkedin && (
                        <a href={ensureUrl(d.linkedin)} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-2.5 py-1.5 rounded-lg border">
                          <Linkedin size={12}/> LinkedIn <ExternalLink size={9}/>
                        </a>
                      )}
                      {d.github && (
                        <a href={ensureUrl(d.github)} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-primary transition-colors bg-muted/40 px-2.5 py-1.5 rounded-lg border">
                          <Github size={12}/> GitHub <ExternalLink size={9}/>
                        </a>
                      )}
                    </div>

                    {/* Skills + Languages */}
                    <div className="grid gap-4 md:grid-cols-2">
                      {d.skills.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Cpu size={13} className="text-primary"/>
                            <h3 className="text-sm font-semibold">Skills · {d.skills.length} found</h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {d.skills.map(s => <Tag key={s} label={s}/>)}
                          </div>
                        </div>
                      )}
                      {d.languages_known.length > 0 && (
                        <div className="space-y-2">
                          <div className="flex items-center gap-1.5">
                            <Globe size={13} className="text-primary"/>
                            <h3 className="text-sm font-semibold">Languages Known</h3>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {d.languages_known.map(l => <Tag key={l} label={l}/>)}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Education */}
                    {d.education.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <GraduationCap size={13} className="text-primary"/>
                          <h3 className="text-sm font-semibold">Education</h3>
                        </div>
                        <div className="space-y-2">
                          {d.education.map((e, i) => (
                            <div key={i} className={cn(
                              "flex justify-between items-start gap-4 rounded-lg border bg-muted/20 px-4 py-3"
                            )}>
                              <div>
                                <p className="font-semibold text-sm">{e.degree}</p>
                                <p className="text-xs text-muted-foreground">{e.institution}</p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="text-xs font-medium">{e.year}</p>
                                {e.score && <p className="text-xs text-muted-foreground">{e.score}</p>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Experience */}
                    {d.experience.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <Briefcase size={13} className="text-primary"/>
                          <h3 className="text-sm font-semibold">Work Experience</h3>
                        </div>
                        <div className="space-y-3">
                          {d.experience.map((exp, i) => (
                            <div key={i} className="rounded-lg border bg-muted/20 px-4 py-3">
                              <div className="flex justify-between items-start gap-3 mb-2">
                                <div>
                                  <p className="font-semibold text-sm">{exp.role}</p>
                                  <p className="text-xs text-muted-foreground">{exp.company}</p>
                                </div>
                                <span className="text-xs bg-muted px-2 py-0.5 rounded-full whitespace-nowrap shrink-0 border">
                                  {exp.duration}
                                </span>
                              </div>
                              <ul className="space-y-1">
                                {exp.description.map((dd, j) => (
                                  <li key={j} className="text-xs text-muted-foreground flex gap-2 items-start">
                                    <span className="text-primary shrink-0 mt-0.5">·</span> {dd}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Projects */}
                    {d.projects.length > 0 && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <FolderGit2 size={13} className="text-primary"/>
                          <h3 className="text-sm font-semibold">Projects</h3>
                        </div>
                        <div className="space-y-3">
                          {d.projects.map((p, i) => (
                            <div key={i} className="rounded-lg border bg-muted/20 px-4 py-3">
                              <p className="font-semibold text-sm">{p.name}</p>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                              <div className="flex flex-wrap gap-1 mt-2">
                                {p.tech_stack.map(t => <Tag key={t} label={t}/>)}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Achievements & Certs */}
                    {(d.achievements.length > 0 || d.certifications.length > 0) && (
                      <div className="space-y-3">
                        <div className="flex items-center gap-1.5">
                          <Award size={13} className="text-primary"/>
                          <h3 className="text-sm font-semibold">Achievements & Certifications</h3>
                        </div>
                        <ul className="space-y-2">
                          {[...d.achievements, ...d.certifications].map((a, i) => (
                            <li key={i} className="text-sm flex gap-2 items-start rounded-lg border bg-muted/20 px-4 py-2.5">
                              <span className="text-primary shrink-0 mt-0.5">✦</span> {a}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                  </div>
                </div>
              </>
            )}
          </div>

        </div>
      )}
    </div>
  )
}
