export var chefkochAPI: ChefkochAPI;
export class DataParser {
    writeFile(fileName: String, data: any): Promise<void>;
    readFile(fileName: String): Promise<any>;
    writeRecipesToJson(recipes: any, fileName: String): Promise<void>;
    writeCategoriesToJson(categories: any, fileName: String): Promise<void>;
    writeRecipesToCSV(recipes: any, fileName: String): Promise<void>;
    writeCategoriesToCSV(categories: any, fileName: String): Promise<void>;
    loadRecipesFromJson(fileName: String): Promise<any[]>;
    loadCategoriesFromJson(fileName: String): Promise<any[]>;
    loadRecipesFromCSV(fileName: String): Promise<any[]>;
    loadCategoriesFromCSV(fileName: String): Promise<any[]>;
}
export class Recipe {
    constructor(name: String, url: String, ingredients: Ingredient[], category: String);
    name: String;
    url: String;
    ingredients: Ingredient[];
    category: String;
    getName(): String;
    getUrl(): String;
    getIngredients(): Ingredient[];
    getCategory(): String;
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
    baseURL: string;
    getCategories(): Promise<Category[]>;
    getRecipes(category: Category, endIndex?: number, startIndex?: number): Promise<any[]>;
    getAllRecipes(endIndex?: number, startIndex?: number): Promise<any[][]>;
    searchRecipes(query: String, endIndex?: number, startIndex?: number): Promise<any[]>;
    getRecipe(recipeSubURL: String): Promise<Recipe>;
}
//# sourceMappingURL=index.d.ts.map