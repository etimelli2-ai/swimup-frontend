// Outil gratuit, sans compte : lien direct vers le formulaire d'avis Google + QR code + affiche A4.
// Tout est calculé dans le navigateur ; ce que la personne saisit n'est envoyé nulle part.
import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Copy, Check, Download, Printer, TriangleAlert, ChevronRight, QrCode, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'
import Seo from '../../components/Seo'
import { mesure } from '../../lib/mesure.mjs'
import CadrePublic from '../../components/CadrePublic'
import { analyserLien } from '../../lib/lienAvis.mjs'
import { filAriane, urlAbsolue } from '../../lib/seo.mjs'

const CHEMIN = '/outils/lien-avis-google'
const MESSAGE_DEFAUT = 'Votre avis nous aide à nous améliorer et aide d\'autres personnes à nous connaître.'
const LIEN_FINDER = 'https://developers.google.com/maps/documentation/javascript/examples/places-placeid-finder'

const JSON_LD = [
  {
    '@context': 'https://schema.org', '@type': 'WebApplication', name: 'Générateur de lien et de QR code pour les avis Google',
    url: urlAbsolue(CHEMIN), applicationCategory: 'BusinessApplication', operatingSystem: 'Tous (navigateur web)', inLanguage: 'fr-FR',
    description: 'Crée le lien direct vers le formulaire d\'avis Google de ton commerce, son QR code et une affiche A4 à imprimer.',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  },
  filAriane([['Accueil', '/'], ['Outils', CHEMIN], ['Lien et QR code d\'avis Google', CHEMIN]]),
]

function useQr(lien) {
  const [qr, setQr] = useState(null)
  useEffect(() => {
    let annule = false
    if (!lien) { setQr(null); return }
    // La bibliothèque ne se charge que quand on en a besoin (une quinzaine de Ko).
    import('qrcode')
      .then(m => (m.default || m).toDataURL(lien, { errorCorrectionLevel: 'M', margin: 2, width: 720, color: { dark: '#0B1F33', light: '#FFFFFF' } }))
      .then(url => { if (!annule) setQr(url) })
      .catch(() => { if (!annule) setQr(null) })
    return () => { annule = true }
  }, [lien])
  return qr
}

function Affiche({ qr, nom, message }) {
  return (
    <div id="affiche-a4" className="affiche-a4 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-200/60 overflow-hidden mx-auto w-full max-w-[420px]" style={{ aspectRatio: '210 / 297', containerType: 'inline-size' }}>
      <div className="h-full flex flex-col items-center text-center" style={{ padding: '9cqw 9cqw 7cqw' }}>
        <div style={{ width: '100%', height: '1.6cqw', background: '#0ea5e9', borderRadius: '1cqw', marginBottom: '8cqw' }} />
        <p style={{ fontSize: '9cqw', lineHeight: 1.1, fontWeight: 700, letterSpacing: '-0.02em', color: '#0B1F33' }}>Votre avis compte</p>
        {nom && <p style={{ fontSize: '5.4cqw', marginTop: '3cqw', color: '#0369A1', fontWeight: 600 }}>{nom}</p>}
        <p style={{ fontSize: '3.6cqw', lineHeight: 1.4, marginTop: '4cqw', color: '#475569', maxWidth: '78%' }}>{message}</p>
        <div className="flex-1 flex items-center justify-center w-full">
          {qr
            ? <img src={qr} alt="QR code vers le formulaire d'avis Google" style={{ width: '62cqw', height: '62cqw' }} />
            : <div style={{ width: '62cqw', height: '62cqw', border: '0.5cqw dashed #cbd5e1', borderRadius: '3cqw' }} className="flex items-center justify-center text-slate-400"><QrCode size={48} /></div>}
        </div>
        <p style={{ fontSize: '4.6cqw', fontWeight: 600, color: '#0B1F33' }}>Scannez pour laisser un avis sur Google</p>
        <p style={{ fontSize: '3cqw', marginTop: '2cqw', color: '#64748b' }}>Ouvrez l'appareil photo de votre téléphone et visez le code.</p>
      </div>
    </div>
  )
}

export default function LienAvisGoogle() {
  const [saisie, setSaisie] = useState('')
  const [nom, setNom] = useState('')
  const [message, setMessage] = useState(MESSAGE_DEFAUT)
  const [copie, setCopie] = useState(false)
  const r = useMemo(() => analyserLien(saisie), [saisie])
  const lien = r.ok ? r.lien : null
  const qr = useQr(lien)

  const copier = async () => {
    try { await navigator.clipboard.writeText(lien); mesure('outil-lien-copie'); setCopie(true); setTimeout(() => setCopie(false), 1800) }
    catch { toast.error('Copie impossible, sélectionne le lien à la main.') }
  }
  const telecharger = () => {
    if (!qr) return
    mesure('outil-qr-telecharge')
    const a = document.createElement('a'); a.href = qr; a.download = 'qr-code-avis-google.png'
    document.body.appendChild(a); a.click(); a.remove()
  }

  return (
    <CadrePublic large>
      <Seo
        title="Lien et QR code pour demander des avis Google"
        description="Crée gratuitement le lien direct vers le formulaire d'avis Google de ton commerce, son QR code et une affiche A4 à imprimer. Sans compte, directement dans ton navigateur."
        path={CHEMIN}
        jsonLd={JSON_LD}
      />
      <style>{`
        @media print {
          @page { size: A4; margin: 0 }
          html, body { height: auto !important; background: #fff !important }
          #root { height: 0 !important; overflow: hidden !important }
          #affiche-a4 { position: fixed !important; left: 0; top: 0; width: 210mm !important; height: 297mm !important; max-width: none !important; margin: 0 !important; border: 0 !important; border-radius: 0 !important; box-shadow: none !important; -webkit-print-color-adjust: exact; print-color-adjust: exact }
        }
      `}</style>

      <section className="max-w-4xl mx-auto px-4 pt-10 pb-6 print:hidden">
        <nav aria-label="Fil d'Ariane" className="text-[13px] text-slate-400 flex items-center gap-1">
          <Link to="/" className="hover:text-slate-600">Accueil</Link><ChevronRight size={12} />
          <span className="text-slate-500">Outils</span>
        </nav>
        <h1 className="mt-4 text-[32px] sm:text-[44px] leading-[1.08] font-semibold tracking-tight text-slate-900 max-w-2xl">
          Crée le lien et le QR code pour demander des avis Google
        </h1>
        <p className="mt-4 text-[17px] leading-relaxed text-slate-500 max-w-2xl">
          Colle ton lien ou ton identifiant Google : tu obtiens le lien direct vers le formulaire d'avis, un QR code à télécharger et une affiche A4 prête à imprimer. C'est gratuit, sans compte, et ce que tu écris reste dans ton navigateur.
        </p>
      </section>

      <main className="max-w-4xl mx-auto px-4 pb-16">
        <div className="grid lg:grid-cols-[1.1fr_1fr] gap-8 items-start">
          <div className="space-y-6 print:hidden">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/60">
              <label htmlFor="lien-saisie" className="text-[15px] font-semibold text-slate-900">1. Ton lien ou ton identifiant Google</label>
              <input
                id="lien-saisie" value={saisie} onChange={e => setSaisie(e.target.value)} inputMode="url" autoComplete="off" spellCheck={false}
                placeholder="g.page/r/…/review ou ChIJ…"
                className="mt-3 w-full rounded-xl border border-slate-300 px-4 py-3 text-[16px] focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
                aria-describedby="lien-aide" aria-invalid={saisie.trim() !== '' && !r.ok}
              />
              <div id="lien-aide" aria-live="polite">
                {saisie.trim() !== '' && !r.ok && (
                  <p className="mt-3 flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-[14px] px-4 py-3">
                    <TriangleAlert size={16} className="mt-0.5 shrink-0" /> {r.erreur}
                  </p>
                )}
              </div>
              <details className="mt-4 text-[14px] text-slate-600">
                <summary className="cursor-pointer font-medium text-sky-600">Où trouver mon lien ou mon identifiant ?</summary>
                <div className="mt-3 space-y-3 leading-relaxed">
                  <p><strong className="font-semibold text-slate-800">Le plus simple :</strong> sur Google, cherche le nom de ton établissement quand tu es connecté au compte qui gère ta fiche, puis clique sur « Demander des avis ». Google te donne un lien qui ressemble à g.page/r/…/review. Copie-le ici.</p>
                  <p><strong className="font-semibold text-slate-800">Sinon :</strong> l'outil officiel de Google{' '}
                    <a href={LIEN_FINDER} target="_blank" rel="noopener noreferrer" className="underline text-sky-600 inline-flex items-center gap-0.5">Place ID Finder<ExternalLink size={12} /></a>{' '}
                    te donne l'identifiant de ton lieu : il commence par ChIJ. Colle-le ici.</p>
                </div>
              </details>
            </div>

            {lien && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/60 space-y-4">
                <p className="text-[15px] font-semibold text-slate-900">2. Ton lien direct</p>
                <p className="rounded-xl bg-slate-50 border border-slate-200 px-4 py-3 text-[14px] text-slate-700 break-all select-all">{lien}</p>
                <div className="flex flex-wrap gap-2">
                  <button onClick={copier} className="inline-flex items-center gap-1.5 rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[14px] font-semibold px-5 py-2.5">
                    {copie ? <Check size={15} /> : <Copy size={15} />} {copie ? 'Copié' : 'Copier le lien'}
                  </button>
                  <a href={lien} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 text-slate-700 text-[14px] font-medium px-5 py-2.5 hover:bg-slate-50">
                    Tester le lien <ExternalLink size={14} />
                  </a>
                </div>
                <p className="text-[13px] text-slate-500">Teste-le toujours avec ton téléphone avant d'imprimer : le formulaire d'avis de ta fiche doit s'ouvrir.</p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 sm:p-6 shadow-xl shadow-slate-200/60 space-y-4">
              <p className="text-[15px] font-semibold text-slate-900">{lien ? '3.' : '2.'} Personnalise ton affiche</p>
              <div>
                <label htmlFor="affiche-nom" className="text-[14px] font-medium text-slate-700">Nom de ton établissement</label>
                <input id="affiche-nom" value={nom} onChange={e => setNom(e.target.value.slice(0, 60))} placeholder="Boulangerie Dupont"
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-sky-500" />
              </div>
              <div>
                <label htmlFor="affiche-msg" className="text-[14px] font-medium text-slate-700">Petit mot</label>
                <textarea id="affiche-msg" value={message} onChange={e => setMessage(e.target.value.slice(0, 140))} rows={2}
                  className="mt-1.5 w-full rounded-xl border border-slate-300 px-4 py-2.5 text-[16px] focus:outline-none focus:ring-2 focus:ring-sky-500" />
                <p className="mt-1.5 text-[13px] text-slate-500">Demande un avis, pas une note : ne guide pas la réponse et ne promets rien en échange.</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button onClick={telecharger} disabled={!qr} className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 text-slate-700 text-[14px] font-medium px-5 py-2.5 hover:bg-slate-50 disabled:opacity-40">
                  <Download size={15} /> Télécharger le QR code (PNG)
                </button>
                <button onClick={() => { mesure('outil-affiche-imprimee'); window.print() }} disabled={!qr} className="inline-flex items-center gap-1.5 rounded-full bg-slate-900 text-white text-[14px] font-semibold px-5 py-2.5 hover:bg-slate-800 disabled:opacity-40">
                  <Printer size={15} /> Imprimer l'affiche A4
                </button>
              </div>
              {!lien && <p className="text-[13px] text-slate-500">Le QR code et l'impression se débloquent dès que ton lien est reconnu.</p>}
            </div>
          </div>

          <div className="lg:sticky lg:top-20">
            <Affiche qr={qr} nom={nom.trim()} message={message.trim() || MESSAGE_DEFAUT} />
          </div>
        </div>

        <article className="mt-16 max-w-2xl print:hidden">
          <h2 className="text-[24px] font-semibold tracking-tight text-slate-900">Comment ça marche</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
            Google propose un formulaire d'avis qui s'ouvre directement sur ta fiche. Son adresse est construite à partir de l'identifiant de ton lieu, ou fournie par le bouton « Demander des avis » de ton profil. L'outil reconnaît ces deux formes, vérifie que l'adresse est bien celle d'un formulaire d'avis, puis fabrique le QR code qui y mène. Rien n'est envoyé à nos serveurs : le calcul se fait sur ton appareil.
          </p>

          <h2 className="mt-10 text-[24px] font-semibold tracking-tight text-slate-900">Où mettre le QR code</h2>
          <p className="mt-3 text-[16px] leading-relaxed text-slate-600">
            Le bon endroit est celui où le client a déjà son téléphone en main et un moment de calme : à côté de la caisse ou du terminal de paiement, au dos du ticket ou de l'addition, sur la facture ou le devis, sur la carte de visite, dans la signature de tes emails. Pour un artisan, la fin du chantier avec la facture marche bien. Pour un restaurant, l'addition ou le plateau.
          </p>

          <h2 className="mt-10 text-[24px] font-semibold tracking-tight text-slate-900">Ce qu'il ne faut pas faire</h2>
          <ul className="mt-3 space-y-2 text-[16px] leading-relaxed text-slate-600 list-disc pl-5">
            <li>Ne demande l'avis qu'aux clients que tu sais contents : Google interdit de trier ceux qu'on sollicite. Montre le même QR code à tout le monde.</li>
            <li>N'offre rien en échange d'un avis (réduction, cadeau, service) : c'est contraire aux règles de Google, même sans demander un avis positif.</li>
            <li>N'écris pas d'avis sur ta propre fiche et n'en fais pas écrire par tes proches ou tes employés.</li>
          </ul>
          <p className="mt-3 text-[14px] leading-relaxed text-slate-500">Les règles évoluent : relis de temps en temps l'aide officielle de Google sur les avis. Notre guide détaille tout ça : <Link to="/aide-commercants/obtenir-des-avis-google" className="underline text-sky-600">obtenir plus d'avis Google, honnêtement</Link>.</p>

          <div className="mt-12 rounded-2xl bg-slate-50 border border-slate-200 p-6">
            <h2 className="text-[20px] font-semibold tracking-tight text-slate-900">Et après l'impression ?</h2>
            <p className="mt-2 text-[15px] leading-relaxed text-slate-600">
              Avec un compte gratuit SwimUp, tu gardes ton lien et ton QR code au même endroit, tu vois combien de personnes scannent ou cliquent, tu peux envoyer une demande d'avis par email à tes propres clients (3 par jour) et tu as de l'aide pour rédiger tes réponses aux avis (3 par jour). Pas de carte bancaire.
            </p>
            <a href="/inscription?src=outil-lien" className="mt-4 inline-flex items-center rounded-full bg-sky-500 hover:bg-sky-600 text-white text-[14px] font-semibold px-6 py-2.5">Créer un compte gratuit</a>
          </div>
        </article>
      </main>
    </CadrePublic>
  )
}
