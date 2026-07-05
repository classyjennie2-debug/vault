'use client'

import { useRouter } from 'next/navigation'
import { FormEvent, useState } from 'react'

const ACCESS_CODE = '98894703'
const DOWNLOAD_URL = 'https://pub-76804685e01344f3b4711cc686545a05.r2.dev/Vault%20Capital%20Training.zip'

export function TrainingAccessPage() {
  const router = useRouter()
  const [accessCode, setAccessCode] = useState('')
  const [error, setError] = useState('')
  const [verified, setVerified] = useState(false)
  const [verifiedName, setVerifiedName] = useState('')
  const [isRedirecting, setIsRedirecting] = useState(false)

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const parts = accessCode.trim().split('-')
    if (parts.length === 2 && parts[1] === ACCESS_CODE && parts[0]) {
      const name = parts[0]
      const camelCaseName = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase()
      setVerifiedName(camelCaseName)
      setError('')
      setVerified(true)
      return
    }

    setError('The access code you entered is incorrect. Please try again or contact your administrator.')
  }

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = DOWNLOAD_URL
    link.target = '_blank'
    link.rel = 'noopener noreferrer'
    link.download = 'Vault Capital Training.zip'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    setIsRedirecting(true)

    window.setTimeout(() => {
      router.push('/training/next-steps')
    }, 8000)
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.18),_transparent_45%),linear-gradient(135deg,_#020617,_#111827)] px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-3xl flex-col gap-8 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        {!verified ? (
          <>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-cyan-300">Employee Training Portal</p>
              <h1 className="text-3xl font-semibold sm:text-4xl">Access the Vault Capital training software</h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Enter the access code provided by your administrator to continue to the download page.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 rounded-2xl border border-white/10 bg-slate-950/70 p-6">
              <label htmlFor="access-code" className="block text-sm font-medium text-slate-200">
                Access code
              </label>
              <input
                id="access-code"
                type="text"
                inputMode="numeric"
                value={accessCode}
                onChange={(event) => setAccessCode(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-base text-white outline-none ring-0 transition focus:border-cyan-400"
                placeholder="e.g., sarah-98894703"
              />

              {error ? <p className="text-sm text-rose-400">{error}</p> : null}

              <button
                type="submit"
                className="w-full rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
              >
                Verify access code
              </button>
            </form>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Access granted</p>
              <h1 className="text-3xl font-semibold sm:text-4xl">Hello {verifiedName}</h1>
              <p className="max-w-2xl text-base text-slate-300 sm:text-lg">
                Download the Vault Capital employee training software and follow the installation instructions below.
              </p>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-6">
              <h2 className="text-xl font-semibold text-white">How to install</h2>
              <ol className="mt-4 list-decimal space-y-2 pl-6 text-slate-300">
                <li>Click the download button below.</li>
                <li>Open the downloaded file.</li>
                <li>Run Vault Capital Training on your PC.</li>
              </ol>
              <p className="mt-4 text-sm text-slate-400">
                After successful installation, you will be automatically redirected to the next steps page.
              </p>
            </div>

            <button
              type="button"
              onClick={handleDownload}
              className="rounded-xl bg-white px-4 py-3 font-semibold text-slate-950 transition hover:bg-slate-200"
            >
              Download training software
            </button>

            {isRedirecting ? (
              <p className="text-sm text-cyan-300">Preparing the next steps page. Please wait...</p>
            ) : null}
          </>
        )}
      </div>
    </main>
  )
}
