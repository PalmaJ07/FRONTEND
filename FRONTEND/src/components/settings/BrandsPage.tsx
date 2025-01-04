import { PageHeader } from '../../components/layout/PageHeader';
import { ConfigList } from '../../components/config/ConfigList';
import { createConfigService } from '../../services/config';

const brandsService = createConfigService('marca');

export function BrandsPage() {
  return (
    <div className="p-6">
      <PageHeader title="Gestión de Marcas" />
      <ConfigList 
        title="Marca"
        service={brandsService}
      />
    </div>
  );
}
