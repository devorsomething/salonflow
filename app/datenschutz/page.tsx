export default function DatenschutzPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-sage-950 mb-8">Datenschutzerklärung</h1>

        <div className="space-y-8 text-sm text-sage-700 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">1. Verantwortlicher</h2>
            <p>
              <strong className="text-sage-900">BookCut</strong><br />
              c/o Timo Miro Gavanelli<br />
              Bregenz, Vorarlberg, Österreich<br />
              E-Mail: hallo@bookcut.app
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">2. Erhebung und Verarbeitung personenbezogener Daten</h2>
            <p className="mb-3">
              Ich erhebe personenbezogene Daten nur, wenn du sie mir im Rahmen einer Buchung, 
              Registrierung oder Anfrage von sich aus mitteilst.
            </p>
            <p className="mb-3">
              <strong className="text-sage-900">Buchungsdaten:</strong> Name, Telefonnummer, E-Mail-Adresse, 
              gebuchter Service, Terminzeitpunkt, Stylist-Auswahl, allfällige Notizen.
            </p>
            <p>
              <strong className="text-sage-900">Admin-Zugang:</strong> E-Mail-Adresse, verschlüsseltes Passwort 
              (bcrypt), Salonname, Öffnungszeiten, Service-Katalog.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">3. Zweck der Datenverarbeitung</h2>
            <p>Die Daten werden für folgende Zwecke verarbeitet:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Terminbuchung und -verwaltung</li>
              <li>Automatisierte Termin-Erinnerungen (SMS/WhatsApp)</li>
              <li>Kundenverwaltung (Salonbetreiber)</li>
              <li>Support und Kommunikation</li>
            </ul>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">4. Speicherdauer</h2>
            <p>
              Personenbezogene Daten werden nur so lange gespeichert, wie es für die Erbringung 
              der Dienstleistung erforderlich ist, oder bis du die Löschung deiner Daten verlangst. 
              Buchungsdaten werden mindestens 3 Jahre aufbewahrt (依据 österreichische Rechtslage).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">5. Weitergabe an Dritte</h2>
            <p>
              Deine Daten werden nicht an Dritte verkauft oder vermietet. Eine Weitergabe erfolgt 
              nur an noun16 — insbesondere an Twilio/WhatsApp (für Erinnerungs-SMS), und an 
              Supabase (Hosting-Partner, EU-Rechenzentren).
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">6. Rechte der Betroffenen</h2>
            <p>Du hast das Recht auf:</p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Auskunft über deine gespeicherten Daten</li>
              <li>Berichtigung unrichtiger Daten</li>
              <li>Löschung deiner Daten (soweit keine gesetzliche Aufbewahrungspflicht)</li>
              <li>Datenportabilität</li>
              <li>Widerspruch gegen die Verarbeitung</li>
            </ul>
            <p className="mt-2">
              Um diese Rechte auszuüben, schreib uns: hallo@bookcut.app
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">7. Hosting</h2>
            <p>
              Das Hosting erfolgt auf Servern in Österreich (Contabo, Netcup). 
              Alle Daten werden verschlüsselt (SSL/TLS) übertragen.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">8. Cookies</h2>
            <p>
              Diese Website verwendet technische Cookies für den Login (Session-Cookie) und 
              für die Buchungsfunktionalität. Es werden keine Tracking- oder Werbe-Cookies eingesetzt.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">9. Änderungen</h2>
            <p>
              Ich behalte mir vor, diese Datenschutzerklärung anzupassen, um sie an 
              geänderte Rechtslagen oder an Änderungen meiner Dienste anzupassen.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
