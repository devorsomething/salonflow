import Link from 'next/link';

const features = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
      </svg>
    ),
    title: '24/7 Online Buchung',
    desc: 'Deine Kunden buchen jederzeit — auch abends, am Wochenende. Kein Telefon, kein Anrufbeantworter.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
    title: 'SMS-Erinnerungen',
    desc: 'Automatische Erinnerungen 24h und 2h vor dem Termin. Weniger No-Shows, mehr Umsatz.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
    title: 'Kundenverwaltung',
    desc: 'Alle Kundendaten an einem Ort. Historie, Favoriten, Kontaktdaten — alles sofort griffbereit.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3v11.25A2.25 2.25 0 006 16.5h2.25M3.75 3h-1.5m1.5 0h16.5m0 0h1.5m-1.5 0v11.25A2.25 2.25 0 0118 16.5h-2.25m-7.5 0h7.5m-7.5 0l-1 3m8.5-3l1 3m0 0l.5 1.5m-.5-1.5h-9.5m0 0l-.5 1.5m.75-9l3-3 2.148 2.148A12.061 12.061 0 0116.5 7.605" />
      </svg>
    ),
    title: 'Einfaches Dashboard',
    desc: 'Kalender, Termine, Statistiken — alles in einer Übersicht. Keine Schulung nötig.',
  },
];

const steps = [
  {
    num: '01',
    title: 'Demo testen',
    desc: 'Sieh dir an, wie BookCut für deinen Salon funktioniert. Kein Login nötig.',
  },
  {
    num: '02',
    title: 'Dein Salon-Profil erstellen',
    desc: 'In 5 Minuten: Öffnungszeiten, Services und Stylisten eintragen. Sofort einsatzbereit.',
  },
  {
    num: '03',
    title: 'Mehr Zeit für deine Kunden',
    desc: 'Automatische Buchungen und Erinnerungen laufen — du konzentrierst dich auf das, was zählt.',
  },
];

export default function Home() {
  return (
    <div className="bg-sand-50">
      {/* Hero */}
      <section className="relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute inset-0 bg-gradient-to-br from-sage-50 via-white to-sand-100" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-sage-200 rounded-full opacity-30 blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-sand-200 rounded-full opacity-40 blur-3xl translate-y-1/2 -translate-x-1/4" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-28">
          <div className="max-w-3xl">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-sage-100 rounded-full mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sage-500 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-sage-600"></span>
              </span>
              <span className="text-xs font-medium text-sage-700">Bereits über 120 Salons in Österreich</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-bold text-sage-950 leading-tight tracking-tight mb-6">
              Terminbuchung,
              <br />
              <span className="text-sage-600">die von selbst läuft.</span>
            </h1>

            <p className="text-xl text-sage-700 leading-relaxed mb-10 max-w-2xl">
              BookCut macht Schluss mit Telefonchaos und verpassten Terminen. 
              Deine Kunden buchen online — du hast mehr Zeit für das, was zählt.
            </p>

            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/book/demo-salon"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sage-600 text-white font-semibold rounded-xl hover:bg-sage-700 transition-all shadow-lg shadow-sage-200 hover:shadow-xl hover:shadow-sage-300 hover:-translate-y-0.5"
              >
                Demo ansehen
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </Link>
              <Link
                href="/preise"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-sage-800 font-semibold rounded-xl hover:bg-sage-50 transition-all border border-sage-200 shadow-sm"
              >
                Preise ansehen
              </Link>
            </div>
          </div>

          {/* Hero image/card */}
          <div className="mt-16 relative">
            <div className="bg-white rounded-2xl shadow-2xl shadow-sage-200 border border-sage-100 overflow-hidden">
              <div className="bg-sage-600 px-4 py-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-yellow-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                </div>
                <span className="text-sage-200 text-xs ml-2">BookCut — Buchungswidget</span>
              </div>
              <div className="p-6 bg-gradient-to-br from-sage-50 to-white">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-14 h-14 bg-sage-600 rounded-xl flex items-center justify-center">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.53 16.122a3 3 0 00-5.78 1.128 2.25 2.25 0 01-2.4 2.245 4.5 4.5 0 008.4-2.245c0-.399-.078-.78-.22-1.128zm0 0a15.998 15.998 0 003.388-1.62m-5.043-.025a15.994 15.994 0 011.622-3.395m3.42 3.42a15.995 15.995 0 004.764-4.648l3.876-5.814a1.151 1.151 0 00-1.597-1.597L14.146 6.32a15.996 15.996 0 00-4.649 4.763m3.42 3.42a6.776 6.776 0 00-3.42-3.42" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-sage-900">Haareschneiden</h3>
                    <p className="text-sage-600 text-sm">45 Min · €35</p>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map(d => (
                    <div key={d} className="text-center text-xs font-medium text-sage-500 py-1">{d}</div>
                  ))}
                  {Array.from({ length: 28 }, (_, i) => {
                    const day = i + 1;
                    const available = Math.random() > 0.4;
                    return (
                      <div
                        key={i}
                        className={`text-center text-xs py-1 rounded ${available ? 'bg-sage-100 text-sage-700 cursor-pointer hover:bg-sage-200' : 'text-sage-300'}`}
                      >
                        {day}
                      </div>
                    );
                  })}
                </div>
                <div className="bg-sage-600 text-white text-center py-3 rounded-lg font-medium text-sm">
                  Termin buchen →
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-sage-950 mb-4">
              Alles, was dein Salon braucht
            </h2>
            <p className="text-lg text-sage-600 max-w-2xl mx-auto">
              Kein kompliziertes System, keine monatliche Grundgebühr. 
              BookCut wächst mit deinem Business.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-sand-50 rounded-2xl p-6 border border-sage-100 hover:shadow-lg hover:shadow-sage-100 transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 bg-sage-600 rounded-xl flex items-center justify-center text-white mb-4">
                  {f.icon}
                </div>
                <h3 className="text-lg font-semibold text-sage-900 mb-2">{f.title}</h3>
                <p className="text-sage-600 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 bg-sage-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-sage-950 mb-4">
              In 3 Schritten starten
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, i) => (
              <div key={i} className="relative">
                <div className="text-7xl font-bold text-sage-200 mb-4">{step.num}</div>
                <h3 className="text-xl font-semibold text-sage-900 mb-2">{step.title}</h3>
                <p className="text-sage-600 leading-relaxed">{step.desc}</p>
                {i < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 right-0 translate-x-1/2 w-12 text-sage-300">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link
              href="/book/demo-salon"
              className="inline-flex items-center gap-2 px-8 py-4 bg-sage-600 text-white font-semibold rounded-xl hover:bg-sage-700 transition-all shadow-lg shadow-sage-200"
            >
              Jetzt Demo starten
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Pricing teaser */}
      <section className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-sage-950 mb-4">
              Transparent und fair
            </h2>
            <p className="text-lg text-sage-600">
              Starte mit dem Plan, der zu dir passt. Jederzeit anpassbar.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-sand-50 rounded-2xl p-8 border border-sage-200">
              <h3 className="text-lg font-semibold text-sage-900 mb-2">Starter</h3>
              <p className="text-sage-600 text-sm mb-6">Für kleine Salons mit bis zu 2 Stylisten</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-sage-950">€49</span>
                <span className="text-sage-500">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Online Terminbuchung', 'SMS-Erinnerungen', 'Bis zu 2 Stylisten', 'Kundenverwaltung'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-sage-700">
                    <svg className="w-5 h-5 text-sage-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/preise" className="block text-center py-3 bg-white border border-sage-300 text-sage-700 font-medium rounded-xl hover:bg-sage-50 transition-colors">
                Mehr erfahren
              </Link>
            </div>

            {/* Business - Featured */}
            <div className="bg-sage-600 rounded-2xl p-8 text-white relative shadow-xl">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-sand-400 text-sage-900 text-xs font-bold px-3 py-1 rounded-full">
                BELIEBT
              </div>
              <h3 className="text-lg font-semibold mb-2">Business</h3>
              <p className="text-sage-200 text-sm mb-6">Für wachsende Salons mit vollem Service</p>
              <div className="mb-6">
                <span className="text-4xl font-bold">€89</span>
                <span className="text-sage-200">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Alles von Starter', 'Bis zu 5 Stylisten', 'WhatsApp Erinnerungen', 'Kalender-Sync', 'E-Mail Marketing'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-sage-100">
                    <svg className="w-5 h-5 text-sand-300 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/preise" className="block text-center py-3 bg-white text-sage-700 font-semibold rounded-xl hover:bg-sage-50 transition-colors">
                Mehr erfahren
              </Link>
            </div>

            {/* Premium */}
            <div className="bg-sand-50 rounded-2xl p-8 border border-sage-200">
              <h3 className="text-lg font-semibold text-sage-900 mb-2">Premium</h3>
              <p className="text-sage-600 text-sm mb-6">Für Salons mit mehreren Standorten</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-sage-950">€149</span>
                <span className="text-sage-500">/Monat</span>
              </div>
              <ul className="space-y-3 mb-8">
                {['Alles von Business', 'Unbegrenzte Stylisten', 'Mehrere Standorte', 'API-Zugang', 'Dedizierter Support'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-sage-700">
                    <svg className="w-5 h-5 text-sage-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/preise" className="block text-center py-3 bg-white border border-sage-300 text-sage-700 font-medium rounded-xl hover:bg-sage-50 transition-colors">
                Mehr erfahren
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-sage-950">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Bereit, deinen Salon zu modernisieren?
          </h2>
          <p className="text-lg text-sage-300 mb-10 leading-relaxed">
            Starte noch heute mit der kostenlosen Demo. 
            Kein Kreditkarte, keine Vertragsbindung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book/demo-salon"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sage-500 text-white font-semibold rounded-xl hover:bg-sage-400 transition-all"
            >
              Demo ansehen
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/admin"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sage-800 text-white font-semibold rounded-xl hover:bg-sage-700 transition-colors border border-sage-700"
            >
              Admin Demo
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
