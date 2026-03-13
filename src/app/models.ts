export type Role = 'user' | 'advertiser';

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: Role;
  avatarUrl: string;
  description: string;
  rating: number;
  reviewCount: number;
}

export interface Review {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  targetId: string; // user or advertiser id
  rating: number;
  comment: string;
  date: string;
  reply?: string;
  replyDate?: string;
}

export interface Listing {
  id: string;
  advertiserId: string;
  advertiserName: string;
  advertiserAvatar: string;
  title: string;
  description: string;
  price: string;
  tags: string[];
  rating: number;
  reviewCount: number;
  imageUrl: string;
}
