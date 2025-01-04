import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../components/LoginForm';
import { login } from '../services/auth';
import Swal from 'sweetalert2';

export function LoginPage() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (username: string, password: string) => {
    setIsLoading(true);
    try {
      const success = await login(username, password);
      console.log('Login success:', success);
      
      // If we get here, we have a token
      await Swal.fire({
        title: 'Éxito',
        text: 'Inicio de sesión exitoso',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      });
      navigate('/index');
    } catch (error: any) {
      console.error('Login handler error:', error);
      await Swal.fire({
        title: 'Error',
        text: error.response?.data?.detail || 'Error al intentar iniciar sesión',
        icon: 'error',
        confirmButtonColor: '#EF4444',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center p-4">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}