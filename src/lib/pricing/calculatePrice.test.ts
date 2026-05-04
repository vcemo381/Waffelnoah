import { describe, expect, it } from "vitest";

import { calculatePrice, type PriceOption, type PriceProduct } from "./calculatePrice";

const PRODUCTS: Record<string, PriceProduct> = {
  waffle: { id: "waffle", unitPriceCents: 500, vatRate: 7 },
  drink: { id: "drink", unitPriceCents: 300, vatRate: 19 },
};

const OPTIONS: Record<string, PriceOption> = {
  sauce_choco: {
    id: "sauce_choco",
    group: "sauces",
    unitPriceCents: 100,
    freeEligible: true,
    freePriority: 10,
  },
  sauce_strawberry: {
    id: "sauce_strawberry",
    group: "sauces",
    unitPriceCents: 120,
    freeEligible: true,
    freePriority: 20,
  },
  sauce_pistachio: {
    id: "sauce_pistachio",
    group: "sauces",
    unitPriceCents: 160,
    freeEligible: false,
    freePriority: 0,
  },
  topping_banana: {
    id: "topping_banana",
    group: "toppings",
    unitPriceCents: 80,
    freeEligible: true,
    freePriority: 30,
  },
  topping_oreo: {
    id: "topping_oreo",
    group: "toppings",
    unitPriceCents: 90,
    freeEligible: true,
    freePriority: 20,
  },
  topping_premium: {
    id: "topping_premium",
    group: "toppings",
    unitPriceCents: 150,
    freeEligible: false,
    freePriority: 1,
  },
};

function baseInput() {
  return {
    pickupTime: "2026-05-04T12:00:00Z",
    productsById: PRODUCTS,
    optionsById: OPTIONS,
  };
}

describe("calculatePrice", () => {
  it("1 Produkt ohne Extras", () => {
    const result = calculatePrice({ ...baseInput(), items: [{ productId: "waffle", quantity: 1 }] });
    expect(result.grossCents).toBe(500);
    expect(result.freeOptions).toHaveLength(0);
    expect(result.chargedOptions).toHaveLength(0);
  });

  it("1 gratis Sauce", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [
        {
          productId: "waffle",
          quantity: 1,
          options: [{ optionId: "sauce_choco", quantity: 1 }],
        },
      ],
      freeByCategory: { sauces: 1 },
    });
    expect(result.freeOptions).toHaveLength(1);
    expect(result.grossCents).toBe(500);
  });

  it("2 Saucen mit 1 gratis", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [
        {
          productId: "waffle",
          quantity: 1,
          options: [
            { optionId: "sauce_choco", quantity: 1 },
            { optionId: "sauce_strawberry", quantity: 1 },
          ],
        },
      ],
      freeByCategory: { sauces: 1 },
    });
    expect(result.freeOptions).toHaveLength(1);
    expect(result.chargedOptions).toHaveLength(1);
    expect(result.grossCents).toBe(620);
  });

  it("freePriority entscheidet kostenlose Sauce", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [
        {
          productId: "waffle",
          quantity: 1,
          options: [
            { optionId: "sauce_strawberry", quantity: 1 },
            { optionId: "sauce_choco", quantity: 1 },
          ],
        },
      ],
      freeByCategory: { sauces: 1 },
    });

    expect(result.freeOptions[0]?.optionId).toBe("sauce_choco");
    expect(result.chargedOptions[0]?.optionId).toBe("sauce_strawberry");
  });

  it("nicht gratisfähige Sauce wird immer berechnet", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [
        {
          productId: "waffle",
          quantity: 1,
          options: [{ optionId: "sauce_pistachio", quantity: 1 }],
        },
      ],
      freeByCategory: { sauces: 1 },
    });
    expect(result.freeOptions).toHaveLength(0);
    expect(result.grossCents).toBe(660);
  });

  it("1 gratis Topping", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [
        {
          productId: "waffle",
          quantity: 1,
          options: [{ optionId: "topping_banana", quantity: 1 }],
        },
      ],
      freeByCategory: { toppings: 1 },
    });
    expect(result.freeOptions).toHaveLength(1);
    expect(result.grossCents).toBe(500);
  });

  it("3 Toppings mit 1 gratis", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [
        {
          productId: "waffle",
          quantity: 1,
          options: [
            { optionId: "topping_oreo", quantity: 1 },
            { optionId: "topping_banana", quantity: 1 },
            { optionId: "topping_banana", quantity: 1 },
          ],
        },
      ],
      freeByCategory: { toppings: 1 },
    });
    expect(result.freeOptions).toHaveLength(1);
    expect(result.chargedOptions).toHaveLength(2);
    expect(result.grossCents).toBe(660);
  });

  it("doppelte Menge mit nur einem Gratisplatz", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [
        {
          productId: "waffle",
          quantity: 1,
          options: [{ optionId: "sauce_choco", quantity: 2 }],
        },
      ],
      freeByCategory: { sauces: 1 },
    });

    expect(result.freeOptions).toHaveLength(1);
    expect(result.chargedOptions).toHaveLength(1);
    expect(result.grossCents).toBe(600);
  });

  it("Premium Topping nicht kostenlos", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [
        {
          productId: "waffle",
          quantity: 1,
          options: [{ optionId: "topping_premium", quantity: 1 }],
        },
      ],
      freeByCategory: { toppings: 1 },
    });
    expect(result.freeOptions).toHaveLength(0);
    expect(result.grossCents).toBe(650);
  });

  it("Prozent Gutschein", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [{ productId: "waffle", quantity: 1 }],
      coupon: { code: "TEN", type: "percent", value: 10 },
    });
    expect(result.discountCents).toBe(50);
    expect(result.grossCents).toBe(450);
  });

  it("Fester Gutschein", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [{ productId: "waffle", quantity: 1 }],
      coupon: { code: "FIX200", type: "fixed", value: 200 },
    });
    expect(result.discountCents).toBe(200);
    expect(result.grossCents).toBe(300);
  });

  it("Getränk mit 19 Prozent", () => {
    const result = calculatePrice({ ...baseInput(), items: [{ productId: "drink", quantity: 1 }] });
    expect(result.vat19Cents).toBe(48);
    expect(result.vat7Cents).toBe(0);
  });

  it("Speise mit 7 Prozent", () => {
    const result = calculatePrice({ ...baseInput(), items: [{ productId: "waffle", quantity: 1 }] });
    expect(result.vat7Cents).toBe(33);
    expect(result.vat19Cents).toBe(0);
  });

  it("Gemischter Warenkorb mit 7 und 19 Prozent", () => {
    const result = calculatePrice({
      ...baseInput(),
      items: [
        { productId: "waffle", quantity: 1 },
        { productId: "drink", quantity: 1 },
      ],
    });

    expect(result.grossCents).toBe(800);
    expect(result.vat7Cents).toBe(33);
    expect(result.vat19Cents).toBe(48);
    expect(result.netCents + result.vat7Cents + result.vat19Cents).toBe(result.grossCents);
  });
});
