import { Types } from "mongoose";

// 1. Sub-interfaces for nested objects
export interface ListingFeatures {
  bedrooms: number;
  bathrooms: number;
  sizeSqm?: number;
}

export interface ListingTerms {
  leaseTerm?: string | null;
}

export interface ListingSmartLock {
  hasSmartLock: boolean;
  accessInstructions?: string; // Optional because it's select: false
}

// 2. The Database Document Type (What comes out of MongoDB)
export interface ListingDocument {
  _id: Types.ObjectId;
  propertyId: Types.ObjectId; // Raw ID
  slug: string;
  listingType: 'For_Rent' | 'For_Sale';
  status: 'Available' | 'Pending' | 'Rented' | 'Sold';
  price: number;
  title: string;
  description: string;
  features: ListingFeatures;
  terms: ListingTerms;
  smartLock: ListingSmartLock;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// 3. The Populated/Frontend Type (What you actually use in your UI)
// This extends the document but changes the propertyId to a full object
export interface IProperty extends Omit<ListingDocument, 'propertyId' | '_id'> {
  id: string; // Mapped from _id
  property: {
    propertyType: string;
    location: string; // Or your specific location type
  };
}