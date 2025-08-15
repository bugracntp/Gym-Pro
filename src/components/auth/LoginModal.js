import React, { useState } from 'react';
import { Lock, Eye, EyeOff, Dumbbell } from 'lucide-react';
import Modal from '../ui/Modal';
import Input from '../ui/Input';
import Button from '../ui/Button';
import logo from '../../assets/logo.jpg';

const LoginModal = ({ isOpen, onLogin, onClose }) => {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Form submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!password.trim()) {
      setError('Şifre gerekli');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onLogin(password);
      // Başarılı giriş sonrası state temizleme
      setPassword('');
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Password visibility toggle
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      closeOnOverlayClick={false}
      closeOnEscape={false}
    >
      <div className="p-8 space-y-8">
        {/* Header */}
        <div className="text-center space-y-6">
          {/* Logo */}
          <div className="flex justify-center">
            <Dumbbell size={20} className="text-white" />
          </div>
          
          <div>
            <h2 className="text-2xl font-bold text-slate-900">
              GYM Pro
            </h2>
            <p className="text-slate-600 mt-1">
              Yönetim Sistemi
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Password Input */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-slate-700">
              Admin Şifresi
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Şifrenizi girin"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
                className="w-full px-4 py-3 pl-12 pr-12 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 disabled:bg-slate-50 transition-colors duration-200"
              />
              {/* Left Icon */}
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              {/* Right Icon */}
              <button
                type="button"
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors duration-200"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            variant="primary"
            size="lg"
            loading={loading}
            disabled={loading}
            className="w-full bg-orange-600 hover:bg-orange-700 text-white font-medium py-3 px-6 rounded-xl transition-colors duration-200"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Giriş Yapılıyor...</span>
              </div>
            ) : (
              <span>Giriş Yap</span>
            )}
          </Button>
        </form>
      </div>
    </Modal>
  );
};

export default LoginModal; 