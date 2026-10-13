import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import api from '../../lib/api'
import usePageTitle from '../../hooks/usePageTitle'
import toast from 'react-hot-toast'
import { Download, Trash2, ImageDown, History, Send, Sparkles, Copy, Star, BookOpen, Crown, Check, Circle, QrCode, MousePointerClick, Mail, RefreshCw, AlertTriangle, SlidersHorizontal, Link2 } from 'lucide-react'

const MAX_DEST = 20
const NOMS_SUPPORT = { affiche: 'Affiche', cartes: 'Cartes de visite', qr_png: 'QR code PNG' }
const TONS = [
  { v: 'professionnel', l: 'Professionnel' },
  { v: 'chaleureux', l: 'Chaleureux' },
  { v: 'concis', l: 'Concis' },
  { v: 'premium', l: 'Soigné (haut de gamme)' },
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

const LONGUEURS = [
  { v: 'court', l: 'Courte (2 phrases)' },
  { v: 'moyen', l: 'Moyenne' },
  { v: 'long', l: 'Détaillée' },
]
const LANGUES = [
  { v: 'fr', l: 'Français' },
  { v: 'auto', l: "Même langue que l'avis" },
  { v: 'en', l: 'Anglais' },
  { v: 'es', l: 'Espagnol' },
  { v: 'de', l: 'Allemand' },
  { v: 'it', l: 'Italien' },
]

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
  const [sensible, setSensible] = useState(null)
  const [historique, setHistorique] = useState([])

  const [periode, setPeriode] = useState('7')
  const [prefs, setPrefs] = useState({ secteur: '', longueur: 'moyen', langue: 'fr', infos: '', eviter: '' })
  const [prefsEnCours, setPrefsEnCours] = useState(false)

  const charger = () => api.get('/client/commercant').then(r => {
    setData(r.data)
    setForm({
      lien_avis: r.data.config.lien_avis || '',
      nom_commerce: r.data.config.nom_commerce || r.data.nom_societe || '',
      message_perso: r.data.config.message_perso || '',
    })
    setPrefs(p => ({ ...p, ...r.data.ia_preferences }))
  }).catch(() => setErreur(true))
  const chargerHistorique = () => api.get('/client/commercant/reponses-historique').then(r => setHistorique(r.data)).catch(() => {})
  useEffect(() => { charger(); chargerHistorique() }, [])

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

  async function telecharger(cle, chemin, params, nomFichier, mime) {
    setPdfEnCours(cle)
    try {
      const r = await api.get(chemin, { params, responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([r.data], { type: mime }))
      const a = document.createElement('a')
      a.href = url
      a.download = nomFichier
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(url)
      charger()
    } catch {
      toast.error('Impossible de générer ce fichier, vérifie que ton lien est bien enregistré.')
    } finally {
      setPdfEnCours(null)
    }
  }
  const telechargerAffiche = (format) => telecharger(format, '/client/commercant/affiche', { format }, `affiche-avis-${format}.pdf`, 'application/pdf')
  const telechargerCartes = () => telecharger('cartes', '/client/commercant/cartes', {}, 'cartes-avis.pdf', 'application/pdf')
  const telechargerQr = () => telecharger('qr', '/client/commercant/qr.png', {}, 'qr-avis.png', 'image/png')

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

  async function copierLien() {
    try {
      await navigator.clipboard.writeText(data.lien_partage)
      toast.success('Lien copié')
    } catch {
      toast.error('Copie impossible, sélectionne le lien à la main.')
    }
  }

  async function enregistrerPrefs(e) {
    e.preventDefault()
    setPrefsEnCours(true)
    try {
      const r = await api.put('/client/commercant/ia-preferences', prefs)
      setPrefs(r.data.ia_preferences)
      toast.success("Préférences enregistrées")
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setPrefsEnCours(false)
    }
  }

  async function genererReponse(e, autre = false) {
    e?.preventDefault?.()
    setGenEnCours(true)
    try {
      const r = await api.post('/client/commercant/reponse-avis', { avis, note, ton, ...(autre ? { autre: true } : {}) })
      setReponse(r.data.texte)
      setSensible(r.data.sensible ? r.data.raison : null)
      charger()
      chargerHistorique()
    } catch (err) {
      toast.error(err.response?.data?.error || 'Erreur')
    } finally {
      setGenEnCours(false)
    }
  }

  async function copierTexte(t) {
    try { await navigator.clipboard.writeText(t); toast.success('Copié') } catch { toast.error('Copie impossible, sélectionne le texte à la main.') }
  }
  async function supprimerHistorique(id) {
    try { await api.delete(`/client/commercant/reponses-historique/${id}`); setHistorique(h => h.filter(x => x.id !== id)) } catch { toast.error('Suppression impossible, réessaie.') }
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
        <Link to="/client/aide" className="btn-secondary text-sm"><BookOpen size={16} /> Guides</Link>
      </div>

      {/* Démarrage : étapes cochées seulement quand elles sont réellement faites */}
      {(() => {
        const requises = data.etapes.filter(x => !x.optionnelle)
        const faites = requises.filter(x => x.fait).length
        if (faites === requises.length) return null
        return (
          <section className="card p-5" aria-labelledby="t-demarrage">
            <div className="flex items-center justify-between gap-3">
              <h2 id="t-demarrage" className="font-semibold text-slate-900 dark:text-slate-100">Pour bien démarrer</h2>
              <span className="text-sm text-slate-500 dark:text-slate-400 tabular-nums">{faites}/{requises.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-slate-100 dark:bg-slate-700 mt-3 overflow-hidden" role="progressbar" aria-valuemin={0} aria-valuemax={requises.length} aria-valuenow={faites} aria-label="Étapes de démarrage terminées">
              <div className="h-full bg-brand-500 transition-all" style={{ width: `${(faites / requises.length) * 100}%` }} />
            </div>
            <ul className="mt-3 space-y-1.5">
              {data.etapes.map(x => (
                <li key={x.cle} className="flex items-center gap-2 text-sm">
                  {x.fait
                    ? <Check size={16} className="text-emerald-600 shrink-0" aria-label="Fait" />
                    : <Circle size={16} className="text-slate-300 dark:text-slate-600 shrink-0" aria-label="À faire" />}
                  {x.fait ? (
                    <span className="text-slate-500 dark:text-slate-400">{x.titre}</span>
                  ) : x.lien ? (
                    <Link to={x.lien} className="text-slate-800 dark:text-slate-100 underline decoration-slate-300 hover:decoration-slate-500">{x.titre}{x.optionnelle ? ' (facultatif)' : ''}</Link>
                  ) : (
                    <a href={`#${x.ancre}`} className="text-slate-800 dark:text-slate-100 underline decoration-slate-300 hover:decoration-slate-500">{x.titre}</a>
                  )}
                </li>
              ))}
            </ul>
          </section>
        )
      })()}

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
            {data.lien_partage && (
              <div className="rounded-lg bg-slate-50 dark:bg-slate-800/60 p-3 space-y-2">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-100 flex items-center gap-1.5"><Link2 size={15} /> Lien à partager</p>
                <div className="flex gap-2">
                  <input readOnly className="input flex-1 min-w-0 text-xs font-mono" value={data.lien_partage} aria-label="Lien à partager" onFocus={e => e.target.select()} />
                  <button type="button" className="btn-secondary text-sm shrink-0" onClick={copierLien}><Copy size={15} /> Copier</button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Ce lien mène à ta page d'avis Google. Il compte les passages dans « Résultats » plus bas, et il reste valable si tu changes ton lien Google : ton affiche imprimée ne sera jamais à refaire.
                </p>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-3 md:w-52">
            {data.qr ? (
              <>
                <img src={data.qr} alt="QR code vers ta page d'avis" width="180" height="180" className="rounded-lg border border-slate-200 p-1" style={{ backgroundColor: '#ffffff' }} />
                <div className="flex gap-2">
                  {['a4', 'a5'].map(f => (
                    <button key={f} type="button" className="btn-secondary text-xs" disabled={!!pdfEnCours} onClick={() => telechargerAffiche(f)}>
                      <Download size={14} /> {pdfEnCours === f ? '…' : f.toUpperCase()}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  {data.premium ? (
                    <button type="button" className="btn-secondary text-xs" disabled={!!pdfEnCours} onClick={telechargerCartes}>
                      <Download size={14} /> {pdfEnCours === 'cartes' ? '…' : 'Cartes'}
                    </button>
                  ) : (
                    <Link to="/client/premium" className="btn-secondary text-xs" title="Débloquer avec Premium">
                      <Crown size={14} className="text-amber-500" /> Cartes : débloquer
                    </Link>
                  )}
                  <button type="button" className="btn-secondary text-xs" disabled={!!pdfEnCours} onClick={telechargerQr}>
                    <ImageDown size={14} /> {pdfEnCours === 'qr' ? '…' : 'QR PNG'}
                  </button>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Affiche pour ton comptoir, QR code seul pour un autocollant ou un menu{data.premium ? ', planche de 10 cartes 85 × 55 mm' : ' (cartes de visite : à débloquer avec Premium)'}.</p>
              </>
            ) : (
              <p className="text-xs text-slate-500 dark:text-slate-400 text-center">Enregistre ton lien pour obtenir ton QR code et ton affiche.</p>
            )}
          </div>
        </form>
        {data.supports?.length > 0 && (
          <details className="mt-4 text-sm">
            <summary className="cursor-pointer text-slate-600 dark:text-slate-300 flex items-center gap-1.5 list-none"><History size={15} /> Supports déjà générés ({data.supports.length})</summary>
            <ul className="mt-2 space-y-1 text-slate-600 dark:text-slate-300">
              {data.supports.map(x => (
                <li key={x.id}>{NOMS_SUPPORT[x.type] || x.type}{x.format ? ` (${x.format.toUpperCase()})` : ''} · {new Date(String(x.created_at).replace(' ', 'T') + 'Z').toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' })}</li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ton QR code reste le même à chaque fois : un support imprimé il y a longtemps fonctionne toujours.</p>
          </details>
        )}
      </section>

      {/* Résultats : passages comptés, jamais présentés comme des avis */}
      {data.lien_partage && (
        <section className="card p-5 space-y-3" aria-labelledby="t-suivi">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 id="t-suivi" className="font-semibold text-slate-900 dark:text-slate-100">Résultats</h2>
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-700 p-0.5" role="group" aria-label="Période">
              {[['7', '7 jours'], ['30', '30 jours']].map(([v, l]) => (
                <button key={v} type="button" aria-pressed={periode === v} onClick={() => setPeriode(v)}
                  className={`px-3 py-1 text-xs rounded-md ${periode === v ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900' : 'text-slate-600 dark:text-slate-300'}`}>{l}</button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { cle: 'qr', label: 'Scans du QR code', icone: QrCode, val: data.suivi.qr },
              { cle: 'lien', label: 'Clics sur ton lien', icone: MousePointerClick, val: data.suivi.lien },
              { cle: 'email', label: 'Clics depuis tes emails', icone: Mail, val: data.suivi.email },
              { cle: 'envoyes', label: 'Emails envoyés', icone: Send, val: data.suivi.emails_envoyes },
            ].map(({ cle, label, icone: Icone, val }) => (
              <div key={cle} className="rounded-xl bg-slate-50 dark:bg-slate-800/60 p-3">
                <Icone size={16} className="text-slate-400" aria-hidden="true" />
                <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 tabular-nums mt-1">{val[periode === '7' ? 'j7' : 'j30']}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Un scan ou un clic veut dire que quelqu'un a ouvert ta page d'avis, pas qu'un avis a été publié. Aucune donnée personnelle n'est enregistrée, et les robots sont écartés.
            Pour suivre ta note et ton nombre d'avis Google, va dans <Link to="/client/stats" className="underline">Statistiques</Link>. Les comptages démarrent à l'enregistrement de ton lien : une ancienne affiche (QR direct vers Google) n'est pas comptée.
          </p>
        </section>
      )}

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
        <details className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm">
          <summary className="cursor-pointer font-medium text-slate-800 dark:text-slate-100 flex items-center gap-1.5 list-none">
            <SlidersHorizontal size={15} /> Personnaliser l'assistant pour ton commerce
          </summary>
          <form onSubmit={enregistrerPrefs} className="mt-3 grid gap-3 md:grid-cols-2">
            <label className="block">
              <span className="text-slate-600 dark:text-slate-300">Activité</span>
              <input className="input mt-1 w-full" maxLength={60} placeholder="ex : restaurant, garage, coiffeur" value={prefs.secteur}
                onChange={e => setPrefs(p => ({ ...p, secteur: e.target.value }))} />
            </label>
            <label className="block">
              <span className="text-slate-600 dark:text-slate-300">Langue de la réponse</span>
              <select className="input mt-1 w-full" value={prefs.langue} onChange={e => setPrefs(p => ({ ...p, langue: e.target.value }))}>
                {LANGUES.map(l => <option key={l.v} value={l.v}>{l.l}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-slate-600 dark:text-slate-300">Longueur</span>
              <select className="input mt-1 w-full" value={prefs.longueur} onChange={e => setPrefs(p => ({ ...p, longueur: e.target.value }))}>
                {LONGUEURS.map(l => <option key={l.v} value={l.v}>{l.l}</option>)}
              </select>
            </label>
            <label className="block">
              <span className="text-slate-600 dark:text-slate-300">Mots ou formulations à éviter</span>
              <input className="input mt-1 w-full" maxLength={200} placeholder="ex : navré, cordialement" value={prefs.eviter}
                onChange={e => setPrefs(p => ({ ...p, eviter: e.target.value }))} />
            </label>
            <label className="block md:col-span-2">
              <span className="text-slate-600 dark:text-slate-300">Infos utiles sur ton commerce (l'assistant ne s'en sert que si c'est pertinent)</span>
              <textarea className="input mt-1 w-full" rows={2} maxLength={300} placeholder="ex : fermé le lundi, terrasse ouverte l'été, réservation au 01 23 45 67 89" value={prefs.infos}
                onChange={e => setPrefs(p => ({ ...p, infos: e.target.value }))} />
            </label>
            <div className="md:col-span-2">
              <button className="btn-secondary text-sm" disabled={prefsEnCours}>{prefsEnCours ? 'Enregistrement…' : 'Enregistrer mes préférences'}</button>
            </div>
          </form>
        </details>
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
            {sensible && (
              <div className="flex items-start gap-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-900 dark:text-amber-200 p-3 text-sm" role="alert">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                <p>{sensible} Ce brouillon n'est qu'un point de départ : relis-le, ne promets rien que tu ne peux pas tenir, et pense à proposer d'échanger en privé.</p>
              </div>
            )}
            <textarea className="input w-full" rows={6} value={reponse} onChange={e => setReponse(e.target.value)} aria-label="Réponse proposée" />
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">Brouillon : relis-le et adapte-le avant de le publier sur Google.</p>
              <div className="flex gap-2">
                <button type="button" className="btn-secondary text-sm" disabled={genEnCours} onClick={() => genererReponse(null, true)}><RefreshCw size={16} /> {genEnCours ? '…' : 'Autre version'}</button>
                <button type="button" className="btn-secondary text-sm" onClick={copier}><Copy size={16} /> Copier</button>
              </div>
            </div>
          </div>
        )}
        {historique.length > 0 && (
          <details className="rounded-lg border border-slate-200 dark:border-slate-700 p-3 text-sm">
            <summary className="cursor-pointer font-medium text-slate-800 dark:text-slate-100 flex items-center gap-1.5 list-none">
              <History size={15} /> Réponses déjà proposées ({historique.length})
            </summary>
            <ul className="mt-3 space-y-3">
              {historique.map(h => (
                <li key={h.id} className="space-y-1">
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {h.note ? `${h.note}★ · ` : ''}{new Date(String(h.created_at).replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR')}{h.extrait ? ` · « ${h.extrait}${h.extrait.length >= 160 ? '…' : ''} »` : ''}
                  </p>
                  <p className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">{h.reponse}</p>
                  <div className="flex gap-2">
                    <button type="button" className="btn-secondary text-xs" onClick={() => copierTexte(h.reponse)}><Copy size={14} /> Copier</button>
                    <button type="button" className="btn-secondary text-xs" onClick={() => supprimerHistorique(h.id)} aria-label="Supprimer cette réponse de l'historique"><Trash2 size={14} /> Supprimer</button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">Gardées 90 jours, 50 au maximum. Seul un court extrait de l'avis est conservé, pas l'avis en entier.</p>
          </details>
        )}
      </section>
    </div>
  )
}
