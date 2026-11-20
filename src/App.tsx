import React, { useState } from 'react';
import {
  CalendarClock,
  CheckCircle2,
  FileText,
  Home,
  LayoutDashboard,
  Receipt,
  User,
  Wallet,
  X,
} from 'lucide-react';
import { AgencyPortal } from './components/AgencyPortal';
import { AppShell, NavItem } from './components/AppShell';
import { DocumentModal, PreviewDocument } from './components/DocumentModal';
import { LandlordPortal } from './components/LandlordPortal';
import { LoginPage } from './components/LoginPage';
import { PayRentModal } from './components/PayRentModal';
import { RenewTAModal } from './components/RenewTAModal';
import { TenantPortal } from './components/TenantPortal';
import {
  DEMO_USERS,
  INITIAL_AGREEMENTS,
  INITIAL_EXPENSES,
  INITIAL_INVOICES,
} from './data/mockData';
import {
  PropertyExpense,
  RentInvoice,
  TenancyAgreement,
  UserRole,
} from './types';
import {
  buildInvoiceOrReceiptHtml,
  buildTenancyAgreementHtml,
  triggerHtmlDownload,
} from './utils/formatters';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole | null>(null);
  const [activeTab, setActiveTab] = useState<string>('overview');

  const [agreements, setAgreements] = useState<TenancyAgreement[]>(INITIAL_AGREEMENTS);
  const [invoices, setInvoices] = useState<RentInvoice[]>(INITIAL_INVOICES);
  const [expenses, setExpenses] = useState<PropertyExpense[]>(INITIAL_EXPENSES);

  const [payInvoice, setPayInvoice] = useState<RentInvoice | null>(null);
  const [renewTargetTa, setRenewTargetTa] = useState<TenancyAgreement | null>(null);
  const [previewDoc, setPreviewDoc] = useState<PreviewDocument | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  const handleLogin = (role: UserRole) => {
    setCurrentRole(role);
    setActiveTab(role === 'tenant' ? 'overview' : 'dashboard');
  };

  const handleSwitchRole = (role: UserRole) => {
    setCurrentRole(role);
    setActiveTab(role === 'tenant' ? 'overview' : 'dashboard');
    showToast(`Switched to ${DEMO_USERS[role].name} (${role})`);
  };

  const handleLogout = () => {
    setCurrentRole(null);
    setPayInvoice(null);
    setRenewTargetTa(null);
    setPreviewDoc(null);
  };

  const handleConfirmRentPayment = (
    invoiceId: string,
    method: 'FPX Online Banking' | 'DuitNow QR' | 'Credit / Debit Card',
    bankOrChannel: string
  ) => {
    const receiptNo = `RCP-2026-${Math.floor(1100 + Math.random() * 899)}`;
    const paymentRef = `${method === 'DuitNow QR' ? 'DNQR' : method === 'FPX Online Banking' ? 'FPX' : 'PG'}-${Date.now().toString().slice(-8)}`;

    setInvoices((prev) =>
      prev.map((inv) =>
        inv.id === invoiceId
          ? {
              ...inv,
              status: 'Paid',
              receiptNumber: receiptNo,
              paidAt: '2026-11-13',
              paymentMethod: method,
              paymentRef: `${bankOrChannel} · ${paymentRef}`,
            }
          : inv
      )
    );
    setPayInvoice(null);
    showToast(`Payment successful via ${bankOrChannel}. Receipt ${receiptNo} is ready.`);
  };

  const handleRenewSubmit = (
    oldTaId: number,
    payload: {
      newMonthlyRent: number;
      duration: number;
      commencementDate: string;
      expirationDate: string;
      securityDeposit: number;
      utilityDeposit: number;
    }
  ) => {
    const oldTa = agreements.find((item) => item.id === oldTaId);
    if (!oldTa) return;

    const nowIso = new Date().toISOString();
    const newId = Math.max(...agreements.map((a) => a.id), 110) + 1;
    const newAdj = `ADJ${Date.now().toString().slice(-10)}MY`;

    const newTa: TenancyAgreement = {
      ...oldTa,
      id: newId,
      status: 'Completed',
      agreementDate: nowIso,
      commencementDate: payload.commencementDate,
      expirationDate: payload.expirationDate,
      adjudicationNo: newAdj,
      securityDeposit: payload.securityDeposit,
      utilityDeposit: payload.utilityDeposit,
      editCount: 0,
      createdAt: nowIso,
      updatedAt: nowIso,
      property: {
        ...oldTa.property,
        monthlyRent: payload.newMonthlyRent,
        duration: payload.duration,
        updatedAt: nowIso,
      },
      signers: oldTa.signers.map((s) => ({
        ...s,
        agreementId: newId,
        signedAt: nowIso,
        updatedAt: nowIso,
      })),
    };

    setAgreements((prev) => [
      newTa,
      ...prev.map((item) =>
        item.id === oldTaId ? { ...item, status: 'Renewed' as const } : item
      ),
    ]);
    setRenewTargetTa(null);
    showToast(`Created renewed Tenancy Agreement #${newId} (${newAdj}).`);
  };

  const handleAddExpense = (expenseInput: Omit<PropertyExpense, 'id'>) => {
    const newExpense: PropertyExpense = {
      ...expenseInput,
      id: `exp-${Date.now()}`,
    };
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(`Saved expense ${newExpense.receiptRef} for TA #${newExpense.taId}.`);
  };

  const handleDeleteExpense = (expenseId: string) => {
    setExpenses((prev) => prev.filter((item) => item.id !== expenseId));
    showToast('Expense entry removed.');
  };

  const handleDirectDownloadInvoice = (inv: RentInvoice) => {
    const isPaid = inv.status === 'Paid';
    const ref = isPaid ? inv.receiptNumber || inv.invoiceNumber : inv.invoiceNumber;
    triggerHtmlDownload(`${ref}.html`, buildInvoiceOrReceiptHtml(inv));
    showToast(`${isPaid ? 'Official Receipt' : 'Tax Invoice'} (${ref}) downloaded.`);
  };

  const handleDirectDownloadTa = (ta: TenancyAgreement) => {
    triggerHtmlDownload(`TA-${ta.id}-${ta.adjudicationNo}.html`, buildTenancyAgreementHtml(ta));
    showToast(`Tenancy Agreement #${ta.id} (${ta.adjudicationNo}) downloaded.`);
  };

  if (!currentRole) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const user = DEMO_USERS[currentRole];
  const expiringCount = agreements.filter((ta) => ta.status === 'Expiring Soon').length;

  const navItemsByRole: Record<UserRole, NavItem[]> = {
    tenant: [
      { id: 'overview', label: 'My Tenancy', icon: Home },
      { id: 'agreement', label: 'Tenancy Agreement', icon: FileText },
      { id: 'invoices', label: 'Due Invoices', icon: Receipt },
      { id: 'profile', label: 'My Profile', icon: User },
    ],
    agency: [
      { id: 'dashboard', label: 'Agency Dashboard', icon: LayoutDashboard },
      {
        id: 'renewals',
        label: 'Renewals Queue',
        icon: CalendarClock,
        badgeCount: expiringCount,
      },
      { id: 'expenses', label: 'Key In Expenses', icon: Wallet },
      { id: 'profile', label: 'My Profile', icon: User },
    ],
    landlord: [
      { id: 'dashboard', label: 'Landlord Dashboard', icon: LayoutDashboard },
      { id: 'invoices', label: 'Invoices & Receipts', icon: Receipt },
      { id: 'expenses', label: 'Expenses & Yield', icon: Wallet },
      { id: 'profile', label: 'My Profile', icon: User },
    ],
  };

  const tenantAgreement =
    agreements.find(
      (ta) =>
        ta.tenants.some((t) => t.nricNo === user.nricNo || t.fullName === user.name) &&
        ta.status !== 'Renewed'
    ) || agreements[0];
  const tenantInvoices = invoices.filter((inv) => inv.taId === tenantAgreement.id);

  return (
    <>
      <AppShell
        user={user}
        navItems={navItemsByRole[currentRole]}
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onSwitchRole={handleSwitchRole}
        onLogout={handleLogout}
      >
        {currentRole === 'tenant' && (
          <TenantPortal
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            agreement={tenantAgreement}
            invoices={tenantInvoices}
            onOpenPayModal={setPayInvoice}
            onPreviewDoc={setPreviewDoc}
            onDirectDownloadInvoice={handleDirectDownloadInvoice}
            onDirectDownloadTa={handleDirectDownloadTa}
          />
        )}

        {currentRole === 'agency' && (
          <AgencyPortal
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            agreements={agreements}
            invoices={invoices}
            expenses={expenses}
            onOpenRenewModal={setRenewTargetTa}
            onPreviewDoc={setPreviewDoc}
            onAddExpense={handleAddExpense}
            onDeleteExpense={handleDeleteExpense}
          />
        )}

        {currentRole === 'landlord' && (
          <LandlordPortal
            user={user}
            activeTab={activeTab}
            onSelectTab={setActiveTab}
            agreements={agreements}
            invoices={invoices}
            expenses={expenses}
            onPreviewDoc={setPreviewDoc}
            onDirectDownloadInvoice={handleDirectDownloadInvoice}
          />
        )}
      </AppShell>

      <PayRentModal
        invoice={payInvoice}
        onClose={() => setPayInvoice(null)}
        onConfirmPayment={handleConfirmRentPayment}
      />

      <RenewTAModal
        sourceTa={renewTargetTa}
        onClose={() => setRenewTargetTa(null)}
        onSubmitRenewal={handleRenewSubmit}
      />

      <DocumentModal
        doc={previewDoc}
        onClose={() => setPreviewDoc(null)}
        onDownloadComplete={showToast}
      />

      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 max-w-sm bg-ink text-white px-4 py-3 rounded-xl shadow-lg flex items-center justify-between gap-3 text-xs sm:text-sm"
        >
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#19B864] shrink-0" />
            <span>{toastMessage}</span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            aria-label="Dismiss notification"
            className="text-stone-300 hover:text-white p-0.5 cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </>
  );
}
