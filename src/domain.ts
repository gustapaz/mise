import { recipes } from './data.ts';
import type { Plan, Ingredient } from './data.ts';
export interface ShoppingItem extends Ingredient {
  key: string;
}
export function shoppingList(plan: Plan): ShoppingItem[] {
  const map = new Map<string, ShoppingItem>();
  for (const meal of Object.values(plan)) {
    const recipe = recipes.find((r) => r.id === meal.recipeId);
    if (!recipe) continue;
    for (const item of recipe.ingredients) {
      if (item.name === 'Água') continue;
      const key = `${item.name}|${item.unit}`;
      const amount = (item.amount * meal.servings) / recipe.servings;
      const prev = map.get(key);
      map.set(key, {
        ...item,
        key,
        amount: Math.round(((prev?.amount || 0) + amount) * 100) / 100,
      });
    }
  }
  return [...map.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
}
export function validPlan(value: unknown): Plan {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {};
  const result: Plan = {};
  for (const [key, entry] of Object.entries(value)) {
    if (!/^[0-6]-[0-2]$/.test(key) || !entry || typeof entry !== 'object') continue;
    const meal = entry as { recipeId: unknown; servings: unknown };
    if (
      typeof meal.recipeId === 'string' &&
      recipes.some((r) => r.id === meal.recipeId) &&
      typeof meal.servings === 'number' &&
      Number.isInteger(meal.servings) &&
      meal.servings >= 1 &&
      meal.servings <= 8
    )
      result[key] = { recipeId: meal.recipeId, servings: meal.servings };
  }
  return result;
}
export function amountLabel(amount: number, unit: string) {
  return `${amount.toLocaleString('pt-BR', { maximumFractionDigits: 2 })} ${unit}`;
}
