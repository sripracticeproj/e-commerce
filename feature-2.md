# TASK: Fix Platform Navigation, Implement Multi-Tenant Storage, RBAC Roles, and Currency Configurations

## CONTEXT

The AI-Commerce Enterprise application requires system repairs and structural enhancements. Currently, the merchant website's Home and Product sections are non-functional. The platform also lacks explicit multi-tenant customer/order data separation, an onboarding mechanism for Enterprise Super Users, and dynamic currency configurations per merchant dashboard.

## INSTRUCTIONS & OBJECTIVES

### 1. Bug Fixes (Merchant Website)

- **Home Section:** Investigate and fix the broken pathing/routing or data loading failures preventing the merchant home dashboard layout from rendering.
- **Product Section:** Resolve the underlying exceptions preventing the page from displaying existing inventory, modifying items, or handling categories successfully.

### 2. Database Schema Upgrades (Multi-Tenant Customers & Orders)

Ensure the schema partitions customer data, transactional data, and system configurations distinctly by merchant. Create or modify tables to implement:

- **Customers Table:** Store `customer_id`, `name`, `email`, `phone`, and `merchant_id` (foreign key connecting the customer profile exclusively to their native merchant vendor).
- **Orders Table:** Store `order_id`, `customer_id`, `merchant_id` (foreign key), `order_total`, `order_status`, and `created_at` data strings.
- **Merchant Configurations Table:** Store `merchant_id`, `merchant_name`, and a `currency_code` parameter (e.g., `INR`, `USD`, `EUR`).

### 3. Role-Based Access Control (RBAC) & Merchant Management

Enforce separation of privileges across the enterprise application layout:

- **Enterprise Super User Permissions:**
  - Provide a master admin dashboard to onboard new merchants.
  - Implement a merchant configuration page enabling the Super User to select and bind a global currency setting (e.g., Rupees `₹`, Dollars `$`, Euros `€`) per tenant profile.
- **Merchant Admin User Permissions (Strict Multi-Tenancy):**
  - Implement scope-limiting repository rules filtering by the logged-in user's active `merchant_id`.
  - Limit the dashboard interface view entirely to that tenant's exact `order_history` logs and `customer_details`.
  - Block access to cross-merchant data buckets.
  - Grant read/write rights only to modify their specific `products` catalog and `categories`.

### 4. Frontend Dynamic Currency Rendering

- Update all pricing layouts (e.g., product creation screens, public storefront product details, order summary logs, and financial metrics analytics tables) to fetch the tenant's individual `currency_code` metric from storage.
- Format pricing visually with the assigned symbol variant (e.g., displaying `₹500` if bound to Rupees, or `$500` if bound to Dollars) dynamically instead of rendering a hardcoded currency type.

### 5. Architectural Quality Standards

- Use robust database queries or data serialization filters to prevent multi-tenant logic leaks.
- Ensure proper server-side authentication state checks validate token access scopes before returning data vectors to client screens.
