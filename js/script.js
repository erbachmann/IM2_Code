const btn_load_recipe = document.querySelector('#btn_load_recipe');
const btn_like_recipe = document.querySelector('#btn_like_recipe');
const btn_header_heart = document.querySelector('header .btn_heart');
const catecory_selection = document.querySelector('#catecory_kitchen');
const recipe_card = document.querySelector('#recipe_card');
const detail_overlay = document.querySelector('#detail_overlay');
const fav_overlay = document.querySelector('#fav_overlay');

let selectedRecipe;
let favWasOpen = false;

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

// Detail Overlay öffnen
function openDetail(meal) {
    favWasOpen = fav_overlay.style.display === 'block';

    detail_overlay.scrollTop = 0;
    document.querySelector('#detail_title').textContent = meal.strMeal;
    document.querySelector('#detail_category').textContent = `Category: ${meal.strCategory ?? '–'}`;
    document.querySelector('#detail_kitchen').textContent = `Kitchen: ${meal.strArea ?? '–'}`;
    document.querySelector('#detail_img').src = meal.strMealThumb;
    document.querySelector('#detail_img').alt = meal.strMeal;

    // Grocery list
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

    // Instructions
    const steps = document.querySelector('#detail_steps');
    steps.innerHTML = '';
    meal.strInstructions
        .split(/\r\n|\n|\r/)
        .filter(s => s.trim() && s.trim().length > 10 && !/^(step\s*)?\d+\.?$/i.test(s.trim()))
        .forEach(step => {
            const li = document.createElement('li');
            li.textContent = step.trim();
            steps.appendChild(li);
        });

    detail_overlay.style.display = 'block';
    btn_header_heart.classList.add('is_close');
}

// Detail Overlay schliessen
function closeDetail() {
    detail_overlay.style.display = 'none';
    btn_header_heart.classList.remove('is_close');
    if (!favWasOpen) {
        fav_overlay.style.display = 'none';
    }
}

// Favoritenliste rendern
function renderFavList() {
    const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes') || '[]');
    const fav_list = document.querySelector('#fav_list');
    fav_list.innerHTML = '';

    likedRecipes.forEach(recipe => {
        const li = document.createElement('li');
        li.className = 'fav_item';
        li.innerHTML = `
            <button class="btn_remove" data-id="${recipe.idMeal}">✕</button>
            <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy" />
            <h3 class="fav_item_titel">${recipe.strMeal}</h3>
            <button class="btn_details" data-id="${recipe.idMeal}"><h3>Details</h3></button>
        `;
        fav_list.appendChild(li);
    });

    // Remove buttons
    fav_list.querySelectorAll('.btn_remove').forEach(btn => {
        btn.addEventListener('click', () => {
            let liked = JSON.parse(localStorage.getItem('likedRecipes') || '[]');
            liked = liked.filter(r => r.idMeal !== btn.dataset.id);
            localStorage.setItem('likedRecipes', JSON.stringify(liked));
            renderFavList();
        });
    });

    // Details buttons in Favoritenliste
    fav_list.querySelectorAll('.btn_details').forEach(btn => {
        btn.addEventListener('click', async () => {
            const res = await fetch(`https://www.themealdb.com/api/json/v1/1/lookup.php?i=${btn.dataset.id}`);
            const data = await res.json();
            openDetail(data.meals[0]);
        });
    });
}

// Header Button
btn_header_heart.addEventListener('click', () => {
    if (detail_overlay.style.display === 'block') {
        closeDetail();
    } else if (fav_overlay.style.display === 'block') {
        fav_overlay.style.display = 'none';
    } else {
        renderFavList();
        fav_overlay.style.display = 'block';
    }
});

// Rezept laden
btn_load_recipe.addEventListener('click', async function () {
    fav_overlay.style.display = 'none';

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

    let likedRecipes = JSON.parse(localStorage.getItem('likedRecipes') || '[]');
    const alreadyExists = likedRecipes.some(r => r.idMeal === selectedRecipe.idMeal);

    if (alreadyExists) {
        // Entfernen
        likedRecipes = likedRecipes.filter(r => r.idMeal !== selectedRecipe.idMeal);
        btn_like_recipe.classList.remove('liked');
    } else {
        // Hinzufügen
        likedRecipes.push({
            idMeal: selectedRecipe.idMeal,
            strMeal: selectedRecipe.strMeal,
            strMealThumb: selectedRecipe.strMealThumb
        });
        btn_like_recipe.classList.add('liked');
    }

    localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));
});

// Details Button auf der Card
document.querySelector('.btn_details').addEventListener('click', () => {
    if (selectedRecipe) openDetail(selectedRecipe);
});