export interface Ingredient {
  name: string;
  quantity: string;
}

export interface Rating {
  userId: string;
  rating: number;
}
export interface Recipe {
  _id?: string;
  title: string;
  featuredImage: string;
  ingredients: Ingredient[];
  steps: string[];
  ratings?: Rating[];
  averageRating?: number;
  createdAt?: Date;
  updatedAt?: Date;
}
