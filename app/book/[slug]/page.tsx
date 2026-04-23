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

interface AnamneseFormData {
  allergies: string;
  medications: string;
  pregnancy: 'yes' | 'no' | '';
  hair_conditions: string;
}

interface CouponState {
  code: string;
  valid: boolean;
  discount_cents: number;
  discount_percent: number;
  error: string;
}

interface DepositState {
  cardNumber: string;
  expiry: string;
  cvv: string;
  paymentMethod: 'card' | 'onsite';
}

interface Addon {
  id: string;
  name: string;
  price_cents: number; // ADDON PRICES ARE IN CENT
}

type Step = 'service' | 'stylist' | 'date' | 'time' | 'coupon' | 'info' | 'anamnese' | 'deposit' | 'confirm';
type AnimationDirection = 'left' | 'right' | 'none';

// Default add-ons (prices in CENT)
const DEFAULT_ADDONS: Addon[] = [
  { id: 'coffee', name: 'Kaffee', price_cents: 200 },
  { id: 'hair-product', name: 'Haarprodukt', price_cents: 1500 },
  { id: 'champagne', name: 'Champagner', price_cents: 1200 },
  { id: 'parking', name: 'Parken', price_cents: 500 },
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
    const data = await res.json();
    return data.slots ?? [];
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
    // Format for /api/bookings (POST)
    // data.time is ISO timestamp from slot selection, so extract just the HH:mm:ss part
    const timePart = data.time.includes('T') ? data.time.split('T')[1] : data.time;
    const startTime = `${data.date}T${timePart}`;
    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        salonSlug: data.salon_id,
        serviceId: data.service_id,
        stylistId: data.stylist_id,
        startTime,
        customerName: data.customer_name,
        customerPhone: data.phone,
        customerEmail: data.email,
        notes: data.notes,
      }),
    });
    if (!res.ok) return null;
    const json = await res.json();
    // Return token for verify-booking redirect
    return { token: json.verifyToken || json.bookingId || '' };
  } catch {
    return null;
  }
}

// Utility functions
function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

// Step Icons
const STEP_ICONS: Record<Step, React.ReactNode> = {
  service: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
    </svg>
  ),
  stylist: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  date: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  time: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  coupon: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  info: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  anamnese: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
    </svg>
  ),
  deposit: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  confirm: (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

// Step Indicator Component with icons
function StepIndicator({ currentStep, steps }: { currentStep: Step; steps: { key: Step; label: string }[] }) {
  const currentIndex = steps.findIndex((s) => s.key === currentStep);

  return (
    <div className="flex items-center justify-center gap-1 mb-8 overflow-x-auto py-2">
      {steps.map((step, index) => (
        <div key={step.key} className="flex items-center">
          <div className="flex flex-col items-center">
            <div
              className={`
                w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-250
                ${
                  index < currentIndex
                    ? 'bg-sage-600 text-white'
                    : index === currentIndex
                    ? 'bg-sage-600 text-white shadow-md ring-4 ring-sage-100'
                    : 'bg-sage-100 text-sage-500'
                }
              `}
            >
              {index < currentIndex ? (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                STEP_ICONS[step.key]
              )}
            </div>
            <span className={`text-xs mt-1.5 font-medium hidden sm:block ${
              index === currentIndex ? 'text-sage-700' : 'text-sage-500'
            }`}>
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-6 sm:w-10 h-0.5 mx-1 ${
                index < currentIndex ? 'bg-sage-600' : 'bg-sage-200'
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
  const totalPriceCents = (service?.price || 0) * 100 + addons.reduce((sum, a) => sum + a.price_cents, 0);

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
                <span className="font-medium text-sage-700">+€{(addon.price_cents / 100).toFixed(2)}</span>
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
            <p className="text-xl font-bold text-sage-900">€{(totalPriceCents / 100).toFixed(2)}</p>
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

  // Coupon state
  const [couponState, setCouponState] = useState<CouponState>({
    code: '',
    valid: false,
    discount_cents: 0,
    discount_percent: 0,
    error: '',
  });
  const [validatingCoupon, setValidatingCoupon] = useState(false);

  // Anamnese state (for coloring/chemical services)
  const [anamneseData, setAnamneseData] = useState<AnamneseFormData>({
    allergies: '',
    medications: '',
    pregnancy: '',
    hair_conditions: '',
  });

  // Deposit payment state
  const [depositState, setDepositState] = useState<DepositState>({
    cardNumber: '',
    expiry: '',
    cvv: '',
    paymentMethod: 'card',
  });
  const [processingPayment, setProcessingPayment] = useState(false);
  const [depositError, setDepositError] = useState('');

  // Service categories that require anamnese
  const ANAMNESE_CATEGORIES = ['color', 'chemical', 'bleach', 'perm', 'straightening'];

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
          // Normalize: API might return addon.price in EUR, we store in cents
          const normalizedAddons = data.addons.map((a: any) => ({
            ...a,
            price_cents: a.price_cents ?? (typeof a.price === 'number' ? a.price * 100 : 0),
          }));
          setAddons(normalizedAddons);
        }
      }
      setLoading(false);
    }
    loadSalon();
  }, [slug]);

  // Load time slots when date changes
  useEffect(() => {
    async function loadSlots() {
      if (!salon || !selectedService || !selectedDate) return;

      setLoadingSlots(true);
      const slots = await fetchSlots(
        salon.id,
        selectedService.id,
        selectedStylist?.id || '',
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
    { key: 'coupon' as Step, label: 'Rabatt' },
    { key: 'info' as Step, label: 'Info' },
    { key: 'anamnese' as Step, label: 'Fragebogen' },
    { key: 'deposit' as Step, label: 'Anzahlung' },
    { key: 'confirm' as Step, label: 'Bestätigung' },
  ];

  const goToStep = (step: Step) => setCurrentStep(step);

  // Get the effective step order based on service type
  const getStepOrder = (): Step[] => {
    const baseSteps: Step[] = ['service', 'stylist', 'date', 'time', 'coupon', 'info'];
    if (serviceRequiresAnamnese()) {
      baseSteps.push('anamnese');
    }
    baseSteps.push('deposit', 'confirm');
    return baseSteps;
  };

  // Check if selected service requires anamnese
  const serviceRequiresAnamnese = (): boolean => {
    if (!selectedService) return false;
    const colorServiceNames = ['coloring', 'col', 'färb', 'blond', 'bleach', 'perm', 'chem'];
    const name = selectedService.name.toLowerCase();
    return ANAMNESE_CATEGORIES.some(cat => name.includes(cat)) || colorServiceNames.some(c => name.includes(c));
  };

  const nextStep = useCallback(() => {
    const stepOrder = getStepOrder();
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex < stepOrder.length - 1) {
      animateToStep(stepOrder[currentIndex + 1], 'right');
    }
  }, [currentStep, animateToStep]);

  const prevStep = useCallback(() => {
    const stepOrder = getStepOrder();
    const currentIndex = stepOrder.indexOf(currentStep);
    if (currentIndex > 0) {
      animateToStep(stepOrder[currentIndex - 1], 'left');
    }
  }, [currentStep, animateToStep]);

  // Get visible steps for indicator
  const visibleSteps = steps.filter(step => {
    if (step.key === 'anamnese') return serviceRequiresAnamnese();
    return true;
  });

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
      case 'coupon':
        return true; // Coupon is optional
      case 'info':
        return !!(formData.customer_name && formData.phone);
      case 'anamnese':
        return true; // Anamnese is optional/non-blocking
      case 'deposit':
        return true; // Deposit is optional
      case 'confirm':
        return true;
      default:
        return false;
    }
  };

  // Calculate total price with addons and discount
  // NOTE: service.price is in EUR, addon.price_cents is in CENT
  const calculateTotal = (): number => {
    const servicePriceCents = (selectedService?.price || 0) * 100; // EUR → cents
    const addonsPrice = selectedAddons.reduce((sum, a) => sum + a.price_cents, 0); // already cents
    const subtotalCents = servicePriceCents + addonsPrice;
    const discount = couponState.valid ? couponState.discount_cents : 0;
    return Math.max(0, subtotalCents - discount);
  };

  // Calculate deposit amount (min €5 or 20% of total, whichever is higher)
  const calculateDeposit = (): number => {
    const total = calculateTotal();
    const minDeposit = 500; // €5 in cents
    const percentDeposit = Math.round(total * 0.2);
    return Math.max(minDeposit, percentDeposit);
  };

  const validateForm = (): boolean => {
    const errors: Partial<BookingFormData> = {};

    if (!formData.customer_name.trim()) {
      errors.customer_name = 'Name ist erforderlich';
    } else if (formData.customer_name.trim().length < 2) {
      errors.customer_name = 'Name muss mindestens 2 Zeichen haben';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Telefonnummer ist erforderlich';
    } else {
      // Austrian phone: +43 or 06x format, allowing spaces/dashes
      const cleanedPhone = formData.phone.replace(/[\s\-\(\)]/g, '');
      const austriaPhoneRegex = /^(\+43|06\d)\d{6,12}$/;
      if (!austriaPhoneRegex.test(cleanedPhone)) {
        errors.phone = 'Ungültige Telefonnummer (z.B. +43 123 456789 oder 0661 234567)';
      }
    }

    if (formData.email && formData.email.trim() !== '') {
      // Stronger email validation
      const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      if (!emailRegex.test(formData.email)) {
        errors.email = 'Ungültige E-Mail-Adresse';
      }
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

  // Handle coupon validation
  const handleCouponSubmit = async () => {
    if (!couponState.code.trim()) {
      setCouponState(prev => ({ ...prev, error: 'Bitte geben Sie einen Code ein' }));
      return;
    }

    setValidatingCoupon(true);
    setCouponState(prev => ({ ...prev, error: '' }));

    try {
      const orderCents = ((selectedService?.price || 0) * 100) + selectedAddons.reduce((s, a) => s + a.price_cents, 0);
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' ? localStorage.getItem('salonflow_token') || '' : ''}`
        },
        body: JSON.stringify({
          code: couponState.code,
          order_cents: orderCents
        }),
      });

      const data = await res.json();

      if (data.valid) {
        const discountPercent = data.coupon?.discount_type === 'percent' ? data.coupon.discount_value : 0;
        const discountCents = data.discount_cents || 0;
        setCouponState(prev => ({
          ...prev,
          valid: true,
          discount_cents: discountCents,
          discount_percent: discountPercent,
          error: ''
        }));
      } else {
        setCouponState(prev => ({
          ...prev,
          valid: false,
          discount_cents: 0,
          discount_percent: 0,
          error: data.error || 'Code ungültig oder abgelaufen'
        }));
      }
    } catch {
      setCouponState(prev => ({
        ...prev,
        valid: false,
        discount_cents: 0,
        discount_percent: 0,
        error: 'Validierung fehlgeschlagen'
      }));
    }
    setValidatingCoupon(false);
  };

  // Handle deposit payment
  const handleDepositPayment = async () => {
    if (depositState.paymentMethod === 'card') {
      // Validate card fields
      if (!depositState.cardNumber || depositState.cardNumber.replace(/\s/g, '').length < 16) {
        setDepositError('Bitte geben Sie eine gültige Kartennummer ein');
        return;
      }
      if (!depositState.expiry || !depositState.expiry.includes('/')) {
        setDepositError('Bitte geben Sie ein gültiges Ablaufdatum ein (MM/JJ)');
        return;
      }
      if (!depositState.cvv || depositState.cvv.length < 3) {
        setDepositError('Bitte geben Sie einen gültigen CVV ein');
        return;
      }

      setProcessingPayment(true);
      setDepositError('');

      try {
        const depositAmount = calculateDeposit();
        const res = await fetch('/api/payments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('salonflow_token') || ''}`
          },
          body: JSON.stringify({
            amount_cents: depositAmount,
            method: 'card',
            status: 'completed',
            notes: `Deposit for booking - ${couponState.code ? `Coupon: ${couponState.code}` : 'No coupon'}`
          }),
        });

        if (!res.ok) throw new Error('Payment failed');
        nextStep();
      } catch {
        setDepositError('Zahlung fehlgeschlagen. Bitte versuchen Sie es erneut.');
      }
      setProcessingPayment(false);
    } else {
      // Skip deposit, pay onsite
      nextStep();
    }
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

      {/* Trust Signals Bar */}
      <div className="bg-sage-50 border-b border-sage-100">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-sm text-sage-600">
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>SSL-verschlüsselt</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              <span>4.8 (127 Bewertungen)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <svg className="w-4 h-4 text-sage-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              <span>Kostenlose Stornierung</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Desktop: Two column layout with sticky sidebar */}
        <div className="hidden md:grid md:grid-cols-3 lg:grid-cols-4 gap-8">
          <div className="md:col-span-2 lg:col-span-3">
            <StepIndicator currentStep={currentStep} steps={visibleSteps} />

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
                                  +€{(addon.price_cents / 100).toFixed(2)}
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
                <h2 className="text-lg font-semibold text-sage-900 mb-1">
                  Wählen Sie Ihre Zeit
                </h2>
                {selectedDate && (
                  <p className="text-sm text-sage-500 mb-6">
                    {formatDisplayDate(selectedDate)}
                  </p>
                )}

                {/* Morning / Afternoon / Evening quick filter pills */}
                <div className="flex gap-2 mb-6">
                  {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                    const icons = {
                      morning: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ),
                      afternoon: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      ),
                      evening: (
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                      ),
                    };
                    const labels = { morning: 'Vormittag', afternoon: 'Nachmittag', evening: 'Abend' };
                    const times = { morning: [8, 12], afternoon: [12, 17], evening: [17, 20] };
                    const filtered = timeSlots.filter((slot) => {
                      const h = parseInt(slot.time.split(':')[0]);
                      return h >= times[period][0] && h < times[period][1];
                    });
                    const available = filtered.filter((s) => s.available).length;
                    const isActive = formData.preferred_time === period;
                    return (
                      <button
                        key={period}
                        type="button"
                        onClick={() => setFormData({ ...formData, preferred_time: isActive ? '' : period })}
                        className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border-2 text-sm font-medium transition-all duration-150 ${
                          isActive
                            ? 'border-sage-600 bg-sage-50 text-sage-700'
                            : available > 0
                            ? 'border-sage-200 bg-white text-sage-600 hover:border-sage-300'
                            : 'border-sage-100 bg-white text-sage-300 cursor-not-allowed'
                        }`}
                      >
                        {icons[period]}
                        <span>{labels[period]}</span>
                        {available > 0 && (
                          <span className={`text-xs px-1.5 py-0.5 rounded-full ${isActive ? 'bg-sage-200 text-sage-800' : 'bg-sage-100 text-sage-600'}`}>
                            {available}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                {loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[...Array(9)].map((_, i) => (
                      <div key={i} className="h-14 bg-sage-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : timeSlots.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 bg-sage-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-sage-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sage-500 font-medium mb-1">Keine Termine verfügbar</p>
                    <p className="text-sm text-sage-400">Bitte wählen Sie ein anderes Datum</p>
                  </div>
                ) : (
                  <>
                    {/* Time period sections */}
                    {(['morning', 'afternoon', 'evening'] as const).map((period) => {
                      const filtered = timeSlots.filter((slot) => {
                        const h = parseInt(slot.time.split(':')[0]);
                        const times = { morning: [8, 12], afternoon: [12, 17], evening: [17, 21] };
                        return h >= times[period][0] && h < times[period][1];
                      });
                      if (filtered.length === 0) return null;
                      const labels = { morning: '☀️ Vormittag', afternoon: '🌤️ Nachmittag', evening: '🌙 Abend' };
                      return (
                        <div key={period} className="mb-5">
                          <p className={`text-xs font-semibold uppercase tracking-wider mb-2 ${formData.preferred_time && formData.preferred_time !== period ? 'text-sage-300' : 'text-sage-500'}`}>
                            {labels[period]}
                          </p>
                          <div className="grid grid-cols-4 gap-2">
                            {filtered.map((slot) => {
                              const h = parseInt(slot.time.split(':')[0]);
                              const m = slot.time.split(':')[1];
                              const isActive = selectedTime === slot.time;
                              const isAvailable = slot.available;
                              const isPreferredTime = !formData.preferred_time || formData.preferred_time === period;
                              return (
                                <button
                                  key={slot.time}
                                  type="button"
                                  disabled={!isAvailable}
                                  onClick={() => setSelectedTime(slot.time)}
                                  className={`
                                    relative py-3 rounded-xl font-medium text-sm transition-all duration-150
                                    ${isActive
                                      ? 'bg-sage-600 text-white shadow-lg shadow-sage-200 scale-105'
                                      : isAvailable && isPreferredTime
                                      ? 'bg-white border-2 border-sage-200 text-sage-700 hover:border-sage-400 hover:shadow-sm'
                                      : isAvailable
                                      ? 'bg-white border-2 border-sage-100 text-sage-400'
                                      : 'bg-sage-50 text-sage-300 cursor-not-allowed'
                                    }
                                  `}
                                >
                                  <span className={isActive ? '' : isAvailable ? '' : 'line-through'}>
                                    {String(h).padStart(2, '0')}:{m}
                                  </span>
                                  {!isAvailable && (
                                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-400 rounded-full flex items-center justify-center">
                                      <span className="text-white text-xs">×</span>
                                    </span>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                    {timeSlots.length > 0 && (
                      <p className="text-xs text-center text-sage-400 mt-4">
                        ✕ = bereits gebucht · {timeSlots.filter((s) => !s.available).length} von {timeSlots.length} belegt
                      </p>
                    )}
                  </>
                )}
              </div>
            )}

            {/* Step 4.5: Coupon Code */}
            {currentStep === 'coupon' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-2">
                  Rabatt-Code einlösen
                </h2>
                <p className="text-sm text-sage-500 mb-6">
                  Haben Sie einen Gutschein? Geben Sie hier Ihren Code ein.
                </p>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={couponState.code}
                      onChange={(e) => setCouponState(prev => ({ 
                        ...prev, 
                        code: e.target.value.toUpperCase(),
                        valid: false,
                        error: ''
                      }))}
                      placeholder="z.B. WILLKOMMEN10"
                      disabled={couponState.valid}
                      className={`
                        flex-1 px-4 py-3 rounded-xl border-2 bg-white text-sage-900 placeholder-sage-400
                        focus:outline-none focus:border-sage-500 transition-colors uppercase
                        ${couponState.valid ? 'border-green-400 bg-green-50' : 'border-sage-200'}
                        ${couponState.valid ? '' : ''}
                      `}
                    />
                    {!couponState.valid && (
                      <button
                        type="button"
                        onClick={handleCouponSubmit}
                        disabled={validatingCoupon || !couponState.code.trim()}
                        className={`
                          px-6 py-3 rounded-xl font-medium transition-all duration-150
                          ${validatingCoupon || !couponState.code.trim()
                            ? 'bg-sage-200 text-sage-400 cursor-not-allowed'
                            : 'bg-sage-600 text-white hover:bg-sage-700 shadow-md'
                          }
                        `}
                      >
                        {validatingCoupon ? 'Prüfe...' : 'Einlösen'}
                      </button>
                    )}
                    {couponState.valid && (
                      <button
                        type="button"
                        onClick={() => setCouponState(prev => ({ 
                          ...prev, 
                          code: '',
                          valid: false,
                          discount_cents: 0,
                          discount_percent: 0,
                          error: ''
                        }))}
                        className="px-4 py-3 rounded-xl border-2 border-sage-200 text-sage-600 hover:bg-sage-50 transition-colors"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  {couponState.error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {couponState.error}
                    </div>
                  )}

                  {couponState.valid && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-xl text-green-700 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Code gültig! -{couponState.discount_percent > 0 ? `${couponState.discount_percent}%` : `€${(couponState.discount_cents / 100).toFixed(2)}`} Rabatt
                    </div>
                  )}

                  <div className="bg-sage-50 rounded-xl p-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sage-600">Zwischensumme</span>
                      <span className="font-medium text-sage-900">
                        €{((((selectedService?.price || 0) * 100) + selectedAddons.reduce((s, a) => s + a.price_cents, 0)) / 100).toFixed(2)}
                      </span>
                    </div>
                    {couponState.valid && (
                      <div className="flex justify-between items-center mt-2 text-green-600">
                        <span>Rabatt ({couponState.code})</span>
                        <span className="font-medium">-€{(couponState.discount_cents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between items-center mt-3 pt-3 border-t border-sage-200">
                      <span className="text-sage-700 font-semibold">Gesamt</span>
                      <span className="text-xl font-bold text-sage-900">
                        €{(calculateTotal() / 100).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
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

            {/* Step 5.5: Anamnese Form - only for coloring/chemical services */}
            {currentStep === 'anamnese' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-2">
                  Gesundheitsfragebogen
                </h2>
                <p className="text-sm text-sage-500 mb-6">
                  Bitte beantworten Sie diese Fragen für Ihre Sicherheit bei chemischen Behandlungen.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Haben Sie Allergien?
                    </label>
                    <input
                      type="text"
                      value={anamneseData.allergies}
                      onChange={(e) => setAnamneseData(prev => ({ ...prev, allergies: e.target.value }))}
                      placeholder="z.B. Nickel, Latex, bestimmte Inhaltsstoffe..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 placeholder-sage-400 focus:outline-none focus:border-sage-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Nehmen Sie Medikamente?
                    </label>
                    <input
                      type="text"
                      value={anamneseData.medications}
                      onChange={(e) => setAnamneseData(prev => ({ ...prev, medications: e.target.value }))}
                      placeholder="z.B. Blutverdünner, Antibiotika..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 placeholder-sage-400 focus:outline-none focus:border-sage-500 transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-3">
                      Sind Sie schwanger?
                    </label>
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => setAnamneseData(prev => ({ ...prev, pregnancy: 'yes' }))}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                          anamneseData.pregnancy === 'yes'
                            ? 'border-sage-600 bg-sage-50 text-sage-700'
                            : 'border-sage-200 text-sage-600 hover:border-sage-300'
                        }`}
                      >
                        Ja
                      </button>
                      <button
                        type="button"
                        onClick={() => setAnamneseData(prev => ({ ...prev, pregnancy: 'no' }))}
                        className={`flex-1 py-3 px-4 rounded-xl border-2 font-medium transition-all ${
                          anamneseData.pregnancy === 'no'
                            ? 'border-sage-600 bg-sage-50 text-sage-700'
                            : 'border-sage-200 text-sage-600 hover:border-sage-300'
                        }`}
                      >
                        Nein
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-sage-700 mb-2">
                      Haben Sie Haarerkrankungen?
                    </label>
                    <input
                      type="text"
                      value={anamneseData.hair_conditions}
                      onChange={(e) => setAnamneseData(prev => ({ ...prev, hair_conditions: e.target.value }))}
                      placeholder="z.B. Schuppenflechte, Ekzeme, empfindliche Kopfhaut..."
                      className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 placeholder-sage-400 focus:outline-none focus:border-sage-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-sage-200 text-sage-700 font-medium hover:bg-sage-50 transition-colors"
                  >
                    Zurück
                  </button>
                  <button
                    type="button"
                    onClick={nextStep}
                    className="flex-1 py-3 px-4 rounded-xl bg-sage-600 text-white font-medium hover:bg-sage-700 shadow-md transition-colors"
                  >
                    Weiter
                  </button>
                </div>
              </div>
            )}

            {/* Step 6: Deposit Payment */}
            {currentStep === 'deposit' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-2">
                  Anzahlung
                </h2>
                <p className="text-sm text-sage-500 mb-6">
                  Sichern Sie Ihren Termin mit einer Anzahlung.
                </p>

                <div className="bg-sage-50 rounded-xl p-4 mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sage-600">Gesamtbetrag</span>
                    <span className="font-semibold text-sage-900">€{(calculateTotal() / 100).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center text-lg">
                    <span className="text-sage-700 font-medium">Anzahlung fällig</span>
                    <span className="text-xl font-bold text-sage-600">€{(calculateDeposit() / 100).toFixed(2)}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="border-2 border-sage-200 rounded-xl overflow-hidden">
                    <div className="flex">
                      <button
                        type="button"
                        onClick={() => setDepositState(prev => ({ ...prev, paymentMethod: 'card' }))}
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${
                          depositState.paymentMethod === 'card'
                            ? 'bg-sage-600 text-white'
                            : 'bg-white text-sage-600 hover:bg-sage-50'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                          </svg>
                          Kartenzahlung
                        </span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDepositState(prev => ({ ...prev, paymentMethod: 'onsite' }))}
                        className={`flex-1 py-3 px-4 font-medium transition-colors ${
                          depositState.paymentMethod === 'onsite'
                            ? 'bg-sage-600 text-white'
                            : 'bg-white text-sage-600 hover:bg-sage-50'
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                          Vor-Ort-Zahlung
                        </span>
                      </button>
                    </div>

                    {depositState.paymentMethod === 'card' && (
                      <div className="p-4 bg-white space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-sage-700 mb-1">
                            Kartennummer
                          </label>
                          <input
                            type="text"
                            value={depositState.cardNumber}
                            onChange={(e) => {
                              const val = e.target.value.replace(/\D/g, '').slice(0, 16);
                              const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
                              setDepositState(prev => ({ ...prev, cardNumber: formatted }));
                            }}
                            placeholder="1234 5678 9012 3456"
                            maxLength={19}
                            className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 placeholder-sage-400 focus:outline-none focus:border-sage-500 transition-colors"
                          />
                        </div>
                        <div className="flex gap-4">
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-sage-700 mb-1">
                              Ablaufdatum
                            </label>
                            <input
                              type="text"
                              value={depositState.expiry}
                              onChange={(e) => {
                                let val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2);
                                setDepositState(prev => ({ ...prev, expiry: val }));
                              }}
                              placeholder="MM/JJ"
                              maxLength={5}
                              className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 placeholder-sage-400 focus:outline-none focus:border-sage-500 transition-colors"
                            />
                          </div>
                          <div className="flex-1">
                            <label className="block text-sm font-medium text-sage-700 mb-1">
                              CVV
                            </label>
                            <input
                              type="text"
                              value={depositState.cvv}
                              onChange={(e) => {
                                const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                                setDepositState(prev => ({ ...prev, cvv: val }));
                              }}
                              placeholder="123"
                              maxLength={4}
                              className="w-full px-4 py-3 rounded-xl border-2 border-sage-200 bg-white text-sage-900 placeholder-sage-400 focus:outline-none focus:border-sage-500 transition-colors"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {depositState.paymentMethod === 'onsite' && (
                      <div className="p-4 bg-white">
                        <p className="text-sm text-sage-600">
                          Sie zahlen die Anzahlung von €{(calculateDeposit() / 100).toFixed(2)} direkt vor Ort.
                          Der verbleibende Betrag wird ebenfalls bei Ihrem Termin beglichen.
                        </p>
                      </div>
                    )}
                  </div>

                  {depositError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {depositError}
                    </div>
                  )}
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex-1 py-3 px-4 rounded-xl border-2 border-sage-200 text-sage-700 font-medium hover:bg-sage-50 transition-colors"
                  >
                    Zurück
                  </button>
                  <button
                    type="button"
                    onClick={handleDepositPayment}
                    disabled={processingPayment}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all ${
                      processingPayment
                        ? 'bg-sage-300 text-white cursor-not-allowed'
                        : 'bg-sage-600 text-white hover:bg-sage-700 shadow-md'
                    }`}
                  >
                    {processingPayment ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Wird verarbeitet...
                      </span>
                    ) : depositState.paymentMethod === 'card' ? (
                      `€${(calculateDeposit() / 100).toFixed(2)} online bezahlen`
                    ) : (
                      'Vor-Ort-Zahlung fortsetzen'
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Step 7: Confirm */}
            {currentStep === 'confirm' && (
              <div>
                <h2 className="text-lg font-semibold text-sage-900 mb-4">
                  Buchung bestätigen
                </h2>
                <div className="bg-sage-50 rounded-xl p-4 space-y-3">
                  {/* 1. Service & Stylist */}
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

                  {/* 2. Date & Time */}
                  <div className="flex justify-between">
                    <span className="text-sage-600">Datum</span>
                    <span className="font-medium text-sage-900">
                      {selectedDate ? formatDisplayDate(selectedDate) : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sage-600">Uhrzeit</span>
                    <span className="font-medium text-sage-900">
                      {selectedTime ? formatTime(selectedTime.includes('T') ? selectedTime.split('T')[1] : selectedTime) : '-'}
                    </span>
                  </div>

                  {/* 3. Add-ons */}
                  {selectedAddons.length > 0 && (
                    <div className="flex justify-between">
                      <span className="text-sage-600">Add-ons</span>
                      <span className="font-medium text-sage-900">
                        {selectedAddons.map(a => a.name).join(', ')}
                      </span>
                    </div>
                  )}

                  {/* 4. Customer Info */}
                  <div className="border-t border-sage-200 pt-3">
                    <p className="text-xs text-sage-500 uppercase tracking-wider mb-2">Kundendaten</p>
                    <div className="flex justify-between">
                      <span className="text-sage-600">Name</span>
                      <span className="font-medium text-sage-900">{formData.customer_name}</span>
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
                  </div>

                  {/* 5. Coupon Discount */}
                  {couponState.valid && (
                    <div className="bg-green-50 -mx-2 px-2 py-2 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-green-700 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                          </svg>
                          Gutschein ({couponState.code})
                        </span>
                        <span className="font-semibold text-green-700">-{couponState.discount_percent > 0 ? `${couponState.discount_percent}%` : `€${(couponState.discount_cents / 100).toFixed(2)}`}</span>
                      </div>
                    </div>
                  )}

                  {/* 6. Deposit Status */}
                  <div className="bg-sage-100 -mx-2 px-2 py-2 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="text-sage-700 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                        {depositState.paymentMethod === 'card' ? 'Anzahlung bezahlt' : 'Anzahlung vor Ort'}
                      </span>
                      <span className="font-semibold text-sage-700">€{(calculateDeposit() / 100).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* 7. Anamnese Notes */}
                  {(anamneseData.allergies || anamneseData.medications || anamneseData.pregnancy || anamneseData.hair_conditions) && (
                    <div className="border-t border-sage-200 pt-3">
                      <p className="text-xs text-sage-500 uppercase tracking-wider mb-2">Gesundheitsfragebogen</p>
                      {anamneseData.allergies && (
                        <div className="flex justify-between">
                          <span className="text-sage-600">Allergien</span>
                          <span className="font-medium text-sage-900 text-right max-w-xs">{anamneseData.allergies}</span>
                        </div>
                      )}
                      {anamneseData.medications && (
                        <div className="flex justify-between">
                          <span className="text-sage-600">Medikamente</span>
                          <span className="font-medium text-sage-900 text-right max-w-xs">{anamneseData.medications}</span>
                        </div>
                      )}
                      {anamneseData.pregnancy && (
                        <div className="flex justify-between">
                          <span className="text-sage-600">Schwangerschaft</span>
                          <span className="font-medium text-sage-900">{anamneseData.pregnancy === 'yes' ? 'Ja' : 'Nein'}</span>
                        </div>
                      )}
                      {anamneseData.hair_conditions && (
                        <div className="flex justify-between">
                          <span className="text-sage-600">Haarerkrankungen</span>
                          <span className="font-medium text-sage-900 text-right max-w-xs">{anamneseData.hair_conditions}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* 8. Customer Notes */}
                  {formData.notes && (
                    <div className="border-t border-sage-200 pt-3">
                      <span className="text-sage-600">Notizen</span>
                      <p className="font-medium text-sage-900 mt-1 italic">"{formData.notes}"</p>
                    </div>
                  )}

                  {/* 9. Price Breakdown */}
                  <div className="border-t border-sage-200 pt-3 space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-sage-500">Service</span>
                      <span className="text-sage-700">€{((selectedService?.price || 0) / 100).toFixed(2)}</span>
                    </div>
                    {selectedAddons.length > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-sage-500">Add-ons</span>
                        <span className="text-sage-700">+€{(selectedAddons.reduce((s, a) => s + a.price_cents, 0) / 100).toFixed(2)}</span>
                      </div>
                    )}
                    {couponState.valid && (
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Rabatt</span>
                        <span>-€{(couponState.discount_cents / 100).toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-sage-500">Bereits bezahlt</span>
                      <span className="text-green-600">-€{(calculateDeposit() / 100).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-semibold text-lg pt-2 border-t border-sage-200">
                      <span className="text-sage-700">Restbetrag vor Ort</span>
                      <span className="text-sage-900">€{Math.max(0, (calculateTotal() - calculateDeposit()) / 100).toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* Feature highlights */}
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="flex items-center gap-2 text-sm text-sage-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kostenlose Stornierung
                  </div>
                  <div className="flex items-center gap-2 text-sm text-sage-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    SMS-Erinnerung
                  </div>
                  <div className="flex items-center gap-2 text-sm text-sage-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    SSL-verschlüsselt
                  </div>
                  <div className="flex items-center gap-2 text-sm text-sage-600">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Sofort-Bestätigung
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

          {/* Sticky Booking Summary Sidebar - visible on md+ screens, inside grid */}
          <div className="hidden md:block md:col-span-1">
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
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-8 py-4 text-center text-xs text-sage-500">
        <p>Bereitgestellt von BookCut</p>
      </footer>
    </div>
  );
}
