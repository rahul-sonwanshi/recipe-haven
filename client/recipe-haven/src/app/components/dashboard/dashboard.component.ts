import { Component, OnInit } from '@angular/core';
import { Recipe } from '../../interfaces/common.interface';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeModalComponent } from '../recipe-modal/recipe-modal.component';

@Component({
  selector: 'dashboard',
  imports: [FormsModule, CommonModule, RecipeModalComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  recipes: Recipe[] = [];
  searchQuery: string = '';
  newRecipe: Recipe = { title: '', ingredients: [], steps: [] };
  editingRecipe: Recipe | null = null;
  showModal: boolean = false;
  selectedRecipe: Recipe | null = null;
  constructor(private recipeService: RecipeService) {}

  ngOnInit(): void {
    this.loadRecipes();
  }

  loadRecipes() {
    this.recipeService.getRecipes().subscribe((recipes: Recipe[]) => {
      this.recipes = recipes;
    });
  }

  openModal(recipe?: Recipe) {
    this.selectedRecipe = recipe ? { ...recipe } : null;
    this.showModal = true;
    console.log('what is happening?', this.showModal);
  }

  closeModal() {
    this.showModal = false;
    this.selectedRecipe = null;
  }

  saveRecipe(recipe: Recipe) {
    if (recipe._id) {
      this.recipeService
        .updateRecipe(recipe, recipe._id)
        .subscribe(() => this.loadRecipes());
    } else {
      this.recipeService
        .createRecipe(recipe)
        .subscribe(() => this.loadRecipes());
    }
    this.closeModal();
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
      let recipeId = this.editingRecipe._id;
      delete this.editingRecipe._id;
      this.recipeService
        .updateRecipe(this.editingRecipe, recipeId)
        .subscribe(() => {
          this.editingRecipe = null;
          this.loadRecipes();
        });
    }
  }

  deleteRecipe(recipeId: string) {
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
