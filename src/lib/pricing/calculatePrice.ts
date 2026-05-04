import type { Category, FreeStrategy, Option, OptionGroupType, Product } from "@/types";

type SelectedOption = { optionId: string; quantity: number };
type FreeRule = {
  allowFreeOptions: boolean;
  freeToppingsCount: number;
  freeSaucesCount: number;
  freeExtrasCount: number;
  freeStrategy: FreeStrategy;
};

export function calculatePrice(input: {
  product: Product;
  category?: Category;
  optionsCatalog: Option[];
  selectedOptions: SelectedOption[];
}) {
  const ruleSource = hasRule(input.product) ? "product" : hasRule(input.category) ? "category" : "none";
  const resolvedRule = resolveRule(ruleSource === "product" ? input.product : input.category);

  const expanded = input.selectedOptions.flatMap((selection) => {
    const opt = input.optionsCatalog.find((o) => o.id === selection.optionId);
    if (!opt) return [];
    return Array.from({ length: selection.quantity }, () => opt);
  });

  const freeOptions: Option[] = [];
  const chargedOptions: Option[] = [];
  const nonFreeEligibleOptions: Option[] = [];

  (["toppings", "sauces", "extras"] as OptionGroupType[]).forEach((group) => {
    const groupOptions = expanded.filter((o) => o.group === group);
    const nonEligible = groupOptions.filter((o) => !o.freeEligible);
    nonFreeEligibleOptions.push(...nonEligible);
    const eligible = groupOptions.filter((o) => o.freeEligible);

    if (!resolvedRule || !resolvedRule.allowFreeOptions) {
      chargedOptions.push(...eligible, ...nonEligible);
      return;
    }

    const freeCount = group === "toppings" ? resolvedRule.freeToppingsCount : group === "sauces" ? resolvedRule.freeSaucesCount : resolvedRule.freeExtrasCount;
    const sorted = [...eligible].sort((a, b) => sortByStrategy(a, b, resolvedRule.freeStrategy));
    freeOptions.push(...sorted.slice(0, freeCount));
    chargedOptions.push(...sorted.slice(freeCount), ...nonEligible);
  });

  const optionsTotalCents = chargedOptions.reduce((sum, option) => sum + option.priceCents, 0);

  return {
    subtotalCents: input.product.priceCents + optionsTotalCents,
    totalCents: input.product.priceCents + optionsTotalCents,
    freeOptions,
    chargedOptions,
    nonFreeEligibleOptions,
    appliedRule: ruleSource as "product" | "category" | "none"
  };
}

function hasRule(entity?: Partial<FreeRule>) {
  return entity && typeof entity.allowFreeOptions === "boolean";
}

function resolveRule(entity?: Partial<FreeRule>): FreeRule | null {
  if (!hasRule(entity)) return null;
  return {
    allowFreeOptions: Boolean(entity?.allowFreeOptions),
    freeToppingsCount: entity?.freeToppingsCount ?? 0,
    freeSaucesCount: entity?.freeSaucesCount ?? 0,
    freeExtrasCount: entity?.freeExtrasCount ?? 0,
    freeStrategy: entity?.freeStrategy ?? "cheapest"
  };
}

function sortByStrategy(a: Option, b: Option, strategy: FreeStrategy) {
  if (strategy === "priority") {
    const aP = a.freePriority;
    const bP = b.freePriority;
    if (typeof aP === "number" && typeof bP === "number" && aP !== bP) return aP - bP;
    if (typeof aP === "number" && typeof bP !== "number") return -1;
    if (typeof aP !== "number" && typeof bP === "number") return 1;
  }
  return a.priceCents - b.priceCents;
}
