import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Devoluciones',
  description: 'Información sobre devoluciones en San Pablo.',
};

export default function DevolucionesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Devoluciones
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          Las condiciones de devolución se acuerdan por WhatsApp.
        </p>
      </div>
    </div>
  );
}
