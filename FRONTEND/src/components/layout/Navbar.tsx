import { useState } from 'react';
import { User, LogOut, UserCircle } from 'lucide-react';
import { ProfileModal } from '../modals/ProfileModal';
import { useProfile } from '../../hooks/useProfile';

export function Navbar() {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const { profile, isLoading } = useProfile();

  const handleProfileClick = () => {
    setShowUserMenu(false);
    setShowProfileModal(true);
  };

  return (
    <>
      <nav className="bg-white shadow-md px-6 py-4">
        <div className="flex justify-end items-center">
          <div className="flex items-center">
            <span className="mr-4 text-gray-700">
              {isLoading ? 'Cargando...' : `Bienvenido, ${profile?.nombre}`}
            </span>
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center focus:outline-none"
              >
                <User className="h-6 w-6 text-gray-700 hover:text-gray-900" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                  <button
                    onClick={handleProfileClick}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <UserCircle className="h-4 w-4 mr-2" />
                    Perfil
                  </button>
                  <button
                    onClick={() => {/* Implementar cierre de sesión */}}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Cerrar sesión
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {profile && (
        <ProfileModal
          isOpen={showProfileModal}
          onClose={() => setShowProfileModal(false)}
          userInfo={{
            name: profile.nombre,
            username: profile.username,
            phone: profile.telefono,
            personalId: profile.id_personal,
            userType: profile.user_type
          }}
        />
      )}
    </>
  );
}