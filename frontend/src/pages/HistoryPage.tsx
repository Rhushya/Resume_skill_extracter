import { useEffect, useState } from 'react'
import { getAllResumes, deleteResume, searchBySkill, ResumeRecord } from '../lib/api'
import { Search, Trash2, User, Clock, Tag as TagIcon, Loader2, X, RefreshCw } from 'lucide-react'
import { cn } from '../lib/utils'

const SkillBadge = ({ label }: { label: string }) => (
  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs
    bg-accent text-accent-foreground border border-accent-foreground/10">
    <TagIcon size={9}/> {label}
  </span>
)

export default function HistoryPage() {
  const [resumes, setResumes]     = useState<ResumeRecord[]>([])
  const [loading, setLoading]     = useState(true)
  const [search, setSearch]       = useState('')
  const [searching, setSearching] = useState(false)
  const [total, setTotal]         = useState(0)
  const [deleting, setDeleting]   = useState<number | null>(null)

  const loadAll = async () => {
    setLoading(true)
    try {
      const res = await getAllResumes()
      setResumes(res.data.resumes)
      setTotal(res.data.total)
    } finally { setLoading(false) }
  }

  useEffect(() => { loadAll() }, [])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!search.trim()) { loadAll(); return }
    setSearching(true)
    try {
      const res = await searchBySkill(search)
      setResumes(res.data.resumes)
      setTotal(res.data.total)
    } finally { setSearching(false) }
  }

  const handleDelete = async (id: number) => {
    setDeleting(id)
    try {
      await deleteResume(id)
      setResumes(prev => prev.filter(r => r.id !== id))
      setTotal(prev => prev - 1)
    } finally { setDeleting(null) }
  }

  const clearSearch = () => { setSearch(''); loadAll() }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Resume History</h1>
          <p className="text-sm text-muted-foreground">
            {total} resume{total !== 1 ? 's' : ''} stored · search by skill tag
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
        /* Grid */
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {resumes.map(r => (
            <div key={r.id}
              className="border rounded-xl bg-card p-4 hover:shadow-md transition-shadow flex flex-col gap-3">

              {/* Card Header */}
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/15
                    flex items-center justify-center shrink-0">
                    <User className="text-primary" size={16}/>
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate">
                      {r.extracted_data.name || 'Unknown'}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{r.filename}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(r.id)}
                  disabled={deleting === r.id}
                  aria-label="Delete resume"
                  className={cn(
                    "p-1.5 rounded-md transition-colors shrink-0",
                    deleting === r.id
                      ? "text-muted-foreground opacity-50"
                      : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  )}>
                  {deleting === r.id
                    ? <Loader2 size={13} className="animate-spin"/>
                    : <Trash2 size={13}/>}
                </button>
              </div>

              {/* Skill Tags */}
              {r.tags.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {r.tags.slice(0, 6).map(t => <SkillBadge key={t} label={t}/>)}
                  {r.tags.length > 6 && (
                    <span className="text-xs text-muted-foreground self-center ml-0.5">
                      +{r.tags.length - 6}
                    </span>
                  )}
                </div>
              )}

              {/* Contact row */}
              {(r.extracted_data.email || r.extracted_data.phone) && (
                <p className="text-xs text-muted-foreground truncate">
                  {r.extracted_data.email || r.extracted_data.phone}
                </p>
              )}

              {/* Timestamp */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground mt-auto pt-1 border-t">
                <Clock size={10}/>
                {new Date(r.uploaded_at + 'Z').toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
