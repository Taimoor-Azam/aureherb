export type ProductIngredient = {
  name: string
  detail: string
}

export type ProductContent = {
  description: string
  ingredients: ProductIngredient[]
  benefits: string[]
}

export const HAIR_GROWTH_OIL_PRODUCT_ID =
  "prod_01KYPJR14AF0JQT5VFK2ZPE4YF"

export const HAIR_GROWTH_OIL_DESCRIPTION =
  "AureHerb Hair Growth Oil is expertly crafted using a carefully selected blend of premium botanical oils and herbal extracts that work together to nourish the scalp, strengthen hair, and improve overall hair health."

export const hairGrowthOilContent: ProductContent = {
  description: HAIR_GROWTH_OIL_DESCRIPTION,
  ingredients: [
    {
      name: "Mustard Oil",
      detail:
        "Rich in essential fatty acids that help nourish the scalp and support stronger-looking hair.",
    },
    {
      name: "Coconut Oil",
      detail:
        "Deeply moisturizes the hair shaft, helping reduce protein loss and improve softness.",
    },
    {
      name: "Sweet Almond Oil",
      detail:
        "Packed with Vitamin E and healthy fats to enhance shine and improve manageability.",
    },
    {
      name: "Flaxseed Oil",
      detail:
        "A natural source of Omega-3 fatty acids that helps nourish dry and brittle hair.",
    },
    {
      name: "Rocket Seed Oil",
      detail:
        "Traditionally used to help strengthen hair roots and improve scalp health.",
    },
    {
      name: "Black Seed Oil",
      detail:
        "Known for its antioxidant properties and traditionally used in hair care to help nourish the scalp and support healthier-looking hair.",
    },
    {
      name: "Castor Oil",
      detail:
        "Rich in ricinoleic acid, helping moisturize the scalp and improve the appearance of thicker, fuller hair.",
    },
    {
      name: "Amla Oil",
      detail:
        "An antioxidant-rich botanical traditionally used to strengthen hair and improve natural shine.",
    },
    {
      name: "Sesame Oil",
      detail:
        "Helps protect hair from dryness while providing deep nourishment to the scalp.",
    },
    {
      name: "Soapnut Extract",
      detail:
        "A traditional botanical known for helping maintain a clean, healthy scalp.",
    },
    {
      name: "Fenugreek Seed Extract",
      detail:
        "Rich in proteins and nutrients that help strengthen hair and reduce breakage.",
    },
    {
      name: "Garlic Extract",
      detail:
        "Contains sulfur compounds and antioxidants traditionally used to support healthy hair.",
    },
    {
      name: "Ginger Root Extract",
      detail:
        "Helps refresh the scalp and is traditionally used in botanical hair care formulations.",
    },
    {
      name: "Vitamin E",
      detail:
        "A powerful antioxidant that helps protect hair from environmental stress while supporting softness and shine.",
    },
  ],
  benefits: [
    "Helps reduce hair fall due to breakage",
    "Nourishes and moisturizes the scalp",
    "Strengthens weak and fragile hair",
    "Supports healthier-looking hair growth",
    "Helps improve hair texture and manageability",
    "Adds natural shine and softness",
    "Deeply nourishes from root to tip",
    "Helps reduce dryness and frizz",
    "Suitable for all hair types",
    "Lightweight, non-sticky botanical formula",
  ],
}

export function getProductContent(opts: {
  handle?: string | null
  id?: string | null
}): ProductContent | null {
  const handle = (opts.handle || "").toLowerCase()
  if (
    handle === "hair-growth-oil" ||
    opts.id === HAIR_GROWTH_OIL_PRODUCT_ID
  ) {
    return hairGrowthOilContent
  }
  return null
}
