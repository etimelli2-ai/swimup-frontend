// Balises <head> de l'accueil anglais (swimup.net/en). L'accueil n'est pas prérendu (c'est la page de commande,
// qui dépend de la session) : scripts/prerender.mjs écrit dist/en.html à partir d'index.html en remplaçant
// seulement ces balises. Les textes suivent ceux d'index.html (français) mot pour mot, sans rien ajouter.
import { SITE_URL } from './seo.mjs'

export const ACCUEIL_EN = {
  titre: 'SwimUp — Google Maps reviews: order them or earn money',
  description: 'Get genuine Google Maps reviews in 24 hours for just €4. No sign-up, secure payment with Stripe, 30-day guarantee. Join SwimUp and earn money by writing reviews.',
  url: `${SITE_URL}/en`,
  ld: [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      name: 'SwimUp — Google Maps reviews',
      description: 'Get genuine Google Maps reviews in 24 hours for €4. No sign-up, secure payment.',
      url: `${SITE_URL}/en/order`,
      provider: { '@type': 'Organization', name: 'SwimUp', url: SITE_URL },
      offers: {
        '@type': 'Offer', price: '4.00', priceCurrency: 'EUR', availability: 'https://schema.org/InStock',
        description: '1 genuine Google Maps review, delivered in 24 hours, guaranteed for 30 days',
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: [
        ['How do I buy a Google Maps review?', 'Fill in the form on swimup.net/en/order, pay €4 through Stripe and receive your tracking link by email. A member publishes your review within 24 hours.'],
        ['How much does a Google Maps review cost?', 'A Google Maps review costs €4 without an account. With a SwimUp account, the price drops to €3 per review.'],
        ['What happens if the review is removed?', 'SwimUp guarantees your reviews for 30 days. If Google removes the review within that period, we redo it for free.'],
        ['How can I earn money with SwimUp?', 'Sign up for free on SwimUp, write Google Maps reviews for businesses and earn €1 for each review published.'],
      ].map(([name, text]) => ({ '@type': 'Question', name, acceptedAnswer: { '@type': 'Answer', text } })),
    },
  ],
}
