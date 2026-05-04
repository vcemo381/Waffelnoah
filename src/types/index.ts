export type ID = string;
export type UnixTimestamp = string;

export type VatRate = 7 | 19;
export type OptionGroupType = "toppings" | "sauces" | "extras";
export type RecommendedLevel = 0 | 1 | 2 | 3;
export type FreeStrategy = "cheapest" | "priority";

export interface ProductImage {
  id: ID;
  productId: ID;
  url: string;
  alt: string;
  sortOrder: number;
  isPrimary: boolean;
}

export interface Category {
  id: ID;
  slug: string;
  name: string;
  description: string;
  imageUrl?: string;
  vatRateDefault: VatRate;
  allowFreeOptions?: boolean;
  freeToppingsCount?: number;
  freeSaucesCount?: number;
  freeExtrasCount?: number;
  freeStrategy?: FreeStrategy;
  active: boolean;
  sortOrder: number;
}

export interface Product {
  id: ID;
  categoryId: ID;
  slug: string;
  name: string;
  description: string;
  priceCents: number;
  vatRate: VatRate;
  imageUrl: string;
  active: boolean;
  isNew: boolean;
  isRecommended: boolean;
  isDailySpecial: boolean;
  allowFreeOptions?: boolean;
  freeToppingsCount?: number;
  freeSaucesCount?: number;
  freeExtrasCount?: number;
  freeStrategy?: FreeStrategy;
}

export interface OptionGroup {
  id: ID;
  key: OptionGroupType;
  name: string;
  description?: string;
  minSelect: number;
  maxSelect: number;
  freeDefaultCount: number;
  sortOrder: number;
  active: boolean;
}

export interface Option {
  id: ID;
  groupId: ID;
  name: string;
  description?: string;
  priceCents: number;
  group: OptionGroupType;
  freeEligible: boolean;
  freePriority?: number;
  recommendedLevel: RecommendedLevel;
  active: boolean;
  sortOrder: number;
}

export interface ProductOptionRule {
  id: ID;
  productId?: ID;
  categoryId?: ID;
  optionGroupId: ID;
  freeCountOverride?: number;
  allowedOptionIds?: ID[];
  blockedOptionIds?: ID[];
}

export interface Coupon {
  id: ID;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValueCents?: number;
  maxDiscountCents?: number;
  validFrom?: string;
  validUntil?: string;
  maxRedemptions?: number;
  active: boolean;
}

export interface CartItemOption {
  optionId: ID;
  quantity: number;
  doubleAmount?: boolean;
}

export interface CartItem {
  productId: ID;
  quantity: number;
  note?: string;
  options: CartItemOption[];
}

export interface PriceBreakdown {
  itemsGrossCents: number;
  optionsGrossCents: number;
  subtotalGrossCents: number;
  discountCents: number;
  netCents: number;
  vat7Cents: number;
  vat19Cents: number;
  grossCents: number;
}

export interface OrderItemOption {
  id: ID;
  orderItemId: ID;
  optionId: ID;
  nameSnapshot: string;
  unitPriceCents: number;
  quantity: number;
  freeQuantity: number;
  chargedQuantity: number;
  lineTotalCents: number;
}

export interface OrderItem {
  id: ID;
  orderId: ID;
  productId: ID;
  nameSnapshot: string;
  vatRate: VatRate;
  quantity: number;
  unitPriceCents: number;
  optionsTotalCents: number;
  lineTotalCents: number;
  note?: string;
  options: OrderItemOption[];
}

export interface Order {
  id: ID;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  pickupAt: string;
  status: "open" | "in_progress" | "ready" | "cancelled";
  couponCode?: string;
  couponDiscountCents: number;
  pricing: PriceBreakdown;
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
  stripeCheckoutSessionId?: string;
  stripePaymentIntentId?: string;
  createdAt: UnixTimestamp;
  updatedAt: UnixTimestamp;
  items: OrderItem[];
}

export interface Invoice {
  id: ID;
  orderId: ID;
  invoiceNumber: string;
  pdfUrl: string;
  issuedAt: UnixTimestamp;
}

export interface Payment {
  id: ID;
  orderId: ID;
  provider: "stripe";
  providerPaymentId: string;
  amountCents: number;
  currency: "eur";
  status: "requires_payment_method" | "processing" | "succeeded" | "failed" | "refunded";
  paidAt?: UnixTimestamp;
}

export interface AdminRole {
  id: ID;
  adminId: ID;
  role: "owner" | "manager" | "staff";
  assignedAt: UnixTimestamp;
}

export interface AuditLog {
  id: ID;
  actorAdminId: ID;
  action: string;
  entityType: string;
  entityId: ID;
  beforeJson?: Record<string, unknown>;
  afterJson?: Record<string, unknown>;
  createdAt: UnixTimestamp;
}

export interface Quote {
  id: ID;
  text: string;
  author: string;
  active: boolean;
}

export type Weekday =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export interface OpeningHours {
  day: Weekday;
  open: string;
  close: string;
  isClosed: boolean;
}

export interface ShopStatus {
  state: "open" | "closing_soon" | "closed";
  message: string;
  nextChangeAt?: string;
}

export interface SiteContent {
  siteName: string;
  tagline: string;
  currency: "EUR";
  pickupLeadTimeMinutes: number[];
  openingHours: OpeningHours[];
  address: {
    street: string;
    postalCode: string;
    city: string;
    country: string;
  };
  contact: {
    phone: string;
    email: string;
  };
  socialLinks?: {
    instagram?: string;
    tiktok?: string;
  };
}
