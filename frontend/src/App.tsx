import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useState } from 'react'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'
import { FileText, History, Moon, Sun, Sparkles } from 'lucide-react'
import { cn } from './lib/utils'

export default function App() {
  const [dark, setDark] = useState(false)
  const { pathname } = useLocation()

  const toggleDark = () => {
    setDark(d => !d)
    document.documentElement.classList.toggle('dark')
  }

  const navLink = (to: string, icon: React.ReactNode, label: string) => (
    <Link to={to} className={cn(
      'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors',
      pathname === to
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-muted'
    )}>
      {icon} {label}
    </Link>
  )

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 border-b bg-card/80 backdrop-blur-sm">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* SVG Logo */}
            <svg width="30" height="30" viewBox="0 0 30 30" fill="none" aria-label="ResumeAI logo">
              <rect width="30" height="30" rx="7" fill="hsl(185,98%,20%)"/>
              <rect x="7" y="8" width="11" height="2" rx="1" fill="white" fillOpacity="0.9"/>
              <rect x="7" y="12" width="16" height="2" rx="1" fill="white" fillOpacity="0.7"/>
              <rect x="7" y="16" width="13" height="2" rx="1" fill="white" fillOpacity="0.5"/>
              <circle cx="21" cy="21" r="5" fill="hsl(185,60%,35%)"/>
              <path d="M19 21l1.5 1.5 3-3" stroke="white" strokeWidth="1.4"
                    strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <div className="flex items-center gap-1">
              <span className="font-bold text-sm">ResumeAI</span>
              <span className="hidden sm:flex items-center gap-0.5 text-xs text-muted-foreground border rounded-full px-1.5 py-0.5">
                <Sparkles size={9}/> Groq · Llama 3.3
              </span>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {navLink('/', <FileText size={14}/>, 'Extract')}
            {navLink('/history', <History size={14}/>, 'History')}
            <button onClick={toggleDark} aria-label="Toggle dark mode"
              className="ml-1 p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
              {dark ? <Sun size={15}/> : <Moon size={15}/>}
            </button>
          </nav>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <Routes>
          <Route path="/"        element={<HomePage />} />
          <Route path="/history" element={<HistoryPage />} />
        </Routes>
      </main>

      <footer className="border-t mt-16 py-6 text-center text-xs text-muted-foreground">
        Resume Skill Extractor · Built with FastAPI + React + Groq
      </footer>
    </div>
  )
}
