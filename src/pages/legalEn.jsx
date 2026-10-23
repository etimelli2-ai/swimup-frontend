// English versions of the legal pages (legal notice, terms of use, terms of sale, privacy, cookies, withdrawal).
// Courtesy translation: the French pages are the authentic text and French law applies (PageLegale says so on
// every page, and says it is not legal advice). Same sections, same numbering, same data (lib/legal.mjs).
import { useEffect, useState } from 'react'
import { Link } from '../components/Lien'
import api from '../lib/api'
import PageLegale, { Titre, Champ } from '../components/PageLegale'
import { t } from '../lib/i18n'
import {
  EDITEUR, HEBERGEUR, CNIL, PRIX, EDITEUR_EN, HEBERGEUR_EN, LOI_ET_TRIBUNAL_EN,
} from '../lib/legal.mjs'
import { UMAMI_SCRIPT, DOMAINE_MESURE } from '../lib/mesure.mjs'

const LIEN_DISCORD = 'https://discord.gg/Dt2rmcHB5u'
const lien = 'text-sky-600 underline'
const eur = (n) => `€${Number(n).toFixed(2)}`

export function MentionsLegalesEn() {
  return (
    <PageLegale titre="Legal notice" chemin="/mentions-legales" description="Who publishes SwimUp, who hosts it and how to contact us.">
      <p className="mt-3">This information is published to meet the legal duty to identify the publishers of websites (French law of 21 June 2004 on trust in the digital economy, known as LCEN).</p>

      <Titre>Publisher of the site</Titre>
      <ul className="space-y-1">
        <li><strong className="text-slate-900">Name or company name:</strong> <Champ v={EDITEUR.nom} /></li>
        <li><strong className="text-slate-900">Status:</strong> <Champ v={EDITEUR_EN.statut} /></li>
        <li><strong className="text-slate-900">Address:</strong> <Champ v={EDITEUR_EN.adresse} /></li>
        <li><strong className="text-slate-900">Phone:</strong> <Champ v={EDITEUR_EN.telephone} /></li>
        <li><strong className="text-slate-900">Email:</strong> <Champ v={EDITEUR.email} /></li>
        <li><strong className="text-slate-900">SIRET:</strong> <Champ v={EDITEUR_EN.siret} /></li>
        <li><strong className="text-slate-900">Share capital:</strong> <Champ v={EDITEUR_EN.capital} /></li>
        <li><strong className="text-slate-900">VAT:</strong> <Champ v={EDITEUR_EN.tva} /></li>
      </ul>

      <Titre>Publication director</Titre>
      <p><Champ v={EDITEUR.directeurPublication} /></p>

      <Titre>Hosting</Titre>
      <p>The site and its API are hosted by <strong className="text-slate-900">{HEBERGEUR.nom}</strong>. <Champ v={HEBERGEUR_EN.details} /></p>

      <Titre>Contact</Titre>
      <p>For any question about the site, write to <Champ v={EDITEUR.email} />. For your personal data, see the <Link to="/confidentialite" className={lien}>privacy policy</Link>.</p>

      <Titre>Intellectual property</Titre>
      <p>The SwimUp name, the logo, the texts, the guides and the tools of the site belong to the publisher, unless stated otherwise. Any reproduction without written agreement is forbidden, except for a short quotation with a link to the source.</p>

      <Titre>Links and liability</Titre>
      <p>The site links to third-party services (Google, Stripe, PayPal, Discord, Instagram, TikTok). Their content does not depend on us. SwimUp is neither affiliated with Google nor endorsed by Google: Google Maps and Google Business Profile are trademarks of Google LLC.</p>
    </PageLegale>
  )
}

export function CguEn() {
  return (
    <PageLegale titre="Terms of use" chemin="/cgu" description="The rules for using the SwimUp site, for members, clients and visitors.">
      <p className="mt-3">These terms apply to anyone who uses swimup.net: visitor, client (a business that uses the tools or orders reviews) or member (a person who writes and publishes reviews for payment). The terms of sale are separate: see the <Link to="/cgv" className={lien}>terms of sale</Link>.</p>

      <Titre>1. Who publishes the site</Titre>
      <p>SwimUp is published by <Champ v={EDITEUR.nom} /> (<Champ v={EDITEUR_EN.statut} />). Full contact details are in the <Link to="/mentions-legales" className={lien}>legal notice</Link>.</p>

      <Titre>2. Creating an account</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>You must be at least 18 years old.</li>
        <li>The information given at sign-up must be true. A valid email address is required and must be verified.</li>
        <li>An account is personal. One person = one account: duplicates may be detected (see the privacy policy) and blocked.</li>
        <li>You are responsible for your password. Turn on two-factor authentication if it is offered to you. If you think your account has been hacked, tell us quickly.</li>
        <li>Client accounts and member accounts are separate: a client has no access to the member area.</li>
      </ul>

      <Titre>3. What SwimUp does</Titre>
      <p>SwimUp offers businesses tools to ask their real customers for reviews, reply to reviews and follow their Google listing (link and QR code, reply templates, email campaigns, visibility tracking), in a free or paid version. SwimUp also offers a service for ordering reviews, written and published by paid members (see the terms of sale).</p>
      <p className="mt-2">SwimUp is not affiliated with Google. No plan guarantees a number of reviews, a rating or a place in search results.</p>

      <Titre>4. Rules for everyone</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Respect the law and the rules of Google and of the other platforms concerned.</li>
        <li>Do not try to access data that is not yours, or to disrupt the site (attacks, abusive automation, getting around limits).</li>
        <li>Do not publish content that is illegal, defamatory, hateful, or that harms a person or a business.</li>
        <li>Do not use the email tools to send messages to people who have no link with your activity, or after they have unsubscribed.</li>
      </ul>

      <Titre>5. Rules for clients</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>You are responsible for the information you give (link to your listing, texts, your customers’ email addresses).</li>
        <li>For email campaigns, you must have the right to contact the people concerned, and you inform them of how their address is used. SwimUp sends on your behalf and adds an unsubscribe link.</li>
        <li>You alone are responsible for how you use the ordered reviews on your listing, with regard to Google’s rules and the law.</li>
      </ul>

      <Titre>6. Rules for members</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>A member publishes reviews from their own Google account, following the instructions of the order, and never pretends to be someone else.</li>
        <li>Each published review is checked before payment. A review that does not comply, is removed too quickly by Google or was obtained by fraud may not be paid or may be deducted.</li>
        <li>Payment depends on the scale shown in your area. Withdrawal is by PayPal, on request, once the balance is available. You are responsible for declaring your earnings according to your tax situation.</li>
        <li>You are not an employee of SwimUp: you freely choose the reviews you do.</li>
      </ul>

      <Titre>7. Suspension and end of account</Titre>
      <p>You can ask for your account to be deleted at any time (see the privacy policy). SwimUp may suspend or close an account that does not follow these rules, after warning it when possible. Amounts due for compliant work are still paid.</p>

      <Titre>8. Availability and liability</Titre>
      <p>SwimUp does its best to keep the site working, but does not guarantee continuous availability. The tools rely on third-party data (Google in particular) which may change or be missing. SwimUp is not responsible for Google’s decisions (removal of a review, suspension of a listing) or for indirect losses. This limit does not apply where the law forbids it, notably for consumers.</p>

      <Titre>9. Changes to these terms</Titre>
      <p>These terms may change. The update date is at the top of the page. If the change is significant, users will be told by email or in their area.</p>

      <Titre>10. Governing law</Titre>
      <p>These terms are governed by French law. In case of a dispute, we first try to find an amicable solution. <Champ v={LOI_ET_TRIBUNAL_EN} /></p>
    </PageLegale>
  )
}

export function CgvEn() {
  return (
    <PageLegale titre="Terms of sale" chemin="/cgv" description="Prices, payment, deadlines, guarantee and cancellation for SwimUp review orders and subscriptions, reserved for businesses.">
      <p className="mt-3">These terms apply to purchases made on swimup.net: review orders and subscriptions to paid plans. They complete the <Link to="/cgu" className={lien}>terms of use</Link>. Seller: <Champ v={EDITEUR.nom} /> (<Champ v={EDITEUR_EN.statut} />), see the <Link to="/mentions-legales" className={lien}>legal notice</Link>.</p>

      <Titre>1. Reserved for businesses</Titre>
      <p>SwimUp’s paid services are reserved for businesses (shopkeepers, tradespeople, self-employed people, companies, associations acting as part of their activity). By ordering, you declare that you act for your business activity and not as a private individual. The rules for selling to consumers (right of withdrawal, consumer mediation) therefore do not apply: see the page on <Link to="/retractation" className={lien}>withdrawal and refunds</Link>.</p>

      <Titre>2. What is sold</Titre>
      <ul className="list-disc pl-5 space-y-2">
        <li><strong className="text-slate-900">Google Maps review orders.</strong> SwimUp members write and publish reviews on the listing you indicate, and are paid for it. These are not spontaneous reviews from your customers. You choose the number of reviews, you pay, then you follow the order from a private link.</li>
        <li><strong className="text-slate-900">Premium, Business and Agency subscriptions.</strong> Access to additional tools to manage your reviews and your visibility (detailed content on the <Link to="/offres" className={lien}>Plans</Link> page).</li>
        <li><strong className="text-slate-900">Free tools.</strong> They are not charged.</li>
      </ul>
      <p className="mt-2">No order guarantees a rating, a ranking or that Google will keep a review. You remain responsible for how you use the reviews on your listing, with regard to Google’s rules and the law.</p>

      <Titre>3. Prices</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Review ordered without an account: {eur(PRIX.avisSansCompte)} per review.</li>
        <li>Review ordered with a client account: {eur(PRIX.avisAvecCompte)} per review, and a further {PRIX.remisePremiumPourcent}% off with an active Premium plan. One free review is added for every 10 reviews ordered.</li>
        <li>Premium: {eur(PRIX.premiumMois)} per month. Business: {eur(PRIX.businessMois)} per month. Agency: {eur(PRIX.agenceMois)} per month.</li>
      </ul>
      <p className="mt-2">Prices are in euros. <Champ v={EDITEUR_EN.tva} />. The price paid is the one shown at the time of the order.</p>

      <Titre>4. Ordering and paying</Titre>
      <p>The order is binding when you click to pay: it obliges you to pay. Card payment goes through Stripe; SwimUp never sees your card number. Clients with an account can also pay by PayPal: the order is activated as soon as the payment is seen, usually within 12 hours. A confirmation email is sent to you.</p>

      <Titre>5. Delivery time</Titre>
      <p>Reviews are usually published by members within 24 to 48 hours after payment. This time is indicative: it can be longer if the listing is incorrect or if Google blocks the publication. You can follow progress from the tracking link.</p>

      <Titre>6. 30-day replacement guarantee (reviews only)</Titre>
      <p>If Google removes an ordered review within 30 days of its publication, SwimUp republishes it free of charge. The removed review is not refunded. This guarantee only covers ordered reviews: it does not apply to subscriptions.</p>

      <Titre>7. Subscriptions: duration, renewal, cancellation</Titre>
      <p>Subscriptions are monthly and renew automatically each month by a charge on the card used, until cancelled. You can cancel at any time from your client area (Premium page); the subscription stays active until the end of the period already paid, with no new charge. The period already started is not refunded. A PayPal payment validated by hand gives 30 days of access with no automatic renewal.</p>

      <Titre>8. Refunds</Titre>
      <p>The cases in which a refund is given (reviews not published, order that cannot be carried out) are described on the <Link to="/retractation" className={lien}>withdrawal and refunds</Link> page.</p>

      <Titre>9. Customer service and complaints</Titre>
      <p>For any question or complaint: <Champ v={EDITEUR.email} />. Premium, Business and Agency subscribers can also open a ticket from their area.</p>

      <Titre>10. Personal data</Titre>
      <p>The data used for the order and the payment is described in the <Link to="/confidentialite" className={lien}>privacy policy</Link>. Payment records are kept to meet accounting obligations.</p>

      <Titre>11. Governing law</Titre>
      <p>French law. <Champ v={LOI_ET_TRIBUNAL_EN} /></p>
    </PageLegale>
  )
}

export function RetractationEn() {
  return (
    <PageLegale titre="Withdrawal and refunds" chemin="/retractation" description="No right of withdrawal for business purchases, and the cases in which SwimUp refunds an order or a subscription.">
      <p className="mt-3">This page explains whether you can cancel a purchase and in which cases you are refunded. It complements the <Link to="/cgv" className={lien}>terms of sale</Link>.</p>

      <Titre>No right of withdrawal</Titre>
      <p>The 14-day withdrawal period protects consumers. SwimUp’s services are reserved for businesses buying for their activity: this right therefore does not apply. Once the order is paid, it is binding.</p>

      <Titre>When you are refunded</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Review orders: reviews that could not be published (listing not found, publication impossible) are refunded.</li>
        <li>If Google removes a review within 30 days, the replacement guarantee of the terms of sale applies: the review is republished free of charge, it is not refunded.</li>
        <li>Double payment or an error in the amount on our side: the difference is refunded.</li>
        <li>Subscription: you cancel at any time from your area, and there is no further charge at the end of the current period. The period already started is not refunded.</li>
      </ul>

      <Titre>How to ask</Titre>
      <p>Write to <Champ v={EDITEUR.email} /> with your order number or your tracking link. The refund is made by the same means as your payment (card via Stripe, or PayPal).</p>
    </PageLegale>
  )
}

const TRAITEMENTS_EN = [
  ['Creating and managing your account, logging you in', 'Email, password (hashed), role, date of last login, two-factor authentication if turned on', 'Contract (terms of use)', 'As long as your account exists, then deletion on your request'],
  ['Preventing fraud and duplicate accounts', 'IP address at sign-up and at login', 'Legitimate interest (protecting the service and members’ pay)', 'As long as your account exists (it is updated at each login)'],
  ['Processing review orders and payments', 'Email, link to the listing, name and type of business, review instructions, amount, Stripe or PayPal payment identifier', 'Contract (terms of sale) and legal obligation (accounting)', 'Accounting records: 10 years (legal obligation). The rest: as long as your account exists'],
  ['Paying members', 'PayPal email, balance, history of earnings and withdrawals, Discord identifier (help and verification)', 'Contract (terms of use) and legal obligation (accounting)', 'Earnings and withdrawals: 10 years (accounting). PayPal email and Discord identifier: as long as your account exists'],
  ['Providing the business tools', 'Review link settings, histories, analyses, campaigns (see below for their retention periods)', 'Contract', 'See the list of periods below'],
  ['Sending service emails', 'Email, content of the message (verification, order, reminders, forgotten password)', 'Contract', 'Technical sending log: 6 months'],
  ['Contacting shopkeepers to present SwimUp (business-to-business prospecting)', 'Business name, address, phone, website and email from the Google listing, rating and number of reviews', 'Legitimate interest (approaching businesses with an offer related to their activity)', 'Until you object, and 3 months after the last exchange'],
  ['Counting visits to public pages', 'Page visited, with no IP address and no cookie', 'Legitimate interest (knowing which pages are read)', 'Aggregated statistics: 1 year'],
  ['Helping users', 'Messages, tickets, technical errors', 'Contract and legitimate interest', 'Technical errors: 30 days. Tickets: 30 days'],
]

const SOUS_TRAITANTS_EN = [
  ['Railway', 'Hosts the site and the API.', 'United States; Data Privacy Framework or standard contractual clauses depending on their processing agreement (section 9.2)'],
  ['Turso', 'Hosts the database.', 'Ireland'],
  ['Resend', 'Sends emails (service, review requests, campaigns).', 'United States; certified under the Data Privacy Framework'],
  ['Stripe', 'Collects card payments and subscriptions. SwimUp never sees your card number.', 'United States; certified under the Data Privacy Framework, with standard contractual clauses as a fallback'],
  ['PayPal', 'Receives payments from clients and pays out members’ earnings.', 'Luxembourg (PayPal (Europe) S.à r.l. et Cie, S.C.A.). PayPal acts as an independent controller: any transfers it makes outside the EU fall under its own privacy policy'],
  ['Google (Places)', 'Provides the latest reviews of a listing, local search results and the listings used for prospecting.', 'United States; certified under the Data Privacy Framework, with standard contractual clauses as a fallback'],
  ['Groq', 'Writes draft replies to reviews and analysis summaries. It receives the text of the review to work on it.', 'United States; EU standard contractual clauses'],
  ['Umami', 'Counts visits to public pages, with no cookie, no profile and no IP address.', 'United States (Umami Software, Inc.); EU standard contractual clauses, data processing agreement accepted at sign-up'],
  ['Discord', 'Help and exchanges with members, if you join the server.', 'Discord alone decides how your data is used on its server'],
]

export function ConfidentialiteEn() {
  const [conservation, setConservation] = useState(null)
  useEffect(() => { api.get('/public/conservation').then(r => setConservation(r.data.conservation)).catch(() => setConservation(false)) }, [])

  return (
    <PageLegale titre="Privacy policy" chemin="/confidentialite" description="Who processes your data on SwimUp, why, for how long, with whom, and how to exercise your rights (access, erasure, objection, complaint to the CNIL).">
      <p className="mt-3">This page explains which personal data SwimUp uses, why, how long it is kept, who receives it and how you stay in control. It applies to visitors, clients and members.</p>

      <Titre>1. Who is responsible</Titre>
      <p>The data controller is <Champ v={EDITEUR.nom} /> (<Champ v={EDITEUR_EN.statut} />), <Champ v={EDITEUR_EN.adresse} />. Contact: <Champ v={EDITEUR.email} />. There is no data protection officer: the contact address above is used for all requests.</p>

      <Titre>2. What we do with your data</Titre>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <caption className="sr-only">Purposes, data, legal basis and retention period</caption>
          <thead>
            <tr className="border-b border-slate-300 text-slate-900">
              <th scope="col" className="py-2 pr-3">Why</th>
              <th scope="col" className="py-2 pr-3">Which data</th>
              <th scope="col" className="py-2 pr-3">Legal basis</th>
              <th scope="col" className="py-2">How long</th>
            </tr>
          </thead>
          <tbody>
            {TRAITEMENTS_EN.map(l => (
              <tr key={l[0]} className="border-b border-slate-200 align-top">
                <th scope="row" className="py-2 pr-3 font-medium text-slate-900">{l[0]}</th>
                <td className="py-2 pr-3">{l[1]}</td>
                <td className="py-2 pr-3">{l[2]}</td>
                <td className="py-2">{l[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2">No advertising, no resale of data, no automated decision that produces a legal effect on you. Passwords are stored hashed (unreadable).</p>

      <Titre>3. Shopkeepers contacted by SwimUp</Titre>
      <p>To present SwimUp, we write to businesses using the public information of their Google listing (source: Google Places). The message says where the address comes from. You can object at any time by clicking “Unsubscribe me” in the email or by writing to <Champ v={EDITEUR.email} />: we then never write to you again. To keep that promise, we keep an encrypted fingerprint of your address (not the address itself) so as not to contact you again if your listing is found later. Each contact receives at most one follow-up.</p>

      <Titre>4. Your customers’ addresses (campaigns)</Titre>
      <p>When a business launches a review email campaign, it decides to write to its customers: it is responsible for those addresses and SwimUp acts on its behalf (processor). The addresses are kept for the time of sending (and of the chosen reminder), then erased at the end of the campaign, after 45 days at most. SwimUp only keeps a non-reversible fingerprint of each address so as not to ask the same person for a review again and to respect unsubscriptions. Each email contains an unsubscribe link. The addresses are never included in the business’s export.</p>

      <Titre>5. Who receives your data</Titre>
      <p>Only the people who administer SwimUp have access to it. We use these providers, which process data on our behalf:</p>
      <ul className="mt-2 space-y-2">
        {SOUS_TRAITANTS_EN.map(([nom, role, lieu]) => (
          <li key={nom}><strong className="text-slate-900">{nom}</strong>: {role} Location and transfer safeguard: {lieu}.</li>
        ))}
      </ul>
      <p className="mt-2">Several of these providers are located outside the European Union, mostly in the United States. Transfers then rely on the EU–US Data Privacy Framework or on standard contractual clauses, as indicated above. Authorities and administrations may also receive data when the law requires it.</p>

      <Titre>6. How long for the business tools</Titre>
      {conservation === null && <p className="text-slate-600">Loading…</p>}
      {conservation === false && <p className="text-slate-600">The list could not be loaded. Reload the page, or find it in Reputation, Settings tab, once logged in.</p>}
      {conservation && (
        <ul className="space-y-2">
          {conservation.map(c => (
            <li key={c.donnee}><strong className="text-slate-900">{t(c.donnee)}</strong>: {t(c.duree)}.{c.note ? ` ${t(c.note)}` : ''}</li>
          ))}
        </ul>
      )}

      <Titre>7. Your rights</Titre>
      <p>You can ask for access to your data, its correction, its erasure, restriction of processing, its portability, and object to processing based on legitimate interest (including prospecting, without having to justify yourself). Where processing relies on your consent, you can withdraw it at any time. You can also give instructions on what happens to your data after your death.</p>
      <p className="mt-2">For the business tools, you download a copy of your data and erase it yourself: Reputation, Settings tab. Erasure keeps the review link (your printed QR code keeps working), the unsubscriptions and the payments.</p>
      <p className="mt-2">For any other request (correction, account deletion, objection), write to <Champ v={EDITEUR.email} />. You can also go through the <a className={lien} href={LIEN_DISCORD} target="_blank" rel="noopener noreferrer">SwimUp Discord server</a>, but email remains the official channel. We answer within one month. Payment records cannot be erased: the law requires us to keep them.</p>

      <Titre>8. Complaint</Titre>
      <p>If you think your rights are not respected, you can first write to us. You can also contact the {CNIL.nom} (the French data protection authority): {CNIL.adresse}, or online at <a className={lien} href={CNIL.plainte} target="_blank" rel="noopener noreferrer">cnil.fr/fr/plaintes</a>. If you live in another EU country, you can also contact your own data protection authority.</p>

      <Titre>9. Cookies</Titre>
      <p>The only cookie keeps you logged in. No advertising cookie. The detail is on the <Link to="/cookies" className={lien}>cookies</Link> page.</p>

      <Titre>10. What the tools do not do</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li>Google only provides the latest reviews of a listing (5 at most): the analyses are based on those.</li>
        <li>Visibility positions are indicative readings, not an official Google ranking.</li>
        <li>A click on your review link does not mean a review was published.</li>
      </ul>
      <p className="mt-8 text-sm text-slate-600">This page is updated when practices change. The date is at the top of the page.</p>
    </PageLegale>
  )
}

const LIGNES_COOKIES_EN = [
  ['token', 'Cookie', 'Keeping you logged in to your account (session token, unreadable by the site’s scripts).', '2 hours', 'Yes, necessary for the service you request'],
  ['theme', 'Browser local storage', 'Remembering your choice of light or dark display.', 'Until you clear it', 'Yes, a choice you make yourself'],
  ['swimup_offre_souhaitee', 'Browser local storage', 'Remembering the plan you looked at so we can offer it to you at sign-up.', 'Until sign-up is finished', 'Yes, only serves your journey'],
  ['swimup_derniere_commande_…', 'Browser local storage', 'Pre-filling your next order with the details of the previous one (logged-in clients).', 'Until you clear it', 'Yes, never leaves your browser'],
  ['swimup_compte', 'Session storage', 'Remembering the selected account when you manage several.', 'Until the tab is closed', 'Yes, never leaves your browser'],
]

export function CookiesEn() {
  return (
    <PageLegale titre="Cookies and trackers" chemin="/cookies" description="The list of cookies and trackers used by SwimUp, and why no consent banner is shown.">
      <p className="mt-3">This page lists everything SwimUp sets or reads on your device and every third-party service loaded by the site. At the update date, <strong className="text-slate-900">no advertising cookie, no tracking pixel and no social network is loaded</strong>.</p>

      <Titre>What is set on your device</Titre>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm border-collapse">
          <caption className="sr-only">Cookies and data stored by SwimUp</caption>
          <thead>
            <tr className="border-b border-slate-300 text-slate-900">
              <th scope="col" className="py-2 pr-3">Name</th>
              <th scope="col" className="py-2 pr-3">Type</th>
              <th scope="col" className="py-2 pr-3">Purpose</th>
              <th scope="col" className="py-2 pr-3">Duration</th>
              <th scope="col" className="py-2">Exempt from consent?</th>
            </tr>
          </thead>
          <tbody>
            {LIGNES_COOKIES_EN.map(l => (
              <tr key={l[0]} className="border-b border-slate-200 align-top">
                <th scope="row" className="py-2 pr-3 font-mono text-[13px] font-medium text-slate-900">{l[0]}</th>
                <td className="py-2 pr-3">{l[1]}</td>
                <td className="py-2 pr-3">{l[2]}</td>
                <td className="py-2 pr-3">{l[3]}</td>
                <td className="py-2">{l[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-2">These items are essential to a service you asked for, or only serve your comfort. The CNIL exempts them from consent: that is why no banner appears.</p>

      <Titre>Audience measurement</Titre>
      <p>The public pages (home, plans, guides, tools, sign-up) count their visits with <strong className="text-slate-900">Umami</strong> (script loaded from <span className="font-mono text-[13px]">{new URL(UMAMI_SCRIPT).host}</span>, only on {DOMAINE_MESURE}). Umami sets no cookie and stores nothing on your device. It keeps neither your IP address nor a profile, does not follow your browsing from one site to another and respects the “Do Not Track” setting of your browser. Nothing is measured in the logged-in area, nor on an order’s tracking page.</p>
      <p className="mt-2">This data is only used to know which pages are read, for SwimUp’s exclusive account. Under these conditions, anonymous audience measurement can do without consent according to the CNIL. If that changed (another tool, another setting), a banner with “Accept all” and “Refuse all” would be added before anything is loaded.</p>

      <Titre>Third-party services</Titre>
      <ul className="list-disc pl-5 space-y-1">
        <li><strong className="text-slate-900">Fonts:</strong> Bricolage Grotesque is hosted on the site itself. No font is loaded from Google.</li>
        <li><strong className="text-slate-900">Payment:</strong> when you click to pay by card, you leave SwimUp for the secure page of Stripe (or PayPal), which has its own rules on its domain. SwimUp loads no script there.</li>
        <li><strong className="text-slate-900">External links:</strong> Discord, Instagram and TikTok set nothing until you click their link.</li>
      </ul>

      <Titre>Managing these items</Titre>
      <p>You can clear the site’s storage from your browser settings. You will then be logged out and your theme will go back to the default. To understand what is done with your data, read the <Link to="/confidentialite" className={lien}>privacy policy</Link>.</p>
    </PageLegale>
  )
}
