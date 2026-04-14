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
} from "lucide-react";

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
  customer: {
    id: string;
    name: string;
    phone: string;
    email: string | null;
  };
  service: {
    id: string;
    name: string;
    duration_min: number;
  };
  stylist: {
    id: string;
    name: string;
  };
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
  duration_min: number;
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
  const res = await fetch(url, { credentials: "include" });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
}

async function postWithAuth(url: string, data: Record<string, unknown>) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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
  const res = await fetch(url, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
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
  const res = await fetch(url, {
    method: "DELETE",
    credentials: "include",
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

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}>
      {STATUS_LABELS[status]}
    </span>
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
        onClick={() => onViewCustomer?.(appointment.customer.id)}
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
            onClick={() => onViewCustomer?.(appointment.customer.id)}
            className="font-medium text-gray-900 hover:text-sage-600 transition-colors"
          >
            {appointment.customer.name}
          </button>
          <p className="text-sm text-sand-600">{appointment.service.name}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-sand-100">
        <div className="flex items-center gap-3">
          <span className="text-xs text-sand-500">{appointment.stylist.name}</span>
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
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  const getAppointmentsForDay = (day: Date) =>
    appointments.filter((a) => isSameDay(parseISO(a.start_time), day));

  return (
    <div className="bg-white rounded-lg border border-sand-200 p-4">
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
    </div>
  );
}

function CustomerList({
  customers,
  searchQuery,
  onSearchChange,
  onSelectCustomer,
}: {
  customers: Customer[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSelectCustomer: (customer: Customer) => void;
}) {
  const filtered = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      (c.email && c.email.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
      <div className="divide-y divide-sand-100 max-h-96 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sand-500 text-sm">
            {searchQuery ? "Keine Kunden gefunden" : "Keine Kunden vorhanden"}
          </div>
        ) : (
          filtered.map((customer) => (
            <div
              key={customer.id}
              onClick={() => onSelectCustomer(customer)}
              className="p-4 flex items-center justify-between hover:bg-sand-50 transition-colors cursor-pointer"
            >
              <div>
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-xs text-sand-500">{customer.phone}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-sand-400" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// Analytics Bar Component
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
  selectedDate,
  onSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  services: Service[];
  selectedDate: Date;
  onSuccess: (apt: Appointment) => void;
}) {
  const [formData, setFormData] = useState({
    customer_id: "",
    service_id: "",
    stylist_id: "1",
    date: format(selectedDate, "yyyy-MM-dd"),
    time: "10:00",
    notes: "",
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const service = services.find((s) => s.id === formData.service_id);
      const start_time = `${formData.date}T${formData.time}:00`;
      const endTime = new Date(`${formData.date}T${formData.time}:00`);
      endTime.setMinutes(endTime.getMinutes() + (service?.duration_min || 60));
      const end_time = endTime.toISOString().slice(0, 19);

      const result = await postWithAuth("/api/appointments", {
        customer_id: formData.customer_id,
        service_id: formData.service_id,
        stylist_id: formData.stylist_id,
        start_time,
        end_time,
        notes: formData.notes || null,
        status: "pending",
      });
      onSuccess(result);
      onClose();
      setFormData({ customer_id: "", service_id: "", stylist_id: "1", date: format(new Date(), "yyyy-MM-dd"), time: "10:00", notes: "" });
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
    .filter((a) => a.customer.id === customer.id)
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
                {customer.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
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
                      <p className="text-sm font-medium text-gray-900">{apt.service.name}</p>
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
      duration: service.duration_min.toString(),
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
                      <Clock className="w-3 h-3" /> {service.duration_min} Min
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
// SIDEBAR
// ============================================================================

function Sidebar({
  activeTab,
  onTabChange,
}: {
  activeTab: "appointments" | "customers" | "analytics" | "services";
  onTabChange: (tab: "appointments" | "customers" | "analytics" | "services") => void;
}) {
  const tabs = [
    { id: "appointments" as const, label: "Termine", icon: Calendar },
    { id: "customers" as const, label: "Kunden", icon: Users },
    { id: "analytics" as const, label: "Analytics", icon: BarChart3 },
    { id: "services" as const, label: "Services", icon: Scissors },
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
          onClick={() => (window.location.href = "/login")}
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
  const [activeTab, setActiveTab] = useState<"appointments" | "customers" | "analytics" | "services">("appointments");

  // Modals
  const [showAddAppointment, setShowAddAppointment] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showCustomerDetail, setShowCustomerDetail] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      const [salonData, appointmentsData, customersData, servicesData] = await Promise.all([
        fetchWithAuth("/api/salon"),
        fetchWithAuth("/api/appointments"),
        fetchWithAuth("/api/customers"),
        fetchWithAuth("/api/services"),
      ]);
      setSalon(salonData);
      setAppointments(appointmentsData.appointments || appointmentsData);
      setCustomers(customersData.data || customersData);
      setServices(servicesData.services || servicesData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load data");
    } finally {
      setLoading(false);
    }
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
              />
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-6">
              <h2 className="text-lg font-semibold text-sage-900">Analytics - Letzte 7 Tage</h2>

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
        </main>
      </div>

      {/* Modals */}
      <AddAppointmentModal
        isOpen={showAddAppointment}
        onClose={() => setShowAddAppointment(false)}
        customers={customers}
        services={services}
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
