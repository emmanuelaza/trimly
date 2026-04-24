import { getClients } from '@/app/actions/clients';
import { Card } from '@/components/ui/RedesignComponents';
import ClientesClient from './ClientesClient';

export const revalidate = 60;

export default async function ClientesPage() {
  let clientes = [];
  let error = false;

  try {
    clientes = await getClients();
  } catch (err) {
    console.error("Error loading ClientesPage:", err);
    error = true;
  }

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold text-text-primary">Directorio de Clientes</h1>
        <p className="text-sm text-text-tertiary mt-1">Gestiona tu base de datos y fidelización.</p>
      </div>

      {error ? (
        <Card className="bg-error/5 border-error/20 p-10 text-center">
          <p className="text-error font-medium">No pudimos cargar los clientes.</p>
          <p className="text-text-tertiary text-sm mt-2">Por favor, intenta recargar la página.</p>
        </Card>
      ) : (
        <ClientesClient initialClientes={clientes} />
      )}
    </div>
  );
}
