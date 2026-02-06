import { Doc } from "../../convex/_generated/dataModel";

export type Profile = Doc<'profiles'>;
export type Product = Doc<'products'>;
export type Collection = Doc<'collections'>;

export type ProductData = {
  brand?: string;
  name?: string;
  description?: string;
  imageUrl?: string;
  url?: string;
  price?: number;
  currency?: string;
  size?: string;
  color?: string;
}