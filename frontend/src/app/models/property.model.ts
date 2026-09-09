export interface Property {
  id?: number;              // Database automatically generate karega
  name: string;             // Ardente Office One
  permalink: string;        // https://mypropty.in/properties/ardente-office-one
  type: string;             // Rent ya Sale
  description: string;      // Detail text
  is_featured: boolean;     // Toggle switch (True/False)
  priority: number;         // Featured Priority (Jaise 10 dikh raha hai)
  status: string;           // Renting, Published, etc.
  moderation_status: string; // Approved, Pending
  price?: string;           // Optional: Size ya amount ke liye
  location?: string;        // Optional: Whitefield, etc.
}