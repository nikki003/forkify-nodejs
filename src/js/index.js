// Global app controller
import Search from './models/Search';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import Recipe from './models/Recipe';

/** State of the application
 *  - Search object
 *  - recipes
 *  - ingridients to buy
 *  - likes
 */
const state = {};



/**
 *          Search controller
 */
const controlSearch = async () => {
    //1. get query from the view
    const query = searchView.getInput();

    if(query) {

        //2. new search object and add to state
        state.search = new Search(query);

        //3. prepare ui for results
        searchView.clearInput();
        searchView.clearResults();
        renderLoader(elements.searchRes);

        try {
            //4. search for recipes
            await state.search.getResults();
    
    
            //5. render results on ui
            clearLoader();
            searchView.renderResult(state.search.result);
        }
        catch(error) {
            clearLoader();
            alert("Error in searching Recipes!");
        }

    }

}

elements.searchForm.addEventListener('submit', e => {
    e.preventDefault();
    controlSearch();
});

// // TESTING
// window.addEventListener('load', e => {
//     e.preventDefault();
//     controlSearch();
// });

elements.searchPage.addEventListener('click', e => {
    const btn = e.target.closest(".btn-inline");
    if(btn) {
        const goToPage = parseInt(btn.dataset.goto);
        searchView.clearResults();
        searchView.renderResult(state.search.result, goToPage);
    }
});


/**
 *          Recipe controller
 */

const controlRecipe = async () => {
    const id = window.location.hash.replace('#', '');
    console.log(id);
    
    if(id) {
        // Prepare UI for changes
        recipeView.clearRecipe();
        renderLoader(elements.recipe);

        // create a recipe object
        state.recipe = new Recipe(id);

        try {
            // get recipe data and parse Ingredients
            await state.recipe.getRecipe();
            // console.log(state.recipe.ingredients); 
            state.recipe.parseIngredients();
    
            // calculate time and servings
            state.recipe.calculateTime();
            state.recipe.calculateServings();
    
            // render the recipe page
            console.log(state.recipe);
            clearLoader();
            recipeView.renderRecipe(state.recipe);
        }
        catch(error) {
            alert("Error in processing Recipe!");
        }
        
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));

