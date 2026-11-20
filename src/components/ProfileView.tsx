import React from 'react';
import { ArrowRight, Award, BadgeCheck, ShieldCheck, User } from 'lucide-react';
import { UserAccount } from '../types';

interface ProfileViewProps {
  user: UserAccount;
  summaryTitle: string;
  summaryValue: string;
  summarySubtitle: string;
  ctaLabel: string;
  onCtaClick: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  user,
  summaryTitle,
  summaryValue,
  summarySubtitle,
  ctaLabel,
  onCtaClick,
}) => {
  const accountLabel =
    user.role === 'agency'
      ? 'Agent Account'
      : user.role === 'landlord'
      ? 'Landlord Account'
      : 'Tenant Account';

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          {accountLabel}
        </p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-ink">My Profile</h1>
      </div>

      {/* User banner card */}
      <section className="bg-white border border-line rounded-xl p-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-xl bg-brand text-ink font-bold text-lg flex items-center justify-center shrink-0">
            {user.initials}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-xl font-bold text-ink">{user.name}</h2>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-stone-600 bg-stone-100 border border-line px-2.5 py-0.5 rounded-full">
                <BadgeCheck className="w-3.5 h-3.5 text-[#19B864]" />
                {user.role === 'agency' && user.licenseVerified
                  ? 'REN Verified'
                  : 'Verified Account'}
              </span>
            </div>
            {user.agencyName && (
              <p className="text-xs text-stone-500 mt-1">{user.agencyName}</p>
            )}
          </div>
        </div>
      </section>

      {/* Two-column detail row */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-8 bg-white border border-line rounded-xl p-6 flex flex-col justify-between">
          <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
            <Award className="w-4 h-4 text-accent" />
            <h3 className="text-sm font-bold text-ink">
              {user.role === 'agency'
                ? 'Agent License & Registration'
                : user.role === 'landlord'
                ? 'Owner Verification'
                : 'Tenancy Identity Verification'}
            </h3>
          </div>

          <div className="py-8 text-center max-w-sm mx-auto">
            <div className="w-11 h-11 rounded-full bg-brand-soft text-accent flex items-center justify-center mx-auto">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="mt-3 text-sm font-bold text-ink">
              {user.role === 'agency'
                ? `${user.licenseNumber} · Active BOVAEP Registration`
                : 'MyKad / eKYC Verified'}
            </div>
            <p className="mt-1 text-xs text-stone-500 leading-relaxed">
              {user.role === 'agency'
                ? 'Licensed to execute and renew Malaysian residential and commercial tenancy agreements.'
                : `NRIC ${user.nricNo || 'Verified'} linked to your Hartamas Tenancy account records.`}
            </p>
          </div>
        </section>

        <section className="lg:col-span-4 bg-white border border-line rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              {summaryTitle}
            </div>
            <div className="mt-4 text-xs text-stone-500">{summarySubtitle}</div>
            <div className="mt-1 text-3xl font-bold text-ink tabular-nums">
              {summaryValue}
            </div>
          </div>

          <button
            type="button"
            onClick={onCtaClick}
            className="mt-6 w-full py-2.5 px-4 bg-brand hover:bg-brand-hover text-ink text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>{ctaLabel}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </section>
      </div>

      {/* Contact & account card */}
      <section className="lg:w-2/3 bg-white border border-line rounded-xl p-6">
        <div className="flex items-center gap-2 pb-4 border-b border-stone-100">
          <User className="w-4 h-4 text-accent" />
          <h3 className="text-sm font-bold text-ink">Contact &amp; Account</h3>
        </div>

        <div className="divide-y divide-stone-100 text-sm">
          <div className="py-3.5 flex items-center justify-between gap-4">
            <span className="text-stone-500">Mobile number</span>
            <span className="font-semibold text-ink font-mono tabular-nums">
              {user.phone}
            </span>
          </div>
          <div className="py-3.5 flex items-center justify-between gap-4">
            <span className="text-stone-500">Email address</span>
            <span className="font-semibold text-ink">{user.email}</span>
          </div>
          <div className="py-3.5 flex items-center justify-between gap-4">
            <span className="text-stone-500">Member since</span>
            <span className="font-semibold text-ink tabular-nums">{user.memberSince}</span>
          </div>
        </div>
      </section>
    </div>
  );
};
