const btn_load_recipe = document.querySelector('#btn_load_recipe');
const btn_like_recipe = document.querySelector('#btn_like_recipe');
const btn_header_heart = document.querySelector('header .btn_heart');
const catecory_selection = document.querySelector('#catecory_kitchen');
const recipe_card = document.querySelector('#recipe_card');
const detail_overlay = document.querySelector('#detail_overlay');

let selectedRecipe;

// Kategorien laden
async function loadCatecory() {
    const url = 'https://www.themealdb.com/api/json/v1/1/categories.php';
    try {
        const response = await fetch(url);
        const data = await response.json();
        data.categories.forEach(element => {
            const option = document.createElement('option');
            option.value = element.strCategory;
            option.textContent = element.strCategory;
            catecory_selection.appendChild(option);
        });
    } catch (error) {
        console.error(error);
    }
}

loadCatecory();

// Card befüllen
function renderRecipe(meal) {
    document.querySelector('#recipe_img').src = meal.strMealThumb;
    document.querySelector('#recipe_img').alt = meal.strMeal;
    document.querySelector('#recipe_title').textContent = meal.strMeal;
    document.querySelector('#recipe_category').textContent = `Category: ${meal.strCategory ?? '–'}`;
    document.querySelector('#recipe_kitchen').textContent = `Kitchen: ${meal.strArea ?? '–'}`;

    const storedRecipes = localStorage.getItem('likedRecipes');
    const likedRecipes = storedRecipes ? JSON.parse(storedRecipes) : [];
    const alreadyLiked = likedRecipes.some(r => r.idMeal === meal.idMeal);
    btn_like_recipe.classList.toggle('liked', alreadyLiked);

    recipe_card.style.display = 'block';
}

// Overlay befüllen und öffnen
function openDetail(meal) {
    document.querySelector('#detail_title').textContent = meal.strMeal;
    document.querySelector('#detail_category').textContent = `Category: ${meal.strCategory ?? '–'}`;
    document.querySelector('#detail_kitchen').textContent = `Kitchen: ${meal.strArea ?? '–'}`;
    document.querySelector('#detail_img').src = meal.strMealThumb;
    document.querySelector('#detail_img').alt = meal.strMeal;

    // Grocery list aus API-Feldern aufbauen
    const grocery = document.querySelector('#detail_grocery');
    grocery.innerHTML = '';
    for (let i = 1; i <= 20; i++) {
        const ingredient = meal[`strIngredient${i}`];
        const measure = meal[`strMeasure${i}`];
        if (ingredient && ingredient.trim()) {
            const li = document.createElement('li');
            li.textContent = `${measure?.trim()} ${ingredient.trim()}`.trim();
            grocery.appendChild(li);
        }
    }

    // Kochanleitung in Schritte aufteilen
    const steps = document.querySelector('#detail_steps');
    steps.innerHTML = '';
    meal.strInstructions.split('\r\n').filter(s => s.trim()).forEach(step => {
        const li = document.createElement('li');
        li.textContent = step.trim();
        steps.appendChild(li);
    });

    detail_overlay.style.display = 'block';
    btn_header_heart.classList.add('is_close');
}

function closeDetail() {
    detail_overlay.style.display = 'none';
    btn_header_heart.classList.remove('is_close');
}

// Details Button
document.querySelector('.btn_details').addEventListener('click', () => {
    if (selectedRecipe) openDetail(selectedRecipe);
});

// Header Button: normal = liked page, im Overlay = close
btn_header_heart.addEventListener('click', () => {
    if (detail_overlay.style.display === 'block') {
        closeDetail();
    }
});

// Rezept laden
btn_load_recipe.addEventListener('click', async function () {
    let url = catecory_selection.value === 'all'
        ? 'https://www.themealdb.com/api/json/v1/1/random.php'
        : `https://www.themealdb.com/api/json/v1/1/filter.php?c=${catecory_selection.value}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        const basicMeal = catecory_selection.value === 'all'
            ? data.meals[0]
            : data.meals[Math.floor(Math.random() * data.meals.length)];

        const detailResponse = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${basicMeal.idMeal}`);
        const detailData = await detailResponse.json();
        selectedRecipe = detailData.meals[0];

    } catch (error) {
        console.error(error);
    }

    renderRecipe(selectedRecipe);
});

// Like Button
btn_like_recipe.addEventListener('click', function () {
    if (!selectedRecipe) return;

    const storedRecipes = localStorage.getItem('likedRecipes');
    const likedRecipes = storedRecipes ? JSON.parse(storedRecipes) : [];
    const alreadyExists = likedRecipes.some(r => r.idMeal === selectedRecipe.idMeal);

    if (alreadyExists) {
        btn_like_recipe.classList.add('liked');
        return;
    }

    likedRecipes.push({
        idMeal: selectedRecipe.idMeal,
        strMeal: selectedRecipe.strMeal,
        strMealThumb: selectedRecipe.strMealThumb
    });
    localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
    btn_like_recipe.classList.add('liked');
});