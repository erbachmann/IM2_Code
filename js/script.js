const btn_load_recipe = document.querySelector('#btn_load_recipe');
const btn_like_recipe = document.querySelector('#btn_like_recipe');
const catecory_selection = document.querySelector('#catecory_kitchen');

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

// Button klick load recipe
btn_load_recipe.addEventListener('click', async function () {
    let url = '';

    if (catecory_selection.value === 'all') {
        url = 'https://www.themealdb.com/api/json/v1/1/random.php';
    } else {
        url = `https://www.themealdb.com/api/json/v1/1/filter.php?c=${catecory_selection.value}`;
    }

    try {
        const response = await fetch(url);
        const data = await response.json();
        //Random recipe selection
        if (catecory_selection.value === 'all') {
            selectedRecipe = (data.meals[0]);
        } else {
            const randomIndex = Math.floor(Math.random() * data.meals.length);
            selectedRecipe = (data.meals[randomIndex]);
        }

    } catch (error) {
        console.error(error);
    }
    console.log(selectedRecipe);
});

//Button klick like
btn_like_recipe.addEventListener('click', function () {
    if (!selectedRecipe) {
        console.log('Noch kein Rezept geladen');
        return;
    }

    const storedRecipes = localStorage.getItem('likedRecipes');


    const alreadyExists = storedRecipes.some(recipe => recipe.idMeal === selectedRecipe.idMeal);

    if (alreadyExists) {
        console.log('Rezept schon gemerkt');
        return;
    }

    const recipeToSave = {
        idMeal: selectedRecipe.idMeal,
        strMeal: selectedRecipe.strMeal,
        strMealThumb: selectedRecipe.strMealThumb
    };

    likedRecipes.push(recipeToSave);
    localStorage.setItem('likedRecipes', JSON.stringify(likedRecipes));

    console.log(likedRecipes);
});