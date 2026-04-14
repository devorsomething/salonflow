import Link from 'next/link';

const plans = [
  {
    name: 'Starter',
    tagline: 'Für kleine Salons mit bis zu 2 Stylisten',
    price_netto: 49,
    features: [
      'Online Terminbuchung',
      'SMS-Erinnerungen (100/Monat)',
      'Bis zu 2 Stylisten',
      'Kundenverwaltung (bis 200)',
      'Service-Katalog',
      'Einfaches Dashboard',
      'Sage-Green Buchungswidget',
    ],
    cta: 'Starter wählen',
    featured: false,
  },
  {
    name: 'Business',
    tagline: 'Für wachsende Salons mit vollem Service',
    price_netto: 89,
    features: [
      'Alles von Starter',
      'Unbegrenzte SMS',
      'WhatsApp Erinnerungen',
      'Bis zu 5 Stylisten',
      'Kundenverwaltung (unbegrenzt)',
      'Google Kalender Sync',
      'E-Mail Marketing (200/Monat)',
      'Statistiken & Einblicke',
      'Priority Support',
    ],
    cta: 'Business wählen',
    featured: true,
  },
  {
    name: 'Premium',
    tagline: 'Für Salons mit mehreren Standorten',
    price_netto: 149,
    features: [
      'Alles von Business',
      'Mehrere Standorte',
      'API-Zugang',
      'Custom Domain',
      'Weißes-Label Lösung',
      'Dedizierter Support',
      'Erweiterte Reports',
      'CSV/Excel Export',
      'Webhook-Integrationen',
    ],
    cta: 'Premium wählen',
    featured: false,
  },
];

const faqs = [
  {
    q: 'Kann ich jederzeit kündigen?',
    a: 'Ja. Monatlich kündbar, keine Mindestlaufzeit. Deine Daten bleiben 30 Tage nach Kündigung verfügbar.',
  },
  {
    q: 'Sind die Preise inklusive MwSt?',
    a: 'Alle Preise sind Nettopreise zzgl. 20% österreichische MwSt. Für Betriebe mit UID-Nummer entfällt die MwSt.',
  },
  {
    q: 'Was passiert wenn ich mehr SMS brauche?',
    a: 'Im Business-Plan sind SMS unbegrenzt. Im Starter-Plan kannst du additional SMS-Pakete zubuchen.',
  },
  {
    q: 'Kann ich zwischen den Plänen wechseln?',
    a: 'Ja, jederzeit. Bei einem Upgrade wird der restliche Monat anteilig verrechnet.',
  },
  {
    q: 'Wie funktioniert die Einrichtung?',
    a: 'Nach der Anmeldung wirst du durch einen 5-Minuten-Setup geführt: Salon-Daten, Services, Stylisten, Öffnungszeiten. Sofort einsatzbereit.',
  },
  {
    q: 'Sind meine Daten sicher?',
    a: 'Ja. Server in Österreich, SSL-verschlüsselt, tägliche Backups, DSGVO-konform. Deine Kundendaten gehören dir.',
  },
];

function formatPrice(netto: number) {
  const mwst = netto * 0.2;
  const brutto = netto + mwst;
  return { netto, mwst, brutto };
}

export default function PreisePage() {
  return (
    <div className="bg-sand-50">
      {/* Header */}
      <section className="bg-white border-b border-sage-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-sage-950 mb-6">
            Preise
          </h1>
          <p className="text-xl text-sage-600 max-w-2xl mx-auto">
            Transparent und fair — ohne versteckte Kosten. Wähle den Plan, der zu deinem Salon passt.
          </p>

          <div className="mt-6 inline-flex items-center gap-2 text-sm text-sage-500 bg-sage-50 rounded-full px-4 py-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Alle Preise zzgl. 20% MwSt. Für Unternehmer mit UID-Nummer entfällt die MwSt.
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => {
              const { brutto, mwst } = formatPrice(plan.price_netto);
              return (
                <div
                  key={plan.name}
                  className={`rounded-2xl p-8 flex flex-col ${
                    plan.featured
                      ? 'bg-sage-600 text-white shadow-xl scale-105'
                      : 'bg-white border border-sage-200'
                  }`}
                >
                  {plan.featured && (
                    <div className="-mt-10 mb-4">
                      <span className="bg-sand-400 text-sage-900 text-xs font-bold px-3 py-1 rounded-full">
                        BELIEBT
                      </span>
                    </div>
                  )}

                  <h3 className={`text-xl font-bold mb-1 ${plan.featured ? 'text-white' : 'text-sage-900'}`}>
                    {plan.name}
                  </h3>
                  <p className={`text-sm mb-6 ${plan.featured ? 'text-sage-200' : 'text-sage-600'}`}>
                    {plan.tagline}
                  </p>

                  <div className="mb-1">
                    <span className={`text-4xl font-bold ${plan.featured ? 'text-white' : 'text-sage-950'}`}>
                      €{brutto.toFixed(0)}
                    </span>
                    <span className={`text-sm ${plan.featured ? 'text-sage-200' : 'text-sage-500'}`}>
                      {' '}/ Monat
                    </span>
                  </div>
                  <p className={`text-xs mb-6 ${plan.featured ? 'text-sage-300' : 'text-sage-400'}`}>
                    €{plan.price_netto} exkl. MwSt + €{mwst.toFixed(2)} MwSt
                  </p>

                  <ul className="space-y-3 mb-8 flex-1">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-2 text-sm ${plan.featured ? 'text-sage-100' : 'text-sage-700'}`}>
                        <svg className={`w-5 h-5 shrink-0 mt-0 ${plan.featured ? 'text-sand-300' : 'text-sage-500'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href="/login"
                    className={`block text-center py-3 font-semibold rounded-xl transition-colors ${
                      plan.featured
                        ? 'bg-white text-sage-700 hover:bg-sage-50'
                        : 'bg-sage-600 text-white hover:bg-sage-700'
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              );
            })}
          </div>

          <p className="text-center text-sage-500 text-sm mt-8">
            Alle Pläne inkludieren: DSGVO-konformes Hosting, SSL, tägliche Backups, Support per E-Mail.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-sage-950 mb-10 text-center">
            Häufige Fragen
          </h2>
          <div className="space-y-6">
            {faqs.map((faq, i) => (
              <div key={i} className="border border-sage-100 rounded-xl p-6 bg-sand-50">
                <h3 className="text-lg font-semibold text-sage-900 mb-2">{faq.q}</h3>
                <p className="text-sage-600 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-sage-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            Noch Fragen? Schreib uns.
          </h2>
          <p className="text-sage-300 mb-8 text-lg">
            Wir helfen dir gerne bei der Auswahl des richtigen Plans.
          </p>
          <Link
            href="mailto:hallo@salonflow.app"
            className="inline-flex items-center gap-2 px-8 py-4 bg-sage-600 text-white font-semibold rounded-xl hover:bg-sage-500 transition-colors"
          >
            hallo@salonflow.app
          </Link>
        </div>
      </section>
    </div>
  );
}
