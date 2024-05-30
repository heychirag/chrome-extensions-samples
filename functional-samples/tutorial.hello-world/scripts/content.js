// this is the content.js file for Hellofresh extension

let recipeData = {};
let requestSent = {};

function reqListener() {
  let url = this.responseURL;
  let recipeId = url.match("recipeId=(.*?)&")[1];
  recipeData[recipeId] = JSON.parse(this.responseText);
  displayCarbs(recipeId);
}

function displayCarbs(recipeId) {
  let recipeElem = document.querySelector(`[data-test-id="item-${recipeId}"]`);
  let data = recipeData[`${recipeId}`];
  if (data && data["status"] !== "recipe not found") {
    let nutrition = data["nutrition"];
    let carbInfo = nutrition.find(elem => elem["name"] === "Glucides");
    let carbAmount = carbInfo["amount"];
    let carbUnit = carbInfo["unit"];

    let itemName = recipeElem.querySelector(`[data-test-id="item-name"]`);

    if (itemName && !itemName.innerHTML.match(/C:/)) {
      itemName.prepend(`C: ${carbAmount}${carbUnit} `);
    }
  }
}

let observer = new MutationObserver(mutations => {
  for (let mutation of mutations) {
    if (mutation.type === "attributes") {
      let recipes = document.querySelectorAll('[data-test-id]');
      for (elem of recipes) {
        if (elem.getAttribute("data-test-id").match(/item-(.*)/)
          && elem.getAttribute("data-test-id").match(/item-(.*)/)[1].length > 10) {
          let recipeId = elem.getAttribute("data-test-id").match(/item-(.*)/)[1];
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
  }
});
observer.observe(document, {attributes: true, subtree: true, childList: true});