import Link from 'next/link'

export const metadata = {
  title: 'Next Steps | Vault Capital',
  description: 'Next steps after installing the Vault Capital training software.',
}

export default function TrainingNextStepsPage() {
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.16),_transparent_45%),linear-gradient(135deg,_#020617,_#111827)] px-4 py-16 text-slate-100 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-black/30 backdrop-blur">
        <div className="space-y-3">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-emerald-300">Next steps</p>
          <h1 className="text-3xl font-semibold sm:text-4xl">Installation complete</h1>
          <p className="text-base text-slate-300 sm:text-lg">
            Thank you for installing Vault Capital Training. Please continue with the onboarding steps provided by your manager.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-6 text-slate-300">
          <p className="font-medium text-white">What happens next?</p>
          <ul className="mt-3 list-disc space-y-2 pl-5">
            <li>Complete the training checklist.</li>
            <li>Follow the instructions from your supervisor.</li>
            <li>Contact support if you need help with the installation.</li>
          </ul>
        </div>

        <Link
          href="/"
          className="inline-flex items-center justify-center rounded-xl bg-cyan-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-cyan-400"
        >
          Return to home
        </Link>
      </div>
    </main>
  )
}
