export type Role = 'CUSTOMER' | 'SELLER' | 'ADMIN';

export interface SessionUser {
  username: string;
  role: Role;
  roleFromToken: boolean;
  userId: number | null;
  expiresAt: number | null;
}

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  sellerEmail: string;
}
export interface ProductInput { name: string; description: string; price: number; stock: number }
export interface ProductUpdate extends ProductInput { id: number }

export interface RegisterRequest {
  firstName: string; lastName: string; username: string; password: string; role: 'CUSTOMER' | 'SELLER';
}

export interface DeliveryAddress {
  houseNumber: string; street: string; city: string; state: string; postalCode: string;
}
export interface OrderRequest {
  userId: number; productId: number; quantity: number; deliveryAddressDTO: DeliveryAddress;
}
export interface CreateOrderResponse { success: boolean; orderId: string; message: string }

/** The Order response DTO was not specified; fields are read defensively in utils/order.ts. */
export type Order = Record<string, unknown>;

export interface PaymentInit { razorpayOrderId: string; amount: number; currency: string; keyId: string }
export interface VerifyPaymentRequest { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }

export interface CartLine {
  productId: number; name: string; price: number; stock: number; quantity: number; sellerEmail: string;
}

/* ---------- AI shopping assistant ---------- */

/** A product the assistant recommended. Every field except id/name is optional: we only show what the backend actually returned. */
export interface ChatProduct { id: number; name: string; description?: string; price?: number; stock?: number }

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  products?: ChatProduct[];
  createdAt: number;
}

/** Normalised reply from ChatBotService, whatever shape the backend sends. */
export interface ChatReply { text: string; products: ChatProduct[] }
