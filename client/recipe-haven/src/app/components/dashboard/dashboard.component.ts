import { Component, OnInit } from '@angular/core';
import { Recipe } from '../../interfaces/common.interface';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'dashboard',
  imports: [FormsModule, CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  recipes: Recipe[] = [];
  searchQuery: string = '';
  newRecipe: Recipe = { title: '', ingredients: [], steps: [] };
  editingRecipe: Recipe | null = null;
  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipeService.getRecipes().subscribe((recipes: Recipe[]) => {
      this.recipes = recipes;
    });
  }

  createRecipe() {
    this.recipeService.createRecipe(this.newRecipe).subscribe(() => {
      this.newRecipe = { title: '', ingredients: [], steps: [] };
      this.loadRecipes();
    });
  }

  editRecipe(recipe: Recipe) {
    this.editingRecipe = { ...recipe };
  }

  updateRecipe() {
    if (this.editingRecipe) {
      this.recipeService.updateRecipe(this.editingRecipe).subscribe(() => {
        this.editingRecipe = null;
        this.loadRecipes();
      });
    }
  }

  deleteRecipe(recipeId: string) {
    console.log(recipeId, 'wah');
    this.recipeService.deleteRecipe(recipeId).subscribe(() => {
      this.loadRecipes();
    });
  }

  /* Searching the recipe */
  searchRecipes() {
    if (this.searchQuery) {
      this.recipeService
        .searchRecipes(this.searchQuery)
        .subscribe((recipes) => {
          this.recipes = recipes;
        });
    } else {
      this.loadRecipes(); // If search query is empty, load all recipes
    }
  }
}
