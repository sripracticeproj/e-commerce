# Implementation Plan - Storefront UI/UX, Configurable Settings, Order Management, and Analytics Enhancements

This plan addresses several key UI/UX, configuration, and functional requirements for the AI-Commerce platform.

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions**
> 1. **Custom Toast Notification System**: Since there is no toast library currently installed, we will build a lightweight, beautiful, and premium custom Toast system in React with global trigger functions (`toast.success`, `toast.error`, etc.). This avoids introducing external package installation issues and guarantees a seamless look and feel aligned with our dark-mode design system.
> 2. **Native SVG Interactive Charts**: For the Business Analytics screen, rather than pulling in large third-party charting libraries, we will build highly interactive, responsive, and gorgeous native SVG charts (gradient area line charts, bar charts, and circular category donut charts). This keeps page load speeds extremely fast and allows total styling customization.
> 3. **Print-optimized CSS**: We will implement `@media print` rules so that clicking "Print" on a courier label or business report prints *only* that component, styled neatly for physical paper, hiding all navigation sidebars and dark themes.

---

## Proposed Changes

### 1. Database & Domain Models

#### [MODIFY] [types/index.ts](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\types\index.ts)
- Add `order_id_format` (string) and `last_seq_no` (number) fields to `MerchantConfig` interface.

#### [MODIFY] [mock-db.ts](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\lib\mock-db.ts)
- Implement `cancelOrder(authMerchantId, merchantId, orderId)` and `fulfillOrder(authMerchantId, merchantId, orderId)` in `MockDatabase`.
- Update `createOrder` to check if `order_id_format` is configured. Increment `last_seq_no` and generate the order ID by replacing year, month, date, and sequence number placeholders (e.g. `yyyymmdd000<seq_No>`).
- Update `updateMerchantConfig` signature and logic to accept and save `order_id_format`.

---

### 2. Toast Notification System

#### [NEW] [toast.tsx](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\components\ui\toast.tsx)
- Create a global `toast` emitter object with `success`, `error`, `info`, and `warning` helpers.
- Implement the `<ToastContainer />` component rendering premium styled notifications (glassmorphism look, color-coded border accents, clean transition animations, close triggers, and automated fade-outs).

#### [MODIFY] [layout.tsx](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\app\layout.tsx)
- Import and mount the `<ToastContainer />` globally.

#### [MODIFY] [globals.css](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\app\globals.css)
- Add slide-in animations for toast popups (`@keyframes slideIn` and `.animate-slideIn`).
- Add print-specific CSS utility overrides to hide sidebar menus and non-essential dashboard items during printing.

---

### 3. Storefront Checkout UI/UX Revamp

#### [MODIFY] [storefront-page.tsx](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\components\storefront\storefront-page.tsx)
- **Visual Design Revamp**: Split the checkout modal into a premium double-paned layout:
  - **Left Pane (Interactive Form)**: High-quality inputs with subtle border-focus rings, customized typography, and dynamic payment selection.
  - **Right Pane (Order summary)**: Clean vertical list showing items with thumbnail images, quantity badge, price breakdown, and total highlight.
- Replace browser `alert()` statements with the new `toast` notifier (e.g. card validation alerts, form errors, external redirection alerts).

---

### 4. Merchant Configuration & Order Management

#### [MODIFY] [page.tsx (Merchant)](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\app\merchant\page.tsx)
- **RLS superuser preview fix**: If platform superuser logs in to `/merchant`, default `selectedMerchantId` to the first active merchant instead of leaving it as `'platform-master'` (which triggers an empty/unauthorized view).

#### [MODIFY] [dashboard-page.tsx](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\components\dashboard\dashboard-page.tsx)
- **General Store Settings**: In the "Branding" tab, add input fields for **Store Title** and **Order ID Format** (with instructional helper text showing placeholding tokens like `yyyy`, `mm`, `dd`, `<seq_No>`), next to the base currency setting.
- **Order Management Enhancements**:
  - Add quick action triggers for **Cancel** and **Fulfill** (for COD or pending orders) to the Order table.
  - Design an order-detailed side-drawer or modal overlay.
  - Inside the drawer, show customer details, shipping address, and item list, with a primary **Print Courier Slip** action.
  - The courier slip will render inside a print-optimized container that formats address and items clearly as a shipping label and calls `window.print()`.
  - Replace all browser `alert()` warnings and success confirmation messages with `toast` alerts.

---

### 5. Enhanced Business Analytics with SVG Charts

#### [NEW] [analytics-reports.tsx](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\components\dashboard\analytics-reports.tsx)
- Create a multi-report interface for **Sales & Revenue**, **Visitor Traffic**, and **Category Performance**.
- Design stunning, responsive native SVG graphics:
  - **Area/Line Chart**: Gradient filled area showing daily revenue trends.
  - **Bar Chart**: Displaying daily transaction volume.
  - **Donut Chart**: Circular display of category sales share.
- Include a "Print Report" option formatting the selected charts and tables cleanly onto white paper.

#### [MODIFY] [dashboard-page.tsx](file:///d:/srinivas\workspace\e-commerce-software\e-commerce\components\dashboard\dashboard-page.tsx)
- Import and integrate the new `<AnalyticsReports />` component inside the **Business Analytics** tab.

---

## Verification Plan

### Automated Verification
- Verify next.js app builds cleanly: `npm run build`
- Ensure no TypeScript errors: `npm run lint` or `npx tsc --noEmit`

### Manual Verification
1. **Merchant Settings**: Check that the store name, currency, and Order ID format (e.g., `yyyymmdd000<seq_No>`) can be configured and saved, showing a toast.
2. **Checkout UX**: Add items to the cart and proceed to checkout. Verify the beautiful double-pane layout, step indicator, form inputs, and that completing checkout prints a custom formatted Order ID (e.g., `202606070001` instead of `ord-xyz`).
3. **Order Management**: Go to the Order History log in the merchant console. Ensure pending orders show Cancel, Fulfill, and Print options. Click "Print" and check that the print preview shows a clean shipping label.
4. **Analytics Reports**: Visit the Business Analytics tab. Toggle between reports, hover over charts, and check the Print report layout.
5. **Super User Preview**: Log in as superuser and verify clicking "Merchant Preview" switches instantly into the dashboard console preview without errors.
