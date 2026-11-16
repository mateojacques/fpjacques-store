// API Types based on OpenAPI spec

// ============ Common Types ============
export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

export interface ApiResponse<T> {
  data: T;
}

export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: { path: string; message: string }[];
  };
}

// ============ Auth Types ============
export type UserRole = "owner" | "admin" | "buyer" | "partner";

export type IvaStatus =
  | "responsable_inscripto"
  | "monotributo"
  | "exento"
  | "consumidor_final";

export interface Institution {
  id: string;
  name: string;
  cuit: string | null;
  legalName: string | null;
  ivaStatus: IvaStatus | null;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  /** WhatsApp number; null on accounts created before it was asked for. */
  phone: string | null;
  institution: Institution | null;
}

export interface RegisterInput {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  institutionName: string;
  cuit?: string;
  legalName?: string;
  ivaStatus?: IvaStatus;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface AuthResponse {
  data: {
    token: string;
    user: UserProfile;
  };
}

export interface UpdateProfileInput {
  fullName?: string;
  email?: string;
  phone?: string;
  /** Omitted fields are kept; null clears an optional one. */
  institution?: {
    name?: string;
    cuit?: string | null;
    legalName?: string | null;
    ivaStatus?: IvaStatus | null;
  };
}

export interface ForgotPasswordInput {
  email: string;
}

export interface ResetPasswordInput {
  token: string;
  newPassword: string;
}

export interface ChangePasswordInput {
  currentPassword: string;
  newPassword: string;
}

// ============ Category Types ============
export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryTree extends Category {
  children: CategoryTree[];
}

export interface CreateCategoryInput {
  name: string;
  slug?: string;
  description?: string;
  parentId?: string;
  sortOrder?: number;
}

export interface UpdateCategoryInput {
  name?: string;
  slug?: string;
  description?: string;
  parentId?: string | null;
  sortOrder?: number;
}

// ============ Product Types ============
export interface Product {
  id: string;
  sku: string;
  name: string;
  description: string;
  /** The price for this viewer: general for visitors, wholesale for logged-in users. */
  price: string;
  /** The general price, when it's higher than `price` (logged-in users only). */
  listPrice: string | null;
  imageUrl: string | null;
  thumbnailUrl: string | null;
  videoUrl: string | null;
  weight: string | null;
  dimensionLength: string | null;
  dimensionWidth: string | null;
  dimensionHeight: string | null;
  categoryId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProductFilters {
  page?: number;
  limit?: number;
  search?: string;
  categoryId?: string;
  categorySlug?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  sortBy?: "name" | "price" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
}

// ============ Cart Types ============
export interface CartItemProduct {
  id: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  price: string;
  listPrice: string | null;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  priceAtAdd: string;
  /** The general price, crossed out next to priceAtAdd, when it's higher (logged-in users only). */
  listPrice: string | null;
  /** False when the product can no longer be ordered; the checkout refuses the cart until it is removed. */
  isAvailable?: boolean;
  product: CartItemProduct;
  createdAt: string;
  updatedAt: string;
}

export interface Cart {
  id: string;
  userId: string | null;
  sessionId: string | null;
  items: CartItem[];
  itemCount: number;
  subtotal: string;
  createdAt: string;
  updatedAt: string;
}

export interface AddToCartInput {
  productId: string;
  quantity?: number;
}

export interface UpdateCartItemInput {
  quantity: number;
}

export interface MergeCartInput {
  sessionId: string;
}

// ============ Checkout Types ============
export interface CheckoutContactInput {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  customerNotes?: string;
}

export interface CheckoutReviewItem {
  productId: string;
  name: string;
  sku: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  totalPrice: string;
}

export interface CheckoutReview {
  /** The institution the order is placed for, as the order will store it. */
  institution: {
    name: string;
    cuit: string | null;
    legalName: string | null;
    ivaStatus: IvaStatus | null;
  };
  contact: CheckoutContactInput;
  items: CheckoutReviewItem[];
  subtotal: string;
  total: string;
}

export interface CheckoutConfirmation {
  orderId: string;
  orderNumber: string;
  total: string;
  message: string;
}

// ============ Order Types ============
export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipped"
  | "delivered"
  | "cancelled";

export interface OrderItem {
  id: string;
  productId: string | null;
  productSku: string;
  productName: string;
  quantity: number;
  unitPrice: string;
  totalPrice: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string | null;
  status: OrderStatus;
  contactFullName: string;
  contactEmail: string;
  contactPhone: string;
  contactAddress: string;
  subtotal: string;
  total: string;
  customerNotes: string | null;
  internalNotes: string | null;
  items: OrderItem[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderFilters {
  page?: number;
  limit?: number;
  status?: OrderStatus;
  userId?: string;
}

export interface UpdateOrderStatusInput {
  status: OrderStatus;
  internalNotes?: string;
}

// ============ Storefront Config Types ============
export interface StorefrontBranding {
  storeName: string;
  tagline: string;
  headerLogoUrl: string;
  footerLogoUrl: string;
  faviconUrl: string;
}

export interface StorefrontColors {
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  text: string;
  textMuted: string;
}

export interface HeroBanner {
  id: string;
  imageUrl: string;
  mobileImageUrl?: string;
  altText?: string;
  title?: string;
  subtitle?: string;
  ctaText?: string;
  ctaLink?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface SlimBanner {
  id: string;
  imageUrl: string;
  link?: string;
  position: "top" | "bottom" | "sidebar";
  isActive: boolean;
  sortOrder: number;
}

export interface StorefrontFaq {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
}

export interface StorefrontContact {
  whatsappNumber: string;
  email: string;
  phone: string;
  address: string;
  socialLinks: Record<string, string> & {
    whatsapp?: string;
  };
}

export interface StorefrontSeo {
  metaTitle: string;
  metaDescription: string;
  ogImage: string;
}

export interface StorefrontOrdering {
  /** Shown on the product page, the cart and the checkout review. */
  availabilityNotice: string;
  /** Shown on the cart and the checkout review; empty means no line. */
  minimumOrderNotice: string;
}

export interface StorefrontLegal {
  termsMarkdown: string;
  lastUpdated?: string;
}

export interface StorefrontConfig {
  version: string;
  lastUpdated: string;
  branding: StorefrontBranding;
  colors: StorefrontColors;
  banners: {
    hero: HeroBanner[];
    slim: SlimBanner[];
  };
  faq: StorefrontFaq[];
  contact: StorefrontContact;
  seo: StorefrontSeo;
  ordering?: StorefrontOrdering;
  legal?: StorefrontLegal;
}

// ============ Import Types ============
export type ImportStatus =
  | "pending"
  | "processing"
  | "completed"
  | "failed"
  | "cancelled";

export interface ImportJob {
  id: string;
  userId: string;
  filename: string;
  fileKey: string;
  fileSize: number;
  status: ImportStatus;
  totalRows: number;
  processedRows: number;
  successRows: number;
  errorRows: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============ Carousel Types ============
export type CarouselType = "manual" | "category";

export interface Carousel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  type: CarouselType;
  categoryId: string | null;
  sortOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CarouselItem {
  id: string;
  carouselId: string;
  productId: string;
  sortOrder: number;
  createdAt: string;
}

export interface CarouselWithProducts extends Carousel {
  products: Product[];
  category?: Category;
}
