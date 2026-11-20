import React, { useState } from 'react';
import { ArrowRight, Eye, EyeOff, Lock, Mail } from 'lucide-react';
import { DEMO_USERS } from '../data/mockData';
import { UserRole } from '../types';
import { ZurelyLogo } from './ZurelyLogo';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const ROLE_DETAILS: Record<
  UserRole,
  {
    label: string;
    subtitle: string;
  }
> = {
  tenant: {
    label: 'Tenant',
    subtitle: 'View rent schedule, pay via FPX/DuitNow & download receipts',
  },
  agency: {
    label: 'Agency',
    subtitle: 'Manage active TAs, process renewals & record expenses',
  },
  landlord: {
    label: 'Landlord',
    subtitle: 'Track tenant rent collection & download statements',
  },
};

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const [identifier, setIdentifier] = useState(DEMO_USERS.tenant.email);
  const [password, setPassword] = useState('tenancymy-demo-2026');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleRoleTabChange = (role: UserRole) => {
    setSelectedRole(role);
    setIdentifier(DEMO_USERS[role].email);
    setError('');
  };

  const handleIdentifierChange = (value: string) => {
    setIdentifier(value);
    const normalized = value.trim().toLowerCase();
    if (normalized.startsWith('agency')) {
      setSelectedRole('agency');
    } else if (normalized.startsWith('landlord')) {
      setSelectedRole('landlord');
    } else if (normalized.startsWith('tenant')) {
      setSelectedRole('tenant');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password.trim()) {
      setError('Please enter your registered email or mobile number and password.');
      return;
    }
    onLogin(selectedRole);
  };

  return (
    <div className="min-h-screen bg-[#F7F9FC] flex flex-col justify-between px-4 py-8 sm:px-6 lg:px-8">
      <div className="max-w-5xl w-full mx-auto flex items-center justify-between">
        <ZurelyLogo />
        <span className="text-xs sm:text-sm text-slate-500 font-medium">
          Malaysia Tenancy Agreement Portal
        </span>
      </div>

      <main className="max-w-md w-full mx-auto my-8">
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6 sm:p-8">
          <div className="w-full">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Account Sign In
            </p>
            <h2 className="mt-1 text-2xl font-bold text-[#0F2942]">
              Sign in to TenancyMY
            </h2>
            <p className="mt-1.5 text-sm text-slate-500">
              Choose your portal role and enter your credentials.
            </p>

            {/* Segmented Role Selector */}
            <div
              role="tablist"
              aria-label="Select portal role"
              className="mt-6 grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg"
            >
              {(['tenant', 'agency', 'landlord'] as UserRole[]).map((role) => (
                <button
                  key={role}
                  type="button"
                  role="tab"
                  aria-selected={selectedRole === role}
                  onClick={() => handleRoleTabChange(role)}
                  className={`py-2 px-3 rounded-md text-xs sm:text-sm font-semibold transition-all cursor-pointer whitespace-nowrap ${
                    selectedRole === role
                      ? 'bg-white text-[#0F2942] shadow-sm'
                      : 'text-slate-600 hover:text-[#0F2942]'
                  }`}
                >
                  {ROLE_DETAILS[role].label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs text-slate-500">
              {ROLE_DETAILS[selectedRole].subtitle}
            </p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-sm font-medium text-[#0F2942] mb-1.5"
                >
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => handleIdentifierChange(e.target.value)}
                    placeholder="tenant1@zurely.my"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label
                    htmlFor="login-password"
                    className="block text-sm font-medium text-[#0F2942]"
                  >
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword('tenancymy-demo-2026')}
                    className="text-xs font-medium text-[#1D4ED8] hover:underline cursor-pointer"
                  >
                    Use demo password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p role="alert" className="text-xs font-medium text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-[#19B864] hover:bg-[#159E55] text-white font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In as {ROLE_DETAILS[selectedRole].label}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono">tenant1@ · agency1@ · landlord1@zurely.my</span>
              <span className="font-mono text-slate-400">MYR · FPX / DuitNow</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="max-w-5xl w-full mx-auto text-center text-xs text-slate-400">
        TenancyMY · Malaysia Real Estate Tenancy Portal
      </footer>
    </div>
  );
};
