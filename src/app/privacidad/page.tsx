import type { Metadata } from 'next';
import { getStorefrontConfig } from '@/lib/api/storefront-server';

export const metadata: Metadata = {
  title: 'Política de privacidad',
  description: 'Política de privacidad y protección de datos de FP Jacques.',
};

export default async function PrivacidadPage() {
  const config = await getStorefrontConfig();
  const email = config.contact.email;

  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
        Política de privacidad
      </h1>

      <div className="prose prose-gray max-w-none">
        <p className="text-gray-600 mb-6">
          Última actualización: noviembre de 2026
        </p>

        <div className="space-y-8">
          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">1. Información que se recopila</h2>
            <p className="text-gray-600">
              Se recopilan los datos ingresados al crear una cuenta o enviar un pedido: nombre, correo electrónico, número de WhatsApp y dirección de entrega.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">2. Uso de la información</h2>
            <p className="text-gray-600 mb-4">
              La información recopilada se utiliza para:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Procesar y entregar los pedidos</li>
              <li>Enviar confirmaciones y actualizaciones de los pedidos</li>
              <li>Responder consultas y solicitudes</li>
              <li>Mejorar los productos y servicios</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">3. Protección de datos</h2>
            <p className="text-gray-600">
              Se aplican medidas de seguridad técnicas y organizativas para proteger la información personal contra el acceso no autorizado, la alteración, la divulgación o la destrucción.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">4. Información compartida</h2>
            <p className="text-gray-600">
              Estos datos no se venden ni se alquilan. Solo se comparten con los proveedores de servicios necesarios para operar el sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">5. Cookies</h2>
            <p className="text-gray-600">
              Se utilizan cookies y tecnologías similares para mejorar la experiencia en el sitio, recordar preferencias y analizar el tráfico.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">6. Derechos</h2>
            <p className="text-gray-600 mb-4">
              Toda persona tiene derecho a:
            </p>
            <ul className="list-disc pl-6 text-gray-600 space-y-2">
              <li>Acceder a su información personal</li>
              <li>Corregir datos inexactos</li>
              <li>Solicitar la eliminación de sus datos</li>
              <li>Oponerse al procesamiento de sus datos</li>
              <li>Retirar su consentimiento en cualquier momento</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">7. Retención de datos</h2>
            <p className="text-gray-600">
              La información personal se conserva durante el tiempo necesario para cumplir con los propósitos descritos en esta política, salvo que la ley exija un período de retención más largo.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">8. Cambios a esta política</h2>
            <p className="text-gray-600">
              Esta política puede actualizarse periódicamente. Los cambios significativos se publican en este sitio.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-3">9. Contacto</h2>
            <p className="text-gray-600">
              {email
                ? `Para consultas sobre esta política, escribir a ${email}.`
                : 'Para consultas sobre esta política, usar los canales de la página de contacto.'}
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
