import { describe, expect, it } from "vitest";
import { calculatePrice } from "./calculatePrice";

const options = [
  { id: "t1", groupId: "grp_toppings", group: "toppings", name: "Banane", priceCents: 100, freeEligible: true, active: true, recommendedLevel: 1, sortOrder: 1 },
  { id: "t2", groupId: "grp_toppings", group: "toppings", name: "Oreo", priceCents: 130, freeEligible: true, freePriority: 1, active: true, recommendedLevel: 1, sortOrder: 2 },
  { id: "t3", groupId: "grp_toppings", group: "toppings", name: "Premium", priceCents: 250, freeEligible: false, active: true, recommendedLevel: 1, sortOrder: 3 },
  { id: "s1", groupId: "grp_sauces", group: "sauces", name: "Schoko", priceCents: 90, freeEligible: true, active: true, recommendedLevel: 1, sortOrder: 1 },
  { id: "s2", groupId: "grp_sauces", group: "sauces", name: "Erdbeer", priceCents: 110, freeEligible: true, active: true, recommendedLevel: 1, sortOrder: 2 }
] as const;

const category = { id: "c1", slug: "waffeln", name: "Waffeln", description: "", vatRateDefault: 7, active: true, sortOrder: 1, allowFreeOptions: true, freeToppingsCount: 1, freeSaucesCount: 1, freeExtrasCount: 0, freeStrategy: "cheapest" } as const;
const crepeCategory = { ...category, allowFreeOptions: false, freeToppingsCount: 0, freeSaucesCount: 0 };

describe("calculatePrice", () => {
  it("Produkt ohne Gratisoptionen", () => {
    const result = calculatePrice({ product: { id: "p1", categoryId: "c1", slug: "x", name: "x", description: "", priceCents: 500, vatRate: 7, imageUrl: "", active: true, isNew: false, isRecommended: false, isDailySpecial: false }, category, optionsCatalog: [...options], selectedOptions: [{ optionId: "t1", quantity: 1 }] });
    expect(result.appliedRule).toBe("category");
  });

  it("Kategorie mit Gratisoptionen + Waffel mit 1 gratis Sauce und 1 gratis Topping", () => {
    const result = calculatePrice({ product: { id: "p1", categoryId: "c1", slug: "x", name: "x", description: "", priceCents: 500, vatRate: 7, imageUrl: "", active: true, isNew: false, isRecommended: false, isDailySpecial: false }, category, optionsCatalog: [...options], selectedOptions: [{ optionId: "t1", quantity: 1 }, { optionId: "s1", quantity: 1 }] });
    expect(result.freeOptions).toHaveLength(2);
    expect(result.totalCents).toBe(500);
  });

  it("Produkt überschreibt Kategorie + Premium Waffel mit 2 gratis Toppings", () => {
    const result = calculatePrice({ product: { id: "p2", categoryId: "c1", slug: "p", name: "Premium", description: "", priceCents: 700, vatRate: 7, imageUrl: "", active: true, isNew: false, isRecommended: false, isDailySpecial: false, allowFreeOptions: true, freeToppingsCount: 2, freeSaucesCount: 0, freeExtrasCount: 0, freeStrategy: "cheapest" }, category, optionsCatalog: [...options], selectedOptions: [{ optionId: "t1", quantity: 1 }, { optionId: "t2", quantity: 1 }] });
    expect(result.appliedRule).toBe("product");
    expect(result.freeOptions).toHaveLength(2);
  });

  it("Crêpe ohne Gratisoptionen", () => {
    const result = calculatePrice({ product: { id: "p3", categoryId: "c2", slug: "c", name: "Crepe", description: "", priceCents: 400, vatRate: 7, imageUrl: "", active: true, isNew: false, isRecommended: false, isDailySpecial: false }, category: crepeCategory, optionsCatalog: [...options], selectedOptions: [{ optionId: "s1", quantity: 1 }] });
    expect(result.freeOptions).toHaveLength(0);
    expect(result.totalCents).toBe(490);
  });

  it("günstigste gratisfähige Option wird kostenlos", () => {
    const result = calculatePrice({ product: { id: "p1", categoryId: "c1", slug: "x", name: "x", description: "", priceCents: 500, vatRate: 7, imageUrl: "", active: true, isNew: false, isRecommended: false, isDailySpecial: false, allowFreeOptions: true, freeToppingsCount: 1, freeSaucesCount: 0, freeExtrasCount: 0, freeStrategy: "cheapest" }, optionsCatalog: [...options], selectedOptions: [{ optionId: "t1", quantity: 1 }, { optionId: "t2", quantity: 1 }] });
    expect(result.freeOptions[0].id).toBe("t1");
  });

  it("freeEligible false wird immer berechnet", () => {
    const result = calculatePrice({ product: { id: "p1", categoryId: "c1", slug: "x", name: "x", description: "", priceCents: 500, vatRate: 7, imageUrl: "", active: true, isNew: false, isRecommended: false, isDailySpecial: false, allowFreeOptions: true, freeToppingsCount: 2, freeSaucesCount: 0, freeExtrasCount: 0, freeStrategy: "cheapest" }, optionsCatalog: [...options], selectedOptions: [{ optionId: "t3", quantity: 1 }] });
    expect(result.nonFreeEligibleOptions).toHaveLength(1);
    expect(result.totalCents).toBe(750);
  });

  it("doppelte Menge mit nur einem Gratisplatz", () => {
    const result = calculatePrice({ product: { id: "p1", categoryId: "c1", slug: "x", name: "x", description: "", priceCents: 500, vatRate: 7, imageUrl: "", active: true, isNew: false, isRecommended: false, isDailySpecial: false, allowFreeOptions: true, freeToppingsCount: 1, freeSaucesCount: 0, freeExtrasCount: 0, freeStrategy: "cheapest" }, optionsCatalog: [...options], selectedOptions: [{ optionId: "t1", quantity: 2 }] });
    expect(result.freeOptions).toHaveLength(1);
    expect(result.chargedOptions).toHaveLength(1);
  });

  it("priority Strategie mit fallback cheapest", () => {
    const result = calculatePrice({ product: { id: "p1", categoryId: "c1", slug: "x", name: "x", description: "", priceCents: 500, vatRate: 7, imageUrl: "", active: true, isNew: false, isRecommended: false, isDailySpecial: false, allowFreeOptions: true, freeToppingsCount: 1, freeSaucesCount: 0, freeExtrasCount: 0, freeStrategy: "priority" }, optionsCatalog: [...options], selectedOptions: [{ optionId: "t1", quantity: 1 }, { optionId: "t2", quantity: 1 }] });
    expect(result.freeOptions[0].id).toBe("t2");
  });
});
