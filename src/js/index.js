// Global app controller
import Search from './models/Search';
import Recipe from './models/Recipe';
import List from './models/List';
import Likes from './models/Likes';
import { elements, renderLoader, clearLoader } from './views/base';
import * as searchView from './views/searchView';
import * as recipeView from './views/recipeView';
import * as listView from './views/listView';
import * as likesView from './views/likesView';

/** State of the application
 *  - Search object
 *  - recipes
 *  - ingridients to buy
 *  - likes
 */
const state = {};
window.state = state;


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

        // Highlight Selected search item
        if (state.search) searchView.highlightSelected(id);

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
            recipeView.renderRecipe(
                state.recipe,
                state.likes.isLiked(id)
                );
        }
        catch(error) {
            alert("Error in processing Recipe!");
        }
        
    }
};

// window.addEventListener('hashchange', controlRecipe);
// window.addEventListener('load', controlRecipe);

['hashchange', 'load'].forEach(event => window.addEventListener(event, controlRecipe));




/**
 * Shopping List Controller
 */

const controlList = () => {
    // create a new list if a list does not exist
    if(!state.list) state.list = new List();

    // add ingredients to the list
    state.recipe.ingredients.forEach(el => {
        const item = state.list.addItem(el.count, el.unit, el.ingredient);
        listView.renderItem(item);
    });  
};

elements.shopping.addEventListener('click', e => {
    const id = e.target.closest('.shopping__item').dataset.itemid;
    
    // delete ingredient
    if(e.target.matches('.shopping__delete, .shopping__delete *')) {
        state.list.deleteItem(id);
        listView.deleteItem(id);
    }
    // update count
    else if(e.target.matches('.shopping__count-value')) {
        const val = parseFloat(e.target.value, 10);
        state.list.updateItem(id, val);
    }
});

// TESTING
state.likes = new Likes()
likesView.toggleLikeMenu(state.likes.getNumLikes());


/**
 * LIKES controller
 */
const controlLike = () => {
    if(!state.likes) state.likes = new Likes();
    const currentId = state.recipe.id;

    // if recipe has NOT yet been liked
    if(!state.likes.isLiked(currentId)) {
        // add like to the state
        const newLike = state.likes.addLike(
            currentId,
            state.recipe.title,
            state.recipe.author,
            state.recipe.img
        );

        // change like button
        likesView.toggleLikeButton(true);

        // add like to UI Like list
        console.log(newLike);
        likesView.renderLike(newLike);
    }
    // if recipe HAS been liked
    else {
        // remove like to the state
        state.likes.deleteLike(currentId);

        // change like button
        likesView.toggleLikeButton(false);

        // remove like to UI Like list
        likesView.deleteLike(currentId);
    }

    likesView.toggleLikeMenu(state.likes.getNumLikes());
};



// update Servings and ingredients
elements.recipe.addEventListener('click', e => {
    if(e.target.matches('.btn-decrease, .btn-decrease *')) {
        // decrease button is clicked
        if(state.recipe.servings > 1) {
            state.recipe.updateServings('dec');
            recipeView.updateServingsIngredients(state.recipe);
        }
    }
    else if(e.target.matches('.btn-increase, .btn-increase *')) {
        // increase button is clicked
        state.recipe.updateServings('inc');
        recipeView.updateServingsIngredients(state.recipe);
    }
    // Add to shopping list event delegation
    else if(e.target.matches('.recipe__btn--add, .recipe__btn--add *')) {
        controlList();
    }
    // Like recipe and add it to the LIKES list
    else if(e.target.matches('.recipe__love, .recipe__love *')) {
        controlLike();
    }    
});


window.l = new List();