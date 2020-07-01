import axios from 'axios';
import { elements } from '../views/base';

export default class Recipe {
    constructor(id) {
        this.id = id;
    }

    async getRecipe() {
        try {
            const res = await axios(`https://forkify-api.herokuapp.com/api/get?rId=${this.id}`);
            this.title = res.data.recipe.title;
            this.author = res.data.recipe.publisher;
            this.img = res.data.recipe.image_url;
            this.url = res.data.recipe.source_url;
            this.ingredients = res.data.recipe.ingredients;
        }
        catch(error) {
            console.log(error);
            alert("Something went wrong :(");
        }
    }

    calculateTime() {
        // assuming that 3 ingredients take 15 minutes of cooking time
        const numIngredient = this.ingredients.length;
        const periods = Math.ceil(numIngredient/3);
        this.time = periods * 15;
    }

    calculateServings() {
        this.servings = 4;
    }

    parseIngredients () {
        const unitsLong = ['tablespoons', 'tablespoon', 'teaspoons', 'teaspoon', 'ounces', 'ounce', 'cups', 'pounds'];
        const unitsShort = ['tbsp', 'tbsp', 'tsp', 'tsp', 'oz', 'oz', 'cup', 'pound'];
        const units = [...unitsShort, 'kg', 'g'];

        const newIngredients = this.ingredients.map((element) => {
            let ingredient = element.toLowerCase();
            // 1) change units to smaller form
            unitsLong.forEach((unit, i) => {
                ingredient = ingredient.replace(unit, unitsShort[i]);
            });
            
            // 2) remove parenthesis
            ingredient = ingredient.replace(/ *\([^)]*\) */g, ' ');

            // 3) parse ingredients into count, unit and ingredient
            const arrIng = ingredient.split(' ');
            const unitIndex = arrIng.findIndex(el => units.includes(el));

            let objIng;
            if(unitIndex > -1) {
                // unit and number both exists   Ex. 4 1/2 cups     "4+1/2"     eval("4+1/2") --> 4.5
                // extract number and unit
                const arrCount = arrIng.slice(0, unitIndex);

                let count;
                if(arrCount.length === 1) {
                    count = eval(arrIng[0].replace('-', '+'));
                }
                else {
                    count = eval(arrIng.slice(0, unitIndex).join('+'));
                }

                objIng = {
                    count,
                    unit: arrIng[unitIndex],
                    ingredient: arrIng.slice(unitIndex + 1).join(' ')
                }
            }
            else if(parseInt(arrIng[0])) {
                // no unit but 1st element is number
                objIng = {
                    count: parseInt(arrIng[0]),
                    unit: '',
                    ingredient: arrIng.slice(1).join(' ')
                }
            }
            else if(unitIndex === -1) {
                // unit does not exist and there's no number
                objIng = {
                    count: '1',
                    unit: '',
                    ingredient
                }
            }

            return objIng;

        });
        // console.log(newIngredients);
        
        this.ingredients = newIngredients;
    }
};