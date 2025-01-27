import { Component, OnInit } from '@angular/core';
import { Recipe } from '../../interfaces/common.interface';
import { RecipeService } from '../../services/recipe.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RecipeModalComponent } from '../recipe-modal/recipe-modal.component';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';

@Component({
  selector: 'dashboard',
  imports: [FormsModule, CommonModule, RecipeModalComponent, SafeUrlPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})
export class DashboardComponent implements OnInit {
  recipes: Recipe[] = [];
  searchQuery: string = '';
  newRecipe: Recipe = {
    title: '',
    featuredImage: 'assets/images/defaultRecipe.jpg',
    ingredients: [],
    steps: [],
  };
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
      this.newRecipe = {
        title: '',
        featuredImage: 'assets/images/defaultRecipe.jpg',
        ingredients: [],
        steps: [],
      };
      this.loadRecipes();
    });
  }

  editRecipe(recipe: Recipe) {
    this.editingRecipe = { ...recipe };
  }

  updateRecipe() {
    if (this.editingRecipe) {
      this.recipeService
        .updateRecipe(this.editingRecipe, this.editingRecipe._id)
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
