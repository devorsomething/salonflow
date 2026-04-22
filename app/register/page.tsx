"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

type PlanKey = "starter" | "business" | "premium";

interface Plan {
  key: PlanKey;
  name: string;
  price: number;
  features: string[];
  recommended?: boolean;
}

interface SalonInfo {
  salon_name: string;
  owner_name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  password: string;
  confirm_password: string;
}

interface PlanSelection {
  plan: PlanKey;
  planName: string;
  planPrice: number;
}

interface PaymentInfo {
  cardNumber: string;
  expiry: string;
  cvv: string;
}

const PLANS: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    price: 58.8,
    features: [
      "Bis zu 100 Terminbuchungen/Monat",
      "E-Mail-Erinnerungen",
      "Basis-Kundenverwaltung",
      "1 Benutzer",
    ],
  },
  {
    key: "business",
    name: "Business",
    price: 106.8,
    features: [
      "Unbegrenzte Terminbuchungen",
      "SMS & E-Mail-Erinnerungen",
      "Erweiterte Kundenverwaltung",
      "Bis zu 3 Benutzer",
      "Online-Buchung widget",
    ],
    recommended: true,
  },
  {
    key: "premium",
    name: "Premium",
    price: 178.8,
    features: [
      "Alles aus Business",
      "Unbegrenzte Benutzer",
      "Warteliste",
      "Premium Support",
      "API-Zugang",
      "White-Label-Option",
    ],
  },
];

const TOTAL_STEPS = 4;

function formatCardNumber(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  const groups = cleaned.match(/.{1,4}/g);
  return groups ? groups.join(" ") : "";
}

function formatExpiry(value: string): string {
  const cleaned = value.replace(/\D/g, "");
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4);
  }
  return cleaned;
}

function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\+\(\)]{8,}$/;
  return phoneRegex.test(phone);
}

export default function RegisterPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [direction, setDirection] = useState<"forward" | "backward">("forward");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [salonInfo, setSalonInfo] = useState<SalonInfo>({
    salon_name: "",
    owner_name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    password: "",
    confirm_password: "",
  });

  const [planSelection, setPlanSelection] = useState<PlanSelection>({
    plan: "business",
    planName: "Business",
    planPrice: 106.8,
  });

  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>({
    cardNumber: "",
    expiry: "",
    cvv: "",
  });

  const [errors, setErrors] = useState<Partial<Record<keyof SalonInfo | keyof PaymentInfo, string>>>({});

  // Validation for Step 1
  const validateStep1 = (): boolean => {
    const newErrors: typeof errors = {};

    if (!salonInfo.salon_name.trim()) {
      newErrors.salon_name = "Salonname ist erforderlich";
    }
    if (!salonInfo.owner_name.trim()) {
      newErrors.owner_name = "Name des Inhabers ist erforderlich";
    }
    if (!salonInfo.email.trim()) {
      newErrors.email = "E-Mail ist erforderlich";
    } else if (!validateEmail(salonInfo.email)) {
      newErrors.email = "Ungültige E-Mail-Adresse";
    }
    if (!salonInfo.phone.trim()) {
      newErrors.phone = "Telefonnummer ist erforderlich";
    } else if (!validatePhone(salonInfo.phone)) {
      newErrors.phone = "Ungültige Telefonnummer";
    }
    if (!salonInfo.address.trim()) {
      newErrors.address = "Adresse ist erforderlich";
    }
    if (!salonInfo.city.trim()) {
      newErrors.city = "Stadt ist erforderlich";
    }
    if (!salonInfo.password) {
      newErrors.password = "Passwort ist erforderlich";
    } else if (salonInfo.password.length < 6) {
      newErrors.password = "Passwort muss mindestens 6 Zeichen haben";
    }
    if (salonInfo.password !== salonInfo.confirm_password) {
      newErrors.confirm_password = "Passwörter stimmen nicht überein";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validation for Step 2
  const validateStep2 = (): boolean => {
    if (!planSelection.plan) {
      setError("Bitte wählen Sie einen Plan aus");
      return false;
    }
    return true;
  };

  // Validation for Step 3
  const validateStep3 = (): boolean => {
    const newErrors: typeof errors = {};
    const cleanedCard = paymentInfo.cardNumber.replace(/\s/g, "");

    if (!paymentInfo.cardNumber.trim()) {
      newErrors.cardNumber = "Kartennummer ist erforderlich";
    } else if (cleanedCard.length < 13 || cleanedCard.length > 19) {
      newErrors.cardNumber = "Ungültige Kartennummer";
    }

    if (!paymentInfo.expiry.trim()) {
      newErrors.expiry = "Ablaufdatum ist erforderlich";
    } else {
      const expiryRegex = /^(0[1-9]|1[0-2])\/\d{2}$/;
      if (!expiryRegex.test(paymentInfo.expiry)) {
        newErrors.expiry = "Format: MM/YY";
      }
    }

    if (!paymentInfo.cvv.trim()) {
      newErrors.cvv = "CVV ist erforderlich";
    } else if (!/^\d{3,4}$/.test(paymentInfo.cvv)) {
      newErrors.cvv = "Ungültige CVV";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    setError("");

    if (currentStep === 1 && !validateStep1()) {
      return;
    }
    if (currentStep === 2 && !validateStep2()) {
      return;
    }
    if (currentStep === 3 && !validateStep3()) {
      return;
    }

    setDirection("forward");
    setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError("");
    setDirection("backward");
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          salon: salonInfo,
          plan: planSelection,
          payment: paymentInfo,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Registrierung fehlgeschlagen");
        return;
      }

      if (data.success) {
        localStorage.setItem("salonflow_token", data.token);
        localStorage.setItem(
          "salonflow_user",
          JSON.stringify({ email: data.salon.email, name: data.salon.name })
        );
        router.push("/admin");
      }
    } catch {
      setError("Verbindungsfehler. Bitte versuchen Sie es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCardNumber(e.target.value);
    setPaymentInfo({ ...paymentInfo, cardNumber: formatted });
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatExpiry(e.target.value);
    setPaymentInfo({ ...paymentInfo, expiry: formatted });
  };

  const handlePlanSelect = (plan: Plan) => {
    setPlanSelection({
      plan: plan.key,
      planName: plan.name,
      planPrice: plan.price,
    });
  };

  return (
    <main className="min-h-screen py-12 px-4 bg-sand-50">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-semibold text-[#0F1C3F] mb-2">
            SalonFlow
          </h1>
          <p className="text-[#0F1C3F]/70">
            Erstellen Sie Ihr Konto in wenigen Schritten
          </p>
        </div>

        {/* Progress Indicator */}
        <div className="mb-10">
          <div className="flex items-center justify-center">
            {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300 ${
                    step < currentStep
                      ? "bg-[#C9A84C] text-white"
                      : step === currentStep
                      ? "bg-[#0F1C3F] text-white"
                      : "bg-sand-200 text-[#0F1C3F]/50"
                  }`}
                >
                  {step < currentStep ? (
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
                    step
                  )}
                </div>
                {step < TOTAL_STEPS && (
                  <div
                    className={`w-16 h-1 mx-2 rounded transition-all duration-300 ${
                      step < currentStep ? "bg-[#C9A84C]" : "bg-sand-200"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-3">
            <span className="text-sm text-[#0F1C3F]/60">
              Schritt {currentStep} von {TOTAL_STEPS}
            </span>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-sand-200 overflow-hidden">
          {/* Step 1: Salon Info */}
          {currentStep === 1 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-[#0F1C3F] mb-6">
                Salon-Informationen
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                    Salonname *
                  </label>
                  <input
                    type="text"
                    value={salonInfo.salon_name}
                    onChange={(e) =>
                      setSalonInfo({ ...salonInfo, salon_name: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border bg-sand-50 text-[#0F1C3F] placeholder-[#0F1C3F]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                      errors.salon_name ? "border-red-400" : "border-sand-300"
                    }`}
                    placeholder="z.B. Hairstudio Maria"
                  />
                  {errors.salon_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.salon_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                    Name des Inhabers *
                  </label>
                  <input
                    type="text"
                    value={salonInfo.owner_name}
                    onChange={(e) =>
                      setSalonInfo({ ...salonInfo, owner_name: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border bg-sand-50 text-[#0F1C3F] placeholder-[#0F1C3F]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                      errors.owner_name ? "border-red-400" : "border-sand-300"
                    }`}
                    placeholder="z.B. Maria Huber"
                  />
                  {errors.owner_name && (
                    <p className="text-red-500 text-xs mt-1">{errors.owner_name}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                    E-Mail-Adresse *
                  </label>
                  <input
                    type="email"
                    value={salonInfo.email}
                    onChange={(e) =>
                      setSalonInfo({ ...salonInfo, email: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border bg-sand-50 text-[#0F1C3F] placeholder-[#0F1C3F]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                      errors.email ? "border-red-400" : "border-sand-300"
                    }`}
                    placeholder="ihr@salon.at"
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                    Telefonnummer *
                  </label>
                  <input
                    type="tel"
                    value={salonInfo.phone}
                    onChange={(e) =>
                      setSalonInfo({ ...salonInfo, phone: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border bg-sand-50 text-[#0F1C3F] placeholder-[#0F1C3F]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                      errors.phone ? "border-red-400" : "border-sand-300"
                    }`}
                    placeholder="+43 1 2345678"
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
                  )}
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={salonInfo.address}
                    onChange={(e) =>
                      setSalonInfo({ ...salonInfo, address: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border bg-sand-50 text-[#0F1C3F] placeholder-[#0F1C3F]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                      errors.address ? "border-red-400" : "border-sand-300"
                    }`}
                    placeholder="Straße und Hausnummer"
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                    Stadt *
                  </label>
                  <input
                    type="text"
                    value={salonInfo.city}
                    onChange={(e) =>
                      setSalonInfo({ ...salonInfo, city: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border bg-sand-50 text-[#0F1C3F] placeholder-[#0F1C3F]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                      errors.city ? "border-red-400" : "border-sand-300"
                    }`}
                    placeholder="z.B. Wien"
                  />
                  {errors.city && (
                    <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                    Passwort *
                  </label>
                  <input
                    type="password"
                    value={salonInfo.password}
                    onChange={(e) =>
                      setSalonInfo({ ...salonInfo, password: e.target.value })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border bg-sand-50 text-[#0F1C3F] placeholder-[#0F1C3F]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                      errors.password ? "border-red-400" : "border-sand-300"
                    }`}
                    placeholder="Mindestens 6 Zeichen"
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                    Passwort bestätigen *
                  </label>
                  <input
                    type="password"
                    value={salonInfo.confirm_password}
                    onChange={(e) =>
                      setSalonInfo({
                        ...salonInfo,
                        confirm_password: e.target.value,
                      })
                    }
                    className={`w-full px-4 py-2.5 rounded-lg border bg-sand-50 text-[#0F1C3F] placeholder-[#0F1C3F]/40 focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                      errors.confirm_password ? "border-red-400" : "border-sand-300"
                    }`}
                    placeholder="Passwort wiederholen"
                  />
                  {errors.confirm_password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirm_password}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Plan Selection */}
          {currentStep === 2 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-[#0F1C3F] mb-2">
                Wählen Sie Ihren Plan
              </h2>
              <p className="text-[#0F1C3F]/60 mb-6">
                Alle Preise inkl. 20% MwSt. monatlich
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {PLANS.map((plan) => (
                  <div
                    key={plan.key}
                    onClick={() => handlePlanSelect(plan)}
                    className={`relative cursor-pointer rounded-xl border-2 p-5 transition-all duration-200 ${
                      planSelection.plan === plan.key
                        ? "border-[#C9A84C] bg-[#C9A84C]/5 shadow-md"
                        : "border-sand-200 hover:border-[#C9A84C]/50"
                    }`}
                  >
                    {plan.recommended && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#0F1C3F] text-white text-xs px-3 py-1 rounded-full">
                        Beliebt
                      </div>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-[#0F1C3F]">
                        {plan.name}
                      </h3>
                      {planSelection.plan === plan.key && (
                        <div className="w-5 h-5 rounded-full bg-[#C9A84C] flex items-center justify-center">
                          <svg
                            className="w-3 h-3 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={3}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <span className="text-2xl font-bold text-[#0F1C3F]">
                        €{plan.price.toFixed(2)}
                      </span>
                      <span className="text-[#0F1C3F]/60 text-sm">/Monat</span>
                    </div>

                    <ul className="space-y-2">
                      {plan.features.map((feature, i) => (
                        <li
                          key={i}
                          className="flex items-start gap-2 text-sm text-[#0F1C3F]/80"
                        >
                          <svg
                            className="w-4 h-4 text-[#C9A84C] mt-0.5 flex-shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Step 3: Payment */}
          {currentStep === 3 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-[#0F1C3F] mb-6">
                Zahlungsinformationen
              </h2>

              <div className="max-w-md mx-auto">
                <div className="bg-sand-50 rounded-xl p-6 border border-sand-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex gap-1">
                      <div className="w-8 h-5 rounded bg-blue-900"></div>
                      <div className="w-8 h-5 rounded bg-red-500"></div>
                      <div className="w-8 h-5 rounded bg-yellow-400"></div>
                    </div>
                    <span className="text-sm text-[#0F1C3F]/60">
                      Sichere Zahlung
                    </span>
                  </div>

                  <div className="space-y-5">
                    <div>
                      <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                        Kartennummer
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          value={paymentInfo.cardNumber}
                          onChange={handleCardNumberChange}
                          maxLength={19}
                          className={`w-full px-4 py-2.5 pr-10 rounded-lg border bg-white text-[#0F1C3F] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                            errors.cardNumber ? "border-red-400" : "border-sand-300"
                          }`}
                          placeholder="1234 5678 9012 3456"
                        />
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                          <svg
                            className="w-6 h-4 text-[#0F1C3F]/30"
                            viewBox="0 0 32 20"
                            fill="currentColor"
                          >
                            <rect width="32" height="20" rx="2" />
                          </svg>
                        </div>
                      </div>
                      {errors.cardNumber && (
                        <p className="text-red-500 text-xs mt-1">
                          {errors.cardNumber}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                          Ablaufdatum
                        </label>
                        <input
                          type="text"
                          value={paymentInfo.expiry}
                          onChange={handleExpiryChange}
                          maxLength={5}
                          className={`w-full px-4 py-2.5 rounded-lg border bg-white text-[#0F1C3F] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                            errors.expiry ? "border-red-400" : "border-sand-300"
                          }`}
                          placeholder="MM/JJ"
                        />
                        {errors.expiry && (
                          <p className="text-red-500 text-xs mt-1">
                            {errors.expiry}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#0F1C3F] mb-1">
                          CVV
                        </label>
                        <div className="relative">
                          <input
                            type="text"
                            value={paymentInfo.cvv}
                            onChange={(e) =>
                              setPaymentInfo({
                                ...paymentInfo,
                                cvv: e.target.value.replace(/\D/g, "").slice(0, 4),
                              })
                            }
                            maxLength={4}
                            className={`w-full px-4 py-2.5 rounded-lg border bg-white text-[#0F1C3F] focus:outline-none focus:ring-2 focus:ring-[#C9A84C] focus:border-transparent transition ${
                              errors.cvv ? "border-red-400" : "border-sand-300"
                            }`}
                            placeholder="123"
                          />
                          <svg
                            className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#0F1C3F]/30"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                            />
                          </svg>
                        </div>
                        {errors.cvv && (
                          <p className="text-red-500 text-xs mt-1">{errors.cvv}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Confirmation */}
          {currentStep === 4 && (
            <div className="p-8">
              <h2 className="text-xl font-semibold text-[#0F1C3F] mb-6">
                Zusammenfassung
              </h2>

              <div className="space-y-6">
                {/* Salon Info */}
                <div className="bg-sand-50 rounded-xl p-5 border border-sand-200">
                  <h3 className="font-medium text-[#0F1C3F] mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#C9A84C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                      />
                    </svg>
                    Salon-Informationen
                  </h3>
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <span className="text-[#0F1C3F]/60">Salon:</span>
                      <p className="font-medium text-[#0F1C3F]">
                        {salonInfo.salon_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#0F1C3F]/60">Inhaber:</span>
                      <p className="font-medium text-[#0F1C3F]">
                        {salonInfo.owner_name}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#0F1C3F]/60">E-Mail:</span>
                      <p className="font-medium text-[#0F1C3F]">
                        {salonInfo.email}
                      </p>
                    </div>
                    <div>
                      <span className="text-[#0F1C3F]/60">Telefon:</span>
                      <p className="font-medium text-[#0F1C3F]">
                        {salonInfo.phone}
                      </p>
                    </div>
                    <div className="col-span-2">
                      <span className="text-[#0F1C3F]/60">Adresse:</span>
                      <p className="font-medium text-[#0F1C3F]">
                        {salonInfo.address}, {salonInfo.city}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan Selection */}
                <div className="bg-sand-50 rounded-xl p-5 border border-sand-200">
                  <h3 className="font-medium text-[#0F1C3F] mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#C9A84C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    Ausgewählter Plan
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-[#0F1C3F] text-lg">
                        {planSelection.planName}
                      </p>
                      <p className="text-sm text-[#0F1C3F]/60">
                        Monatliche Zahlung
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-[#0F1C3F]">
                        €{planSelection.planPrice.toFixed(2)}
                      </p>
                      <p className="text-sm text-[#0F1C3F]/60">inkl. 20% MwSt.</p>
                    </div>
                  </div>
                </div>

                {/* Payment Info */}
                <div className="bg-sand-50 rounded-xl p-5 border border-sand-200">
                  <h3 className="font-medium text-[#0F1C3F] mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-[#C9A84C]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                      />
                    </svg>
                    Zahlungsinformationen
                  </h3>
                  <div className="flex items-center gap-4">
                    <div className="bg-white rounded-lg px-4 py-3 border border-sand-200">
                      <p className="text-sm text-[#0F1C3F]/60">Kartennummer</p>
                      <p className="font-medium text-[#0F1C3F] font-mono">
                        •••• {paymentInfo.cardNumber.replace(/\s/g, "").slice(-4)}
                      </p>
                    </div>
                    <div className="bg-white rounded-lg px-4 py-3 border border-sand-200">
                      <p className="text-sm text-[#0F1C3F]/60">Ablauf</p>
                      <p className="font-medium text-[#0F1C3F] font-mono">
                        {paymentInfo.expiry}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Total */}
                <div className="bg-[#0F1C3F] rounded-xl p-5 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">Zu zahlen</p>
                      <p className="text-sm text-white/60">Monatlich, first billing</p>
                    </div>
                    <p className="text-3xl font-bold">€{planSelection.planPrice.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mx-8 mb-4 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="px-8 py-6 bg-sand-50 border-t border-sand-200 flex items-center justify-between">
            {currentStep > 1 ? (
              <button
                onClick={handleBack}
                className="px-6 py-2.5 rounded-lg border border-sand-300 text-[#0F1C3F] hover:bg-sand-100 transition font-medium"
              >
                Zurück
              </button>
            ) : (
              <div />
            )}

            {currentStep < TOTAL_STEPS ? (
              <button
                onClick={handleNext}
                className="px-8 py-2.5 rounded-lg bg-[#0F1C3F] hover:bg-[#0F1C3F]/90 text-white transition font-medium"
              >
                Weiter
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="px-8 py-2.5 rounded-lg bg-[#C9A84C] hover:bg-[#C9A84C]/90 disabled:bg-[#C9A84C]/50 text-white transition font-medium"
              >
                {loading ? "Wird erstellt..." : "Account erstellen"}
              </button>
            )}
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-sm text-[#0F1C3F]/50 mt-6">
          Mit der Erstellung eines Kontos stimmen Sie unseren{" "}
          <a href="/agb" className="text-[#C9A84C] hover:underline">
            AGB
          </a>{" "}
          und{" "}
          <a href="/datenschutz" className="text-[#C9A84C] hover:underline">
            Datenschutzrichtlinien
          </a>{" "}
          zu.
        </p>
      </div>
    </main>
  );
}
