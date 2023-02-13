export var chefkochAPI: ChefkochAPI;
export class DataParser {
    writeFile(fileName: String, data: any): Promise<void>;
    readFile(fileName: String): Promise<any>;
    writeRecipesToJson(recipes: Recipe[], fileName: String): Promise<void>;
    writeCategoriesToJson(categories: Category[], fileName: String): Promise<void>;
    writeRecipesToCSV(recipes: Recipe[], fileName: String): Promise<void>;
    writeCategoriesToCSV(categories: Category[], fileName: String): Promise<void>;
    loadRecipesFromJson(fileName: String): Promise<any>;
    loadCategoriesFromJson(fileName: String): Promise<any>;
    loadRecipesFromCSV(fileName: String): Promise<Recipe[]>;
    loadCategoriesFromCSV(fileName: String): Promise<Category[]>;
}
export class Recipe {
    constructor(name: String, url: String, ingredients: Ingredient[], category: Category);
    name: String;
    url: String;
    ingredients: Ingredient[];
    category: Category;
    getName(): String;
    getUrl(): String;
    getIngredients(): Ingredient[];
    getCategory(): Category;
    toString(): String;
}
export class Category {
    constructor(name: String, url: String);
    name: String;
    url: String;
    getName(): String;
    getUrl(): String;
    toString(): String;
}
export class Ingredient {
    constructor(name: String, amount: String);
    name: String;
    amount: String;
    getName(): String;
    getAmount(): String;
    toString(): String;
}
export class ChefkochAPI {
    baseURL: String;
    getCategories(): Promise<Category[]>;
    getRecipes(category: Category, endIndex?: number, startIndex?: number): Promise<Recipe[]>;
    beautifyText(text: String): String;
    getAllRecipes(endIndex?: number, startIndex?: number): Promise<Recipe[]>;
    searchRecipes(query: String, endIndex?: number, startIndex?: number): Promise<Recipe[]>;
    getRecipe(recipeSubURL: String): Promise<Recipe>;
    getCategory(categorySubURL: String): Promise<Category>;
}
//# sourceMappingURL=index.d.ts.map