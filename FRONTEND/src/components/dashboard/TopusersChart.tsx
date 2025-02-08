import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import { TopUser } from '../../types/dashboard';

interface TopUsersChartProps {
  data: TopUser[];
}

export function TopUsersChart({ data }: TopUsersChartProps) {
  const chartData = data.map(item => ({
    name: item.user__name,
    ventas: item.total_ventas
  }));

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">Usuarios con Más Ventas</h2>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 60
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis
              dataKey="name"
              angle={-45}
              textAnchor="end"
              height={80}
              interval={0}
            />
            <YAxis />
            <Tooltip 
              formatter={(value: number) => [`C$${value.toFixed(2)}`, 'Total Ventas']}
            />
            <Bar
              dataKey="ventas"
              fill="#10B981"
              name="Total Ventas"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}