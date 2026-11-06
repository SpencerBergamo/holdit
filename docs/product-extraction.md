# Product extraction JSON (Gemini)

HoldIt resolves each **Save** from a capture (URL, photo, or manual text) by calling Gemini once with the `extract_product_details` function. This document is the contract AI agents and services should implement against.

## Response shape (`ProductExtractionResult`)

```json
{
  "is_valid_product": true,
  "rejection_reason": null,
  "product_snapshot": {
    "title": "Ceramic Pour-Over Kettle",
    "images": ["https://cdn.example/kettle.jpg"],
    "primary_url": "https://shop.example/kettle",
    "merchant_links": [
      { "url": "https://shop.example/kettle", "label": "Example Shop" }
    ],
    "specs": {
      "brand": "Hario",
      "material": "Stainless steel"
    },
    "price_cents": null,
    "currency": null,
    "category": {
      "taxonomy": "google_product",
      "path": ["Home & Garden", "Kitchen & Dining", "Cookware", "Kettles"]
    }
  },
  "variant_details": {
    "size": "600ml",
    "color": "Matte black",
    "quantity": 1
  }
}
```

### Top-level fields

| Field | Type | Notes |
| --- | --- | --- |
| `is_valid_product` | boolean | `false` for non-product URLs (homepages, articles, search/category pages, etc.). |
| `rejection_reason` | string \| null | User-facing reason when invalid; otherwise `null`. |
| `product_snapshot` | object | Merchant-oriented product data fixed on the Save after resolution (ADR 0001). |
| `variant_details` | object | Per-Save size, color, quantity; user edits win over AI (CONTEXT.md). |

### `product_snapshot`

| Field | Type | Notes |
| --- | --- | --- |
| `title` | string \| null | Product name. |
| `images` | string[] | Direct image URLs when known; often empty for photo-only captures. |
| `primary_url` | string \| null | Main product page URL. |
| `merchant_links` | `{ url, label? }[]` | Alternate purchase links. |
| `specs` | Record<string, string> | Structured attributes (brand, model, material, …). |
| `price_cents` | number \| null | Whole currency in minor units when known. |
| `currency` | string \| null | ISO 4217; e.g. `USD`. |
| `category` | ProductCategory \| null | **Required when `is_valid_product` is true.** See below. |

### `ProductCategory`

Uses [Google Product Taxonomy](https://www.google.com/basepages/producttype/taxonomy.en-US.txt). Decision: [issue #2](https://github.com/SpencerBergamo/holdit/issues/2).

| Field | Type | Notes |
| --- | --- | --- |
| `taxonomy` | `"google_product"` | Only value in v1. |
| `path` | string[] | 1–7 segments, broadest first. `path[0]` must be one of the 21 Google top-level categories (e.g. `Electronics`, `Apparel & Accessories`, `Furniture`). |

Display hint: join segments with `" > "` (e.g. `Electronics > Audio > Headphones`).

**Enforcement:** The app and Edge Function parsers reject categories whose `path[0]` is not one of the 21 official top-level names (exact string match, including `&` and commas). That keeps agents and Gemini aligned: invalid roots fail resolution instead of silently storing bad data.

### Invalid capture example

```json
{
  "is_valid_product": false,
  "rejection_reason": "This looks like a homepage, not a product page.",
  "product_snapshot": {
    "title": null,
    "images": [],
    "primary_url": null,
    "merchant_links": [],
    "specs": {},
    "price_cents": null,
    "currency": null,
    "category": null
  },
  "variant_details": {
    "size": null,
    "color": null,
    "quantity": null
  }
}
```

## Tool name

- Function: `extract_product_details`
- Model: `gemini-2.0-flash` (server-side only; `GEMINI_API_KEY` never on client)

## Code references

- Types: `src/types/product-extraction.ts`, `src/types/product-category.ts`, `src/types/save.ts`
- Zod + JSON Schema: `src/lib/gemini/extract-product-tool.ts`
- Edge Function: `supabase/functions/resolve-product`, `supabase/functions/_shared/product-extraction.ts`
