import React, { useState } from 'react';
import { LogIn } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await login(email.trim(), password.trim());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocorreu um erro ao fazer login';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">PRAGMA</h2>
          <p className="text-gray-600 mb-1">Programa de Reservas para</p>
          <p className="text-gray-600">Gestão Modular de Ambientes</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 text-sm">
              {error}
            </div>
          )}
          
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Senha
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <LogIn className="w-5 h-5" />
            {loading ? 'Entrando...' : 'Entrar'}
          </button>

          <div className="bg-gray-50 rounded-lg p-4 mt-6">
            <h3 className="font-medium text-gray-900 mb-2">Credenciais de teste:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                <span className="font-medium text-gray-600">Admin:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">admin@pragma.com / admin123</code>
              </div>
              <div className="flex justify-between items-center p-2 bg-white rounded border border-gray-200">
                <span className="font-medium text-gray-600">Usuário:</span>
                <code className="bg-gray-100 px-2 py-1 rounded">user@pragma.com / user123</code>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};