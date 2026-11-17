'use client';

import { Mail, Phone, MapPin, MessageCircle, Clock } from 'lucide-react';
import { useStorefrontContact } from '@/hooks';
import { Skeleton } from '@/components/ui';

export default function ContactoPage() {
  const { data: contact, isLoading } = useStorefrontContact();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Contacto
        </h1>
        <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
          Canales de contacto de FP Jacques.
        </p>
      </div>

      <div className="mx-auto max-w-2xl">
        {/* Contact Info */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-6">
            Datos de contacto
          </h2>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
              <Skeleton className="h-16 w-full" />
            </div>
          ) : (
            <div className="space-y-6">
              {/* Address */}
              {contact?.address && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
                <div className="flex-shrink-0 p-2 bg-[var(--color-primary-50)] rounded-lg">
                  <MapPin className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Dirección</h3>
                  <p className="mt-1 text-gray-600">
                    {contact.address}
                  </p>
                </div>
              </div>
              )}

              {/* Phone */}
              {contact?.phone && (
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
                <div className="flex-shrink-0 p-2 bg-[var(--color-primary-50)] rounded-lg">
                  <Phone className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Teléfono</h3>
                  <a 
                    href={`tel:${contact.phone.replace(/\s/g, '')}`}
                    className="mt-1 text-[var(--color-primary)] hover:opacity-80"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>
              )}

              {/* Email */}
              {contact?.email && (
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
                  <div className="flex-shrink-0 p-2 bg-[var(--color-primary-50)] rounded-lg">
                    <Mail className="h-6 w-6 text-[var(--color-primary)]" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">Correo electrónico</h3>
                    <a
                      href={`mailto:${contact.email}`}
                      className="mt-1 text-[var(--color-primary)] hover:opacity-80"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              )}

              {/* WhatsApp */}
              {contact?.whatsappNumber && (
                <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
                  <div className="flex-shrink-0 p-2 bg-green-50 rounded-lg">
                    <MessageCircle className="h-6 w-6 text-green-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">WhatsApp</h3>
                    <a 
                      href={`https://wa.me/${contact.whatsappNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 text-green-600 hover:text-green-700"
                    >
                      {contact.whatsappNumber}
                    </a>
                  </div>
                </div>
              )}

              {/* Hours */}
              <div className="flex items-start gap-4 p-4 bg-white rounded-lg border">
                <div className="flex-shrink-0 p-2 bg-[var(--color-primary-50)] rounded-lg">
                  <Clock className="h-6 w-6 text-[var(--color-primary)]" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Horario de atención</h3>
                  <p className="mt-1 text-gray-600">
                    Lunes a Viernes: 9:00 AM - 6:00 PM<br />
                    Sábados: 9:00 AM - 1:00 PM
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
