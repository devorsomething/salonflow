import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen bg-[#F8F6F2]">
      {/* Navigation */}
      <nav className="bg-white border-b border-[#E5E0D8] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-[#8BA888] rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xl font-bold text-[#1E2D24]">SalonFlow</span>
            </div>
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[#4A5D4C] hover:text-[#8BA888] transition-colors font-medium">Features</a>
              <a href="#how-it-works" className="text-[#4A5D4C] hover:text-[#8BA888] transition-colors font-medium">So funktioniert's</a>
              <a href="#testimonials" className="text-[#4A5D4C] hover:text-[#8BA888] transition-colors font-medium">Kundenstimmen</a>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-[#4A5D4C] hover:text-[#8BA888] font-medium transition-colors">
                Anmelden
              </Link>
              <Link href="/book/demo-salon" className="bg-[#8BA888] hover:bg-[#6B8A68] text-white px-5 py-2.5 rounded-xl font-semibold transition-all shadow-md hover:shadow-lg">
                Termin buchen
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#F8F6F2] via-[#F0EDE6] to-[#E8E4DC]"></div>
        <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-[#8BA888]/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#D4A574]/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 bg-[#8BA888]/15 text-[#4A5D4C] px-4 py-2 rounded-full text-sm font-medium mb-6">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Buchungssystem für Österreich
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-[#1E2D24] leading-tight mb-6">
                Ihr Salon.<br />
                <span className="text-[#8BA888]">Ihre Termine.</span><br />
                Ihre Zukunft.
              </h1>
              <p className="text-lg sm:text-xl text-[#5A6B5C] mb-8 leading-relaxed max-w-lg">
                Online-Terminbuchung für Ihren Friseur-, Beauty- oder Nagelsalon. 
                Nie wieder Anrufe zur Terminvereinbarung – Ihre Kunden buchen selbst.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/book/demo-salon" className="bg-[#8BA888] hover:bg-[#6B8A68] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl text-center">
                  Demo-Salon besuchen
                </Link>
                <a href="#how-it-works" className="border-2 border-[#8BA888] text-[#8BA888] hover:bg-[#8BA888]/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all text-center">
                  Mehr erfahren
                </a>
              </div>
              
              <div className="flex items-center gap-6 mt-10 pt-8 border-t border-[#E5E0D8]">
                <div>
                  <p className="text-3xl font-bold text-[#1E2D24]">500+</p>
                  <p className="text-sm text-[#6B6B6B]">Aktive Salons</p>
                </div>
                <div className="w-px h-12 bg-[#E5E0D8]"></div>
                <div>
                  <p className="text-3xl font-bold text-[#1E2D24]">50.000+</p>
                  <p className="text-sm text-[#6B6B6B]">Buchungen/Monat</p>
                </div>
                <div className="w-px h-12 bg-[#E5E0D8]"></div>
                <div>
                  <p className="text-3xl font-bold text-[#1E2D24]">4.9★</p>
                  <p className="text-sm text-[#6B6B6B]">Kundenbewertung</p>
                </div>
              </div>
            </div>
            
            <div className="relative hidden lg:block">
              <div className="absolute inset-0 bg-gradient-to-br from-[#8BA888]/20 to-[#D4A574]/20 rounded-3xl transform rotate-3"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-8 border border-[#E5E0D8]">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-[#8BA888] rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E2D24]">Friseur Mayer</p>
                    <p className="text-sm text-[#6B6B6B]">Wien</p>
                  </div>
                </div>
                
                <div className="space-y-3 mb-6">
                  <div className="bg-[#F8F6F2] rounded-xl p-4">
                    <p className="text-sm text-[#6B6B6B] mb-1">Haare schneiden</p>
                    <p className="font-semibold text-[#1E2D24]">€ 45 · 45 Min</p>
                  </div>
                  <div className="bg-[#8BA888]/10 rounded-xl p-4 border-2 border-[#8BA888]">
                    <p className="text-sm text-[#8BA888] mb-1">Nächster freier Termin</p>
                    <p className="font-semibold text-[#1E2D24]">Morgen, 10:00</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-2 mb-6">
                  {['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'].map((time) => (
                    <button key={time} className={`py-2 rounded-lg text-sm font-medium transition-all ${time === '10:00' ? 'bg-[#8BA888] text-white' : 'bg-[#F8F6F2] text-[#4A5D4C] hover:bg-[#E5E0D8]'}`}>
                      {time}
                    </button>
                  ))}
                </div>
                
                <button className="w-full bg-[#8BA888] hover:bg-[#6B8A68] text-white py-3 rounded-xl font-semibold transition-all">
                  Termin buchen
                </button>
              </div>
              
              {/* Floating notification */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-4 border border-[#E5E0D8]">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#D4A574] rounded-full flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#1E2D24]">Neue Buchung!</p>
                    <p className="text-xs text-[#6B6B6B]">Vor 2 Minuten</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud */}
      <section className="bg-white border-y border-[#E5E0D8] py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-[#6B6B6B] mb-8">Vertrauen von führenden Salons in ganz Österreich</p>
          <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60">
            {['Haarstudio Weiss', 'Beauty Lounge Wien', 'Nagelstudio Ella', 'Friseur am Ring', 'Studio Haarwerk'].map((name) => (
              <div key={name} className="text-lg font-semibold text-[#4A5D4C]">{name}</div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32 bg-[#F8F6F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E2D24] mb-4">
              Alles, was Ihr Salon braucht
            </h2>
            <p className="text-lg text-[#5A6B5C] max-w-2xl mx-auto">
              Von der Online-Buchung bis zur automatischen Erinnerung – SalonFlow macht Ihren Alltag einfacher.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                title: '24/7 Online-Buchung',
                description: 'Ihre Kunden können rund um die Uhr Termine buchen – auch außerhalb Ihrer Geschäftszeiten.'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                ),
                title: 'SMS-Erinnerungen',
                description: 'Automatische Erinnerungen 24 Stunden vor dem Termin reduzieren No-Shows um bis zu 40%.'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                ),
                title: 'Kundenverwaltung',
                description: 'Alle Kundendaten und Buchungshistorien an einem Ort – nie wieder Zettelwirtschaft.'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ),
                title: 'Mitarbeiter-Verwaltung',
                description: 'Verwalten Sie Arbeitszeiten, Services und Verfügbarkeiten Ihrer Stylisten.'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                ),
                title: 'Einfache Abrechnung',
                description: 'Transparente Preise und keine versteckten Kosten. Sie behalten den Überblick.'
              },
              {
                icon: (
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                ),
                title: 'Mobile Optimiert',
                description: 'Perfekt funktionierend auf Smartphone, Tablet und Desktop – für Sie und Ihre Kunden.'
              }
            ].map((feature, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-[#E5E0D8] hover:shadow-lg hover:border-[#8BA888]/30 transition-all group">
                <div className="w-14 h-14 bg-[#8BA888]/15 rounded-2xl flex items-center justify-center text-[#8BA888] mb-5 group-hover:bg-[#8BA888] group-hover:text-white transition-all">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-[#1E2D24] mb-3">{feature.title}</h3>
                <p className="text-[#5A6B5C] leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 lg:py-32 bg-[#1E2D24]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              In 3 Schritten starten
            </h2>
            <p className="text-lg text-[#8BA888] max-w-2xl mx-auto">
              Innerhalb weniger Minuten einsatzbereit – ohne technisches Wissen.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {[
              {
                step: '01',
                title: 'Account erstellen',
                description: 'Registrieren Sie sich in unter 2 Minuten mit Ihrem Salon-Namen und Kontaktdaten.'
              },
              {
                step: '02',
                title: 'Services einrichten',
                description: 'Fügen Sie Ihre angebotenen Services mit Preisen und Dauer hinzu.'
              },
              {
                step: '03',
                title: 'Buchungs-Link teilen',
                description: 'Erhalten Sie Ihren persönlichen Buchungs-Link und teilen Sie ihn mit Ihren Kunden.'
              }
            ].map((item, index) => (
              <div key={index} className="relative">
                <div className="text-[120px] lg:text-[180px] font-bold text-[#8BA888]/10 absolute -top-8 lg:-top-12 -left-2 select-none">
                  {item.step}
                </div>
                <div className="relative pt-16 lg:pt-20">
                  <h3 className="text-2xl font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-[#A8B8A9] leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
          
          <div className="text-center mt-16">
            <Link href="/login" className="inline-flex items-center gap-2 bg-[#8BA888] hover:bg-[#6B8A68] text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl">
              Jetzt kostenlos starten
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 lg:py-32 bg-[#F8F6F2]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#1E2D24] mb-4">
              Das sagen unsere Kunden
            </h2>
            <p className="text-lg text-[#5A6B5C] max-w-2xl mx-auto">
              Über 500 Salons in Österreich vertrauen bereits auf SalonFlow.
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
            {[
              {
                name: 'Stefanie Müller',
                role: 'Inhaberin, Haarstudio Müller',
                location: 'Salzburg',
                quote: 'Seit wir SalonFlow nutzen, habe ich 2 Stunden pro Tag mehr Zeit. Meine Kunden lieben die einfache Online-Buchung!'
              },
              {
                name: 'Markus Huber',
                role: 'Geschäftsführer, Barber Shop Wien',
                location: 'Wien',
                quote: 'Endlich ein System, das in Österreich funktioniert! Die SMS-Erinnerungen haben unsere No-Show-Quote massiv reduziert.'
              },
              {
                name: 'Lisa Berger',
                role: 'Stylistin, Beauty Lounge Graz',
                location: 'Graz',
                quote: 'Die Einrichtung war kinderleicht und der Support ist erstklassig. Ich kann SalonFlow nur weiterempfehlen.'
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white rounded-2xl p-6 lg:p-8 shadow-sm border border-[#E5E0D8]">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-[#D4A574]" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-[#4A5D4C] leading-relaxed mb-6 text-lg">
                  "{testimonial.quote}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-[#8BA888]/20 rounded-full flex items-center justify-center">
                    <span className="text-[#8BA888] font-semibold">{testimonial.name.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-[#1E2D24]">{testimonial.name}</p>
                    <p className="text-sm text-[#6B6B6B]">{testimonial.role} · {testimonial.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32 bg-gradient-to-br from-[#8BA888] to-[#6B8A68] relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-40 h-40 bg-white rounded-full"></div>
          <div className="absolute bottom-10 right-10 w-60 h-60 bg-white rounded-full"></div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-white rounded-full"></div>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6">
            Bereit, Ihren Salon zu transformieren?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Starten Sie heute mit einer 14-tägigen kostenlosen Testphase. 
            Keine Kreditkarte erforderlich.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/login" className="bg-white text-[#4A5D4C] hover:bg-[#F8F6F2] px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-xl">
              Kostenlos testen
            </Link>
            <Link href="/book/demo-salon" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all">
              Demo ansehen
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1E2D24] text-white py-16">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-10 mb-12">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-[#8BA888] rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <span className="text-xl font-bold">SalonFlow</span>
              </div>
              <p className="text-[#8BA888] text-sm leading-relaxed">
                Das moderne Buchungssystem für österreichische Salons. 
                Einfach, effizient, zuverlässig.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Produkt</h4>
              <ul className="space-y-2 text-[#A8B8A9]">
                <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#how-it-works" className="hover:text-white transition-colors">So funktioniert's</a></li>
                <li><a href="#testimonials" className="hover:text-white transition-colors">Kundenstimmen</a></li>
                <li><Link href="/book/demo-salon" className="hover:text-white transition-colors">Demo</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Unternehmen</h4>
              <ul className="space-y-2 text-[#A8B8A9]">
                <li><a href="#" className="hover:text-white transition-colors">Über uns</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Karriere</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Kontakt</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Rechtliches</h4>
              <ul className="space-y-2 text-[#A8B8A9]">
                <li><a href="#" className="hover:text-white transition-colors">Impressum</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Datenschutz</a></li>
                <li><a href="#" className="hover:text-white transition-colors">AGB</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Cookie-Einstellungen</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-[#2A3A30] pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-[#6B7B6C] text-sm">
              © 2026 SalonFlow. Alle Rechte vorbehalten.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="w-10 h-10 bg-[#2A3A30] rounded-full flex items-center justify-center hover:bg-[#8BA888] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-[#2A3A30] rounded-full flex items-center justify-center hover:bg-[#8BA888] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
              </a>
              <a href="#" className="w-10 h-10 bg-[#2A3A30] rounded-full flex items-center justify-center hover:bg-[#8BA888] transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
