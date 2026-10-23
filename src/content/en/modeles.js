// English version of src/lib/modelesReponses.mjs (reply templates). The {fields} are the same as in French.
// The wording follows what an English-speaking business would write: short, polite, no promise of compensation.
export default {
  champs: {
    prenom: { etiquette: 'Customer’s first name', exemple: 'Camille', defaut: '[first name]' },
    commerce: { etiquette: 'Your business name', exemple: 'Dupont Bakery', defaut: '[business name]' },
    element: { etiquette: 'What the customer liked', exemple: 'the croissants', defaut: '[specific point]' },
    probleme: { etiquette: 'The problem mentioned', exemple: 'the wait at the counter', defaut: '[problem]' },
    contact: { etiquette: 'Your contact details', exemple: 'contact@example.com', defaut: '[contact]' },
  },
  sections: {
    positifs: {
      titre: 'Replying to a positive review',
      intro: 'Say thank you and mention one detail from the review, and keep it short. Change the wording a little from one review to the next: the same sentence copied everywhere gets noticed.',
      modeles: {
        'pos-court': { nom: 'Short thank-you', quand: 'Positive review with a small comment.',
          texte: 'Thank you {prenom} for your review! Your words about {element} mean a lot to us. See you very soon at {commerce}.' },
        'pos-detail': { nom: 'Detailed review', quand: 'The customer took the time to write several sentences.',
          texte: 'Hello {prenom}, thank you for taking the time to write to us. Your comment about {element} makes the whole team very happy: it is exactly what we aim to offer. We look forward to seeing you again at {commerce}.' },
        'pos-fidele': { nom: 'Regular customer', quand: 'You recognise a regular, or the review says “as always”.',
          texte: 'Thank you {prenom}, and above all thank you for your loyalty! Knowing you keep coming back to {commerce} is the best reward. See you very soon.' },
        'pos-note': { nom: 'Rating with no comment', quand: 'The customer left stars but wrote nothing.',
          texte: 'Hello {prenom}, thank you for your rating! If you have a moment, tell us what you liked or what we could improve: it is precious to us. See you soon at {commerce}.' },
      },
    },
    negatifs: {
      titre: 'Replying to a negative review',
      intro: 'Reply when you are calm, not in the heat of the moment. Acknowledge what went wrong without justifying yourself at length, give no details about the person or the order, and offer to continue in private.',
      modeles: {
        'neg-service': { nom: 'Service or waiting time', quand: 'The customer describes a moment that went badly.',
          texte: 'Hello {prenom}, thank you for your feedback. We are sorry that your visit to {commerce} was not up to standard, in particular because of {probleme}: it is not the experience we want to offer. Could you write to us at {contact} so we can look into it together?' },
        'neg-produit': { nom: 'Quality of the product or the work', quand: 'The customer is not satisfied with what they received.',
          texte: 'Hello {prenom}, we are very sorry to read what you describe about {probleme}. Your feedback is taken seriously and we are discussing it with the team. If you wish, write to us at {contact}: we would like to understand what happened and look for a solution.' },
        'neg-erreur': { nom: 'A mistake on your side', quand: 'The customer is right and you know it.',
          texte: 'Hello {prenom}, what you describe about {probleme} should not have happened, and we apologise. We are going over this point with the team. Write to us at {contact} so that we can find a solution with you.' },
        'neg-prix': { nom: 'Remark about prices', quand: 'The review says it is too expensive.',
          texte: 'Hello {prenom}, thank you for sharing how you felt about our prices. We try to stay fair, taking into account the quality and the time our work requires. If you wish, we can go through the quote or the invoice together: write to us at {contact}.' },
        'neg-sans-texte': { nom: 'Low rating with no explanation', quand: 'One or two stars, but not a word.',
          texte: 'Hello {prenom}, we saw your rating and we are sorry that your experience at {commerce} was not up to standard. If you are willing to tell us what did not work, write to us at {contact}: we want to improve.' },
      },
    },
    faux: {
      titre: 'Replying to a fake or unfair review',
      intro: 'A harsh review based on a real experience remains a valid review. These templates are for cases where you can’t find the customer, where the review is about another business, or where it breaks Google’s rules. Stay factual and don’t accuse anyone.',
      modeles: {
        'faux-inconnu': { nom: 'Customer not found', quand: 'You looked and found no trace of the visit or the order.',
          texte: 'Hello, we have searched on our side and cannot find any trace of this visit or this order. Could you contact us at {contact} with a few details so that we can look into it? We are listening.' },
        'faux-autre': { nom: 'Review about another business', quand: 'The comment is about a place or a service that is not yours.',
          texte: 'Hello, it seems this review is about a business other than {commerce}. If we are mistaken, please feel free to write to us at {contact}.' },
        'faux-regles': { nom: 'Review that breaks Google’s rules', quand: 'Insults, off-topic content, spam. Only write this after you have really reported the review to Google.',
          texte: 'We are open to any reasoned criticism and happy to answer at {contact}. This review does not seem to us to respect Google’s rules and we have reported it.' },
      },
    },
  },
}
