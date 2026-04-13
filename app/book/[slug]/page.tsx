'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';

// Types
interface Service {
  id: string;
  name: string;
  duration_min: number;
  price: number;
}

interface Stylist {
  id: string;
  name: string;
  avatar_url?: string;
}

interface TimeSlot {
  time: string;
  available: boolean;
}

interface Addon {
  id: string;
  name: string;
  price: number;
}

interface SalonData {
  id: string;
  name: string;
  description: string;
  services: Service[];
  stylists: Stylist[];
  addons?: Addon[];
}

interface BookingFormData {
  customer_name: string;
  phone: string;
  email: string;
  notes: string;
  preferred_time: 'morning' | 'afternoon' | 'evening' | '';
}

type Step = 'service' | 'stylist' | 'date' | 'time' | 'info' | 'confirm';
type AnimationDirection = 'left' | 'right' | 'none';

// Default add-ons
const DEFAULT_ADDONS: Addon[] = [
  { id: 'coffee', name: 'Kaffee', price: 2 },
  { id: 'hair-product', name: 'Haarprodukt', price: 15 },
  { id: 'champagne', name: 'Champagner', price: 12 },
  { id: 'parking', name: 'Parken', price: 5 },
];

// API functions
async function fetchSalon(slug: string): Promise<SalonData | null> {
  try {
    const res = await fetch(`/api/salons/${slug}`);
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

async function fetchSlots(
  salonId: string,
  serviceId: string,
  stylistId: string,
  date: string
): Promise<TimeSlot[]> {
  try {
    const params = new URLSearchParams({
      salon_id: salonId,
      service_id: serviceId,
      stylist_id: stylistId,
      date,
    });
    const res = await fetch(`/api/slots?${params}`);
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function createBooking(data: {
  salon_id: string;
  service_id: string;
  stylist_id: string;
  date: string;
  time: string;
  customer_name: string;
  phone: string;
  email?: string;
  notes?: string;
  preferred_time?: string;
  addons?: string[];
}): Promise<{ token: string } | null> {
  try {
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

// Utility functions
function formatDate(date: Date): string {
  return date.toISOString().split('T')[0];
}

function formatDisplayDate(date: Date): string {
  return date.toLocaleDateString('de-AT', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
  });
}

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':');
  return `${hours}:${minutes}`;
}

// Calendar Component
function Calendar({
  selectedDate,
  onSelect,
  minDate = new Date(),
}: {
  selectedDate: Date | null;
  onSelect: (date: Date) => void;
  minDate?: Date;
}) {
  const [viewDate, setViewDate] = useState(selectedDate || minDate);

  const daysInMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth() + 1,
    0
  ).getDate();

  const firstDayOfMonth = new Date(
    viewDate.getFullYear(),
    viewDate.getMonth(),
    1
  ).getDay();

  const monthName = viewDate.toLocaleDateString('de-AT', {
    month: 'long',
    year: 'numeric',
  });

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isDisabled = (day: number | null) => {
    if (!day) return true;
    const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isSelected = (day: number | null) => {
    if (!day || !selectedDate) return false;
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === viewDate.getMonth() &&
      selectedDate.getFullYear() === viewDate.getFullYear()
    );
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sage-100">
      <div className="flex items-center justify-between mb-6">
        <button
          type="button"
          onClick={() =>
            setViewDate(
              new Date(viewDate.getFullYear(), viewDate.getMonth() - 1)
            )
          }
          className="p-2 rounded-xl hover:bg-sage-50 transition-colors"
          aria-label="Previous month"
        >
          <svg
            className="w-5 h-5 text-sage-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </button>
        <h3 className="text-lg font-semibold text-sage-900">{monthName}</h3>
        <button
          type="button"
          onClick={() =>
            setViewDate(
              new Date(viewDate.getFullYear(), viewDate.getMonth() + 1)
            )
          }
          className="p-2 rounded-xl hover:bg-sage-50 transition-colors"
          aria-label="Next month"
        >
          <svg
            className="w-5 h-5 text-sage-700"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-2">
        {['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So'].map((day) => (
          <div
            key={day}
            className="text-center text-xs font-medium text-sage-500 py-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, idx) => (
          <button
            key={idx}
            type="button"
            disabled={isDisabled(day)}
            onClick={() => {
              if (day && !isDisabled(day)) {
                onSelect(
                  new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
                );
              }
            }}
            className={`
              aspect-square rounded-xl text-sm font-medium transition-all duration-150
              ${
                isSelected(day)
                  ? 'bg-sage-600 text-white shadow-md'
                  : isDisabled(day)
                  ? 'text-sage-200 cursor-not-allowed'
                  : 'text-sage-700 hover:bg-sage-100'
              }
            `}
          >
            {day || ''}
          </button>
        ))}
      </div>
    </div>
  );
}

// Step Indicator Component
function StepIndicator({ currentStep, steps }: { currentStep: Step; steps: { key: Step; label: string }[] }) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-2 mb-8">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div
            className={`
              w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-250
              ${
                index < currentIndex
                  ? 'bg-sage-600 text-white'
                  : index === currentIndex
                  ? 'bg-sage-600 text-white shadow-md'
                  : 'bg-sage-100 text-sage-500'
              }
            `}
          >
            {index < currentIndex ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              index + 1
            )}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-8 h-0.5 mx-1 ${
                index < currentIndex ? 'bg-sage-600' : 'bg-sage-100'
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

// Booking Summary Sidebar Component
function BookingSummarySidebar({
  service,
  stylist,
  date,
  time,
  addons,
  preferredTime,
  notes,
}: {
  service: Service | null;
  stylist: Stylist | null;
  date: Date | null;
  time: string | null;
  addons: Addon[];
  preferredTime: string;
  notes: string;
}) {
  const servicePrice = service?.price || 0;
  const addonsPrice = addons.reduce((sum, a) => sum + a.price, 0);
  const totalPrice = servicePrice + addonsPrice;

  const preferredTimeLabel = {
    morning: 'Vormittag (8-12 Uhr)',
    afternoon: 'Nachmittag (12-17 Uhr)',
    evening: 'Abend (17-20 Uhr)',
  }[preferredTime] || '-';

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-sage-100 lg:sticky lg:top-24">
      <h3 className="text-lg font-semibold text-sage-900 mb-4">Buchungsübersicht</h3>
      
      <div className="space-y-4">
        {service && (
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sage-600 text-sm">Service</p>
              <p className="font-medium text-sage-900">{service.name}</p>
              <p className="text-xs text-sage-500">{service.duration_min} Min.</p>
            </div>
            <p className="font-semibold text-sage-700">€{service.price.toFixed(2)}</p>
          </div>
        )}

        {stylist && (
          <div className="border-t border-sage-100 pt-4">
            <p className="text-sage-600 text-sm">Stylist</p>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-8 h-8 rounded-full bg-sage-200 flex items-center justify-center">
                <span className="text-sm font-medium text-sage-700">
                  {stylist.name.charAt(0)}
                </span>
              </div>
              <p className="font-medium text-sage-900">{stylist.name}</p>
            </div>
          </div>
        )}

        {date && (
          <div className="border-t border-sage-100 pt-4">
            <p className="text-sage-600 text-sm">Datum & Zeit</p>
            <p className="font-medium text-sage-900">{formatDisplayDate(date)}</p>
            {time && <p className="text-sage-700">{formatTime(time)} Uhr</p>}
            {preferredTime && (
              <p className="text-sm text-sage-500 mt-1">Präferenz: {preferredTimeLabel}</p>
            )}
          </div>
        )}

        {addons.length > 0 && (
          <div className="border-t border-sage-100 pt-4">
            <p className="text-sage-600 text-sm mb-2">Add-ons</p>
            {addons.map((addon) => (
              <div key={addon.id} className="flex justify-between items-center mb-1">
                <span className="text-sage-700">{addon.name}</span>
                <span className="font-medium text-sage-700">+€{addon.price.toFixed(2)}</span>
              </div>
            ))}
          </div>
        )}

        {notes && (
          <div className="border-t border-sage-100 pt-4">
            <p className="text-sage-600 text-sm">Notizen</p>
            <p className="text-sage-700 text-sm mt-1 italic">"{notes}"</p>
          </div>
        )}

        <div className="border-t border-sage-200 pt-4">
          <div className="flex justify-between items-center">
            <p className="text-sage-600 font-medium">Gesamt</p>
            <p className="text-xl font-bold text-sage-900">€{totalPrice.toFixed(2)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Main Component
export default function BookingPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // Booking state
  const [salon, setSalon] = useState<SalonData | null>(null);
  const [addons, setAddons] = useState<Addon[]>(DEFAULT_ADDONS);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Multi-step state
  const [currentStep, setCurrentStep] = useState<Step>('service');
  const [animationDirection, setAnimationDirection] = useState<AnimationDirection>('none');
  const [isAnimating, setIsAnimating] = useState(false);
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedStylist, setSelectedStylist] = useState<Stylist | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(false);

  // Form state
  const [formData, setFormData] = useState<BookingFormData>({
    customer_name: '',
    phone: '',
    email: '',
    notes: '',
    preferred_time: '',
  });
  const [formErrors, setFormErrors] = useState<Partial<BookingFormData>>({});
  const [submitting, setSubmitting] = useState(false);

  // Animate step transition
  const animateToStep = useCallback((newStep: Step, direction: AnimationDirection = 'right') => {
    setIsAnimating(true);
    setAnimationDirection(direction);
    
    setTimeout(() => {
      setCurrentStep(newStep);
      setIsAnimating(false);
      setAnimationDirection('none');
    }, 200);
  }, []);

  // Load salon data
  useEffect(() => {
    async function loadSalon() {
      setLoading(true);
      setError(null);
      const data = await fetchSalon(slug);
      if (!data) {
        setError('Salon nicht gefunden');
      } else {
        setSalon(data);
        if (data.addons && data.addons.length > 0) {
          setAddons(data.addons);
        }
      }
      setLoading(false);
    }
    loadSalon();
  }, [slug]);

  // Load time slots when date changes
  useEffect(() => {
    async function loadSlots() {
      if (!salon || !selectedService || !selectedStylist || !selectedDate) return;

      setLoadingSlots(true);
      const slots = await fetchSlots(
        salon.id,
        selectedService.id,
        selectedStylist.id,
        formatDate(selectedDate)
      );
      setTimeSlots(slots);
      setLoadingSlots(false);
    }
    loadSlots();
  }, [salon, selectedService, selectedStylist, selectedDate]);

  const steps = [
    { key: 'service' as Step, label: 'Service' },
    { key: 'stylist' as Step, label: 'Stylist' },
    { key: 'date' as Step, label: 'Datum' },
    { key: 'time' as Step, label: 'Zeit' },
    { key: 'info' as Step, label: 'Info' },
    { key: 'confirm' as Step, label: 'Bestätigung' },
  ];

  const goToStep = (step: Step) => setCurrentStep(step);

  const nextStep = useCallback(() => {
    const stepOrder: Step[] = ['service', 'stylist', 'date', 'time', 'info', 'confirm'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      animateToStep(stepOrder[currentIndex + 1], 'right');
    }
  }, [currentStep, animateToStep]);

  const prevStep = useCallback(() => {
    const stepOrder: Step[] = ['service', 'stylist', 'date', 'time', 'info', 'confirm'];
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      animateToStep(stepOrder[currentIndex - 1], 'left');
    }
  }, [currentStep, animateToStep]);

  const canProceed = (): boolean => {
    switch (currentStep) {
      case 'service':
        return !!selectedService;
      case 'stylist':
        return true; // Stylist is optional
      case 'date':
        return !!selectedDate;
      case 'time':
        return !!selectedTime;
      case 'info':
        return !!(formData.customer_name && formData.phone);
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  const validateForm = (): boolean => {
    const errors: Partial<BookingFormData> = {};

    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Name ist erforderlich';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Telefonnummer ist erforderlich';
    } else if (!/^[\d\s\+\-\(\)]{7,}$/.test(formData.phone)) {
      errors.phone = 'Ungültige Telefonnummer';
    }

    if (formData.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Ungültige E-Mail-Adresse';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (currentStep === 'info' && !validateForm()) {
      return;
    }
    nextStep();
  };

  const handleSubmit = async () => {
    if (!salon || !selectedService || !selectedDate || !selectedTime) {
      return;
    }

    setSubmitting(true);

    const result = await createBooking({
      salon_id: salon.id,
      service_id: selectedService.id,
      stylist_id: selectedStylist?.id || '',
      date: formatDate(selectedDate),
      time: selectedTime,
      customer_name: formData.customer_name,
      phone: formData.phone,
      email: formData.email || undefined,
      notes: formData.notes || undefined,
      preferred_time: formData.preferred_time || undefined,
      addons: selectedAddons.map(a => a.id),
    });

    setSubmitting(false);

    if (result?.token) {
      router.push(`/verify-booking?token=${result.token}`);
    } else {
      setError('Buchung konnte nicht erstellt werden. Bitte versuchen Sie es erneut.');
    }
  };

  const toggleAddon = (addon: Addon) => {
    setSelectedAddons(prev => 
      prev.find(a => a.id === addon.id)
        ? prev.filter(a => a.id !== addon.id)
        : [...prev, addon]
    );
  };

  // Animation classes
  const getAnimationClass = () => {
    if (!isAnimating) return 'opacity-100 translate-x-0';
    
    switch (animationDirection) {
      case 'left':
        return 'opacity-0 -translate-x-8';
      case 'right':
        return 'opacity-0 translate-x-8';
      default:
        return 'opacity-100 translate-x-0';
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sage-600">Laden...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !salon) {
    return (
      <div className="min-h-screen bg-sand-50 flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h1 className="text-xl font-semibold text-sage-900 mb-2">Salon nicht gefunden</h1>
          <p className="text-sage-600 mb-6">{error || 'Der gewünschte Salon existiert nicht.'}</p>
          <a href="/" className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Zurück zur Übersicht
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sand-50">
      {/* Header */}
      <header className="bg-white border-b border-sage-100 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <h1 className="text-xl font-semibold text-sage-900">{salon.name}</h1>
          {salon.description && (
            <p className="text-sm text-sage-600 mt-1 line-clamp-1">{salon.description}</p>
          )}
        </div>
      </header>

      {/* Main Content - Different layout for confirm step */}
      <main className={`max-w-6xl mx-auto px-4 py-8 ${currentStep === 'confirm' ? 'lg:flex lg:gap-8' : ''}`}>
        <div className={currentStep === 'confirm' ? 'flex-1' : ''}>
          <StepIndicator currentStep={currentStep} steps={steps} />

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Step Content with Animation */}
          <div 
            className={`bg-white rounded-2xl p-6 shadow-sm border border-sage-100 transition-all duration-200 ease-out ${getAnimationClass()}`}
          >
            {/* Step 1: Select Service */}
            {currentStep === 'service' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-4">
                  Wählen Sie Ihren Service
                </h2>
                <div className="space-y-3">
                  {salon.services.map((service) => (
                    <button
                      key={service.id}
                      type="button"
                      onClick={() => {
                        setSelectedService(service);
                        setSelectedStylist(null);
                        setSelectedDate(null);
                        setSelectedTime(null);
                      }}
                      className={`
                        w-full p-4 rounded-xl border-2 text-left transition-all duration-150
                        ${
                          selectedService?.id === service.id
                            ? 'border-sage-600 bg-sage-50'
                            : 'border-sage-100 hover:border-sage-200'
                        }
                      `}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-sage-900">{service.name}</p>
                          <p className="text-sm text-sage-500 mt-1">
                            {service.duration_min} Minuten
                          </p>
                        </div>
                        <p className="font-semibold text-sage-700">
                          €{service.price.toFixed(2)}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>

                {/* Add-ons Section */}
                {selectedService && (
                  <div className="mt-8 pt-6 border-t border-sage-100">
                    <h3 className="text-lg font-semibold text-sage-900 mb-4">
                      Add-ons
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {addons.map((addon) => {
                        const isSelected = selectedAddons.find(a => a.id === addon.id);
                        return (
                          <button
                            key={addon.id}
                            type="button"
                            onClick={() => toggleAddon(addon)}
                            className={`
                              p-4 rounded-xl border-2 text-left transition-all duration-150
                              ${isSelected
                                ? 'border-sage-600 bg-sage-50'
                                : 'border-sage-100 hover:border-sage-200'
                              }
                            `}
                          >
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="font-medium text-sage-900">{addon.name}</p>
                                <p className="text-sm text-sage-500 mt-1">
                                  +€{addon.price.toFixed(2)}
                                </p>
                              </div>
                              {isSelected && (
                                <div className="w-5 h-5 bg-sage-600 rounded-full flex items-center justify-center">
                                  <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                                  </svg>
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Select Stylist */}
            {currentStep === 'stylist' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-4">
                  Wählen Sie Ihren Stylist
                </h2>
                {salon.stylists.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sage-500">Keine Stylisten verfügbar</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {salon.stylists.map((stylist) => (
                      <button
                        key={stylist.id}
                        type="button"
                        onClick={() => {
                          setSelectedStylist(stylist);
                          setSelectedDate(null);
                          setSelectedTime(null);
                        }}
                        className={`
                          w-full p-4 rounded-xl border-2 text-left transition-all duration-150
                          ${
                            selectedStylist?.id === stylist.id
                              ? 'border-sage-600 bg-sage-50'
                              : 'border-sage-100 hover:border-sage-200'
                          }
                        `}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-sage-200 flex items-center justify-center">
                            {stylist.avatar_url ? (
                              <img
                                src={stylist.avatar_url}
                                alt={stylist.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              <span className="text-lg font-medium text-sage-700">
                                {stylist.name.charAt(0)}
                              </span>
                            )}
                          </div>
                          <p className="font-medium text-sage-900">{stylist.name}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStylist(null);
                      setSelectedDate(null);
                      setSelectedTime(null);
                    }}
                    className={`text-sm transition-colors ${
                      !selectedStylist 
                        ? 'text-sage-600 font-medium' 
                        : 'text-sage-500 hover:text-sage-600'
                    }`}
                  >
                    Keine Präferenz
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Pick Date */}
            {currentStep === 'date' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-4">
                  Wählen Sie Ihr Datum
                </h2>
                <Calendar
                  selectedDate={selectedDate}
                  onSelect={(date) => {
                    setSelectedDate(date);
                    setSelectedTime(null);
                  }}
                />
              </div>
            )}

            {/* Step 4: Pick Time */}
            {currentStep === 'time' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-4">
                  Wählen Sie Ihre Zeit
                </h2>
                {selectedDate && (
                  <p className="text-sm text-sage-600 mb-4">
                    {formatDisplayDate(selectedDate)}
                  </p>
                )}
                
                {/* Preferred Time Dropdown */}
                <div className="mb-6">
                  <label
                    htmlFor="preferred_time"
                    className="block text-sm font-medium text-sage-700 mb-2"
                  >
                    Bevorzugte Tageszeit (optional)
                  </label>
                  <select
                    id="preferred_time"
                    value={formData.preferred_time}
                    onChange={(e) =>
                      setFormData({ ...formData, preferred_time: e.target.value as 'morning' | 'afternoon' | 'evening' | '' })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 focus:outline-none focus:border-sage-500 transition-colors"
                  >
                    <option value="">Keine Präferenz</option>
                    <option value="morning">Vormittag (8-12 Uhr)</option>
                    <option value="afternoon">Nachmittag (12-17 Uhr)</option>
                    <option value="evening">Abend (17-20 Uhr)</option>
                  </select>
                </div>

                {loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(9)].map((_, i) => (
                      <div
                        key={i}
                        className="h-12 bg-sage-100 rounded-xl animate-pulse"
                      />
                    ))}
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-sage-500 mb-2">Keine Termine verfügbar</p>
                    <p className="text-sm text-sage-400">
                      Bitte wählen Sie ein anderes Datum
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.time}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`
                          py-3 rounded-xl font-medium text-sm transition-all duration-150
                          ${
                            selectedTime === slot.time
                              ? 'bg-sage-600 text-white shadow-md'
                              : slot.available
                              ? 'bg-sage-50 text-sage-700 hover:bg-sage-100'
                              : 'bg-sage-50 text-sage-300 cursor-not-allowed line-through'
                          }
                        `}
                      >
                        {formatTime(slot.time)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 5: Enter Info */}
            {currentStep === 'info' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-4">
                  Ihre Daten
                </h2>
                <div className="space-y-4">
                  <div>
                    <label
                      htmlFor="customer_name"
                      className="block text-sm font-medium text-sage-700 mb-1"
                    >
                      Name *
                    </label>
                    <input
                      type="text"
                      id="customer_name"
                      value={formData.customer_name}
                      onChange={(e) =>
                        setFormData({ ...formData, customer_name: e.target.value })
                      }
                      className={`
                        w-full px-4 py-3 rounded-xl border-2 bg-white text-sage-900 placeholder-sage-400
                        focus:outline-none focus:border-sage-500 transition-colors
                        ${formErrors.customer_name ? 'border-red-400' : 'border-sage-200'}
                      `}
                      placeholder="Maria Muster"
                    />
                    {formErrors.customer_name && (
                      <p className="text-red-500 text-sm mt-1">
                        {formErrors.customer_name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="phone"
                      className="block text-sm font-medium text-sage-700 mb-1"
                    >
                      Telefon *
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      value={formData.phone}
                      onChange={(e) =>
                        setFormData({ ...formData, phone: e.target.value })
                      }
                      className={`
                        w-full px-4 py-3 rounded-xl border-2 bg-white text-sage-900 placeholder-sage-400
                        focus:outline-none focus:border-sage-500 transition-colors
                        ${formErrors.phone ? 'border-red-400' : 'border-sage-200'}
                      `}
                      placeholder="+43 123 456789"
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-sage-700 mb-1"
                    >
                      E-Mail (optional)
                    </label>
                    <input
                      type="email"
                      id="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      className={`
                        w-full px-4 py-3 rounded-xl border-2 bg-white text-sage-900 placeholder-sage-400
                        focus:outline-none focus:border-sage-500 transition-colors
                        ${formErrors.email ? 'border-red-400' : 'border-sage-200'}
                      `}
                      placeholder="maria@example.at"
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="notes"
                      className="block text-sm font-medium text-sage-700 mb-1"
                    >
                      Anmerkungen (optional)
                    </label>
                    <textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) =>
                        setFormData({ ...formData, notes: e.target.value })
                      }
                      rows={3}
                      className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 placeholder-sage-400 focus:outline-none focus:border-sage-500 transition-colors resize-none"
                      placeholder="Besondere Wünsche oder Hinweise..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Confirm */}
            {currentStep === 'confirm' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-4">
                  Buchung bestätigen
                </h2>
                <div className="bg-sage-50 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sage-600">Service</span>
                    <span className="font-medium text-sage-900">
                      {selectedService?.name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage-600">Stylist</span>
                    <span className="font-medium text-sage-900">
                      {selectedStylist?.name || 'Keine Präferenz'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage-600">Datum</span>
                    <span className="font-medium text-sage-900">
                      {selectedDate ? formatDisplayDate(selectedDate) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage-600">Zeit</span>
                    <span className="font-medium text-sage-900">
                      {selectedTime ? formatTime(selectedTime) : '-'}
                    </span>
                  </div>
                  {formData.preferred_time && (
                    <div className="flex justify-between">
                      <span className="text-sage-600">Präferenz</span>
                      <span className="font-medium text-sage-900">
                        {formData.preferred_time === 'morning' ? 'Vormittag' : 
                         formData.preferred_time === 'afternoon' ? 'Nachmittag' : 'Abend'}
                      </span>
                    </div>
                  )}
                  {selectedAddons.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sage-600">Add-ons</span>
                      <span className="font-medium text-sage-900">
                        {selectedAddons.map(a => a.name).join(', ')}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-sage-600">Name</span>
                    <span className="font-medium text-sage-900">
                      {formData.customer_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage-600">Telefon</span>
                    <span className="font-medium text-sage-900">{formData.phone}</span>
                  </div>
                  {formData.email && (
                    <div className="flex justify-between">
                      <span className="text-sage-600">E-Mail</span>
                      <span className="font-medium text-sage-900">{formData.email}</span>
                    </div>
                  )}
                  {formData.notes && (
                    <div className="border-t border-sage-200 pt-3">
                      <span className="text-sage-600">Notizen</span>
                      <p className="font-medium text-sage-900 mt-1 italic">"{formData.notes}"</p>
                    </div>
                  )}
                  <div className="border-t border-sage-200 pt-3 flex justify-between">
                    <span className="text-sage-600">Preis</span>
                    <span className="font-semibold text-sage-900">
                      €{((selectedService?.price || 0) + selectedAddons.reduce((s, a) => s + a.price, 0)).toFixed(2)}
                    </span>
                  </div>
                </div>
                <p className="text-xs text-sage-500 mt-4 text-center">
                  Mit der Buchung stimmen Sie unseren AGB zu. Sie erhalten eine
                  Bestätigung per SMS.
                </p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-6">
              {currentStep !== 'service' && (
                <button
                  type="button"
                  onClick={prevStep}
                  className="flex-1 py-3 px-4 rounded-xl border-2 border-sage-200 text-sage-700 font-medium hover:bg-sage-50 transition-colors"
                >
                  Zurück
                </button>
              )}
              {currentStep !== 'confirm' ? (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!canProceed()}
                  className={`
                    flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-150
                    ${
                      canProceed()
                        ? 'bg-sage-600 text-white hover:bg-sage-700 shadow-md'
                        : 'bg-sage-200 text-sage-400 cursor-not-allowed'
                    }
                  `}
                >
                  Weiter
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={submitting}
                  className={`
                    flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-150
                    ${
                      submitting
                        ? 'bg-sage-300 text-white cursor-not-allowed'
                        : 'bg-sage-600 text-white hover:bg-sage-700 shadow-md'
                    }
                  `}
                >
                  {submitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="w-5 h-5 animate-spin"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Buchen...
                    </span>
                  ) : (
                    'Jetzt buchen'
                  )}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Booking Summary Sidebar - Only on confirm step */}
        {currentStep === 'confirm' && (
          <div className="hidden lg:block w-80 flex-shrink-0">
            <BookingSummarySidebar
              service={selectedService}
              stylist={selectedStylist}
              date={selectedDate}
              time={selectedTime}
              addons={selectedAddons}
              preferredTime={formData.preferred_time}
              notes={formData.notes}
            />
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-xs text-sage-500">
        <p>Bereitgestellt von SalonFlow</p>
      </footer>
    </div>
  );
}
