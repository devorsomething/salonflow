'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

interface BookingDetail {
  id: string;
  serviceName: string;
  stylistName: string;
  date: string;
  time: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  price: string;
}

function VerifyBookingContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get('token');
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      setError('Kein Buchungstoken gefunden.');
      setLoading(false);
      return;
    }

    // Decode token (base64 of booking.id)
    try {
      Buffer.from(token, 'base64').toString('utf-8');
    } catch {
      setError('Ungültiger Buchungslink.');
      setLoading(false);
      return;
    }

    // Fetch booking details from verify endpoint
    fetch(`/api/verify?token=${encodeURIComponent(token)}`, {
      credentials: 'include',
    })
      .then(res => {
        if (!res.ok) throw new Error('Booking not found');
        return res.json();
      })
      .then(data => {
        if (!data.booking) throw new Error('Booking not found');
        const b = data.booking;
        setBooking({
          id: b.id,
          serviceName: b.serviceName || '—',
          stylistName: b.stylistName || '—',
          date: b.date || '—',
          time: b.time || '—',
          customerName: b.customerName || '—',
          customerPhone: b.customerPhone || '—',
          customerEmail: b.customerEmail,
          price: b.price || '—',
        });
        setLoading(false);
      })
      .catch(() => {
        setError('Dieser Buchungslink ist ungültig oder abgelaufen.');
        setLoading(false);
      });
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sage-600 font-medium">Buchung wird geladen...</p>
        </div>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-sage-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Booking Not Found</h1>
          <p className="text-gray-500 mb-6">{error || 'Dieser Buchungslink ist ungültig oder abgelaufen.'}</p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 transition-colors"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-sage-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-sage-600 to-sage-500 px-8 py-10 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white mb-1">Termin erfolgreich gebucht!</h1>
          <p className="text-sage-100">Wir freuen uns auf Ihren Besuch</p>
        </div>

        {/* Details */}
        <div className="px-8 py-8 space-y-5">
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Service</span>
            <span className="font-semibold text-gray-900">{booking.serviceName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Stylist</span>
            <span className="font-semibold text-gray-900">{booking.stylistName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Datum</span>
            <span className="font-semibold text-gray-900">{booking.date}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Uhrzeit</span>
            <span className="font-semibold text-gray-900">{booking.time} Uhr</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Name</span>
            <span className="font-semibold text-gray-900">{booking.customerName}</span>
          </div>
          <div className="flex justify-between items-center py-3 border-b border-gray-100">
            <span className="text-gray-500 text-sm">Telefon</span>
            <span className="font-semibold text-gray-900">{booking.customerPhone}</span>
          </div>
          {booking.customerEmail && (
            <div className="flex justify-between items-center py-3 border-b border-gray-100">
              <span className="text-gray-500 text-sm">E-Mail</span>
              <span className="font-semibold text-gray-900">{booking.customerEmail}</span>
            </div>
          )}
          <div className="flex justify-between items-center pt-3">
            <span className="text-lg font-semibold text-gray-900">Gesamt</span>
            <span className="text-2xl font-bold text-sage-600">{booking.price}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-8 pb-8 text-center space-y-3">
          <p className="text-sm text-gray-400">
            Sie erhalten in Kürze eine Bestätigung per SMS.
          </p>
          <button
            onClick={() => router.push('/')}
            className="w-full px-6 py-3 bg-sage-600 text-white rounded-xl font-medium hover:bg-sage-700 transition-colors"
          >
            Zur Startseite
          </button>
        </div>
      </div>
    </div>
  );
}

export default function VerifyBookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-sage-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-sage-200 border-t-sage-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sage-600 font-medium">Buchung wird geladen...</p>
        </div>
      </div>
    }>
      <VerifyBookingContent />
    </Suspense>
  );
}
