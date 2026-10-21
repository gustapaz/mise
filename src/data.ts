export interface Ingredient {
  name: string;
  amount: number;
  unit: string;
  group: 'Hortifruti' | 'Mercearia' | 'Refrigerados';
}
export interface Recipe {
  id: string;
  name: string;
  subtitle: string;
  category: 'Café da manhã' | 'Almoço' | 'Jantar';
  time: number;
  servings: number;
  image: string;
  tag: string;
  color: string;
  ingredients: Ingredient[];
  steps: string[];
  tip: string;
}
const i = (
  name: string,
  amount: number,
  unit: string,
  group: Ingredient['group'] = 'Hortifruti',
): Ingredient => ({ name, amount, unit, group });
export const recipes: Recipe[] = [
  {
    id: 'bowl-colorido',
    name: 'Bowl de todos os dias',
    subtitle: 'Arroz, vegetais e um molho que abraça.',
    category: 'Almoço',
    time: 30,
    servings: 2,
    image: 'bowl',
    tag: 'Vegano',
    color: '#e5e9d5',
    ingredients: [
      i('Arroz', 160, 'g', 'Mercearia'),
      i('Grão-de-bico cozido', 200, 'g', 'Mercearia'),
      i('Cenoura', 1, 'un.'),
      i('Pepino', 1, 'un.'),
      i('Tomate', 2, 'un.'),
      i('Azeite', 20, 'ml', 'Mercearia'),
      i('Limão', 1, 'un.'),
    ],
    steps: [
      'Cozinhe o arroz em água conforme as instruções da embalagem. Escorra o grão-de-bico e reserve.',
      'Lave os vegetais. Rale a cenoura, corte o pepino em fatias e os tomates em pedaços.',
      'Misture o azeite com o suco do limão. Tempere com sal a gosto.',
      'Distribua arroz, grão-de-bico e vegetais em tigelas. Finalize com o molho e sirva.',
    ],
    tip: 'Deixe os componentes separados e monte o bowl perto da hora de comer.',
  },
  {
    id: 'massa-verde',
    name: 'Massa de domingo',
    subtitle: 'Penne, folhas verdes e um toque cremoso.',
    category: 'Almoço',
    time: 25,
    servings: 2,
    image: 'massa',
    tag: 'Vegetariano',
    color: '#e4eadb',
    ingredients: [
      i('Macarrão penne', 200, 'g', 'Mercearia'),
      i('Espinafre', 100, 'g'),
      i('Creme de leite', 100, 'ml', 'Refrigerados'),
      i('Alho', 2, 'dentes'),
      i('Azeite', 15, 'ml', 'Mercearia'),
      i('Queijo parmesão', 30, 'g', 'Refrigerados'),
    ],
    steps: [
      'Cozinhe o penne conforme a embalagem e reserve meia xícara da água do cozimento.',
      'Aqueça o azeite em fogo médio. Refogue o alho picado até perfumar, sem deixar queimar.',
      'Junte o espinafre lavado e deixe murchar. Acrescente o creme de leite e mexa em fogo baixo.',
      'Adicione a massa e o parmesão. Use um pouco da água reservada para ajustar a textura. Tempere a gosto e sirva.',
    ],
    tip: 'A água do cozimento ajuda o molho a envolver a massa.',
  },
  {
    id: 'salada-fresca',
    name: 'Salada sem pressa',
    subtitle: 'Folhas, tomate e frescor em cada garfada.',
    category: 'Almoço',
    time: 15,
    servings: 2,
    image: 'salada',
    tag: 'Vegano',
    color: '#f0e8d6',
    ingredients: [
      i('Folhas verdes', 120, 'g'),
      i('Tomate', 2, 'un.'),
      i('Pepino', 1, 'un.'),
      i('Grão-de-bico cozido', 200, 'g', 'Mercearia'),
      i('Limão', 1, 'un.'),
      i('Azeite', 20, 'ml', 'Mercearia'),
    ],
    steps: [
      'Lave as folhas e os vegetais em água corrente e higienize conforme o produto próprio para alimentos. Seque bem.',
      'Corte o tomate e o pepino. Escorra o grão-de-bico.',
      'Misture suco de limão, azeite e sal a gosto em um recipiente pequeno.',
      'Combine os ingredientes, adicione o molho apenas na hora de servir e misture delicadamente.',
    ],
    tip: 'Folhas bem secas mantêm a textura e recebem melhor o molho.',
  },
  {
    id: 'sopa-tomate',
    name: 'Sopa de aconchego',
    subtitle: 'Tomates assados para terminar bem o dia.',
    category: 'Jantar',
    time: 40,
    servings: 2,
    image: 'sopa',
    tag: 'Vegano',
    color: '#f6e3d8',
    ingredients: [
      i('Tomate', 6, 'un.'),
      i('Cebola', 1, 'un.'),
      i('Alho', 2, 'dentes'),
      i('Azeite', 20, 'ml', 'Mercearia'),
      i('Água', 400, 'ml', 'Mercearia'),
      i('Manjericão', 10, 'g'),
    ],
    steps: [
      'Preaqueça o forno a 200 °C. Lave os tomates, corte-os em quartos e pique a cebola.',
      'Distribua tomate, cebola e alho em uma assadeira. Regue com azeite e asse por 25 minutos.',
      'Transfira para uma panela, junte a água e cozinhe por 5 minutos. Desligue e deixe amornar antes de bater com segurança.',
      'Bata até ficar cremosa. Volte à panela para aquecer, ajuste sal e finalize com manjericão.',
    ],
    tip: 'Adicione água aos poucos para chegar à consistência que você prefere.',
  },
  {
    id: 'torrada-abacate',
    name: 'Bom dia, abacate',
    subtitle: 'Uma torrada simples que muda a manhã.',
    category: 'Café da manhã',
    time: 10,
    servings: 2,
    image: 'torrada',
    tag: 'Vegano',
    color: '#e1e8d5',
    ingredients: [
      i('Pão integral', 4, 'fatias', 'Mercearia'),
      i('Abacate', 1, 'un.'),
      i('Limão', 1, 'un.'),
      i('Azeite', 10, 'ml', 'Mercearia'),
    ],
    steps: [
      'Toste as fatias de pão em uma frigideira seca ou torradeira.',
      'Abra o abacate, retire a polpa e amasse com um garfo.',
      'Misture um pouco do suco de limão e sal a gosto.',
      'Espalhe sobre as torradas, finalize com azeite e sirva imediatamente.',
    ],
    tip: 'Para variar, finalize com pimenta moída ou sementes que você já tiver.',
  },
  {
    id: 'aveia-frutas',
    name: 'Manhã de colher',
    subtitle: 'Aveia cremosa e frutas para colorir.',
    category: 'Café da manhã',
    time: 15,
    servings: 2,
    image: 'aveia',
    tag: 'Vegetariano',
    color: '#ebe0eb',
    ingredients: [
      i('Aveia em flocos', 80, 'g', 'Mercearia'),
      i('Leite', 300, 'ml', 'Refrigerados'),
      i('Morango', 120, 'g'),
      i('Banana', 1, 'un.'),
      i('Canela', 2, 'g', 'Mercearia'),
    ],
    steps: [
      'Coloque a aveia e o leite em uma panela e leve ao fogo baixo.',
      'Mexa por cerca de 5 minutos, até atingir uma textura cremosa. Se necessário, acrescente um pouco de água.',
      'Lave e corte os morangos. Descasque e fatie a banana.',
      'Divida a aveia em tigelas e finalize com as frutas e a canela.',
    ],
    tip: 'Troque o leite por uma bebida vegetal para adaptar a receita ao seu gosto.',
  },
  {
    id: 'bowl-morno',
    name: 'Bowl de fim de tarde',
    subtitle: 'Vegetais, grãos e um jantar sem complicar.',
    category: 'Jantar',
    time: 30,
    servings: 2,
    image: 'bowl',
    tag: 'Vegano',
    color: '#e9e7d8',
    ingredients: [
      i('Arroz', 160, 'g', 'Mercearia'),
      i('Grão-de-bico cozido', 200, 'g', 'Mercearia'),
      i('Cenoura', 2, 'un.'),
      i('Abobrinha', 1, 'un.'),
      i('Alho', 2, 'dentes'),
      i('Azeite', 20, 'ml', 'Mercearia'),
    ],
    steps: [
      'Cozinhe o arroz conforme a embalagem. Escorra o grão-de-bico.',
      'Lave e corte a cenoura e a abobrinha em pedaços pequenos.',
      'Aqueça o azeite, refogue o alho e junte a cenoura com duas colheres de água. Tampe por 5 minutos.',
      'Acrescente a abobrinha e cozinhe até ficar macia. Junte o grão-de-bico, aqueça e sirva sobre o arroz. Tempere a gosto.',
    ],
    tip: 'A receita aproveita bem os vegetais disponíveis na geladeira.',
  },
  {
    id: 'massa-limao',
    name: 'Penne ao limão',
    subtitle: 'Cremoso, cítrico e pronto em poucos passos.',
    category: 'Jantar',
    time: 20,
    servings: 2,
    image: 'massa',
    tag: 'Vegetariano',
    color: '#f1e8cb',
    ingredients: [
      i('Macarrão penne', 200, 'g', 'Mercearia'),
      i('Limão', 1, 'un.'),
      i('Creme de leite', 100, 'ml', 'Refrigerados'),
      i('Queijo parmesão', 40, 'g', 'Refrigerados'),
      i('Azeite', 10, 'ml', 'Mercearia'),
    ],
    steps: [
      'Cozinhe o penne conforme a embalagem. Reserve um pouco da água do cozimento antes de escorrer.',
      'Em fogo baixo, aqueça o creme de leite com o azeite e raspas do limão lavado. Evite a parte branca da casca.',
      'Adicione a massa e o parmesão. Misture e acrescente água do cozimento para obter um molho leve.',
      'Desligue o fogo e adicione o suco de limão aos poucos, provando. Ajuste sal e sirva.',
    ],
    tip: 'O limão entra no final para preservar o frescor.',
  },
];
export const days = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
export const slots = ['Café da manhã', 'Almoço', 'Jantar'];
export type Plan = Record<string, { recipeId: string; servings: number }>;
export const initialPlan: Plan = {
  '0-1': { recipeId: 'bowl-colorido', servings: 2 },
  '0-2': { recipeId: 'sopa-tomate', servings: 2 },
  '1-0': { recipeId: 'aveia-frutas', servings: 2 },
  '1-1': { recipeId: 'massa-verde', servings: 2 },
  '2-1': { recipeId: 'salada-fresca', servings: 2 },
  '3-2': { recipeId: 'bowl-morno', servings: 2 },
  '4-0': { recipeId: 'torrada-abacate', servings: 2 },
};
