import React, { useState } from 'react';
import { X, Eye, EyeOff } from 'lucide-react';
import { Staff } from '../../types/users';

interface PasswordChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, password: string) => Promise<void>;
  staff: Staff;
}

export function PasswordChangeModal({ 
  isOpen, 
  onClose, 
  onSubmit,
  staff 
}: PasswordChangeModalProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword === confirmPassword) {
      await onSubmit(staff.id, newPassword);
      setNewPassword('');
      setConfirmPassword('');
    }
  };

  const passwordsMatch = newPassword === confirmPassword;
  const isValidPassword = newPassword.length >= 6;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Cambiar Contraseña</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <input
                type="text"
                value={staff.name}
                className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded-md"
                disabled
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nueva Contraseña
              </label>
              <input
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-2 top-8 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            {newPassword && (
              <div>
                {!isValidPassword && (
                  <p className="text-sm text-red-600">
                    La contraseña debe tener al menos 6 caracteres
                  </p>
                )}
                {isValidPassword && !passwordsMatch && (
                  <p className="text-sm text-red-600">
                    Las contraseñas no coinciden
                  </p>
                )}
                {isValidPassword && passwordsMatch && (
                  <p className="text-sm text-green-600">
                    Las contraseñas coinciden
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={!passwordsMatch || !isValidPassword}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}