import { test } from 'node:test';
import assert from 'node:assert/strict';
import { shoppingList, validPlan, amountLabel } from '../src/domain.ts';
test('soma ingredientes compartilhados e respeita porções', () => {
  const list = shoppingList({
    '0-1': { recipeId: 'bowl-colorido', servings: 4 },
    '1-1': { recipeId: 'salada-fresca', servings: 2 },
  });
  assert.equal(list.find((i) => i.name === 'Tomate')?.amount, 6);
  assert.equal(list.find((i) => i.name === 'Grão-de-bico cozido')?.amount, 600);
  assert.equal(list.find((i) => i.name === 'Arroz')?.amount, 320);
  assert.equal(list.filter((i) => i.name === 'Tomate').length, 1);
});
test('sem refeições não há compras; água não entra na lista', () => {
  assert.deepEqual(shoppingList({}), []);
  assert.ok(
    !shoppingList({ '0-2': { recipeId: 'sopa-tomate', servings: 2 } }).some(
      (i) => i.name === 'Água',
    ),
  );
});
test('recuperação de armazenamento rejeita dados inválidos', () => {
  assert.deepEqual(
    validPlan({
      '0-1': { recipeId: 'bowl-colorido', servings: 2 },
      '7-0': { recipeId: 'bowl-colorido', servings: 2 },
      '1-1': { recipeId: 'inexistente', servings: 2 },
      '2-1': { recipeId: 'bowl-colorido', servings: 0 },
      '3-1': { recipeId: 'bowl-colorido', servings: 9 },
      '4-1': { recipeId: 'bowl-colorido', servings: 1.5 },
    }),
    { '0-1': { recipeId: 'bowl-colorido', servings: 2 } },
  );
  assert.deepEqual(validPlan(null), {});
  assert.deepEqual(validPlan([]), {});
});
test('quantidades fracionadas usam formatação brasileira', () => {
  assert.equal(amountLabel(1.5, 'un.'), '1,5 un.');
});
