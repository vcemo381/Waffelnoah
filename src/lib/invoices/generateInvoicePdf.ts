export function generateInvoicePdf() {
  return {
    sections: {
      freeOptions: [],
      chargedOptions: [],
      nonFreeEligibleOptions: [],
      appliedFreeRule: "none" as "product" | "category" | "none"
    }
  };
}
