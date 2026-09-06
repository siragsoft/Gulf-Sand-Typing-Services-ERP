# GULFSAND TYPING SERVICES ERP & BUSINESS OPERATING SYSTEM
## Master Architecture Specification & Implementation Plan

**Organization**: Gulfsand Typing Services (جلف ساند للطباعة والخدمات)  
**Location**: Al Ain, Abu Dhabi, United Arab Emirates  
**Timezone**: Asia/Dubai (UTC+4)  
**Operating Currency**: United Arab Emirates Dirham (AED, د.إ)  
**VAT Status**: Not currently VAT-registered (Architecture VAT-Ready for immediate activation)  
**Primary Language**: Arabic (العربية - RTL First), with dual English support  
**Branch Configuration**: Single-branch initially (Main Branch - Al Ain `BR-001`), expandable to multi-branch.  

---

## 1. System Overview & Core Architectural Principles

The Gulfsand Typing Services ERP is designed as a high-reliability, Google Workspace-native Enterprise Resource Planning & Business Operating System. It coordinates front-desk typing operations, government transactions (Tasheel, Tawjeeh, Amer, ICP, DED, Judicial, Sudan Embassy), tourism/travel bookings, double-entry financial accounting, HR/payroll, document archiving, and management dashboards.

```
+-----------------------------------------------------------------------------------+
|                           PRESENTATION LAYER (UI / UX)                            |
|  - React 19 + TypeScript + Tailwind CSS (RTL Arabic First, Responsive Desktop/Mobile) |
|  - Top Navigation, Sidebar, Quick Action Modals, Role-based Dynamic Views        |
+-----------------------------------------------------------------------------------+
                                        |
+-----------------------------------------------------------------------------------+
|                       AUTHENTICATION & AUTHORIZATION LAYER                        |
|  - Google Account OAuth Verification (Firebase Auth / GIS Token Client)           |
|  - RBAC: SYSTEM_ADMIN, MANAGER, SUPERVISOR, ACCOUNTS, HR, OPERATIONS, VIEWER       |
|  - Row-level & Department-level Data Visibility Filtering                         |
+-----------------------------------------------------------------------------------+
                                        |
+-----------------------------------------------------------------------------------+
|                               BUSINESS LOGIC LAYER                                |
|  - Multi-service Transactions & Pricing Range Validator (Min/Max enforcement)     |
|  - Invoicing, Collection Allocation & Proportional Distribution Engine           |
|  - Double-Entry General Ledger with Automated Balanced Postings (Debit = Credit)  |
|  - HR & UAE Labor Law Payroll Engine (26-day base, Split shifts, Overtime, Leave) |
|  - Tourism & Booking Engine (Flights, Hotels, Tours, Insurance, Saudi/Umrah)     |
|  - Expiry Alert Engine (Emirates ID, Passports, Visas, Trade Licenses: 60/30/7/0d)|
+-----------------------------------------------------------------------------------+
                                        |
+-----------------------------------------------------------------------------------+
|                              DATA PERSISTENCE LAYER                               |
|  - Structured Google Sheets Database (36 Interlinked Tables, Stable Key Formats)  |
|  - Google Apps Script (GAS) Automation & API Endpoints                            |
|  - Local/Browser Resilient Client Cache & Offline-Ready Transaction Buffering     |
|  - Google Drive Hierarchical Document Storage Engine                              |
+-----------------------------------------------------------------------------------+
                                        |
+-----------------------------------------------------------------------------------+
|                           SECURITY, AUDIT & AI LAYER                              |
|  - Immutable Audit Log for all mutations (Old Value, New Value, User, Timestamp)   |
|  - Monthly Closing & Period Lockout with Manager Reopening Reversals              |
|  - Server-side Google Gemini 3.7 Flash AI Assistant (Privacy-masked Financial/Doc) |
+-----------------------------------------------------------------------------------+
```

---

## 2. Master Implementation Roadmap (13 Phases)

| Phase | Title | Scope & Deliverables | Acceptance Criteria |
| :--- | :--- | :--- | :--- |
| **Phase 1** | **Architecture & Database Schema** | 36 Google Sheets table schemas, TypeScript definitions, DB engine, Demo & Empty seed generators, GAS scripts, verification test suite. | 100% schema integrity, valid primary key generators, passing relational tests. |
| **Phase 2** | **Google Auth & RBAC Permissions** | Google OAuth integration, 7 user roles, department filters, permission matrix, field-level masking (hiding cost/profit from Operations). | Secure authentication, role-based view enforcement, cost masking verified. |
| **Phase 3** | **Customers, CRM & Multi-Service Transactions** | Individual/Corporate CRM, duplicate detection (EID, Passport, Phone), CRM pipeline, 13 service categories, transaction lines with min/max price validation. | Duplicate detection catches duplicates, multi-service lines calculate correctly, prices enforced. |
| **Phase 4** | **Invoicing, Payments, Expenses & Double-Entry Accounting** | Invoices, payment allocation, expenses, Chart of Accounts, automated balanced journal entries (Debits = Credits), bank reconciliations. | `Total Debits == Total Credits` on every transaction, refund & expense workflows verified. |
| **Phase 5** | **Google Drive Uploads & Document Expiry Engine** | Google Drive folder hierarchy, multi-format upload modal, automated expiry tracker (60/30/7/0 days), email notifications. | Files linked to customers/employees, expiry alerts correctly calculated and logged. |
| **Phase 6** | **HR, Attendance, Leave, Payroll & Commissions** | Employee profiles, split work schedules (8-14, 18-22), 26-day standard month, attendance check-in, leave balances, UAE payroll calculator, commission engine. | Net salary formula exact: `Basic + Allow + Comm + OT - Ded - Loans`, approvals lock payroll. |
| **Phase 7** | **Booking & Tourism Module** | Flight tickets, hotels, tours, travel packages, Saudi/Umrah/Oman travel, passenger manifest, supplier cost tracking, booking statuses. | Booking profitability calculated, provider-agnostic structure ready for future APIs. |
| **Phase 8** | **Role-Specific Dashboards & Reporting** | Management, Accounts, HR, Operations, Bookings, and Customer dashboards; AED 10,000 daily target tracker; date/department filters. | Real-time analytics, responsive KPI cards, drill-down tables. |
| **Phase 9** | **Gemini AI Business Assistant** | Server-side Gemini 3.7 Flash integration, natural language queries, financial summarizer, email drafter, PII privacy masking. | Secure server-side execution, no direct financial mutation without approval. |
| **Phase 10** | **Training & SOP User Guide** | Interactive SOPs, step-by-step guides, permission glossary, interactive quizzes, progress tracker, completion certificates. | Searchable knowledge base, interactive quiz engine with score calculation. |
| **Phase 11** | **Audit Trail, Monthly Closing & Backups** | Comprehensive audit logger, monthly period locking, correction reversal entries, automated daily/monthly backup engine. | Closed months prevent direct edits, audit trail logs old/new values. |
| **Phase 12** | **Demo vs Empty Environments** | One-click environment switcher, full Al Ain sample dataset (clients, transactions, payroll, journals) vs clean empty setup. | Flawless data seeding, zero demo records in empty mode, complete CoA in both. |
| **Phase 13** | **Testing Suite, Deployment & Documentation** | Automated end-to-end testing suite, Google Apps Script deployment instructions, Drive folder setup guide, Admin & User manuals. | All 28+ test categories pass green, comprehensive documentation complete. |

---

## 3. Database Schema Overview (36 Tables)

1. `المستخدمون_والصلاحيات` (`users_permissions`) - Google account emails, roles, departments, permissions.
2. `الإعدادات` (`system_settings`) - System config, branch, currency (AED), target, VAT readiness.
3. `الفروع` (`branches`) - Branch information and metadata.
4. `العملاء` (`customers`) - CRM database (Individual, Corporate, Government, Partner).
5. `الخدمات_والأسعار` (`services_pricing`) - 13 categories, min/max prices, default costs, commission rules.
6. `المزودون` (`suppliers_vendors`) - Third-party service vendors, airlines, visa suppliers.
7. `المعاملات` (`transactions`) - Master customer transaction headers.
8. `تفاصيل_المعاملات` (`transaction_details`) - Multi-service transaction line items with actual costs and profits.
9. `الحجوزات` (`bookings`) - Travel, flight, hotel, package, and Umrah bookings.
10. `الفواتير` (`invoices`) - Invoices linked to transactions and customers.
11. `تفاصيل_الفواتير` (`invoice_details`) - Line items per invoice.
12. `التحصيلات` (`collections_receipts`) - Customer payments and receipts.
13. `توزيع_الدفعات` (`payment_allocations`) - Proportional or manual distribution of receipts across services.
14. `المصروفات` (`expenses`) - Operating, administrative, and direct expenses with approval trail.
15. `المدفوعات` (`disbursements`) - Payments to suppliers and vendors.
16. `دليل_الحسابات` (`chart_of_accounts`) - UAE service office standard chart of accounts (Assets, Liab, Equity, Rev, Exp).
17. `القيود_المحاسبية` (`journal_entries`) - Double-entry journal vouchers (Draft, Approved, Posted).
18. `تفاصيل_القيود` (`journal_entry_lines`) - Individual debit and credit legs.
19. `الحسابات_النقدية_والبنكية` (`cash_bank_accounts`) - Main cash drawer, petty cash, ADCB, FAB, Stripe/Card terminals.
20. `التسويات_البنكية` (`bank_reconciliations`) - Bank statement import, matching engine, difference tracker.
21. `الموظفون` (`employees`) - Employee records, roles, salaries, allowances, join dates, files.
22. `الحضور_والانصراف` (`attendance_logs`) - Check-in/check-out logs, split shifts, late minutes.
23. `الإجازات` (`leaves`) - Annual, sick, emergency, unpaid leaves and balance tracking.
24. `الرواتب` (`payroll`) - Monthly payroll calculation slips (26-day basis, net payable).
25. `العمولات` (`commissions`) - Commission ledger per employee and transaction.
26. `أداء_الموظفين` (`employee_performance`) - Monthly targets vs achievements and KPIs.
27. `المستندات` (`documents`) - Google Drive file registry with expiry dates and link IDs.
28. `المهام` (`tasks`) - Operational workflow task assignments.
29. `الموافقات` (`approvals`) - Multi-level approval requests (Discounts, Expenses, Leaves, Refunds, Journals).
30. `العطلات_والمناسبات` (`holidays_events`) - UAE official public holidays and calendar days.
31. `العملاء_المحتملون` (`crm_leads`) - Inquiries, lead sources, potential values.
32. `المتابعات` (`crm_followups`) - Lead interaction logs and next scheduled dates.
33. `سجل_الإشعارات` (`notification_logs`) - Expiry notices and email dispatch logs.
34. `سجل_التعديلات` (`audit_logs`) - System-wide audit trail with old and new values.
35. `الأرشيف` (`archive_records`) - Monthly closed and archived operational records.
36. `النسخ_الاحتياطية` (`system_backups`) - Database snapshot registry and metadata.
37. `دليل_الاستخدام_والتدريب` (`training_modules`) - Interactive training guides, FAQs, and quizzes.

---

## 4. Phase 1 Implementation Plan

### Planned Files:
1. `src/types/schema.ts` - Exhaustive TypeScript interfaces and enums for all 36 tables.
2. `src/types/erp.ts` - ERP application state, filtering, navigation, and role definitions.
3. `src/db/schemaDefinition.ts` - Master table definitions with column metadata, Arabic labels, data types, constraints.
4. `src/db/database.ts` - Storage Engine with ID generation, CRUD methods, audit tracking, and transactional guarantees.
5. `src/db/seedDemoData.ts` - Realistic demo dataset tailored for Gulfsand Typing Services in Al Ain.
6. `src/db/seedEmptyData.ts` - Clean dataset with Chart of Accounts, Service Catalog, Holidays, Settings, zero operational records.
7. `src/tests/schemaValidation.ts` - Phase 1 Test Suite validating schema integrity, debit=credit balance, ID generation, foreign keys.
8. `gas/Code.gs` & `gas/Schema.gs` - Production-ready Google Apps Script backend engine to initialize Google Sheets.
9. `src/components/Phase1Explorer.tsx` - Interactive visual workspace to inspect all tables, test constraints, run tests, and manage database state.
10. `src/App.tsx` - Main ERP container integrating the Phase 1 Explorer and foundation for future phases.

### Key Dependencies:
- React 19, TypeScript, Tailwind CSS, Lucide React icons, Motion animations.

### Risks & Mitigations:
- *Risk*: Data inconsistency in multi-service transactions.  
  *Mitigation*: Enforce transactional parent-child atomicity and automated recalculation of header totals from line items.
- *Risk*: Imbalanced accounting journals.  
  *Mitigation*: Hard constraint: Journal entries cannot be posted unless `sum(Debits) === sum(Credits)`.
- *Risk*: Price tampering.  
  *Mitigation*: Transaction lines validate `$min \le price \le max$`. Modifications outside bounds require approval.
