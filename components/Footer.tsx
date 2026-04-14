import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-sage-950 text-sand-200">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-sage-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="text-xl font-semibold text-white">SalonFlow</span>
            </div>
            <p className="text-sm text-sand-400 leading-relaxed">
              Terminplanung und Kundenverwaltung für Salons in Österreich. Einfach. Modern. Sofort einsatzbereit.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Produkt</h4>
            <ul className="space-y-2">
              <li><Link href="/features" className="text-sm text-sand-400 hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/preise" className="text-sm text-sand-400 hover:text-white transition-colors">Preise</Link></li>
              <li><Link href="/book/demo-salon" className="text-sm text-sand-400 hover:text-white transition-colors">Demo</Link></li>
            </ul>
          </div>

          {/* Salon */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Für Salons</h4>
            <ul className="space-y-2">
              <li><Link href="/admin" className="text-sm text-sand-400 hover:text-white transition-colors">Demo Admin</Link></li>
              <li><span className="text-sm text-sand-400">Terminbuchung 24/7</span></li>
              <li><span className="text-sm text-sand-400">SMS-Erinnerungen</span></li>
              <li><span className="text-sm text-sand-400">Kundenverwaltung</span></li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wide">Rechtliches</h4>
            <ul className="space-y-2">
              <li><Link href="/impressum" className="text-sm text-sand-400 hover:text-white transition-colors">Impressum</Link></li>
              <li><Link href="/datenschutz" className="text-sm text-sand-400 hover:text-white transition-colors">Datenschutz</Link></li>
              <li><span className="text-sm text-sand-400">AGB</span></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-sage-800 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-sand-500">
            © 2026 SalonFlow. Alle Rechte vorbehalten.
          </p>
          <p className="text-sm text-sand-500">
           made with ♥ in Vorarlberg
          </p>
        </div>
      </div>
    </footer>
  );
}
