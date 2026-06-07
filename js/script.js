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

function renderRecipe(meal) {
    // Wenn Karte schon sichtbar: rauswischen, dann neu laden
    if (recipe_card.style.display === 'block') {
        recipe_card.classList.remove('slide-in');
        recipe_card.classList.add('slide-out');

        recipe_card.addEventListener('animationend', () => {
            loadNewCard(meal);
        }, { once: true });
    } else {
        loadNewCard(meal);
    }
}

function loadNewCard(meal) {
    document.querySelector('#recipe_img').src = meal.strMealThumb;
    document.querySelector('#recipe_img').alt = meal.strMeal;
    document.querySelector('#recipe_title').textContent = meal.strMeal;
    document.querySelector('#recipe_category').textContent = `Category: ${meal.strCategory ?? '–'}`;
    document.querySelector('#recipe_kitchen').textContent = `Kitchen: ${meal.strArea ?? '–'}`;

    const likedRecipes = JSON.parse(localStorage.getItem('likedRecipes') || '[]');
    btn_like_recipe.classList.toggle('liked', likedRecipes.some(r => r.idMeal === meal.idMeal));

    recipe_card.classList.remove('slide-out');
    void recipe_card.offsetWidth;
    recipe_card.style.display = 'block';
    recipe_card.classList.add('slide-in');

    btn_load_recipe.classList.add('recipe-loaded');
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

 const grocery = document.querySelector('#detail_grocery');
const groceryMobile = document.querySelector('#detail_grocery_mobile');
grocery.innerHTML = '';
groceryMobile.innerHTML = '';

for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (ingredient && ingredient.trim()) {
        const text = `${measure?.trim()} ${ingredient.trim()}`.trim();
        
        const li = document.createElement('li');
        li.textContent = text;
        grocery.appendChild(li);

        const liMobile = document.createElement('li');
        liMobile.textContent = text;
        groceryMobile.appendChild(liMobile);
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
    <button class="btn_heart is_close btn_remove" data-id="${recipe.idMeal}">
        <svg class="icon_heart" viewBox="0 0 63 55">
            <svg class="icon_heart" viewBox="0 0 63 55">
    <path d="M54.9476 7.07267C53.5645 5.68892 51.9223 4.59124 50.1149 3.84232C48.3074 3.09341 46.3701 2.70794 44.4137 2.70794C42.4572 2.70794 40.5199 3.09341 38.7125 3.84232C36.9051 4.59124 35.2629 5.68892 33.8798 7.07267L31.0094 9.94309L28.139 7.07267C25.3452 4.27891 21.556 2.70939 17.6051 2.70939C13.6541 2.70939 9.86493 4.27891 7.07117 7.07267C4.27741 9.86643 2.70789 13.6556 2.70789 17.6066C2.70789 21.5575 4.27741 25.3467 7.07117 28.1405L9.94158 31.0109L31.0094 52.0787L52.0772 31.0109L54.9476 28.1405C56.3313 26.7574 57.429 25.1152 58.1779 23.3077C58.9268 21.5003 59.3123 19.563 59.3123 17.6066C59.3123 15.6501 58.9268 13.7128 58.1779 11.9054C57.429 10.0979 56.3313 8.45577 54.9476 7.07267Z"/>
</svg>
        </svg>
        <svg class="icon_close" viewBox="0 0 24 24">
            <path d="M18 6L6 18M6 6l12 12"/>
        </svg>
    </button>
    <img src="${recipe.strMealThumb}" alt="${recipe.strMeal}" loading="lazy" />
    <h3 class="fav_item_titel">${recipe.strMeal}</h3>
    <button class="btn_details" data-id="${recipe.idMeal}"><h3>Details</h3></button>
`;
        fav_list.appendChild(li);
    });

    // Remove buttons
fav_list.querySelectorAll('.btn_remove').forEach(btn => {
    btn.addEventListener('click', () => {
        const li = btn.closest('.fav_item');
        li.classList.add('removing');

        li.addEventListener('animationend', () => {
            let liked = JSON.parse(localStorage.getItem('likedRecipes') || '[]');
            liked = liked.filter(r => r.idMeal !== btn.dataset.id);
            localStorage.setItem('likedRecipes', JSON.stringify(liked));
            li.remove(); // nur dieses Element entfernen, kein re-render
        }, { once: true });
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

// Like Button — heart-pop Klasse
btn_like_recipe.addEventListener('click', function () {
    if (!selectedRecipe) return;

    // Animation triggern
    btn_like_recipe.classList.remove('heart-pop');
    void btn_like_recipe.offsetWidth; // reflow erzwingen
    btn_like_recipe.classList.add('heart-pop');

    let likedRecipes = JSON.parse(localStorage.getItem('likedRecipes') || '[]');
    const alreadyExists = likedRecipes.some(r => r.idMeal === selectedRecipe.idMeal);

    if (alreadyExists) {
        likedRecipes = likedRecipes.filter(r => r.idMeal !== selectedRecipe.idMeal);
        btn_like_recipe.classList.remove('liked');
    } else {
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
// Klick neben fav_overlay schliesst es
document.addEventListener('click', (e) => {
    if (fav_overlay.style.display === 'block' &&
        !fav_overlay.contains(e.target) &&
        !btn_header_heart.contains(e.target)) {
        fav_overlay.style.display = 'none';
    }
});

// Tastatur-Shortcuts
document.addEventListener('keydown', (e) => {
    // ESC: Overlays schliessen
    if (e.key === 'Escape') {
        if (detail_overlay.style.display === 'block') {
            closeDetail();
        } else if (fav_overlay.style.display === 'block') {
            fav_overlay.style.display = 'none';
        }
    }

    // Leertaste: neues Rezept laden
    if (e.key === ' ' && 
        detail_overlay.style.display !== 'block' &&
        fav_overlay.style.display !== 'block') {
        e.preventDefault(); // verhindert Seiten-Scroll
        btn_load_recipe.click();
    }
});