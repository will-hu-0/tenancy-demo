import React, { useState } from 'react';
import {
  Building2,
  Download,
  FileText,
  Phone,
  Receipt,
  UserCheck,
  X,
} from 'lucide-react';
import {
  PropertyExpense,
  RentInvoice,
  TenancyAgreement,
  UserAccount,
} from '../types';
import { formatDateMY, formatRM } from '../utils/formatters';
import { PreviewDocument } from './DocumentModal';
import { ProfileView } from './ProfileView';
import { StatusIndicator } from './StatusIndicator';

interface LandlordPortalProps {
  user: UserAccount;
  activeTab: string;
  onSelectTab: (tab: string) => void;
  agreements: TenancyAgreement[];
  invoices: RentInvoice[];
  expenses: PropertyExpense[];
  onPreviewDoc: (doc: PreviewDocument) => void;
  onDirectDownloadInvoice: (invoice: RentInvoice) => void;
}

export const LandlordPortal: React.FC<LandlordPortalProps> = ({
  user,
  activeTab,
  onSelectTab,
  agreements,
  invoices,
  expenses,
  onPreviewDoc,
  onDirectDownloadInvoice,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | 'Paid' | 'Unpaid'>('all');
  const [selectedTaDetail, setSelectedTaDetail] = useState<TenancyAgreement | null>(null);

  const myAgreements = agreements.filter(
    (ta) =>
      ta.landlords.some((l) => l.nricNo === user.nricNo || l.fullName === user.name) &&
      ta.status !== 'Renewed'
  );
  const myTaIds = new Set(myAgreements.map((ta) => ta.id));
  const myInvoices = invoices.filter((inv) => myTaIds.has(inv.taId));
  const myExpenses = expenses.filter((exp) => myTaIds.has(exp.taId));

  const currentMonthInvoices = myAgreements.map((ta) => {
    const latestInv = myInvoices.find((inv) => inv.taId === ta.id);
    return { ta, invoice: latestInv };
  });

  const collectedAmount = currentMonthInvoices.reduce(
    (sum, item) => (item.invoice?.status === 'Paid' ? sum + item.invoice.amount : sum),
    0
  );
  const unpaidAmount = currentMonthInvoices.reduce(
    (sum, item) =>
      item.invoice && item.invoice.status !== 'Paid' ? sum + item.invoice.amount : sum,
    0
  );
  const landlordExpensesTotal = myExpenses
    .filter((exp) => exp.paidBy === 'Landlord')
    .reduce((sum, exp) => sum + exp.amount, 0);
  const netPayout = collectedAmount - landlordExpensesTotal;

  const filteredInvoices = myInvoices.filter((inv) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'Paid') return inv.status === 'Paid';
    return inv.status !== 'Paid';
  });

  if (activeTab === 'profile') {
    return (
      <ProfileView
        user={user}
        summaryTitle="Landlord Portfolio"
        summarySubtitle="Collected Rent"
        summaryValue={formatRM(collectedAmount)}
        ctaLabel="View Invoices & Receipts"
        onCtaClick={() => onSelectTab('invoices')}
      />
    );
  }

  if (activeTab === 'invoices') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Rental Statements
            </p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-ink">
              Invoices &amp; Official Receipts
            </h1>
          </div>

          <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
            {(['all', 'Paid', 'Unpaid'] as const).map((filterVal) => (
              <button
                key={filterVal}
                type="button"
                onClick={() => setStatusFilter(filterVal)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                  statusFilter === filterVal
                    ? 'bg-white text-ink shadow-sm'
                    : 'text-stone-600 hover:text-ink'
                }`}
              >
                {filterVal === 'all' ? 'All' : filterVal === 'Paid' ? 'Paid' : 'Unpaid / Overdue'}
              </button>
            ))}
          </div>
        </div>

        <section className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50/80 text-xs font-semibold text-stone-500 border-b border-line">
                <tr>
                  <th className="py-3.5 px-6">Document No.</th>
                  <th className="py-3.5 px-6">Property</th>
                  <th className="py-3.5 px-6">Tenant</th>
                  <th className="py-3.5 px-6">Period</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Amount</th>
                  <th className="py-3.5 px-6 text-right">Download</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredInvoices.map((inv) => {
                  const isPaid = inv.status === 'Paid';
                  return (
                    <tr key={inv.id} className="hover:bg-stone-50/70 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs font-semibold text-ink">
                        <button
                          type="button"
                          onClick={() => onPreviewDoc({ type: 'invoice', data: inv })}
                          className="hover:text-accent hover:underline cursor-pointer"
                        >
                          {isPaid ? inv.receiptNumber || inv.invoiceNumber : inv.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-3.5 px-6">
                        <div className="font-semibold text-ink">{inv.propertyAddress}</div>
                        <div className="text-xs text-stone-500">
                          TA #{inv.taId} · {inv.propertyCityState}
                        </div>
                      </td>
                      <td className="py-3.5 px-6 text-ink">{inv.tenantName}</td>
                      <td className="py-3.5 px-6 text-stone-600">{inv.billingMonth}</td>
                      <td className="py-3.5 px-6">
                        <StatusIndicator status={inv.status} />
                      </td>
                      <td className="py-3.5 px-6 text-right font-semibold tabular-nums text-ink">
                        {formatRM(inv.amount)}
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => onDirectDownloadInvoice(inv)}
                          className="px-3 py-1.5 text-xs font-semibold text-accent bg-brand-soft hover:bg-brand-muted rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{isPaid ? 'Download Receipt' : 'Download Invoice'}</span>
                        </button>
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
  }

  if (activeTab === 'expenses') {
    return (
      <div className="space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
              Owner Deductions &amp; Yield
            </p>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-ink">
              Property Expenses &amp; Net Payout
            </h1>
          </div>
          <div className="text-right">
            <div className="text-xs text-stone-500">Estimated Net Payout</div>
            <div className="text-2xl font-bold text-[#15803D] tabular-nums">
              {formatRM(netPayout)}
            </div>
          </div>
        </div>

        <section className="bg-white border border-line rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-line flex items-center gap-2">
            <Receipt className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-bold text-ink">
              Agency-Logged Property Expenses ({myExpenses.length})
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-stone-50/80 text-xs font-semibold text-stone-500 border-b border-line">
                <tr>
                  <th className="py-3 px-6">Date</th>
                  <th className="py-3 px-6">Property</th>
                  <th className="py-3 px-6">Category &amp; Details</th>
                  <th className="py-3 px-6">Paid By</th>
                  <th className="py-3 px-6 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {myExpenses.map((exp) => (
                  <tr key={exp.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-3.5 px-6 text-stone-600 tabular-nums whitespace-nowrap">
                      {formatDateMY(exp.expenseDate)}
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-semibold text-ink">{exp.propertyAddress}</div>
                      <div className="text-xs text-stone-500">
                        TA #{exp.taId} · {exp.cityState}
                      </div>
                    </td>
                    <td className="py-3.5 px-6">
                      <div className="font-medium text-ink">{exp.category}</div>
                      <div className="text-xs text-stone-500">{exp.description}</div>
                    </td>
                    <td className="py-3.5 px-6 text-xs text-stone-600">{exp.paidBy}</td>
                    <td className="py-3.5 px-6 text-right font-semibold tabular-nums text-ink">
                      {formatRM(exp.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    );
  }

  // Default Landlord Dashboard
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-stone-400">
          Landlord Portal
        </p>
        <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold text-ink">
          Active Tenancies &amp; Rent Collection
        </h1>
      </div>

      {/* 4-Column KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-line rounded-xl p-5">
          <div className="text-xs font-medium text-stone-500">Active Properties (TAs)</div>
          <div className="mt-2 text-2xl font-bold text-ink tabular-nums">
            {myAgreements.length}
          </div>
          <div className="mt-1 text-xs text-stone-400">Managed by Hartamas Real Estate</div>
        </div>

        <div className="bg-white border border-line rounded-xl p-5">
          <div className="text-xs font-medium text-stone-500">Collected Rent</div>
          <div className="mt-2 text-2xl font-bold text-[#15803D] tabular-nums">
            {formatRM(collectedAmount)}
          </div>
          <div className="mt-1 text-xs text-stone-400">Paid via FPX / DuitNow</div>
        </div>

        <div className="bg-white border border-line rounded-xl p-5">
          <div className="text-xs font-medium text-stone-500">Pending / Unpaid Rent</div>
          <div className="mt-2 text-2xl font-bold text-[#C2410C] tabular-nums">
            {formatRM(unpaidAmount)}
          </div>
          <div className="mt-1 text-xs text-stone-400">Awaiting tenant transfer</div>
        </div>

        <div className="bg-white border border-line rounded-xl p-5">
          <div className="text-xs font-medium text-stone-500">Net Payout After Expenses</div>
          <div className="mt-2 text-2xl font-bold text-ink tabular-nums">
            {formatRM(netPayout)}
          </div>
          <div className="mt-1 text-xs text-stone-400">
            Less {formatRM(landlordExpensesTotal)} owner expenses
          </div>
        </div>
      </div>

      {/* Active TAs + Tenant Payment Status Table */}
      <section className="bg-white border border-line rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-accent" />
            <h2 className="text-sm font-bold text-ink">
              Active Tenancy Agreements &amp; Tenant Status
            </h2>
          </div>
          <button
            type="button"
            onClick={() => onSelectTab('invoices')}
            className="text-xs font-semibold text-accent hover:underline cursor-pointer"
          >
            All Invoices &amp; Receipts
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-stone-50/80 text-xs font-semibold text-stone-500 border-b border-line">
              <tr>
                <th className="py-3 px-6">Property &amp; Adjudication</th>
                <th className="py-3 px-6">Tenant Information</th>
                <th className="py-3 px-6">Tenancy Period</th>
                <th className="py-3 px-6">Rent Status</th>
                <th className="py-3 px-6 text-right">Monthly Rent</th>
                <th className="py-3 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {currentMonthInvoices.map(({ ta, invoice }) => {
                const isPaid = invoice?.status === 'Paid';
                const tenant = ta.tenants[0];
                const tenantName = tenant?.fullName || ta.additions.partiesSummary.tenantName;
                return (
                  <tr key={ta.id} className="hover:bg-stone-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-ink">{ta.property.address}</div>
                      <div className="text-xs font-mono text-stone-500 mt-0.5">
                        TA #{ta.id} · {ta.adjudicationNo}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-ink">{tenantName}</div>
                      <div className="text-xs text-stone-500 font-mono flex items-center gap-1 mt-0.5">
                        <Phone className="w-3 h-3 text-stone-400" />
                        <span>{tenant?.mobileNumber}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-xs text-stone-600 tabular-nums whitespace-nowrap">
                      <div>
                        {formatDateMY(ta.commencementDate)} – {formatDateMY(ta.expirationDate)}
                      </div>
                      <div className="text-stone-400 mt-0.5">{ta.property.duration} months</div>
                    </td>
                    <td className="py-4 px-6">
                      {invoice ? (
                        <div>
                          <StatusIndicator status={invoice.status} />
                          <div className="text-[11px] text-stone-500 mt-1 tabular-nums">
                            {isPaid
                              ? `Paid ${formatDateMY(invoice.paidAt)}`
                              : `${invoice.billingMonth} · Due ${formatDateMY(invoice.dueDate)}`}
                          </div>
                        </div>
                      ) : (
                        <StatusIndicator status="Paid" />
                      )}
                    </td>
                    <td className="py-4 px-6 text-right font-semibold tabular-nums text-ink">
                      {formatRM(ta.property.monthlyRent, ta.property.currency)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="inline-flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedTaDetail(ta)}
                          className="px-3 py-1.5 text-xs font-semibold text-ink bg-white border border-line hover:bg-stone-50 rounded-lg cursor-pointer whitespace-nowrap"
                        >
                          Tenant Info
                        </button>
                        {invoice && (
                          <button
                            type="button"
                            onClick={() => onDirectDownloadInvoice(invoice)}
                            className="px-3 py-1.5 text-xs font-semibold text-accent bg-brand-soft hover:bg-brand-muted rounded-lg inline-flex items-center gap-1.5 cursor-pointer whitespace-nowrap"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>{isPaid ? 'Receipt' : 'Invoice'}</span>
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

      {/* Tenant & TA Detail Modal for Landlord */}
      {selectedTaDetail && (
        <div
          className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[1px] flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white border border-line rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-accent" />
                <h3 className="text-base font-bold text-ink">
                  Tenant &amp; Tenancy Summary
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedTaDetail(null)}
                aria-label="Close tenant detail"
                className="p-2 text-stone-400 hover:text-stone-600 rounded-lg hover:bg-stone-100 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div>
                <div className="text-xs text-stone-500">Property</div>
                <div className="font-bold text-ink mt-0.5">
                  {selectedTaDetail.property.address}
                </div>
                <div className="text-xs text-stone-500">
                  {selectedTaDetail.property.buildingType} · {selectedTaDetail.property.area} sq ft
                </div>
              </div>

              <div className="divide-y divide-stone-100 border border-line rounded-lg">
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Tenant Name</span>
                  <span className="font-semibold text-ink">
                    {selectedTaDetail.tenants[0]?.fullName}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">NRIC</span>
                  <span className="font-mono text-ink">
                    {selectedTaDetail.tenants[0]?.nricNo}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Mobile</span>
                  <span className="font-mono text-ink">
                    {selectedTaDetail.tenants[0]?.mobileNumber}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Tenant Address</span>
                  <span className="text-right text-xs text-ink max-w-[260px]">
                    {selectedTaDetail.tenants[0]?.address}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Security &amp; Utility Deposits</span>
                  <span className="font-semibold tabular-nums text-ink">
                    {formatRM(
                      selectedTaDetail.securityDeposit + selectedTaDetail.utilityDeposit,
                      selectedTaDetail.property.currency
                    )}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Adjudication No.</span>
                  <span className="font-mono text-xs text-ink">
                    {selectedTaDetail.adjudicationNo}
                  </span>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-stone-50 border-t border-line flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  const ta = selectedTaDetail;
                  setSelectedTaDetail(null);
                  onPreviewDoc({ type: 'ta', data: ta });
                }}
                className="px-4 py-2 text-xs font-semibold text-accent bg-brand-soft hover:bg-brand-muted rounded-lg inline-flex items-center gap-1.5 cursor-pointer"
              >
                <FileText className="w-3.5 h-3.5" />
                <span>View Full TA</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedTaDetail(null)}
                className="px-4 py-2 text-xs font-semibold text-ink bg-white border border-line hover:bg-stone-50 rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
