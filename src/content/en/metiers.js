// English version of src/content/metiersAvis.mjs, keyed by the French slug. Same structure and same template ids.
// No invented figures, no promise of results or compensation, no request for a rating (same rules as the French).
export default {
  restaurant: {
    nom: 'restaurant',
    titre: 'Google reviews for a restaurant: asking, replying, looking after your listing',
    description: 'Restaurant owner: where to put your review QR code, how to reply to a review about the wait, the food or the service, and what to check on your Google listing. Free templates.',
    intro: 'People often choose a restaurant from their phone, in the street or on the sofa. The rating, the photos and the latest replies on the listing weigh in that choice. Here are the situations that come up most and how to handle them calmly.',
    situations: [
      { t: 'The wait that was too long', p: 'This is one of the most common complaints, in the dining room as on the terrace. Acknowledge the inconvenience without going through a report of that evening’s service, and don’t mention the booking or the customer’s identity. Offer to continue by private message.' },
      { t: 'The dish that didn’t please', p: 'A kitchen can get a dish wrong or disappoint a taste. Say thank you, say the remark is passed on to the kitchen, and avoid “that’s not what other customers say”: the reader hears defensiveness, not listening.' },
      { t: 'The booking that went wrong', p: 'Table not ready, wrong time slot, group badly seated. If the mistake is yours, apologise in one sentence. If you can’t find the booking, politely ask for a contact rather than contradicting in public.' },
      { t: 'The flattering review with no detail', p: 'Very short reviews deserve a reply too, a brief one. Mention something concrete (a dish, the welcome) so the reply doesn’t look like a copy-paste.' },
    ],
    modeles: {
      'resto-attente': { nom: 'Wait in the dining room', quand: 'The customer describes a wait or slow service.', texte: 'Hello {prenom}, thank you for your feedback. The wait you describe, {probleme}, is not what we want to offer our customers, and we are discussing it with the dining room team. If you wish, write to us at {contact} so we can understand what happened. The {commerce} team.' },
      'resto-plat': { nom: 'Disappointing dish', quand: 'The criticism is about a dish or a dessert.', texte: 'Hello {prenom}, we are sorry that your meal at {commerce} did not satisfy you, in particular {probleme}. Your remark is passed on to the kitchen. If you want to tell us more, you can write to us at {contact}.' },
      'resto-merci': { nom: 'Thank-you', quand: 'Positive review, even a short one.', texte: 'Thank you {prenom} for your message! Your words about {element} make the whole {commerce} team happy, in the dining room and in the kitchen. See you soon at our table.' },
    },
    qr: [
      'On the bill or in the bill folder: the customer has finished eating and often already has their phone out.',
      'On the card payment receipt or on the back of the till receipt.',
      'Near the exit or the till, on a small A5 or A6 printed stand, rather than on every table.',
    ],
    fiche: [
      'Lunch and dinner service hours, with closing days and public holidays.',
      'An up-to-date menu (or a link to the menu) and the number to book.',
      'Recent photos of the dining room, the terrace and the dishes, in which the place can be recognised.',
    ],
    eviter: [
      'Offering a coffee or a discount in exchange for a review: Google refuses it and the reader can tell.',
      'Asking only the tables that look happy: Google forbids sorting the customers you ask.',
      'Replying in the heat of the moment on the night of a difficult service.',
    ],
  },
  coiffeur: {
    nom: 'hair salon',
    titre: 'Google reviews for a hair salon: asking, replying, looking after your listing',
    description: 'Hairdresser or barber: reply templates for a review about a cut, a colour or an appointment, QR code at the till and Google listing points to check.',
    intro: 'At the hairdresser’s, a review is about a result people wear on their head and see every day. Criticism is often emotional and replies are read carefully. Here is how to keep the right tone.',
    situations: [
      { t: 'The cut or colour that doesn’t please', p: 'The customer often has a precise wish in mind. Acknowledge that the result doesn’t suit them, without defending your technique in front of everyone. Offer to talk it over at the salon, by message or by phone.' },
      { t: 'The appointment that ran late', p: 'A slot that overruns gets noticed, especially by someone who took a break to come. Apologise simply and avoid blaming the previous customer.' },
      { t: 'The price judged too high', p: 'Don’t justify your price list point by point. A reader mostly remembers how polite your reply was. You can say where to find your prices, if they are shown on your listing or website.' },
      { t: 'The enthusiastic review', p: 'Say thank you and mention a detail: the welcome, the advice, the result. Avoid wording that promises a price or a gift on the next visit.' },
    ],
    modeles: {
      'coif-resultat': { nom: 'Result that doesn’t suit', quand: 'The customer is not satisfied with their cut or colour.', texte: 'Hello {prenom}, thank you for your feedback. We are sorry that the result is not what you expected, in particular {probleme}. We would like to talk it over with you: you can write to us at {contact} or call us at the salon. The {commerce} team.' },
      'coif-retard': { nom: 'Late appointment', quand: 'The customer waited beyond the planned time.', texte: 'Hello {prenom}, thank you for writing to us. Making you wait, {probleme}, should not have happened and we apologise. We are reviewing how appointments are organised with the {commerce} team. You can also write to us at {contact}.' },
      'coif-merci': { nom: 'Thank-you', quand: 'Positive review.', texte: 'Thank you {prenom} for your review! Knowing that {element} pleased you makes the whole {commerce} team happy. We look forward to seeing you again at the salon.' },
    },
    qr: [
      'At the till, next to the card terminal: that is where the customer stands, phone in hand.',
      'Near the exit mirror or on the reception desk, on a small printed stand.',
      'On the appointment card or business card handed to the customer when they pay.',
    ],
    fiche: [
      'Opening hours, including the days you work by appointment only.',
      'The link or number to book an appointment, checked from your phone.',
      'Photos of your work, with the agreement of the people who can be recognised in them, and photos of the salon.',
    ],
    eviter: [
      'Showing details of the customer’s file in a public reply (colour chosen, treatment history, personal remarks).',
      'Promising a touch-up or a goodwill gesture you won’t be able to keep.',
      'Asking for a review only from customers who left delighted: Google forbids sorting them.',
    ],
  },
  'artisan-batiment': {
    nom: 'building contractor',
    titre: 'Google reviews for a building contractor: asking, replying, looking after your listing',
    description: 'Plumber, electrician, painter, builder: where to slip your review QR code (invoice, end of job), how to reply to a review about a delay or a quote, and what to check on your listing.',
    intro: 'For a tradesperson, the Google listing is often read before calling, by someone hesitating between two or three quotes. Reviews talk about deadlines, how clean the site was left and the final price. Here is how to ask for them and reply to them.',
    situations: [
      { t: 'The delayed job', p: 'A delay quickly raises tension, especially if the customer took time off to let you in. Acknowledge the inconvenience, explain in one sentence if there was an unforeseen problem, and offer a direct conversation. Don’t detail the job or the address.' },
      { t: 'The quote that differs from the invoice', p: 'Don’t settle the dispute in the comments. Say you want to understand the point in question and give a way to reach you. If a specific document is the reference, that is a private conversation.' },
      { t: 'The site not left clean enough', p: 'How the site is left matters as much as the result for many customers. Apologise simply and, if relevant, say what you are changing in the way you finish jobs.' },
      { t: 'The review from someone you can’t find', p: 'First look in your book of quotes and invoices. If you find nothing, say so politely and ask for a contact, without accusing the person of lying.' },
    ],
    modeles: {
      'bat-retard': { nom: 'Delayed job', quand: 'The customer complains about missed deadlines.', texte: 'Hello {prenom}, thank you for your feedback. We understand your dissatisfaction about {probleme}, and we are sorry for the inconvenience. We would like to discuss it with you directly: you can write to us at {contact}. {commerce}.' },
      'bat-devis': { nom: 'Quote and invoice', quand: 'The review mentions a price difference or a misunderstanding of the quote.', texte: 'Hello {prenom}, thank you for taking the time to write. We would like to understand what the problem was with {probleme} and go through the documents with you. Could you write to us at {contact} so we can talk about it in person? {commerce}.' },
      'bat-merci': { nom: 'Thank-you', quand: 'Positive review about a job.', texte: 'Thank you {prenom} for your trust and for your message! Your words about {element} make the whole {commerce} team happy. Do not hesitate to contact us for your next works.' },
    },
    qr: [
      'On the invoice at the end of the job, at the bottom of the page, with a short sentence explaining what the code is for.',
      'In the email or text sent with the invoice, with the direct link.',
      'On a business card you leave with the customer, with the QR code on the back.',
    ],
    fiche: [
      'Your service area instead of a shop address, if you travel to the customer.',
      'Your services listed with the words your customers use (emergency repairs, bathroom renovation, interior painting...).',
      'Photos of your work, taken with the customers’ agreement, and of your van or your team.',
    ],
    eviter: [
      'Publishing job photos in which a customer’s home can be recognised without their agreement.',
      'Writing the address, the amount or order details in a public reply.',
      'Bargaining a review against a discount on a future job.',
    ],
  },
  'garage-automobile': {
    nom: 'car garage',
    titre: 'Google reviews for a car garage: asking, replying, looking after your listing',
    description: 'Garage owner: replying to a review about a repair delay, a quote or a fault that comes back, and putting the review QR code in the right place (handing back the keys, invoice).',
    intro: 'People often come to a garage worried: a breakdown, an inspection, a bill to come. Reviews therefore talk about trust, deadlines and price transparency. How you reply says a lot about how you treat customers.',
    situations: [
      { t: 'The repair that took longer than planned', p: 'A car off the road costs the customer in organisation and stress. Explain in one sentence if there was a hitch (part on order, diagnosis that changed) and thank them for their patience. Don’t mention the registration number or the exact model.' },
      { t: 'The invoice higher than the quote', p: 'The subject is sensitive. Acknowledge that understanding the quote is essential, and offer a private conversation where you can look at the documents together. Avoid detailing each line in public.' },
      { t: 'The fault that comes back', p: 'Don’t dispute what the customer is going through. Say you want to see the vehicle again and give a way to reach you. What you do next is settled outside the comments.' },
      { t: 'The review of trust', p: 'Customers who say “they explained what had been done” remind us of what others are looking for. Say thank you and mention the point they appreciated, without turning it into a sales argument.' },
    ],
    modeles: {
      'garage-delai': { nom: 'Repair delay', quand: 'The customer waited longer than they had been told.', texte: 'Hello {prenom}, thank you for your feedback. We understand that {probleme} complicated your organisation, and we apologise. We would like to talk it over with you: you can write to us at {contact}. {commerce}.' },
      'garage-devis': { nom: 'Quote and invoice', quand: 'The review is about the final price or the clarity of the quote.', texte: 'Hello {prenom}, thank you for sharing how you felt about {probleme}. A quote should be clear so that you can decide with peace of mind. We suggest looking at the documents together: write to us at {contact}. {commerce}.' },
      'garage-merci': { nom: 'Thank-you', quand: 'Positive review.', texte: 'Thank you {prenom} for your trust and your message! Your words about {element} please us. See you soon at {commerce}.' },
    },
    qr: [
      'When handing back the keys, at reception, at the moment the customer collects their vehicle.',
      'On the invoice or the work report handed over at the end.',
      'In the text announcing that the vehicle is ready, with the direct link.',
    ],
    fiche: [
      'Workshop and reception hours, which are not always the same, and closing days.',
      'The services you carry out (servicing, tyres, inspection, bodywork...) listed in simple words.',
      'Photos of the workshop, the reception and the team, so people recognise the place when they arrive.',
    ],
    eviter: [
      'Giving the registration plate, the full name or the details of a job in a public reply.',
      'Accusing a customer of bad faith: even if you are right, the reader remembers the tone.',
      'Promising a repair at no charge in exchange for a change to the review.',
    ],
  },
  boulangerie: {
    nom: 'bakery and pastry shop',
    titre: 'Google reviews for a bakery: asking, replying, looking after your listing',
    description: 'Baker-pastry chef: replying to a review about a product running out, the wait at the counter or the welcome, putting a QR code at the till and looking after opening hours and public holidays on your listing.',
    intro: 'A bakery is a routine, neighbourhood business: people stop by almost every day. Reviews talk about the welcome, products that are missing at 5 pm and the wait on Sunday morning. Short, warm replies work best.',
    situations: [
      { t: 'The product that ran out', p: 'A customer who comes for a particular pastry and leaves without it will say so. Say thank you, explain in one sentence how you produce (in batches, to order) if useful, and offer pre-ordering where it exists.' },
      { t: 'The wait at the counter', p: 'On Sunday morning or at school pick-up time, the queue grows. Acknowledge the inconvenience without launching into an explanation of how the workshop is organised.' },
      { t: 'The welcome judged cold', p: 'This is delicate, because it is an impression. Thank them for the feedback, say you are discussing it with the team, and avoid contesting how the customer felt.' },
      { t: 'The opening hours that don’t match', p: 'The customer came during a closure your listing didn’t show. Apologise, correct the listing straight away, and make it a habit before every public holiday.' },
    ],
    modeles: {
      'boul-rupture': { nom: 'Product sold out', quand: 'The customer didn’t find what they came for.', texte: 'Hello {prenom}, thank you for your feedback. We are sorry that {probleme}: we do everything to have enough to satisfy everyone, but it sometimes gets away from us. You can write to us at {contact} if you would like to reserve your next order. {commerce}.' },
      'boul-attente': { nom: 'Wait at the counter', quand: 'The criticism is about the queue or the service time.', texte: 'Hello {prenom}, thank you for taking the time to write to us. The wait you describe, {probleme}, is not pleasant and we are discussing it with the {commerce} team. We hope to see you again soon.' },
      'boul-merci': { nom: 'Thank-you', quand: 'Positive review.', texte: 'Thank you {prenom} for your words! Knowing that {element} pleases you warms the hearts of the whole {commerce} team. See you very soon.' },
    },
    qr: [
      'At the till, on the counter, near the card terminal or the tip jar.',
      'On the paper bag or the cake box, with a short sentence.',
      'On the loyalty card or the pastry order card.',
    ],
    fiche: [
      'Your hours, with the weekly closing day and the annual holidays.',
      'Public holidays and exceptional closures, to review before every long weekend.',
      'Recent photos of the window display and of the products of the day, not only of the front of the shop.',
    ],
    eviter: [
      'Offering a pastry in exchange for a review: Google refuses it.',
      'Answering the customer in public about what they bought or their habits.',
      'Leaving end-of-year holiday hours uncorrected after the period.',
    ],
  },
  'institut-de-beaute': {
    nom: 'beauty salon',
    titre: 'Google reviews for a beauty salon: asking, replying, looking after your listing',
    description: 'Beautician, salon, nail bar: replying to a review about a treatment, an appointment or the atmosphere, QR code in the treatment room or at the till, and Google listing points to check.',
    intro: 'A salon sells a moment as much as a treatment. Reviews mention the welcome, the calm, the result and punctuality. As they are about the body and the skin, public replies call for some restraint about what you say about the customer.',
    situations: [
      { t: 'The treatment result that disappoints', p: 'Acknowledge the disappointment without justifying yourself technically in public. Say nothing about the condition of the skin, the products used or the person’s profile: it is personal information. Offer a private conversation.' },
      { t: 'The appointment that slipped', p: 'A delay breaks the relaxed mood. Apologise simply and, if you can, say what you are changing to limit slippage.' },
      { t: 'The atmosphere or the cleanliness', p: 'The cleanliness of a treatment room is a sensitive subject. Thank them for the remark, say you take it seriously and are discussing it with the team, without listing what you usually do.' },
      { t: 'The enthusiastic review', p: 'Say thank you and mention a specific moment (the welcome, the massage, the advice). Avoid announcing promotions in the reply: Google pays attention to that.' },
    ],
    modeles: {
      'inst-resultat': { nom: 'Treatment that didn’t suit', quand: 'The customer is not satisfied with the result.', texte: 'Hello {prenom}, thank you for your feedback. We are sorry that your treatment at {commerce} did not suit you, in particular {probleme}. We would like to talk about it with you in complete discretion: write to us at {contact}.' },
      'inst-retard': { nom: 'Delay or shifted appointment', quand: 'The time slot was not respected.', texte: 'Hello {prenom}, thank you for writing to us. The delay you describe, {probleme}, should not have happened and we apologise. The {commerce} team is reviewing how appointments are organised. You can also write to us at {contact}.' },
      'inst-merci': { nom: 'Thank-you', quand: 'Positive review.', texte: 'Thank you {prenom} for your message! Your words about {element} touch us. See you very soon at {commerce}.' },
    },
    qr: [
      'At reception, on the counter, just before or after payment.',
      'On the receipt or the treatment sheet handed over at the end, with a very short sentence.',
      'In the reminder text or email for the next appointment, with the direct link.',
    ],
    fiche: [
      'Your treatments and services listed with their duration, in simple words.',
      'Opening hours and how to book, checked from your phone.',
      'Photos of the reception area and the treatment rooms, with no recognisable customers.',
    ],
    eviter: [
      'Talking about a customer’s skin, weight or health in a public reply.',
      'Publishing before-and-after photos of a person without their written agreement.',
      'Announcing discounts or gifts in the reply to a review.',
    ],
  },
}
