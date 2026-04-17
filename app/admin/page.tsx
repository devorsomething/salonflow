"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  subDays,
  startOfDay,
} from "date-fns";
import { de } from "date-fns/locale";
import {
  Calendar,
  Users,
  Scissors,
  BarChart3,
  Plus,
  X,
  ChevronRight,
  Clock,
  Euro,
  Phone,
  Mail,
  CalendarDays,
  History,
  Edit2,
  Trash2,
  Bell,
  UserPlus,
  MapPin,
  Store,
  LayoutGrid,
  List,
  ChevronDown,
  TrendingUp,
  CalendarCheck,
  Box,
  CreditCard,
  Ticket,
  DollarSign,
  Package,
  AlertTriangle,
  ShoppingCart,
  Percent,
  Send,
  UsersRound,
} from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

type AppointmentStatus = "pending" | "confirmed" | "in_progress" | "completed" | "cancelled" | "no_show";

interface Appointment {
  id: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes: string | null;
  price_cents: number;
  customer_id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  service_name: string;
  service_id: string;
  duration_minutes: number;
  stylist_name: string;
  stylist_id: string;
}

interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  total_visits: number;
  last_visit_at: string | null;
  created_at: string;
}

interface Service {
  id: string;
  name: string;
  duration_min?: number;
  duration_minutes?: number;
  price_cents: number;
  category: string;
}

interface Salon {
  id: string;
  name: string;
  slug: string;
}

interface Stylist {
  id: string;
  name: string;
  active: number;
  avatar_url?: string | null;
}

interface Product {
  id: string;
  name: string;
  sku: string | null;
  description: string | null;
  price_cents: number;
  cost_cents: number;
  stock_quantity: number;
  low_stock_threshold: number;
  category: string;
  image_url: string | null;
  active: number;
}

interface Payment {
  id: string;
  customer_id: string | null;
  appointment_id: string | null;
  amount_cents: number;
  method: string;
  status: string;
  notes: string | null;
  created_at: string;
  customer_name?: string;
}

interface MembershipPlan {
  id: string;
  name: string;
  description: string | null;
  duration_days: number;
  price_cents: number;
  discount_percent: number;
  services_included: string | null;
  active: number;
}

interface CustomerMembership {
  id: string;
  customer_id: string;
  membership_id: string;
  start_date: string;
  end_date: string;
  status: string;
  auto_renew: number;
  membership_name?: string;
  benefits?: string;
  membership_price?: number;
  customer_name?: string;
  customer_phone?: string;
}

interface Coupon {
  id: string;
  code: string;
  discount_type: string;
  discount_value: number;
  min_order_cents: number;
  max_uses: number | null;
  used_count: number;
  valid_from: string | null;
  valid_until: string | null;
  active: number;
}

interface Campaign {
  id: string;
  name: string;
  type: string;
  target_segment: string;
  message: string;
  sent_count: number;
  opened_count: number;
  conversion_count: number;
  status: string;
  scheduled_at: string | null;
  sent_at: string | null;
}

interface Commission {
  id: string;
  stylist_id: string;
  service_id: string | null;
  commission_percent: number;
  stylist_name?: string;
  service_name?: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const STATUS_COLORS: Record<AppointmentStatus, string> = {
  pending: "bg-amber-100 text-amber-800",
  confirmed: "bg-sage-100 text-sage-800",
  in_progress: "bg-blue-100 text-blue-800",
  completed: "bg-sage-200 text-sage-900",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-800",
};

const STATUS_LABELS: Record<AppointmentStatus, string> = {
  pending: "Ausstehend",
  confirmed: "Bestätigt",
  in_progress: "In Bearbeitung",
  completed: "Abgeschlossen",
  cancelled: "Storniert",
  no_show: "Nicht erschienen",
};

// ============================================================================
// UTILS
// ============================================================================

async function fetchWithAuth(url: string) {
  const token = localStorage.getItem('salonflow_token');
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
  const token = localStorage.getItem('salonflow_token');
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
  const token = localStorage.getItem('salonflow_token');
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

async function deleteWithAuth(url: string) {
  const token = localStorage.getItem('salonflow_token');
  const res = await fetch(url, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to delete");
}

// ============================================================================
// COMPONENTS
// ============================================================================

function StatusBadge({ status, onChange }: { status: AppointmentStatus; onChange?: (status: AppointmentStatus) => void }) {
  const [open, setOpen] = useState(false);
  
  if (!onChange) {
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
        {STATUS_LABELS[status]}
      </span>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]} hover:opacity-80 transition-opacity`}
      >
        {STATUS_LABELS[status]}
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white rounded-lg shadow-lg border border-sand-200 py-1 min-w-[140px]">
            {(Object.keys(STATUS_LABELS) as AppointmentStatus[]).map((s) => (
              <button
                key={s}
                onClick={() => { onChange(s); setOpen(false); }}
                className={`w-full text-left px-3 py-1.5 text-xs hover:bg-sand-50 ${status === s ? 'font-medium' : ''}`}
              >
                <span className={`inline-flex items-center px-1.5 py-0.5 rounded-full ${STATUS_COLORS[s]}`}>
                  {STATUS_LABELS[s]}
                </span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function QuickActions({
  appointment,
  onUpdate,
  onViewCustomer,
}: {
  appointment: Appointment;
  onUpdate: (updated: Appointment) => void;
  onViewCustomer?: (customerId: string) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await patchWithAuth(`/api/appointments/${appointment.id}`, { status: "confirmed" });
      onUpdate({ ...appointment, status: "confirmed" });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    setLoading(true);
    try {
      await patchWithAuth(`/api/appointments/${appointment.id}`, { status: "cancelled" });
      onUpdate({ ...appointment, status: "cancelled" });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (appointment.status === "cancelled" || appointment.status === "completed") {
    return (
      <button
        onClick={() => onViewCustomer?.(appointment.customer_id)}
        className="px-3 py-1 text-xs font-medium rounded-md bg-sand-100 text-sand-700 hover:bg-sand-200 transition-colors"
      >
        Kunde anzeigen
      </button>
    );
  }

  return (
    <div className="flex gap-2">
      {appointment.status === "pending" && (
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="px-3 py-1 text-xs font-medium rounded-md bg-sage-500 text-white hover:bg-sage-600 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Bestätigen"}
        </button>
      )}
      <button
        onClick={handleCancel}
        disabled={loading}
        className="px-3 py-1 text-xs font-medium rounded-md bg-red-500 text-white hover:bg-red-600 disabled:opacity-50 transition-colors"
      >
        {loading ? "..." : "Stornieren"}
      </button>
    </div>
  );
}

function AppointmentCard({
  appointment,
  onUpdate,
  onViewCustomer,
}: {
  appointment: Appointment;
  onUpdate: (updated: Appointment) => void;
  onViewCustomer?: (customerId: string) => void;
}) {
  const start = parseISO(appointment.start_time);
  const end = parseISO(appointment.end_time);

  const handleStatusChange = async (newStatus: AppointmentStatus) => {
    try {
      await patchWithAuth(`/api/appointments/${appointment.id}`, { status: newStatus });
      onUpdate({ ...appointment, status: newStatus });
    } catch (e) {
      console.error(e);
      alert('Status konnte nicht geändert werden');
    }
  };

  return (
    <div className="bg-white rounded-lg border border-sand-200 p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sage-900">{format(start, "HH:mm")}</span>
            <span className="text-sand-400">—</span>
            <span className="text-sand-600">{format(end, "HH:mm")}</span>
          </div>
          <button
            onClick={() => onViewCustomer?.(appointment.customer_id)}
            className="font-medium text-gray-900 hover:text-sage-600 transition-colors"
          >
            {appointment.customer_name}
          </button>
          <p className="text-sm text-sand-600">{appointment.service_name}</p>
        </div>
        <StatusBadge status={appointment.status} onChange={handleStatusChange} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-sand-100">
        <div className="flex items-center gap-3">
          <span className="text-xs text-sand-500">{appointment.stylist_name}</span>
          <span className="text-xs text-sage-600 font-medium">
            {(appointment.price_cents / 100).toFixed(2)} €
          </span>
        </div>
        <QuickActions appointment={appointment} onUpdate={onUpdate} onViewCustomer={onViewCustomer} />
      </div>
    </div>
  );
}

function WeekCalendar({
  selectedDate,
  onSelectDate,
  appointments,
}: {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  appointments: Appointment[];
}) {
  const [view, setView] = useState<"week" | "list">("week");
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter((a) => isSameDay(parseISO(a.start_time), day));

  return (
    <div className="bg-white rounded-lg border border-sand-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setView("week")}
            className={`p-2 rounded-lg transition-colors ${view === "week" ? "bg-sage-100 text-sage-700" : "text-sand-500 hover:bg-sand-50"}`}
            title="Wochenansicht"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setView("list")}
            className={`p-2 rounded-lg transition-colors ${view === "list" ? "bg-sage-100 text-sage-700" : "text-sand-500 hover:bg-sand-50"}`}
            title="Listenansicht"
          >
            <List className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onSelectDate(addDays(selectedDate, -7))}
            className="p-1.5 text-sand-500 hover:bg-sand-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4 rotate-180" />
          </button>
          <span className="text-sm font-medium text-sage-900 min-w-[180px] text-center">
            {format(weekStart, "d. MMM", { locale: de })} - {format(addDays(weekStart, 6), "d. MMM yyyy", { locale: de })}
          </span>
          <button
            onClick={() => onSelectDate(addDays(selectedDate, 7))}
            className="p-1.5 text-sand-500 hover:bg-sand-100 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <button
          onClick={() => onSelectDate(new Date())}
          className="px-3 py-1 text-xs font-medium text-sage-600 hover:bg-sage-50 rounded-lg transition-colors"
        >
          Heute
        </button>
      </div>

      {view === "week" ? (
        <div className="grid grid-cols-7 gap-1">
          {days.map((day) => {
            const dayAppointments = getAppointmentsForDay(day);
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());

            return (
              <button
                key={day.toISOString()}
                onClick={() => onSelectDate(day)}
                className={`flex flex-col items-center p-2 rounded-lg transition-colors ${
                  isSelected ? "bg-sage-500 text-white" : isToday ? "bg-sage-100 text-sage-900" : "hover:bg-sand-50 text-gray-700"
                }`}
              >
                <span className="text-xs font-medium">{format(day, "EEE", { locale: de })}</span>
                <span className={`text-lg font-semibold ${isSelected ? "text-white" : ""}`}>{format(day, "d")}</span>
                <span
                  className={`text-xs mt-1 px-1.5 py-0.5 rounded-full ${
                    isSelected ? "bg-white/20 text-white" : dayAppointments.length > 0 ? "bg-sage-200 text-sage-800" : "text-transparent"
                  }`}
                >
                  {dayAppointments.length}
                </span>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-sand-100 max-h-64 overflow-y-auto">
          {appointments.length === 0 ? (
            <div className="p-4 text-center text-sand-500 text-sm">Keine Termine vorhanden</div>
          ) : (
            appointments
              .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
              .map((apt) => {
                const day = parseISO(apt.start_time);
                return (
                  <div
                    key={apt.id}
                    className="flex items-center gap-3 p-2 hover:bg-sand-50 transition-colors"
                  >
                    <div className={`w-16 text-center p-1.5 rounded-lg ${isSameDay(day, selectedDate) ? "bg-sage-100" : ""}`}>
                      <p className="text-xs font-medium text-sage-700">{format(day, "EEE", { locale: de })}</p>
                      <p className="text-sm font-semibold text-sage-900">{format(day, "d.")}</p>
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">{format(day, "HH:mm")} - {apt.customer_name}</p>
                      <p className="text-xs text-sand-500">{apt.service_name}</p>
                    </div>
                    <StatusBadge status={apt.status} />
                  </div>
                );
              })
          )}
        </div>
      )}
    </div>
  );
}

function CustomerList({
  customers,
  searchQuery,
  onSearchChange,
  onSelectCustomer,
  appointments,
}: {
  customers: Customer[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCustomer: (customer: Customer) => void;
  appointments?: Appointment[];
}) {
  const [debouncedQuery, setDebouncedQuery] = useState(searchQuery);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(debouncedQuery.toLowerCase()) ||
      c.phone.includes(debouncedQuery) ||
      (c.email && c.email.toLowerCase().includes(debouncedQuery.toLowerCase()))
  );

  const getCustomerAppointments = (customerId: string) => {
    if (!appointments) return [];
    return appointments
      .filter((a) => a.customer_id === customerId)
      .sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime());
  };

  return (
    <div className="bg-white rounded-lg border border-sand-200">
      <div className="p-4 border-b border-sand-200">
        <input
          type="text"
          placeholder="Kunde suchen..."
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 focus:border-transparent"
        />
      </div>
      <div className="divide-y divide-sand-100 max-h-[500px] overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sand-500 text-sm">
            {searchQuery ? "Keine Kunden gefunden" : "Keine Kunden vorhanden"}
          </div>
        ) : (
          filtered.map((customer) => {
            const isExpanded = expandedId === customer.id;
            const customerAppointments = getCustomerAppointments(customer.id);
            const totalSpent = customerAppointments.reduce((sum, a) => sum + a.price_cents, 0);

            return (
              <div key={customer.id}>
                <div
                  onClick={() => setExpandedId(isExpanded ? null : customer.id)}
                  className="p-4 flex items-center justify-between hover:bg-sand-50 transition-colors cursor-pointer"
                >
                  <div>
                    <p className="font-medium text-gray-900">{customer.name}</p>
                    <p className="text-xs text-sand-500">{customer.phone}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-sand-400 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                </div>
                {isExpanded && (
                  <div className="px-4 pb-4 bg-sand-50 border-t border-sand-100">
                    <div className="grid grid-cols-3 gap-3 mb-4 mt-3">
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-lg font-semibold text-sage-900">{customer.total_visits}</p>
                        <p className="text-xs text-sand-500">Besuche</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-lg font-semibold text-sage-900">{(totalSpent / 100).toFixed(0)}€</p>
                        <p className="text-xs text-sand-500">Ausgegeben</p>
                      </div>
                      <div className="bg-white rounded-lg p-3 text-center">
                        <p className="text-lg font-semibold text-sage-900">
                          {customer.last_visit_at ? format(parseISO(customer.last_visit_at), "dd.MM") : "–"}
                        </p>
                        <p className="text-xs text-sand-500">Letzter Besuch</p>
                      </div>
                    </div>
                    {customerAppointments.length > 0 ? (
                      <div>
                        <p className="text-xs font-medium text-sand-600 mb-2">Letzte Termine:</p>
                        <div className="space-y-2">
                          {customerAppointments.slice(0, 5).map((apt) => (
                            <div key={apt.id} className="flex items-center justify-between bg-white rounded-lg p-2">
                              <div>
                                <p className="text-sm font-medium text-gray-900">{apt.service_name}</p>
                                <p className="text-xs text-sand-500">{format(parseISO(apt.start_time), "dd. MMM yyyy, HH:mm")}</p>
                              </div>
                              <div className="text-right">
                                <StatusBadge status={apt.status} />
                                <p className="text-xs text-sage-600 mt-0.5">{(apt.price_cents / 100).toFixed(2)}€</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-sand-500 text-center py-2">Keine Termine vorhanden</p>
                    )}
                    <button
                      onClick={(e) => { e.stopPropagation(); onSelectCustomer(customer); }}
                      className="mt-3 w-full py-2 bg-sage-100 text-sage-700 text-xs font-medium rounded-lg hover:bg-sage-200 transition-colors"
                    >
                      Kunde anzeigen
                    </button>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function StylistsManagement({
  stylists,
  onUpdate,
  onDelete,
  onAdd,
}: {
  stylists: Stylist[];
  onUpdate: (stylist: Stylist) => void;
  onDelete: (id: string) => void;
  onAdd: (stylist: Stylist) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '' });
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');

  const handleEdit = (stylist: Stylist) => {
    setEditingId(stylist.id);
    setEditForm({ name: stylist.name });
  };

  const handleSave = async (id: string) => {
    try {
      const res = await fetch('/api/stylists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('salonflow_token')}` },
        body: JSON.stringify({ id, name: editForm.name }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.stylist as Stylist);
        setEditingId(null);
      }
    } catch (e) {
      console.error(e);
      alert('Stylist konnte nicht aktualisiert werden');
    }
  };

  const handleAdd = async () => {
    if (!newName.trim()) return;
    try {
      const res = await fetch('/api/stylists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('salonflow_token')}` },
        body: JSON.stringify({ name: newName }),
      });
      if (res.ok) {
        const data = await res.json();
        onAdd(data.stylist as Stylist);
        setNewName('');
        setShowAdd(false);
      }
    } catch (e) {
      console.error(e);
      alert('Stylist konnte nicht erstellt werden');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Stylist wirklich löschen?')) return;
    try {
      await fetch(`/api/stylists?id=${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('salonflow_token')}` },
      });
      onDelete(id);
    } catch (e) {
      console.error(e);
      alert('Stylist konnte nicht gelöscht werden');
    }
  };

  const handleToggleActive = async (id: string, currentActive: number) => {
    try {
      const res = await fetch('/api/stylists', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('salonflow_token')}` },
        body: JSON.stringify({ id, active: currentActive === 1 ? 0 : 1 }),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.stylist as Stylist);
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-sand-500">{stylists.length} Stylist{stylists.length !== 1 ? 'en' : ''}</p>
        </div>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-500 text-white text-xs font-medium rounded-lg hover:bg-sage-600 transition-colors"
        >
          <UserPlus className="w-3.5 h-3.5" />
          Neuer Stylist
        </button>
      </div>

      {showAdd && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-4">
          <p className="text-sm font-medium text-sage-900 mb-3">Neuen Stylisten hinzufügen</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Name eingeben..."
              className="flex-1 px-3 py-2 rounded-lg border border-sage-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            />
            <button
              onClick={handleAdd}
              className="px-4 py-2 bg-sage-500 text-white text-sm font-medium rounded-lg hover:bg-sage-600 transition-colors"
            >
              Hinzufügen
            </button>
            <button
              onClick={() => { setShowAdd(false); setNewName(''); }}
              className="px-3 py-2 bg-sand-200 text-sand-700 text-sm rounded-lg hover:bg-sand-300 transition-colors"
            >
              Abbrechen
            </button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-sand-200 overflow-hidden">
        {stylists.length === 0 ? (
          <div className="p-8 text-center text-sand-500 text-sm">
            Keine Stylisten vorhanden
          </div>
        ) : (
          <div className="divide-y divide-sand-100">
            {stylists.map((stylist) => (
              <div key={stylist.id} className="p-4">
                {editingId === stylist.id ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={editForm.name}
                      onChange={(e) => setEditForm({ name: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(stylist.id)}
                        className="px-3 py-1.5 bg-sage-500 text-white text-xs font-medium rounded-lg hover:bg-sage-600 transition-colors"
                      >
                        Speichern
                      </button>
                      <button
                        onClick={() => setEditingId(null)}
                        className="px-3 py-1.5 bg-sand-200 text-sand-700 text-xs font-medium rounded-lg hover:bg-sand-300 transition-colors"
                      >
                        Abbrechen
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-sage-100 rounded-full flex items-center justify-center">
                        <span className="text-sage-700 font-semibold">{stylist.name.charAt(0)}</span>
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{stylist.name}</p>
                        <span className={`text-xs ${stylist.active === 1 ? 'text-sage-600' : 'text-red-500'}`}>
                          {stylist.active === 1 ? 'Aktiv' : 'Inaktiv'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleActive(stylist.id, stylist.active)}
                        className={`px-2 py-1 text-xs rounded-md transition-colors ${stylist.active === 1 ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : 'bg-sage-100 text-sage-700 hover:bg-sage-200'}`}
                        title={stylist.active === 1 ? 'Deaktivieren' : 'Aktivieren'}
                      >
                        {stylist.active === 1 ? 'Deaktivieren' : 'Aktivieren'}
                      </button>
                      <button
                        onClick={() => handleEdit(stylist)}
                        className="p-1.5 text-sand-500 hover:bg-sand-100 rounded-lg transition-colors"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(stylist.id)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Settings Panel
function SettingsPanel({ salon, onUpdate }: { salon: any; onUpdate: (s: any) => void }) {
  const [form, setForm] = useState({
    name: salon?.name || '',
    phone: salon?.phone || '',
    email: salon?.email || '',
    address: salon?.address || '',
    city: salon?.city || '',
    description: salon?.description || '',
    business_hours: salon?.business_hours || '',
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch('/api/salon/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('salonflow_token')}` },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        onUpdate(data.salon);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        alert('Fehler beim Speichern');
      }
    } catch (e) {
      console.error(e);
      alert('Fehler beim Speichern');
    } finally {
      setSaving(false);
    }
  };

  const field = (key: keyof typeof form, label: string, icon: React.ReactNode, placeholder: string, type = 'text') => (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-sand-600 mb-1.5">
        {icon}
        {label}
      </label>
      <input
        type={type}
        value={form[key]}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        placeholder={placeholder}
        className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
      />
    </div>
  );

  return (
    <div className="space-y-6 max-w-xl">
      <div className="bg-white rounded-lg border border-sand-200 p-6">
        <h3 className="font-semibold text-sage-900 mb-1">Salon-Informationen</h3>
        <p className="text-xs text-sand-500 mb-5">Basisdaten Ihres Salons</p>
        <div className="space-y-4">
          {field('name', 'Salonname', <Store className="w-3.5 h-3.5" />, 'z.B. Friseur Meisterstück')}
          {field('phone', 'Telefon', <Phone className="w-3.5 h-3.5" />, '+43 1 234 5678')}
          {field('email', 'E-Mail', <Mail className="w-3.5 h-3.5" />, 'info@salon.at', 'email')}
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-sand-600 mb-1.5">
              <MapPin className="w-3.5 h-3.5" />
              Adresse
            </label>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Straße, Nr."
                className="px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
              <input
                type="text"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Stadt"
                className="px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-medium text-sand-600 mb-1.5">
              <Store className="w-3.5 h-3.5" />
              Beschreibung
            </label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              placeholder="Kurze Beschreibung Ihres Salons..."
              className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none"
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg border border-sand-200 p-6">
        <h3 className="font-semibold text-sage-900 mb-1">Öffnungszeiten</h3>
        <p className="text-xs text-sand-500 mb-5">Wann ist Ihr Salon geöffnet?</p>
        <input
          type="text"
          value={form.business_hours}
          onChange={(e) => setForm({ ...form, business_hours: e.target.value })}
          placeholder="z.B. Mo-Fr: 9:00-18:00, Sa: 9:00-14:00"
          className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
        />
        <p className="text-xs text-sand-400 mt-2">Format: Wochentag: Start-Ende, durch Komma getrennt</p>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-6 py-2.5 bg-sage-500 text-white font-medium rounded-lg hover:bg-sage-600 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Speichern...' : 'Änderungen speichern'}
        </button>
        {saved && (
          <span className="text-sm text-sage-600 font-medium flex items-center gap-1">
            <svg className="w-4 h-4 text-sage-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            Gespeichert
          </span>
        )}
      </div>
    </div>
  );
}
function AnalyticsBar({ label, value, max, color }: { label: string; value: number; max: number; color: string }) {
  const percentage = max > 0 ? (value / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-sand-600 w-20">{label}</span>
      <div className="flex-1 h-4 bg-sand-100 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-500`} style={{ width: `${percentage}%` }} />
      </div>
      <span className="text-xs font-medium text-sage-700 w-8 text-right">{value}</span>
    </div>
  );
}

// ============================================================================
// MODALS
// ============================================================================

function AddAppointmentModal({
  isOpen,
  onClose,
  customers,
  services,
  stylists,
  selectedDate,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  services: Service[];
  stylists: Stylist[];
  selectedDate: Date;
  onSuccess: (apt: Appointment) => void;
}) {
  const [formData, setFormData] = useState({
    customer_id: "",
    service_id: "",
    stylist_id: "",
    date: format(selectedDate, "yyyy-MM-dd"),
    time: "10:00",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) => ({
      ...prev,
      stylist_id: prev.stylist_id || stylists[0]?.id || "",
      date: format(selectedDate, "yyyy-MM-dd"),
    }));
  }, [isOpen, selectedDate, stylists]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const service = services.find((s) => s.id === formData.service_id);
      const customer = customers.find((c) => c.id === formData.customer_id);
      const start_time = `${formData.date}T${formData.time}:00`;
      const endTime = new Date(`${formData.date}T${formData.time}:00`);
      endTime.setMinutes(endTime.getMinutes() + (service?.duration_minutes || service?.duration_min || 60));
      const end_time = endTime.toISOString().slice(0, 19);

      const result = await postWithAuth("/api/appointments", {
        customer_id: formData.customer_id,
        service_id: formData.service_id,
        stylist_id: formData.stylist_id,
        start_time,
        end_time,
        customer_name: customer?.name,
        customer_phone: customer?.phone,
        customer_email: customer?.email,
        notes: formData.notes || null,
        status: "pending",
      });
      onSuccess(result);
      onClose();
      setFormData({ customer_id: "", service_id: "", stylist_id: stylists[0]?.id || "", date: format(selectedDate, "yyyy-MM-dd"), time: "10:00", notes: "" });
    } catch (e) {
      console.error(e);
      alert("Termin konnte nicht erstellt werden");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-sand-200">
          <h2 className="text-lg font-semibold text-sage-900">Neuen Termin erstellen</h2>
          <button onClick={onClose} className="p-1 hover:bg-sand-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-sand-500" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-medium text-sand-600 mb-1">Kunde</label>
            <select
              required
              value={formData.customer_id}
              onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="">Kunde auswählen...</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name} ({c.phone})</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-sand-600 mb-1">Service</label>
            <select
              required
              value={formData.service_id}
              onChange={(e) => setFormData({ ...formData, service_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="">Service auswählen...</option>
              {services.map((s) => (
                <option key={s.id} value={s.id}>{s.name} ({(s.price_cents / 100).toFixed(2)} €)</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-sand-600 mb-1">Stylist</label>
            <select
              required
              value={formData.stylist_id}
              onChange={(e) => setFormData({ ...formData, stylist_id: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
            >
              <option value="">Stylist auswählen...</option>
              {stylists.map((s) => (
                <option key={s.id} value={s.id}>{s.name}</option>
              ))}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-sand-600 mb-1">Datum</label>
              <input
                type="date"
                required
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-sand-600 mb-1">Uhrzeit</label>
              <input
                type="time"
                required
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-sand-600 mb-1">Notizen</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500 resize-none"
              placeholder="Optional..."
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 disabled:opacity-50 transition-colors"
          >
            {loading ? "Erstellen..." : "Termin erstellen"}
          </button>
        </form>
      </div>
    </div>
  );
}

function CustomerDetailModal({
  customer,
  isOpen,
  onClose,
  appointments,
}: {
  customer: Customer | null;
  isOpen: boolean;
  onClose: () => void;
  appointments: Appointment[];
}) {
  if (!isOpen || !customer) return null;

  const customerAppointments = appointments
    .filter((a) => a.customer_id === customer.id)
    .sort((a, b) => parseISO(b.start_time).getTime() - parseISO(a.start_time).getTime());

  const totalSpent = customerAppointments.reduce((sum, a) => sum + a.price_cents, 0);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-4 border-b border-sand-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-sage-900">Kundendetails</h2>
          <button onClick={onClose} className="p-1 hover:bg-sand-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-sand-500" />
          </button>
        </div>
        <div className="p-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center">
              <span className="text-2xl font-semibold text-sage-600">
                {(customer.name || "").split(" ").map((n) => n[0]).join("").slice(0, 2)}
              </span>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900">{customer.name}</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1 text-xs text-sand-500">
                  <Phone className="w-3 h-3" /> {customer.phone}
                </span>
                {customer.email && (
                  <span className="flex items-center gap-1 text-xs text-sand-500">
                    <Mail className="w-3 h-3" /> {customer.email}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mb-6">
            <div className="bg-sand-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold text-sage-900">{customer.total_visits}</p>
              <p className="text-xs text-sand-500">Besuche</p>
            </div>
            <div className="bg-sand-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold text-sage-900">{(totalSpent / 100).toFixed(0)}</p>
              <p className="text-xs text-sand-500">Ausgegeben (€)</p>
            </div>
            <div className="bg-sand-50 rounded-lg p-3 text-center">
              <p className="text-2xl font-semibold text-sage-900">
                {customer.last_visit_at ? format(parseISO(customer.last_visit_at), "dd.MM") : "–"}
              </p>
              <p className="text-xs text-sand-500">Letzter Besuch</p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-3">
              <History className="w-4 h-4 text-sage-500" />
              <h4 className="font-medium text-gray-900">Terminhistorie</h4>
            </div>
            {customerAppointments.length === 0 ? (
              <p className="text-sm text-sand-500 text-center py-4">Keine Termine vorhanden</p>
            ) : (
              <div className="space-y-2">
                {customerAppointments.slice(0, 10).map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between p-3 bg-sand-50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{apt.service_name}</p>
                      <p className="text-xs text-sand-500">
                        {format(parseISO(apt.start_time), "dd. MMM yyyy, HH:mm")}
                      </p>
                    </div>
                    <div className="text-right">
                      <StatusBadge status={apt.status} />
                      <p className="text-xs text-sage-600 mt-1">{(apt.price_cents / 100).toFixed(2)} €</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ServicesManagement({
  services,
  onUpdate,
  onDelete,
}: {
  services: Service[];
  onUpdate: (service: Service) => void;
  onDelete: (id: string) => void;
}) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: "", price: "", duration: "" });

  const handleEdit = (service: Service) => {
    setEditingId(service.id);
    setEditForm({
      name: service.name,
      price: (service.price_cents / 100).toFixed(2),
      duration: (service.duration_minutes ?? service.duration_min ?? 0).toString(),
    });
  };

  const handleSave = async (id: string) => {
    try {
      await patchWithAuth(`/api/services/${id}`, {
        name: editForm.name,
        price_cents: Math.round(parseFloat(editForm.price) * 100),
        duration_min: parseInt(editForm.duration),
      });
      onUpdate({ ...services.find((s) => s.id === id)!, name: editForm.name, price_cents: Math.round(parseFloat(editForm.price) * 100), duration_min: parseInt(editForm.duration) });
      setEditingId(null);
    } catch (e) {
      console.error(e);
      alert("Service konnte nicht aktualisiert werden");
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Service wirklich löschen?")) return;
    try {
      await deleteWithAuth(`/api/services/${id}`);
      onDelete(id);
    } catch (e) {
      console.error(e);
      alert("Service konnte nicht gelöscht werden");
    }
  };

  return (
    <div className="bg-white rounded-lg border border-sand-200">
      <div className="p-4 border-b border-sand-200">
        <h3 className="font-semibold text-sage-900">Services verwalten</h3>
        <p className="text-xs text-sand-500">Preise und Dauer bearbeiten</p>
      </div>
      <div className="divide-y divide-sand-100">
        {services.map((service) => (
          <div key={service.id} className="p-4">
            {editingId === service.id ? (
              <div className="space-y-3">
                <input
                  type="text"
                  value={editForm.name}
                  onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    step="0.01"
                    value={editForm.price}
                    onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                    placeholder="Preis (€)"
                  />
                  <input
                    type="number"
                    value={editForm.duration}
                    onChange={(e) => setEditForm({ ...editForm, duration: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-sand-200 text-sm focus:outline-none focus:ring-2 focus:ring-sage-500"
                    placeholder="Dauer (Min)"
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(service.id)}
                    className="px-3 py-1.5 bg-sage-500 text-white text-xs font-medium rounded-lg hover:bg-sage-600 transition-colors"
                  >
                    Speichern
                  </button>
                  <button
                    onClick={() => setEditingId(null)}
                    className="px-3 py-1.5 bg-sand-200 text-sand-700 text-xs font-medium rounded-lg hover:bg-sand-300 transition-colors"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{service.name}</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="flex items-center gap-1 text-xs text-sage-600">
                      <Euro className="w-3 h-3" /> {(service.price_cents / 100).toFixed(2)}
                    </span>
                    <span className="flex items-center gap-1 text-xs text-sand-500">
                      <Clock className="w-3 h-3" /> {service.duration_minutes ?? service.duration_min ?? 0} Min
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(service)}
                    className="p-1.5 text-sand-500 hover:bg-sand-100 rounded-lg transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(service.id)}
                    className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// INVENTORY TAB (Lager)
// ============================================================================

function InventoryTab({ products, onUpdate }: { products: Product[]; onUpdate: (products: Product[]) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', sku: '', price: '', cost: '', stock: '', threshold: '', category: '' });
  const [newForm, setNewForm] = useState({ name: '', sku: '', price: '', cost: '', stock: '', threshold: '', category: 'other' });

  const lowStockProducts = products.filter(p => p.stock_quantity <= p.low_stock_threshold);

  const handleAdd = async () => {
    if (!newForm.name || !newForm.price) { alert('Name und Preis erforderlich'); return; }
    try {
      const res = await postWithAuth('/api/products', {
        name: newForm.name,
        sku: newForm.sku || null,
        price_cents: Math.round(parseFloat(newForm.price) * 100),
        cost_cents: Math.round(parseFloat(newForm.cost || '0') * 100),
        stock_quantity: parseInt(newForm.stock || '0'),
        low_stock_threshold: parseInt(newForm.threshold || '10'),
        category: newForm.category,
      });
      onUpdate([...(products || []), res.product as Product]);
      setNewForm({ name: '', sku: '', price: '', cost: '', stock: '', threshold: '', category: 'other' });
      setShowAdd(false);
    } catch (e) { console.error(e); alert('Fehler beim Hinzufügen'); }
  };

  const handleEdit = (p: Product) => {
    setEditingId(p.id);
    setEditForm({ name: p.name, sku: p.sku || '', price: (p.price_cents / 100).toFixed(2), cost: (p.cost_cents / 100).toFixed(2), stock: p.stock_quantity.toString(), threshold: p.low_stock_threshold.toString(), category: p.category });
  };

  const handleSave = async (id: string) => {
    try {
      const res = await patchWithAuth(`/api/products/${id}`, {
        name: editForm.name,
        sku: editForm.sku || null,
        price_cents: Math.round(parseFloat(editForm.price) * 100),
        cost_cents: Math.round(parseFloat(editForm.cost || '0') * 100),
        stock_quantity: parseInt(editForm.stock),
        low_stock_threshold: parseInt(editForm.threshold || '10'),
        category: editForm.category,
      });
      onUpdate(products.map(p => p.id === id ? { ...p, ...res.product } : p));
      setEditingId(null);
    } catch (e) { console.error(e); alert('Fehler beim Speichern'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Produkt wirklich löschen?')) return;
    try {
      await deleteWithAuth(`/api/products/${id}`);
      onUpdate(products.filter(p => p.id !== id));
    } catch (e) { console.error(e); alert('Fehler beim Löschen'); }
  };

  return (
    <div className="space-y-6">
      {lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-red-500" />
          <p className="text-sm text-red-700">{lowStockProducts.length} Produkt{lowStockProducts.length !== 1 ? 'e' : ''} haben niedrigen Bestand</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-sage-900">Lager - Produkte</h2>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-500 text-white text-xs font-medium rounded-lg hover:bg-sage-600">
          <Plus className="w-4 h-4" /> Neues Produkt
        </button>
      </div>

      {showAdd && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-4">
          <p className="text-sm font-medium text-sage-900 mb-3">Neues Produkt hinzufügen</p>
          <div className="grid grid-cols-4 gap-3">
            <input placeholder="Name" value={newForm.name} onChange={e => setNewForm({ ...newForm, name: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="SKU" value={newForm.sku} onChange={e => setNewForm({ ...newForm, sku: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="Preis (€)" type="number" step="0.01" value={newForm.price} onChange={e => setNewForm({ ...newForm, price: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="Kosten (€)" type="number" step="0.01" value={newForm.cost} onChange={e => setNewForm({ ...newForm, cost: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="Bestand" type="number" value={newForm.stock} onChange={e => setNewForm({ ...newForm, stock: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="Mindestbestand" type="number" value={newForm.threshold} onChange={e => setNewForm({ ...newForm, threshold: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <select value={newForm.category} onChange={e => setNewForm({ ...newForm, category: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm">
              <option value="other">Andere</option>
              <option value="care">Pflege</option>
              <option value="styling">Styling</option>
              <option value="color">Farbe</option>
            </select>
            <button onClick={handleAdd} className="px-4 py-2 bg-sage-500 text-white text-sm font-medium rounded-lg hover:bg-sage-600">Hinzufügen</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {(products || []).map(p => (
          <div key={p.id} className="bg-white rounded-lg border border-sand-200 p-4">
            {editingId === p.id ? (
              <div className="space-y-2">
                <input value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className="w-full px-2 py-1 rounded border text-sm" />
                <div className="grid grid-cols-2 gap-2">
                  <input placeholder="Preis" type="number" step="0.01" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className="px-2 py-1 rounded border text-sm" />
                  <input placeholder="Kosten" type="number" step="0.01" value={editForm.cost} onChange={e => setEditForm({ ...editForm, cost: e.target.value })} className="px-2 py-1 rounded border text-sm" />
                  <input placeholder="Bestand" type="number" value={editForm.stock} onChange={e => setEditForm({ ...editForm, stock: e.target.value })} className="px-2 py-1 rounded border text-sm" />
                  <input placeholder="Schwelle" type="number" value={editForm.threshold} onChange={e => setEditForm({ ...editForm, threshold: e.target.value })} className="px-2 py-1 rounded border text-sm" />
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleSave(p.id)} className="px-3 py-1 bg-sage-500 text-white text-xs rounded">Speichern</button>
                  <button onClick={() => setEditingId(null)} className="px-3 py-1 bg-sand-200 text-sand-700 text-xs rounded">Abbrechen</button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900">{p.name}</p>
                    {p.sku && <p className="text-xs text-sand-500">SKU: {p.sku}</p>}
                  </div>
                  {p.stock_quantity <= p.low_stock_threshold && (
                    <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">Niedrig</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-sm text-sand-600 mb-3">
                  <span>{(p.price_cents / 100).toFixed(2)} €</span>
                  <span>Bestand: {p.stock_quantity}</span>
                  <span className="capitalize">{p.category}</span>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => handleEdit(p)} className="flex-1 px-2 py-1 text-xs bg-sand-100 text-sand-700 rounded hover:bg-sand-200">Bearbeiten</button>
                  <button onClick={() => handleDelete(p.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">Löschen</button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// POS TAB
// ============================================================================

function POSTab({ services, stylists, customers, payments, onPayment }: { services: Service[]; stylists: Stylist[]; customers: Customer[]; payments: Payment[]; onPayment: (p: Payment[]) => void }) {
  const [selectedService, setSelectedService] = useState('');
  const [selectedStylist, setSelectedStylist] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const service = services.find(s => s.id === selectedService);
  const price = service ? service.price_cents / 100 : 0;

  const handleSale = async () => {
    if (!selectedService) { alert('Bitte Service auswählen'); return; }
    setLoading(true);
    try {
      const customer = customers.find(c => c.phone === customerPhone);
      const res = await postWithAuth('/api/payments', {
        customer_id: customer?.id,
        amount_cents: service!.price_cents,
        method: 'cash',
        status: 'completed',
      });
      const newPayment = { ...res.payment, customer_name: customer?.name } as Payment;
      onPayment([newPayment, ...payments]);
      setSelectedService('');
      setCustomerPhone('');
      alert(`Zahlung über ${price.toFixed(2)} € erfasst!`);
    } catch (e) { console.error(e); alert('Fehler bei der Zahlung'); }
    finally { setLoading(false); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-sage-900">POS - Kasse</h2>

      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white rounded-lg border border-sand-200 p-6 space-y-4">
          <h3 className="font-medium text-gray-900">Schnellverkauf</h3>
          <div>
            <label className="block text-xs font-medium text-sand-600 mb-1">Service</label>
            <select value={selectedService} onChange={e => setSelectedService(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-sand-200">
              <option value="">Service auswählen...</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name} ({(s.price_cents / 100).toFixed(2)} €)</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-sand-600 mb-1">Stylist</label>
            <select value={selectedStylist} onChange={e => setSelectedStylist(e.target.value)} className="w-full px-3 py-2 rounded-lg border border-sand-200">
              <option value="">Stylist auswählen...</option>
              {stylists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-sand-600 mb-1">Kunden-Telefon (optional)</label>
            <input type="tel" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="+43 660 123 4567" className="w-full px-3 py-2 rounded-lg border border-sand-200" />
          </div>
          {service && (
            <div className="bg-sage-50 rounded-lg p-4 text-center">
              <p className="text-3xl font-semibold text-sage-900">{price.toFixed(2)} €</p>
            </div>
          )}
          <button onClick={handleSale} disabled={loading || !selectedService} className="w-full py-3 bg-sage-500 text-white font-medium rounded-lg hover:bg-sage-600 disabled:opacity-50">
            {loading ? 'Verarbeite...' : 'Kasse'}
          </button>
        </div>

        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <h3 className="font-medium text-gray-900 mb-4">Letzte Zahlungen</h3>
          <div className="space-y-3 max-h-80 overflow-y-auto">
            {payments.slice(0, 5).map(p => (
              <div key={p.id} className="flex items-center justify-between p-3 bg-sand-50 rounded-lg">
                <div>
                  <p className="text-sm font-medium text-gray-900">{p.customer_name || 'Gast'}</p>
                  <p className="text-xs text-sand-500">{format(parseISO(p.created_at), 'dd.MM HH:mm')}</p>
                </div>
                <span className="font-medium text-sage-700">{(p.amount_cents / 100).toFixed(2)} €</span>
              </div>
            ))}
            {payments.length === 0 && <p className="text-sm text-sand-500 text-center py-4">Keine Zahlungen</p>}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MEMBERSHIPS TAB
// ============================================================================

function MembershipsTab({ plans, memberships, customers, onUpdatePlans, onUpdateMemberships }: {
  plans: MembershipPlan[]; memberships: CustomerMembership[]; customers: Customer[];
  onUpdatePlans: (p: MembershipPlan[]) => void; onUpdateMemberships: (m: CustomerMembership[]) => void;
}) {
  const [showAddPlan, setShowAddPlan] = useState(false);
  const [newPlan, setNewPlan] = useState({ name: '', description: '', price: '', days: '', discount: '' });

  const monthlyRevenue = memberships.filter(m => m.status === 'active').reduce((sum, m) => {
    const plan = plans.find(p => p.id === m.membership_id);
    return sum + (plan ? plan.price_cents : 0);
  }, 0) / 100;

  const handleAddPlan = async () => {
    if (!newPlan.name || !newPlan.price) { alert('Name und Preis erforderlich'); return; }
    try {
      const res = await postWithAuth('/api/memberships/plans', {
        name: newPlan.name,
        description: newPlan.description || null,
        price_cents: Math.round(parseFloat(newPlan.price) * 100),
        duration_days: parseInt(newPlan.days || '30'),
        discount_percent: parseInt(newPlan.discount || '0'),
      });
      onUpdatePlans([...(plans || []), res.plan as MembershipPlan]);
      setNewPlan({ name: '', description: '', price: '', days: '', discount: '' });
      setShowAddPlan(false);
    } catch (e) { console.error(e); alert('Fehler beim Erstellen'); }
  };

  const handleCancelMembership = async (id: string) => {
    if (!confirm('Mitgliedschaft wirklich kündigen?')) return;
    try {
      await patchWithAuth(`/api/customer-memberships/${id}`, { status: 'cancelled' });
      onUpdateMemberships(memberships.map(m => m.id === id ? { ...m, status: 'cancelled' } : m));
    } catch (e) { console.error(e); alert('Fehler'); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-sage-900">Mitgliedschaften</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Aktive Mitgliedschaften</p>
          <p className="text-3xl font-semibold text-sage-900">{memberships.filter(m => m.status === 'active').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Monatlicher Umsatz</p>
          <p className="text-3xl font-semibold text-sage-900">{monthlyRevenue.toFixed(2)} €</p>
        </div>
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Pläne</p>
          <p className="text-3xl font-semibold text-sage-900">{plans.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Verfügbare Pläne</h3>
        <button onClick={() => setShowAddPlan(!showAddPlan)} className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-500 text-white text-xs font-medium rounded-lg">
          <Plus className="w-4 h-4" /> Neuer Plan
        </button>
      </div>

      {showAddPlan && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-4">
          <div className="grid grid-cols-5 gap-3">
            <input placeholder="Name" value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="Beschreibung" value={newPlan.description} onChange={e => setNewPlan({ ...newPlan, description: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="Preis (€)" type="number" step="0.01" value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="Tage" type="number" value={newPlan.days} onChange={e => setNewPlan({ ...newPlan, days: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <button onClick={handleAddPlan} className="px-4 py-2 bg-sage-500 text-white text-sm font-medium rounded-lg">Erstellen</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {plans.map(plan => (
          <div key={plan.id} className="bg-white rounded-lg border border-sand-200 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="font-medium text-gray-900">{plan.name}</p>
              <span className="text-lg font-semibold text-sage-700">{(plan.price_cents / 100).toFixed(2)} €</span>
            </div>
            <p className="text-sm text-sand-600 mb-2">{plan.description}</p>
            <div className="flex items-center gap-4 text-xs text-sand-500">
              <span>{plan.duration_days} Tage</span>
              {plan.discount_percent > 0 && <span>{plan.discount_percent}% Rabatt</span>}
            </div>
          </div>
        ))}
      </div>

      <h3 className="font-medium text-gray-900">Aktive Abonnements</h3>
      <div className="bg-white rounded-lg border border-sand-200 overflow-hidden">
        {memberships.length === 0 ? (
          <p className="p-8 text-center text-sand-500">Keine Mitgliedschaften</p>
        ) : (
          <div className="divide-y divide-sand-100">
            {memberships.map(m => (
              <div key={m.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-gray-900">{m.customer_name || m.customer_id}</p>
                  <p className="text-sm text-sage-600">{m.membership_name}</p>
                  <p className="text-xs text-sand-500">Gültig bis: {format(parseISO(m.end_date || new Date().toISOString()), 'dd.MM.yyyy')}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-2 py-0.5 text-xs rounded-full ${m.status === 'active' ? 'bg-sage-100 text-sage-700' : 'bg-red-100 text-red-700'}`}>{m.status}</span>
                  {m.status === 'active' && <button onClick={() => handleCancelMembership(m.id)} className="px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">Kündigen</button>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// COUPONS TAB
// ============================================================================

function CouponsTab({ coupons, onUpdate }: { coupons: Coupon[]; onUpdate: (c: Coupon[]) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCoupon, setNewCoupon] = useState({ code: '', type: 'percent', value: '', minorder: '', maxuses: '', validfrom: '', validuntil: '' });

  const thisMonthUsage = coupons.reduce((sum, c) => sum + c.used_count, 0);

  const handleAdd = async () => {
    if (!newCoupon.code || !newCoupon.value) { alert('Code und Wert erforderlich'); return; }
    try {
      const res = await postWithAuth('/api/coupons', {
        code: newCoupon.code,
        discount_type: newCoupon.type,
        discount_value: parseInt(newCoupon.value),
        min_order_cents: Math.round(parseFloat(newCoupon.minorder || '0') * 100),
        max_uses: newCoupon.maxuses ? parseInt(newCoupon.maxuses) : null,
        valid_from: newCoupon.validfrom || null,
        valid_until: newCoupon.validuntil || null,
      });
      onUpdate([...(coupons || []), res.coupon as Coupon]);
      setNewCoupon({ code: '', type: 'percent', value: '', minorder: '', maxuses: '', validfrom: '', validuntil: '' });
      setShowAdd(false);
    } catch (e) { console.error(e); alert('Fehler beim Erstellen'); }
  };

  const handleDeactivate = async (id: string) => {
    if (!confirm('Gutschein wirklich deaktivieren?')) return;
    try {
      await patchWithAuth(`/api/coupons/${id}`, { active: 0 });
      onUpdate(coupons.filter(c => c.id !== id));
    } catch (e) { console.error(e); alert('Fehler'); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-sage-900">Gutscheine</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Aktive Gutscheine</p>
          <p className="text-3xl font-semibold text-sage-900">{coupons.filter(c => c.active).length}</p>
        </div>
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Verwendungen gesamt</p>
          <p className="text-3xl font-semibold text-sage-900">{coupons.reduce((sum, c) => sum + c.used_count, 0)}</p>
        </div>
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Meistgenutzt</p>
          <p className="text-lg font-semibold text-sage-900 truncate">{coupons.sort((a, b) => b.used_count - a.used_count)[0]?.code || '–'}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Alle Gutscheine</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-500 text-white text-xs font-medium rounded-lg">
          <Plus className="w-4 h-4" /> Neuer Gutschein
        </button>
      </div>

      {showAdd && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-4">
          <div className="grid grid-cols-4 gap-3">
            <input placeholder="Code" value={newCoupon.code} onChange={e => setNewCoupon({ ...newCoupon, code: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm uppercase" />
            <select value={newCoupon.type} onChange={e => setNewCoupon({ ...newCoupon, type: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm">
              <option value="percent">Prozent</option>
              <option value="fixed">Festbetrag</option>
            </select>
            <input placeholder="Wert" type="number" value={newCoupon.value} onChange={e => setNewCoupon({ ...newCoupon, value: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="Mindestbestellung (€)" type="number" step="0.01" value={newCoupon.minorder} onChange={e => setNewCoupon({ ...newCoupon, minorder: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input placeholder="Max. Verwendungen" type="number" value={newCoupon.maxuses} onChange={e => setNewCoupon({ ...newCoupon, maxuses: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input type="date" value={newCoupon.validfrom} onChange={e => setNewCoupon({ ...newCoupon, validfrom: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <input type="date" value={newCoupon.validuntil} onChange={e => setNewCoupon({ ...newCoupon, validuntil: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <button onClick={handleAdd} className="px-4 py-2 bg-sage-500 text-white text-sm font-medium rounded-lg">Erstellen</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {coupons.map(c => (
          <div key={c.id} className="bg-white rounded-lg border border-sand-200 p-4">
            <div className="flex items-start justify-between mb-2">
              <p className="font-mono font-bold text-gray-900">{c.code}</p>
              <span className={`px-2 py-0.5 text-xs rounded-full ${c.active ? 'bg-sage-100 text-sage-700' : 'bg-red-100 text-red-700'}`}>{c.active ? 'Aktiv' : 'Inaktiv'}</span>
            </div>
            <p className="text-lg font-semibold text-sage-700 mb-2">
              {c.discount_type === 'percent' ? `${c.discount_value}%` : `${(c.discount_value / 100).toFixed(2)} €`}
            </p>
            <div className="text-xs text-sand-500 space-y-1">
              <p>Verwendet: {c.used_count}{c.max_uses ? `/${c.max_uses}` : ''}</p>
              {c.valid_from && <p>Gültig: {format(parseISO(c.valid_from), 'dd.MM.yyyy')} - {c.valid_until ? format(parseISO(c.valid_until), 'dd.MM.yyyy') : '∞'}</p>}
            </div>
            {c.active && <button onClick={() => handleDeactivate(c.id)} className="mt-3 w-full px-2 py-1 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100">Deaktivieren</button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// CAMPAIGNS TAB
// ============================================================================

function CampaignsTab({ campaigns, customers, onUpdate }: { campaigns: Campaign[]; customers: Customer[]; onUpdate: (c: Campaign[]) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newCampaign, setNewCampaign] = useState({ name: '', type: 'winback', days: '60', message: '', discount: 'none' });
  const [sending, setSending] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newCampaign.name || !newCampaign.message) { alert('Name und Nachricht erforderlich'); return; }
    try {
      const res = await postWithAuth('/api/campaigns', {
        name: newCampaign.name,
        type: newCampaign.type,
        target_segment: newCampaign.type === 'winback' ? `inactive_${newCampaign.days}` : 'all',
        message: newCampaign.message,
        status: 'draft',
      });
      onUpdate([...(campaigns || []), res.campaign as Campaign]);
      setNewCampaign({ name: '', type: 'winback', days: '60', message: '', discount: 'none' });
      setShowAdd(false);
    } catch (e) { console.error(e); alert('Fehler beim Erstellen'); }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Kampagne wirklich senden?')) return;
    setSending(id);
    try {
      const res = await postWithAuth(`/api/campaigns/${id}/send`, {});
      onUpdate(campaigns.map(c => c.id === id ? { ...c, status: 'sent', sent_count: res.campaign.sent_count } : c));
    } catch (e) { console.error(e); alert('Fehler beim Senden'); }
    finally { setSending(null); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-sage-900">Kampagnen - Win-Back & mehr</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Kampagnen</p>
          <p className="text-3xl font-semibold text-sage-900">{campaigns.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Gesendet</p>
          <p className="text-3xl font-semibold text-sage-900">{campaigns.filter(c => c.status === 'sent').length}</p>
        </div>
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Kunden</p>
          <p className="text-3xl font-semibold text-sage-900">{customers.length}</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Alle Kampagnen</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-500 text-white text-xs font-medium rounded-lg">
          <Plus className="w-4 h-4" /> Neue Kampagne
        </button>
      </div>

      {showAdd && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name" value={newCampaign.name} onChange={e => setNewCampaign({ ...newCampaign, name: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <select value={newCampaign.type} onChange={e => setNewCampaign({ ...newCampaign, type: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm">
              <option value="winback">Win-Back</option>
              <option value="birthday">Geburtstag</option>
              <option value="promotion">Promotion</option>
              <option value="reengagement">Re-Engagement</option>
            </select>
          </div>
          {newCampaign.type === 'winback' && (
            <div>
              <label className="text-xs text-sand-600">Tage inaktiv</label>
              <input type="number" value={newCampaign.days} onChange={e => setNewCampaign({ ...newCampaign, days: e.target.value })} className="w-full mt-1 px-3 py-2 rounded-lg border border-sage-200 text-sm" placeholder="60" />
            </div>
          )}
          <div>
            <label className="text-xs text-sand-600">Nachricht</label>
            <textarea value={newCampaign.message} onChange={e => setNewCampaign({ ...newCampaign, message: e.target.value })} rows={3} className="w-full mt-1 px-3 py-2 rounded-lg border border-sage-200 text-sm resize-none" placeholder="Ihre Nachricht..." />
          </div>
          <button onClick={handleCreate} className="px-4 py-2 bg-sage-500 text-white text-sm font-medium rounded-lg">Kampagne erstellen</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {campaigns.map(c => (
          <div key={c.id} className="bg-white rounded-lg border border-sand-200 p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p className="font-medium text-gray-900">{c.name}</p>
                <span className="text-xs text-sand-500 capitalize">{c.type}</span>
              </div>
              <span className={`px-2 py-0.5 text-xs rounded-full ${c.status === 'sent' ? 'bg-sage-100 text-sage-700' : 'bg-amber-100 text-amber-700'}`}>{c.status === 'sent' ? 'Gesendet' : 'Entwurf'}</span>
            </div>
            <p className="text-sm text-sand-600 mb-3 line-clamp-2">{c.message}</p>
            {c.status === 'sent' && (
              <div className="grid grid-cols-3 gap-2 text-center mb-3">
                <div className="bg-sand-50 rounded p-2">
                  <p className="text-lg font-semibold text-gray-900">{c.sent_count}</p>
                  <p className="text-xs text-sand-500">Gesendet</p>
                </div>
                <div className="bg-sand-50 rounded p-2">
                  <p className="text-lg font-semibold text-gray-900">{c.opened_count}</p>
                  <p className="text-xs text-sand-500">Geöffnet</p>
                </div>
                <div className="bg-sand-50 rounded p-2">
                  <p className="text-lg font-semibold text-gray-900">{c.conversion_count}</p>
                  <p className="text-xs text-sand-500">Konvertiert</p>
                </div>
              </div>
            )}
            {c.status === 'draft' && (
              <button onClick={() => handleSend(c.id)} disabled={sending === c.id} className="w-full py-2 bg-sage-500 text-white text-sm font-medium rounded-lg hover:bg-sage-600 disabled:opacity-50">
                {sending === c.id ? 'Sende...' : 'Kampagne senden'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// COMMISSION TAB
// ============================================================================

function CommissionTab({ commissions, stylists, services, onUpdate }: { commissions: Commission[]; stylists: Stylist[]; services: Service[]; onUpdate: (c: Commission[]) => void }) {
  const [showAdd, setShowAdd] = useState(false);
  const [newComm, setNewComm] = useState({ stylist_id: '', service_id: '', percent: '' });

  const handleAdd = async () => {
    if (!newComm.stylist_id || !newComm.percent) { alert('Stylist und Prozent erforderlich'); return; }
    try {
      const res = await postWithAuth('/api/commissions', {
        stylist_id: newComm.stylist_id,
        service_id: newComm.service_id || null,
        commission_percent: parseInt(newComm.percent),
      });
      onUpdate([...(commissions || []), res.commission as Commission]);
      setNewComm({ stylist_id: '', service_id: '', percent: '' });
      setShowAdd(false);
    } catch (e) { console.error(e); alert('Fehler beim Erstellen'); }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Provision wirklich löschen?')) return;
    try {
      await deleteWithAuth(`/api/commissions/${id}`);
      onUpdate(commissions.filter(c => c.id !== id));
    } catch (e) { console.error(e); alert('Fehler'); }
  };

  const totalCommission = commissions.reduce((sum, c) => sum + c.commission_percent, 0);

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-sage-900">Provisionen</h2>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Provisionseinträge</p>
          <p className="text-3xl font-semibold text-sage-900">{commissions.length}</p>
        </div>
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Stylisten mit Provision</p>
          <p className="text-3xl font-semibold text-sage-900">{new Set(commissions.map(c => c.stylist_id)).size}</p>
        </div>
        <div className="bg-white rounded-lg border border-sand-200 p-6">
          <p className="text-xs text-sand-500 mb-1">Ø Provision</p>
          <p className="text-3xl font-semibold text-sage-900">{commissions.length > 0 ? Math.round(totalCommission / commissions.length) : 0}%</p>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <h3 className="font-medium text-gray-900">Provisionseinstellungen</h3>
        <button onClick={() => setShowAdd(!showAdd)} className="flex items-center gap-1.5 px-3 py-1.5 bg-sage-500 text-white text-xs font-medium rounded-lg">
          <Plus className="w-4 h-4" /> Neue Provision
        </button>
      </div>

      {showAdd && (
        <div className="bg-sage-50 border border-sage-200 rounded-xl p-4">
          <div className="grid grid-cols-4 gap-3">
            <select value={newComm.stylist_id} onChange={e => setNewComm({ ...newComm, stylist_id: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm">
              <option value="">Stylist...</option>
              {stylists.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <select value={newComm.service_id} onChange={e => setNewComm({ ...newComm, service_id: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm">
              <option value="">Alle Services</option>
              {services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
            <input placeholder="Prozent" type="number" value={newComm.percent} onChange={e => setNewComm({ ...newComm, percent: e.target.value })} className="px-3 py-2 rounded-lg border border-sage-200 text-sm" />
            <button onClick={handleAdd} className="px-4 py-2 bg-sage-500 text-white text-sm font-medium rounded-lg">Hinzufügen</button>
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg border border-sand-200 overflow-hidden">
        {commissions.length === 0 ? (
          <p className="p-8 text-center text-sand-500">Keine Provisionen konfiguriert</p>
        ) : (
          <table className="w-full">
            <thead className="bg-sand-50">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-medium text-sand-600">Stylist</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-sand-600">Service</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-sand-600">Provision</th>
                <th className="text-right px-4 py-3 text-xs font-medium text-sand-600">Aktion</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-sand-100">
              {commissions.map(c => (
                <tr key={c.id}>
                  <td className="px-4 py-3 text-sm text-gray-900">{c.stylist_name}</td>
                  <td className="px-4 py-3 text-sm text-sand-600">{c.service_name || 'Alle Services'}</td>
                  <td className="px-4 py-3 text-sm font-medium text-sage-700">{c.commission_percent}%</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleDelete(c.id)} className="p-1 text-red-500 hover:bg-red-50 rounded">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// SIDEBAR
// ============================================================================

function Sidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: "appointments" | "customers" | "analytics" | "services" | "stylists" | "settings" | "inventory" | "pos" | "memberships" | "coupons" | "campaigns" | "commission";
  onTabChange: (tab: "appointments" | "customers" | "analytics" | "services" | "stylists" | "settings" | "inventory" | "pos" | "memberships" | "coupons" | "campaigns" | "commission") => void;
}) {
  const tabs = [
    { id: "appointments" as const, label: "Termine", icon: Calendar },
    { id: "customers" as const, label: "Kunden", icon: Users },
    { id: "stylists" as const, label: "Stylisten", icon: UserPlus },
    { id: "services" as const, label: "Services", icon: Scissors },
    { id: "inventory" as const, label: "Lager", icon: Box },
    { id: "pos" as const, label: "POS", icon: CreditCard },
    { id: "memberships" as const, label: "Mitgliedschaften", icon: UsersRound },
    { id: "coupons" as const, label: "Gutscheine", icon: Ticket },
    { id: "campaigns" as const, label: "Kampagnen", icon: Send },
    { id: "commission" as const, label: "Provision", icon: DollarSign },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "settings" as const, label: "Einstellungen", icon: Store },
  ];

  return (
    <aside className="w-64 bg-white border-r border-sand-200 min-h-screen p-4 flex flex-col">
      <div className="flex items-center gap-3 mb-8 px-2">
        <div className="w-10 h-10 bg-sage-500 rounded-xl flex items-center justify-center">
          <Scissors className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-semibold text-sage-900">SalonFlow</h1>
          <p className="text-xs text-sand-500">Admin</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors ${
              activeTab === tab.id
                ? "bg-sage-100 text-sage-900 font-medium"
                : "text-sand-600 hover:bg-sand-50"
            }`}
          >
            <tab.icon className="w-5 h-5" />
            {tab.label}
          </button>
        ))}
      </nav>

      <div className="pt-4 border-t border-sand-200">
        <button
          onClick={async () => {
            await fetch('/api/auth/logout', { method: 'POST' });
            localStorage.removeItem('salonflow_token');
            localStorage.removeItem('salonflow_user');
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
          Abmelden
        </button>
      </div>
    </aside>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminDashboard() {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [services, setServices] = useState<Service[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customerSearch, setCustomerSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"appointments" | "customers" | "analytics" | "services" | "stylists" | "settings" | "inventory" | "pos" | "memberships" | "coupons" | "campaigns" | "commission">("appointments");
  const [stylists, setStylists] = useState<Stylist[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [membershipPlans, setMembershipPlans] = useState<MembershipPlan[]>([]);
  const [customerMemberships, setCustomerMemberships] = useState<CustomerMembership[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [commissions, setCommissions] = useState<Commission[]>([]);

  // Modals
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    // Fetch all data in parallel — each call is individually wrapped so one failure doesn't crash the whole dashboard
    const safeFetch = async (url: string) => {
      try {
        const token = localStorage.getItem('salonflow_token');
        if (!token) { console.warn(`[fetchData] ${url} skipped: no token`); return null; }
        const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
        if (res.status === 401) { window.location.href = "/login"; return null; }
        return await res.json();
      } catch (e) {
        console.warn(`[fetchData] ${url} failed:`, e instanceof Error ? e.message : e);
        return null;
      }
    };

    const [salonData, appointmentsData, customersData, servicesData, stylistsData, productsData, paymentsData, membershipPlansData, customerMembershipsData, couponsData, campaignsData, commissionsData] = await Promise.all([
      safeFetch("/api/salon"),
      safeFetch("/api/appointments"),
      safeFetch("/api/customers"),
      safeFetch("/api/services"),
      safeFetch("/api/stylists"),
      safeFetch("/api/products"),
      safeFetch("/api/payments"),
      safeFetch("/api/memberships/plans"),
      safeFetch("/api/customer-memberships"),
      safeFetch("/api/coupons"),
      safeFetch("/api/campaigns"),
      safeFetch("/api/commissions"),
    ]);

    if (salonData) setSalon(salonData);
    if (appointmentsData) setAppointments(appointmentsData.appointments || appointmentsData);
    if (customersData) setCustomers(customersData.data || customersData);
    if (servicesData) setServices(servicesData.services || servicesData);
    if (stylistsData) setStylists(stylistsData.stylists || stylistsData || []);
    // Normalize products (API returns {data:[],total:0} or {products:[]} or [])
    let normalizedProducts: Product[] = [];
    if (productsData) {
      if (Array.isArray(productsData)) normalizedProducts = productsData;
      else if (Array.isArray((productsData as any).products)) normalizedProducts = (productsData as any).products;
      else if (Array.isArray((productsData as any).data)) normalizedProducts = (productsData as any).data;
    }
    // Normalize payments (API returns {data:[],total:0} or [])
    let normalizedPayments: Payment[] = [];
    if (paymentsData) {
      if (Array.isArray(paymentsData)) normalizedPayments = paymentsData;
      else if (Array.isArray((paymentsData as any).payments)) normalizedPayments = (paymentsData as any).payments;
      else if (Array.isArray((paymentsData as any).data)) normalizedPayments = (paymentsData as any).data;
    }
    // Normalize memberships (API returns {data:[],total:N} or {memberships:[]} or [])
    let normalizedMemberships: CustomerMembership[] = [];
    if (customerMembershipsData) {
      if (Array.isArray(customerMembershipsData)) normalizedMemberships = customerMembershipsData;
      else if (Array.isArray((customerMembershipsData as any).memberships)) normalizedMemberships = (customerMembershipsData as any).memberships;
      else if (Array.isArray((customerMembershipsData as any).data)) normalizedMemberships = (customerMembershipsData as any).data;
    }
    // Normalize coupons (API returns {coupons:[]} or {data:[]})
    let normalizedCoupons: Coupon[] = [];
    if (couponsData) {
      if (Array.isArray(couponsData)) normalizedCoupons = couponsData;
      else if (Array.isArray((couponsData as any).coupons)) normalizedCoupons = (couponsData as any).coupons;
      else if (Array.isArray((couponsData as any).data)) normalizedCoupons = (couponsData as any).data;
    }
    // Normalize campaigns (API returns {data:[]} or {campaigns:[]})
    let normalizedCampaigns: Campaign[] = [];
    if (campaignsData) {
      if (Array.isArray(campaignsData)) normalizedCampaigns = campaignsData;
      else if (Array.isArray((campaignsData as any).campaigns)) normalizedCampaigns = (campaignsData as any).campaigns;
      else if (Array.isArray((campaignsData as any).data)) normalizedCampaigns = (campaignsData as any).data;
    }
    // Normalize commissions (API returns [] or {commissions:[]})
    let normalizedCommissions: Commission[] = [];
    if (commissionsData) {
      if (Array.isArray(commissionsData)) normalizedCommissions = commissionsData;
      else if (Array.isArray((commissionsData as any).commissions)) normalizedCommissions = (commissionsData as any).commissions;
    }
    // Normalize membership plans (API returns 404/{error:"Not found"} or {plans:[]})
    let normalizedMembershipPlans: MembershipPlan[] = [];
    if (membershipPlansData && !(membershipPlansData as any).error) {
      if (Array.isArray(membershipPlansData)) normalizedMembershipPlans = membershipPlansData;
      else if (Array.isArray((membershipPlansData as any).plans)) normalizedMembershipPlans = (membershipPlansData as any).plans;
    }

    setProducts(normalizedProducts);
    setPayments(normalizedPayments);
    setMembershipPlans(normalizedMembershipPlans);
    setCustomerMemberships(normalizedMemberships);
    setCoupons(normalizedCoupons);
    setCampaigns(normalizedCampaigns);
    setCommissions(normalizedCommissions);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleAppointmentUpdate = (updated: Appointment) => {
    setAppointments((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
  };

  const handleAppointmentCreate = (apt: Appointment) => {
    setAppointments((prev) => [...prev, apt]);
  };

  const handleCustomerSelect = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowCustomerDetail(true);
  };

  const todayAppointments = appointments.filter((a) => isSameDay(parseISO(a.start_time), selectedDate));

  const todayStats = {
    total: todayAppointments.length,
    pending: todayAppointments.filter((a) => a.status === "pending").length,
    confirmed: todayAppointments.filter((a) => a.status === "confirmed").length,
    completed: todayAppointments.filter((a) => a.status === "completed").length,
  };

  // Last 7 days analytics
  const last7Days = Array.from({ length: 7 }, (_, i) => subDays(new Date(), 6 - i));
  const analyticsData = last7Days.map((day) => {
    const dayAppointments = appointments.filter((a) => isSameDay(parseISO(a.start_time), day));
    return {
      date: day,
      label: format(day, "EEE", { locale: de }),
      appointments: dayAppointments.length,
      revenue: dayAppointments.reduce((sum, a) => sum + a.price_cents, 0) / 100,
      completed: dayAppointments.filter((a) => a.status === "completed").length,
    };
  });

  const maxAppointments = Math.max(...analyticsData.map((d) => d.appointments), 1);
  const maxRevenue = Math.max(...analyticsData.map((d) => d.revenue), 1);

  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-sage-600">Laden...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center">
        <div className="text-red-600">Fehler: {error}</div>
      </div>
    );
  }

  const pendingCount = appointments.filter((a) => a.status === "pending").length;

  return (
    <div className="min-h-screen bg-sand-50 flex">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white border-b border-sand-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-semibold text-sage-900">{salon?.name || "SalonFlow"}</h1>
              <p className="text-xs text-sand-500">{format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })}</p>
            </div>
            <div className="flex items-center gap-3">
              {pendingCount > 0 && (
                <button
                  onClick={() => setActiveTab("appointments")}
                  className="relative p-2 text-sand-500 hover:bg-sand-100 rounded-lg transition-colors"
                  title={`${pendingCount} ausstehende Termine`}
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
                    {pendingCount > 9 ? "9+" : pendingCount}
                  </span>
                </button>
              )}
              {activeTab === "appointments" && (
                <button
                  onClick={() => setShowAddAppointment(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-sage-500 text-white rounded-lg font-medium hover:bg-sage-600 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  Neuer Termin
                </button>
              )}
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {activeTab === "appointments" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column - Calendar + Appointments */}
              <div className="lg:col-span-2 flex flex-col gap-6">
                <WeekCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  appointments={appointments}
                />

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4">
                  <div className="bg-white rounded-lg border border-sand-200 p-4">
                    <p className="text-xs text-sand-500 mb-1">Heute</p>
                    <p className="text-2xl font-semibold text-sage-900">{todayStats.total}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-sand-200 p-4">
                    <p className="text-xs text-sand-500 mb-1">Ausstehend</p>
                    <p className="text-2xl font-semibold text-amber-600">{todayStats.pending}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-sand-200 p-4">
                    <p className="text-xs text-sand-500 mb-1">Bestätigt</p>
                    <p className="text-2xl font-semibold text-sage-700">{todayStats.confirmed}</p>
                  </div>
                  <div className="bg-white rounded-lg border border-sand-200 p-4">
                    <p className="text-xs text-sand-500 mb-1">Abgeschlossen</p>
                    <p className="text-2xl font-semibold text-sage-800">{todayStats.completed}</p>
                  </div>
                </div>

                {/* Appointments List */}
                <div>
                  <h2 className="text-lg font-semibold text-sage-900 mb-3">
                    Termine am {format(selectedDate, "d. MMMM", { locale: de })}
                  </h2>
                  {todayAppointments.length === 0 ? (
                    <div className="bg-white rounded-lg border border-sand-200 p-8 text-center text-sand-500">
                      Keine Termine für diesen Tag
                    </div>
                  ) : (
                    <div className="grid gap-3">
                      {todayAppointments
                        .sort((a, b) => parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime())
                        .map((appointment) => (
                          <AppointmentCard
                            key={appointment.id}
                            appointment={appointment}
                            onUpdate={handleAppointmentUpdate}
                            onViewCustomer={(id) => {
                              const c = customers.find((c) => c.id === id);
                              if (c) handleCustomerSelect(c);
                            }}
                          />
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Customer List */}
              <div className="flex flex-col gap-6">
                <div>
                  <h2 className="text-lg font-semibold text-sage-900 mb-3">Kunden</h2>
                  <CustomerList
                    customers={customers}
                    searchQuery={customerSearch}
                    onSearchChange={setCustomerSearch}
                    onSelectCustomer={handleCustomerSelect}
                    appointments={appointments}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === "customers" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-sage-900 mb-3">Kundenverwaltung</h2>
              <CustomerList
                customers={customers}
                searchQuery={customerSearch}
                onSearchChange={setCustomerSearch}
                onSelectCustomer={handleCustomerSelect}
                appointments={appointments}
              />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-sage-900">Analytics</h2>

              {/* Revenue Stats Cards */}
              <div className="grid grid-cols-4 gap-4">
                <div className="bg-white rounded-lg border border-sand-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-sage-100 rounded-lg">
                      <CalendarCheck className="w-4 h-4 text-sage-600" />
                    </div>
                    <p className="text-xs text-sand-500">Heute</p>
                  </div>
                  <p className="text-2xl font-semibold text-sage-900">
                    {appointments
                      .filter((a) => isSameDay(parseISO(a.start_time), new Date()) && a.status === "completed")
                      .reduce((sum, a) => sum + a.price_cents, 0) / 100}
                    €
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-sand-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <TrendingUp className="w-4 h-4 text-amber-600" />
                    </div>
                    <p className="text-xs text-sand-500">Diese Woche</p>
                  </div>
                  <p className="text-2xl font-semibold text-sage-900">
                    {analyticsData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)} €
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-sand-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <BarChart3 className="w-4 h-4 text-blue-600" />
                    </div>
                    <p className="text-xs text-sand-500">Dieser Monat</p>
                  </div>
                  <p className="text-2xl font-semibold text-sage-900">
                    {appointments
                      .filter((a) => {
                        const d = parseISO(a.start_time);
                        const now = new Date();
                        return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear() && a.status === "completed";
                      })
                      .reduce((sum, a) => sum + a.price_cents, 0) / 100}
                    €
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-sand-200 p-6">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-4 h-4 text-purple-600" />
                    </div>
                    <p className="text-xs text-sand-500">Buchungen</p>
                  </div>
                  <p className="text-2xl font-semibold text-sage-900">
                    {appointments.filter((a) => {
                      const d = parseISO(a.start_time);
                      const now = new Date();
                      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
                    }).length}
                  </p>
                </div>
              </div>

              {/* CSS Bar Chart for Daily Revenue */}
              <div className="bg-white rounded-lg border border-sand-200 p-6">
                <h3 className="font-medium text-gray-900 mb-6 flex items-center gap-2">
                  <Euro className="w-4 h-4 text-sage-500" />
                  Täglicher Umsatz (letzte 7 Tage)
                </h3>
                <div className="flex items-end justify-between gap-2 h-48 px-2">
                  {analyticsData.map((day, i) => {
                    const maxR = Math.max(...analyticsData.map((d) => d.revenue), 1);
                    const height = maxR > 0 ? (day.revenue / maxR) * 100 : 0;
                    return (
                      <div key={i} className="flex-1 flex flex-col items-center gap-2">
                        <div className="w-full flex flex-col items-center justify-end h-32">
                          <span className="text-xs text-sage-600 font-medium mb-1">
                            {day.revenue > 0 ? `€${Math.round(day.revenue)}` : ""}
                          </span>
                          <div
                            className="w-full max-w-[40px] bg-gradient-to-t from-sage-600 to-sage-400 rounded-t-md transition-all duration-500"
                            style={{ height: `${Math.max(height, 4)}%` }}
                          />
                        </div>
                        <span className="text-xs text-sand-500 font-medium">{day.label}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Appointments Bar Chart */}
              <div className="bg-white rounded-lg border border-sand-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sage-500" />
                  Termine pro Tag
                </h3>
                <div className="space-y-3">
                  {analyticsData.map((day, i) => (
                    <AnalyticsBar
                      key={i}
                      label={day.label}
                      value={day.appointments}
                      max={maxAppointments}
                      color="bg-sage-500"
                    />
                  ))}
                </div>
              </div>

              {/* Revenue Bar Chart */}
              <div className="bg-white rounded-lg border border-sand-200 p-6">
                <h3 className="font-medium text-gray-900 mb-4 flex items-center gap-2">
                  <Euro className="w-4 h-4 text-sage-500" />
                  Umsatz pro Tag (€)
                </h3>
                <div className="space-y-3">
                  {analyticsData.map((day, i) => (
                    <AnalyticsBar
                      key={i}
                      label={day.label}
                      value={Math.round(day.revenue)}
                      max={Math.round(maxRevenue)}
                      color="bg-amber-500"
                    />
                  ))}
                </div>
              </div>

              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-sand-200 p-6">
                  <p className="text-xs text-sand-500 mb-1">Gesamt Termine (7 Tage)</p>
                  <p className="text-3xl font-semibold text-sage-900">
                    {analyticsData.reduce((sum, d) => sum + d.appointments, 0)}
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-sand-200 p-6">
                  <p className="text-xs text-sand-500 mb-1">Gesamt Umsatz (7 Tage)</p>
                  <p className="text-3xl font-semibold text-sage-900">
                    {analyticsData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)} €
                  </p>
                </div>
                <div className="bg-white rounded-lg border border-sand-200 p-6">
                  <p className="text-xs text-sand-500 mb-1">Ø pro Tag</p>
                  <p className="text-3xl font-semibold text-sage-900">
                    {(analyticsData.reduce((sum, d) => sum + d.revenue, 0) / 7).toFixed(0)} €
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "services" && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-semibold text-sage-900 mb-3">Services</h2>
              <ServicesManagement
                services={services}
                onUpdate={(s) => setServices((prev) => prev.map((x) => (x.id === s.id ? s : x)))}
                onDelete={(id) => setServices((prev) => prev.filter((s) => s.id !== id))}
              />
            </div>
          )}

          {activeTab === "stylists" && (
            <div className="max-w-xl">
              <h2 className="text-lg font-semibold text-sage-900 mb-4">Stylisten</h2>
              <StylistsManagement
                stylists={stylists}
                onUpdate={(s) => setStylists((prev) => prev.map((x) => (x.id === s.id ? s : x)))}
                onDelete={(id) => setStylists((prev) => prev.filter((x) => x.id !== id))}
                onAdd={(s) => setStylists((prev) => [...prev, s as Stylist])}
              />
            </div>
          )}

          {activeTab === "settings" && (
            <SettingsPanel
              salon={salon}
              onUpdate={(s) => setSalon(s as Salon)}
            />
          )}

          {activeTab === "inventory" && (
            <InventoryTab
              products={products}
              onUpdate={setProducts}
            />
          )}

          {activeTab === "pos" && (
            <POSTab
              services={services}
              stylists={stylists}
              customers={customers}
              payments={payments}
              onPayment={setPayments}
            />
          )}

          {activeTab === "memberships" && (
            <MembershipsTab
              plans={membershipPlans}
              memberships={customerMemberships}
              customers={customers}
              onUpdatePlans={setMembershipPlans}
              onUpdateMemberships={setCustomerMemberships}
            />
          )}

          {activeTab === "coupons" && (
            <CouponsTab
              coupons={coupons}
              onUpdate={setCoupons}
            />
          )}

          {activeTab === "campaigns" && (
            <CampaignsTab
              campaigns={campaigns}
              customers={customers}
              onUpdate={setCampaigns}
            />
          )}

          {activeTab === "commission" && (
            <CommissionTab
              commissions={commissions}
              stylists={stylists}
              services={services}
              onUpdate={setCommissions}
            />
          )}

        </main>
      </div>

      {/* Modals */}
      <AddAppointmentModal
        isOpen={showAddAppointment}
        onClose={() => setShowAddAppointment(false)}
        customers={customers}
        services={services}
        stylists={stylists}
        selectedDate={selectedDate}
        onSuccess={handleAppointmentCreate}
      />

      <CustomerDetailModal
        customer={selectedCustomer}
        isOpen={showCustomerDetail}
        onClose={() => setShowCustomerDetail(false)}
        appointments={appointments}
      />
    </div>
  );
}
