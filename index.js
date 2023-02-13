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

class Tag {
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

class Recipe {
    constructor(name, url, ingredients, category, tags = []) {
        this.name = name;
        this.url = url;
        this.ingredients = ingredients;
        this.category = category;
        this.tags = tags;
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

    getTags() {
        return this.tags;
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
        let tags = [];
        while(index <= endIndex) {
            category.url = category.url.replace("/s0/", `/s${index}/`);
            const response = await fetch(this.baseURL + category.url);
            const html = await response.text();
            const soup = new JSSoup(html);
            soup.findAll("div", {"class": "ds-recipe-card"}).forEach(async recipe_card => {
                let recipeName = this.beautifyText(recipe_card.find("h3").text);
                let recipeURL = recipe_card.find("a").attrs.href.split("#")[0];
                let ingredient_list = [];
                const response2 = await fetch(recipeURL);
                const html2 = await response2.text();
                const soup2 = new JSSoup(html2);
                let ingredientTable = soup2.find("table", {"class": "ingredients"});
                if(ingredientTable != null) {
                    ingredientTable = ingredientTable.find("tbody");
                    ingredientTable.findAll("tr").forEach(ingredient_row => {
                        let ingredient_name = ingredient_row.find("td", {"class": "td-right"}).find("span");
                        if(ingredient_name != null) {
                            if(ingredient_name.find("a") != null) {
                                ingredient_name = this.beautifyText(ingredient_name.find("a").text);
                            } else {
                                ingredient_name = this.beautifyText(ingredient_name.text);
                            }
                        } else {
                            ingredient_name = "No ingredient name found";
                        }
                        let ingredient_amount = ingredient_row.find("td", {"class": "td-left"}).find("span");
                        if(ingredient_amount != null) {
                            if(ingredient_amount.find("a") != null) {
                                ingredient_amount = this.beautifyText(ingredient_amount.find("a").text);
                            } else {
                                ingredient_amount = this.beautifyText(ingredient_amount.text);
                            }
                        } else {
                            ingredient_amount = "No ingredient amount found";
                        }
                        ingredient_list.push(new Ingredient(ingredient_name, ingredient_amount));
                    });
                } else {
                    ingredient_list.push(new Ingredient("No ingredients found", "none"));
                }
                let tagElement = soup2.find("div", {"class": "recipe-tags"});
                if(tagElement != null) {
                    tagElement.findAll("a").forEach(tagElement => {
                        tags.push(new Tag(tagElement.text, tagElement.attrs.href));
                    });
                } else {
                    tags.push(new Tag("No tags found", "none"));
                }
                let recipe = new Recipe(recipeName, recipeURL, ingredient_list, category, tags);
                recipes.push(recipe);
                tags = [];
            });
            index++;
        }
        return recipes;
    }

    beautifyText(text) {
        // remove newlines and tabs
        text = text.replace(/(\r\n|\n|\r|\t)/gm, "");
        // remove multiple whitespaces
        text = text.replace(/\s\s+/g, ' ');
        // remove whitespaces at the beginning and end of the string
        text = text.trim();
        return text;
    }

    async getAllRecipes(endIndex = 5, startIndex = 0) {
        let recipes = [];
        let categories = await this.getCategories();
        for(let category of categories) {
            let category_recipes = await this.getRecipes(category, endIndex, startIndex);
            recipes.push(...category_recipes);
        }
        return recipes;
    }

    async searchRecipes(query, endIndex = 5, startIndex = 0) {
        let index = startIndex;
        let recipes = [];
        let tags = [];
        while(index <= endIndex) {
            const response = await fetch(`${this.baseURL}/rs/s${index}/${query}/Rezepte.html`);
            const html = await response.text();
            const soup = new JSSoup(html);
            soup.findAll("div", {"class": "ds-recipe-card"}).forEach(async recipe_card => {
                let recipeName = this.beautifyText(recipe_card.find("h3").text);
                let recipeURL = recipe_card.find("a").attrs.href.split("#")[0];
                let ingredient_list = [];
                const response2 = await fetch(recipeURL);
                const html2 = await response2.text();
                const soup2 = new JSSoup(html2);
                let ingredientTable = soup2.find("table", {"class": "ingredients"});
                if(ingredientTable != null) {
                    ingredientTable = ingredientTable.find("tbody");
                    ingredientTable.findAll("tr").forEach(ingredient_row => {
                        let ingredient_name = ingredient_row.find("td", {"class": "td-right"}).find("span");
                        if(ingredient_name != null) {
                            if(ingredient_name.find("a") != null) {
                                ingredient_name = this.beautifyText(ingredient_name.find("a").text);
                            } else {
                                ingredient_name = this.beautifyText(ingredient_name.text);
                            }
                        } else {
                            ingredient_name = "No ingredient name found";
                        }
                        let ingredient_amount = ingredient_row.find("td", {"class": "td-left"}).find("span");
                        if(ingredient_amount != null) {
                            if(ingredient_amount.find("a") != null) {
                                ingredient_amount = this.beautifyText(ingredient_amount.find("a").text);
                            } else {
                                ingredient_amount = this.beautifyText(ingredient_amount.text);
                            }
                        } else {
                            ingredient_amount = "No ingredient amount found";
                        }
                        ingredient_list.push(new Ingredient(ingredient_name, ingredient_amount));
                    });
                } else {
                    ingredient_list.push(new Ingredient("No ingredients found", "none"));
                }
                let category = null;
                let categoryURL = soup2.find("ol", {"class": "ds-col-12"});
                if(categoryURL != null) {
                    // 4th element is the category
                    categoryURL = categoryURL.findAll("li")[3].find("a").attrs.href;
                    category = await this.getCategory(categoryURL);
                }
                let tagElement = soup2.find("div", {"class": "recipe-tags"});
                if(tagElement != null) {
                    tagElement.findAll("a").forEach(tagElement => {
                        tags.push(new Tag(tagElement.text, tagElement.attrs.href));
                    });
                } else {
                    tags.push(new Tag("No tags found", "none"));
                }
                let recipe = new Recipe(recipeName, recipeURL, ingredient_list, category, tags);
                recipes.push(recipe);
                tags = [];
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
        let tags = [];
        let ingredient_list = [];
        const ingredientTable = soup.find("table", {"class": "ingredients"});
        if(ingredientTable != null) {
            ingredientTable.findAll("tr").forEach(ingredient_row => {
                let ingredient_name = this.beautifyText(ingredient_row.find("td", {"class": "td-right"}).text);
                let ingredient_amount = this.beautifyText(ingredient_row.find("td", {"class": "td-left"}).text);
                ingredient_list.push(new Ingredient(ingredient_name, ingredient_amount));
            });
        }
        let category = null;
        let categoryURL = soup.find("ol", {"class": "ds-col-12"});
        if(categoryURL != null) {
            // 4th element is the category
            categoryURL = categoryURL.findAll("li")[3].find("a").attrs.href;
            category = await this.getCategory(categoryURL);
        }
        let tagElement = soup.find("div", {"class": "recipe-tags"});
        if(tagElement != null) {
            tagElement.findAll("a").forEach(tagElement => {
                tags.push(new Tag(tagElement.text, tagElement.attrs.href));
            });
        } else {
            tags.push(new Tag("No tags found", "none"));
        }
        let recipe = new Recipe(recipeName, recipeSubURL, ingredient_list, category, tags);
        return recipe;
    }

    async getCategory(categorySubURL) {
        const response = await fetch(this.baseURL + categorySubURL);
        const html = await response.text();
        const soup = new JSSoup(html);
        let categoryName = this.beautifyText(soup.find("h1").text).split(" Rezepte")[0];
        let category = new Category(categoryName, categorySubURL);
        return category;
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
module.exports.Tag = Tag;
module.exports.Recipe = Recipe;
module.exports.Category = Category;
module.exports.Ingredient = Ingredient;
module.exports.ChefkochAPI = ChefkochAPI;