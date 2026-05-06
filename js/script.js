const button = document.querySelector('#button');
const catecory_selection = document.querySelector('#catecory_kitchen');

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

// Button klick
button.addEventListener('click', async function () {
    let url = '';
    let selectedRecipe;

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