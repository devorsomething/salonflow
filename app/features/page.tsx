import Link from 'next/link';

const featureGroups = [
  {
    title: 'Buchung & Kalender',
    features: [
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
          </svg>
        ),
        name: '24/7 Online Terminbuchung',
        desc: 'Kunden buchen jederzeit über deine personalisierte Buchungsseite. Mit Kalenderauswahl, Service- und Stylistenauswahl.',
      },
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
          </svg>
        ),
        name: 'Intelligenter Kalender',
        desc: 'Alle Termine auf einen Blick. Drag & Drop, automatische Konfliktprüfung, freie Zeiten werden automatisch berechnet.',
      },
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z" />
          </svg>
        ),
        name: 'Stylisten-Verwaltung',
        desc: 'Jeder Stylist hat seinen eigenen Kalender. Kunden wählen direkt ihren Favoriten — oder werden automatisch zugewiesen.',
      },
    ],
  },
  {
    title: 'Kommunikation',
    features: [
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
          </svg>
        ),
        name: 'SMS-Erinnerungen',
        desc: 'Automatische SMS 24h und 2h vor dem Termin. Weniger No-Shows, mehr Umsatz. Vorlagen inklusive.',
      },
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" />
          </svg>
        ),
        name: 'WhatsApp Erinnerungen',
        desc: 'WhatsApp-Nachrichten als Alternative zu SMS. Bilder, Buttons, schnelle Antworten — moderner Kundenservice.',
      },
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 9v.906a2.25 2.25 0 01-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 001.183 1.981l6.478 3.488m8.839 2.51l-4.778-2.58M21 14c0 4.949-4.052 8.25-9 8.25s-9-3.301-9-8.25 4.052-8.25 9-8.25 9 3.301 9 8.25z" />
          </svg>
        ),
        name: 'E-Mail Benachrichtigungen',
        desc: 'Bestätigungsmails nach Buchung, Erinnerungsmails 24h vorher, persönliche Nachrichten an Kunden.',
      },
    ],
  },
  {
    title: 'Verwaltung & Analyse',
    features: [
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        ),
        name: 'Kundenverwaltung',
        desc: 'Jeder Kunde hat ein Profil: Kontaktdaten, Buchungshistorie, Lieblingsservices, Favoriten-Stylist, Notizen.',
      },
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        ),
        name: 'Statistiken & Einblicke',
        desc: 'Umsatz pro Tag/Woche/Monat, beliebteste Services, häufigste No-Shows, Stylist-Performance.',
      },
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6z" />
          </svg>
        ),
        name: 'Service-Katalog',
        desc: 'Alle Services mit Dauer und Preis. Kategorien, Beschreibung, buchbar ja/nein. Immer aktuell.',
      },
    ],
  },
  {
    title: 'Integration & Setup',
    features: [
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
          </svg>
        ),
        name: '5-Minuten Setup',
        desc: 'Kein technisches Wissen nötig. Anmeldung, Salon-Daten eintragen, Buchungsseite teilen — fertig.',
      },
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 1.5H8.25A2.25 2.25 0 006 3.75v16.5a2.25 2.25 0 002.25 2.25h7.5A2.25 2.25 0 0018 20.25V3.75a2.25 2.25 0 00-2.25-2.25H13.5m-3 0V3h3V1.5m-3 0h3m-3 18.75h3" />
          </svg>
        ),
        name: 'Google Kalender Sync',
        desc: 'Termine werden in deinen Google Kalender übertragen. Doppelte Buchungen? Gibt es nicht mehr.',
      },
      {
        icon: (
          <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        ),
        name: 'Hosting inklusive',
        desc: 'Kein Server, keine Domain, kein WordPress. Alles hosted auf deutschen Servern. DSGVO-konform.',
      },
    ],
  },
];

const techStack = [
  { label: 'Hosted in Österreich' },
  { label: 'DSGVO-konform' },
  { label: 'SSL-verschlüsselt' },
  { label: '99.9% Uptime' },
  { label: 'Tägliches Backup' },
  { label: 'Deutsche Server' },
];

export default function FeaturesPage() {
  return (
    <div className="bg-sand-50">
      {/* Header */}
      <section className="bg-white border-b border-sage-100">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-sage-950 mb-6">
            Alle Features für deinen Salon
          </h1>
          <p className="text-xl text-sage-600 max-w-2xl mx-auto">
            Vom ersten Termin bis zur Kundenbindung — SalonFlow begleitet dich durch den ganzen Alltag.
          </p>
        </div>
      </section>

      {/* Feature Groups */}
      {featureGroups.map((group, gi) => (
        <section key={gi} className={`py-20 ${gi % 2 === 0 ? 'bg-white' : 'bg-sand-50'}`}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold text-sage-950 mb-10 flex items-center gap-3">
              <span className="w-8 h-1 bg-sage-500 rounded-full" />
              {group.title}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {group.features.map((f, fi) => (
                <div key={fi} className="bg-sand-50 rounded-2xl p-7 border border-sage-100 hover:shadow-lg hover:shadow-sage-100 transition-all hover:-translate-y-1">
                  <div className="w-14 h-14 bg-sage-600 rounded-xl flex items-center justify-center text-white mb-5">
                    {f.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-sage-900 mb-3">{f.name}</h3>
                  <p className="text-sage-600 text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      {/* Tech Stack */}
      <section className="py-20 bg-sage-950">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-white mb-10 text-center">Technische Details</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {techStack.map((t, i) => (
              <span key={i} className="px-4 py-2 bg-sage-800 rounded-full text-sage-200 text-sm font-medium">
                ✓ {t.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-sage-950 mb-6">
            Überzeugt? Dann probier es aus.
          </h2>
          <p className="text-lg text-sage-600 mb-8">
            Die Demo zeigt dir alle Features live — ohne Anmeldung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/book/demo-salon"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sage-600 text-white font-semibold rounded-xl hover:bg-sage-700 transition-all shadow-lg shadow-sage-200"
            >
              Demo ansehen
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
              </svg>
            </Link>
            <Link
              href="/preise"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-sand-50 border border-sage-200 text-sage-700 font-semibold rounded-xl hover:bg-sage-50 transition-colors"
            >
              Zu den Preisen
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
