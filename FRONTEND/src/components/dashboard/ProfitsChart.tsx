
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { DailyProfits } from '../../types/dashboard';

interface ProfitsChartProps {
  data: DailyProfits;
}

export function ProfitsChart({ data }: ProfitsChartProps) {
  // Transform the data for the chart
  const chartData = [
    {
      name: 'Hoy',
      ventas: data.total_ventas,
      costos: data.total_costos,
      ganancias: data.ganancias
    }
  ];

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Resumen Financiero del Día</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 10
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`C$${value.toFixed(2)}`, '']}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="ventas"
              name="Total Ventas"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="costos"
              name="Total Costos"
              stroke="#EF4444"
              strokeWidth={2}
              dot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="ganancias"
              name="Ganancias"
              stroke="#10B981"
              strokeWidth={2}
              dot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-3 gap-4 mt-6">
        <div className="bg-indigo-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-indigo-800">Total Ventas</h3>
          <p className="mt-2 text-2xl font-semibold text-indigo-900">
            C${data.total_ventas.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Total Costos</h3>
          <p className="mt-2 text-2xl font-semibold text-red-900">
            C${data.total_costos.toFixed(2)}
          </p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Ganancias</h3>
          <p className="mt-2 text-2xl font-semibold text-green-900">
            C${data.ganancias.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}