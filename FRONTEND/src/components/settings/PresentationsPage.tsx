import { PageHeader } from '../../components/layout/PageHeader';
import { ConfigList } from '../../components/config/ConfigList';
import { createConfigService } from '../../services/config';

const presentationsService = createConfigService('presentacion');

export function PresentationsPage() {
  return (
    <div className="p-6">
      <PageHeader title="Gestión de Presentaciones" />
      <ConfigList 
        title="Presentación"
        service={presentationsService}
      />
    </div>
  );
}