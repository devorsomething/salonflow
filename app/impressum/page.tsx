export default function ImpressumPage() {
  return (
    <div className="bg-white min-h-screen">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-3xl font-bold text-sage-950 mb-8">Impressum</h1>

        <div className="space-y-8 text-sm text-sage-700 leading-relaxed">
          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">Angaben gemäß § 5 ECG</h2>
            <p className="mb-2">
              <strong className="text-sage-900">SalonFlow</strong><br />
              c/o Timo Miro Gavanelli<br />
              Bregenz<br />
              Vorarlberg, Österreich
            </p>
            <p>
              <strong className="text-sage-900">E-Mail:</strong> hallo@salonflow.app<br />
              <strong className="text-sage-900">Website:</strong> https://salonflow.app
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">Gewerbe / Selbstständigkeit</h2>
            <p>
              Ich bin als Einzelunternehmer in Vorarlberg, Österreich, tätig. 
              Zuständige Behörde: Wirtschaftskammer Vorarlberg.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">Haftungsausschluss</h2>
            <p>
              Die Inhalte dieser Website dienen der allgemeinen Information. 
              Trotz sorgfältiger Recherche übernehme ich keine Gewähr für die Aktualität, 
              Richtigkeit oder Vollständigkeit der bereitgestellten Informationen.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">Urheberrecht</h2>
            <p>
              Die durch den Seitenbetreiber erstellten Inhalte und Werke auf dieser Website 
              unterliegen dem österreichischen Urheberrecht. Beiträge Dritter sind als solche 
              gekennzeichnet. Die Vervielfältigung, Bearbeitung, Verbreitung und jede Art der 
              Verwertung außerhalb der Grenzen des Urheberrechts bedürfen der schriftlichen 
              Zustimmung des jeweiligen Autors bzw. Erstellers.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">Linkhinweis</h2>
            <p>
              Diese Website enthält Links zu externen Webseiten Dritter, auf deren Inhalte 
              ich keinen Einfluss habe. Für die Inhalte der verlinkten Seiten ist stets der 
              jeweilige Anbieter oder Betreiber verantwortlich.
            </p>
          </div>

          <div>
            <h2 className="text-lg font-semibold text-sage-900 mb-2">Gerichtsstand</h2>
            <p>
              Gerichtsstand ist Bregenz, Österreich. Es gilt österreichisches Recht.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
