import axios from 'axios'

const api = axios.create({ baseURL: '/api/resume', timeout: 90000 })
const apiRoot = axios.create({ baseURL: '/api', timeout: 90000 })

export interface ExtractedData {
  name: string
  email: string | null
  phone: string | null
  location: string | null
  linkedin: string | null
  github: string | null
  summary: string
  skills: string[]
  languages_known: string[]
  education: { degree: string; institution: string; year: string; score: string }[]
  experience: { role: string; company: string; duration: string; description: string[] }[]
  projects: { name: string; tech_stack: string[]; description: string }[]
  certifications: string[]
  achievements: string[]
}

export interface ResumeRecord {
  id: number
  filename: string
  extracted_data: ExtractedData
  tags: string[]
  uploaded_at: string
}

export const uploadResume  = (file: File) => {
  const form = new FormData()
  form.append('file', file)
  return api.post<{ id: number; filename: string; extracted_data: ExtractedData; message: string }>('/upload', form)
}
export const getAllResumes   = () => api.get<{ resumes: ResumeRecord[]; total: number }>('/all')
export const deleteResume    = (id: number) => api.delete(`/${id}`)
export const searchBySkill   = (skill: string) =>
  api.get<{ resumes: ResumeRecord[]; total: number; query: string }>(`/search?skill=${encodeURIComponent(skill)}`)

export const getHealth = () => apiRoot.get<{ status: string; message: string }>('/health')
export const getConfigStatus = () => apiRoot.get<{ groq_api_key_set: boolean }>('/config')
