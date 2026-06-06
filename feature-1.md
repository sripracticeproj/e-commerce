# TASK: Implement E-Commerce Merchant Dashboard Features & UI Refactoring

## CONTEXT

The current merchant product creation flow is missing essential pricing/categorization fields. Additionally, the UI layout is cluttered because the storefront live preview is embedded directly in the working screen.

## INSTRUCTIONS & OBJECTIVES

### 1. Database & Schema Updates

Ensure the Product model/schema includes the following fields with appropriate validation:

- `category_id`: Foreign key linking to Categories table.
- `mrp`: Decimal/Float (Maximum Retail Price). Must be greater than 0.
- `selling_price`: Decimal/Float (Actual Price). Must be greater than 0 AND less than or equal to `mrp`.

### 2. Frontend Component Changes: "Add Product" Form

Modify the product creation UI form to include three new inputs:

- **Category Selector:**
  - Add a dropdown menu fetching existing categories.
  - Add an inline button labeled "+ Add Category" next to the dropdown.
  - Clicking "+ Add Category" must open a modal to create a new category without refreshing the page.
- **MRP Input:** Add a numerical input field with currency formatting.
- **Selling Price Input:** Add a numerical input field with currency formatting. Include frontend validation checking that `selling_price <= mrp`.

### 3. UI/UX Layout Refactoring (Preview Logic)

- **Remove Embedded Preview:** Locate the section of the screen rendering the live iframe/preview of the merchant site on the same viewport. Remove this inline preview entirely.
- **Implement New Preview Trigger:**
  - Add a secondary button in the top/bottom action bar labeled "Preview Storefront".
  - Configure this button to open the merchant's live preview URL in a new browser tab (`target="_blank"`).

### 4. Code Quality & Styling

- Apply modern, clean CSS/Tailwind design principles (consistent padding, clear typography, subtle borders).
- Ensure all new inputs have accessible `<label>` tags and clear placeholder text.
