import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, Eye, EyeOff, Lock, Mail, ShieldCheck } from 'lucide-react';
import { DEMO_USERS } from '../data/mockData';
import { UserRole } from '../types';
import { BRAND, HartamasLogo, PoweredByZurely, ZurelyLogo } from './BrandLogo';

interface LoginPageProps {
  onLogin: (role: UserRole) => void;
}

const DEMO_PASSWORD = 'hartamas-demo-2026';

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

const HIGHLIGHTS = [
  'Rent schedules, FPX / DuitNow payment & instant official receipts',
  'Expiring TA renewal pipeline with Stamp Act 1949 duty computation',
  'Landlord rent collection visibility & itemised property expenses',
];

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState<UserRole>('tenant');
  const [identifier, setIdentifier] = useState(DEMO_USERS.tenant.email);
  const [password, setPassword] = useState(DEMO_PASSWORD);
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
    <div className="min-h-screen bg-canvas lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      {/* Brand panel */}
      <aside className="relative overflow-hidden bg-ink text-white px-6 py-8 sm:px-10 lg:px-14 lg:py-12 flex flex-col justify-between gap-10">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 -top-24 w-80 h-80 rounded-full bg-brand/10 blur-3xl"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-brand"
        />

        <div className="relative flex flex-wrap items-center gap-x-4 gap-y-3">
          <HartamasLogo inverted />
          <span className="text-white/40 text-sm leading-none" aria-hidden="true">
            ×
          </span>
          <ZurelyLogo height={18} inverted />
        </div>

        <div className="relative max-w-lg">
          <div className="flex items-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-brand">
            <span className="h-px w-8 bg-brand" aria-hidden="true" />
            Hartamas × Zurely
          </div>
          <h1 className="mt-4 font-display text-4xl sm:text-5xl font-semibold leading-[1.05]">
            Every tenancy, <em className="text-brand">under one roof.</em>
          </h1>
          <p className="mt-4 text-sm sm:text-base text-white/70 leading-relaxed">
            LHDN-stamped tenancy agreements, monthly rent collection, renewals and property
            expenses for Hartamas tenants, landlords and negotiators.
          </p>

          <ul className="mt-8 space-y-3 hidden sm:block">
            {HIGHLIGHTS.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-white/80">
                <CheckCircle2 className="w-4 h-4 mt-0.5 text-brand shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative hidden lg:flex items-center justify-between gap-4 pt-6 border-t border-white/10">
          <span className="inline-flex items-center gap-2 text-xs text-white/50">
            <ShieldCheck className="w-4 h-4 text-brand" />
            Stamp Act 1949 &amp; BOVAEP REN workflow ready
          </span>
          <PoweredByZurely inverted />
        </div>
      </aside>

      {/* Sign-in panel */}
      <div className="flex flex-col justify-between px-4 py-8 sm:px-6 lg:px-12">
        <div className="hidden lg:flex justify-end text-xs font-medium text-stone-400">
          Malaysia Tenancy Agreement Portal
        </div>

        <main className="max-w-md w-full mx-auto my-8">
          <section className="bg-white border border-line rounded-2xl p-6 sm:p-8 shadow-[0_1px_2px_rgba(20,20,20,0.04),0_12px_32px_-12px_rgba(20,20,20,0.12)]">
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Account Sign In
            </p>
            <h2 className="mt-1 text-2xl font-bold text-ink">Sign in to {BRAND.product}</h2>
            <p className="mt-1.5 text-sm text-stone-500">
              Choose your portal role and enter your credentials.
            </p>

            {/* Segmented Role Selector */}
            <div
              role="tablist"
              aria-label="Select portal role"
              className="mt-6 grid grid-cols-3 gap-1 p-1 bg-stone-100 rounded-lg"
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
                      ? 'bg-ink text-white shadow-sm'
                      : 'text-stone-600 hover:text-ink'
                  }`}
                >
                  {ROLE_DETAILS[role].label}
                </button>
              ))}
            </div>

            <p className="mt-3 text-xs text-stone-500">{ROLE_DETAILS[selectedRole].subtitle}</p>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-sm font-medium text-ink mb-1.5"
                >
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-identifier"
                    type="text"
                    value={identifier}
                    onChange={(e) => handleIdentifierChange(e.target.value)}
                    placeholder="tenant1@zurely.my"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-line rounded-lg text-ink placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-brand/70 focus:border-ink"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label htmlFor="login-password" className="block text-sm font-medium text-ink">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setPassword(DEMO_PASSWORD)}
                    className="text-xs font-medium text-accent hover:underline cursor-pointer"
                  >
                    Use demo password
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-11 py-2.5 text-sm bg-white border border-line rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand/70 focus:border-ink"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 p-1 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="text-xs font-medium text-[#DC2626] bg-red-50 border border-red-200 rounded-lg px-3 py-2"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                className="w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-ink font-semibold text-sm rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Sign In as {ROLE_DETAILS[selectedRole].label}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-stone-100 text-xs text-stone-500 flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono">tenant1@ · agency1@ · landlord1@zurely.my</span>
              <span className="font-mono text-stone-400">MYR · FPX / DuitNow</span>
            </div>
          </section>

          <div className="mt-6 flex justify-center lg:hidden">
            <PoweredByZurely />
          </div>
        </main>

        <footer className="text-center text-[11px] text-stone-400">
          © 2026 {BRAND.agency} ({BRAND.companyNo}) · Demo environment
        </footer>
      </div>
    </div>
  );
};
