import React, { useState } from 'react';
import { CheckCircle2, CreditCard, Landmark, QrCode, ShieldCheck, X } from 'lucide-react';
import { RentInvoice } from '../types';
import { formatDateMY, formatRM } from '../utils/formatters';

interface PayRentModalProps {
  invoice: RentInvoice | null;
  onClose: () => void;
  onConfirmPayment: (
    invoiceId: string,
    method: 'FPX Online Banking' | 'DuitNow QR' | 'Credit / Debit Card',
    bankOrChannel: string
  ) => void;
}

const MALAYSIAN_BANKS = [
  'Maybank2u',
  'CIMB Clicks',
  'Public Bank (PBe)',
  'RHB Now',
  'Hong Leong Connect',
  'AmOnline',
];

export const PayRentModal: React.FC<PayRentModalProps> = ({
  invoice,
  onClose,
  onConfirmPayment,
}) => {
  const [method, setMethod] = useState<'FPX Online Banking' | 'DuitNow QR' | 'Credit / Debit Card'>(
    'FPX Online Banking'
  );
  const [selectedBank, setSelectedBank] = useState(MALAYSIAN_BANKS[0]);
  const [isProcessing, setIsProcessing] = useState(false);

  if (!invoice) return null;

  const handlePay = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onConfirmPayment(
        invoice.id,
        method,
        method === 'FPX Online Banking' ? selectedBank : method
      );
    }, 550);
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-ink/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-line rounded-xl w-full max-w-lg shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-line flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">Pay Monthly Rent</h3>
            <p className="text-xs text-stone-500 mt-0.5">
              Payment Gateway Checkout · {invoice.invoiceNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close payment checkout"
            className="p-2 text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Summary */}
          <div className="p-4 rounded-xl bg-canvas border border-line flex items-center justify-between gap-4">
            <div className="min-w-0">
              <div className="text-xs font-medium text-stone-500 truncate">
                {invoice.propertyAddress}
              </div>
              <div className="text-sm font-semibold text-ink mt-0.5">
                {invoice.billingMonth} Rental · TA #{invoice.taId}
              </div>
              <div className="text-xs text-stone-500 mt-0.5">
                Due {formatDateMY(invoice.dueDate)} · {invoice.propertyCityState}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-xs text-stone-500">Total Payable</div>
              <div className="text-xl font-bold text-ink tabular-nums mt-0.5">
                {formatRM(invoice.amount)}
              </div>
            </div>
          </div>

          {/* Payment Method Selector */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-stone-500 mb-2.5">
              Select Payment Method
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('FPX Online Banking')}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  method === 'FPX Online Banking'
                    ? 'bg-brand-soft border-ink text-ink'
                    : 'bg-white border-line text-stone-600 hover:bg-stone-50'
                }`}
              >
                <Landmark className="w-4 h-4 text-accent mb-1.5" />
                <div className="text-xs font-semibold">FPX Bank</div>
                <div className="text-[11px] text-stone-500">RM 0.00 fee</div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('DuitNow QR')}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  method === 'DuitNow QR'
                    ? 'bg-brand-soft border-ink text-ink'
                    : 'bg-white border-line text-stone-600 hover:bg-stone-50'
                }`}
              >
                <QrCode className="w-4 h-4 text-accent mb-1.5" />
                <div className="text-xs font-semibold">DuitNow QR</div>
                <div className="text-[11px] text-stone-500">Instant</div>
              </button>

              <button
                type="button"
                onClick={() => setMethod('Credit / Debit Card')}
                className={`p-3 rounded-lg border text-left transition-colors cursor-pointer ${
                  method === 'Credit / Debit Card'
                    ? 'bg-brand-soft border-ink text-ink'
                    : 'bg-white border-line text-stone-600 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-accent mb-1.5" />
                <div className="text-xs font-semibold">Card</div>
                <div className="text-[11px] text-stone-500">Visa / MC</div>
              </button>
            </div>
          </div>

          {method === 'FPX Online Banking' && (
            <div>
              <label
                htmlFor="fpx-bank"
                className="block text-xs font-semibold text-ink mb-1.5"
              >
                Choose FPX Bank
              </label>
              <select
                id="fpx-bank"
                value={selectedBank}
                onChange={(e) => setSelectedBank(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-line rounded-lg text-ink focus:outline-none focus:ring-2 focus:ring-brand/70 focus:border-ink"
              >
                {MALAYSIAN_BANKS.map((bank) => (
                  <option key={bank} value={bank}>
                    {bank}
                  </option>
                ))}
              </select>
            </div>
          )}

          {method === 'DuitNow QR' && (
            <div className="p-4 rounded-lg border border-line bg-stone-50 flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-white border border-line flex items-center justify-center shrink-0">
                <QrCode className="w-10 h-10 text-ink" />
              </div>
              <div className="text-xs text-stone-600 leading-relaxed">
                <div className="font-semibold text-ink">Scan with MAE, CIMB OCTO, or TNG eWallet</div>
                <div>Confirm payment below once your PG transfer completes.</div>
              </div>
            </div>
          )}

          {method === 'Credit / Debit Card' && (
            <div className="p-3.5 rounded-lg border border-line bg-stone-50 text-xs text-stone-600">
              Redirects securely to the Payment Gateway (PG) 3DS card authorization flow upon submission.
            </div>
          )}

          <div className="flex items-center gap-2 text-xs text-stone-500">
            <ShieldCheck className="w-4 h-4 text-[#19B864] shrink-0" />
            <span>Demo PG handoff — generates an instant Official Receipt upon confirmation</span>
          </div>
        </div>

        <div className="px-6 py-4 bg-stone-50 border-t border-line flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-stone-600 hover:text-ink rounded-lg cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={isProcessing}
            onClick={handlePay}
            className="px-5 py-2.5 text-sm font-semibold text-ink bg-brand hover:bg-brand-hover disabled:opacity-60 rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>
              {isProcessing ? 'Authorizing PG...' : `Pay ${formatRM(invoice.amount)} Now`}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};
