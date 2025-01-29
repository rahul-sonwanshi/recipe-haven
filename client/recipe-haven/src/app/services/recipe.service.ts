import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Recipe } from '../interfaces/common.interface';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root',
})
export class RecipeService {
  private apiUrl = 'http://localhost:3000/api/recipes';

  constructor(private http: HttpClient, private authService: AuthService) {}

  generateHeaders() {
    const token = this.authService.getAuthToken();
    const headers = new HttpHeaders({
      Authorization: `Bearer ${token}`, // auth token in localstorage
    });
    return headers;
  }

  getRecipes(): Observable<Recipe[]> {
    const headers = this.generateHeaders();
    return this.http.get<Recipe[]>(this.apiUrl, { headers });
  }

  createRecipe(recipeData: Recipe): Observable<Recipe> {
    const headers = this.generateHeaders();
    return this.http.post<Recipe>(this.apiUrl, recipeData, { headers });
  }

  updateRecipe(recipe: Recipe, recipeId: string | undefined): Observable<any> {
    delete recipe._id;
    const headers = this.generateHeaders();
    return this.http.put(`${this.apiUrl}/${recipeId}`, recipe, { headers });
  }

  deleteRecipe(recipeId: string): Observable<any> {
    const headers = this.generateHeaders();
    return this.http.delete(`${this.apiUrl}/${recipeId}`, { headers });
  }

  rateRecipe(
    recipeId: string,
    userId: string,
    rating: number
  ): Observable<Recipe> {
    const headers = this.generateHeaders();
    return this.http.post<Recipe>(
      `${this.apiUrl}/${recipeId}/rate`,
      {
        userId,
        rating,
      },
      { headers }
    );
  }

  searchRecipes(query: string): Observable<Recipe[]> {
    const params = new HttpParams().set('q', query);
    return this.http.get<Recipe[]>(`${this.apiUrl}/search`, { params });
  }
}
