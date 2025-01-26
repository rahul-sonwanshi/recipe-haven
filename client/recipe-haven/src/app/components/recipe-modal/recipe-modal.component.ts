import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  Validators,
  FormsModule,
  ReactiveFormsModule,
} from '@angular/forms';
import { Recipe, Ingredient } from '../../interfaces/common.interface';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'recipe-modal',
  templateUrl: './recipe-modal.component.html',
  imports: [FormsModule, ReactiveFormsModule, CommonModule],
  styleUrls: ['./recipe-modal.component.css'],
})
export class RecipeModalComponent {
  @Input() recipe: Recipe | null = null; // Input for editing, null for adding
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveRecipe = new EventEmitter<Recipe>();

  recipeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      featuredImage: [''],
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
    });
  }

  ngOnInit() {
    if (this.recipe) {
      this.recipeForm.patchValue({
        title: this.recipe.title,
        featuredImage: this.recipe.featuredImage,
      });
      this.recipe.ingredients.forEach((ingredient) =>
        this.addIngredient(ingredient)
      );
      this.recipe.steps.forEach((step) => this.addStep(step));
    } else {
      this.addIngredient();
      this.addStep();
    }
  }

  get ingredients() {
    return this.recipeForm.get('ingredients') as FormArray;
  }

  addIngredient(ing?: Ingredient) {
    this.ingredients.push(
      this.fb.group({
        name: [ing?.name || '', Validators.required],
        quantity: [ing?.quantity || ''],
      })
    );
  }

  removeIngredient(index: number) {
    this.ingredients.removeAt(index);
  }

  get steps() {
    return this.recipeForm.get('steps') as FormArray;
  }

  addStep(step?: string) {
    this.steps.push(this.fb.control(step || '', Validators.required));
  }

  removeStep(index: number) {
    this.steps.removeAt(index);
  }

  onSave() {
    if (this.recipeForm.valid) {
      const recipeToSave = { ...this.recipe, ...this.recipeForm.value };
      this.saveRecipe.emit(recipeToSave);
      this.recipeForm.reset();
    }
  }

  onClose() {
    this.closeModal.emit();
    this.recipeForm.reset();
  }
}
