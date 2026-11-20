import React from 'react';
import { Download, Printer, X } from 'lucide-react';
import { RentInvoice, TenancyAgreement } from '../types';
import {
  buildInvoiceOrReceiptHtml,
  buildTenancyAgreementHtml,
  formatDateMY,
  formatRM,
  triggerHtmlDownload,
} from '../utils/formatters';
import { StatusIndicator } from './StatusIndicator';
import { BRAND, HartamasLogo, PoweredByZurely } from './BrandLogo';

export type PreviewDocument =
  | { type: 'invoice'; data: RentInvoice }
  | { type: 'ta'; data: TenancyAgreement };

interface DocumentModalProps {
  doc: PreviewDocument | null;
  onClose: () => void;
  onDownloadComplete?: (message: string) => void;
}

export const DocumentModal: React.FC<DocumentModalProps> = ({
  doc,
  onClose,
  onDownloadComplete,
}) => {
  if (!doc) return null;

  const handleDownload = () => {
    if (doc.type === 'invoice') {
      const inv = doc.data;
      const isPaid = inv.status === 'Paid';
      const ref = isPaid ? inv.receiptNumber || inv.invoiceNumber : inv.invoiceNumber;
      triggerHtmlDownload(`${ref}.html`, buildInvoiceOrReceiptHtml(inv));
      onDownloadComplete?.(`${isPaid ? 'Official Receipt' : 'Tax Invoice'} ${ref} downloaded.`);
    } else {
      const ta = doc.data;
      triggerHtmlDownload(`TA-${ta.id}-${ta.adjudicationNo}.html`, buildTenancyAgreementHtml(ta));
      onDownloadComplete?.(`Tenancy Agreement #${ta.id} (${ta.adjudicationNo}) downloaded.`);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-line rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-ink truncate">
              {doc.type === 'invoice'
                ? doc.data.status === 'Paid'
                  ? `Official Receipt · ${doc.data.receiptNumber || doc.data.invoiceNumber}`
                  : `Rental Invoice · ${doc.data.invoiceNumber}`
                : `Tenancy Agreement #${doc.data.id} · ${doc.data.adjudicationNo}`}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5 truncate">
              {doc.type === 'invoice' ? doc.data.propertyAddress : doc.data.property.address}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handlePrint}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-ink bg-white border border-line hover:bg-stone-50 rounded-lg cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-ink hover:bg-ink-soft rounded-lg cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close document preview"
              className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div id="printable-document" className="p-6 sm:p-8 overflow-y-auto space-y-6 bg-white">
          {doc.type === 'invoice' ? (
            <>
              <div className="flex flex-wrap items-start justify-between gap-4 pb-5 border-b border-stone-200">
                <div>
                  <HartamasLogo />
                  <div className="text-xs text-stone-500 mt-2">
                    {BRAND.agency} ({BRAND.companyNo})
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    {doc.data.status === 'Paid' ? 'Official Receipt' : 'Rental Tax Invoice'}
                  </div>
                  <div className="text-sm font-mono font-semibold text-ink mt-0.5">
                    {doc.data.status === 'Paid'
                      ? doc.data.receiptNumber || doc.data.invoiceNumber
                      : doc.data.invoiceNumber}
                  </div>
                  <div className="mt-2">
                    <StatusIndicator status={doc.data.status} />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Billed To (Tenant)
                  </div>
                  <div className="font-semibold text-ink mt-1">{doc.data.tenantName}</div>
                  <div className="text-stone-600 text-xs mt-0.5">
                    {doc.data.propertyAddress}
                  </div>
                  <div className="text-stone-500 text-xs">{doc.data.propertyCityState}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Property Owner (Landlord)
                  </div>
                  <div className="font-semibold text-ink mt-1">{doc.data.landlordName}</div>
                  <div className="text-stone-600 text-xs font-mono mt-0.5">
                    TA #{doc.data.taId} · {doc.data.adjudicationNo}
                  </div>
                </div>
              </div>

              <div className="border border-line rounded-lg overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-stone-50 text-xs font-semibold text-stone-500 border-b border-line">
                    <tr>
                      <th className="py-3 px-4">Description</th>
                      <th className="py-3 px-4">Period</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4 text-right">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-stone-100">
                      <td className="py-3.5 px-4 text-ink">Monthly Residential Rental</td>
                      <td className="py-3.5 px-4 text-stone-600">{doc.data.billingMonth}</td>
                      <td className="py-3.5 px-4 text-stone-600 tabular-nums">
                        {formatDateMY(doc.data.dueDate)}
                      </td>
                      <td className="py-3.5 px-4 text-right font-semibold tabular-nums text-ink">
                        {formatRM(doc.data.amount)}
                      </td>
                    </tr>
                    <tr className="bg-stone-50/60">
                      <td colSpan={3} className="py-3.5 px-4 font-bold text-ink">
                        {doc.data.status === 'Paid' ? 'Total Amount Paid' : 'Total Amount Due'}
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-base tabular-nums text-ink">
                        {formatRM(doc.data.amount)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {doc.data.status === 'Paid' ? (
                <div className="p-4 rounded-lg bg-[#ECFDF5] border border-[#BBF7D0] text-xs text-[#15803D] space-y-1">
                  <div className="font-semibold">Payment Confirmed</div>
                  <div>
                    Paid on {formatDateMY(doc.data.paidAt)} via{' '}
                    {doc.data.paymentMethod || 'FPX Online Banking'} · Ref:{' '}
                    <span className="font-mono">{doc.data.paymentRef}</span>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-lg bg-stone-50 border border-line text-xs text-stone-600">
                  Remit via FPX Online Banking or DuitNow QR on or before{' '}
                  <strong className="text-ink">{formatDateMY(doc.data.dueDate)}</strong>.
                </div>
              )}
            </>
          ) : (
            <>
              <div className="pb-4 border-b border-stone-200 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-accent">
                    {doc.data.type} Tenancy Agreement · ID #{doc.data.id}
                  </div>
                  <h4 className="text-lg font-bold text-ink mt-1">
                    {doc.data.property.address}
                  </h4>
                  <p className="text-xs text-stone-500 mt-0.5">
                    {doc.data.property.buildingType} · {doc.data.property.area} sq ft · Floor{' '}
                    {doc.data.property.floor} ·{' '}
                    {doc.data.property.furnishing ? 'Furnished' : 'Unfurnished'}
                  </p>
                </div>
                <div className="text-right">
                  <StatusIndicator status={doc.data.status} />
                  <div className="font-mono text-xs font-semibold text-ink mt-2">
                    Adj: {doc.data.adjudicationNo}
                  </div>
                  <div className="text-[11px] text-stone-500 mt-0.5">
                    Agreement Date: {formatDateMY(doc.data.agreementDate)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {doc.data.landlords.map((l, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-stone-50 border border-stone-200">
                    <div className="text-xs text-stone-500">Landlord</div>
                    <div className="font-semibold text-ink mt-0.5">{l.fullName}</div>
                    <div className="text-xs text-stone-500 font-mono mt-0.5">
                      NRIC: {l.nricNo} · {l.mobileNumber}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">{l.address}</div>
                  </div>
                ))}
                {doc.data.tenants.map((t, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-stone-50 border border-stone-200">
                    <div className="text-xs text-stone-500">Tenant</div>
                    <div className="font-semibold text-ink mt-0.5">{t.fullName}</div>
                    <div className="text-xs text-stone-500 font-mono mt-0.5">
                      NRIC: {t.nricNo} · {t.mobileNumber}
                    </div>
                    <div className="text-xs text-stone-500 mt-1">{t.address}</div>
                  </div>
                ))}
              </div>

              <div className="divide-y divide-stone-100 border border-line rounded-lg text-sm">
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Commencement – Expiration</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatDateMY(doc.data.commencementDate)} –{' '}
                    {formatDateMY(doc.data.expirationDate)} ({doc.data.property.duration} months)
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Monthly Rental</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatRM(doc.data.property.monthlyRent, doc.data.property.currency)}{' '}
                    {doc.data.property.isSteppedRent ? '(Stepped Rent)' : ''}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Security Deposit</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatRM(doc.data.securityDeposit, doc.data.property.currency)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Utility Deposit</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {formatRM(doc.data.utilityDeposit, doc.data.property.currency)}
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Duplicate Stamp Certificates</span>
                  <span className="font-semibold text-ink tabular-nums">
                    {doc.data.additions.copiesOfDuplicateStampCertCount} copy
                  </span>
                </div>
                <div className="px-4 py-2.5 flex justify-between gap-4">
                  <span className="text-stone-500">Creator / Agent</span>
                  <span className="font-semibold text-ink">
                    {doc.data.creator.fullName} ({doc.data.creator.phoneNumber})
                  </span>
                </div>
              </div>

              <div>
                <h5 className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2">
                  Digital Signatories
                </h5>
                <div className="border border-line rounded-lg overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-stone-50 text-stone-500 border-b border-line">
                      <tr>
                        <th className="py-2 px-3">Role</th>
                        <th className="py-2 px-3">Signer</th>
                        <th className="py-2 px-3">NRIC</th>
                        <th className="py-2 px-3">Status</th>
                        <th className="py-2 px-3 text-right">Signed Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {doc.data.signers.map((signer) => (
                        <tr key={signer.id}>
                          <td className="py-2 px-3 font-medium text-stone-600">
                            {signer.userRole}
                          </td>
                          <td className="py-2 px-3 font-semibold text-ink">{signer.name}</td>
                          <td className="py-2 px-3 font-mono text-stone-500">{signer.nricNo}</td>
                          <td className="py-2 px-3">
                            <StatusIndicator status={signer.status} />
                          </td>
                          <td className="py-2 px-3 text-right tabular-nums text-stone-600">
                            {formatDateMY(signer.signedAt)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}

          <div className="pt-4 border-t border-stone-100 flex flex-wrap items-center justify-between gap-3 text-[11px] text-stone-400">
            <span>Computer-generated document issued via {BRAND.product}. No signature required.</span>
            <PoweredByZurely />
          </div>
        </div>
      </div>
    </div>
  );
};
