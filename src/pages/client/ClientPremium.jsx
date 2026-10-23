import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams, Link as RouterLink } from 'react-router-dom'
import api from '../../lib/api'
import { useAuth } from '../../hooks/useAuth'
import { Crown, CheckCircle2, ArrowRight, Sparkles, Check, MessageCircle, RotateCcw, CreditCard, Minus, ExternalLink, Building2, ChevronDown } from 'lucide-react'
import { motion } from 'framer-motion'
import { springSmooth } from '../../lib/motion'
import toast from 'react-hot-toast'
import { lireOffreSouhaitee, oublierOffreSouhaitee } from '../../lib/offreSouhaitee'
import { PALETTE, ARRONDIS, TAILLES, ICONES, ACCENT_DEFAUT, NOM_ESPACE_MAX, couleurTropClaire } from '../../lib/themePremium'
import { InfoAvantPaiement } from '../../components/PageLegale'
import { t, locale, sepDecimal, euros } from '../../lib/i18n'

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
    if (retour === 'annule') { toast(t('Paiement annulé, rien n\'a été débité.')); return }
    let essais = 0
    const id = toast.loading(t('Paiement reçu, activation en cours…'))
    const timer = setInterval(async () => {
      essais++
      const d = await load().catch(() => null)
      if (d?.premium) { toast.success(t('Premium activé !'), { id }); clearInterval(timer) }
      else if (essais >= 8) { toast.dismiss(id); toast(t('L\'activation prend un peu de temps, recharge la page dans une minute.')); clearInterval(timer) }
    }, 2500)
    return () => clearInterval(timer)
  }, [])

  const lancerAction = async (cle, chemin, { confirmation, succes, corps } = {}) => {
    if (confirmation && !confirm(confirmation)) return
    setCarteEnvoi(cle)
    try {
      const r = await api.post(chemin, corps)
      if (r.data?.url) { window.location.href = r.data.url; return }
      if (succes) toast.success(succes)
      await load()
    } catch (e) {
      toast.error(e.response?.data?.error || t('Une erreur est survenue, réessaie.'))
    }
    setCarteEnvoi(null)
  }

  // Un seul appel pour tous les réglages d'interface : le serveur ne touche
  // qu'aux champs envoyés. La réponse met à jour l'utilisateur, donc le
  // Layout (couleur, forme, taille, nom, icône) change tout de suite.
  const appliquerTheme = async (patch, cle, message = t('Réglage enregistré')) => {
    setThemeEnvoi(cle)
    try {
      const r = await api.put('/client/theme', patch)
      updateUser({ theme_color: r.data.theme_color, theme: r.data.theme })
      toast.success(message)
      return r.data
    } catch (e) {
      toast.error(e.response?.data?.error || t('Erreur'))
      return null
    } finally {
      setThemeEnvoi(null)
    }
  }

  const reinitialiserTheme = async () => {
    if (!confirm(t('Remettre toute la personnalisation par défaut ?'))) return
    const r = await appliquerTheme({ reset: true }, 'reset', t('Personnalisation réinitialisée'))
    if (r) {
      setNomEspace('')
      setCouleurLibre(ACCENT_DEFAUT)
    }
  }

  const envoyerTicket = async () => {
    if (!ticket.sujet || !ticket.message) return toast.error(t('Sujet et message requis'))
    setTicketEnvoi(true)
    try {
      await api.post('/client/ticket', ticket)
      toast.success(t('Ticket ouvert sur Discord !'))
      setTicket({ sujet: '', message: '' })
    } catch (e) {
      toast.error(e.response?.data?.error || t('Erreur lors de l\'ouverture du ticket'))
    }
    setTicketEnvoi(false)
  }

  const demander = async (offre) => {
    setEnvoi(true)
    try {
      await api.post('/client/abonnement', { offre })
      toast.success(t('Demande envoyée !'))
      load()
    } catch (e) {
      toast.error(e.response?.data?.error || t('Erreur lors de la demande'))
    }
    setEnvoi(false)
  }

  if (loading) return null

  const prixOffre = (o) => statut?.offres?.[o]?.prix ?? (o === 'agence' ? 49.9 : o === 'business' ? 24.9 : 9.9)
  const offreActuelle = statut?.offre || 'gratuit'
  const offreEnAttente = ['business', 'agence'].includes(statut?.demande_en_attente?.offre) ? statut.demande_en_attente.offre : 'premium'
  const montant = statut?.demande_en_attente ? prixOffre(offreEnAttente) : prixOffre('premium')
  const lienPaypal = `${PAYPAL_ME}/${montant.toFixed(2)}EUR`
  const nomOffre = { gratuit: t('Gratuit'), premium: t('Premium'), business: t('Business'), agence: t('Agence') }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="page-title flex items-center gap-2">
          <Crown size={22} className="text-amber-500" />
          {statut?.premium ? t('Mon abonnement') : t('Choisis ton offre')}
        </h1>
        <p className="text-muted mt-1">
          {statut?.premium
            ? t('Offre {nomOffre}', { nomOffre: nomOffre[offreActuelle] })
            : t('Sans engagement : tu résilies quand tu veux, directement ici.')}
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
            <p className="font-semibold text-slate-900 dark:text-white text-lg">{t('Tu es en {nomOffre} !', { nomOffre: nomOffre[offreActuelle] })}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              {t('Actif jusqu\'au {date}', { date: new Date(String(statut.premium_expire_at).replace(' ', 'T') + 'Z').toLocaleDateString(locale()) })}
            </p>
          </div>
          <button onClick={() => navigate('/client/payer')} className="btn-primary w-full">
            <ArrowRight size={16} />
            {t('Commander des avis')}
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
                {t(label)}
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
                {t('Personnaliser ton espace')}
              </h2>
              <button
                onClick={reinitialiserTheme}
                disabled={occupe}
                className="text-xs text-slate-500 dark:text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 flex items-center gap-1 disabled:opacity-50"
              >
                <RotateCcw size={12} />{' '}{t('Réinitialiser')}
              </button>
            </div>

            {/* Couleur : préréglages + couleur libre */}
            <div>
              <Titre>{t('Couleur d\'accent')}</Titre>
              <div className="flex flex-wrap gap-3">
                {PALETTE.map(c => {
                  const actif = couleurActuelle === c.hex
                  return (
                    <button
                      key={c.key}
                      onClick={() => appliquerTheme({ couleur: c.key }, 'couleur', t('Couleur mise à jour'))}
                      disabled={occupe}
                      title={t(c.label)}
                      aria-label={t(c.label)}
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
                    aria-label={t('Couleur libre')}
                  />
                  {t('Couleur libre')}{' '}<span className="font-mono">{couleurLibre}</span>
                  {couleurLibreActive && <span className="badge-blue">{t('active')}</span>}
                </label>
                <button
                  onClick={() => appliquerTheme({ couleur_hex: couleurLibre }, 'couleur', t('Couleur mise à jour'))}
                  disabled={occupe || trop || couleurLibre.toLowerCase() === couleurActuelle}
                  className="btn-secondary py-1.5 px-4 text-xs"
                >
                  {t('Appliquer')}
                </button>
              </div>
              {trop && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                  {t('Cette couleur est trop claire : le texte blanc des boutons ne serait plus lisible.')}
                </p>
              )}
            </div>

            {/* Forme des boutons et des cartes */}
            <div>
              <Titre>{t('Forme des boutons et des cartes')}</Titre>
              <Segments
                valeur={arrondiActuel}
                options={Object.entries(ARRONDIS).map(([k, v]) => [k, v.label])}
                onChoisir={v => appliquerTheme({ arrondi: v === 'pilule' ? null : v }, 'arrondi', t('Forme mise à jour'))}
              />
            </div>

            {/* Taille du texte */}
            <div>
              <Titre>{t('Taille du texte')}</Titre>
              <Segments
                valeur={tailleActuelle}
                options={Object.entries(TAILLES).map(([k, v]) => [k, v.label])}
                onChoisir={v => appliquerTheme({ taille_texte: v === 'normale' ? null : v }, 'taille', t('Taille mise à jour'))}
              />
            </div>

            {/* Nom affiché dans le menu */}
            <div>
              <Titre>{t('Nom affiché dans le menu')}</Titre>
              <div className="flex gap-2">
                <input
                  className="input flex-1" placeholder="SwimUp" maxLength={NOM_ESPACE_MAX}
                  value={nomEspace} onChange={e => setNomEspace(e.target.value)}
                />
                <button
                  onClick={() => appliquerTheme({ nom_espace: nomEspace.trim() || null }, 'nom', t('Nom mis à jour'))}
                  disabled={occupe || nomEspace.trim() === (theme.nom_espace || '')}
                  className="btn-secondary px-4 text-xs"
                >
                  {t('Enregistrer')}
                </button>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t('Laisse vide pour garder « SwimUp » ({NOM_ESPACE_MAX} caractères max).', { NOM_ESPACE_MAX })}</p>
            </div>

            {/* Icône du logo */}
            <div>
              <Titre>{t('Icône du logo')}</Titre>
              <div className="flex flex-wrap gap-2">
                {Object.entries(ICONES).map(([key, { label, Icon, plein }]) => {
                  const actif = iconeActuelle === key
                  return (
                    <button
                      key={key}
                      onClick={() => !actif && appliquerTheme({ icone: key === 'etoile' ? null : key }, 'icone', t('Icône mise à jour'))}
                      disabled={occupe}
                      title={t(label)}
                      aria-label={t(label)}
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
            {t('Support prioritaire')}
          </h2>
          {!user?.discord_id ? (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {t('Renseigne ton ID Discord dans ton')}{' '}<RouterLink to="/profil" className="text-sky-500 hover:underline">{t('profil')}</RouterLink>{' '}{t('pour pouvoir ouvrir un ticket.')}
            </p>
          ) : (
            <>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Sujet')}</label>
                <input className="input" placeholder={t('Ex: Question sur ma commande')}
                  value={ticket.sujet}
                  onChange={e => setTicket(p => ({ ...p, sujet: e.target.value }))} />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Message')}</label>
                <textarea className="input" rows={3} placeholder={t('Explique ta demande...')}
                  value={ticket.message}
                  onChange={e => setTicket(p => ({ ...p, message: e.target.value }))} />
              </div>
              <button onClick={envoyerTicket} disabled={ticketEnvoi} className="btn-primary w-full">
                {ticketEnvoi ? <><Spinner />{' '}{t('Envoi...')}</> : <><MessageCircle size={16} />{' '}{t('Ouvrir un ticket sur Discord')}</>}
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
            <h2 className="text-[18px] font-semibold text-slate-900 dark:text-white">{t('Demande envoyée')}</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
              {t('Règle {montant}€ via PayPal, ton abonnement sera activé dès réception du paiement.', { montant: montant.toFixed(2) })}
            </p>
          </div>
          <a href={lienPaypal} target="_blank" rel="noreferrer" className="btn-primary w-full text-base py-3.5">
            {t('Payer {montant}€ avec PayPal', { montant: montant.toFixed(2) })}
          </a>
        </div>
      )}

      {!statut?.premium && !statut?.demande_en_attente && (
        <ChoixOffre statut={statut} prixOffre={prixOffre} occupe={carteEnvoi} envoiPaypal={envoi}
          payer={(offre) => lancerAction('payer', '/client/abonnement/carte', { corps: { offre } })}
          paypal={demander} />
      )}

      {statut?.premium && offreActuelle === 'premium' && (
        <PasserNiveau niveau="business" statut={statut} prix={prixOffre('business')} occupe={carteEnvoi} envoiPaypal={envoi}
          titre={t('Plusieurs établissements ou une équipe ?')}
          texte={t('Business, c\'est le double de volume, le relevé automatique, le rapport mensuel, les campagnes planifiées, l\'accès d\'équipe et la comparaison entre établissements.')}
          changer={() => lancerAction('changer', '/client/abonnement/changer', {
            corps: { offre: 'business' },
            confirmation: t('Passer à Business à {prixOffre} € par mois ? Stripe ne te fait payer que la différence pour le reste du mois en cours.', { prixOffre: prixOffre('business').toFixed(2).replace('.', sepDecimal()) }),
            succes: t('Tu es en Business !'),
          })}
          paypal={() => demander('business')} />
      )}

      {statut?.premium && ['premium', 'business'].includes(offreActuelle) && statut?.offres?.agence && (
        <PasserNiveau niveau="agence" statut={statut} prix={prixOffre('agence')} occupe={carteEnvoi} envoiPaypal={envoi}
          titre={t('Tu gères les fiches de plusieurs clients ?')}
          texte={t('Agence, c\'est tout Business avec {etablissements} entreprises et jusqu\'à {equipe} personnes dans ton équipe.', { etablissements: valeurDe(statut.offres.comparatif || [], 'etablissements', 'agence'), equipe: valeurDe(statut.offres.comparatif || [], 'equipe', 'agence') })}
          changer={() => lancerAction('changer', '/client/abonnement/changer', {
            corps: { offre: 'agence' },
            confirmation: t('Passer à Agence à {prixOffre} € par mois ? Stripe ne te fait payer que la différence pour le reste du mois en cours.', { prixOffre: prixOffre('agence').toFixed(2).replace('.', sepDecimal()) }),
            succes: t('Tu es en Agence !'),
          })}
          paypal={() => demander('agence')} />
      )}
    </div>
  )
}


function formaterValeur(v) {
  if (v === true) return <Check size={16} className="text-emerald-500 mx-auto" aria-label={t('Inclus')} />
  if (v === false) return <Minus size={16} className="text-slate-300 dark:text-slate-600 mx-auto" aria-label={t('Non inclus')} />
  return <span className="text-[13px] font-medium text-slate-700 dark:text-slate-200">{typeof v === 'string' ? t(v) : v}</span>
}

const eur = (n) => euros(n)

// Colonnes du tableau : Gratuit | Premium | Business | Agence (Agence seulement si le serveur la propose).
function Comparatif({ lignes, prix }) {
  if (!lignes.length) return null
  const agence = prix.agence != null
  const grille = agence ? 'grid-cols-[1fr_3rem_3.75rem_3.75rem_3.75rem] sm:grid-cols-[1fr_5rem_5.5rem_5.5rem_5.5rem]' : 'grid-cols-[1fr_3.5rem_4.5rem_4.5rem] sm:grid-cols-[1fr_6rem_7rem_7rem]'
  return (
    <div className="card overflow-hidden">
      <div className={`grid ${grille} items-end px-4 pt-4 pb-3 border-b border-slate-100 dark:border-slate-700`}>
        <span />
        <span className="text-center text-xs sm:text-sm font-semibold text-slate-600 dark:text-slate-300">{t('Gratuit')}</span>
        <span className="text-center text-xs sm:text-sm font-semibold text-amber-600 dark:text-amber-400">{t('Premium')}<br /><span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{eur(prix.premium)}</span></span>
        <span className="text-center text-xs sm:text-sm font-semibold text-indigo-600 dark:text-indigo-400">{t('Business')}<br /><span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{eur(prix.business)}</span></span>
        {agence && <span className="text-center text-xs sm:text-sm font-semibold text-violet-600 dark:text-violet-400">{t('Agence')}<br /><span className="text-[11px] font-normal text-slate-500 dark:text-slate-400">{eur(prix.agence)}</span></span>}
      </div>
      <ul>
        {lignes.map(l => (
          <li key={l.cle} className={`grid ${grille} items-center px-4 py-2.5 gap-1 border-b last:border-b-0 border-slate-50 dark:border-slate-700/50`}>
            <span className="text-[13px] text-slate-600 dark:text-slate-300 leading-snug pr-2">{t(l.libelle)}</span>
            <span className="text-center">{formaterValeur(l.gratuit)}</span>
            <span className="text-center bg-amber-50/60 dark:bg-amber-900/10 -my-2.5 py-2.5">{formaterValeur(l.premium)}</span>
            <span className="text-center bg-indigo-50/60 dark:bg-indigo-900/10 -my-2.5 py-2.5">{formaterValeur(l.business)}</span>
            {agence && <span className="text-center bg-violet-50/60 dark:bg-violet-900/10 -my-2.5 py-2.5">{formaterValeur(l.agence)}</span>}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Les quelques choses qui font décider : les chiffres viennent du comparatif du serveur,
// donc ils sont toujours ceux qui sont réellement appliqués.
const valeurDe = (lignes, cle, offre) => lignes.find(l => l.cle === cle)?.[offre]
function atoutsPremium(lignes, remise) {
  return [
    t('Campagnes d\'emails d\'avis, jusqu\'à {valeurDe} adresses', { valeurDe: String(valeurDe(lignes, 'campagnes', 'premium')) }),
    t('{valeurDe} demandes d\'avis par email et {valeurDe2} réponses IA par jour', { valeurDe: String(valeurDe(lignes, 'emails', 'premium')), valeurDe2: String(valeurDe(lignes, 'ia', 'premium')) }),
    t('Suivi de {valeurDe} mots-clés sur Google Maps', { valeurDe: String(valeurDe(lignes, 'visibilite', 'premium')) }),
    t('{remise} sur les commandes d\'avis', { remise: String(remise) }),
  ].filter(a => !a.includes('undefined'))
}
function atoutsBusiness(lignes) {
  return [
    t('Tout Premium, avec le double de volume : {valeurDe} emails et {valeurDe2} réponses IA par jour, {valeurDe3} mots-clés', { valeurDe: String(valeurDe(lignes, 'emails', 'business')), valeurDe2: String(valeurDe(lignes, 'ia', 'business')), valeurDe3: String(valeurDe(lignes, 'visibilite', 'business')) }),
    t('Relevé automatique de ta position et rapport mensuel en PDF'),
    t('Campagnes planifiées, avec relance automatique'),
    t('{valeurDe} entreprises et jusqu\'à {valeurDe2} personnes dans ton équipe', { valeurDe: String(valeurDe(lignes, 'etablissements', 'business')), valeurDe2: String(valeurDe(lignes, 'equipe', 'business')) }),
    t('Comparaison entre établissements et rapport groupé'),
  ].filter(a => !a.includes('undefined'))
}

function atoutsAgence(lignes) {
  return [
    t('Tout Business : mêmes volumes, relevé automatique, rapport mensuel, campagnes planifiées'),
    t('{valeurDe} entreprises avec le même abonnement', { valeurDe: String(valeurDe(lignes, 'etablissements', 'agence')) }),
    t('Jusqu\'à {valeurDe} personnes dans ton équipe', { valeurDe: String(valeurDe(lignes, 'equipe', 'agence')) }),
    t('Comparaison entre établissements et rapport groupé'),
  ].filter(a => !a.includes('undefined'))
}

function CarteOffre({ nom, couleur, prix, atouts, vedette, choisie, bouton }) {
  return (
    <div className={`card p-5 flex flex-col gap-4 ${vedette ? 'ring-2 ring-amber-400' : ''} ${choisie ? 'ring-2 ring-sky-500' : ''}`}>
      <div>
        <div className="flex items-center justify-between">
          <h3 className={`text-lg font-semibold ${couleur}`}>{nom}</h3>
          {vedette && <span className="text-[11px] font-medium bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 rounded-full px-2.5 py-0.5">{t('Pour démarrer')}</span>}
        </div>
        <p className="mt-1"><span className="text-3xl font-bold text-slate-900 dark:text-white">{eur(prix)}</span> <span className="text-sm text-slate-500">{t('par mois')}</span></p>
      </div>
      <ul className="space-y-2 flex-1">
        {atouts.map(a => (
          <li key={a} className="flex items-start gap-2 text-[13.5px] text-slate-600 dark:text-slate-300">
            <Check size={15} className="text-emerald-500 mt-0.5 shrink-0" /> {a}
          </li>
        ))}
      </ul>
      {bouton}
    </div>
  )
}

function ChoixOffre({ statut, prixOffre, occupe, envoiPaypal, payer, paypal }) {
  const [tableau, setTableau] = useState(false)
  const [souhaitee] = useState(() => lireOffreSouhaitee())
  const carte = !!statut?.carte_disponible
  const bouton = (offre) => (
    <div className="space-y-2">
      <button onClick={() => { oublierOffreSouhaitee(); payer(offre) }} disabled={!!occupe || !carte} className="btn-primary w-full text-base py-3.5">
        {occupe === 'payer' ? <><Spinner />{' '}{t('Redirection…')}</> : <><CreditCard size={18} />{' '}{t('Payer {eur} par carte', { eur: eur(prixOffre(offre)) })}</>}
      </button>
      <button onClick={() => paypal(offre)} disabled={envoiPaypal} className="w-full text-xs text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 underline underline-offset-4">
        {envoiPaypal ? t('Envoi…') : t('Payer plutôt par PayPal (30 jours, activé à la main)')}
      </button>
    </div>
  )
  return (
    <>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t('Tu es en')}{' '}<strong className="text-slate-700 dark:text-slate-200">{t('Gratuit')}</strong>{' '}{t(': ton QR code, ton affiche et quelques demandes d\'avis par jour. Les offres payantes ajoutent les campagnes d\'emails, le suivi Google Maps et bien plus de volume.')}
      </p>
      <div className="grid sm:grid-cols-2 gap-4">
        <CarteOffre nom={t('Premium')} couleur="text-amber-600 dark:text-amber-400" prix={prixOffre('premium')} atouts={atoutsPremium(statut?.offres?.comparatif || [], valeurDe(statut?.offres?.comparatif || [], 'remise', 'premium') || '-10 %')}
          vedette choisie={souhaitee === 'premium'} bouton={bouton('premium')} />
        <CarteOffre nom={t('Business')} couleur="text-indigo-600 dark:text-indigo-400" prix={prixOffre('business')} atouts={atoutsBusiness(statut?.offres?.comparatif || [])}
          choisie={souhaitee === 'business'} bouton={bouton('business')} />
        {statut?.offres?.agence && (
          <div className="sm:col-span-2">
            <CarteOffre nom={t('Agence')} couleur="text-violet-600 dark:text-violet-400" prix={prixOffre('agence')} atouts={atoutsAgence(statut?.offres?.comparatif || [])}
              choisie={souhaitee === 'agence'} bouton={bouton('agence')} />
          </div>
        )}
      </div>
      {!carte && (
        <p className="text-xs text-amber-600 dark:text-amber-400">{t('Le paiement par carte n\'est pas disponible pour le moment, utilise PayPal.')}</p>
      )}
      <p className="text-xs text-slate-500 dark:text-slate-400 text-center">
        {t('Paiement sécurisé par Stripe, activation tout de suite. Tu résilies en un clic, l\'offre reste active jusqu\'à la fin du mois payé.')}
      </p>
      <InfoAvantPaiement abonnement className="text-center" />
      <button onClick={() => setTableau(tx => !tx)} className="w-full flex items-center justify-center gap-1.5 text-sm text-sky-600 hover:text-sky-700" aria-expanded={tableau}>
        {tableau ? t('Masquer le détail') : t('Voir toutes les différences')} <ChevronDown size={16} className={`transition-transform ${tableau ? 'rotate-180' : ''}`} />
      </button>
      {tableau && <Comparatif lignes={statut?.offres?.comparatif || []} prix={{ premium: prixOffre('premium'), business: prixOffre('business'), ...(statut?.offres?.agence ? { agence: prixOffre('agence') } : {}) }} />}
    </>
  )
}

function PasserNiveau({ niveau, titre, texte, statut, prix, occupe, envoiPaypal, changer, paypal }) {
  const nom = niveau === 'agence' ? t('Agence') : t('Business')
  const parCarte = statut.premium_source === 'stripe' && statut.carte && statut.carte.statut !== 'termine'
  const enAttente = statut.demande_en_attente
  return (
    <div className="card p-5 space-y-3">
      <h2 className="section-title flex items-center gap-2"><Building2 size={17} className={niveau === 'agence' ? 'text-violet-500' : 'text-indigo-500'} /> {titre}</h2>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {t('{texte} {eur} par mois.', { texte, eur: eur(prix) })}
      </p>
      {enAttente ? (
        <p className="text-sm rounded-xl p-3 bg-sky-50 text-sky-800 dark:bg-sky-900/20 dark:text-sky-300">
          {t('Ta demande est en attente : règle')}{' '}{eur(enAttente.offre && statut.offres?.[enAttente.offre]?.prix != null ? statut.offres[enAttente.offre].prix : prix)}{' '}{t('via PayPal et elle sera validée dès réception.')}
        </p>
      ) : parCarte ? (
        statut.carte.resiliation_prevue
          ? <p className="text-sm text-slate-500">{t('Reprends d\'abord ton abonnement pour pouvoir changer d\'offre.')}</p>
          : <button onClick={changer} disabled={!!occupe} className="btn-primary w-full">{occupe === 'changer' ? <><Spinner />{' '}{t('Changement…')}</> : <>{t('Passer à {nom}', { nom })}</>}</button>
      ) : (
        <button onClick={paypal} disabled={envoiPaypal} className="btn-secondary w-full">{envoiPaypal ? t('Envoi…') : t('Demander {nom} par PayPal', { nom })}</button>
      )}
    </div>
  )
}

const SOURCES = { stripe: 'Carte bancaire', paypal: 'PayPal', admin: 'Offert par SwimUp' }

function MonAbonnement({ statut, occupe, lancer }) {
  const fin = statut.premium_expire_at ? new Date(String(statut.premium_expire_at).replace(' ', 'T') + 'Z') : null
  const carte = statut.carte
  const parCarte = statut.premium_source === 'stripe' && carte && carte.statut !== 'termine'
  const dateTxt = fin ? fin.toLocaleDateString(locale()) : '—'
  return (
    <div className="card p-5 space-y-4">
      <h2 className="section-title">{t('Mon abonnement')}</h2>
      <dl className="text-sm grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
        <dt className="text-slate-500 dark:text-slate-400">{t('Paiement')}</dt>
        <dd className="text-slate-700 dark:text-slate-200">{SOURCES[statut.premium_source] ? t(SOURCES[statut.premium_source]) : t('Offre active')}</dd>
        <dt className="text-slate-500 dark:text-slate-400">{parCarte && !carte.resiliation_prevue ? t('Prochain renouvellement') : t('Actif jusqu\'au')}</dt>
        <dd className="text-slate-700 dark:text-slate-200">{dateTxt}</dd>
      </dl>

      {parCarte && carte.statut === 'impaye' && (
        <p className="text-sm rounded-xl p-3 bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
          {t('Le dernier prélèvement a été refusé. Mets ta carte à jour pour garder ton offre après le {dateTxt}.', { dateTxt })}
        </p>
      )}
      {parCarte && carte.resiliation_prevue && (
        <p className="text-sm rounded-xl p-3 bg-slate-50 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
          {t('Abonnement résilié : Ton offre reste active jusqu\'au {dateTxt}, puis s\'arrête sans autre prélèvement.', { dateTxt })}
        </p>
      )}

      {parCarte && (
        <div className="flex flex-wrap gap-2">
          <button onClick={() => lancer('portail', '/client/abonnement/portail')} disabled={!!occupe} className="btn-secondary text-xs px-4 py-2">
            <ExternalLink size={14} /> {occupe === 'portail' ? t('Ouverture…') : t('Carte et factures')}
          </button>
          {carte.resiliation_prevue ? (
            <button onClick={() => lancer('reprendre', '/client/abonnement/reprendre', { succes: t('Abonnement repris, il se renouvellera normalement.') })} disabled={!!occupe} className="btn-primary text-xs px-4 py-2">
              {t('Reprendre l\'abonnement')}
            </button>
          ) : (
            <button
              onClick={() => lancer('resilier', '/client/abonnement/resilier', {
                confirmation: t('Résilier ? Ton offre reste active jusqu\'au {dateTxt}, puis s\'arrête.', { dateTxt }),
                succes: t('Résiliation enregistrée.'),
              })}
              disabled={!!occupe}
              className="text-xs px-4 py-2 rounded-full border border-slate-200 dark:border-slate-600 text-slate-500 hover:text-red-500 hover:border-red-300 transition-colors"
            >
              {t('Résilier')}
            </button>
          )}
        </div>
      )}

      {statut.paiements?.length > 0 && (
        <div>
          <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">{t('Paiements')}</p>
          <ul className="text-[13px] divide-y divide-slate-100 dark:divide-slate-700">
            {statut.paiements.map((p, i) => (
              <li key={i} className="flex justify-between py-1.5 text-slate-600 dark:text-slate-300">
                <span>{new Date(String(p.created_at).replace(' ', 'T') + 'Z').toLocaleDateString(locale())} · {t(SOURCES[p.source] || p.source)}</span>
                <span>{Number(p.montant) > 0 ? `${Number(p.montant).toFixed(2)} €` : t('Offert')}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
