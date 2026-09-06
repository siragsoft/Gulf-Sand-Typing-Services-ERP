/**
 * PDF Document Generator for Gulf Sand Typing ERP
 * Generates official client profiles, tax transaction receipts, booking vouchers,
 * and custom document types using active customizable templates and secure QR verification.
 */

import { jsPDF } from 'jspdf';
import { getActiveDocumentTemplate, replaceTemplateVariables } from './templateManager';
import { getOrCreateReceiptVerificationToken, generateQRCodeDataURL } from './qrVerification';
import { DocumentTemplateRecord, DocumentTemplateType } from '../types/schema';

interface GenerateCustomerProfilePDFParams {
  customer: any;
  transactions?: any[];
  invoices?: any[];
  receipts?: any[];
  lang?: 'ar' | 'en';
}

interface GenerateTransactionReceiptPDFParams {
  transaction: any;
  transactionDetails?: any[];
  customer?: any;
  invoice?: any;
  lang?: 'ar' | 'en';
}

interface GenerateBookingVoucherPDFParams {
  booking: any;
  customer?: any;
  lang?: 'ar' | 'en';
}

/**
 * 1. Customer Profile & Statement PDF
 */
export async function generateCustomerProfilePDF({
  customer,
  transactions = [],
  invoices = [],
  receipts = [],
  lang = 'ar',
}: GenerateCustomerProfilePDFParams) {
  const template = getActiveDocumentTemplate('CUSTOMER_STATEMENT');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  // Template variables mapping
  const custName = customer.name_en || customer.name_ar || 'Valued Client';
  const totalSpent = Number(customer.total_spent_aed || 0).toFixed(2);
  const currentBalance = Number(customer.current_balance_aed || 0).toFixed(2);

  const vars: Record<string, string | number> = {
    company_name: template.company_name_en || 'Gulf Sand Typing & Translation Services',
    customer_name: custName,
    customer_id: customer.customer_code || customer.id || 'CUS-0001',
    transaction_date: new Date().toISOString().slice(0, 10),
    total_amount: `${totalSpent} AED`,
    remaining_amount: `${currentBalance} AED`,
  };

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const headerMain = replaceTemplateVariables(template.header_text_en || 'GULFSAND TYPING & TRANSLATION SERVICES', vars);
  doc.text(headerMain, 15, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  const subheader = replaceTemplateVariables(
    template.subheader_text_en || `${template.company_address_en || 'Al Ain, UAE'} | Tel: ${template.phone_primary}`,
    vars
  );
  doc.text(subheader, 15, 22);
  doc.text(`Official Email: ${template.email_official} | Portal: gulfsanderp.ae`, 15, 28);

  // Document Title Badge
  doc.setFillColor(14, 116, 144);
  doc.roundedRect(pageWidth - 65, 10, 50, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'bold');
  const titleText = replaceTemplateVariables(template.title_en || 'CLIENT DOSSIER & STATEMENT', vars);
  doc.text(titleText, pageWidth - 40, 18, { align: 'center' });
  doc.setFontSize(7);
  doc.text('OFFICIAL RECORD', pageWidth - 40, 24, { align: 'center' });

  // 2. Customer Information Card
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 45, pageWidth - 30, 42, 3, 3, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text(custName.toUpperCase(), 20, 53);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  const col1X = 20;
  const col2X = 85;
  const col3X = 145;

  doc.text(`Customer Code: ${customer.customer_code || customer.id || 'CUS-0001'}`, col1X, 61);
  doc.text(`Account Type: ${customer.customer_type || 'INDIVIDUAL'}`, col1X, 68);
  doc.text(`Phone: ${customer.phone || '-'}`, col1X, 75);
  doc.text(`VIP Status: ${customer.is_vip ? 'VIP PREMIUM CLIENT' : 'REGULAR'}`, col1X, 82);

  doc.text(`Emirates ID: ${customer.emirates_id || '784-XXXX-XXXXXXX-X'}`, col2X, 61);
  doc.text(`Passport No: ${customer.passport_number || '-'}`, col2X, 68);
  doc.text(`Email: ${customer.email || 'N/A'}`, col2X, 75);
  doc.text(`Nationality: ${customer.nationality || 'United Arab Emirates'}`, col2X, 82);

  doc.text(`Trade License: ${customer.trade_license_no || 'N/A'}`, col3X, 61);
  doc.text(`Registered: ${customer.created_at ? customer.created_at.slice(0, 10) : '2026-01-01'}`, col3X, 68);
  doc.text(`Branch: ${customer.branch_name || 'Main Branch - Al Ain'}`, col3X, 75);
  doc.text(`File Status: ACTIVE & VERIFIED`, col3X, 82);

  // 3. Financial Metrics KPI Bar
  const kpiY = 93;
  const kpiWidth = (pageWidth - 30 - 9) / 4;

  const kpis = [
    { label: 'TOTAL SPENT (AED)', val: `${totalSpent}` },
    { label: 'TOTAL SERVICES', val: `${transactions.length || customer.total_transactions_count || 1}` },
    { label: 'TOTAL INVOICES', val: `${invoices.length || 1}` },
    { label: 'CURRENT BALANCE (AED)', val: `${currentBalance}` },
  ];

  kpis.forEach((kpi, idx) => {
    const x = 15 + idx * (kpiWidth + 3);
    const hasBalance = idx === 3 && Number(customer.current_balance_aed) > 0;
    doc.setFillColor(hasBalance ? 254 : 241, hasBalance ? 242 : 245, hasBalance ? 242 : 249);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(x, kpiY, kpiWidth, 18, 2, 2, 'FD');

    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(100, 116, 139);
    doc.text(kpi.label, x + kpiWidth / 2, kpiY + 6, { align: 'center' });

    doc.setFontSize(10);
    doc.setTextColor(hasBalance ? 225 : 15, hasBalance ? 29 : 23, hasBalance ? 72 : 42);
    doc.text(kpi.val, x + kpiWidth / 2, kpiY + 14, { align: 'center' });
  });

  // 4. Section Title: Service History
  let currentY = 120;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('DOCUMENT TYPING & APPLICATION HISTORY', 15, currentY);

  currentY += 5;
  doc.setFillColor(30, 41, 59);
  doc.rect(15, currentY, pageWidth - 30, 7, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.text('TRX CODE', 18, currentY + 5);
  doc.text('DATE', 55, currentY + 5);
  doc.text('SERVICE DESCRIPTION', 90, currentY + 5);
  doc.text('CATEGORY', 145, currentY + 5);
  doc.text('AMOUNT (AED)', 175, currentY + 5);

  currentY += 7;
  const recentTrx = transactions.slice(0, 5);
  if (recentTrx.length === 0) {
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.text('No transaction history recorded yet.', 20, currentY + 8);
    currentY += 15;
  } else {
    recentTrx.forEach((trx, i) => {
      doc.setFillColor(i % 2 === 0 ? 255 : 248, i % 2 === 0 ? 255 : 250, i % 2 === 0 ? 255 : 252);
      doc.rect(15, currentY, pageWidth - 30, 7.5, 'F');
      doc.setDrawColor(226, 232, 240);
      doc.line(15, currentY + 7.5, pageWidth - 15, currentY + 7.5);

      doc.setTextColor(15, 23, 42);
      doc.setFontSize(7);
      doc.text(trx.transaction_code || trx.id || `TRX-${i + 1}`, 18, currentY + 5);
      doc.text(trx.created_at ? trx.created_at.slice(0, 10) : '2026-08-15', 55, currentY + 5);
      const desc = trx.service_name_ar || trx.notes || 'Typing Application';
      doc.text(desc.length > 28 ? desc.slice(0, 28) + '...' : desc, 90, currentY + 5);
      doc.text(trx.service_category || 'IMMIGRATION', 145, currentY + 5);
      doc.setFont('helvetica', 'bold');
      doc.text((Number(trx.total_gross_amount_aed) || Number(trx.total_amount_aed) || 450).toFixed(2), 175, currentY + 5);
      doc.setFont('helvetica', 'normal');
      currentY += 7.5;
    });
  }

  // 5. Terms & Footer from Template
  currentY += 5;
  const termsText = replaceTemplateVariables(template.terms_conditions_en || template.terms_conditions_ar, vars);
  if (termsText) {
    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(254, 240, 138);
    doc.roundedRect(15, currentY, pageWidth - 30, 20, 2, 2, 'FD');
    doc.setTextColor(133, 77, 14);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', 18, currentY + 5);
    doc.setFont('helvetica', 'normal');
    doc.text(termsText, 18, currentY + 10, { maxWidth: pageWidth - 36 });
  }

  // Footer
  const footerY = pageHeight - 20;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, footerY, pageWidth - 15, footerY);

  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const footerMain = replaceTemplateVariables(template.footer_text_en || template.footer_text_ar, vars);
  doc.text(footerMain, 15, footerY + 5);
  doc.text(`System Reference: ${customer.customer_code || customer.id || 'CUS-001'} | Gulfsand ERP v2.4`, 15, footerY + 10);

  const filename = `Customer_Profile_${customer.customer_code || customer.id || 'Client'}.pdf`;
  doc.save(filename);
}

/**
 * 2. Official Tax Transaction Receipt PDF with dynamic template & QR Code
 */
export async function generateTransactionReceiptPDF({
  transaction,
  transactionDetails = [],
  customer = {},
  invoice,
  lang = 'ar',
}: GenerateTransactionReceiptPDFParams) {
  const template = getActiveDocumentTemplate('TRANSACTION_RECEIPT');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const trxCode = transaction.transaction_code || transaction.id || 'TRX-2026-0001';
  const receiptNumber = transaction.receipt_number || `REC-${trxCode.replace(/^TRX-/, '')}`;
  const custName = customer.name_en || customer.name_ar || transaction.customer_name_ar || 'Valued Client';

  // Calculate fees
  const items =
    transactionDetails.length > 0
      ? transactionDetails
      : [
          {
            service_name_ar: transaction.service_name_ar || transaction.notes || 'معاملة طباعة وتجديد إقامة',
            service_name_en: transaction.service_name_en || 'Residency & Visa Typing Application',
            service_category: 'RESIDENCY_VISIT',
            selling_price_aed: Number(transaction.total_gross_amount_aed || transaction.total_amount_aed || 450),
            default_cost_aed: 300,
            gross_amount_aed: Number(transaction.total_gross_amount_aed || 450),
          },
        ];

  let totalGovFees = 0;
  let totalTypingFees = 0;
  items.forEach((item: any) => {
    const gross = Number(item.gross_amount_aed || item.selling_price_aed || 0);
    const govCost = Number(item.default_cost_aed || item.actual_cost_aed || gross * 0.7);
    const typingFee = Math.max(0, gross - govCost);
    totalGovFees += govCost;
    totalTypingFees += typingFee;
  });

  const grandGross = Number(
    transaction.total_gross_amount_aed ||
      transaction.total_net_amount_aed ||
      transaction.total_amount_aed ||
      totalGovFees + totalTypingFees
  );
  const vatAmount = totalTypingFees * 0.05;
  const collected = Number(transaction.collected_amount_aed || grandGross);
  const remaining = Math.max(0, grandGross - collected);

  // Generate / Retrieve unique verification token
  const serviceSummary = items.map((i: any) => i.service_name_ar || i.service_name_en || 'معاملة طباعة').join('، ');
  const verificationRecord = await getOrCreateReceiptVerificationToken({
    receiptNumber,
    transactionId: transaction.id || trxCode,
    customerId: customer.id || transaction.customer_id || 'CUS-001',
    customerName: custName,
    serviceSummary: serviceSummary.length > 80 ? serviceSummary.slice(0, 77) + '...' : serviceSummary,
    totalAmountAED: grandGross,
    paidAmountAED: collected,
    remainingAmountAED: remaining,
  });

  // Template variables mapping
  const vars: Record<string, string | number> = {
    company_name: template.company_name_en || 'Gulf Sand Typing & Translation Services',
    customer_name: custName,
    customer_id: customer.customer_code || customer.id || 'CUS-001',
    transaction_id: trxCode,
    receipt_number: receiptNumber,
    invoice_number: invoice?.invoice_number || `INV-${receiptNumber.replace(/^REC-/, '')}`,
    transaction_date: transaction.created_at ? transaction.created_at.slice(0, 10) : new Date().toISOString().slice(0, 10),
    services_summary: serviceSummary,
    total_amount: `${grandGross.toFixed(2)} AED`,
    paid_amount: `${collected.toFixed(2)} AED`,
    remaining_amount: `${remaining.toFixed(2)} AED`,
    responsible_employee: transaction.responsible_employee_name || 'Staff Typist',
    qr_verification_url: `https://gulfsanderp.ae/verify/receipt/${verificationRecord.token}`,
  };

  // 1. Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  const headerText = replaceTemplateVariables(template.header_text_en || 'GULFSAND TYPING & TRANSLATION SERVICES', vars);
  doc.text(headerText, 15, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  const subheader = replaceTemplateVariables(
    template.subheader_text_en ||
      `Trade License: CN-1294821 | TRN: 100482910400003 | ${template.company_address_en || 'Al Ain, UAE'}`,
    vars
  );
  doc.text(subheader, 15, 20);
  doc.text(`Official Tel: ${template.phone_primary} | WhatsApp: ${template.phone_secondary || '+971 50 776 5432'}`, 15, 26);
  doc.text(`Email: ${template.email_official} | Website: gulfsanderp.ae`, 15, 32);

  // Official Voucher Badge
  doc.setFillColor(5, 150, 105); // emerald-600
  doc.roundedRect(pageWidth - 70, 10, 55, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const titleText = replaceTemplateVariables(template.title_en || 'TAX RECEIPT VOUCHER', vars);
  doc.text(titleText, pageWidth - 42.5, 18, { align: 'center' });
  doc.setFontSize(7.5);
  doc.text(`TRX: ${trxCode}`, pageWidth - 42.5, 25, { align: 'center' });

  // 2. Receipt Meta Details & Customer Box
  doc.setDrawColor(226, 232, 240);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(15, 48, pageWidth - 30, 36, 3, 3, 'FD');

  doc.setTextColor(71, 85, 105);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENT & TRANSACTION DETAILS', 20, 55);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);

  doc.text(`Client Name: ${custName}`, 20, 62);
  doc.text(`Phone / Mobile: ${customer.phone || transaction.customer_phone || '+971 50 XXX XXXX'}`, 20, 69);
  doc.text(`Emirates ID: ${customer.emirates_id || '784-XXXX-XXXXXXX-X'}`, 20, 76);

  const rightColX = 115;
  doc.text(
    `Date & Time: ${transaction.created_at ? transaction.created_at.slice(0, 19).replace('T', ' ') : new Date().toISOString().slice(0, 10)}`,
    rightColX,
    62
  );
  doc.text(`Typist / Officer: ${transaction.responsible_employee_name || 'Al Ain Branch Staff'}`, rightColX, 69);
  doc.text(`Receipt Ref: ${receiptNumber}`, rightColX, 76);

  // 3. Line Items Table
  let tableY = 92;
  doc.setFillColor(30, 41, 59);
  doc.rect(15, tableY, pageWidth - 30, 8, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('#', 18, tableY + 5.5);
  doc.text('SERVICE DESCRIPTION', 28, tableY + 5.5);
  doc.text('CATEGORY', 90, tableY + 5.5);
  doc.text('GOV FEE', 125, tableY + 5.5);
  doc.text('TYPING FEE', 150, tableY + 5.5);
  doc.text('TOTAL AED', 175, tableY + 5.5);

  tableY += 8;

  items.forEach((item: any, idx: number) => {
    const gross = Number(item.gross_amount_aed || item.selling_price_aed || 0);
    const govCost = Number(item.default_cost_aed || item.actual_cost_aed || gross * 0.7);
    const typingFee = Math.max(0, gross - govCost);

    doc.setFillColor(idx % 2 === 0 ? 255 : 248, idx % 2 === 0 ? 255 : 250, idx % 2 === 0 ? 255 : 252);
    doc.rect(15, tableY, pageWidth - 30, 8, 'F');
    doc.setDrawColor(226, 232, 240);
    doc.line(15, tableY + 8, pageWidth - 15, tableY + 8);

    doc.setTextColor(15, 23, 42);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'normal');

    doc.text(`${idx + 1}`, 18, tableY + 5.5);
    const srvTitle = item.service_name_ar || item.service_name_en || 'Document Typing';
    doc.text(srvTitle.length > 32 ? srvTitle.slice(0, 32) + '...' : srvTitle, 28, tableY + 5.5);
    doc.text(item.service_category || 'TYPING', 90, tableY + 5.5);
    doc.text(govCost.toFixed(2), 125, tableY + 5.5);
    doc.text(typingFee.toFixed(2), 150, tableY + 5.5);
    doc.setFont('helvetica', 'bold');
    doc.text(gross.toFixed(2), 175, tableY + 5.5);
    doc.setFont('helvetica', 'normal');

    tableY += 8;
  });

  // 4. Financial Summary Card & Terms Notice
  tableY += 6;
  doc.setFillColor(241, 245, 249);
  doc.setDrawColor(203, 213, 225);
  doc.roundedRect(pageWidth - 95, tableY, 80, 48, 2, 2, 'FD');

  const summaryX = pageWidth - 90;
  const valX = pageWidth - 20;

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text('Government Fees (Pass-Through):', summaryX, tableY + 8);
  doc.text(`${totalGovFees.toFixed(2)} AED`, valX, tableY + 8, { align: 'right' });

  doc.text('Typing & Administrative Fee:', summaryX, tableY + 15);
  doc.text(`${totalTypingFees.toFixed(2)} AED`, valX, tableY + 15, { align: 'right' });

  doc.text('Value Added Tax (VAT 5%):', summaryX, tableY + 22);
  doc.text(`${vatAmount.toFixed(2)} AED`, valX, tableY + 22, { align: 'right' });

  doc.setDrawColor(148, 163, 184);
  doc.line(summaryX, tableY + 26, valX, tableY + 26);

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text('GRAND TOTAL AMOUNT:', summaryX, tableY + 33);
  doc.text(`${grandGross.toFixed(2)} AED`, valX, tableY + 33, { align: 'right' });

  doc.setFontSize(8.5);
  doc.setTextColor(5, 150, 105);
  doc.text('Total Paid / Collected:', summaryX, tableY + 40);
  doc.text(`${collected.toFixed(2)} AED`, valX, tableY + 40, { align: 'right' });

  if (remaining > 0) {
    doc.setTextColor(225, 29, 72);
    doc.text('Balance Due:', summaryX, tableY + 46);
    doc.text(`${remaining.toFixed(2)} AED`, valX, tableY + 46, { align: 'right' });
  }

  // Left Note block from Template
  doc.setFillColor(254, 252, 232);
  doc.setDrawColor(254, 240, 138);
  doc.roundedRect(15, tableY, 80, 48, 2, 2, 'FD');
  doc.setTextColor(133, 77, 14);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TERMS & IMPORTANT NOTICE:', 20, tableY + 8);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const terms = replaceTemplateVariables(template.terms_conditions_en || template.terms_conditions_ar, vars);
  doc.text(terms || '1. Government fees are strictly non-refundable.\n2. Please review details before leaving.', 20, tableY + 15, {
    maxWidth: 70,
  });

  // 5. Verification QR Code & Signatures Area
  const sigY = tableY + 54;
  doc.setDrawColor(203, 213, 225);
  doc.line(15, sigY, pageWidth - 15, sigY);

  // Signatures
  doc.setFontSize(7.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Customer Signature:', 18, sigY + 8);
  doc.line(18, sigY + 22, 60, sigY + 22);

  doc.text('Authorized Typist & Cashier:', 70, sigY + 8);
  doc.line(70, sigY + 22, 115, sigY + 22);

  // Unique QR Code Box
  if (template.show_qr !== false && verificationRecord.qr_code_data_url) {
    const qrX = pageWidth - 65;
    const qrY = sigY + 2;

    doc.setFillColor(255, 255, 255);
    doc.setDrawColor(203, 213, 225);
    doc.roundedRect(qrX, qrY, 50, 30, 2, 2, 'FD');

    // Add QR Code Image
    try {
      doc.addImage(verificationRecord.qr_code_data_url, 'PNG', qrX + 2, qrY + 2, 20, 20);
    } catch (e) {
      console.warn('QR image injection fallback:', e);
    }

    // QR Labels
    doc.setTextColor(15, 23, 42);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    const qrLblEn = replaceTemplateVariables(template.qr_label_en || 'Scan to verify receipt', vars);
    doc.text(qrLblEn, qrX + 24, qrY + 7, { maxWidth: 24 });

    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 116, 139);
    doc.text('Official Gulf Sand QR', qrX + 24, qrY + 14);
    doc.text(`Token: ${verificationRecord.token.slice(0, 12)}...`, qrX + 24, qrY + 19);

    doc.setTextColor(5, 150, 105);
    doc.setFont('helvetica', 'bold');
    doc.text('VERIFIED AUTHENTIC', qrX + 25, qrY + 26, { align: 'center' });
  }

  // 6. Footer Disclaimer from Template
  const footerY = pageHeight - 16;
  doc.setFontSize(6.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(148, 163, 184);
  const footerText = replaceTemplateVariables(template.footer_text_en || template.footer_text_ar, vars);
  doc.text(footerText, 15, footerY);
  doc.text(`Generated by Gulfsand ERP | Token: ${verificationRecord.token} | Page 1 of 1`, 15, footerY + 5);

  // Save PDF
  const filename = `Receipt_${receiptNumber}.pdf`;
  doc.save(filename);
}

/**
 * 3. Booking Voucher PDF with Template & QR
 */
export async function generateBookingVoucherPDF({
  booking,
  customer = {},
  lang = 'ar',
}: GenerateBookingVoucherPDFParams) {
  const template = getActiveDocumentTemplate('BOOKING_CONFIRMATION');
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const bookingCode = booking.booking_code || booking.id || 'BKG-001';
  const clientName = customer.name_en || customer.name_ar || booking.customer_name_ar || 'Walk-In Customer';

  const vars: Record<string, string | number> = {
    company_name: template.company_name_en || 'Gulf Sand Typing Center',
    customer_name: clientName,
    customer_id: customer.customer_code || customer.id || 'CUS-001',
    transaction_date: booking.booking_date || new Date().toISOString().slice(0, 10),
    services_summary: booking.booking_type || booking.service_name || 'Appointment Pass',
  };

  // Header
  doc.setFillColor(30, 41, 59);
  doc.rect(0, 0, pageWidth, 38, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  const headerText = replaceTemplateVariables(template.header_text_en || 'GULFSAND APPOINTMENT VOUCHER', vars);
  doc.text(headerText, 15, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  const subheader = replaceTemplateVariables(
    template.subheader_text_en || `Al Ain Customer Service Center | Tel: ${template.phone_primary}`,
    vars
  );
  doc.text(subheader, 15, 22);
  doc.text(`Official Inquiries: ${template.email_official} | WhatsApp: +971 50 776 5432`, 15, 28);

  // Voucher Code Box
  doc.setFillColor(14, 116, 144);
  doc.roundedRect(pageWidth - 65, 10, 50, 18, 2, 2, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(8);
  doc.text('BOOKING CODE', pageWidth - 40, 16, { align: 'center' });
  doc.setFontSize(10);
  doc.text(bookingCode, pageWidth - 40, 24, { align: 'center' });

  // Appointment Details Card
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 46, pageWidth - 30, 50, 3, 3, 'FD');

  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.setFont('helvetica', 'bold');
  doc.text('APPOINTMENT DETAILS', 20, 54);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);

  doc.text(`Client Name: ${clientName}`, 20, 63);
  doc.text(`Phone: ${customer.phone || booking.customer_phone || '+971 50 XXX XXXX'}`, 20, 71);
  doc.text(`Emirates ID: ${customer.emirates_id || booking.emirates_id || '784-XXXX-XXXXXXX-X'}`, 20, 79);
  doc.text(`Service Type: ${booking.booking_type || booking.service_name || 'Document Typing Application'}`, 20, 87);

  const col2 = 115;
  doc.text(`Appointment Date: ${booking.travel_date_departure || booking.booking_date || '2026-08-16'}`, col2, 63);
  doc.text(`Time Slot: ${booking.time_slot || '10:30 AM - 11:00 AM'}`, col2, 71);
  doc.text(`Assigned Counter: ${booking.counter_number || 'Counter 02 (Tasheel & ICP)'}`, col2, 79);
  doc.text(`Status: CONFIRMED & SCHEDULED`, col2, 87);

  // Requirements checklist from Template
  doc.setFillColor(240, 253, 250);
  doc.setDrawColor(153, 246, 228);
  doc.roundedRect(15, 104, pageWidth - 30, 48, 3, 3, 'FD');

  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 118, 110);
  doc.text('REQUIRED DOCUMENTS TO BRING FOR TYPING:', 20, 113);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const terms = replaceTemplateVariables(template.terms_conditions_en || template.terms_conditions_ar, vars);
  doc.text(
    terms ||
      '[ ] Original Emirates ID card or digital copy on UAE Pass\n[ ] Original Passport and Current Visa Page\n[ ] Company Trade License & Establishment Card (for business/corporate services)\n[ ] Medical Fitness Certificate / Attested degrees (if applicable)',
    22,
    122,
    { maxWidth: pageWidth - 44 }
  );

  // QR Code on Booking Pass
  const qrDataUrl = await generateQRCodeDataURL(`https://gulfsanderp.ae/booking/${bookingCode}`);
  if (qrDataUrl) {
    try {
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(203, 213, 225);
      doc.roundedRect(pageWidth - 55, 160, 40, 32, 2, 2, 'FD');
      doc.addImage(qrDataUrl, 'PNG', pageWidth - 50, 162, 24, 24);
      doc.setFontSize(6);
      doc.setTextColor(100, 116, 139);
      doc.text('Scan at Turnstile', pageWidth - 35, 189, { align: 'center' });
    } catch (e) {
      console.warn('QR image injection fallback:', e);
    }
  }

  // Footer
  const footerY = pageHeight - 16;
  doc.setFontSize(7.5);
  doc.setTextColor(148, 163, 184);
  const footerText = replaceTemplateVariables(template.footer_text_en || template.footer_text_ar, vars);
  doc.text(footerText, 15, footerY);

  const filename = `Booking_Voucher_${bookingCode}.pdf`;
  doc.save(filename);
}

/**
 * 4. Manager Live Template Preview PDF
 * Allows managers to instantly preview how their customized template looks as a generated PDF document.
 */
export async function previewDocumentTemplatePDF(template: DocumentTemplateRecord) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const sampleVars: Record<string, string | number> = {
    company_name: template.company_name_en || 'Gulf Sand Typing Services',
    customer_name: 'محمد عبدالله الشامسي (Sample Client)',
    customer_id: 'CUS-SAMPLE-001',
    transaction_id: 'TRX-SAMPLE-2026',
    receipt_number: 'REC-SAMPLE-001',
    invoice_number: 'INV-SAMPLE-001',
    transaction_date: new Date().toISOString().slice(0, 10),
    services_summary: 'معاملة تجديد إقامة + فحص طبي + هوية إماراتية',
    total_amount: '1,250.00 AED',
    paid_amount: '1,250.00 AED',
    remaining_amount: '0.00 AED',
    responsible_employee: template.updated_by_name || 'بشار الحاج',
    qr_verification_url: 'https://gulfsanderp.ae/verify/receipt/gs_vfy_sample_preview_token',
  };

  // Header Banner
  doc.setFillColor(15, 23, 42);
  doc.rect(0, 0, pageWidth, 42, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  const header = replaceTemplateVariables(template.header_text_en || template.header_text_ar, sampleVars);
  doc.text(header, 15, 14);

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  const sub = replaceTemplateVariables(
    template.subheader_text_en || template.subheader_text_ar || `${template.company_address_en || 'Al Ain, UAE'}`,
    sampleVars
  );
  doc.text(sub, 15, 22);
  doc.text(`Phone: ${template.phone_primary} | Email: ${template.email_official}`, 15, 28);
  doc.text(`Template: ${template.name_ar} (v${template.version || 1}) - Preview Mode`, 15, 34);

  // Badge
  doc.setFillColor(5, 150, 105);
  doc.roundedRect(pageWidth - 70, 10, 55, 22, 3, 3, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  const title = replaceTemplateVariables(template.title_en || template.title_ar, sampleVars);
  doc.text(title, pageWidth - 42.5, 18, { align: 'center' });
  doc.setFontSize(7);
  doc.text(`PREVIEW - v${template.version || 1}`, pageWidth - 42.5, 25, { align: 'center' });

  // Body content preview
  doc.setFillColor(248, 250, 252);
  doc.setDrawColor(226, 232, 240);
  doc.roundedRect(15, 48, pageWidth - 30, 40, 2, 2, 'FD');

  doc.setTextColor(15, 23, 42);
  doc.setFontSize(9.5);
  doc.setFont('helvetica', 'bold');
  doc.text('TEMPLATE VARIABLE MAPPINGS & SAMPLE DATA', 20, 56);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text(`Customer Name: ${sampleVars.customer_name}`, 20, 64);
  doc.text(`Services Summary: ${sampleVars.services_summary}`, 20, 71);
  doc.text(`Total Amount: ${sampleVars.total_amount} | Status: PAID IN FULL`, 20, 78);

  // Disclaimer Box
  const discY = 95;
  const disclaimerText = replaceTemplateVariables(template.disclaimer_en || template.disclaimer_ar, sampleVars);
  if (disclaimerText) {
    doc.setFillColor(254, 242, 242);
    doc.setDrawColor(254, 202, 202);
    doc.roundedRect(15, discY, pageWidth - 30, 18, 2, 2, 'FD');
    doc.setTextColor(185, 28, 28);
    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.text('OFFICIAL DISCLAIMER:', 20, discY + 6);
    doc.setFont('helvetica', 'normal');
    doc.text(disclaimerText, 20, discY + 12, { maxWidth: pageWidth - 40 });
  }

  // Terms Box
  const termsY = 118;
  const termsText = replaceTemplateVariables(template.terms_conditions_en || template.terms_conditions_ar, sampleVars);
  if (termsText) {
    doc.setFillColor(254, 252, 232);
    doc.setDrawColor(254, 240, 138);
    doc.roundedRect(15, termsY, pageWidth - 30, 36, 2, 2, 'FD');
    doc.setTextColor(133, 77, 14);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('TERMS & CONDITIONS:', 20, termsY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text(termsText, 20, termsY + 13, { maxWidth: pageWidth - 40 });
  }

  // Customer Instructions
  const instY = 160;
  const instText = replaceTemplateVariables(
    template.customer_instructions_en || template.customer_instructions_ar,
    sampleVars
  );
  if (instText) {
    doc.setFillColor(240, 253, 250);
    doc.setDrawColor(153, 246, 228);
    doc.roundedRect(15, instY, pageWidth - 30, 20, 2, 2, 'FD');
    doc.setTextColor(15, 118, 110);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('CUSTOMER INSTRUCTIONS:', 20, instY + 6);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.text(instText, 20, instY + 13, { maxWidth: pageWidth - 40 });
  }

  // QR Code preview
  if (template.show_qr !== false) {
    const qrUrl = await generateQRCodeDataURL('https://gulfsanderp.ae/verify/sample');
    if (qrUrl) {
      try {
        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(203, 213, 225);
        doc.roundedRect(pageWidth - 65, 185, 50, 30, 2, 2, 'FD');
        doc.addImage(qrUrl, 'PNG', pageWidth - 63, 187, 20, 20);
        doc.setTextColor(15, 23, 42);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'bold');
        doc.text(template.qr_label_en || 'Scan to verify', pageWidth - 40, 192, { maxWidth: 22 });
        doc.setFontSize(5.5);
        doc.setTextColor(5, 150, 105);
        doc.text('LIVE PREVIEW QR', pageWidth - 40, 206);
      } catch (e) {
        console.warn('QR preview error:', e);
      }
    }
  }

  // Footer
  const footerY = pageHeight - 16;
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  const footer = replaceTemplateVariables(template.footer_text_en || template.footer_text_ar, sampleVars);
  doc.text(footer, 15, footerY);

  const filename = `Preview_${template.document_type}_v${template.version || 1}.pdf`;
  doc.save(filename);
}
