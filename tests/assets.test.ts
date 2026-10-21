import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { recipes } from '../src/data.ts';
test('todas as receitas têm preparo completo e imagens locais responsivas', () => {
  assert.equal(new Set(recipes.map((r) => r.id)).size, recipes.length);
  for (const recipe of recipes) {
    assert.ok(recipe.steps.length >= 3);
    assert.ok(recipe.ingredients.length >= 3);
    for (const size of [400, 600, 1200])
      assert.ok(
        existsSync(`public/images/${recipe.image}-${size}.webp`),
        `${recipe.id}: imagem ${size}`,
      );
  }
});
