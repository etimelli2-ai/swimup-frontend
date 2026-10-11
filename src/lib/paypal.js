// Paiement des commandes clients : PayPal.me en direct, validé à la main
// par l'admin à réception. VITE_PAYPAL_ME = https://paypal.me/tonpseudo
const PAYPAL_ME = import.meta.env.VITE_PAYPAL_ME || 'https://paypal.me/tonpseudo'

export function lienPaypal(montant) {
  return `${PAYPAL_ME}/${Number(montant).toFixed(2)}EUR`
}
