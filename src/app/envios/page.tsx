import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Entregas',
  description: 'Información sobre las entregas de San Pablo.',
};

export default function EnviosPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Entregas
        </h1>
        <p className="mt-4 text-lg text-gray-600">
          El costo, la modalidad y el plazo de entrega se acuerdan por WhatsApp al confirmar cada pedido.
        </p>
      </div>
    </div>
  );
}
