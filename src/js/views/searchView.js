import { elements } from './base';

export const getInput = () => elements.searchInput.value;

export const clearInput = () => {
    elements.searchInput.value = '';
};

export const clearResults = () => {
    elements.searchResList.innerHTML = '';
    elements.searchPage.innerHTML = '';
};

export const highlightSelected = id => {
    const resultsArr = Array.from(document.querySelectorAll(".results__link"));
    resultsArr.forEach(el => {
        el.classList.remove("results__link--active");
    });

    document.querySelector(`a[href="#${id}"]`).classList.add('results__link--active');
};

const limitRecipeTitle = (title, limit = 17) => {
    const newTitle = [];
    if(title.length >= limit){
        title.split(' ').reduce((acc, cur) => {
            if(acc + cur.length < limit){
                newTitle.push(cur);
            }
            return acc + cur.length;
        }, 0);

        return `${newTitle.join(' ')} ...`;
    }
    return title;
};

const renderRecipes = recipe => {
    const markup = `
        <li>
            <a class="results__link" href="#${recipe.recipe_id}">
                <figure class="results__fig">
                    <img src="${recipe.image_url}" alt="${recipe.title}">
                </figure>
                <div class="results__data">
                    <h4 class="results__name">${limitRecipeTitle(recipe.title, 15)}</h4>
                    <p class="results__author">${recipe.publisher}</p>
                </div>
            </a>
        </li>
    `;
    
    elements.searchResList.insertAdjacentHTML('beforeend', markup);
};



const createButton = (page, type) => `
    <button class="btn-inline results__btn--${type}" data-goto="${type == 'prev' ? page - 1 : page + 1}">
    <span>Page ${type == 'prev' ? page - 1 : page + 1}</span>
        <svg class="search__icon">
            <use href="img/icons.svg#icon-triangle-${type == 'prev' ? "left" : "right"}"></use>
        </svg>
     </button>
`;

const renderButton = (page, numResults, resultsPerPage) => {
    const pages = Math.ceil(numResults/ resultsPerPage);

    let button = '';
    if(page === 1) {
        // one button for next page
        button = createButton(page, 'next');
    }
    else if(page < pages) {
        // two buttons for prev and next page
        button = `
            ${button = createButton(page, 'prev')}
            ${button = createButton(page, 'next')}
        `;
    }
    else if(page === pages) {
        // one button for prev page
        button = createButton(page, 'prev');
    }

    elements.searchPage.insertAdjacentHTML('afterbegin', button);
};

export const renderResult = (recipes, page = 1, resultsPerPage = 10) => {
    // render results
    const start = (page - 1) * resultsPerPage;        // page 1 -> 0, page 2 -> 10, page 3 -> 20
    const end = page * resultsPerPage;       // page 1 -> 10, page 2 -> 20, page 3 -> 30 as slice method excludes the end index

    recipes.slice(start, end).forEach(renderRecipes);

    // render pagination
    renderButton(page, recipes.length, resultsPerPage);
};