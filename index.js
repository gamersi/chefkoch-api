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
    constructor(name, url, ingredients, category, tags = [], description = "") {
        this.name = name;
        this.url = url;
        this.ingredients = ingredients;
        this.category = category;
        this.tags = tags;
        this.description = description;
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

    getDescription() {
        return this.description;
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
            try {
                category.url = category.url.replace("/s0/", `/s${index}/`);
                const response = await fetch(this.baseURL + category.url);
                const html = await response.text();
                const soup = new JSSoup(html);
                
                const recipeCards = soup.findAll("div", {"class": "ds-recipe-card"});
                
                // Process recipes sequentially to avoid overwhelming the server
                for (const recipe_card of recipeCards) {
                    try {
                        const recipeLink = recipe_card.find("a");
                        if (recipeLink && recipeLink.attrs.href) {
                            const recipeURL = recipeLink.attrs.href.split("#")[0];
                            
                            // Use the getRecipe method to get full recipe details including description
                            const recipe = await this.getRecipe(recipeURL);
                            recipes.push(recipe);
                        }
                    } catch (error) {
                        console.warn("Error processing recipe card:", error.message);
                        // Continue with next recipe
                    }
                }
            } catch (error) {
                console.warn(`Error fetching recipes page ${index}:`, error.message);
                // Continue with next page
            }
            index++;
        }
        
        return recipes;
    }

    // Helper method to extract ingredients from a recipe page soup
    extractIngredients(soup) {
        let ingredient_list = [];
        const ingredientTable = soup.find("table", {"class": "ingredients"});
        
        if (ingredientTable != null) {
            // Try to find tbody first, fallback to table directly
            const tbody = ingredientTable.find("tbody");
            const tableToUse = tbody || ingredientTable;
            
            tableToUse.findAll("tr").forEach(ingredient_row => {
                try {
                    // Extract ingredient name with more robust parsing
                    let ingredient_name = "No ingredient name found";
                    const nameCell = ingredient_row.find("td", {"class": "td-right"});
                    if (nameCell) {
                        const span = nameCell.find("span");
                        if (span) {
                            const link = span.find("a");
                            ingredient_name = this.beautifyText(link ? link.text : span.text);
                        } else {
                            ingredient_name = this.beautifyText(nameCell.text);
                        }
                    }

                    // Extract ingredient amount with more robust parsing
                    let ingredient_amount = "No ingredient amount found";
                    const amountCell = ingredient_row.find("td", {"class": "td-left"});
                    if (amountCell) {
                        const span = amountCell.find("span");
                        if (span) {
                            const link = span.find("a");
                            ingredient_amount = this.beautifyText(link ? link.text : span.text);
                        } else {
                            ingredient_amount = this.beautifyText(amountCell.text);
                        }
                    }

                    if (ingredient_name && ingredient_amount) {
                        ingredient_list.push(new Ingredient(ingredient_name, ingredient_amount));
                    }
                } catch (error) {
                    // Skip problematic ingredient rows but continue processing
                    console.warn("Error parsing ingredient row:", error.message);
                }
            });
        }
        
        // If no ingredients found, add a default entry
        if (ingredient_list.length === 0) {
            ingredient_list.push(new Ingredient("No ingredients found", "none"));
        }
        
        return ingredient_list;
    }

    // Helper method to extract tags from a recipe page soup
    extractTags(soup) {
        let tags = [];
        const tagElement = soup.find("div", {"class": "recipe-tags"});
        
        if (tagElement != null) {
            tagElement.findAll("a").forEach(tagElement => {
                try {
                    const tagText = this.beautifyText(tagElement.text);
                    const tagHref = tagElement.attrs.href;
                    if (tagText && tagHref) {
                        tags.push(new Tag(tagText, tagHref));
                    }
                } catch (error) {
                    console.warn("Error parsing tag:", error.message);
                }
            });
        }
        
        // If no tags found, add a default entry
        if (tags.length === 0) {
            tags.push(new Tag("No tags found", "none"));
        }
        
        return tags;
    }

    // Helper method to extract recipe description from a recipe page soup
    extractDescription(soup) {
        let description = "";
        
        // Common selectors where recipe descriptions might be found on chefkoch.de
        const descriptionSelectors = [
            "div.recipe-text",
            "div.ds-recipe-meta-description", 
            "div.recipe-description",
            "div.summary",
            "p.recipe-intro",
            "div.intro"
        ];
        
        for (const selector of descriptionSelectors) {
            try {
                const parts = selector.split(".");
                const tag = parts[0];
                const className = parts[1];
                
                const element = soup.find(tag, className ? {"class": className} : {});
                if (element && element.text) {
                    description = this.beautifyText(element.text);
                    if (description && description.length > 10) { // Ensure we got meaningful content
                        break;
                    }
                }
            } catch (error) {
                // Continue trying other selectors
                continue;
            }
        }
        
        return description || "No description found";
    }

    // Helper method to extract category from a recipe page soup
    extractCategory(soup) {
        try {
            const categoryURL = soup.find("ol", {"class": "ds-col-12"});
            if (categoryURL != null) {
                const categoryItems = categoryURL.findAll("li");
                if (categoryItems && categoryItems.length > 3) {
                    const categoryLink = categoryItems[3].find("a");
                    if (categoryLink && categoryLink.attrs.href) {
                        return this.getCategory(categoryLink.attrs.href);
                    }
                }
            }
        } catch (error) {
            console.warn("Error extracting category:", error.message);
        }
        return null;
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
        
        while(index <= endIndex) {
            try {
                const response = await fetch(`${this.baseURL}/rs/s${index}/${query}/Rezepte.html`);
                const html = await response.text();
                const soup = new JSSoup(html);
                
                const recipeCards = soup.findAll("div", {"class": "ds-recipe-card"});
                
                // Process recipes sequentially to avoid overwhelming the server
                for (const recipe_card of recipeCards) {
                    try {
                        const recipeLink = recipe_card.find("a");
                        if (recipeLink && recipeLink.attrs.href) {
                            const recipeURL = recipeLink.attrs.href.split("#")[0];
                            
                            // Use the getRecipe method to get full recipe details including description
                            const recipe = await this.getRecipe(recipeURL);
                            recipes.push(recipe);
                        }
                    } catch (error) {
                        console.warn("Error processing recipe card:", error.message);
                        // Continue with next recipe
                    }
                }
            } catch (error) {
                console.warn(`Error fetching search results page ${index}:`, error.message);
                // Continue with next page
            }
            index++;
        }
        
        return recipes;
    }


    async getRecipe(recipeSubURL) {
        try {
            const response = await fetch(this.baseURL + recipeSubURL);
            const html = await response.text();
            const soup = new JSSoup(html);
            
            // Extract recipe name
            const recipeName = this.beautifyText(soup.find("h1").text);
            
            // Extract ingredients using helper method
            const ingredient_list = this.extractIngredients(soup);
            
            // Extract tags using helper method
            const tags = this.extractTags(soup);
            
            // Extract description using helper method
            const description = this.extractDescription(soup);
            
            // Extract category using helper method
            const category = await this.extractCategory(soup);
            
            return new Recipe(recipeName, recipeSubURL, ingredient_list, category, tags, description);
        } catch (error) {
            console.error("Error fetching recipe:", error.message);
            throw error;
        }
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
            // Escape commas in description by wrapping in quotes
            const description = recipe.getDescription() ? recipe.getDescription().replace(/"/g, '""') : "";
            csv += `${recipe.getName()},${recipe.getUrl()},${recipe.getCategory()},"${description}"\n`;
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
            if (line.trim()) { // Skip empty lines
                // Simple CSV parsing that handles quoted descriptions
                const match = line.match(/^([^,]*),([^,]*),([^,]*),?"?([^"]*)"?$/);
                if (match) {
                    const [, name, url, category, description] = match;
                    let recipe = new Recipe(name || "", url || "", [], null, [], description || "");
                    recipes.push(recipe);
                } else {
                    // Fallback for old format
                    let data = line.split(",");
                    let recipe = new Recipe(data[0] || "", data[1] || "", [], null, [], data[3] || "");
                    recipes.push(recipe);
                }
            }
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