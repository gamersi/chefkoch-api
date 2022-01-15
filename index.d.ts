export var chefkochAPI: ChefkochAPI;
export class DataParser {
    writeFile(fileName: any, data: any): Promise<void>;
    readFile(fileName: any): Promise<any>;
    writeRecipesToJson(recipes: any, fileName: any): Promise<void>;
    writeCategoriesToJson(categories: any, fileName: any): Promise<void>;
    writeRecipesToCSV(recipes: any, fileName: any): Promise<void>;
    writeCategoriesToCSV(categories: any, fileName: any): Promise<void>;
    loadRecipesFromJson(fileName: any): Promise<any>;
    loadCategoriesFromJson(fileName: any): Promise<any>;
    loadRecipesFromCSV(fileName: any): Promise<Recipe[]>;
    loadCategoriesFromCSV(fileName: any): Promise<Category[]>;
}
export class Recipe {
    constructor(name: any, url: any, ingredients: any, category: any);
    name: any;
    url: any;
    ingredients: any;
    category: any;
    getName(): any;
    getUrl(): any;
    getIngredients(): any;
    getCategory(): any;
    toString(): any;
}
export class Category {
    constructor(name: any, url: any);
    name: any;
    url: any;
    getName(): any;
    getUrl(): any;
    toString(): any;
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