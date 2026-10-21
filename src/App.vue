<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue';
import Icon from './components/Icon.vue';
import FoodImage from './components/FoodImage.vue';
import RecipeCard from './components/RecipeCard.vue';
import { recipes, days, slots } from './data';
import type { Recipe } from './data';
import { amountLabel } from './domain';
import { useKitchen } from './store';
const kitchen = useKitchen();
const {
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
} = kitchen;
const links = [
  { id: 'inicio', label: 'Visão geral', icon: 'home' },
  { id: 'receitas', label: 'Explorar receitas', icon: 'book' },
  { id: 'planejador', label: 'Meu cardápio', icon: 'calendar' },
  { id: 'compras', label: 'Lista de compras', icon: 'bag' },
  { id: 'favoritos', label: 'Favoritos', icon: 'heart' },
];
const validRoutes = [...links.map((l) => l.id), 'sobre'];
const readRoute = () => {
  const id = location.hash.slice(1);
  return validRoutes.includes(id) ? id : 'inicio';
};
const route = ref(readRoute());
const menuOpen = ref(false);
const mobile = ref(false);
const sidebar = ref<HTMLElement>();
const mobileQuery = window.matchMedia('(max-width:700px)');
const updateMobile = () => {
  mobile.value = mobileQuery.matches;
  if (!mobile.value) menuOpen.value = false;
};
const search = ref('');
const category = ref('Todas');
const quickOnly = ref(false);
const diet = ref('Todos');
const selectedDay = ref((new Date().getDay() + 6) % 7);
const main = ref<HTMLElement>();
const searchField = ref<HTMLInputElement>();
const toast = ref('');
let toastTimer: ReturnType<typeof setTimeout>;
const title = computed(() =>
  route.value === 'sobre'
    ? 'Sobre o Mise'
    : links.find((l) => l.id === route.value)?.label || 'Visão geral',
);
const routeChange = () => {
  route.value = readRoute();
  menuOpen.value = false;
};
watch(route, async () => {
  document.title = `${title.value} — Mise`;
  await nextTick();
  main.value?.focus();
  window.scrollTo({ top: 0, behavior: 'instant' });
});
function navigate(id: string) {
  if (route.value === id) {
    menuOpen.value = false;
    return;
  }
  location.hash = id;
}
function notify(message: string) {
  toast.value = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => (toast.value = ''), 3600);
}
function favorite(id: string) {
  toggleFavorite(id);
  notify(
    favorites.value.includes(id)
      ? 'Receita guardada nos favoritos.'
      : 'Receita removida dos favoritos.',
  );
}
const filtered = computed(() =>
  recipes.filter(
    (r) =>
      (route.value !== 'favoritos' || favorites.value.includes(r.id)) &&
      (category.value === 'Todas' || r.category === category.value) &&
      (!quickOnly.value || r.time <= 20) &&
      (diet.value === 'Todos' || r.tag === diet.value) &&
      `${r.name} ${r.subtitle} ${r.ingredients.map((i) => i.name).join(' ')}`
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .includes(
          search.value
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .trim(),
        ),
  ),
);
function clearFilters() {
  search.value = '';
  category.value = 'Todas';
  quickOnly.value = false;
  diet.value = 'Todos';
}
const weekDates = computed(() =>
  days.map((_, index) => {
    const d = new Date(weekStart.value);
    d.setDate(d.getDate() + index);
    return d;
  }),
);
const dateFormat = (d: Date) =>
  d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }).replace('.', '');
const weekLabel = computed(
  () => `${dateFormat(weekDates.value[0]!)} — ${dateFormat(weekDates.value[6]!)}`,
);
const mealCount = computed(() => Object.keys(plan.value).length);
const completeDays = computed(
  () => days.filter((_, d) => slots.every((_, s) => plan.value[`${d}-${s}`])).length,
);
const groceryGroups = computed(() =>
  ['Hortifruti', 'Mercearia', 'Refrigerados']
    .map((name) => ({ name, items: groceries.value.filter((i) => i.group === name) }))
    .filter((g) => g.items.length),
);
const bought = computed(() => groceries.value.filter((i) => checked.value.includes(i.key)).length);
const recipeFor = (key: string) => recipes.find((r) => r.id === plan.value[key]?.recipeId);
const uniqueRecipes = computed(
  () => new Set(Object.values(plan.value).map((m) => m.recipeId)).size,
);
const modal = ref<HTMLDialogElement>();
const modalType = ref<'recipe' | 'add' | 'pick' | 'reset'>('recipe');
const selectedRecipe = ref<Recipe>(recipes[0]!);
const portions = ref(2);
const addDay = ref(0);
const addSlot = ref(1);
const pickerSearch = ref('');
const completedSteps = ref<number[]>([]);
let modalTrigger: HTMLElement | null = null;
const pickerRecipes = computed(() =>
  recipes.filter((r) => r.name.toLowerCase().includes(pickerSearch.value.toLowerCase())),
);
async function showModal(
  type: typeof modalType.value,
  recipe?: Recipe,
  day?: number,
  slot?: number,
) {
  modalTrigger = document.activeElement as HTMLElement;
  modalType.value = type;
  if (recipe) {
    selectedRecipe.value = recipe;
    portions.value = recipe.servings;
    completedSteps.value = [];
  }
  addDay.value = day ?? selectedDay.value;
  addSlot.value = slot ?? (recipe ? Math.max(0, slots.indexOf(recipe.category)) : 1);
  pickerSearch.value = '';
  await nextTick();
  if (!modal.value?.open) modal.value?.showModal();
}
function closeModal() {
  modal.value?.close();
}
function restoreFocus() {
  modalTrigger?.focus();
}
function showRecipe(recipe: Recipe) {
  showModal('recipe', recipe);
}
function startPlan(recipe: Recipe) {
  showModal('add', recipe);
}
async function pickRecipe(recipe: Recipe) {
  selectedRecipe.value = recipe;
  portions.value = recipe.servings;
  modalType.value = 'add';
  await nextTick();
  modal.value?.querySelector<HTMLSelectElement>('select')?.focus();
}
function saveMeal() {
  setMeal(`${addDay.value}-${addSlot.value}`, selectedRecipe.value.id, portions.value);
  closeModal();
  notify(
    `${selectedRecipe.value.name} entrou no cardápio de ${days[addDay.value]!.toLowerCase()}.`,
  );
}
function deleteMeal(key: string) {
  removeMeal(key);
  notify('Refeição removida. A lista de compras foi atualizada.');
}
function toggleStep(index: number) {
  completedSteps.value = completedSteps.value.includes(index)
    ? completedSteps.value.filter((i) => i !== index)
    : [...completedSteps.value, index];
}
function exportShopping() {
  const text = `MISE — LISTA DE COMPRAS\nSemana: ${weekLabel.value}\n\n${groceryGroups.value.map((g) => `${g.name.toUpperCase()}\n${g.items.map((i) => `[${checked.value.includes(i.key) ? 'x' : ' '}] ${i.name} — ${amountLabel(i.amount, i.unit)}`).join('\n')}`).join('\n\n')}\n\nLista gerada localmente. Imagens e receitas demonstrativas.\n`;
  download('mise-lista-de-compras.txt', text);
}
function exportPlan() {
  const text = `MISE — MEU CARDÁPIO\n${weekLabel.value}\n\n${days
    .map(
      (day, d) =>
        `${day.toUpperCase()}\n${slots
          .map((slot, s) => {
            const key = `${d}-${s}`;
            return `${slot}: ${recipeFor(key)?.name || 'Livre'}${plan.value[key] ? ` (${plan.value[key]!.servings} porções)` : ''}`;
          })
          .join('\n')}`,
    )
    .join('\n\n')}\n`;
  download('mise-cardapio.txt', text);
}
function download(name: string, text: string) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  notify('Seu arquivo foi preparado para download.');
}
function globalSearch() {
  clearFilters();
  navigate('receitas');
}
function submitSearch() {
  category.value = 'Todas';
  quickOnly.value = false;
  diet.value = 'Todos';
  navigate('receitas');
}
watch(menuOpen, async (open) => {
  await nextTick();
  if (open) sidebar.value?.querySelector<HTMLButtonElement>('.sidebar-close')?.focus();
  else if (mobile.value && sidebar.value?.contains(document.activeElement))
    document.querySelector<HTMLButtonElement>('.mobile-menu')?.focus();
});
function keydown(e: KeyboardEvent) {
  if (e.key === 'Escape' && menuOpen.value) {
    menuOpen.value = false;
    document.querySelector<HTMLButtonElement>('.mobile-menu')?.focus();
  }
  if (e.key === 'Tab' && menuOpen.value && mobile.value) {
    const items = sidebar.value?.querySelectorAll<HTMLElement>('a[href],button:not([disabled])');
    if (items?.length) {
      const first = items[0],
        last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last?.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first?.focus();
      }
    }
  }
  if (
    e.key === '/' &&
    !modal.value?.open &&
    !menuOpen.value &&
    !['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement)?.tagName)
  ) {
    e.preventDefault();
    searchField.value?.focus();
  }
}
onMounted(() => {
  updateMobile();
  mobileQuery.addEventListener('change', updateMobile);
  window.addEventListener('hashchange', routeChange);
  window.addEventListener('keydown', keydown);
  document.title = `${title.value} — Mise`;
});
onUnmounted(() => {
  mobileQuery.removeEventListener('change', updateMobile);
  window.removeEventListener('hashchange', routeChange);
  window.removeEventListener('keydown', keydown);
  clearTimeout(toastTimer);
});
</script>

<template>
  <a class="skip-link" href="#main" @click.prevent="main?.focus()">Pular para o conteúdo</a>
  <div class="app-shell">
    <aside
      id="main-navigation"
      ref="sidebar"
      class="sidebar"
      :class="{ open: menuOpen }"
      :inert="mobile && !menuOpen"
    >
      <button
        class="sidebar-close icon-btn"
        aria-label="Fechar navegação"
        @click="menuOpen = false"
      >
        <Icon name="close" /></button
      ><a class="brand" href="#inicio" aria-label="Mise, início" @click.prevent="navigate('inicio')"
        ><span class="brand-mark"><Icon name="leaf" :size="25" /></span>mise<span class="brand-dot"
          >.</span
        ></a
      >
      <p class="brand-caption">Um lugar para sua cozinha.</p>
      <span class="nav-label">NA SUA MESA</span>
      <nav aria-label="Principal">
        <a
          v-for="link in links"
          :key="link.id"
          :href="`#${link.id}`"
          :aria-current="route === link.id ? 'page' : undefined"
          @click.prevent="navigate(link.id)"
          ><Icon :name="link.icon" /><span>{{ link.label }}</span
          ><small v-if="link.id === 'compras' && groceries.length">{{ groceries.length }}</small
          ><small v-if="link.id === 'favoritos' && favorites.length">{{
            favorites.length
          }}</small></a
        >
      </nav>
      <div class="sidebar-note">
        <span class="little-flower">✳</span>
        <h3>Planejar é um<br />carinho com você.</h3>
        <p>Um pouco de organização, muito mais tempo à mesa.</p>
        <a href="#planejador" @click.prevent="navigate('planejador')"
          >Vamos planejar <Icon name="arrow" :size="15"
        /></a>
      </div>
      <a
        class="about-link"
        href="#sobre"
        @click.prevent="navigate('sobre')"
        :aria-current="route === 'sobre' ? 'page' : undefined"
        ><Icon name="info" :size="18" />Sobre esta experiência</a
      >
      <div class="local-profile">
        <span>MC</span>
        <div><strong>Minha cozinha</strong><small>Salvo neste dispositivo</small></div>
        <span class="online-dot" aria-label="Armazenamento local" />
      </div>
    </aside>
    <div v-if="menuOpen" class="menu-backdrop" @click="menuOpen = false"></div>
    <div class="main-shell">
      <header class="topbar">
        <button
          class="mobile-menu icon-btn"
          aria-controls="main-navigation"
          :aria-expanded="menuOpen"
          aria-label="Abrir navegação"
          @click="menuOpen = !menuOpen"
        >
          <Icon name="menu" />
        </button>
        <div class="breadcrumb">
          Minha cozinha <Icon name="chevron" :size="13" /><strong>{{ title }}</strong>
        </div>
        <form class="global-search" role="search" @submit.prevent="submitSearch">
          <Icon name="search" :size="18" /><label class="sr-only" for="global-search"
            >Buscar receitas ou ingredientes</label
          ><input
            id="global-search"
            ref="searchField"
            v-model="search"
            placeholder="O que vamos cozinhar?"
            type="search"
          /><kbd>/</kbd>
        </form>
        <span class="demo-pill"><span></span> Modo demonstração</span>
      </header>
      <main id="main" ref="main" tabindex="-1">
        <div v-if="storageError" class="storage-alert" role="status">
          <Icon name="info" :size="18" />O armazenamento está indisponível. Suas alterações
          funcionam nesta sessão, mas podem não ser salvas.
        </div>

        <template v-if="route === 'inicio'">
          <div class="page-heading">
            <div>
              <p class="eyebrow coral">
                <Icon name="sun" :size="15" /> BOAS IDEIAS COMEÇAM NA COZINHA
              </p>
              <h1>
                Menos improviso.<br class="mobile-break" />
                Mais <span class="serif">sabor.</span>
              </h1>
              <p>Sua semana mais leve, uma refeição de cada vez.</p>
            </div>
            <button class="button primary" @click="navigate('planejador')">
              <Icon name="plus" :size="18" />Planejar minha semana
            </button>
          </div>
          <section class="welcome-banner" aria-labelledby="welcome-title">
            <div class="banner-copy">
              <span class="soft-label"
                ><Icon name="spark" :size="14" /> O segredo é se organizar</span
              >
              <h2 id="welcome-title">
                O que tem de bom<br />na sua <span class="serif">semana?</span>
              </h2>
              <p>
                Receitas que combinam com a rotina.<br />Uma lista pronta. E tempo para aproveitar.
              </p>
              <button class="button dark" @click="globalSearch">
                Encontrar minha próxima receita <Icon name="arrow" :size="17" />
              </button>
            </div>
            <div class="hero-food">
              <div class="orbit orbit-one"></div>
              <div class="orbit orbit-two"></div>
              <FoodImage name="bowl" alt="Bowl colorido com vegetais e grãos" hero /><span
                class="floating-label label-top"
                ><Icon name="leaf" :size="15" />Simples de fazer</span
              ><span class="floating-label label-bottom"
                ><span class="sunny">✳</span>Bom de compartilhar</span
              >
            </div>
            <span class="banner-doodle" aria-hidden="true">✴</span>
          </section>
          <section class="stats-grid" aria-label="Resumo do seu planejamento">
            <article>
              <span class="stat-icon peach"><Icon name="calendar" /></span>
              <div>
                <strong>{{ mealCount }}<small> / 21</small></strong>
                <p>refeições planejadas</p>
              </div>
              <span class="stat-note">Na semana</span>
            </article>
            <article>
              <span class="stat-icon green"><Icon name="book" /></span>
              <div>
                <strong>{{ uniqueRecipes }}</strong>
                <p>receitas no cardápio</p>
              </div>
              <span class="mini-spark" aria-hidden="true">✳</span>
            </article>
            <article>
              <span class="stat-icon lavender"><Icon name="bag" /></span>
              <div>
                <strong>{{ groceries.length }}</strong>
                <p>itens na lista de compras</p>
              </div>
              <button
                class="icon-btn"
                aria-label="Ver lista de compras"
                @click="navigate('compras')"
              >
                <Icon name="arrow" />
              </button>
            </article>
          </section>
          <section class="overview-plan">
            <div class="section-heading">
              <div>
                <span class="eyebrow">CADA COISA NO SEU TEMPO</span>
                <h2>Um gostinho da semana</h2>
              </div>
              <button class="text-button" @click="navigate('planejador')">
                Ver cardápio completo <Icon name="arrow" :size="17" />
              </button>
            </div>
            <div class="week-preview">
              <article v-for="(day, d) in days.slice(0, 3)" :key="day" class="preview-day">
                <div class="day-title">
                  <h3>
                    {{ day }}<span>{{ weekDates[d]!.getDate() }}</span>
                  </h3>
                  <span
                    >{{ Object.keys(plan).filter((key) => key.startsWith(`${d}-`)).length }} de 3
                    refeições</span
                  >
                </div>
                <template v-for="(slot, s) in slots" :key="slot"
                  ><button
                    v-if="recipeFor(`${d}-${s}`)"
                    class="preview-meal"
                    @click="showRecipe(recipeFor(`${d}-${s}`)!)"
                  >
                    <FoodImage
                      :name="recipeFor(`${d}-${s}`)!.image"
                      :alt="recipeFor(`${d}-${s}`)!.name"
                    />
                    <div>
                      <span>{{ slot }}</span
                      ><strong>{{ recipeFor(`${d}-${s}`)!.name }}</strong
                      ><small
                        >{{ plan[`${d}-${s}`]!.servings }} porções ·
                        {{ recipeFor(`${d}-${s}`)!.time }} min</small
                      >
                    </div>
                    <Icon name="chevron" :size="16" /></button
                  ><button v-else class="preview-empty" @click="showModal('pick', undefined, d, s)">
                    <Icon name="plus" :size="15" /><span>{{ slot }}</span
                    ><small>Escolher receita</small>
                  </button></template
                >
              </article>
            </div>
          </section>
          <section>
            <div class="section-heading">
              <div>
                <span class="eyebrow">PARA SAIR DO ÓBVIO</span>
                <h2>Seu próximo “que delícia”</h2>
              </div>
              <button class="text-button" @click="globalSearch">
                Explorar receitas <Icon name="arrow" :size="17" />
              </button>
            </div>
            <div class="recipe-grid suggested">
              <RecipeCard
                v-for="recipe in recipes.slice(0, 3)"
                :key="recipe.id"
                :recipe="recipe"
                :favorite="favorites.includes(recipe.id)"
                @open="showRecipe"
                @favorite="favorite"
                @plan="startPlan"
              />
            </div>
          </section>
          <section class="bottom-note">
            <Icon name="leaf" :size="32" />
            <div>
              <h3>Não precisa ser perfeito. Só precisa ser seu.</h3>
              <p>
                Comece com uma refeição e descubra um jeito mais simples de organizar a cozinha.
              </p>
            </div>
            <button class="text-button" @click="navigate('planejador')">
              Começar <Icon name="arrow" :size="17" />
            </button>
          </section>
        </template>

        <template v-else-if="route === 'receitas' || route === 'favoritos'">
          <div class="page-heading">
            <div>
              <p class="eyebrow coral">
                {{
                  route === 'favoritos'
                    ? 'SEU CADERNINHO DE IDEIAS'
                    : 'UM REPERTÓRIO PARA O DIA A DIA'
                }}
              </p>
              <h1>
                {{ route === 'favoritos' ? 'As suas' : 'O que vamos' }}
                <span class="serif">{{ route === 'favoritos' ? 'preferidas.' : 'cozinhar?' }}</span>
              </h1>
              <p>
                {{
                  route === 'favoritos'
                    ? 'Aquelas receitas que merecem voltar à mesa.'
                    : 'Receitas descomplicadas para cada momento do dia.'
                }}
              </p>
            </div>
            <span class="count-pill"
              >{{ route === 'favoritos' ? favorites.length : recipes.length }} receitas</span
            >
          </div>
          <div class="recipe-tools">
            <div class="category-tabs" role="group" aria-label="Categoria de receitas">
              <button
                v-for="c in ['Todas', ...slots]"
                :key="c"
                :aria-pressed="category === c"
                @click="category = c"
              >
                {{ c }}
              </button>
            </div>
            <div class="secondary-filters">
              <label class="quick-check"
                ><input v-model="quickOnly" type="checkbox" /><Icon name="clock" :size="16" />Até 20
                minutos</label
              ><label class="diet-filter"
                ><span class="sr-only">Preferência de receita</span
                ><select v-model="diet">
                  <option>Todos</option>
                  <option>Vegano</option>
                  <option>Vegetariano</option>
                </select></label
              ><button
                v-if="search || category !== 'Todas' || quickOnly || diet !== 'Todos'"
                class="text-button coral"
                @click="clearFilters"
              >
                Limpar filtros <Icon name="close" :size="14" />
              </button>
            </div>
          </div>
          <div class="results-line" role="status">
            <span
              >{{ filtered.length }}
              {{ filtered.length === 1 ? 'receita encontrada' : 'receitas encontradas'
              }}<template v-if="search"> para “{{ search }}”</template></span
            ><span>Feito em casa é outra história.</span>
          </div>
          <div v-if="filtered.length" class="recipe-grid">
            <RecipeCard
              v-for="recipe in filtered"
              :key="recipe.id"
              :recipe="recipe"
              :favorite="favorites.includes(recipe.id)"
              @open="showRecipe"
              @favorite="favorite"
              @plan="startPlan"
            />
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon"
              ><Icon
                :name="route === 'favoritos' && !favorites.length ? 'heart' : 'search'"
                :size="34"
            /></span>
            <h2>
              {{
                route === 'favoritos' && !favorites.length
                  ? 'Sua coleção começa aqui.'
                  : 'Nada por aqui. Ainda.'
              }}
            </h2>
            <p>
              {{
                route === 'favoritos' && !favorites.length
                  ? 'Toque no coração de uma receita para guardá-la.'
                  : 'Experimente outro ingrediente ou remova alguns filtros.'
              }}
            </p>
            <button
              class="button primary"
              @click="route === 'favoritos' && !favorites.length ? globalSearch() : clearFilters()"
            >
              {{
                route === 'favoritos' && !favorites.length ? 'Explorar receitas' : 'Limpar filtros'
              }}<Icon name="arrow" :size="17" />
            </button>
          </div>
        </template>

        <template v-else-if="route === 'planejador'">
          <div class="page-heading">
            <div>
              <p class="eyebrow coral">UM POUCO DE PLANO, MUITO MAIS TEMPO</p>
              <h1>Sua semana <span class="serif">à mesa.</span></h1>
              <p>Escolha suas receitas. A lista de compras fica por nossa conta.</p>
            </div>
            <button class="button outline" @click="exportPlan">
              <Icon name="download" :size="17" />Baixar cardápio
            </button>
          </div>
          <div class="planner-toolbar">
            <div class="week-selector">
              <button
                class="icon-btn"
                :disabled="weekOffset <= -12"
                aria-label="Semana anterior"
                @click="weekOffset--"
              >
                <Icon class="rotate" name="chevron" :size="17" /></button
              ><strong>{{ weekLabel }}</strong
              ><button
                class="icon-btn"
                :disabled="weekOffset >= 12"
                aria-label="Próxima semana"
                @click="weekOffset++"
              >
                <Icon name="chevron" :size="17" /></button
              ><button v-if="weekOffset !== 0" class="today-button" @click="weekOffset = 0">
                Esta semana
              </button>
            </div>
            <div class="planner-actions">
              <span>{{ mealCount }} de 21 refeições</span
              ><button class="text-button" @click="showModal('reset')">
                <Icon name="reset" :size="16" />Organizar semana
              </button>
            </div>
          </div>
          <div class="plan-progress">
            <span :style="{ width: `${(mealCount / 21) * 100}%` }"></span>
          </div>
          <div class="mobile-days" role="group" aria-label="Dia do cardápio">
            <button
              v-for="(day, d) in days"
              :key="day"
              :aria-pressed="selectedDay === d"
              @click="selectedDay = d"
            >
              <span>{{ day.slice(0, 3) }}</span
              ><strong>{{ weekDates[d]!.getDate() }}</strong
              ><i v-if="Object.keys(plan).some((k) => k.startsWith(`${d}-`))"></i>
            </button>
          </div>
          <section class="planner-grid" aria-label="Refeições da semana">
            <article
              v-for="(day, d) in days"
              :key="day"
              class="planner-day"
              :class="{ 'selected-day': selectedDay === d }"
            >
              <div class="planner-day-title">
                <h2>{{ day }}</h2>
                <span>{{ dateFormat(weekDates[d]!) }}</span>
              </div>
              <div v-for="(slot, s) in slots" :key="slot" class="meal-slot">
                <span class="slot-label"
                  ><Icon :name="s === 0 ? 'sun' : s === 1 ? 'leaf' : 'spark'" :size="13" />{{
                    slot
                  }}</span
                >
                <div v-if="recipeFor(`${d}-${s}`)" class="planned-meal">
                  <button class="planned-photo" @click="showRecipe(recipeFor(`${d}-${s}`)!)">
                    <FoodImage
                      :name="recipeFor(`${d}-${s}`)!.image"
                      :alt="recipeFor(`${d}-${s}`)!.name"
                    /></button
                  ><button class="planned-name" @click="showRecipe(recipeFor(`${d}-${s}`)!)">
                    {{ recipeFor(`${d}-${s}`)!.name }}</button
                  ><span
                    >{{ plan[`${d}-${s}`]!.servings }} porções ·
                    {{ recipeFor(`${d}-${s}`)!.time }} min</span
                  >
                  <div class="meal-controls">
                    <button
                      :aria-label="`Trocar ${slot} de ${day}`"
                      @click="showModal('pick', undefined, d, s)"
                    >
                      Trocar</button
                    ><button
                      class="icon-btn"
                      :aria-label="`Remover ${slot} de ${day}`"
                      @click="deleteMeal(`${d}-${s}`)"
                    >
                      <Icon name="trash" :size="14" />
                    </button>
                  </div>
                </div>
                <button
                  v-else
                  class="add-meal"
                  :aria-label="`Adicionar ${slot} de ${day}`"
                  @click="showModal('pick', undefined, d, s)"
                >
                  <span><Icon name="plus" :size="20" /></span>Adicionar refeição
                </button>
              </div>
            </article>
          </section>
          <div class="planner-bottom">
            <p>
              <Icon name="info" :size="17" />{{ completeDays }}
              {{ completeDays === 1 ? 'dia completo' : 'dias completos' }}. Espaços livres também
              fazem parte da rotina.
            </p>
            <button class="button primary" @click="navigate('compras')">
              Ver minha lista de compras<Icon name="arrow" :size="17" />
            </button>
          </div>
        </template>

        <template v-else-if="route === 'compras'">
          <div class="page-heading">
            <div>
              <p class="eyebrow coral">DO CARDÁPIO PARA A SACOLA</p>
              <h1>Falta só <span class="serif">ir à feira.</span></h1>
              <p>Ingredientes reunidos e quantidades somadas para sua semana.</p>
            </div>
            <button class="button outline" :disabled="!groceries.length" @click="exportShopping">
              <Icon name="download" :size="17" />Baixar lista
            </button>
          </div>
          <div class="planner-toolbar">
            <div class="week-selector">
              <button
                class="icon-btn"
                :disabled="weekOffset <= -12"
                aria-label="Semana anterior"
                @click="weekOffset--"
              >
                <Icon class="rotate" name="chevron" :size="17" /></button
              ><strong>{{ weekLabel }}</strong
              ><button
                class="icon-btn"
                :disabled="weekOffset >= 12"
                aria-label="Próxima semana"
                @click="weekOffset++"
              >
                <Icon name="chevron" :size="17" />
              </button>
            </div>
            <span>{{ mealCount }} refeições · {{ groceries.length }} ingredientes</span>
          </div>
          <div v-if="groceries.length" class="shopping-layout">
            <div class="shopping-groups">
              <section v-for="group in groceryGroups" :key="group.name" class="shopping-group">
                <h2>
                  <span
                    :class="[
                      'group-icon',
                      group.name === 'Hortifruti'
                        ? 'green'
                        : group.name === 'Mercearia'
                          ? 'peach'
                          : 'lavender',
                    ]"
                    ><Icon
                      :name="
                        group.name === 'Hortifruti'
                          ? 'leaf'
                          : group.name === 'Mercearia'
                            ? 'bag'
                            : 'sun'
                      "
                      :size="19" /></span
                  >{{ group.name }}<small>{{ group.items.length }} itens</small>
                </h2>
                <label
                  v-for="item in group.items"
                  :key="item.key"
                  class="shopping-item"
                  :class="{ bought: checked.includes(item.key) }"
                  ><input
                    type="checkbox"
                    :checked="checked.includes(item.key)"
                    @change="toggleChecked(item.key)"
                  /><span>{{ item.name }}</span
                  ><strong>{{ amountLabel(item.amount, item.unit) }}</strong></label
                >
              </section>
            </div>
            <aside class="shopping-summary">
              <span class="summary-doodle" aria-hidden="true">✳</span>
              <h2>Sacola quase <span class="serif">pronta.</span></h2>
              <div
                class="shopping-ring"
                :style="{ '--progress': `${(bought / groceries.length) * 360}deg` }"
              >
                <div>
                  <strong
                    >{{ bought }}<small>/ {{ groceries.length }}</small></strong
                  ><span>itens separados</span>
                </div>
              </div>
              <p>
                {{
                  bought === groceries.length
                    ? 'Tudo separado! Agora é só colocar a mão na massa.'
                    : 'Marque o que você já tem em casa ou colocou na sacola.'
                }}
              </p>
              <button class="button dark" @click="exportShopping">
                <Icon name="download" :size="17" />Levar minha lista
              </button>
              <div class="summary-help">
                <Icon name="info" :size="16" />
                <p>
                  Quantidades seguem as porções do cardápio. Sal e temperos a gosto não entram na
                  soma.
                </p>
              </div>
            </aside>
          </div>
          <div v-else class="empty-state">
            <span class="empty-icon"><Icon name="bag" :size="34" /></span>
            <h2>A sacola está esperando.</h2>
            <p>Adicione uma refeição ao cardápio para gerar sua lista automaticamente.</p>
            <button class="button primary" @click="navigate('planejador')">
              Planejar uma refeição <Icon name="arrow" :size="17" />
            </button>
          </div>
        </template>

        <template v-else>
          <div class="page-heading">
            <div>
              <p class="eyebrow coral">FEITO PARA SIMPLIFICAR</p>
              <h1>Um lugar para sua <span class="serif">cozinha.</span></h1>
              <p>O Mise é um projeto demonstrativo de desenvolvimento front-end.</p>
            </div>
            <span class="about-flower" aria-hidden="true">✳</span>
          </div>
          <div class="about-grid">
            <section class="about-card">
              <Icon name="leaf" :size="28" />
              <h2>Comida de verdade.<br />Dados de demonstração.</h2>
              <p>
                Este aplicativo reúne receitas ilustrativas, um cardápio de exemplo e uma lista de
                compras local. As fotografias são referências visuais e podem mostrar ingredientes
                ou apresentações diferentes.
              </p>
              <p>
                Você pode adaptar as receitas ao seu gosto. O Mise não calcula dietas nem faz
                recomendações nutricionais.
              </p>
            </section>
            <section class="about-card">
              <Icon name="heart" :size="28" />
              <h2>Sua cozinha fica<br />no seu dispositivo.</h2>
              <p>
                Não há cadastro, servidor, banco de dados, API ou envio de informações. Cardápios,
                favoritos e itens marcados ficam no armazenamento do navegador, na chave
                <code>mise-kitchen</code>.
              </p>
              <p>
                Trocar de navegador ou apagar os dados do site remove o acesso às suas escolhas. Os
                downloads são gerados localmente. Não usamos analytics ou rastreadores. A hospedagem
                pode registrar acessos técnicos conforme a
                <a
                  href="https://docs.github.com/pt/site-policy/privacy-policies/github-general-privacy-statement"
                  target="_blank"
                  rel="noreferrer"
                  >política do GitHub</a
                >.
              </p>
            </section>
            <section class="about-card wide">
              <h2>Uma rotina em três passos.</h2>
              <div class="how-it-works">
                <div>
                  <span>01</span>
                  <h3>Encontre uma ideia</h3>
                  <p>Busque por receita ou ingrediente e guarde suas preferidas.</p>
                </div>
                <div>
                  <span>02</span>
                  <h3>Dê lugar na semana</h3>
                  <p>Escolha o dia, a refeição e quantas porções vai preparar.</p>
                </div>
                <div>
                  <span>03</span>
                  <h3>Leve a lista pronta</h3>
                  <p>Confira o que já tem e baixe a lista com as quantidades somadas.</p>
                </div>
              </div>
            </section>
            <section class="about-card wide">
              <h2>Créditos & código aberto</h2>
              <p>
                Desenvolvido por Gustavo Paz com Vue 3, TypeScript e Vite. Código sob licença MIT.
                Fotografias do Pexels, utilizadas sob a
                <a href="https://www.pexels.com/license/" target="_blank" rel="noreferrer"
                  >licença Pexels</a
                >. As fontes e bibliotecas mantêm suas próprias licenças.
              </p>
              <div class="credit-links">
                <a
                  v-for="photo in [
                    { id: 6541815, name: 'Salada' },
                    { id: 803963, name: 'Massa' },
                    { id: 13803824, name: 'Bowl' },
                    { id: 6978238, name: 'Sopa' },
                    { id: 7936662, name: 'Torrada' },
                    { id: 4725747, name: 'Aveia' },
                  ]"
                  :key="photo.id"
                  :href="`https://www.pexels.com/photo/${photo.id}/`"
                  target="_blank"
                  rel="noreferrer"
                  >{{ photo.name }} ↗</a
                >
              </div>
              <a
                class="button outline"
                href="https://github.com/gustapaz/mise"
                target="_blank"
                rel="noreferrer"
                >Ver projeto no GitHub <Icon name="arrow" :size="17"
              /></a>
            </section>
          </div>
        </template>
        <footer class="footer">
          <span class="footer-brand">mise<span>.</span></span>
          <p>Feito para levar mais leveza à mesa.</p>
          <a href="#sobre">Demonstração front-end · dados locais <Icon name="info" :size="14" /></a>
        </footer>
      </main>
    </div>
  </div>

  <dialog
    ref="modal"
    class="app-dialog"
    :class="{ 'recipe-dialog': modalType === 'recipe', 'picker-dialog': modalType === 'pick' }"
    aria-labelledby="modal-title"
    @close="restoreFocus"
    @click="
      (e) => {
        if (e.target === modal) {
          const r = modal.getBoundingClientRect();
          if (
            e.clientX < r.left ||
            e.clientX > r.right ||
            e.clientY < r.top ||
            e.clientY > r.bottom
          )
            closeModal();
        }
      }
    "
  >
    <button class="dialog-close icon-btn" aria-label="Fechar janela" @click="closeModal">
      <Icon name="close" />
    </button>
    <template v-if="modalType === 'recipe'"
      ><div class="recipe-detail-photo">
        <FoodImage :name="selectedRecipe.image" :alt="selectedRecipe.name" hero /><span
          class="food-tag"
          ><Icon name="leaf" :size="14" />{{ selectedRecipe.tag }}</span
        >
      </div>
      <div class="dialog-content">
        <p class="eyebrow coral">
          {{ selectedRecipe.category }} · {{ selectedRecipe.time }} MINUTOS
        </p>
        <h2 id="modal-title">{{ selectedRecipe.name }}</h2>
        <p class="detail-subtitle">{{ selectedRecipe.subtitle }}</p>
        <div class="detail-actions">
          <div class="portion-control">
            <span>Porções</span
            ><button
              class="icon-btn"
              :disabled="portions <= 1"
              aria-label="Diminuir porções"
              @click="portions--"
            >
              <Icon name="minus" :size="16" /></button
            ><output aria-live="polite">{{ portions }}</output
            ><button
              class="icon-btn"
              :disabled="portions >= 8"
              aria-label="Aumentar porções"
              @click="portions++"
            >
              <Icon name="plus" :size="16" />
            </button>
          </div>
          <button
            class="text-button"
            :aria-pressed="favorites.includes(selectedRecipe.id)"
            @click="favorite(selectedRecipe.id)"
          >
            <Icon name="heart" :size="18" />{{
              favorites.includes(selectedRecipe.id) ? 'Salva' : 'Salvar receita'
            }}
          </button>
        </div>
        <div class="detail-columns">
          <section>
            <h3>O que você vai precisar</h3>
            <ul class="ingredients">
              <li v-for="item in selectedRecipe.ingredients" :key="item.name">
                <span>{{ item.name }}</span
                ><strong>{{
                  amountLabel((item.amount * portions) / selectedRecipe.servings, item.unit)
                }}</strong>
              </li>
            </ul>
            <p class="ingredient-note">Sal e temperos a gosto.</p>
          </section>
          <section>
            <h3>Hora de colocar a mão na massa</h3>
            <p class="step-progress" role="status">
              {{ completedSteps.length }} de {{ selectedRecipe.steps.length }} passos concluídos
            </p>
            <ol class="recipe-steps">
              <li v-for="(step, index) in selectedRecipe.steps" :key="index">
                <label :class="{ done: completedSteps.includes(index) }"
                  ><input
                    type="checkbox"
                    :checked="completedSteps.includes(index)"
                    @change="toggleStep(index)"
                  /><span class="step-number">{{
                    completedSteps.includes(index) ? '✓' : String(index + 1).padStart(2, '0')
                  }}</span
                  ><span>{{ step }}</span></label
                >
              </li>
            </ol>
          </section>
        </div>
        <div class="recipe-tip">
          <Icon name="spark" :size="22" />
          <p><strong>Uma ideia a mais</strong>{{ selectedRecipe.tip }}</p>
        </div>
        <p class="photo-disclaimer">
          Imagem ilustrativa. A apresentação e os ingredientes podem variar.
        </p>
        <button class="button primary full" @click="modalType = 'add'">
          Colocar no meu cardápio <Icon name="calendar" :size="18" />
        </button></div
    ></template>
    <div v-else-if="modalType === 'add'" class="dialog-content add-content">
      <p class="eyebrow coral">UMA BOA IDEIA TEM HORA MARCADA</p>
      <h2 id="modal-title">Vai ter {{ selectedRecipe.name.toLowerCase() }}.</h2>
      <p>Escolha um lugar no seu cardápio.</p>
      <div class="add-recipe-preview">
        <FoodImage :name="selectedRecipe.image" :alt="selectedRecipe.name" />
        <div>
          <strong>{{ selectedRecipe.name }}</strong
          ><span>{{ selectedRecipe.time }} min · {{ selectedRecipe.tag }}</span>
        </div>
      </div>
      <form @submit.prevent="saveMeal">
        <div class="form-row">
          <label
            >Dia da semana<select v-model.number="addDay">
              <option v-for="(day, d) in days" :key="day" :value="d">
                {{ day }} · {{ dateFormat(weekDates[d]!) }}
              </option>
            </select></label
          ><label
            >Refeição<select v-model.number="addSlot">
              <option v-for="(slot, s) in slots" :key="slot" :value="s">{{ slot }}</option>
            </select></label
          >
        </div>
        <label class="servings-label"
          >Quantas porções?<input
            v-model.number="portions"
            type="number"
            min="1"
            max="8"
            required
            inputmode="numeric"
        /></label>
        <p v-if="plan[`${addDay}-${addSlot}`]" class="replace-notice">
          <Icon name="info" :size="17" />Esta escolha substituirá
          {{ recipeFor(`${addDay}-${addSlot}`)?.name }}.
        </p>
        <button class="button primary full" type="submit">
          {{ plan[`${addDay}-${addSlot}`] ? 'Substituir refeição' : 'Adicionar ao cardápio'
          }}<Icon name="check" :size="18" />
        </button>
      </form>
    </div>
    <div v-else-if="modalType === 'pick'" class="dialog-content">
      <p class="eyebrow coral">{{ days[addDay] }} · {{ slots[addSlot] }}</p>
      <h2 id="modal-title">O que vai à mesa?</h2>
      <label class="picker-search"
        ><Icon name="search" :size="18" /><span class="sr-only">Buscar receita para o cardápio</span
        ><input v-model="pickerSearch" type="search" placeholder="Encontre uma receita"
      /></label>
      <div class="picker-list">
        <button v-for="recipe in pickerRecipes" :key="recipe.id" @click="pickRecipe(recipe)">
          <FoodImage :name="recipe.image" :alt="recipe.name" />
          <div>
            <strong>{{ recipe.name }}</strong
            ><span>{{ recipe.time }} min · {{ recipe.category }}</span>
          </div>
          <Icon name="plus" :size="19" />
        </button>
        <p v-if="!pickerRecipes.length" class="picker-empty">
          Nenhuma receita encontrada. Tente outro nome.
        </p>
      </div>
    </div>
    <div v-else class="dialog-content">
      <span class="empty-icon"><Icon name="calendar" :size="28" /></span>
      <h2 id="modal-title">Uma semana do seu jeito.</h2>
      <p>
        Escolha como organizar {{ weekLabel }}. As refeições dessa semana serão substituídas e os
        itens marcados da lista serão desmarcados.
      </p>
      <div class="reset-options">
        <button
          class="button primary full"
          @click="
            resetWeek();
            closeModal();
            notify('Cardápio de exemplo restaurado nesta semana.');
          "
        >
          <Icon name="spark" :size="18" />Usar cardápio de exemplo</button
        ><button
          class="button outline full"
          @click="
            resetWeek(true);
            closeModal();
            notify('Semana livre para novas ideias.');
          "
        >
          <Icon name="plus" :size="18" />Começar com a semana vazia</button
        ><button class="text-button" @click="closeModal">Manter meu cardápio</button>
      </div>
    </div>
  </dialog>
  <div class="toast" :class="{ visible: toast }" role="status" aria-live="polite">
    <Icon name="check" :size="18" />{{ toast }}
  </div>
</template>
