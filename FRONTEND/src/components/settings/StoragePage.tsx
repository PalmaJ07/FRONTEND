import { PageHeader } from '../../components/layout/PageHeader';
import { ConfigList } from '../../components/config/ConfigList';
import { createConfigService } from '../../services/config';

const storageService = createConfigService('almacen');

export function StoragePage() {
  return (
    <div className="p-6">
      <PageHeader title="Gestión de Almacén" />
      <ConfigList 
        title="Almacén"
        service={storageService}
      />
    </div>
  );
}