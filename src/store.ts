import { computed, ref, watch } from 'vue';
import { initialPlan, recipes } from './data';
import type { Plan } from './data';
import { validPlan, shoppingList } from './domain';
export function monday(date = new Date()) {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 12);
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d;
}
export function weekKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
interface State {
  version: 1;
  plans: Record<string, Plan>;
  favorites: string[];
  checked: Record<string, string[]>;
}
export function useKitchen() {
  const start = monday();
  const initial: State = {
    version: 1,
    plans: { [weekKey(start)]: structuredClone(initialPlan) },
    favorites: [],
    checked: {},
  };
  let loaded = initial;
  const storageError = ref(false);
  try {
    const raw = localStorage.getItem('mise-kitchen');
    if (raw) {
      const p = JSON.parse(raw);
      if (p.version === 1) {
        const plans: Record<string, Plan> = {};
        if (p.plans && typeof p.plans === 'object')
          for (const [key, value] of Object.entries(p.plans)) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(key)) plans[key] = validPlan(value);
          }
        const checked: Record<string, string[]> = {};
        if (p.checked && typeof p.checked === 'object')
          for (const [key, value] of Object.entries(p.checked)) {
            if (/^\d{4}-\d{2}-\d{2}$/.test(key) && Array.isArray(value))
              checked[key] = value.filter((v): v is string => typeof v === 'string');
          }
        loaded = {
          version: 1,
          plans,
          favorites: Array.isArray(p.favorites)
            ? p.favorites.filter(
                (id: unknown) => typeof id === 'string' && recipes.some((r) => r.id === id),
              )
            : [],
          checked,
        };
      }
    }
  } catch {
    storageError.value = true;
  }
  const state = ref<State>(loaded);
  const weekOffset = ref(0);
  const weekStart = computed(() => {
    const d = new Date(start);
    d.setDate(d.getDate() + weekOffset.value * 7);
    return d;
  });
  const key = computed(() => weekKey(weekStart.value));
  const plan = computed(() => state.value.plans[key.value] || {});
  const groceries = computed(() => shoppingList(plan.value));
  const checked = computed(() => state.value.checked[key.value] || []);
  const favorites = computed(() => state.value.favorites);
  watch(
    state,
    (s) => {
      try {
        localStorage.setItem('mise-kitchen', JSON.stringify(s));
        storageError.value = false;
      } catch {
        storageError.value = true;
      }
    },
    { deep: true },
  );
  function setMeal(slot: string, recipeId: string, servings: number) {
    const clean = validPlan({ [slot]: { recipeId, servings } });
    if (!clean[slot]) return;
    state.value.plans[key.value] = { ...plan.value, ...clean };
    state.value.checked[key.value] = [];
  }
  function removeMeal(slot: string) {
    const copy = { ...plan.value };
    delete copy[slot];
    state.value.plans[key.value] = copy;
    state.value.checked[key.value] = [];
  }
  function toggleFavorite(id: string) {
    const index = state.value.favorites.indexOf(id);
    index === -1 ? state.value.favorites.push(id) : state.value.favorites.splice(index, 1);
  }
  function toggleChecked(item: string) {
    const list = [...checked.value];
    const index = list.indexOf(item);
    index === -1 ? list.push(item) : list.splice(index, 1);
    state.value.checked[key.value] = list;
  }
  function resetWeek(empty = false) {
    state.value.plans[key.value] = empty ? {} : structuredClone(initialPlan);
    state.value.checked[key.value] = [];
  }
  return {
    storageError,
    weekOffset,
    weekStart,
    plan,
    groceries,
    checked,
    favorites,
    setMeal,
    removeMeal,
    toggleFavorite,
    toggleChecked,
    resetWeek,
  };
}
