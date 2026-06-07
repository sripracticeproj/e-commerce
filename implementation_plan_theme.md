# Implementation Plan - Highly Configurable Theme-Based Storefronts

This plan details extending the storefront theme options to support predefined visual presets (e.g. Minimalist Slate, Organic Botanical, Warm Amber, Retro Neon) and granular visual configurations (text colors, button colors, header colors, card colors, base font sizes) manageable from the Merchant Console.

---

## Proposed Changes

### 1. Domain Types Extension

#### [MODIFY] [types/index.ts](file:///d:/srinivas/workspace/e-commerce-software/e-commerce/types/index.ts)
- Extend `ThemeConfig` interface to support:
  - `text_color?: string;`
  - `font_size?: string;` (e.g. `'sm' | 'base' | 'lg' | 'xl'`)
  - `button_bg_color?: string;`
  - `button_text_color?: string;`
  - `header_bg_color?: string;`
  - `card_bg_color?: string;`
  - `theme_preset?: string;`

---

### 2. Mock Database Seeding Defaults

#### [MODIFY] [mock-db.ts](file:///d:/srinivas/workspace/e-commerce-software/e-commerce/lib/mock-db.ts)
- Update default storefront configurations inside `DEFAULT_STOREFRONT_CONFIGS` to include base defaults for the new theme variables (botanical settings for Solara, slate settings for Aether).

---

### 3. Merchant Dashboard Branding Panel Upgrade

#### [MODIFY] [dashboard-page.tsx](file:///d:/srinivas/workspace/e-commerce-software/e-commerce/components/dashboard/dashboard-page.tsx)
- Add state variables for the new configurations:
  - `textColor`, `fontSize`, `buttonBgColor`, `buttonTextColor`, `headerBgColor`, `cardBgColor`, `themePreset`.
- Initialize them in `loadData()` from the loaded configuration.
- Implement **Theme Preset Selection cards**:
  - Clicking a preset card (e.g. Slate, Botanical, Amber, Neon, Royal) immediately updates all local styling states with harmonious preset colors.
- Expand color picker forms under the **"Branding"** tab to manage:
  - **Body Text Color**
  - **Button Background & Button Text Color**
  - **Header & Product Card Background Colors**
  - **Base Font Size** dropdown (`Small (14px)`, `Medium (16px)`, `Large (18px)`, `Extra Large (20px)`).
- The save method will bundle and write these settings to `mockDb.updateStorefrontConfig`.

---

### 4. Storefront Style Engine Rendering

#### [MODIFY] [storefront-page.tsx](file:///d:/srinivas/workspace/e-commerce-software/e-commerce/components/storefront/storefront-page.tsx)
- Feed the new theme properties into `customStyles` CSS variables:
  - `--text-color`
  - `--font-size`
  - `--button-bg-color`
  - `--button-text-color`
  - `--header-bg-color`
  - `--card-bg-color`
- Inject CSS variables and rule declarations in the dynamic `<style>` block:
  - Global base body typography rules: font family, font size, base text color.
  - Custom button states using `--button-bg-color` and `--button-text-color`.
  - Header background mapping using `--header-bg-color`.
  - Product card background mapping using `--card-bg-color`.
- Swap fixed Tailwind colors/paddings on buttons, cards, and header with theme variables classes.

---

## Verification Plan

### Automated Tests
- Run `npm run build` to confirm Next.js build compilation succeeds.

### Manual Verification
1. **Change Preset Theme**:
   - Log in as `solara_admin` on `/merchant`. Navigate to Branding settings.
   - Click the **Retro Neon** preset theme card. Confirm that color picker values update immediately.
   - Click **Save Config** and verify storefront preview updates to a dark background with fuchsia neon buttons.
2. **Granular Settings Controls**:
   - Change **Base Font Size** to `Extra Large (20px)` and change **Button Text Color** to green.
   - Click save, view storefront, and verify custom styles apply cleanly.
