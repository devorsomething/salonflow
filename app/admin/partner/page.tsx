"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  TrendingUp,
  Users,
  DollarSign,
  Copy,
  CheckCircle,
  ExternalLink,
  ChevronDown,
  ChevronRight,
  Star,
  Gift,
  ArrowUpRight,
  RefreshCw,
  X,
  Eye,
  Clock,
} from "lucide-react";

interface PartnerEarnings {
  pending_cents: number;
  paid_cents: number;
  total_cents: number;
}

interface Commission {
  id: string;
  partner_id: string;
  referred_salon_name: string | null;
  amount_cents: number;
  status: string;
  paid_at: string | null;
  created_at: string;
}

interface Partner {
  id: string;
  name: string;
  slug: string;
  referral_code: string;
  commission_percent: number;
  total_referrals: number;
  total_earnings_cents: number;
  status: string;
  featured: number;
  city: string | null;
  email: string;
  verified_at: string | null;
}

interface Application {
  id: string;
  salon_name: string;
  contact_name: string;
  contact_email: string;
  contact_phone: string | null;
  website: string | null;
  message: string | null;
  referral_code: string | null;
  status: string;
  created_at: string;
  processed_at: string | null;
}

function formatCents(cents: number): string {
  return (cents / 100).toFixed(2);
}

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem("salonflow_token");
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function postWithAuth(url: string, data: Record<string, unknown>) {
  const token = localStorage.getItem("salonflow_token");
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to create");
  return res.json();
}

async function patchWithAuth(url: string, data: Record<string, unknown>) {
  const token = localStorage.getItem("salonflow_token");
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(data),
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to update");
  return res.json();
}

function StatCard({
  icon: Icon,
  label,
  value,
  subtext,
  color,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  subtext?: string;
  color: "cyan" | "purple" | "green" | "amber";
}) {
  const colors = {
    cyan: "from-cyan-500/20 to-cyan-500/5 border-cyan-500/20",
    purple: "from-purple-500/20 to-purple-500/5 border-purple-500/20",
    green: "from-emerald-500/20 to-emerald-500/5 border-emerald-500/20",
    amber: "from-amber-500/20 to-amber-500/5 border-amber-500/20",
  };
  const iconColors = {
    cyan: "text-cyan-400",
    purple: "text-purple-400",
    green: "text-emerald-400",
    amber: "text-amber-400",
  };

  return (
    <div className={`relative overflow-hidden rounded-2xl bg-gradient-to-br ${colors[color]} border p-6`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-white/50 mb-1">{label}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
          {subtext && <p className="text-xs text-white/40 mt-1">{subtext}</p>}
        </div>
        <div className={`w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center ${iconColors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function ReferralCodeCard({ code }: { code: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const referralUrl = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${code}`
    : `/register?ref=${code}`;

  return (
    <div className="rounded-2xl bg-gradient-to-br from-cyan-500/10 to-purple-500/10 border border-white/10 p-6">
      <div className="flex items-center gap-3 mb-4">
        <Gift className="w-5 h-5 text-cyan-400" />
        <h3 className="text-lg font-bold text-white">Dein Partner-Code</h3>
      </div>
      <div className="flex items-center gap-3 mb-4">
        <div className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl">
          <p className="text-xl font-mono font-bold text-cyan-400 tracking-wider">{code}</p>
        </div>
        <button
          onClick={copy}
          className="p-3 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
          title="Copy"
        >
          {copied ? (
            <CheckCircle className="w-5 h-5 text-emerald-400" />
          ) : (
            <Copy className="w-5 h-5 text-white/60" />
          )}
        </button>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="text"
          readOnly
          value={referralUrl}
          className="flex-1 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm text-white/60 focus:outline-none"
        />
        <button
          onClick={async () => {
            await navigator.clipboard.writeText(referralUrl);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          }}
          className="p-2 bg-white/10 hover:bg-white/20 rounded-xl transition-colors border border-white/10"
        >
          <Copy className="w-4 h-4 text-white/60" />
        </button>
      </div>
      <p className="text-xs text-white/40 mt-3">
        Teile diesen Link: Jeder neue Salon, der sich über deinen Code registriert, bringt dir Provision.
      </p>
    </div>
  );
}

function CommissionRow({ commission }: { commission: Commission }) {
  const isPaid = commission.status === "paid";
  const isPending = commission.status === "pending";

  return (
    <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          isPaid ? "bg-emerald-500/20 text-emerald-400" :
          isPending ? "bg-amber-500/20 text-amber-400" :
          "bg-white/10 text-white/60"
        }`}>
          {isPaid ? <CheckCircle className="w-4 h-4" /> :
           isPending ? <Clock className="w-4 h-4" /> :
           <DollarSign className="w-4 h-4" />}
        </div>
        <div>
          <p className="font-medium text-white">
            {commission.referred_salon_name || "Neuer Salon"}
          </p>
          <p className="text-xs text-white/40">
            {new Date(commission.created_at).toLocaleDateString("de-AT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          isPaid ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30" :
          isPending ? "bg-amber-500/20 text-amber-400 border border-amber-500/30" :
          "bg-white/10 text-white/60 border border-white/10"
        }`}>
          {isPaid ? "Ausgezahlt" : isPending ? "Ausstehend" : commission.status}
        </span>
        <p className="font-bold text-white">
          €{formatCents(commission.amount_cents)}
        </p>
      </div>
    </div>
  );
}

function ApplicationRow({
  application,
  onProcess,
}: {
  application: Application;
  onProcess: (id: string, action: "approve" | "reject") => void;
}) {
  const isPending = application.status === "pending";

  return (
    <div className="flex items-start justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center mt-0.5">
          <Star className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <p className="font-medium text-white">{application.salon_name}</p>
          <p className="text-sm text-white/60">
            {application.contact_name} · {application.contact_email}
          </p>
          {application.message && (
            <p className="text-xs text-white/40 mt-1 italic">"{application.message}"</p>
          )}
          <p className="text-xs text-white/30 mt-1">
            {new Date(application.created_at).toLocaleDateString("de-AT", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {application.referral_code && (
          <span className="px-2 py-1 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-xs text-cyan-400 font-mono">
            {application.referral_code}
          </span>
        )}
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
          application.status === "pending"
            ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
            : application.status === "approved"
            ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
            : "bg-red-500/20 text-red-400 border border-red-500/30"
        }`}>
          {application.status === "pending" ? "Ausstehend" :
           application.status === "approved" ? "Genehmigt" : "Abgelehnt"}
        </span>
        {isPending && (
          <div className="flex gap-1 ml-2">
            <button
              onClick={() => onProcess(application.id, "approve")}
              className="p-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 rounded-lg transition-colors"
              title="Genehmigen"
            >
              <CheckCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => onProcess(application.id, "reject")}
              className="p-1.5 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg transition-colors"
              title="Ablehnen"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

type Tab = "overview" | "commissions" | "applications";

export default function AdminPartnerPage() {
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [partner, setPartner] = useState<Partner | null>(null);
  const [earnings, setEarnings] = useState<PartnerEarnings | null>(null);
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingApp, setProcessingApp] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      const token = localStorage.getItem("salonflow_token");
      if (!token) {
        window.location.href = "/login";
        return;
      }

      // For demo, we'll create/fetch a demo partner
      const partnerData = await fetchWithAuth("/api/partners/demo-partner-001");
      if (!partnerData || partnerData.error) {
        // Create demo partner if not exists
        try {
          const newPartner = await postWithAuth("/api/marketplace/partner", {
            name: "Demo Partner Salon",
            slug: "demo-partner-001",
            email: "partner@demo.at",
            referral_code: "DEMO2026",
            commission_percent: 20,
          });
          setPartner(newPartner);
        } catch {
          // Partner might already exist
        }
      } else {
        setPartner(partnerData);
      }

      // Load earnings summary
      try {
        const earningsData = await fetchWithAuth("/api/commissions/route?partner_id=demo-partner-001&summary=true");
        setEarnings(earningsData);
      } catch {
        // Commission data might not exist yet
      }

      // Load commissions
      try {
        const commissionsData = await fetchWithAuth("/api/commissions/route?partner_id=demo-partner-001");
        setCommissions(Array.isArray(commissionsData) ? commissionsData : []);
      } catch {
        setCommissions([]);
      }

      // Load applications
      try {
        const appsData = await fetchWithAuth("/api/marketplace?type=applications");
        setApplications(Array.isArray(appsData) ? appsData : []);
      } catch {
        setApplications([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleProcessApplication = async (id: string, action: "approve" | "reject") => {
    setProcessingApp(id);
    try {
      const status = action === "approve" ? "approved" : "rejected";
      await patchWithAuth(`/api/marketplace/${id}`, { status });
      setApplications((prev) =>
        prev.map((app) => (app.id === id ? { ...app, status } : app))
      );
    } catch (err) {
      console.error(err);
      alert("Fehler bei der Verarbeitung");
    } finally {
      setProcessingApp(null);
    }
  };

  const handleMarkPaid = async (commissionId: string) => {
    try {
      await patchWithAuth("/api/commissions", { commission_id: commissionId, action: "mark_paid" });
      setCommissions((prev) =>
        prev.map((c) => (c.id === commissionId ? { ...c, status: "paid" } : c))
      );
    } catch (err) {
      console.error(err);
    }
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "overview", label: "Übersicht", icon: TrendingUp },
    { id: "commissions", label: "Provisionen", icon: DollarSign },
    { id: "applications", label: "Bewerbungen", icon: Users },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-[#050507] flex items-center justify-center">
        <div className="flex items-center gap-3 text-white/50">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span>Lädt...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050507]">
      {/* Background */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl" />
      </div>

      <div className="relative">
        {/* Header */}
        <header className="border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-4">
                <Link href="/admin" className="text-white/50 hover:text-white transition-colors text-sm">
                  ← Admin
                </Link>
                <span className="text-white/20">|</span>
                <h1 className="text-white font-semibold">Partner Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={loadData}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                  title="Refresh"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
                <Link
                  href="/marketplace"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors border border-cyan-500/20"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Marketplace
                </Link>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex gap-1 -mb-px">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === tab.id
                      ? "text-cyan-400 border-cyan-400"
                      : "text-white/50 border-transparent hover:text-white/80"
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                  {tab.id === "applications" && applications.filter((a) => a.status === "pending").length > 0 && (
                    <span className="px-1.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs rounded-full border border-amber-500/30">
                      {applications.filter((a) => a.status === "pending").length}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-8">
              {/* Stats */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={DollarSign}
                  label="Gesamt verdient"
                  value={`€${formatCents(earnings?.total_cents || 0)}`}
                  subtext="Alle Provisionen"
                  color="cyan"
                />
                <StatCard
                  icon={CheckCircle}
                  label="Ausgezahlt"
                  value={`€${formatCents(earnings?.paid_cents || 0)}`}
                  subtext="Bereits erhalten"
                  color="green"
                />
                <StatCard
                  icon={Clock}
                  label="Ausstehend"
                  value={`€${formatCents(earnings?.pending_cents || 0)}`}
                  subtext="Nächste Auszahlung"
                  color="amber"
                />
                <StatCard
                  icon={Users}
                  label="Referrals"
                  value={String(partner?.total_referrals || 0)}
                  subtext="Neue Salons"
                  color="purple"
                />
              </div>

              {/* Referral Code */}
              <ReferralCodeCard code={partner?.referral_code || "DEMO2026"} />

              {/* How it works */}
              <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
                <h3 className="text-lg font-bold text-white mb-4">So funktioniert&apos;s</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {[
                    {
                      step: "01",
                      title: "Code teilen",
                      desc: "Gib deinen persönlichen Partner-Code an Salon-Betreiber weiter, die noch kein BookCut nutzen.",
                    },
                    {
                      step: "02",
                      title: "Salon meldet sich",
                      desc: "Der neue Salon registriert sich über deinen Code und wählt einen bezahlpflichtigen Plan.",
                    },
                    {
                      step: "03",
                      title: "Provision kassieren",
                      desc: "Du erhältst bis zu 20% der ersten Monatsgebühr des geworbenen Salons.",
                    },
                  ].map((item) => (
                    <div key={item.step} className="relative">
                      <div className="text-4xl font-bold text-white/10 mb-2">{item.step}</div>
                      <h4 className="font-semibold text-white mb-1">{item.title}</h4>
                      <p className="text-sm text-white/50 leading-relaxed">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Commissions Tab */}
          {activeTab === "commissions" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Deine Provisionen</h2>
                <div className="flex items-center gap-4 text-sm">
                  <span className="text-white/50">
                    Gesamt: <span className="text-white font-semibold">€{formatCents(earnings?.total_cents || 0)}</span>
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Ausgezahlt: €{formatCents(earnings?.paid_cents || 0)}
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Ausstehend: €{formatCents(earnings?.pending_cents || 0)}
                  </span>
                </div>
              </div>

              {commissions.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <DollarSign className="w-8 h-8 text-white/30" />
                  </div>
                  <h3 className="text-lg font-semibold text-white/80 mb-2">Noch keine Provisionen</h3>
                  <p className="text-white/50 text-sm">
                    Sobald sich Salons über deinen Code registrieren, erscheinen hier deine Provisionen.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {commissions.map((commission) => (
                    <CommissionRow key={commission.id} commission={commission} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Applications Tab */}
          {activeTab === "applications" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Partner-Bewerbungen</h2>
                <span className="text-sm text-white/50">
                  {applications.filter((a) => a.status === "pending").length} ausstehend
                </span>
              </div>

              {applications.length === 0 ? (
                <div className="text-center py-16">
                  <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-white/30" />
                  </div>
                  <h3 className="text-lg font-semibold text-white/80 mb-2">Keine Bewerbungen</h3>
                  <p className="text-white/50 text-sm">
                    Bewerbungen von Salons, die Partner werden möchten, erscheinen hier.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map((application) => (
                    <ApplicationRow
                      key={application.id}
                      application={application}
                      onProcess={handleProcessApplication}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
