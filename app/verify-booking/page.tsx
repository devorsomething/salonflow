import { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import { Calendar, Clock, MapPin, Phone, Mail, ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Booking Confirmed — SalonFlow",
  description: "Your appointment has been confirmed",
};

interface PageProps {
  searchParams: Promise<{ token?: string; id?: string }>;
}

async function getBooking(token: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables");
    return null;
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey);

  // Try to find by token first (if token column exists in bookings view)
  let query = supabase
    .from("appointments")
    .select(
      `
      *,
      salons (id, name, slug, street, postal_code, city, phone, email),
      services (id, name, duration_min)
    `
    )

  // If token looks like a UUID, try finding by ID first
  if (token.includes("-") && token.length === 36) {
    const { data: bookingById, error: errorById } = await supabase
      .from("appointments")
      .select(
        `
        *,
        salons (id, name, slug, street, postal_code, city, phone, email),
        services (id, name, duration_min)
      `
      )
      .eq("id", token)
      .single();

    if (!errorById && bookingById) {
      return bookingById;
    }
  }

  // Otherwise try generic query
  const { data, error } = await query.eq("id", token).single();

  if (error || !data) {
    return null;
  }

  return data;
}

export default async function VerifyBookingPage({ searchParams }: PageProps) {
  const { token } = await searchParams;

  if (!token) {
    redirect("/");
  }

  const booking = await getBooking(token);

  if (!booking) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-sage-100 flex items-center justify-center">
            <ArrowLeft className="w-8 h-8 text-sage-600" />
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Booking Not Found
          </h1>
          <p className="text-gray-500 mb-6">
            This booking link may have expired or is invalid.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sage-600 hover:text-sage-700 font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to home
          </Link>
        </div>
      </div>
    );
  }

  const startTime = new Date(booking.start_time);
  const formattedDate = startTime.toLocaleDateString("en-AT", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = startTime.toLocaleTimeString("en-AT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const endTime = new Date(booking.end_time);
  const formattedEndTime = endTime.toLocaleTimeString("en-AT", {
    hour: "2-digit",
    minute: "2-digit",
  });

  const durationMin = Math.round(
    (endTime.getTime() - startTime.getTime()) / (1000 * 60)
  );

  const location = [booking.salons?.street, booking.salons?.postal_code, booking.salons?.city]
    .filter(Boolean)
    .join(", ");

  const calendarUrl = generateCalendarUrl({
    title: `${booking.services?.name || "Appointment"} at ${booking.salons?.name || "Salon"}`,
    startTime: booking.start_time,
    endTime: booking.end_time,
    location,
    description: `Your appointment for ${booking.services?.name || "service"} (${durationMin} min)`,
  });

  return (
    <div className="min-h-screen bg-[#f9f7f3] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-sage-100 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-sage-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 mb-2">
            Booking Confirmed!
          </h1>
          <p className="text-gray-500">
            A confirmation has been sent to your phone.
          </p>
        </div>

        {/* Booking Details Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-[#e5e0d8] overflow-hidden mb-6">
          {/* Salon Info */}
          <div className="px-6 py-4 border-b border-[#e5e0d8] bg-sage-50/50">
            <h2 className="font-semibold text-gray-900">
              {booking.salons?.name || "Salon"}
            </h2>
            {location && (
              <div className="flex items-start gap-2 mt-1 text-sm text-gray-500">
                <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>{location}</span>
              </div>
            )}
          </div>

          {/* Appointment Details */}
          <div className="px-6 py-5 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                <Calendar className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Date</p>
                <p className="font-medium text-gray-900">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                <Clock className="w-5 h-5 text-sage-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Time</p>
                <p className="font-medium text-gray-900">
                  {formattedTime} — {formattedEndTime} ({durationMin} min)
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 text-sage-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M14.121 14.121L19 19m-7-7l7-7m-7 7l-2.879 2.879M12 12L9.121 9.121m0 5.758a3 3 0 10-4.243-4.243 3 3 0 004.243 4.243z"
                  />
                </svg>
              </div>
              <div>
                <p className="text-sm text-gray-500">Service</p>
                <p className="font-medium text-gray-900">
                  {booking.services?.name || "Service"}
                </p>
              </div>
            </div>

            {booking.notes && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-sage-100 flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-sage-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M7.5 8.25h9m-9 3H12m-9.75 1.51c0 1.6 1.123 2.994 2.707 3.227 1.129.166 2.27.293 3.423.379.35.026.67.21.865.501L12 21l2.755-4.133a1.14 1.14 0 01.865-.501 48.172 48.172 0 003.423-.379c1.584-.233 2.707-1.626 2.707-3.228V6.741c0-1.602-1.123-2.995-2.707-3.228A48.394 48.394 0 0012 3c-2.392 0-4.744.175-7.043.513C3.373 3.746 2.25 5.14 2.25 6.741v6.018z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Notes</p>
                  <p className="font-medium text-gray-900">{booking.notes}</p>
                </div>
              </div>
            )}
          </div>

          {/* Contact Info */}
          {(booking.salons?.phone || booking.salons?.email) && (
            <div className="px-6 py-4 border-t border-[#e5e0d8] bg-stone-50/30">
              <p className="text-xs text-gray-400 mb-2">Salon Contact</p>
              <div className="flex flex-wrap gap-4">
                {booking.salons?.phone && (
                  <a
                    href={`tel:${booking.salons.phone}`}
                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-sage-600"
                  >
                    <Phone className="w-4 h-4" />
                    {booking.salons.phone}
                  </a>
                )}
                {booking.salons?.email && (
                  <a
                    href={`mailto:${booking.salons.email}`}
                    className="flex items-center gap-1.5 text-sm text-gray-700 hover:text-sage-600"
                  >
                    <Mail className="w-4 h-4" />
                    {booking.salons.email}
                  </a>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="space-y-3">
          <a
            href={calendarUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-sage-600 hover:bg-sage-700 text-white font-medium rounded-xl transition-colors duration-150"
          >
            <Calendar className="w-5 h-5" />
            Add to Calendar
          </a>

          <Link
            href={`/book/${booking.salons?.slug || ""}`}
            className="flex items-center justify-center gap-2 w-full px-6 py-3.5 bg-white hover:bg-sage-50 text-gray-900 font-medium rounded-xl border border-[#e5e0d8] transition-colors duration-150"
          >
            <ArrowLeft className="w-4 h-4" />
            Book Another Appointment
          </Link>

          <p className="text-center pt-4">
            <a
              href={`mailto:${booking.salons?.email}?subject=Cancel Booking - ${startTime.toLocaleDateString()}`}
              className="text-sm text-gray-400 hover:text-sage-600 underline underline-offset-4"
            >
              Cancel this booking
            </a>
          </p>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-gray-400 mt-8">
          Need to reschedule? Contact the salon directly or cancel and rebook.
        </p>
      </div>
    </div>
  );
}

function generateCalendarUrl({
  title,
  startTime,
  endTime,
  location,
  description,
}: {
  title: string;
  startTime: string;
  endTime: string;
  location: string;
  description: string;
}): string {
  const startDate = new Date(startTime);
  const endDate = new Date(endTime);

  const formatDate = (d: Date) =>
    d.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${formatDate(startDate)}/${formatDate(endDate)}`,
    location,
    details: description,
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}
