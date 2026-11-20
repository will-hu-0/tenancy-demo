import React from 'react';
import {
  ArrowRight,
  Building2,
  Calendar,
  CheckCircle2,
  Download,
  FileText,
  Receipt,
  ShieldCheck,
} from 'lucide-react';
import { RentInvoice, TenancyAgreement, UserAccount } from '../types';
import { daysUntil, formatDateMY, formatRM } from '../utils/formatters';
import { PreviewDocument } from './DocumentModal';
import { ProfileView } from './ProfileView';
import { StatusIndicator } from './StatusIndicator';

interface TenantPortalProps {
  user: UserAccount;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  agreement: TenancyAgreement;
  invoices: RentInvoice[];
  onOpenPayModal: (invoice: RentInvoice) => void;
  onPreviewDoc: (doc: PreviewDocument) => void;
  onDirectDownloadInvoice: (invoice: RentInvoice) => void;
  onDirectDownloadTa: (ta: TenancyAgreement) => void;
}

export const TenantPortal: React.FC<TenantPortalProps> = ({
  user,
  activeTab,
  onSelectTab,
  agreement,
  invoices,
  onOpenPayModal,
  onPreviewDoc,
  onDirectDownloadInvoice,
  onDirectDownloadTa,
}) => {
  const dueInvoices = invoices.filter(
    (inv) => inv.status === 'Unpaid' || inv.status === 'Overdue'
  );
  const unpaidInvoice = dueInvoices[0];

  const landlord = agreement.landlords[0];
  const tenant = agreement.tenants[0];
  const landlordName = landlord?.fullName || agreement.additions.partiesSummary.landlordName;

  if (activeTab === 'profile') {
    return (
      <ProfileView
        user={user}
        summaryTitle="Current Tenancy"
        summarySubtitle="Monthly Rental"
        summaryValue={formatRM(agreement.property.monthlyRent, agreement.property.currency)}
        ctaLabel={unpaidInvoice ? 'Pay Current Rent' : 'View Due Invoices'}
        onCtaClick={() => {
          if (unpaidInvoice) {
            onOpenPayModal(unpaidInvoice);
          } else {
            onSelectTab('invoices');
          }
        }}
      />
    );
  }

  if (activeTab === 'agreement') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              {agreement.type} Tenancy Agreement · ID #{agreement.id}
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0F2942]">
              {agreement.property.address}
            </h1>
          </div>
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => onPreviewDoc({ type: 'ta', data: agreement })}
              className="px-4 py-2 text-sm font-semibold text-[#0F2942] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              Preview TA
            </button>
            <button
              type="button"
              onClick={() => onDirectDownloadTa(agreement)}
              className="px-4 py-2 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg inline-flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download TA</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <section className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-500">Adjudication No.</div>
                <div className="text-base font-bold font-mono text-[#0F2942] mt-0.5">
                  {agreement.adjudicationNo}
                </div>
              </div>
              <StatusIndicator status={agreement.status} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Property Particulars
                </div>
                <div className="mt-1.5 font-semibold text-[#0F2942]">
                  {agreement.property.buildingType} · {agreement.property.area} sq ft
                </div>
                <div className="text-slate-600 text-xs mt-1 leading-relaxed">
                  {agreement.property.address}, {agreement.property.state}, {agreement.property.country}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Floor {agreement.property.floor} ·{' '}
                  {agreement.property.furnishing ? 'Furnished' : 'Unfurnished'}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Parties &amp; Creator
                </div>
                <div className="mt-1.5 text-xs text-slate-600 space-y-1">
                  <div>
                    <span className="text-slate-400">Landlord:</span>{' '}
                    <strong className="text-[#0F2942]">{landlordName}</strong>
                    {landlord?.nricNo && (
                      <span className="font-mono text-slate-500"> ({landlord.nricNo})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400">Tenant:</span>{' '}
                    <strong className="text-[#0F2942]">{tenant?.fullName}</strong>
                    {tenant?.nricNo && (
                      <span className="font-mono text-slate-500"> ({tenant.nricNo})</span>
                    )}
                  </div>
                  <div>
                    <span className="text-slate-400">Prepared By:</span>{' '}
                    <span className="text-[#0F2942]">
                      {agreement.creator.fullName} ({agreement.creator.phoneNumber})
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-sm font-bold text-[#0F2942] mb-3">
                Financial Schedule &amp; Stamping
              </h2>
              <div className="divide-y divide-slate-100 text-sm">
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Monthly Rental</span>
                  <span className="font-semibold text-[#0F2942] tabular-nums">
                    {formatRM(agreement.property.monthlyRent, agreement.property.currency)}
                    {agreement.property.isSteppedRent ? ' (Stepped)' : ''}
                  </span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Security Deposit</span>
                  <span className="font-semibold text-[#0F2942] tabular-nums">
                    {formatRM(agreement.securityDeposit, agreement.property.currency)}
                  </span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Utility Deposit</span>
                  <span className="font-semibold text-[#0F2942] tabular-nums">
                    {formatRM(agreement.utilityDeposit, agreement.property.currency)}
                  </span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Duplicate Stamp Certificates</span>
                  <span className="font-semibold text-[#0F2942] tabular-nums">
                    {agreement.additions.copiesOfDuplicateStampCertCount} copy
                  </span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="text-slate-500">Verification Hash</span>
                  <span className="font-mono text-xs text-slate-600 truncate max-w-[260px]">
                    {agreement.hash}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5">
              <h2 className="text-sm font-bold text-[#0F2942] mb-3">Signatories</h2>
              <div className="border border-[#E2E8F0] rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 border-b border-[#E2E8F0]">
                    <tr>
                      <th className="py-2.5 px-4">Role</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4">NRIC</th>
                      <th className="py-2.5 px-4">Status</th>
                      <th className="py-2.5 px-4 text-right">Signed Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {agreement.signers.map((signer) => (
                      <tr key={signer.id}>
                        <td className="py-2.5 px-4 text-slate-600 font-medium">
                          {signer.userRole}
                        </td>
                        <td className="py-2.5 px-4 font-semibold text-[#0F2942]">{signer.name}</td>
                        <td className="py-2.5 px-4 font-mono text-slate-500">{signer.nricNo}</td>
                        <td className="py-2.5 px-4">
                          <StatusIndicator status={signer.status} />
                        </td>
                        <td className="py-2.5 px-4 text-right tabular-nums text-slate-600">
                          {formatDateMY(signer.signedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <aside className="lg:col-span-4 space-y-6">
            <div className="bg-white border border-[#E2E8F0] rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2 text-sm font-bold text-[#0F2942]">
                <Calendar className="w-4 h-4 text-[#1D4ED8]" />
                <span>Tenancy Term</span>
              </div>
              <div className="space-y-2.5 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Agreement Date</span>
                  <span className="font-semibold tabular-nums">
                    {formatDateMY(agreement.agreementDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Commencement</span>
                  <span className="font-semibold tabular-nums">
                    {formatDateMY(agreement.commencementDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Expiration</span>
                  <span className="font-semibold tabular-nums">
                    {formatDateMY(agreement.expirationDate)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-semibold tabular-nums">
                    {agreement.property.duration} Months
                  </span>
                </div>
              </div>
              <div className="pt-3 border-t border-slate-100 flex items-center gap-2 text-xs text-[#15803D]">
                <ShieldCheck className="w-4 h-4 shrink-0" />
                <span>Adjudication {agreement.adjudicationNo}</span>
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  if (activeTab === 'invoices') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Billing &amp; Payment
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0F2942]">Due Invoices</h1>
          </div>
        </div>

        <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3.5 px-5">Reference</th>
                  <th className="py-3.5 px-5">Billing Month</th>
                  <th className="py-3.5 px-5">Due Date</th>
                  <th className="py-3.5 px-5">Status</th>
                  <th className="py-3.5 px-5 text-right">Amount</th>
                  <th className="py-3.5 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {dueInvoices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-10 text-center text-sm text-slate-500">
                      No pending invoices. Your rent is up to date.
                    </td>
                  </tr>
                ) : (
                  dueInvoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-5 font-mono text-xs font-semibold text-[#0F2942]">
                        {inv.invoiceNumber}
                      </td>
                      <td className="py-3.5 px-5 font-medium text-[#0F2942]">
                        {inv.billingMonth}
                      </td>
                      <td className="py-3.5 px-5 text-slate-600 tabular-nums">
                        {formatDateMY(inv.dueDate)}
                      </td>
                      <td className="py-3.5 px-5">
                        <StatusIndicator status={inv.status} />
                      </td>
                      <td className="py-3.5 px-5 text-right font-semibold tabular-nums text-[#0F2942]">
                        {formatRM(inv.amount)}
                      </td>
                      <td className="py-3.5 px-5 text-right">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onOpenPayModal(inv)}
                            className="px-3 py-1.5 text-xs font-semibold text-white bg-[#19B864] hover:bg-[#159E55] rounded-lg cursor-pointer whitespace-nowrap"
                          >
                            Pay Rent
                          </button>
                          <button
                            type="button"
                            onClick={() => onPreviewDoc({ type: 'invoice', data: inv })}
                            className="px-3 py-1.5 text-xs font-semibold text-[#0F2942] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-lg cursor-pointer whitespace-nowrap"
                          >
                            View
                          </button>
                          <button
                            type="button"
                            onClick={() => onDirectDownloadInvoice(inv)}
                            className="px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-[#EEF4FF] hover:bg-[#E0EAFF] rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Invoice</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  // Default Overview Tab
  const daysLeftForDue = unpaidInvoice ? daysUntil(unpaidInvoice.dueDate) : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Tenant Portal
        </p>
        <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0F2942]">
          My Tenancy Overview
        </h1>
      </div>

      {/* Top Split: Current TA Summary + Rent Due / Pay Action Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <section className="lg:col-span-8 bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-slate-100">
              <div className="flex items-start gap-3.5 min-w-0">
                <div className="w-11 h-11 rounded-xl bg-[#EEF4FF] text-[#1D4ED8] flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs font-mono text-slate-500">
                    TA #{agreement.id} · Adj {agreement.adjudicationNo} · {agreement.type}
                  </div>
                  <h2 className="text-lg font-bold text-[#0F2942] mt-0.5">
                    {agreement.property.address}
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {agreement.property.buildingType} · {agreement.property.area} sq ft · Floor{' '}
                    {agreement.property.floor} ·{' '}
                    {agreement.property.furnishing ? 'Furnished' : 'Unfurnished'}
                  </p>
                </div>
              </div>
              <StatusIndicator status={agreement.status} />
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-5 py-5 border-b border-slate-100">
              <div>
                <div className="text-xs text-slate-500">Monthly Rent</div>
                <div className="text-sm font-bold text-[#0F2942] tabular-nums mt-1">
                  {formatRM(agreement.property.monthlyRent, agreement.property.currency)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Duration</div>
                <div className="text-sm font-semibold text-[#0F2942] tabular-nums mt-1">
                  {agreement.property.duration} Months
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Expiration Date</div>
                <div className="text-sm font-semibold text-[#0F2942] tabular-nums mt-1">
                  {formatDateMY(agreement.expirationDate)}
                </div>
              </div>
              <div>
                <div className="text-xs text-slate-500">Deposits Held</div>
                <div className="text-sm font-semibold text-[#0F2942] tabular-nums mt-1">
                  {formatRM(
                    agreement.securityDeposit + agreement.utilityDeposit,
                    agreement.property.currency
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-5 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500">
              Landlord: <strong className="text-[#0F2942]">{landlordName}</strong>
              <span className="mx-2" aria-hidden="true">·</span>
              Creator: <strong className="text-[#0F2942]">{agreement.creator.fullName}</strong>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => onSelectTab('agreement')}
                className="px-3.5 py-2 text-xs font-semibold text-[#0F2942] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-lg cursor-pointer"
              >
                View Full TA
              </button>
              <button
                type="button"
                onClick={() => onDirectDownloadTa(agreement)}
                className="px-3.5 py-2 text-xs font-semibold text-[#1D4ED8] bg-[#EEF4FF] hover:bg-[#E0EAFF] rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download TA</span>
              </button>
            </div>
          </div>
        </section>

        {/* Rent Due & Pay Action Card */}
        <section className="lg:col-span-4 bg-white border border-[#E2E8F0] rounded-xl p-6 flex flex-col justify-between">
          {unpaidInvoice ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Rent Payment Due
                  </span>
                  <StatusIndicator status={unpaidInvoice.status} />
                </div>

                <div className="mt-4 text-xs text-slate-500">
                  {unpaidInvoice.billingMonth} · Due {formatDateMY(unpaidInvoice.dueDate)}
                  {daysLeftForDue !== null && (
                    <span className="text-[#B45309] font-medium">
                      {' '}
                      ({daysLeftForDue >= 0 ? `in ${daysLeftForDue} days` : `${Math.abs(daysLeftForDue)} days overdue`})
                    </span>
                  )}
                </div>

                <div className="mt-1.5 text-3xl font-bold text-[#1D4ED8] tabular-nums">
                  {formatRM(unpaidInvoice.amount)}
                </div>

                <div className="mt-3 text-xs text-slate-500 font-mono">
                  Ref: {unpaidInvoice.invoiceNumber}
                </div>
              </div>

              <div className="mt-6 space-y-2.5">
                <button
                  type="button"
                  onClick={() => onOpenPayModal(unpaidInvoice)}
                  className="w-full py-2.5 px-4 bg-[#19B864] hover:bg-[#159E55] text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Pay Rent Now</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => onDirectDownloadInvoice(unpaidInvoice)}
                  className="w-full py-2 px-4 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#0F2942] text-xs font-semibold rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Invoice</span>
                </button>
              </div>
            </>
          ) : (
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Rent Status
                </span>
                <StatusIndicator status="Paid" />
              </div>

              <div className="mt-4 flex items-center gap-2 text-[#15803D] font-semibold text-sm">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Current Rent Paid</span>
              </div>

              <div className="mt-2 text-2xl font-bold text-[#0F2942] tabular-nums">
                Next due: 01 Jan 2027
              </div>
              <div className="mt-1 text-xs text-slate-500 tabular-nums">
                Next scheduled rental:{' '}
                {formatRM(agreement.property.monthlyRent, agreement.property.currency)}
              </div>
            </div>
          )}
        </section>
      </div>

      {/* Due Invoices Quick Table */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-[#1D4ED8]" />
            <h2 className="text-sm font-bold text-[#0F2942]">Due Invoices</h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('invoices')}
            className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
          >
            View All ({dueInvoices.length})
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-6">Document No.</th>
                <th className="py-3 px-6">Period</th>
                <th className="py-3 px-6">Due Date</th>
                <th className="py-3 px-6">Status</th>
                <th className="py-3 px-6 text-right">Amount</th>
                <th className="py-3 px-6 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {dueInvoices.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                    No pending invoices. Your rent is up to date.
                  </td>
                </tr>
              ) : (
                dueInvoices.slice(0, 4).map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6 font-mono text-xs font-semibold text-[#0F2942]">
                      <button
                        type="button"
                        onClick={() => onPreviewDoc({ type: 'invoice', data: inv })}
                        className="hover:text-[#1D4ED8] hover:underline flex items-center gap-1.5 cursor-pointer"
                      >
                        <FileText className="w-3.5 h-3.5 text-slate-400" />
                        <span>{inv.invoiceNumber}</span>
                      </button>
                    </td>
                    <td className="py-3.5 px-6 text-[#0F2942] font-medium">{inv.billingMonth}</td>
                    <td className="py-3.5 px-6 text-slate-600 tabular-nums">
                      {formatDateMY(inv.dueDate)}
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusIndicator status={inv.status} />
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold tabular-nums text-[#0F2942]">
                      {formatRM(inv.amount)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onOpenPayModal(inv)}
                          className="px-3 py-1.5 text-xs font-semibold text-white bg-[#19B864] hover:bg-[#159E55] rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          Pay Rent
                        </button>
                        <button
                          type="button"
                          onClick={() => onDirectDownloadInvoice(inv)}
                          className="px-3 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-[#EEF4FF] hover:bg-[#E0EAFF] rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download Invoice</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
