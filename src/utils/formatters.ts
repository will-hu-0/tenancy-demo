import { RentInvoice, TenancyAgreement } from '../types';

export function formatRM(amount: number, currency = 'RM'): string {
  return `${currency} ${amount.toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

export function formatDateMY(isoDate: string | null | undefined): string {
  if (!isoDate) return '-';
  const normalized = isoDate.includes('T') ? isoDate : `${isoDate}T00:00:00`;
  const date = new Date(normalized);
  if (Number.isNaN(date.getTime())) return isoDate;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

// Reference baseline matches system clock date (2026-11-13)
const REFERENCE_TODAY = new Date('2026-11-13T00:00:00');

export function daysUntil(isoDate: string): number {
  const normalized = isoDate.includes('T') ? isoDate.slice(0, 10) : isoDate;
  const target = new Date(`${normalized}T00:00:00`);
  const diffMs = target.getTime() - REFERENCE_TODAY.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}

export function calculateMalaysiaStampDuty(monthlyRent: number, durationMonths: number): number {
  const annualRent = monthlyRent * 12;
  const chargeable = Math.max(0, annualRent - 2400);
  const blocks = Math.ceil(chargeable / 250);
  const ratePerBlock = durationMonths <= 12 ? 1 : durationMonths <= 36 ? 2 : 4;
  return blocks * ratePerBlock + 10;
}

export function triggerHtmlDownload(filename: string, htmlContent: string) {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function buildInvoiceOrReceiptHtml(invoice: RentInvoice): string {
  const isPaid = invoice.status === 'Paid';
  const docTitle = isPaid ? 'OFFICIAL RENTAL RECEIPT' : 'RENTAL TAX INVOICE';
  const docRef = isPaid ? invoice.receiptNumber || invoice.invoiceNumber : invoice.invoiceNumber;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${docTitle} - ${docRef}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0F2942; margin: 40px; background: #fff; }
    .header { display: flex; justify-content: space-between; border-bottom: 2px solid #0F2942; padding-bottom: 20px; margin-bottom: 28px; }
    .brand { font-size: 22px; font-weight: 700; color: #1D4ED8; }
    .meta { text-align: right; font-size: 13px; color: #475569; }
    .title { font-size: 20px; font-weight: 700; margin-bottom: 20px; }
    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 28px; font-size: 14px; }
    .label { font-size: 11px; text-transform: uppercase; letter-spacing: 0.05em; color: #64748B; margin-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 28px; }
    th, td { text-align: left; padding: 12px; border-bottom: 1px solid #E2E8F0; font-size: 14px; }
    th { background: #F8FAFC; color: #475569; font-weight: 600; }
    .right { text-align: right; font-variant-numeric: tabular-nums; }
    .total-row td { font-weight: 700; font-size: 16px; border-top: 2px solid #0F2942; border-bottom: none; }
    .status { display: inline-block; padding: 4px 10px; border-radius: 6px; font-weight: 600; font-size: 12px; background: ${isPaid ? '#ECFDF5' : '#FEF3C7'}; color: ${isPaid ? '#047857' : '#B45309'}; }
    .footer { font-size: 12px; color: #64748B; border-top: 1px solid #E2E8F0; padding-top: 16px; }
  </style>
</head>
<body>
  <div class="header">
    <div>
      <div class="brand">Heritage Realty Sdn Bhd</div>
      <div style="font-size:13px; color:#475569; margin-top:4px;">E(1)1924 · Malaysia Tenancy Management</div>
    </div>
    <div class="meta">
      <div><strong>${docRef}</strong></div>
      <div>Issued for ${invoice.billingMonth}</div>
      <div style="margin-top:6px;"><span class="status">${isPaid ? 'PAID' : invoice.status.toUpperCase()}</span></div>
    </div>
  </div>
  <div class="title">${docTitle}</div>
  <div class="grid">
    <div>
      <div class="label">Tenant</div>
      <div><strong>${invoice.tenantName}</strong></div>
      <div>${invoice.propertyAddress}</div>
      <div>${invoice.propertyCityState}</div>
    </div>
    <div>
      <div class="label">Landlord &amp; Agreement</div>
      <div><strong>${invoice.landlordName}</strong></div>
      <div>TA #${invoice.taId} · Adjudication: ${invoice.adjudicationNo}</div>
    </div>
  </div>
  <table>
    <thead>
      <tr>
        <th>Description</th>
        <th>Billing Period</th>
        <th>Due Date</th>
        <th class="right">Amount (MYR)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Monthly Residential Rental — ${invoice.propertyAddress}</td>
        <td>${invoice.billingMonth}</td>
        <td>${formatDateMY(invoice.dueDate)}</td>
        <td class="right">${formatRM(invoice.amount)}</td>
      </tr>
      <tr class="total-row">
        <td colspan="3">Total ${isPaid ? 'Paid' : 'Amount Due'}</td>
        <td class="right">${formatRM(invoice.amount)}</td>
      </tr>
    </tbody>
  </table>
  ${
    isPaid
      ? `<p style="font-size:13px; color:#047857; margin-bottom:24px;">Payment received on ${formatDateMY(invoice.paidAt)} via ${invoice.paymentMethod || 'FPX'} (Reference: ${invoice.paymentRef || '-'}).</p>`
      : `<p style="font-size:13px; color:#475569; margin-bottom:24px;">Please remit payment via FPX Online Banking or DuitNow QR in the TenancyMY Tenant Portal on or before ${formatDateMY(invoice.dueDate)}.</p>`
  }
  <div class="footer">
    This is a computer-generated document issued via TenancyMY Portal Malaysia. No signature is required.
  </div>
</body>
</html>`;
}

export function buildTenancyAgreementHtml(ta: TenancyAgreement): string {
  const landlord = ta.landlords[0];
  const tenant = ta.tenants[0];
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Tenancy Agreement #${ta.id} - ${ta.adjudicationNo}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; color: #0F2942; margin: 40px; line-height: 1.6; }
    h1 { font-size: 22px; margin-bottom: 4px; }
    .sub { color: #475569; font-size: 13px; margin-bottom: 24px; border-bottom: 2px solid #0F2942; padding-bottom: 16px; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th, td { padding: 10px 12px; border: 1px solid #CBD5E1; text-align: left; font-size: 13px; }
    th { background: #F8FAFC; width: 32%; color: #334155; }
    h2 { font-size: 16px; margin-top: 24px; }
    .mono { font-family: monospace; font-size: 12px; }
  </style>
</head>
<body>
  <h1>${ta.type} TENANCY AGREEMENT (MALAYSIA)</h1>
  <div class="sub">Agreement ID: #${ta.id} · Adjudication No: ${ta.adjudicationNo} · Agreement Date: ${formatDateMY(ta.agreementDate)} · Status: ${ta.status}</div>
  <table>
    <tr><th>Demised Premises</th><td>${ta.property.address}, ${ta.property.state}, ${ta.property.country}</td></tr>
    <tr><th>Property Details</th><td>${ta.property.buildingType} · ${ta.property.area} sq ft · Floor ${ta.property.floor} · ${ta.property.furnishing ? 'Furnished' : 'Unfurnished'}</td></tr>
    <tr><th>Landlord</th><td>${landlord?.fullName || ta.additions.partiesSummary.landlordName} (NRIC: ${landlord?.nricNo || '-'}) · ${landlord?.mobileNumber || ''}<br/>Address: ${landlord?.address || ''}</td></tr>
    <tr><th>Tenant</th><td>${tenant?.fullName || ta.additions.partiesSummary.tenantName} (NRIC: ${tenant?.nricNo || '-'}) · ${tenant?.mobileNumber || ''}<br/>Address: ${tenant?.address || ''}</td></tr>
    <tr><th>Tenancy Term</th><td>${ta.property.duration} Months (${formatDateMY(ta.commencementDate)} to ${formatDateMY(ta.expirationDate)})</td></tr>
    <tr><th>Monthly Rental</th><td>${formatRM(ta.property.monthlyRent, ta.property.currency)} ${ta.property.isSteppedRent ? '(Stepped Rent)' : '(Fixed)'}</td></tr>
    <tr><th>Security Deposit</th><td>${formatRM(ta.securityDeposit, ta.property.currency)}</td></tr>
    <tr><th>Utility Deposit</th><td>${formatRM(ta.utilityDeposit, ta.property.currency)}</td></tr>
    <tr><th>Duplicate Stamp Certs</th><td>${ta.additions.copiesOfDuplicateStampCertCount} copy</td></tr>
    <tr><th>Prepared By (Creator)</th><td>${ta.creator.fullName} (${ta.creator.phoneNumber})</td></tr>
    <tr><th>Document Hash</th><td class="mono">${ta.hash}</td></tr>
  </table>
  <h2>Digital Signatories</h2>
  <table>
    <thead>
      <tr><th>Role</th><th>Name</th><th>NRIC</th><th>Status</th><th>Signed Date</th></tr>
    </thead>
    <tbody>
      ${ta.signers
        .map(
          (s) =>
            `<tr><td>${s.userRole}</td><td>${s.name}</td><td class="mono">${s.nricNo}</td><td>${s.status}</td><td>${formatDateMY(s.signedAt)}</td></tr>`
        )
        .join('')}
    </tbody>
  </table>
</body>
</html>`;
}
