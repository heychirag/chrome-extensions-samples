// this is the content.js file for Hellofresh extension

let recipeData = {};
let requestSent = {};

function reqListener() {
  let url = this.responseURL;
  let recipeId = url.match("recipeId=(.*?)&")[1];
  recipeData[recipeId] = this.responseText;
  displayCarbs(recipeId);
}

function displayCarbs(recipeId) {
  let recipeElem = document.querySelector(`[data-recipe-id="${recipeId}"]`);
  let data = JSON.parse(recipeData[recipeId]);
  let nutrition = data["nutrition"];
  let carbInfo = nutrition.find(elem => elem["name"] === "Glucides");
  let carbAmount = carbInfo["amount"];
  let carbUnit = carbInfo["unit"];

  let time = recipeElem.querySelector(`[data-test-id="recipe-card-cooking-time"]`);

  if (!time.innerHTML.match(/Carbs:/)) {
    time.append(` Carbs: ${carbAmount}${carbUnit}`);
  }
}

let observer = new MutationObserver(mutations => {
  for (let mutation of mutations) {
    if (mutation.type === "attributes") {
      let recipes = document.querySelectorAll('[data-recipe-id]');
      for (elem of recipes) {
        let recipeId = elem.getAttribute("data-recipe-id");
        if (!(recipeId in recipeData) && !(recipeId in requestSent)) {
          let url = `https://www.hellofresh.lu/gw/recipes/recipes/${recipeId}?recipeId=${recipeId}&country=lu&locale=fr-LU`;

          const tokenRegex = /%22access_token%22:%22(.*)%22%2C%22expires_in%22/
          const authToken = document.cookie.match(tokenRegex)[1];

          const req = new XMLHttpRequest();
          req.addEventListener("load", reqListener);
          req.open("GET", url);
          req.setRequestHeader("Authorization", `Bearer ${authToken}`);
          req.send();

          requestSent[recipeId] = true;
        } else {
          displayCarbs(recipeId);
        }
      }
    }
  }
});
observer.observe(document, {attributes: true, subtree: true, childList: true});