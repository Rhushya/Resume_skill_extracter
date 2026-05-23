import { useState, useRef, DragEvent, useEffect } from 'react'
import { uploadResume, ExtractedData, getHealth, getConfigStatus } from '../lib/api'
import {
  Upload, Loader2, CheckCircle, AlertCircle,
  User, Mail, Phone, MapPin, Github, Linkedin,
  Briefcase, GraduationCap, FolderGit2, Award,
  Globe, Cpu, ChevronDown, ChevronUp
} from 'lucide-react'
import { cn, ensureUrl } from '../lib/utils'

type Status = 'idle' | 'uploading' | 'success' | 'error'

const Tag = ({ label }: { label: string }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
    bg-accent text-accent-foreground border border-accent-foreground/10">
    {label}
  </span>
)

const Section = ({ icon, title, children, defaultOpen = true }: {
  icon: React.ReactNode; title: string; children: React.ReactNode; defaultOpen?: boolean
}) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border rounded-xl bg-card overflow-hidden shadow-sm">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between px-4 py-3 border-b bg-muted/30 hover:bg-muted/50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <span className="text-primary">{icon}</span>
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        {open ? <ChevronUp size={14} className="text-muted-foreground"/> : <ChevronDown size={14} className="text-muted-foreground"/>}
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  )
}

export default function HomePage() {
  const [status, setStatus]   = useState<Status>('idle')
  const [error, setError]     = useState('')
  const [result, setResult]   = useState<ExtractedData | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const [fileName, setFileName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const [configState, setConfigState] = useState<'checking' | 'ok' | 'missing-key' | 'backend-down'>('checking')

  useEffect(() => {
    let cancelled = false
    const checkConfig = async () => {
      try {
        await getHealth()
        const config = await getConfigStatus()
        if (!cancelled) {
          setConfigState(config.data.groq_api_key_set ? 'ok' : 'missing-key')
        }
      } catch {
        if (!cancelled) {
          setConfigState('backend-down')
        }
      }
    }
    checkConfig()
    return () => { cancelled = true }
  }, [])

  const handleFile = async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Only PDF files are supported.')
      setStatus('error')
      return
    }
    setFileName(file.name)
    setStatus('uploading')
    setError('')
    setResult(null)
    try {
      const res = await uploadResume(file)
      setResult(res.data.extracted_data)
      setStatus('success')
      setTimeout(() => window.scrollTo({ top: 400, behavior: 'smooth' }), 100)
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Something went wrong. Check your GROQ_API_KEY and backend.')
      setStatus('error')
    }
  }

  const onDrop = (e: DragEvent) => {
    e.preventDefault(); setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) handleFile(file)
  }

  return (
    <div className="space-y-7">
      {/* Hero */}
      <div className="text-center space-y-2 pt-2">
        <h1 className="text-3xl font-bold tracking-tight">Resume Skill Extractor</h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Upload any PDF resume and get structured data — name, email, skills, experience,
          projects — extracted instantly using Groq's Llama 3.3.
        </p>
      </div>

      {/* Upload Zone */}
      <div
        onClick={() => fileRef.current?.click()}
        onDrop={onDrop}
        onDragOver={e => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        className={cn(
          'border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-200',
          dragOver
            ? 'border-primary bg-accent/20 scale-[1.01]'
            : 'border-border hover:border-primary/40 hover:bg-muted/30',
          status === 'uploading' && 'pointer-events-none opacity-60'
        )}
      >
        <input ref={fileRef} type="file" accept=".pdf" className="hidden"
          onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />

        {status === 'uploading' ? (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-accent/50 flex items-center justify-center animate-pulse">
              <Loader2 className="animate-spin text-primary" size={28}/>
            </div>
            <p className="font-semibold">Extracting from <span className="text-primary">{fileName}</span>…</p>
            <p className="text-xs text-muted-foreground">Groq LLM is parsing your resume · usually &lt; 10 seconds</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="w-16 h-16 rounded-full bg-accent/40 flex items-center justify-center">
              <Upload className="text-primary" size={26}/>
            </div>
            <div>
              <p className="font-semibold text-base">Drop your PDF resume here</p>
              <p className="text-xs text-muted-foreground mt-1">or click to browse · PDF only · Max 5 MB</p>
            </div>
            <div className="flex gap-4 text-xs text-muted-foreground pt-1">
              <span className="flex items-center gap-1">✓ Extract skills</span>
              <span className="flex items-center gap-1">✓ Parse experience</span>
              <span className="flex items-center gap-1">✓ Save to history</span>
            </div>
          </div>
        )}
      </div>

      {configState === 'missing-key' && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle size={18} className="mt-0.5 shrink-0"/>
          <span>GROQ_API_KEY is not set. Add it to your .env file.</span>
        </div>
      )}
      {configState === 'backend-down' && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle size={18} className="mt-0.5 shrink-0"/>
          <span>Backend is not reachable. Make sure the API is running on port 8000.</span>
        </div>
      )}

      {/* Error Banner */}
      {status === 'error' && (
        <div className="flex items-start gap-3 p-4 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive text-sm">
          <AlertCircle size={18} className="mt-0.5 shrink-0"/>
          <span>{error}</span>
        </div>
      )}

      {/* Success Banner */}
      {status === 'success' && result && (
        <div className="flex items-center gap-3 p-3 rounded-xl border border-green-500/25 bg-green-500/5
          text-green-700 dark:text-green-400 text-sm">
          <CheckCircle size={16} className="shrink-0"/>
          <span>Extracted and saved · <strong>{fileName}</strong></span>
        </div>
      )}

      {/* Results */}
      {result && (
        <div className="space-y-4 animate-in fade-in duration-300">

          {/* Profile Header */}
          <div className="border rounded-2xl bg-card p-5 shadow-sm flex flex-col sm:flex-row gap-4">
            <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
              <User className="text-primary" size={26}/>
            </div>
            <div className="flex-1 min-w-0 space-y-2">
              <h2 className="text-xl font-bold">{result.name}</h2>
              {result.summary && (
                <p className="text-sm text-muted-foreground leading-relaxed">{result.summary}</p>
              )}
              <div className="flex flex-wrap gap-3 pt-1">
                {result.email && (
                  <a href={`mailto:${result.email}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Mail size={11}/> {result.email}
                  </a>
                )}
                {result.phone && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Phone size={11}/> {result.phone}
                  </span>
                )}
                {result.location && (
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin size={11}/> {result.location}
                  </span>
                )}
                {result.linkedin && (
                  <a href={ensureUrl(result.linkedin)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Linkedin size={11}/> LinkedIn
                  </a>
                )}
                {result.github && (
                  <a href={ensureUrl(result.github)} target="_blank" rel="noopener noreferrer"
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-primary transition-colors">
                    <Github size={11}/> GitHub
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Skills + Languages */}
          <div className="grid gap-4 md:grid-cols-2">
            {result.skills.length > 0 && (
              <Section icon={<Cpu size={15}/>} title={`Skills · ${result.skills.length} found`}>
                <div className="flex flex-wrap gap-1.5">
                  {result.skills.map(s => <Tag key={s} label={s}/>)}
                </div>
              </Section>
            )}
            {result.languages_known.length > 0 && (
              <Section icon={<Globe size={15}/>} title="Languages Known">
                <div className="flex flex-wrap gap-1.5">
                  {result.languages_known.map(l => <Tag key={l} label={l}/>)}
                </div>
              </Section>
            )}
          </div>

          {/* Education */}
          {result.education.length > 0 && (
            <Section icon={<GraduationCap size={15}/>} title="Education">
              <div className="space-y-3">
                {result.education.map((e, i) => (
                  <div key={i} className={cn("flex justify-between items-start gap-4", i > 0 && "pt-3 border-t")}>
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
            </Section>
          )}

          {/* Experience */}
          {result.experience.length > 0 && (
            <Section icon={<Briefcase size={15}/>} title="Work Experience">
              <div className="space-y-4">
                {result.experience.map((exp, i) => (
                  <div key={i} className={cn(i > 0 && "pt-4 border-t")}>
                    <div className="flex justify-between items-start gap-3 mb-2">
                      <div>
                        <p className="font-semibold text-sm">{exp.role}</p>
                        <p className="text-xs text-muted-foreground">{exp.company}</p>
                      </div>
                      <span className="text-xs bg-muted px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
                        {exp.duration}
                      </span>
                    </div>
                    <ul className="space-y-1">
                      {exp.description.map((d, j) => (
                        <li key={j} className="text-xs text-muted-foreground flex gap-2 items-start">
                          <span className="text-primary shrink-0 mt-0.5">·</span> {d}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Projects */}
          {result.projects.length > 0 && (
            <Section icon={<FolderGit2 size={15}/>} title="Projects">
              <div className="space-y-4">
                {result.projects.map((p, i) => (
                  <div key={i} className={cn(i > 0 && "pt-4 border-t")}>
                    <p className="font-semibold text-sm">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{p.description}</p>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {p.tech_stack.map(t => <Tag key={t} label={t}/>)}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          )}

          {/* Achievements & Certs */}
          {(result.achievements.length > 0 || result.certifications.length > 0) && (
            <Section icon={<Award size={15}/>} title="Achievements & Certifications">
              <ul className="space-y-2">
                {[...result.achievements, ...result.certifications].map((a, i) => (
                  <li key={i} className="text-sm flex gap-2 items-start">
                    <span className="text-primary shrink-0 mt-0.5">✦</span> {a}
                  </li>
                ))}
              </ul>
            </Section>
          )}

        </div>
      )}
    </div>
  )
}
