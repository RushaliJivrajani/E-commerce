# Admin Panel Production Upgrade Plan

This plan outlines the steps to upgrade the existing MERN stack eCommerce platform with the advanced production-level features requested, specifically focusing on expanding the Admin Dashboard capabilities without breaking existing UI and architecture.

## User Review Required

> [!IMPORTANT]  
> Please review the proposed changes below. Many features (like Products, Categories, basic Dashboard metrics, Banners, Coupons) are already implemented in your codebase. This plan focuses on filling the specific gaps (Returns, Refunds, Tracking, Advanced Settings, Reports, Notifications, SEO fields) and integrating them into the existing structure.

## Proposed Changes

---

### Database Models (`src/lib/db.ts`)

Update the mock database schema and interfaces to support the new features.

#### [MODIFY] `src/lib/db.ts`
- **ReturnRequest Model [NEW]**: Create interface for Return Management (Customer, Product, Reason, Images, Actions: Approve/Reject, Status: Requested, Approved, Pickup, Received, Refund Processing, Refund Done).
- **NotificationTemplate Model [NEW]**: Create interface for Notification Management (Type: Email/SMS, Event, Subject, Body).
- **Order Model**: Add `tracking` object (courierCompany, trackingId, trackingUrl). Expand `timeline` usage to reflect shipping updates.
- **StoreSettings Model**: Add `whatsappNumber`, `gstDetails`, and `maintenanceMode` fields.
- **Product Model**: Add `seoTitle`, `seoDescription`, `metaKeywords`, and `imageAlt` for SEO management.
- **Dashboard Helper**: Update the aggregation logic to include a "Return Requests" metric.

---

### Admin Pages & Components

Add the missing features to the Admin Panel UI.

#### [MODIFY] `src/app/admin/dashboard/page.tsx`
- Add a new metric card for "Return Requests".
- Ensure the Monthly Sales Graph reflects the accurate timeframe data.

#### [MODIFY] `src/app/admin/settings/page.tsx`
- Add input fields for WhatsApp Number, GST Details, and a toggle for Maintenance Mode under Website Management.

#### [MODIFY] `src/app/admin/products/page.tsx`
- Add an "SEO Management" section in the Add/Edit Product modal.
- Add an Image Cropper UI flow for product images (using an HTML5 canvas approach or standard crop UI patterns) before the image is finalized.

#### [MODIFY] `src/app/admin/orders/page.tsx` & Order Detail View
- Implement an "Update Tracking" module (Courier, Tracking ID, URL).
- Add a "Print Invoice" action that opens a printable invoice view.

#### [NEW] `src/app/admin/returns/page.tsx`
- Create a dedicated Return Management dashboard.
- List all return requests, show uploaded images, and provide "Approve Return" and "Reject Return" actions.

#### [NEW] `src/app/admin/refunds/page.tsx`
- Create a Refund Management page.
- View and process refunds associated with returned orders or cancelled orders, displaying Payment ID and Transaction status.

#### [NEW] `src/app/admin/notifications/page.tsx`
- Create a Notification Template management page for Email and SMS templates.

#### [NEW] `src/app/admin/reports/page.tsx`
- Implement an advanced Report System.
- Generate Sales, Order, Customer, and Return reports.
- Include "Export to Excel" and "Export to PDF" capabilities.

---

### Backend API Routes

Create or modify API endpoints to support the new UI.

#### [NEW] `src/app/api/returns/route.ts` & `[id]/route.ts`
- Handle Return Requests CRUD.

#### [NEW] `src/app/api/refunds/route.ts`
- Handle Refund processing and listing.

#### [NEW] `src/app/api/notifications/route.ts`
- Handle notification templates.

#### [MODIFY] `src/app/api/settings/route.ts`
- Save the newly added website settings.

#### [MODIFY] `src/app/api/orders/[id]/tracking/route.ts` (or similar)
- Endpoint specifically for updating order tracking information.

---

### Security & Architecture

#### [MODIFY] `src/lib/auth.ts` or Middleware
- Ensure JWT authentication, secure cookies, and role-based permissions (Super Admin, Admin, Staff) are strictly enforced across all `/api/` admin routes.
- Verify Admin activity logs are being recorded for critical actions (approving returns, issuing refunds, changing settings).

## Verification Plan

### Automated/Manual Verification
- I will manually navigate through the new Admin routes (Returns, Refunds, Notifications, Reports) to verify the UI renders correctly and matches the existing design system.
- I will test updating a Product to save SEO data and verify it persists.
- I will test adding tracking information to an Order and verify it updates the timeline.
- I will ensure no existing functionality (like standard product CRUD or Dashboard charts) is broken.
