export interface PageResponse<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  isLast: boolean;
}

export interface User {
  id: number;
  name: string;
  email: string;
  password?: string;
  avatarUrl?: string;
  description: string;
  rating: number;
  reviewCount: number;
}

export interface ReplyDto {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  comment: string;
  createdAt: string;
  replies: ReplyDto[];
}

export interface Review {
  id: number;
  authorId: number;
  authorName: string;
  authorAvatar: string;
  targetId: number;
  rating: number;
  comment: string;
  date: string;
  replies: ReplyDto[];
}

export interface Listing {
  id: number;
  advertiserId: number;
  advertiserName: string;
  advertiserAvatar: string;
  title: string;
  description: string;
  price: number;
  unitAmount?: number;
  type: 'ITEM' | 'SERVICE';
  tags: string[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
}

export interface CartItemDto {
  id?: number;
  listingId: number;
  title: string;
  unitPrice: number;
  quantity: number;
  subtotal: number;
  imageUrl?: string;
}

export interface CartDto {
  id?: number;
  items: CartItemDto[];
  totalPrice: number;
}

export interface AddToCartRequest {
  listingId: number;
  quantity: number;
  bookingDate?: string;
}

export type DeliveryMethod = 'SHIPPING' | 'PICKUP';
export type OrderStatus = 'PENDING' | 'SHIPPED' | 'READY_FOR_PICKUP' | 'COMPLETED' | 'CANCELLED';

export interface CheckoutRequest {
  deliveryMethod?: DeliveryMethod;
}

export interface OrderItemDto {
  listingId: number;
  title: string;
  type: 'ITEM' | 'SERVICE';
  quantity: number;
  unitPrice: number;
  bookingDate?: string;
}

export interface OrderResponse {
  id: number;
  totalPrice: number;
  deliveryMethod?: DeliveryMethod;
  status: OrderStatus;
  trackingNumber?: string;
  createdAt: string;
  items: OrderItemDto[];
}

export interface NotificationDto {
  id: number;
  message: string;
  orderId?: number;
  isRead: boolean;
  createdAt: string;
}
