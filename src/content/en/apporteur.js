// English message templates for referrers (counterpart of MESSAGES in src/content/guideApporteur.mjs).
// Same ids, same placeholders: [in brackets] = to replace by hand, {outil} and {offres} = the referrer’s links.
export default {
  'sur-place': {
    titre: 'In person',
    pour: 'Local business, owner present',
    texte: `Hello, sorry to disturb you for two minutes. My name is [your first name], I am an independent referrer for SwimUp, a French website offering tools for Google reviews.

I looked at your Google listing, [true observation: for example "you have 18 reviews"]. There is a free tool that creates the direct link to your business's review form, with a QR code to put on the counter and a poster to print.

Can I show you on my phone? It takes two minutes, and you have nothing to pay or sign.`,
  },
  telephone: {
    titre: 'Phone',
    pour: 'Business or tradesperson, first call',
    texte: `Hello, my name is [your first name], I am an independent referrer for SwimUp. I am not selling you anything over the phone, I just want to tell you about a free tool: it creates the direct link for a customer to leave a Google review for [business name], with a QR code to print.

Can I send you the link by text so you can have a look when you have two minutes?

(If yes, send the short message below. If no, thank them and note that the person does not want to be called back.)`,
  },
  court: {
    titre: 'Short message (text, Instagram, Facebook)',
    pour: 'After a call, or as a first contact on the business page',
    texte: `Hello, I am [your first name], an independent referrer for SwimUp. Here is a free tool that creates the direct link to the Google review form of [business name], with a QR code and a poster to print: {outil}
No account is needed to try it. If you are not interested, tell me and I will not write to you again.`,
  },
  mail: {
    titre: 'Business email',
    pour: 'Business address displayed publicly',
    objet: 'The Google review link for [business name]',
    texte: `Hello,

My name is [your first name], I am an independent referrer for SwimUp, a French website offering tools for Google reviews. I found your address on [your website / your Google listing].

Looking at the listing of [business name], [true observation: "I saw 18 reviews and a 4.1 rating"]. SwimUp offers a free tool that creates the direct link to your review form, a QR code and a poster to print. You can try it without signing up:
{outil}

SwimUp also offers paid subscriptions (review tracking, AI-assisted replies, email campaigns) and review orders. Everything is detailed with prices here: {offres}

If you do not want me to contact you again, simply reply “stop” and I will not write to you again.

Kind regards,
[your first and last name]`,
  },
  relance: {
    titre: 'Follow-up (one only)',
    pour: '3 to 4 days after a message with no answer',
    texte: `Hello, it is [your first name], independent referrer for SwimUp. I am getting back to you just once about the free Google review link tool for [business name]: {outil}
If it does not concern you, no problem, I will not follow up again.`,
  },
  agence: {
    titre: 'Freelancer or agency',
    pour: 'Community manager, web or local SEO agency managing several listings',
    objet: 'A tool to manage your clients’ Google reviews',
    texte: `Hello,

My name is [your first name], I am an independent referrer for SwimUp. You manage the online presence of several businesses, so I think this may be useful to you: SwimUp has an Agency plan to follow the reviews of several businesses in one place (25 businesses and 10 team members included, €49.90 per month at the time of writing).

Before looking at the subscription, you can try the free tools (review link, QR code, poster): {outil}
The plans and their exact content are here: {offres}

If it does not concern you, reply “stop” and I will not write to you again.

Kind regards,
[your first and last name]`,
  },
}
