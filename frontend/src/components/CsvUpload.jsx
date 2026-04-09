import { useState } from 'react'
import { useTheme } from '../hooks/useTheme'

export default function CsvUpload({ endpoint, label, onSuccess }) {
  const { dark } = useTheme()
  const [uploading, setUploading] = useState(false)
  const [result, setResult] = useState(null)

  const handleUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    setResult(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await fetch(`/api/v1/import/${endpoint}`, {
        method: 'POST',
        body: formData,
      })
      const data = await res.json()
      if (res.ok) {
        setResult({ success: true, ...data })
        if (onSuccess) onSuccess(data)
      } else {
        setResult({ success: false, error: data.error || 'Upload failed' })
      }
    } catch (err) {
      setResult({ success: false, error: err.message })
    } finally {
      setUploading(false)
      e.target.value = '' // reset file input
    }
  }

  return (
    <div className="inline-flex items-center gap-2">
      <label className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-normal cursor-pointer transition-colors ${
        dark
          ? 'bg-white/5 border border-white/10 text-white/60 hover:bg-white/10'
          : 'bg-gray-50 border border-stripe-border text-stripe-body hover:bg-gray-100'
      }`}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M7 10V2M4 5l3-3 3 3M2 10v2h10v-2"/>
        </svg>
        {uploading ? 'Uploading...' : label}
        <input type="file" accept=".csv" onChange={handleUpload} className="hidden" disabled={uploading} />
      </label>
      {result && (
        <span className={`text-[10px] ${result.success ? 'text-emerald-400' : 'text-red-400'}`}>
          {result.success ? `${result.imported} imported, ${result.skipped} skipped` : result.error}
        </span>
      )}
    </div>
  )
}
