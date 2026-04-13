"use client";

import { useState, useEffect, useCallback } from "react";
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  parseISO,
  startOfDay,
  endOfDay,
} from "date-fns";
import { de } from "date-fns/locale";

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

interface Salon {
  id: string;
  name: string;
  slug: string;
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
  const res = await fetch(url, {
    credentials: "include",
  });
  if (res.status === 401) {
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }
  if (!res.ok) throw new Error("Failed to fetch");
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

// ============================================================================
// COMPONENTS
// ============================================================================

function StatusBadge({ status }: { status: AppointmentStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[status]}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function QuickActions({
  appointment,
  onUpdate,
}: {
  appointment: Appointment;
  onUpdate: (updated: Appointment) => void;
}) {
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      const updated = await patchWithAuth(
        `/api/appointments/${appointment.id}`,
        { status: "confirmed" }
      );
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
      await patchWithAuth(`/api/appointments/${appointment.id}`, {
        status: "cancelled",
      });
      onUpdate({ ...appointment, status: "cancelled" });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  if (appointment.status === "cancelled" || appointment.status === "completed") {
    return null;
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
}: {
  appointment: Appointment;
  onUpdate: (updated: Appointment) => void;
}) {
  const start = parseISO(appointment.start_time);
  const end = parseISO(appointment.end_time);

  return (
    <div className="bg-white rounded-lg border border-sand-200 p-4 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-semibold text-sage-900">
              {format(start, "HH:mm")}
            </span>
            <span className="text-sand-400">—</span>
            <span className="text-sand-600">{format(end, "HH:mm")}</span>
          </div>
          <p className="font-medium text-gray-900 truncate">
            {appointment.customer.name}
          </p>
          <p className="text-sm text-sand-600">{appointment.service.name}</p>
        </div>
        <StatusBadge status={appointment.status} />
      </div>
      <div className="flex items-center justify-between pt-2 border-t border-sand-100">
        <span className="text-xs text-sand-500">{appointment.stylist.name}</span>
        <QuickActions appointment={appointment} onUpdate={onUpdate} />
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
                isSelected
                  ? "bg-sage-500 text-white"
                  : isToday
                  ? "bg-sage-100 text-sage-900"
                  : "hover:bg-sand-50 text-gray-700"
              }`}
            >
              <span className="text-xs font-medium">
                {format(day, "EEE", { locale: de })}
              </span>
              <span className={`text-lg font-semibold ${isSelected ? "text-white" : ""}`}>
                {format(day, "d")}
              </span>
              <span
                className={`text-xs mt-1 px-1.5 py-0.5 rounded-full ${
                  isSelected
                    ? "bg-white/20 text-white"
                    : dayAppointments.length > 0
                    ? "bg-sage-200 text-sage-800"
                    : "text-transparent"
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
}: {
  customers: Customer[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
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
      <div className="divide-y divide-sand-100 max-h-80 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="p-8 text-center text-sand-500 text-sm">
            {searchQuery ? "Keine Kunden gefunden" : "Keine Kunden vorhanden"}
          </div>
        ) : (
          filtered.map((customer) => (
            <div
              key={customer.id}
              className="p-4 flex items-center justify-between hover:bg-sand-50 transition-colors"
            >
              <div>
                <p className="font-medium text-gray-900">{customer.name}</p>
                <p className="text-xs text-sand-500">{customer.phone}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-sand-600">
                  {customer.total_visits} Besuche
                </p>
                {customer.last_visit_at && (
                  <p className="text-xs text-sand-400">
                    {format(parseISO(customer.last_visit_at), "dd.MM.yyyy")}
                  </p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ============================================================================
// MAIN PAGE
// ============================================================================

export default function AdminDashboard() {
  const [salon, setSalon] = useState<Salon | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [customerSearch, setCustomerSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [salonData, appointmentsData, customersData] = await Promise.all([
        fetchWithAuth("/api/salon"),
        fetchWithAuth("/api/appointments"),
        fetchWithAuth("/api/customers"),
      ]);
      setSalon(salonData);
      setAppointments(appointmentsData);
      setCustomers(customersData);
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
    setAppointments((prev) =>
      prev.map((a) => (a.id === updated.id ? updated : a))
    );
  };

  const todayAppointments = appointments.filter((a) =>
    isSameDay(parseISO(a.start_time), selectedDate)
  );

  const todayStats = {
    total: todayAppointments.length,
    pending: todayAppointments.filter((a) => a.status === "pending").length,
    confirmed: todayAppointments.filter((a) => a.status === "confirmed").length,
    completed: todayAppointments.filter((a) => a.status === "completed").length,
  };

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
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <header className="bg-white border-b border-sand-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-sage-900">
              {salon?.name || "SalonFlow"}
            </h1>
            <p className="text-xs text-sand-500">Admin Dashboard</p>
          </div>
          <div className="text-sm text-sand-600">
            {format(new Date(), "EEEE, d. MMMM yyyy", { locale: de })}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Calendar + Today's Appointments */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {/* Week Calendar */}
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
                    .sort((a, b) =>
                      parseISO(a.start_time).getTime() - parseISO(b.start_time).getTime()
                    )
                    .map((appointment) => (
                      <AppointmentCard
                        key={appointment.id}
                        appointment={appointment}
                        onUpdate={handleAppointmentUpdate}
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
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
