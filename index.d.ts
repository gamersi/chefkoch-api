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
export class Tag {
    constructor(name: any, url: any);
    name: any;
    url: any;
    getName(): any;
    getUrl(): any;
    toString(): any;
}
export class Recipe {
    constructor(name: any, url: any, ingredients: any, category: any, tags?: any[], description?: string);
    name: any;
    url: any;
    ingredients: any;
    category: any;
    tags: any[];
    description: string;
    getName(): any;
    getUrl(): any;
    getIngredients(): any;
    getCategory(): any;
    getTags(): any[];
    getDescription(): string;
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
    constructor(name: any, amount: any);
    name: any;
    amount: any;
    getName(): any;
    getAmount(): any;
    toString(): any;
}
export class ChefkochAPI {
    baseURL: string;
    getCategories(): Promise<any[]>;
    getRecipes(category: any, endIndex?: number, startIndex?: number): Promise<Recipe[]>;
    extractIngredients(soup: any): Ingredient[];
    extractTags(soup: any): Tag[];
    extractDescription(soup: any): string;
    extractCategory(soup: any): Promise<Category>;
    beautifyText(text: any): any;
    getAllRecipes(endIndex?: number, startIndex?: number): Promise<Recipe[]>;
    searchRecipes(query: any, endIndex?: number, startIndex?: number): Promise<Recipe[]>;
    getRecipe(recipeSubURL: any): Promise<Recipe>;
    getCategory(categorySubURL: any): Promise<Category>;
}
//# sourceMappingURL=index.d.ts.map