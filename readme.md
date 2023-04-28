# Chefkoch API Documentation
Welcome to the new Chefkoch API documentation.
if you are from chefkoch.de and want me to take the package down, please contact me on github.
## Introduction
The Chefkoch API is a API Wrapper that allows you to access the data of the chefkoch.de website.

## Installation
To install the API, you need to type the following command in your terminal:
```
npm install chefkoch-api
```

## Usage
To use the API, you need to import the API in your code:
```
const chefkoch = require('chefkoch-api');
```

## Performance
Since the API is based on webscraping, it is very slow.
If you want to get all the recipes, it will take a very, very long time.
It will go through n(default=5) pages of the website and scrape all the ingredients of every single recipe.
Currently it **just supports ingredients** because of performance issues and the fact that I don't need the other data for my project.

## Technical Details
The API is based on webscraping.
Every function returns a class that contains the data of the website.
There is a DataParser Class where you can store data in a JSON or CSV file and read it again later.
Pay attention that you use the "chefkochAPI" instance instead of the "ChefkochAPI" class!
Since version 1.2.0 the API has a builtin beautifier that removes, newlines, tabs, multiple spaces, trailing spaces and leading spaces.
## Examples
### Get all recipes
WARNING: THIS IS VERY SLOW!
```
chefkoch.chefkochAPI.getAllRecipes().then(function(data){
    console.log(data);
});
```
### Get all the categories
```
chefkoch.chefkochAPI.getCategories().then(function(data){
    console.log(data);
});
```
### Get the recipes of a category
```
chefkoch.chefkochAPI.getCategories().then(function(data){
    let category = data[0];
    chefkoch.chefkochAPI.getRecipes(category, 5/*these are the amount of pages to scrape, this is optional*/, 0/*this is the Start page*/).then(function(data){
        console.log(data);
    });
});
```
### Search for recipes
```
chefkoch.chefkochAPI.searchRecipes('pizza', 5/*these are the amount of pages to scrape, this is optional*/, 0/*this is the Start page*/).then(function(data){
    console.log(data);
});
```
### Get a recipe
```
chefkoch.chefkochAPI.getRecipe('/rezepte/1127371219159420/Dinkel-Hirse-Vollkornbrot.html'/*this is the subURL of the recipe*/).then(function(data){
    console.log(data);
});
```
### write to a Json
```
const chefkoch = require("chefkoch-api");
async function init() {
    await chefkoch.chefkochAPI.searchRecipes("raclette").then(function(data) {
        new chefkoch.DataParser().writeRecipesToJson(data, "raclette.json")
    })
}
init()
```

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=gamersi/chefkoch-api&type=Date)](https://star-history.com/#gamersi/chefkoch-api&Date)
