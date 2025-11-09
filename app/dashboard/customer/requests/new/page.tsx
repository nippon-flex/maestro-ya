import NewRequestForm from './new-request-form';

export default function NewRequestPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Nueva Solicitud de Servicio</h1>
        <p className="text-gray-600 mt-2">
          Describe tu necesidad y recibe cotizaciones de maestros verificados
        </p>
      </div>
      <NewRequestForm />
    </div>
  );
}