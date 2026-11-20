import React, { useEffect, useState } from 'react';
import { FilePlus2, X } from 'lucide-react';
import { TenancyAgreement } from '../types';
import { calculateMalaysiaStampDuty, formatDateMY, formatRM } from '../utils/formatters';

interface RenewTAModalProps {
  sourceTa: TenancyAgreement | null;
  onClose: () => void;
  onSubmitRenewal: (
    oldTaId: number,
    payload: {
      newMonthlyRent: number;
      duration: number;
      commencementDate: string;
      expirationDate: string;
      securityDeposit: number;
      utilityDeposit: number;
    }
  ) => void;
}

function addDaysIso(isoDate: string, days: number): string {
  const d = new Date(`${isoDate}T00:00:00`);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function addMonthsMinusOneDayIso(startIso: string, months: number): string {
  const d = new Date(`${startIso}T00:00:00`);
  d.setMonth(d.getMonth() + months);
  d.setDate(d.getDate() - 1);
  return d.toISOString().slice(0, 10);
}

export const RenewTAModal: React.FC<RenewTAModalProps> = ({
  sourceTa,
  onClose,
  onSubmitRenewal,
}) => {
  const [monthlyRent, setMonthlyRent] = useState(1500);
  const [duration, setDuration] = useState(12);
  const [commencementDate, setCommencementDate] = useState('2026-12-10');

  useEffect(() => {
    if (sourceTa) {
      const nextStart = addDaysIso(sourceTa.expirationDate, 1);
      setMonthlyRent(sourceTa.property.monthlyRent);
      setDuration(sourceTa.property.duration || 12);
      setCommencementDate(nextStart);
    }
  }, [sourceTa]);

  if (!sourceTa) return null;

  const expirationDate = addMonthsMinusOneDayIso(commencementDate, duration);
  const estimatedStampDuty = calculateMalaysiaStampDuty(monthlyRent || 0, duration);
  const landlordName =
    sourceTa.landlords[0]?.fullName || sourceTa.additions.partiesSummary.landlordName;
  const tenantName =
    sourceTa.tenants[0]?.fullName || sourceTa.additions.partiesSummary.tenantName;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitRenewal(sourceTa.id, {
      newMonthlyRent: Number(monthlyRent),
      duration,
      commencementDate,
      expirationDate,
      securityDeposit: Number(monthlyRent) * 2,
      utilityDeposit: Math.round(Number(monthlyRent) * 0.5),
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#0F2942]/40 backdrop-blur-[1px] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="bg-white border border-[#E2E8F0] rounded-xl w-full max-w-xl shadow-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-[#E2E8F0] flex items-center justify-between">
          <div className="min-w-0">
            <h3 className="text-base font-bold text-[#0F2942]">
              Create Renewal Tenancy Agreement
            </h3>
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              Renewing TA #{sourceTa.id} ({sourceTa.adjudicationNo}) · {sourceTa.property.address}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close renewal modal"
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 rounded-lg bg-[#F7F9FC] border border-[#E2E8F0] text-xs">
            <div>
              <span className="text-slate-500">Landlord:</span>{' '}
              <span className="font-semibold text-[#0F2942]">{landlordName}</span>
            </div>
            <div>
              <span className="text-slate-500">Tenant:</span>{' '}
              <span className="font-semibold text-[#0F2942]">{tenantName}</span>
            </div>
            <div>
              <span className="text-slate-500">Expiration Date:</span>{' '}
              <span className="font-semibold text-[#B45309] tabular-nums">
                {formatDateMY(sourceTa.expirationDate)}
              </span>
            </div>
            <div>
              <span className="text-slate-500">Current Rent:</span>{' '}
              <span className="font-semibold text-[#0F2942] tabular-nums">
                {formatRM(sourceTa.property.monthlyRent, sourceTa.property.currency)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="renew-rent"
                className="block text-xs font-semibold text-[#0F2942] mb-1.5"
              >
                New Monthly Rent ({sourceTa.property.currency})
              </label>
              <input
                id="renew-rent"
                type="number"
                min={500}
                step={50}
                required
                value={monthlyRent}
                onChange={(e) => setMonthlyRent(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <label
                htmlFor="renew-tenure"
                className="block text-xs font-semibold text-[#0F2942] mb-1.5"
              >
                Duration (Months)
              </label>
              <select
                id="renew-tenure"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              >
                <option value={12}>12 Months (1 Year)</option>
                <option value={24}>24 Months (2 Years)</option>
                <option value={36}>36 Months (3 Years)</option>
              </select>
            </div>

            <div>
              <label
                htmlFor="renew-start"
                className="block text-xs font-semibold text-[#0F2942] mb-1.5"
              >
                Commencement Date
              </label>
              <input
                id="renew-start"
                type="date"
                required
                value={commencementDate}
                onChange={(e) => setCommencementDate(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm bg-white border border-[#E2E8F0] rounded-lg text-[#0F2942] tabular-nums focus:outline-none focus:ring-2 focus:ring-[#1D4ED8]/20 focus:border-[#1D4ED8]"
              />
            </div>

            <div>
              <div className="block text-xs font-semibold text-[#0F2942] mb-1.5">
                Expiration Date
              </div>
              <div className="px-3.5 py-2.5 text-sm bg-slate-50 border border-[#E2E8F0] rounded-lg text-slate-700 tabular-nums">
                {formatDateMY(expirationDate)}
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-lg bg-[#EEF4FF] border border-[#BFDBFE] flex items-center justify-between text-xs">
            <span className="text-[#0F2942] font-medium">
              Estimated LHDN Stamp Duty (Stamp Act 1949)
            </span>
            <span className="font-bold text-[#1D4ED8] tabular-nums text-sm">
              {formatRM(estimatedStampDuty)}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-[#0F2942] rounded-lg cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-semibold text-white bg-[#1D4ED8] hover:bg-[#1E40AF] rounded-lg transition-colors flex items-center gap-2 cursor-pointer"
            >
              <FilePlus2 className="w-4 h-4" />
              <span>Generate &amp; Activate New TA</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
