import React, { useState, useEffect } from 'react';
import {
  X,
  Lock,
  Unlock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
} from 'lucide-react';
import { CashierUser, CashierShift } from '../types';
import { playSound } from '../utils/sound';

interface CashierLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  cashiers: CashierUser[];
  activeCashier: CashierUser;
  isLoggedIn: boolean;
  currentShift: CashierShift;
  onLoginSuccess: (cashier: CashierUser, shiftName: string, openingCash: number) => void;
  onLogout: () => void;
  onSaveCashiers: (updatedCashiers: CashierUser[]) => void;
  isLockScreen?: boolean;
}

export const CashierLoginModal: React.FC<CashierLoginModalProps> = ({
  isOpen,
  onClose,
  cashiers,
  activeCashier,
  isLoggedIn,
  currentShift,
  onLoginSuccess,
  onLogout,
  onSaveCashiers,
  isLockScreen = false,
}) => {
  // Ensure we have accounts list (Admin & Kasir)
  const validAccounts = cashiers.filter(
    (c) => c.name === 'Admin' || c.name === 'Kasir' || c.name === 'Admin Toko' || c.name === 'Kasir Utama'
  );
  const accountsToDisplay = validAccounts.length >= 2 ? validAccounts : cashiers.slice(0, 2);

  const [selectedCashierId, setSelectedCashierId] = useState<string>(
    activeCashier?.id || accountsToDisplay[0]?.id || 'cashier-utama'
  );
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeCashier) {
      setSelectedCashierId(activeCashier.id);
    }
  }, [activeCashier]);

  if (!isOpen) return null;

  const currentAccount =
    accountsToDisplay.find((c) => c.id === selectedCashierId) ||
    accountsToDisplay[0] ||
    activeCashier;

  const handleAttemptLogin = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!currentAccount) {
      setErrorMessage('Pilih akun terlebih dahulu');
      return;
    }

    if (!passwordInput) {
      setErrorMessage('Masukkan Password / PIN untuk melanjutkan');
      playSound('beep');
      return;
    }

    if (passwordInput !== currentAccount.pin) {
      setErrorMessage('Password / PIN salah! Coba lagi');
      playSound('beep');
      setPasswordInput('');
      return;
    }

    playSound('success');
    setSuccessMessage(`Login Berhasil! Selamat datang, ${currentAccount.name}`);

    setTimeout(() => {
      const shiftName = currentShift.shiftName || 'Shift 1';
      const openingCash = currentShift.openingCash || 0;
      onLoginSuccess(currentAccount, shiftName, openingCash);
      setSuccessMessage('');
      setPasswordInput('');
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300 overflow-y-auto">
      {/* Background Subtle Ambient Glows matching Dashboard Theme */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Glass Card matching Dashboard Palette */}
      <div className="relative w-full max-w-md bg-white/95 border border-slate-200/90 rounded-3xl shadow-[0_25px_60px_-15px_rgba(15,23,42,0.18)] overflow-hidden backdrop-blur-xl transition-all">
        {/* Top Header Glow Bar - Blue Gradient matching TopBar */}
        <div className="h-2 w-full bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-600" />

        {/* Close button if modal is opened when already logged in */}
        {!isLockScreen && isLoggedIn && (
          <button
            type="button"
            onClick={onClose}
            title="Tutup Menu Login"
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-100 border border-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-200 hover:text-slate-900 transition-all cursor-pointer z-10"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Card Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Logo & Brand Title Header */}
          <div className="text-center space-y-3">
            <div className="relative inline-block">
              <div className="w-20 h-20 mx-auto rounded-3xl overflow-hidden ring-4 ring-blue-500/20 shadow-md bg-slate-100">
                <img
                  src="/logo.png"
                  alt="AFK.OUTDOOR Logo"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-blue-600 text-white p-1 rounded-full shadow-md">
                <ShieldCheck className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900 flex items-center justify-center gap-1.5">
                <span>AFK.OUTDOOR</span>
              </h1>
              <p className="text-xs font-semibold text-slate-500 mt-1">
                Sistem Kasir & Manajemen Sewa Alat Outdoor
              </p>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200/80 text-[11px] text-blue-700 font-mono font-bold">
              <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse" />
              <span>Sistem SIAP · {currentTime} WIB</span>
            </div>
          </div>

          {/* Dedicated Clean Login Form: ONLY Nama & Password */}
          <form onSubmit={handleAttemptLogin} className="space-y-4">
            {/* Input 1: NAMA USER / KASIR */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                <span>Nama User / Akun</span>
              </label>

              <div className="relative">
                <select
                  value={selectedCashierId}
                  onChange={(e) => {
                    setSelectedCashierId(e.target.value);
                    setErrorMessage('');
                    playSound('beep');
                  }}
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl px-4 py-3 text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  {accountsToDisplay.map((account) => (
                    <option key={account.id} value={account.id} className="bg-white text-slate-900 font-bold py-2">
                      {account.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* Input 2: PASSWORD / PIN */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-blue-600" />
                <span>Password / PIN</span>
              </label>

              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={passwordInput}
                  onChange={(e) => {
                    setPasswordInput(e.target.value);
                    setErrorMessage('');
                  }}
                  placeholder="Masukkan Password / PIN"
                  className="w-full bg-slate-50 border border-slate-300 rounded-2xl pl-4 pr-11 py-3 text-sm font-bold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title={showPassword ? 'Sembunyikan Password' : 'Lihat Password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Error & Success Feedback Alerts */}
            {errorMessage && (
              <div className="flex items-center gap-2.5 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-semibold animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="flex items-center gap-2.5 p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl font-bold animate-in fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {/* Submit Button matching Dashboard Blue Theme */}
            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 active:scale-[0.99] text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 border border-white/20 transition-all cursor-pointer mt-2"
            >
              <Unlock className="w-4 h-4" />
              <span>MASUK SISTEM</span>
            </button>
          </form>

          {/* Logout Sesi Kasir Saat Ini jika modal dibuka dari dasbor */}
          {isLoggedIn && !isLockScreen && (
            <div className="pt-2 border-t border-slate-200 text-center">
              <button
                type="button"
                onClick={() => {
                  onLogout();
                  playSound('beep');
                }}
                className="text-xs text-rose-600 hover:text-rose-700 font-bold transition-colors cursor-pointer"
              >
                Logout Sesi Kasir Saat Ini
              </button>
            </div>
          )}
        </div>

        {/* Footer info bar matching dashboard cards */}
        <div className="px-6 py-3 bg-slate-50 border-t border-slate-200/80 text-center text-[11px] text-slate-500 font-medium">
          AFK.OUTDOOR POS v2.5 · Hak Cipta & Protected System
        </div>
      </div>
    </div>
  );
};
