var JSSoup = require('jssoup').default;
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));
var fs = require('fs');

class Category {
    constructor(name, url) {
        this.name = name;
        this.url = url;
    }

    getName() {
        return this.name;
    }

    getUrl() {
        return this.url;
    }

    toString() {
        return this.name;
    }
}

class Ingredient {
    constructor(name, amount) {
        this.name = name;
        this.amount = amount;
    }

    getName() {
        return this.name;
    }

    getAmount() {
        return this.amount;
    }

    toString() {
        return this.name;
    }
}

class Recipe {
    constructor(name, url, ingredients, category) {
        this.name = name;
        this.url = url;
        this.ingredients = ingredients;
        this.category = category;
    }

    getName() {
        return this.name;
    }

    getUrl() {
        return this.url;
    }

    getIngredients() {
        return this.ingredients;
    }

    getCategory() {
        return this.category;
    }

    toString() {
        return this.name;
    }
}

class ChefkochAPI {
    
    constructor() {
        this.baseURL = "https://www.chefkoch.de";
    }

    async getCategories() {
        const response = await fetch(this.baseURL + "/rezepte/kategorien/");
        const html = await response.text();
        const soup = new JSSoup(html);
        let categories = [];
        soup.findAll("div", {"class": "category-column"}).forEach(category_column => {
            category_column.findAll("a").forEach(category_link => {
                if(category_link.attrs.href === "#" || category_link.attrs.href === "" || category_link.attrs.href == null) return;
                categories.push(new Category(category_link.text, category_link.attrs.href));
            });
        });
        return categories;
    }

    async getRecipes(category, endIndex = 5, startIndex = 0) {
        let index = startIndex;
        let recipes = [];
        while(index <= endIndex) {
            category.url = category.url.replace("/s0/", `/s${index}/`);
            const response = await fetch(this.baseURL + category.url);
            const html = await response.text();
            const soup = new JSSoup(html);
            soup.findAll("div", {"class": "ds-recipe-card"}).forEach(recipe_card => {
                let recipeName = recipe_card.find("h2").text;
                let recipeURL = recipe_card.find("a").attrs.href;
                let ingredient_list = [];
                const soup2 = new JSSoup(`${this.baseURL}${recipeURL}`);
                const ingredientTable = soup2.find("table", {"class": "ingredients"});
                if(ingredientTable != null) {
                    ingredientTable.findAll("tr").forEach(ingredient_row => {
                        let ingredient_name = ingredient_row.find("td", {"class": "td-right"}).text;
                        let ingredient_amount = ingredient_row.find("td", {"class": "td-left"}).text;
                        ingredient_list.push(new Ingredient(ingredient_name, ingredient_amount));
                    });
                }
                let recipe = new Recipe(recipeName, recipeURL, ingredient_list, category.name);
                recipes.push(recipe);
            });
            index++;
        }
        return recipes;
    }

    async getAllRecipes(endIndex = 5, startIndex = 0) {
        let recipes = [];
        let categories = await this.getCategories();
        for(let category of categories) {
            let category_recipes = await this.getRecipes(category, endIndex, startIndex);
            recipes.push(recipes.concat(category_recipes));
        }
        return recipes;
    }

    async searchRecipes(query, endIndex = 5, startIndex = 0) {
        let index = startIndex;
        let recipes = [];
        while(index <= endIndex) {
            const response = await fetch(`${this.baseURL}/rs/s${index}/${query}/Rezepte.html`);
            const html = await response.text();
            const soup = new JSSoup(html);
            soup.findAll("div", {"class": "ds-recipe-card"}).forEach(recipe_card => {
                let recipeName = recipe_card.find("h2").text;
                let recipeURL = recipe_card.find("a").attrs.href;
                let ingredient_list = [];
                const soup2 = new JSSoup(`${this.baseURL}${recipeURL}`);
                const ingredientTable = soup2.find("table", {"class": "ingredients"});
                if(ingredientTable != null) {
                    ingredientTable.findAll("tr").forEach(ingredient_row => {
                        let ingredient_name = ingredient_row.find("td", {"class": "td-right"}).text;
                        let ingredient_amount = ingredient_row.find("td", {"class": "td-left"}).text;
                        ingredient_list.push(new Ingredient(ingredient_name, ingredient_amount));
                    });
                }
                let recipe = new Recipe(recipeName, recipeURL, ingredient_list);
                recipes.push(recipe);
            });
            index++;
        }
        return recipes;
    }


    async getRecipe(recipeSubURL) {
        const response = await fetch(this.baseURL + recipeSubURL);
        const html = await response.text();
        const soup = new JSSoup(html);
        let recipeName = soup.find("h1").text;
        let ingredient_list = [];
        const ingredientTable = soup.find("table", {"class": "ingredients"});
        if(ingredientTable != null) {
            ingredientTable.findAll("tr").forEach(ingredient_row => {
                let ingredient_name = ingredient_row.find("td", {"class": "td-right"}).text;
                let ingredient_amount = ingredient_row.find("td", {"class": "td-left"}).text;
                ingredient_list.push(new Ingredient(ingredient_name, ingredient_amount));
            });
        }
        let recipe = new Recipe(recipeName, recipeSubURL, ingredient_list);
        return recipe;
    }
}

class DataParser {
    async writeFile(fileName, data) {
        fs.writeFile(fileName, data, (err) => {
            if (err) throw err;
            console.log('The file has been saved!');
        });
    }

    async readFile(fileName) {
        return new Promise((resolve, reject) => {
            fs.readFile(fileName, 'utf8', (err, data) => {
                if (err) reject(err);
                resolve(data);
            });
        });
    }

    async writeRecipesToJson(recipes, fileName) {
        let json = JSON.stringify(recipes);
        await this.writeFile(fileName, json);
    }

    async writeCategoriesToJson(categories, fileName) {
        let json = JSON.stringify(categories);
        await this.writeFile(fileName, json);
    }

    async writeRecipesToCSV(recipes, fileName) {
        let csv = "";
        for(let recipe of recipes) {
            csv += recipe.getName() + "," + recipe.getUrl() + "," + recipe.getCategory() + "\n";
        }
        await this.writeFile(fileName, csv);
    }

    async writeCategoriesToCSV(categories, fileName) {
        let csv = "";
        for(let category of categories) {
            csv += category.getName() + "," + category.getUrl() + "\n";
        }
        await this.writeFile(fileName, csv);
    }

    async loadRecipesFromJson(fileName) {
        let json = await this.readFile(fileName).then((data) => {return data}).catch((err) => {console.log(err)});
        let recipes = JSON.parse(json);
        return recipes;
    }

    async loadCategoriesFromJson(fileName) {
        let json = await this.readFile(fileName).then((data) => {return data}).catch((err) => {console.log(err)});
        let categories = JSON.parse(json);
        return categories;
    }

    async loadRecipesFromCSV(fileName) {
        let csv = await this.readFile(fileName).then((data) => {return data}).catch((err) => {console.log(err)});
        let recipes = [];
        let lines = csv.split("\n");
        for(let line of lines) {
            let data = line.split(",");
            let recipe = new Recipe(data[0], data[1], data[2]);
            recipes.push(recipe);
        }
        return recipes;
    }

    async loadCategoriesFromCSV(fileName) {
        let csv = await this.readFile(fileName).then((data) => {return data}).catch((err) => {console.log(err)});
        let categories = [];
        let lines = csv.split("\n");
        for(let line of lines) {
            let data = line.split(",");
            let category = new Category(data[0], data[1]);
            categories.push(category);
        }
        return categories;
    }
}

var chefkochAPI = new ChefkochAPI();

module.exports.chefkochAPI = chefkochAPI;
module.exports.DataParser = DataParser;
module.exports.Recipe = Recipe;
module.exports.Category = Category;
module.exports.Ingredient = Ingredient;
module.exports.ChefkochAPI = ChefkochAPI;