"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Store,
  MapPin,
  Star,
  Users,
  TrendingUp,
  ChevronRight,
  X,
  CheckCircle,
  ExternalLink,
  Award,
  Shield,
  Sparkles,
} from "lucide-react";

const CATEGORIES = [
  { value: "", label: "Alle Kategorien" },
  { value: "salon", label: "Salons" },
  { value: "barbershop", label: "Barbershops" },
  { value: "nails", label: "Nagelstudios" },
  { value: "cosmetics", label: "Kosmetik" },
];

interface Partner {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  logo_url: string | null;
  website: string | null;
  email: string;
  phone: string | null;
  city: string;
  country: string;
  category: string;
  commission_percent: number;
  referral_code: string;
  total_referrals: number;
  total_earnings_cents: number;
  status: string;
  featured: number;
  verified_at: string | null;
}

function PartnerCard({ partner }: { partner: Partner }) {
  const [imgError, setImgError] = useState(false);

  const initials = partner.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const gradientColors = [
    "from-cyan-500/20 to-purple-500/20",
    "from-purple-500/20 to-pink-500/20",
    "from-cyan-500/20 to-blue-500/20",
    "from-emerald-500/20 to-cyan-500/20",
    "from-violet-500/20 to-cyan-500/20",
    "from-amber-500/20 to-orange-500/20",
  ];

  const colorIndex = partner.name.charCodeAt(0) % gradientColors.length;
  const gradient = gradientColors[colorIndex];

  return (
    <div className="group relative bg-[#0a0a0f] border border-white/10 rounded-2xl overflow-hidden hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/5 hover:-translate-y-1">
      {/* Glow effect on hover */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

      {/* Featured badge */}
      {partner.featured === 1 && (
        <div className="absolute top-3 right-3 z-10 flex items-center gap-1 px-2.5 py-1 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full text-xs font-semibold text-white shadow-lg shadow-cyan-500/30">
          <Sparkles className="w-3 h-3" />
          Featured
        </div>
      )}

      <div className="relative p-6">
        {/* Logo / Avatar */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            {partner.logo_url && !imgError ? (
              <div className="w-14 h-14 rounded-xl bg-white/10 flex items-center justify-center overflow-hidden">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={partner.logo_url}
                  alt={partner.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgError(true)}
                />
              </div>
            ) : (
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradient} border border-white/10 flex items-center justify-center`}>
                <span className="text-lg font-bold text-white/90">{initials}</span>
              </div>
            )}
            {partner.verified_at && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-cyan-500 rounded-full flex items-center justify-center border-2 border-[#0a0a0f]">
                <CheckCircle className="w-3 h-3 text-black" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-white group-hover:text-cyan-400 transition-colors truncate">
              {partner.name}
            </h3>
            <div className="flex items-center gap-1 mt-1">
              <MapPin className="w-3.5 h-3.5 text-white/40" />
              <span className="text-sm text-white/50">{partner.city}</span>
              <span className="text-white/30 mx-1">·</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-white/5 text-white/60 border border-white/10 capitalize">
                {partner.category === "salon" ? "Salon" :
                 partner.category === "barbershop" ? "Barbershop" :
                 partner.category === "nails" ? "Nägel" : "Kosmetik"}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-white/60 leading-relaxed line-clamp-3 mb-5">
          {partner.description || "Premium-Partnersalon mit exzellentem Service."}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-3.5 h-3.5 text-cyan-400" />
              <span className="text-xs text-white/50">Referrals</span>
            </div>
            <p className="text-lg font-bold text-white">{partner.total_referrals}</p>
          </div>
          <div className="bg-white/5 rounded-xl p-3 border border-white/5">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-purple-400" />
              <span className="text-xs text-white/50">Provision</span>
            </div>
            <p className="text-lg font-bold text-white">{partner.commission_percent}%</p>
          </div>
        </div>

        {/* CTA */}
        <Link
          href={`/book/${partner.slug}`}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-white/10 hover:bg-cyan-500/20 text-white/90 hover:text-cyan-400 font-medium rounded-xl transition-all border border-white/10 hover:border-cyan-500/30 text-sm"
        >
          Termin buchen
          <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}

function ApplicationModal({
  open,
  onClose,
  referralCode,
}: {
  open: boolean;
  onClose: () => void;
  referralCode?: string;
}) {
  const [form, setForm] = useState({
    salon_name: "",
    contact_name: "",
    contact_email: "",
    contact_phone: "",
    website: "",
    message: "",
    referral_code: referralCode || "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Fehler beim Senden");
      }
      setSuccess(true);
      setTimeout(() => {
        onClose();
        setSuccess(false);
        setForm({ salon_name: "", contact_name: "", contact_email: "", contact_phone: "", website: "", message: "", referral_code: "" });
      }, 2000);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0d0d15] border border-white/10 rounded-2xl shadow-2xl shadow-cyan-500/10 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div>
            <h2 className="text-xl font-bold text-white">Partner werden</h2>
            <p className="text-sm text-white/50 mt-1">Werbe SalonFlow in deinem Salon</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {success ? (
          <div className="p-10 text-center">
            <div className="w-16 h-16 bg-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Anfrage gesendet!</h3>
            <p className="text-white/60">Wir melden uns innerhalb von 24 Stunden bei dir.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400">
                {error}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Salon Name *</label>
                <input
                  type="text"
                  required
                  value={form.salon_name}
                  onChange={(e) => setForm({ ...form, salon_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  placeholder="z.B. Hair & Beauty Studio"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Dein Name *</label>
                <input
                  type="text"
                  required
                  value={form.contact_name}
                  onChange={(e) => setForm({ ...form, contact_name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  placeholder="Max Mustermann"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">E-Mail *</label>
              <input
                type="email"
                required
                value={form.contact_email}
                onChange={(e) => setForm({ ...form, contact_email: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                placeholder="hallo@deinsalon.at"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Telefon</label>
                <input
                  type="tel"
                  value={form.contact_phone}
                  onChange={(e) => setForm({ ...form, contact_phone: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  placeholder="+43 660 123 4567"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-white/70 mb-1.5">Website</label>
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                  placeholder="https://deinsalon.at"
                />
              </div>
            </div>

            {form.referral_code && (
              <div className="flex items-center gap-2 p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-xl">
                <CheckCircle className="w-4 h-4 text-cyan-400 shrink-0" />
                <span className="text-sm text-cyan-400">
                  Empfohlen von Code: <span className="font-mono font-bold">{form.referral_code}</span>
                </span>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-white/70 mb-1.5">Nachricht (optional)</label>
              <textarea
                rows={3}
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                className="w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors resize-none"
                placeholder="Erzähl uns mehr über deinen Salon..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-gradient-to-r from-cyan-500 to-purple-500 hover:from-cyan-400 hover:to-purple-400 text-white font-semibold rounded-xl transition-all shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/30 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Wird gesendet..." : "Jetzt Partner werden"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchPartners();
  }, [category]);

  const fetchPartners = async () => {
    setLoading(true);
    try {
      const url = category
        ? `/api/marketplace?category=${category}`
        : "/api/marketplace";
      const res = await fetch(url);
      const data = await res.json();
      setPartners(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPartners = partners.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.city?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const featuredPartners = filteredPartners.filter((p) => p.featured === 1);
  const regularPartners = filteredPartners.filter((p) => p.featured !== 1);

  return (
    <div className="min-h-screen bg-[#050507]">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/5">
          <div className="absolute inset-0 bg-gradient-to-b from-cyan-500/5 via-transparent to-transparent" />
          <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-6">
                <Store className="w-3.5 h-3.5 text-cyan-400" />
                <span className="text-xs font-medium text-cyan-400">SalonFlow Partner Netzwerk</span>
              </div>

              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-6 tracking-tight">
                Unsere Partner-
                <span className="bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">Salons</span>
              </h1>
              <p className="text-lg text-white/60 leading-relaxed mb-10">
                Entdecke führende Salons in Österreich, die SalonFlow nutzen. Buche direkt online und profitiere von exklusiven Partner-Vorteilen.
              </p>

              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-cyan-500 to-purple-500 text-white font-semibold rounded-2xl hover:from-cyan-400 hover:to-purple-400 transition-all shadow-xl shadow-cyan-500/20 hover:shadow-cyan-500/30 hover:-translate-y-0.5"
              >
                <Award className="w-5 h-5" />
                Partner werden
              </button>
            </div>
          </div>
        </section>

        {/* Partner Grid */}
        <section className="py-16">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-10">
              {/* Search */}
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Salon oder Stadt suchen..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/20 transition-colors"
                />
                <svg
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              {/* Category filter */}
              <div className="flex gap-2 flex-wrap">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.value}
                    onClick={() => setCategory(cat.value)}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      category === cat.value
                        ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                        : "bg-white/5 text-white/60 border border-white/10 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {loading ? (
              <div className="flex items-center justify-center py-20">
                <div className="flex items-center gap-3 text-white/50">
                  <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                  <span>Lädt...</span>
                </div>
              </div>
            ) : filteredPartners.length === 0 ? (
              <div className="text-center py-20">
                <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Store className="w-8 h-8 text-white/30" />
                </div>
                <h3 className="text-lg font-semibold text-white/80 mb-2">Keine Salons gefunden</h3>
                <p className="text-white/50">Versuche eine andere Kategorie oder suchbegriff.</p>
              </div>
            ) : (
              <>
                {/* Featured */}
                {featuredPartners.length > 0 && (
                  <div className="mb-12">
                    <div className="flex items-center gap-3 mb-6">
                      <Sparkles className="w-5 h-5 text-cyan-400" />
                      <h2 className="text-xl font-bold text-white">Featured Partner</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredPartners.map((partner) => (
                        <PartnerCard key={partner.id} partner={partner} />
                      ))}
                    </div>
                  </div>
                )}

                {/* All Partners */}
                {regularPartners.length > 0 && (
                  <div>
                    <h2 className="text-xl font-bold text-white mb-6">Alle Partner</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {regularPartners.map((partner) => (
                        <PartnerCard key={partner.id} partner={partner} />
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </section>

        {/* Benefits CTA */}
        <section className="py-16 border-t border-white/5">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-cyan-500/10 via-purple-500/10 to-transparent border border-white/10 p-10 text-center">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5" />
              <div className="relative">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-full mb-4">
                  <Shield className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="text-xs font-medium text-cyan-400">Exklusiv für Partner</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                  Werde Teil des SalonFlow-Netzwerks
                </h2>
                <p className="text-white/60 max-w-xl mx-auto mb-8">
                  Als Partner erhältst du eine Provision für jeden neuen Salon, den du empiehlst. Keine Kosten, keine Verpflichtungen — nur Vorteile.
                </p>
                <div className="flex flex-wrap justify-center gap-6 mb-8">
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    <span>Bis zu 20% Provision</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    <span>Persönlicher Partner-Code</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/80">
                    <CheckCircle className="w-5 h-5 text-cyan-400" />
                    <span>Dedicated Support</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-2xl transition-all border border-white/20"
                >
                  Jetzt Partner werden
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <ApplicationModal open={showModal} onClose={() => setShowModal(false)} />
    </div>
  );
}
