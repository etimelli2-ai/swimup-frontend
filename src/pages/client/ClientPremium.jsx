import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { Crown, CheckCircle2, ArrowRight, Percent, Sparkles, Zap, Check, MessageCircle, RotateCcw, CreditCard, Minus, ExternalLink } from 'lucide-react'
import { motion } from 'framer-motion'
import { springSmooth } from '../../lib/motion'
import toast from 'react-hot-toast'
import { PALETTE, ARRONDIS, TAILLES, ICONES, ACCENT_DEFAUT, NOM_ESPACE_MAX, couleurTropClaire } from '../../lib/themePremium'

function Spinner() {
  return <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin inline-block" />
}

// Ton lien PayPal.me (identique à ClientPaiement.jsx)
const PAYPAL_ME = import.meta.env.VITE_PAYPAL_ME || 'https://paypal.me/tonpseudo'

export default function ClientPremium() {
  const navigate = useNavigate()
  const { user, updateUser } = useAuth()
  const [loading, setLoading] = useState(true)
  const [envoi, setEnvoi] = useState(false)
  const [statut, setStatut] = useState(null) // { premium, premium_expire_at, demande_en_attente, montant }
  const [themeEnvoi, setThemeEnvoi] = useState(null) // clé du réglage en cours d'enregistrement
  const [couleurLibre, setCouleurLibre] = useState(user?.theme_color || ACCENT_DEFAUT)
  const [nomEspace, setNomEspace] = useState(user?.theme?.nom_espace || '')
  const [ticketEnvoi, setTicketEnvoi] = useState(false)
  const [ticket, setTicket] = useState({ sujet: '', message: '' })

  const [carteEnvoi, setCarteEnvoi] = useState(null) // 'payer' | 'resilier' | 'reprendre' | 'portail'
  const [params, setParams] = useSearchParams()

  const load = () => api.get('/client/abonnement').then(r => { setStatut(r.data); return r.data }).finally(() => setLoading(false))
  useEffect(() => { load() }, [])

  // Retour de la page de paiement Stripe : c'est le webhook qui active le Premium,
  // ça peut prendre quelques secondes, donc on revérifie un petit moment.
  useEffect(() => {
    const retour = params.get('paiement')
    if (!retour) return
    setParams({}, { replace: true })
    if (retour === 'annule') { toast('Paiement annulé, rien n\'a été débité.'); return }
    let essais = 0
    const id = toast.loading('Paiement reçu, activation en cours…')
    const timer = setInterval(async () => {
      essais++
      const d = await load().catch(() => null)
      if (d?.premium) { toast.success('Premium activé !', { id }); clearInterval(timer) }
      else if (essais >= 8) { toast.dismiss(id); toast('L\'activation prend un peu de temps, recharge la page dans une minute.'); clearInterval(timer) }
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const lancerAction = async (cle, chemin, { confirmation, succes } = {}) => {
    if (confirmation && !confirm(confirmation)) return
    setCarteEnvoi(cle)
    try {
      const r = await api.post(chemin)
      if (r.data?.url) { window.location.href = r.data.url; return }
      if (succes) toast.success(succes)
      await load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Une erreur est survenue, réessaie.')
    }
    setCarteEnvoi(null)
  }

  // Un seul appel pour tous les réglages d'interface : le serveur ne touche
  // qu'aux champs envoyés. La réponse met à jour l'utilisateur, donc le
  // Layout (couleur, forme, taille, nom, icône) change tout de suite.
  const appliquerTheme = async (patch, cle, message = 'Réglage enregistré') => {
    setThemeEnvoi(cle)
    try {
      const r = await api.put('/client/theme', patch)
      updateUser({ theme_color: r.data.theme_color, theme: r.data.theme })
      toast.success(message)
      return r.data
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur')
      return null
    } finally {
      setThemeEnvoi(null)
    }
  }

  const reinitialiserTheme = async () => {
    if (!confirm('Remettre toute la personnalisation par défaut ?')) return
    const r = await appliquerTheme({ reset: true }, 'reset', 'Personnalisation réinitialisée')
    if (r) {
      setNomEspace('')
      setCouleurLibre(ACCENT_DEFAUT)
    }
  }

  const envoyerTicket = async () => {
    if (!ticket.sujet || !ticket.message) return toast.error('Sujet et message requis')
    setTicketEnvoi(true)
    try {
      await api.post('/client/ticket', ticket)
      toast.success('Ticket ouvert sur Discord !')
      setTicket({ sujet: '', message: '' })
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de l\'ouverture du ticket')
    }
    setTicketEnvoi(false)
  }

  const demander = async () => {
    setEnvoi(true)
    try {
      await api.post('/client/abonnement')
      toast.success('Demande envoyée !')
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || 'Erreur lors de la demande')
    }
    setEnvoi(false)
  }

  if (loading) return null

  const montant = statut?.montant || 5
  const lienPaypal = `${PAYPAL_ME}/${montant.toFixed(2)}EUR`

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Crown size={22} className="text-amber-500" />
          Abonnement premium
        </h1>
        <p className="text-muted mt-1">
          {montant.toFixed(2)}€/mois — -10% sur toutes tes commandes et le statut premium
        </p>
      </div>

      {statut?.premium && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springSmooth}
          className="card p-6 text-center space-y-4 bg-gradient-to-br from-amber-50 to-amber-100/50 dark:from-amber-900/20 dark:to-amber-900/10"
        >
          <div className="w-14 h-14 bg-amber-500 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-amber-500/25">
            <Crown size={26} className="text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-900 dark:text-white text-lg">Tu es premium !</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Actif jusqu'au {new Date(String(statut.premium_expire_at).replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR')}
            </p>
          </div>
          <button onClick={() => navigate('/client/payer')} className="btn-primary w-full">
            <ArrowRight size={16} />
            Commander des avis
          </button>
        </motion.div>
      )}

      {statut?.premium && <MonAbonnement statut={statut} occupe={carteEnvoi} lancer={lancerAction} />}

      {statut?.premium && (() => {
        const theme = user?.theme || {}
        const couleurActuelle = (user?.theme_color || ACCENT_DEFAUT).toLowerCase()
        const arrondiActuel = theme.arrondi || 'pilule'
        const tailleActuelle = theme.taille_texte || 'normale'
        const iconeActuelle = theme.icone || 'etoile'
        const occupe = themeEnvoi !== null
        const couleurLibreActive = !PALETTE.some(c => c.hex === couleurActuelle)
        const trop = couleurTropClaire(couleurLibre)

        // Sélecteur segmenté (même grammaire que "Immédiat / Programmer")
        const Segments = ({ options, valeur, onChoisir }) => (
          <div className="flex bg-slate-100 dark:bg-slate-700 rounded-full p-0.5 text-xs w-fit max-w-full">
            {options.map(([val, label]) => (
              <button
                key={val}
                onClick={() => val !== valeur && onChoisir(val)}
                disabled={occupe}
                className={`px-3.5 py-1.5 rounded-full font-medium transition-all disabled:opacity-60 ${
                  valeur === val ? 'bg-white dark:bg-slate-600 text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        )

        const Titre = ({ children }) => (
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">{children}</p>
        )

        return (
          <div className="card p-5 space-y-5">
            <div className="flex items-center justify-between gap-3">
              <h2 className="section-title flex items-center gap-2">
                <Sparkles size={17} className="text-amber-500" />
                Personnaliser ton espace
              </h2>
              <button
                onClick={reinitialiserTheme}
                disabled={occupe}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 disabled:opacity-50"
              >
                <RotateCcw size={12} /> Réinitialiser
              </button>
            </div>

            {/* Couleur : préréglages + couleur libre */}
            <div>
              <Titre>Couleur d'accent</Titre>
              <div className="flex flex-wrap gap-3">
                {PALETTE.map(c => {
                  const actif = couleurActuelle === c.hex
                  return (
                    <button
                      key={c.key}
                      onClick={() => appliquerTheme({ couleur: c.key }, 'couleur', 'Couleur mise à jour')}
                      disabled={occupe}
                      title={c.label}
                      aria-label={c.label}
                      className="w-10 h-10 rounded-full flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50 ring-2 ring-offset-2 dark:ring-offset-slate-800"
                      style={{ backgroundColor: c.hex, '--tw-ring-color': actif ? c.hex : 'transparent' }}
                    >
                      {actif && <Check size={16} className="text-white" />}
                    </button>
                  )
                })}
              </div>
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <input
                    type="color" value={couleurLibre}
                    onChange={e => setCouleurLibre(e.target.value)}
                    className="w-10 h-10 rounded-full border-0 bg-transparent p-0 cursor-pointer"
                    aria-label="Couleur libre"
                  />
                  Couleur libre <span className="font-mono">{couleurLibre}</span>
                  {couleurLibreActive && <span className="badge-blue">active</span>}
                </label>
                <button
                  onClick={() => appliquerTheme({ couleur_hex: couleurLibre }, 'couleur', 'Couleur mise à jour')}
                  disabled={occupe || trop || couleurLibre.toLowerCase() === couleurActuelle}
                  className="btn-secondary py-1.5 px-4 text-xs"
                >
                  Appliquer
                </button>
              </div>
              {trop && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  Cette couleur est trop claire : le texte blanc des boutons ne serait plus lisible.
                </p>
              )}
            </div>

            {/* Forme des boutons et des cartes */}
            <div>
              <Titre>Forme des boutons et des cartes</Titre>
              <Segments
                valeur={arrondiActuel}
                options={Object.entries(ARRONDIS).map(([k, v]) => [k, v.label])}
                onChoisir={v => appliquerTheme({ arrondi: v === 'pilule' ? null : v }, 'arrondi', 'Forme mise à jour')}
              />
            </div>

            {/* Taille du texte */}
            <div>
              <Titre>Taille du texte</Titre>
              <Segments
                valeur={tailleActuelle}
                options={Object.entries(TAILLES).map(([k, v]) => [k, v.label])}
                onChoisir={v => appliquerTheme({ taille_texte: v === 'normale' ? null : v }, 'taille', 'Taille mise à jour')}
              />
            </div>

            {/* Nom affiché dans le menu */}
            <div>
              <Titre>Nom affiché dans le menu</Titre>
              <div className="flex gap-2">
                <input
                  className="input flex-1" placeholder="SwimUp" maxLength={NOM_ESPACE_MAX}
                  value={nomEspace} onChange={e => setNomEspace(e.target.value)}
                />
                <button
                  onClick={() => appliquerTheme({ nom_espace: nomEspace.trim() || null }, 'nom', 'Nom mis à jour')}
                  disabled={occupe || nomEspace.trim() === (theme.nom_espace || '')}
                  className="btn-secondary px-4 text-xs"
                >
                  Enregistrer
                </button>
              </div>
              <p className="text-xs text-slate-400 mt-1">Laisse vide pour garder « SwimUp » ({NOM_ESPACE_MAX} caractères max).</p>
            </div>

            {/* Icône du logo */}
            <div>
              <Titre>Icône du logo</Titre>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ICONES).map(([key, { label, Icon, plein }]) => {
                  const actif = iconeActuelle === key
                  return (
                    <button
                      key={key}
                      onClick={() => !actif && appliquerTheme({ icone: key === 'etoile' ? null : key }, 'icone', 'Icône mise à jour')}
                      disabled={occupe}
                      title={label}
                      aria-label={label}
                      className={`w-10 h-10 rounded-xl flex items-center justify-center transition-transform active:scale-90 disabled:opacity-50 ${
                        actif ? 'text-white' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-300'
                      }`}
                      style={actif ? { backgroundColor: 'var(--accent)' } : undefined}
                    >
                      <Icon size={18} className={actif && plein ? 'fill-white' : ''} />
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {statut?.premium && (
        <div className="card p-5 space-y-4">
          <h2 className="section-title flex items-center gap-2">
            <MessageCircle size={17} className="text-indigo-500" />
            Support prioritaire
          </h2>
          {!user?.discord_id ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Renseigne ton ID Discord dans ton <RouterLink to="/profil" className="text-sky-500 hover:underline">profil</RouterLink> pour pouvoir ouvrir un ticket.
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Sujet</label>
                <input className="input" placeholder="Ex: Question sur ma commande"
                  value={ticket.sujet}
                  onChange={e => setTicket(p => ({ ...p, sujet: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
                <textarea className="input" rows={3} placeholder="Explique ta demande..."
                  value={ticket.message}
                  onChange={e => setTicket(p => ({ ...p, message: e.target.value }))} />
              </div>
              <button onClick={envoyerTicket} disabled={ticketEnvoi} className="btn-primary w-full">
                {ticketEnvoi ? <><Spinner /> Envoi...</> : <><MessageCircle size={16} /> Ouvrir un ticket sur Discord</>}
              </button>
            </>
          )}
        </div>
      )}

      {!statut?.premium && statut?.demande_en_attente && (
        <div className="card p-8 text-center space-y-5">
          <div className="w-16 h-16 bg-sky-50 dark:bg-sky-900/30 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} className="text-sky-500" />
          </div>
          <div>
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">Demande envoyée</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              Règle {montant.toFixed(2)}€ via PayPal, ton abonnement sera activé dès réception du paiement.
            </p>
          </div>
          <a href={lienPaypal} target="_blank" rel="noreferrer" className="btn-primary w-full text-base py-3.5">
            Payer {montant.toFixed(2)}€ avec PayPal
          </a>
        </div>
      )}

      {!statut?.premium && !statut?.demande_en_attente && (
        <>
          <Comparatif lignes={statut?.offres?.comparatif || []} prix={montant} />

          <div className="card p-5 space-y-3">
            <button
              onClick={() => lancerAction('payer', '/client/abonnement/carte')}
              disabled={!!carteEnvoi || !statut?.carte_disponible}
              className="btn-primary w-full text-base py-3.5"
            >
              {carteEnvoi === 'payer' ? <><Spinner /> Redirection…</> : <><CreditCard size={18} /> S'abonner par carte ({montant.toFixed(2)} €/mois)</>}
            </button>
            <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
              Paiement sécurisé par Stripe, activation automatique. Tu peux résilier quand tu veux, l'abonnement va alors jusqu'à la fin du mois payé.
            </p>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" /> ou <span className="flex-1 h-px bg-slate-200 dark:bg-slate-700" />
            </div>
            <button onClick={demander} disabled={envoi} className="btn-secondary w-full">
              {envoi ? <><Spinner /> Envoi…</> : <>Payer par PayPal (30 jours, validé à la main)</>}
            </button>
            <p className="text-xs text-slate-400 text-center">
              Avec PayPal tu règles {montant.toFixed(2)} € et l'admin active ton Premium dès qu'il voit le paiement. Pas de renouvellement automatique.
            </p>
          </div>
        </>
      )}
    </div>
  )
}


function formaterValeur(v) {
  if (v === true) return <Check size={16} className="text-emerald-500 mx-auto" aria-label="Inclus" />
  if (v === false) return <Minus size={16} className="text-slate-300 dark:text-slate-600 mx-auto" aria-label="Non inclus" />
  return <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{v}</span>
}

function Comparatif({ lignes, prix }) {
  if (!lignes.length) return null
  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[1fr_4rem_5rem] sm:grid-cols-[1fr_8rem_9rem] items-end px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700">
        <span />
        <span className="text-center text-sm font-semibold text-slate-600 dark:text-slate-300">Gratuit</span>
        <span className="text-center text-sm font-semibold text-amber-600 dark:text-amber-400">Premium<br /><span className="text-xs font-normal text-slate-400">{prix.toFixed(2)} €/mois</span></span>
      </div>
      <ul>
        {lignes.map(l => (
          <li key={l.cle} className="grid grid-cols-[1fr_4rem_5rem] sm:grid-cols-[1fr_8rem_9rem] items-center px-4 py-2.5 gap-2 border-b last:border-b-0 border-slate-50 dark:border-slate-700/50">
            <span className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug">{l.libelle}</span>
            <span className="text-center">{formaterValeur(l.gratuit)}</span>
            <span className="text-center bg-amber-50/60 dark:bg-amber-900/10 -my-2.5 py-2.5">{formaterValeur(l.premium)}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const SOURCES = { stripe: 'Carte bancaire', paypal: 'PayPal', admin: 'Offert par SwimUp' }

function MonAbonnement({ statut, occupe, lancer }) {
  const fin = statut.premium_expire_at ? new Date(String(statut.premium_expire_at).replace(' ', 'T') + 'Z') : null
  const carte = statut.carte
  const parCarte = statut.premium_source === 'stripe' && carte && carte.statut !== 'termine'
  const dateTxt = fin ? fin.toLocaleDateString('fr-FR') : '—'
  return (
    <div className="card p-5 space-y-4">
      <h2 className="section-title">Mon abonnement</h2>
      <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        <dt className="text-slate-400">Paiement</dt>
        <dd className="text-slate-700 dark:text-slate-200">{SOURCES[statut.premium_source] || 'Premium actif'}</dd>
        <dt className="text-slate-400">{parCarte && !carte.resiliation_prevue ? 'Prochain renouvellement' : 'Actif jusqu\'au'}</dt>
        <dd className="text-slate-700 dark:text-slate-200">{dateTxt}</dd>
      </dl>

      {parCarte && carte.statut === 'impaye' && (
        <p className="text-sm rounded-xl p-3 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          Le dernier prélèvement a été refusé. Mets ta carte à jour pour garder Premium après le {dateTxt}.
        </p>
      )}
      {parCarte && carte.resiliation_prevue && (
        <p className="text-sm rounded-xl p-3 bg-slate-50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
          Abonnement résilié : Premium reste actif jusqu'au {dateTxt}, puis s'arrête sans autre prélèvement.
        </p>
      )}

      {parCarte && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => lancer('portail', '/client/abonnement/portail')} disabled={!!occupe} className="btn-secondary text-xs px-4 py-2">
            <ExternalLink size={14} /> {occupe === 'portail' ? 'Ouverture…' : 'Carte et factures'}
          </button>
          {carte.resiliation_prevue ? (
            <button onClick={() => lancer('reprendre', '/client/abonnement/reprendre', { succes: 'Abonnement repris, il se renouvellera normalement.' })} disabled={!!occupe} className="btn-primary text-xs px-4 py-2">
              Reprendre l'abonnement
            </button>
          ) : (
            <button
              onClick={() => lancer('resilier', '/client/abonnement/resilier', {
                confirmation: `Résilier ? Premium reste actif jusqu'au ${dateTxt}, puis s'arrête.`,
                succes: 'Résiliation enregistrée.',
              })}
              disabled={!!occupe}
              className="text-xs px-4 py-2 rounded-full border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors"
            >
              Résilier
            </button>
          )}
        </div>
      )}

      {statut.paiements?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">Paiements</p>
          <ul className="text-[13px] divide-y divide-slate-100 dark:divide-slate-700">
            {statut.paiements.map((p, i) => (
              <li key={i} className="flex justify-between py-1.5 text-slate-600 dark:text-slate-300">
                <span>{new Date(String(p.created_at).replace(' ', 'T') + 'Z').toLocaleDateString('fr-FR')} · {SOURCES[p.source] || p.source}</span>
                <span>{Number(p.montant) > 0 ? `${Number(p.montant).toFixed(2)} €` : 'Offert'}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
