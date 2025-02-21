import { ReactNode } from 'react';
import { Edit2, Trash2, KeyRound } from 'lucide-react';

interface Column<T> {
  header: string;
  accessor: keyof T;
  render?: (value: T[keyof T], item: T) => ReactNode;
}

interface TablaColaboradoresProps<T> {
  data: T[];
  columns: Column<T>[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onPasswordChange?: (item: T) => void;
}

export function TableColaborador<T extends { id: string }>({ 
  data, 
  columns, 
  onEdit, 
  onDelete,
  onPasswordChange
}: TablaColaboradoresProps<T>) {
  const showActions = onEdit !== undefined || onDelete !== undefined || onPasswordChange !== undefined;

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {columns.map((column) => (
              <th
                key={column.header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {column.header}
              </th>
            ))}
            {showActions && (
              <th className="px-6 py-3 text-right">Acciones</th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {data.map((item) => (
            <tr key={item.id}>
              {columns.map((column) => (
                <td
                  key={column.header}
                  className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                >
                  {column.render 
                    ? column.render(item[column.accessor], item)
                    : String(item[column.accessor])}
                </td>
              ))}
              {showActions && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {onEdit && (
                    <button
                      onClick={() => onEdit(item)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                      title="Editar"
                    >
                      <Edit2 className="h-4 w-4" />
                    </button>
                  )}
                  {onPasswordChange && (
                    <button
                      onClick={() => onPasswordChange(item)}
                      className="text-yellow-600 hover:text-yellow-900 mr-4"
                      title="Cambiar contraseña"
                    >
                      <KeyRound className="h-4 w-4" />
                    </button>
                  )}
                  {onDelete && (
                    <button
                      onClick={() => onDelete(item)}
                      className="text-red-600 hover:text-red-900"
                      title="Eliminar"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}