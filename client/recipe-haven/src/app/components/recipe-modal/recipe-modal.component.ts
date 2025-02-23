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
  styleUrls: ['./recipe-modal.component.scss'],
})
export class RecipeModalComponent {
  @Input() recipe: Recipe | null = null; // Input for editing, null for adding
  @Output() closeModal = new EventEmitter<void>();
  @Output() saveRecipe = new EventEmitter<Recipe>();
  @Input() isViewOnlyRecipe: boolean = false;
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
    /* Init the recipeForm */
    this.recipeForm = this.fb.group({
      title: ['', Validators.required],
      featuredImage: [''],
      ingredients: this.fb.array([]),
      steps: this.fb.array([]),
    });

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
      this.isViewOnlyRecipe = false;
    }
  }

  onClose() {
    this.closeModal.emit();
    this.recipeForm.reset();
    this.isViewOnlyRecipe = false;
  }

  closeModalParent(event: any) {
    // Check if outside was clicked
    if (event.target === event.currentTarget) {
      this.onClose();
    }
  }

  toggleComplete(e: Event) {
    if (e.target instanceof HTMLElement) {
      e.target.classList.toggle('completed');
    }
  }
}
