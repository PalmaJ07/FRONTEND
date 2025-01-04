import { useNavigate } from 'react-router-dom';
import { LucideIcon } from 'lucide-react';

interface SettingsCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  path: string;
}

export function SettingsCard({ icon: Icon, title, description, path }: SettingsCardProps) {
  const navigate = useNavigate();

  return (
    <div
      onClick={() => navigate(path)}
      className="bg-white rounded-xl shadow-lg p-6 cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-xl"
    >
      <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-full mb-4">
        <Icon className="h-8 w-8 text-indigo-600" />
      </div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  );
}