export type VatRate = 7 | 19;

export type OptionGroup = "toppings" | "sauces" | "extras" | string;

export interface PriceProduct {
  id: string;
  name?: string;
  unitPriceCents: number;
  vatRate: VatRate;
}

export interface PriceOption {
  id: string;
  group: OptionGroup;
  name?: string;
  unitPriceCents: number;
  freeEligible: boolean;
  freePriority?: number;
  vatRate?: VatRate;
}

export interface ProductOptionSelection {
  optionId: string;
  quantity: number;
}

export interface ProductSelection {
  productId: string;
  quantity: number;
  options?: ProductOptionSelection[];
}

export interface CouponInput {
  code: string;
  type: "percent" | "fixed";
  value: number;
}

export interface PricingInput {
  pickupTime: string;
  items: ProductSelection[];
  productsById: Record<string, PriceProduct>;
  optionsById: Record<string, PriceOption>;
  freeByProductId?: Record<string, Partial<Record<OptionGroup, number>>>;
  freeByCategory?: Partial<Record<OptionGroup, number>>;
  coupon?: CouponInput | null;
}

export interface PricedSelectionOption {
  productId: string;
  optionId: string;
  group: OptionGroup;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
  freeEligible: boolean;
  freePriority: number;
  vatRate: VatRate;
}

export interface CalculatePriceResult {
  pickupTime: string;
  pricedProducts: Array<{
    productId: string;
    quantity: number;
    unitPriceCents: number;
    vatRate: VatRate;
    lineTotalCents: number;
  }>;
  freeOptions: PricedSelectionOption[];
  chargedOptions: PricedSelectionOption[];
  subtotalBeforeDiscountCents: number;
  discountCents: number;
  subtotalAfterDiscountCents: number;
  netCents: number;
  vat7Cents: number;
  vat19Cents: number;
  grossCents: number;
}

function assertNonNegativeInteger(value: number, label: string) {
  if (!Number.isInteger(value) || value < 0) {
    throw new Error(`${label} must be a non-negative integer`);
  }
}

export function calculatePrice(input: PricingInput): CalculatePriceResult {
  const pricedProducts: CalculatePriceResult["pricedProducts"] = [];
  const freeOptions: PricedSelectionOption[] = [];
  const chargedOptions: PricedSelectionOption[] = [];

  let productSubtotalCents = 0;
  let optionsSubtotalCents = 0;

  const vatBuckets = { 7: 0, 19: 0 } as Record<VatRate, number>;

  for (const item of input.items) {
    assertNonNegativeInteger(item.quantity, `quantity for product ${item.productId}`);

    const product = input.productsById[item.productId];
    if (!product) {
      throw new Error(`Unknown productId: ${item.productId}`);
    }

    const productLineTotal = product.unitPriceCents * item.quantity;
    productSubtotalCents += productLineTotal;
    vatBuckets[product.vatRate] += productLineTotal;

    pricedProducts.push({
      productId: product.id,
      quantity: item.quantity,
      unitPriceCents: product.unitPriceCents,
      vatRate: product.vatRate,
      lineTotalCents: productLineTotal,
    });

    if (!item.options?.length) continue;

    const expandedOptions: Array<Omit<PricedSelectionOption, "quantity" | "lineTotalCents">> = [];

    for (const selectedOption of item.options) {
      assertNonNegativeInteger(
        selectedOption.quantity,
        `quantity for option ${selectedOption.optionId}`,
      );

      const option = input.optionsById[selectedOption.optionId];
      if (!option) {
        throw new Error(`Unknown optionId: ${selectedOption.optionId}`);
      }

      const optionVatRate: VatRate = option.vatRate ?? product.vatRate;
      const units = selectedOption.quantity * item.quantity;
      for (let i = 0; i < units; i += 1) {
        expandedOptions.push({
          productId: item.productId,
          optionId: option.id,
          group: option.group,
          unitPriceCents: option.unitPriceCents,
          freeEligible: option.freeEligible,
          freePriority: option.freePriority,
          vatRate: optionVatRate,
        });
      }
    }

    const freeRules = {
      ...(input.freeByCategory ?? {}),
      ...(input.freeByProductId?.[item.productId] ?? {}),
    };

    const groupSlots = new Map<OptionGroup, number>();
    for (const option of expandedOptions) {
      if (!groupSlots.has(option.group)) {
        groupSlots.set(option.group, freeRules[option.group] ?? 0);
      }
    }

    const indexedCandidates = expandedOptions.map((o, idx) => ({ ...o, idx }));
    const groupedCandidates = new Map<OptionGroup, typeof indexedCandidates>();

    for (const candidate of indexedCandidates) {
      const existing = groupedCandidates.get(candidate.group) ?? [];
      existing.push(candidate);
      groupedCandidates.set(candidate.group, existing);
    }

    const freeIdxSet = new Set<number>();
    for (const [group, candidates] of groupedCandidates.entries()) {
      const slots = groupSlots.get(group) ?? 0;
      if (slots <= 0) continue;

      const eligible = candidates.filter((candidate) => candidate.freeEligible);
      const hasExplicitPriority = eligible.some(
        (candidate) => candidate.freePriority !== undefined,
      );

      const sorted = [...eligible].sort((a, b) => {
        if (hasExplicitPriority) {
          const priorityA = a.freePriority ?? Number.MAX_SAFE_INTEGER;
          const priorityB = b.freePriority ?? Number.MAX_SAFE_INTEGER;
          return priorityA - priorityB || a.idx - b.idx;
        }

        return a.unitPriceCents - b.unitPriceCents || a.idx - b.idx;
      });

      for (const candidate of sorted.slice(0, slots)) {
        freeIdxSet.add(candidate.idx);
      }
    }

    for (const [idx, option] of expandedOptions.entries()) {
      const isFree = freeIdxSet.has(idx);
      const priced: PricedSelectionOption = {
        ...option,
        quantity: 1,
        lineTotalCents: isFree ? 0 : option.unitPriceCents,
      };

      if (isFree) {
        freeOptions.push(priced);
      } else {
        chargedOptions.push(priced);
        optionsSubtotalCents += option.unitPriceCents;
        vatBuckets[option.vatRate] += option.unitPriceCents;
      }
    }
  }

  const subtotalBeforeDiscountCents = productSubtotalCents + optionsSubtotalCents;

  let discountCents = 0;
  if (input.coupon) {
    discountCents =
      input.coupon.type === "percent"
        ? Math.floor((subtotalBeforeDiscountCents * input.coupon.value) / 100)
        : input.coupon.value;

    if (discountCents > subtotalBeforeDiscountCents) {
      discountCents = subtotalBeforeDiscountCents;
    }
  }

  const subtotalAfterDiscountCents = subtotalBeforeDiscountCents - discountCents;

  const raw7 = vatBuckets[7];
  const raw19 = vatBuckets[19];
  const taxableTotal = raw7 + raw19;

  const discounted7 =
    taxableTotal === 0 ? 0 : Math.floor((subtotalAfterDiscountCents * raw7) / taxableTotal);
  const discounted19 = subtotalAfterDiscountCents - discounted7;

  const net7 = Math.round((discounted7 * 100) / 107);
  const vat7Cents = discounted7 - net7;

  const net19 = Math.round((discounted19 * 100) / 119);
  const vat19Cents = discounted19 - net19;

  const netCents = net7 + net19;
  const grossCents = subtotalAfterDiscountCents;

  return {
    pickupTime: input.pickupTime,
    pricedProducts,
    freeOptions,
    chargedOptions,
    subtotalBeforeDiscountCents,
    discountCents,
    subtotalAfterDiscountCents,
    netCents,
    vat7Cents,
    vat19Cents,
    grossCents,
  };
}
