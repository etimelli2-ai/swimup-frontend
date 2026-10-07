import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import usePageTitle from '../../hooks/usePageTitle'
import toast from 'react-hot-toast'
import { Download, Send, Sparkles, Copy, Star, BookOpen, Crown } from 'lucide-react'

const MAX_DEST = 20
const TONS = [
  { v: 'professionnel', l: 'Professionnel' },
  { v: 'chaleureux', l: 'Chaleureux' },
  { v: 'concis', l: 'Concis' },
]

// Extrait les adresses d'un texte collé (une par ligne, ou séparées par
// virgule / point-virgule). "Prénom <mail>" et "mail;Prénom" sont acceptés.
function lireDestinataires(texte) {
  const vus = new Set()
  const liste = []
  for (const ligne of texte.split(/[\n;]+/)) {
    const m = ligne.match(/[^\s<>,"']+@[^\s<>,"']+\.[^\s<>,"']+/)
    if (!m) continue
    const email = m[0].toLowerCase()
    if (vus.has(email)) continue
    vus.add(email)
    const prenom = ligne.replace(m[0], '').replace(/[<>,"']/g, '').trim().split(/\s+/)[0] || ''
    liste.push({ email, ...(prenom ? { prenom: prenom.slice(0, 40) } : {}) })
  }
  return liste
}

function Quota({ q }) {
  if (!q) return null
  return <span className="text-xs text-slate-500 dark:text-slate-400">{q.restant}/{q.limite} restants aujourd'hui</span>
}

export default function ClientOutils() {
  usePageTitle('Outils avis')
  const [data, setData] = useState(null)
  const [erreur, setErreur] = useState(false)
  const [form, setForm] = useState({ lien_avis: '', nom_commerce: '', message_perso: '' })
  const [sauvegarde, setSauvegarde] = useState(false)
  const [pdfEnCours, setPdfEnCours] = useState(null)

  const [texteMails, setTexteMails] = useState('')
  const [attestation, setAttestation] = useState(false)
  const [envoiMails, setEnvoiMails] = useState(false)
  const [bilanMails, setBilanMails] = useState(null)

  const [avis, setAvis] = useState('')
  const [note, setNote] = useState(5)
  const [ton, setTon] = useState('professionnel')
  const [reponse, setReponse] = useState('')
  const [genEnCours, setGenEnCours] = useState(false)

  const charger = () => api.get('/client/commercant').then(r => {
    setData(r.data)
    setForm({
      lien_avis: r.data.config.lien_avis || '',
      nom_commerce: r.data.config.nom_commerce || r.data.nom_societe || '',
      message_perso: r.data.config.message_perso || '',
    })
  }).catch(() => setErreur(true))
  useEffect(() => { charger() }, [])

  async function enregistrer(e) {
    e.preventDefault()
    setSauvegarde(true)
    try {
      const corps = { lien_avis: form.lien_avis.trim() || null, nom_commerce: form.nom_commerce.trim() || null }
      if (data.premium) corps.message_perso = form.message_perso.trim() || null
      await api.put('/client/commercant', corps)
      toast.success('Enregistré')
      await charger()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setSauvegarde(false)
    }
  }

  async function telechargerAffiche(format) {
    setPdfEnCours(format)
    try {
      const r = await api.get('/client/commercant/affiche', { params: { format }, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([r.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `affiche-avis-${format}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
    } catch {
      toast.error("Impossible de générer l'affiche, vérifie que ton lien est bien enregistré.")
    } finally {
      setPdfEnCours(null)
    }
  }

  const destinataires = lireDestinataires(texteMails)
  const configPrete = !!(data?.config.lien_avis && data?.config.nom_commerce)

  async function envoyerDemandes(e) {
    e.preventDefault()
    setEnvoiMails(true)
    setBilanMails(null)
    try {
      const r = await api.post('/client/commercant/demandes-avis', {
        destinataires: destinataires.slice(0, MAX_DEST), attestation,
      })
      setBilanMails(r.data)
      setTexteMails('')
      setAttestation(false)
      toast.success(`${r.data.envoyes} email${r.data.envoyes > 1 ? 's' : ''} envoyé${r.data.envoyes > 1 ? 's' : ''}`)
      charger()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setEnvoiMails(false)
    }
  }

  async function genererReponse(e) {
    e.preventDefault()
    setGenEnCours(true)
    try {
      const r = await api.post('/client/commercant/reponse-avis', { avis, note, ton })
      setReponse(r.data.texte)
      charger()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setGenEnCours(false)
    }
  }

  async function copier() {
    try {
      await navigator.clipboard.writeText(reponse)
      toast.success('Copié')
    } catch {
      toast.error('Copie impossible, sélectionne le texte à la main.')
    }
  }

  if (erreur) return <div className="card p-6 text-sm text-slate-600 dark:text-slate-300">Impossible de charger tes outils pour l'instant, réessaie dans un moment.</div>
  if (!data) return <div className="p-8 text-center text-slate-400 text-sm">Chargement…</div>

  const dernier = bilanMails
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="page-title">⭐ Outils avis</h1>
          <p className="text-muted mt-1">Récupère de vrais avis auprès de tes clients et réponds à ceux que tu reçois</p>
        </div>
        <Link to="/aide-commercants" className="btn-secondary text-sm"><BookOpen size={16} /> Guides</Link>
      </div>

      {/* 1. Lien, QR, affiche */}
      <section className="card p-5 space-y-4" aria-labelledby="t-lien">
        <h2 id="t-lien" className="font-semibold text-slate-900 dark:text-slate-100">Ton lien d'avis et ton affiche</h2>
        <form onSubmit={enregistrer} className="grid gap-4 md:grid-cols-[1fr_auto] items-start">
          <div className="space-y-3">
            <label className="block text-sm">
              <span className="text-slate-600 dark:text-slate-300">Nom du commerce (affiché sur l'affiche et dans les emails)</span>
              <input className="input mt-1 w-full" maxLength={60} value={form.nom_commerce}
                onChange={e => setForm(f => ({ ...f, nom_commerce: e.target.value }))} />
            </label>
            <label className="block text-sm">
              <span className="text-slate-600 dark:text-slate-300">Lien d'avis Google</span>
              <input className="input mt-1 w-full" placeholder="https://g.page/r/…/review" value={form.lien_avis}
                onChange={e => setForm(f => ({ ...f, lien_avis: e.target.value }))} />
              <span className="text-xs text-slate-500 dark:text-slate-400 block mt-1">
                Dans Google Business Profile : « Demander des avis » → copier le lien. Un lien Google Maps ou ton Place ID marche aussi.
              </span>
            </label>
            {data.premium ? (
              <label className="block text-sm">
                <span className="text-slate-600 dark:text-slate-300">Petit mot personnel dans tes emails (optionnel)</span>
                <textarea className="input mt-1 w-full" rows={3} maxLength={300} value={form.message_perso}
                  onChange={e => setForm(f => ({ ...f, message_perso: e.target.value }))} />
              </label>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                <Crown size={14} className="text-amber-500" />
                Avec <Link to="/client/premium" className="underline">Premium</Link> : message personnel, couleur de l'affiche, plus d'envois par jour.
              </p>
            )}
            <button className="btn-primary text-sm" disabled={sauvegarde}>{sauvegarde ? 'Enregistrement…' : 'Enregistrer'}</button>
          </div>
          <div className="flex flex-col items-center gap-3 md:w-52">
            {data.qr ? (
              <>
                <img src={data.qr} alt="QR code vers ta page d'avis" width="180" height="180" className="rounded-lg border border-slate-200 bg-white p-1" />
                <div className="flex gap-2">
                  {['a4', 'a5'].map(f => (
                    <button key={f} type="button" className="btn-secondary text-xs" disabled={!!pdfEnCours} onClick={() => telechargerAffiche(f)}>
                      <Download size={14} /> {pdfEnCours === f ? '…' : f.toUpperCase()}
                    </button>
                  ))}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Affiche à imprimer pour ton comptoir</p>
              </>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Enregistre ton lien pour obtenir ton QR code et ton affiche.</p>
            )}
          </div>
        </form>
      </section>

      {/* 2. Demandes par email */}
      <section className="card p-5 space-y-3" aria-labelledby="t-mail">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="t-mail" className="font-semibold text-slate-900 dark:text-slate-100">Demander un avis à tes clients par email</h2>
          <Quota q={data.quotas.email_avis} />
        </div>
        {!configPrete ? (
          <p className="text-sm text-slate-500 dark:text-slate-400">Enregistre d'abord le nom de ton commerce et ton lien d'avis ci-dessus.</p>
        ) : (
          <form onSubmit={envoyerDemandes} className="space-y-3">
            <label className="block text-sm">
              <span className="text-slate-600 dark:text-slate-300">Adresses de tes clients (une par ligne, avec le prénom si tu veux : « Léa lea@mail.fr »)</span>
              <textarea className="input mt-1 w-full font-mono text-xs" rows={5} value={texteMails}
                onChange={e => setTexteMails(e.target.value)} placeholder={'lea@exemple.fr\nKarim karim@exemple.fr'} />
            </label>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {destinataires.length} adresse{destinataires.length > 1 ? 's' : ''} reconnue{destinataires.length > 1 ? 's' : ''} (max {MAX_DEST} par envoi).
              Chaque email contient un lien de désinscription, et on ne conserve pas les adresses, seulement une empreinte pour éviter de relancer la même personne pendant {data.delai_relance_jours} jours.
            </p>
            <label className="flex items-start gap-2 text-sm text-slate-700 dark:text-slate-200">
              <input type="checkbox" className="mt-1" checked={attestation} onChange={e => setAttestation(e.target.checked)} />
              <span>Ce sont des personnes qui ont acheté chez moi ou m'ont contacté, et je peux leur écrire pour leur demander leur avis.</span>
            </label>
            <button className="btn-primary text-sm" disabled={envoiMails || !attestation || destinataires.length === 0 || destinataires.length > MAX_DEST}>
              <Send size={16} /> {envoiMails ? 'Envoi…' : `Envoyer${destinataires.length ? ` (${destinataires.length})` : ''}`}
            </button>
          </form>
        )}
        {dernier && (
          <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 text-sm text-slate-700 dark:text-slate-200 space-y-0.5" role="status">
            <p><strong>{dernier.envoyes}</strong> envoyé{dernier.envoyes > 1 ? 's' : ''}.</p>
            {dernier.ignores.desinscrits > 0 && <p>{dernier.ignores.desinscrits} ignoré(s) : désinscrit(s).</p>}
            {dernier.ignores.deja_contactes > 0 && <p>{dernier.ignores.deja_contactes} ignoré(s) : déjà contacté(s) il y a moins de {data.delai_relance_jours} jours.</p>}
            {dernier.ignores.doublons > 0 && <p>{dernier.ignores.doublons} doublon(s) retiré(s).</p>}
            {dernier.echecs > 0 && <p>{dernier.echecs} échec(s) d'envoi, tu peux réessayer.</p>}
            {dernier.non_envoyes_quota > 0 && <p>{dernier.non_envoyes_quota} non envoyé(s) : limite du jour atteinte.</p>}
          </div>
        )}
      </section>

      {/* 3. Réponses IA */}
      <section className="card p-5 space-y-3" aria-labelledby="t-ia">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 id="t-ia" className="font-semibold text-slate-900 dark:text-slate-100">Répondre à un avis reçu</h2>
          <Quota q={data.quotas.reponse_ia} />
        </div>
        <form onSubmit={genererReponse} className="space-y-3">
          <label className="block text-sm">
            <span className="text-slate-600 dark:text-slate-300">Colle l'avis du client</span>
            <textarea className="input mt-1 w-full" rows={4} minLength={5} maxLength={1500} required value={avis} onChange={e => setAvis(e.target.value)} />
          </label>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-1" role="radiogroup" aria-label="Note de l'avis">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" role="radio" aria-checked={note === n} aria-label={`${n} étoile${n > 1 ? 's' : ''}`}
                  onClick={() => setNote(n)} className="p-0.5">
                  <Star size={22} className={n <= note ? 'text-amber-400 fill-amber-400' : 'text-slate-300 dark:text-slate-600'} />
                </button>
              ))}
            </div>
            <select className="input text-sm" value={ton} onChange={e => setTon(e.target.value)} aria-label="Ton de la réponse">
              {TONS.map(t => <option key={t.v} value={t.v}>{t.l}</option>)}
            </select>
            <button className="btn-primary text-sm" disabled={genEnCours || avis.trim().length < 5}>
              <Sparkles size={16} /> {genEnCours ? 'Rédaction…' : 'Proposer une réponse'}
            </button>
          </div>
        </form>
        {reponse && (
          <div className="space-y-2">
            <textarea className="input w-full" rows={6} value={reponse} onChange={e => setReponse(e.target.value)} aria-label="Réponse proposée" />
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">Brouillon : relis-le et adapte-le avant de le publier sur Google.</p>
              <button type="button" className="btn-secondary text-sm" onClick={copier}><Copy size={16} /> Copier</button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
