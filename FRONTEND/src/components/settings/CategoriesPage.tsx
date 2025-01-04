import { PageHeader } from '../../components/layout/PageHeader';
import { ConfigList } from '../../components/config/ConfigList';
import { createConfigService } from '../../services/config';

const categoriesService = createConfigService('categoria');

export function CategoriesPage() {
  return (
    <div className="p-6">
      <PageHeader title="Gestión de Categorías" />
      <ConfigList 
        title="Categoría"
        service={categoriesService}
      />
    </div>
  );
}
