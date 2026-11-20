import React, { useState } from 'react';
import {
  CalendarClock,
  FileText,
  Plus,
  Receipt,
  RefreshCw,
  Search,
  Trash2,
} from 'lucide-react';
import {
  ExpenseCategory,
  PropertyExpense,
  RentInvoice,
  TenancyAgreement,
  UserAccount,
} from '../types';
import { daysUntil, formatDateMY, formatRM } from '../utils/formatters';
import { PreviewDocument } from './DocumentModal';
import { ProfileView } from './ProfileView';
import { StatusIndicator } from './StatusIndicator';

interface AgencyPortalProps {
  user: UserAccount;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  agreements: TenancyAgreement[];
  invoices: RentInvoice[];
  expenses: PropertyExpense[];
  onOpenRenewModal: (ta: TenancyAgreement) => void;
  onPreviewDoc: (doc: PreviewDocument) => void;
  onAddExpense: (expense: Omit<PropertyExpense, 'id'>) => void;
  onDeleteExpense: (expenseId: string) => void;
}

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Aircond & M&E',
  'Plumbing & Sanitary',
  'LHDN Stamping Fee',
  'IWK & Quit Rent',
  'Management & Sinking Fund',
  'Agency Renewal Fee',
  'General Repairs',
];

export const AgencyPortal: React.FC<AgencyPortalProps> = ({
  user,
  activeTab,
  onSelectTab,
  agreements,
  invoices,
  expenses,
  onOpenRenewModal,
  onPreviewDoc,
  onAddExpense,
  onDeleteExpense,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'Completed' | 'Expiring Soon' | 'Renewed'
  >('all');

  // Expense form state
  const [selectedTaId, setSelectedTaId] = useState<number>(agreements[0]?.id || 110);
  const [category, setCategory] = useState<ExpenseCategory>('Aircond & M&E');
  const [amount, setAmount] = useState('');
  const [expenseDate, setExpenseDate] = useState('2026-11-13');
  const [paidBy, setPaidBy] = useState<'Landlord' | 'Agency (Reimbursable)'>('Landlord');
  const [vendorName, setVendorName] = useState('');
  const [receiptRef, setReceiptRef] = useState('');
  const [description, setDescription] = useState('');
  const [expenseFilterTa, setExpenseFilterTa] = useState<string>('all');

  const expiringAgreements = agreements.filter((ta) => ta.status === 'Expiring Soon');
  const activeAgreements = agreements.filter((ta) => ta.status !== 'Renewed');
  const totalPortfolioRent = activeAgreements.reduce(
    (sum, ta) => sum + ta.property.monthlyRent,
    0
  );
  const totalExpenses = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  const getLatestInvoiceStatus = (taId: number) => {
    const match = invoices.find((inv) => inv.taId === taId);
    return match ? match.status : 'Paid';
  };

  const filteredAgreements = agreements.filter((ta) => {
    const matchesStatus = statusFilter === 'all' ? true : ta.status === statusFilter;
    const q = searchQuery.trim().toLowerCase();
    const landlordName =
      ta.landlords[0]?.fullName || ta.additions.partiesSummary.landlordName;
    const tenantName = ta.tenants[0]?.fullName || ta.additions.partiesSummary.tenantName;
    const matchesQuery =
      !q ||
      ta.property.address.toLowerCase().includes(q) ||
      ta.property.city.toLowerCase().includes(q) ||
      tenantName.toLowerCase().includes(q) ||
      landlordName.toLowerCase().includes(q) ||
      ta.adjudicationNo.toLowerCase().includes(q) ||
      String(ta.id).includes(q);
    return matchesStatus && matchesQuery;
  });

  const handleExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ta = agreements.find((item) => item.id === selectedTaId) || agreements[0];
    if (!ta || !amount || Number(amount) <= 0) return;

    onAddExpense({
      taId: ta.id,
      propertyAddress: ta.property.address,
      cityState: `${ta.property.postcode} ${ta.property.city}, ${ta.property.state}`,
      category,
      description: description.trim() || `${category} maintenance work`,
      amount: Number(amount),
      expenseDate,
      paidBy,
      vendorName: vendorName.trim() || 'Appointed Contractor',
      receiptRef: receiptRef.trim() || `EXP-${Date.now().toString().slice(-5)}`,
    });

    setAmount('');
    setVendorName('');
    setReceiptRef('');
    setDescription('');
  };

  const filteredExpenses = expenses.filter((exp) =>
    expenseFilterTa === 'all' ? true : exp.taId === Number(expenseFilterTa)
  );

  if (activeTab === 'profile') {
    return (
      <ProfileView
        user={user}
        summaryTitle="Agency Portfolio"
        summarySubtitle="Monthly Rent Managed"
        summaryValue={formatRM(totalPortfolioRent)}
        ctaLabel="View Renewals Queue"
        onCtaClick={() => onSelectTab('renewals')}
      />
    );
  }

  if (activeTab === 'expenses') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
              Agency Accounting
            </p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0F2942]">
              Property Expenses
            </h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-slate-500">Total Logged Expenses</div>
            <div className="text-xl font-bold text-[#0F2942] tabular-nums">
              {formatRM(totalExpenses)}
            </div>
          </div>
        </div>

        {/* Key In Expenses Form */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl p-6">
          <div className="pb-4 border-b border-slate-100 flex items-center gap-2">
            <Plus className="w-4 h-4 text-[#1D4ED8]" />
            <h2 className="text-sm font-bold text-[#0F2942]">Key In New Property Expense</h2>
          </div>

          <form
            onSubmit={handleExpenseSubmit}
            className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            <div>
              <label htmlFor="exp-ta" className="block text-xs font-semibold text-[#0F2942] mb-1.5">
                Property / Tenancy Agreement
              </label>
              <select
                id="exp-ta"
                value={selectedTaId}
                onChange={(e) => setSelectedTaId(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              >
                {activeAgreements.map((ta) => (
                  <option key={ta.id} value={ta.id}>
                    TA #{ta.id} · {ta.property.address}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="exp-cat" className="block text-xs font-semibold text-[#0F2942] mb-1.5">
                Expense Category
              </label>
              <select
                id="exp-cat"
                value={category}
                onChange={(e) => setCategory(e.target.value as ExpenseCategory)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              >
                {EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="exp-amt" className="block text-xs font-semibold text-[#0F2942] mb-1.5">
                Amount (RM)
              </label>
              <input
                id="exp-amt"
                type="number"
                step="0.01"
                min="1"
                required
                placeholder="e.g. 280.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label htmlFor="exp-date" className="block text-xs font-semibold text-[#0F2942] mb-1.5">
                Expense Date
              </label>
              <input
                id="exp-date"
                type="date"
                required
                value={expenseDate}
                onChange={(e) => setExpenseDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label
                htmlFor="exp-paidby"
                className="block text-xs font-semibold text-[#0F2942] mb-1.5"
              >
                Borne / Paid By
              </label>
              <select
                id="exp-paidby"
                value={paidBy}
                onChange={(e) =>
                  setPaidBy(e.target.value as 'Landlord' | 'Agency (Reimbursable)')
                }
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              >
                <option value="Landlord">Landlord (Deduct from Rent)</option>
                <option value="Agency (Reimbursable)">Agency (Reimbursable)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="exp-vendor"
                className="block text-xs font-semibold text-[#0F2942] mb-1.5"
              >
                Vendor / Contractor
              </label>
              <input
                id="exp-vendor"
                type="text"
                placeholder="e.g. CoolBreeze Services"
                value={vendorName}
                onChange={(e) => setVendorName(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="exp-desc" className="block text-xs font-semibold text-[#0F2942] mb-1.5">
                Work Description
              </label>
              <input
                id="exp-desc"
                type="text"
                required
                placeholder="e.g. Replaced master bedroom water heater thermostat"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label htmlFor="exp-ref" className="block text-xs font-semibold text-[#0F2942] mb-1.5">
                Vendor Receipt Ref
              </label>
              <input
                id="exp-ref"
                type="text"
                placeholder="e.g. INV-9042"
                value={receiptRef}
                onChange={(e) => setReceiptRef(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] font-mono focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
            </div>

            <div className="sm:col-span-2 lg:col-span-3 flex justify-end pt-2">
              <button
                type="submit"
                className="px-5 py-2.5 text-sm font-semibold text-white bg-[#19B864] hover:bg-[#159E55] rounded-lg transition-colors inline-flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Save Expense Entry</span>
              </button>
            </div>
          </form>
        </section>

        {/* Expense Ledger */}
        <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#1D4ED8]" />
              <h2 className="text-sm font-bold text-[#0F2942]">Recorded Property Expenses</h2>
            </div>

            <select
              aria-label="Filter expenses by property"
              value={expenseFilterTa}
              onChange={(e) => setExpenseFilterTa(e.target.value)}
              className="px-3 py-1.5 text-xs font-medium bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942]"
            >
              <option value="all">All Properties</option>
              {agreements.map((ta) => (
                <option key={ta.id} value={String(ta.id)}>
                  TA #{ta.id} · {ta.property.city}
                </option>
              ))}
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Property</th>
                  <th className="py-3 px-6">Category &amp; Description</th>
                  <th className="py-3 px-6">Paid By</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-sm text-slate-500">
                      No expenses recorded for this selection yet.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp) => (
                    <tr key={exp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6 text-slate-600 tabular-nums whitespace-nowrap">
                        {formatDateMY(exp.expenseDate)}
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-[#0F2942]">{exp.propertyAddress}</div>
                        <div className="text-xs text-slate-500">
                          TA #{exp.taId} · {exp.cityState}
                        </div>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-medium text-[#0F2942]">{exp.category}</div>
                        <div className="text-xs text-slate-500">
                          {exp.description} · <span className="font-mono">{exp.receiptRef}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-xs text-slate-600">{exp.paidBy}</td>
                      <td className="py-3.5 px-6 text-right font-semibold tabular-nums text-[#0F2942]">
                        {formatRM(exp.amount)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => onDeleteExpense(exp.id)}
                          aria-label={`Remove expense ${exp.receiptRef}`}
                          className="p-1.5 text-slate-400 hover:text-[#DC2626] rounded-lg hover:bg-red-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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

  if (activeTab === 'renewals') {
    const renewedAgreements = agreements.filter((ta) => ta.status === 'Renewed');

    return (
      <div className="space-y-6">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Tenancy Renewal Pipeline
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0F2942]">
            Expiring TAs Requiring Renewal
          </h1>
        </div>

        <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-[#B45309]" />
              <h2 className="text-sm font-bold text-[#0F2942]">
                Expiring Within 60 Days ({expiringAgreements.length})
              </h2>
            </div>
          </div>

          {expiringAgreements.length === 0 ? (
            <div className="p-10 text-center text-sm text-slate-500">
              All expiring tenancy agreements have been renewed.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {expiringAgreements.map((ta) => {
                const daysLeft = daysUntil(ta.expirationDate);
                const landlordName =
                  ta.landlords[0]?.fullName || ta.additions.partiesSummary.landlordName;
                const tenantName =
                  ta.tenants[0]?.fullName || ta.additions.partiesSummary.tenantName;
                return (
                  <div
                    key={ta.id}
                    className="p-6 flex flex-wrap items-center justify-between gap-4 hover:bg-slate-50/70 transition-colors"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className="font-mono text-xs font-semibold text-slate-500">
                          TA #{ta.id} · {ta.adjudicationNo}
                        </span>
                        <StatusIndicator status={ta.status} />
                        <span className="text-xs font-semibold text-[#B45309] tabular-nums">
                          {daysLeft} days left
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-[#0F2942]">{ta.property.address}</h3>
                      <p className="text-xs text-slate-500">
                        Tenant: <strong className="text-[#0F2942]">{tenantName}</strong>
                        <span className="mx-2" aria-hidden="true">·</span>
                        Landlord: <strong className="text-[#0F2942]">{landlordName}</strong>
                        <span className="mx-2" aria-hidden="true">·</span>
                        Expires {formatDateMY(ta.expirationDate)}
                      </p>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-xs text-slate-500">Current Rent</div>
                        <div className="text-base font-bold text-[#0F2942] tabular-nums">
                          {formatRM(ta.property.monthlyRent, ta.property.currency)}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => onOpenRenewModal(ta)}
                        className="px-4 py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                      >
                        <RefreshCw className="w-4 h-4" />
                        <span>Renew TA</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>

        {renewedAgreements.length > 0 && (
          <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-[#E2E8F0]">
              <h2 className="text-sm font-bold text-[#0F2942]">
                Completed Renewals ({renewedAgreements.length})
              </h2>
            </div>
            <div className="divide-y divide-slate-100">
              {renewedAgreements.map((ta) => (
                <div key={ta.id} className="px-6 py-4 flex items-center justify-between gap-4 text-sm">
                  <div>
                    <span className="font-mono text-xs text-slate-500 mr-2">
                      TA #{ta.id} · {ta.adjudicationNo}
                    </span>
                    <span className="font-semibold text-[#0F2942]">{ta.property.address}</span>
                    <span className="text-xs text-slate-500 ml-2">
                      · {ta.tenants[0]?.fullName}
                    </span>
                  </div>
                  <StatusIndicator status={ta.status} />
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    );
  }

  // Default Agency Dashboard
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Agency Portfolio Dashboard
          </p>
          <h1 className="mt-1 text-2xl sm:text-3xl font-bold text-[#0F2942]">
            Tenancy Agreements &amp; Operations
          </h1>
        </div>
        <button
          type="button"
          onClick={() => onSelectTab('expenses')}
          className="px-4 py-2.5 text-sm font-semibold text-white bg-[#19B864] hover:bg-[#159E55] rounded-lg inline-flex items-center gap-2 cursor-pointer whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>Key In Expense</span>
        </button>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Active Tenancy Agreements</div>
          <div className="mt-2 text-2xl font-bold text-[#0F2942] tabular-nums">
            {activeAgreements.length}
          </div>
          <div className="mt-1 text-xs text-slate-400">Creator: {user.name}</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Expiring Soon (Needs Renew)</div>
          <div className="mt-2 text-2xl font-bold text-[#B45309] tabular-nums">
            {expiringAgreements.length}
          </div>
          <div className="mt-1 text-xs text-slate-400">Within next 60 days</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Monthly Rent Portfolio</div>
          <div className="mt-2 text-2xl font-bold text-[#1D4ED8] tabular-nums">
            {formatRM(totalPortfolioRent)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Across Melaka &amp; Klang Valley</div>
        </div>

        <div className="bg-white border border-[#E2E8F0] rounded-xl p-5">
          <div className="text-xs font-medium text-slate-500">Logged Expenses</div>
          <div className="mt-2 text-2xl font-bold text-[#0F2942] tabular-nums">
            {formatRM(totalExpenses)}
          </div>
          <div className="mt-1 text-xs text-slate-400">{expenses.length} recorded vouchers</div>
        </div>
      </div>

      {/* Expiring Soon Highlight Table */}
      {expiringAgreements.length > 0 && (
        <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-[#B45309]" />
              <h2 className="text-sm font-bold text-[#0F2942]">
                Expiring TAs — Action Required ({expiringAgreements.length})
              </h2>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('renewals')}
              className="text-xs font-semibold text-[#1D4ED8] hover:underline cursor-pointer"
            >
              Open Renewals Queue
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 border-b border-[#E2E8F0]">
                <tr>
                  <th className="py-3 px-6">Property &amp; Adjudication</th>
                  <th className="py-3 px-6">Tenant</th>
                  <th className="py-3 px-6">Expiration Date</th>
                  <th className="py-3 px-6 text-right">Monthly Rent</th>
                  <th className="py-3 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringAgreements.map((ta) => {
                  const daysLeft = daysUntil(ta.expirationDate);
                  return (
                    <tr key={ta.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-[#0F2942]">{ta.property.address}</div>
                        <div className="text-xs font-mono text-slate-500">
                          TA #{ta.id} · {ta.adjudicationNo}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-[#0F2942]">
                        {ta.tenants[0]?.fullName || ta.additions.partiesSummary.tenantName}
                      </td>
                      <td className="py-3.5 px-6 tabular-nums">
                        <div className="font-medium text-[#0F2942]">
                          {formatDateMY(ta.expirationDate)}
                        </div>
                        <div className="text-xs font-semibold text-[#B45309]">
                          {daysLeft} days left
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-right font-semibold tabular-nums text-[#0F2942]">
                        {formatRM(ta.property.monthlyRent, ta.property.currency)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => onOpenRenewModal(ta)}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Renew TA</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* All Active Tenancy Agreements */}
      <section className="bg-white border border-[#E2E8F0] rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-[#1D4ED8]" />
            <h2 className="text-sm font-bold text-[#0F2942]">All Tenancy Agreements</h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search property, tenant, adj..."
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] placeholder:text-slate-400 focus:outline-none focus:border-[#1D4ED8]"
              />
            </div>

            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              {(['all', 'Completed', 'Expiring Soon', 'Renewed'] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    statusFilter === status
                      ? 'bg-white text-[#0F2942] shadow-sm'
                      : 'text-slate-600 hover:text-[#0F2942]'
                  }`}
                >
                  {status === 'all' ? 'All' : status}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-semibold text-slate-500 border-b border-[#E2E8F0]">
              <tr>
                <th className="py-3 px-6">Property &amp; Adjudication</th>
                <th className="py-3 px-6">Tenant &amp; Landlord</th>
                <th className="py-3 px-6">Expiration</th>
                <th className="py-3 px-6">TA Status</th>
                <th className="py-3 px-6">Rent Status</th>
                <th className="py-3 px-6 text-right">Monthly Rent</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAgreements.map((ta) => {
                const rentStatus = getLatestInvoiceStatus(ta.id);
                const landlordName =
                  ta.landlords[0]?.fullName || ta.additions.partiesSummary.landlordName;
                const tenantName =
                  ta.tenants[0]?.fullName || ta.additions.partiesSummary.tenantName;
                return (
                  <tr key={ta.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-[#0F2942]">{ta.property.address}</div>
                      <div className="text-xs font-mono text-slate-500">
                        TA #{ta.id} · {ta.adjudicationNo} · {ta.property.buildingType}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-[#0F2942]">{tenantName}</div>
                      <div className="text-xs text-slate-500">Owner: {landlordName}</div>
                    </td>
                    <td className="py-3.5 px-6 text-slate-600 tabular-nums whitespace-nowrap">
                      {formatDateMY(ta.expirationDate)}
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusIndicator status={ta.status} />
                    </td>
                    <td className="py-3.5 px-6">
                      <StatusIndicator status={rentStatus} />
                    </td>
                    <td className="py-3.5 px-6 text-right font-semibold tabular-nums text-[#0F2942]">
                      {formatRM(ta.property.monthlyRent, ta.property.currency)}
                    </td>
                    <td className="py-3.5 px-6 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => onPreviewDoc({ type: 'ta', data: ta })}
                          className="px-2.5 py-1.5 text-xs font-semibold text-[#0F2942] bg-white border border-[#E2E8F0] hover:bg-slate-50 rounded-lg cursor-pointer"
                        >
                          View TA
                        </button>
                        {ta.status !== 'Renewed' && (
                          <button
                            type="button"
                            onClick={() => onOpenRenewModal(ta)}
                            className="px-2.5 py-1.5 text-xs font-semibold text-[#1D4ED8] bg-[#EEF4FF] hover:bg-[#E0EAFF] rounded-lg cursor-pointer"
                          >
                            Renew
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
