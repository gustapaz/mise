<script setup lang="ts">
import Icon from './Icon.vue';
import FoodImage from './FoodImage.vue';
import type { Recipe } from '../data';
defineProps<{ recipe: Recipe; favorite: boolean }>();
defineEmits<{ open: [recipe: Recipe]; favorite: [id: string]; plan: [recipe: Recipe] }>();
</script>
<template>
  <article class="recipe-card">
    <div class="recipe-visual" :style="{ background: recipe.color }">
      <button
        class="recipe-photo"
        @click="$emit('open', recipe)"
        :aria-label="`Ver receita: ${recipe.name}`"
      >
        <FoodImage :name="recipe.image" :alt="recipe.name" /></button
      ><span class="food-tag"><Icon name="leaf" :size="13" />{{ recipe.tag }}</span
      ><button
        class="favorite icon-btn"
        :class="{ active: favorite }"
        :aria-pressed="favorite"
        :aria-label="`${favorite ? 'Remover dos' : 'Adicionar aos'} favoritos: ${recipe.name}`"
        @click="$emit('favorite', recipe.id)"
      >
        <Icon name="heart" :size="18" />
      </button>
    </div>
    <div class="recipe-content">
      <span class="eyebrow">{{ recipe.category }}</span>
      <h3>
        <button @click="$emit('open', recipe)">{{ recipe.name }}</button>
      </h3>
      <p>{{ recipe.subtitle }}</p>
      <div class="recipe-bottom">
        <span><Icon name="clock" :size="15" />{{ recipe.time }} min</span
        ><span><Icon name="users" :size="15" />{{ recipe.servings }} porções</span
        ><button
          class="small-add"
          :aria-label="`Planejar ${recipe.name}`"
          @click="$emit('plan', recipe)"
        >
          <Icon name="plus" :size="18" />
        </button>
      </div>
    </div>
  </article>
</template>
