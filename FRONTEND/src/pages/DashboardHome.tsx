import React, { useState, useEffect } from 'react';
import { TopProductsChart } from '../components/dashboard/TopProductsChart';
import { TopUsersChart } from '../components/dashboard/TopusersChart';
import { dashboardService } from '../services/dashboard';
import { TopProduct, TopUser } from '../types/dashboard';

export function DashboardHome() {
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);
        const [products, users] = await Promise.all([
          dashboardService.getTopProducts(),
          dashboardService.getTopUsers()
        ]);
        setTopProducts(products);
        setTopUsers(users);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>
      
      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-4">Cargando datos...</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <TopProductsChart data={topProducts} />
            <TopUsersChart data={topUsers} />
          </div>
        )}
      </div>
    </div>
  );
}