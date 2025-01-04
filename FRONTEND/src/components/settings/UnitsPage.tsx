import { PageHeader } from '../../components/layout/PageHeader';
import { ConfigList } from '../../components/config/ConfigList';
import { createConfigService } from '../../services/config';

const unitsService = createConfigService('unidad-medida');

export function UnitsPage() {
  return (
    <div className="p-6">
      <PageHeader title="Gestión de Unidades de Medida" />
      <ConfigList 
        title="Unidad de Medida"
        service={unitsService}
      />
    </div>
  );
}
