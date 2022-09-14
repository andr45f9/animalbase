"use strict";

window.addEventListener("DOMContentLoaded", start);

let allAnimals = [];

//this variable makes it possible for us to filter by all animal types later on.
let filter = "*";

// The prototype for all animals:
const Animal = {
  name: "",
  desc: "-unknown animal-",
  type: "",
  age: 0,
  star: false,
  winner: false,
};

//Settings object for all the global variables.
const settings = {
  filter: "all",
  sortBy: "name",
  sortDir: "asc",
};

function start() {
  console.log("ready");

  registerButtons();
  loadJSON();
}

function registerButtons() {
  //Get filter buttons in html and make them clickable and add event listeners
  document.querySelectorAll("[data-action='filter']").forEach((button) => button.addEventListener("click", selectFilter));

  //Get sorting in html and make them clickable and add event listeners
  document.querySelectorAll("[data-action='sort']").forEach((button) => button.addEventListener("click", selectSort));
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allAnimals = jsonData.map(preapareObject);

  //This makes it possible for us to sort and filter on the first load.
  buildList();
}

function preapareObject(jsonObject) {
  const animal = Object.create(Animal);

  const texts = jsonObject.fullname.split(" ");
  animal.name = texts[0];
  animal.desc = texts[2];
  animal.type = texts[3];
  animal.age = jsonObject.age;

  return animal;
}

//------ALL filtering----------- Filtering by cat or dog or all animals.
function selectFilter(event) {
  const filter = event.target.dataset.filter;

  console.log(`User selected: ${filter}`);
  setFilter(filter);
}

function setFilter(filter) {
  settings.filterBy = filter;
  buildList();
}

function filterList(filteredList) {
  //let filteredList = allAnimals;

  if (settings.filterBy === "cat") {
    //create a filtered list of only cats:
    filteredList = allAnimals.filter(isCat);
  } else if (settings.filterBy === "dog") {
    //create a filtered list of only dogs:
    filteredList = allAnimals.filter(isDog);
  }

  return filteredList;
}

//isCat function - checks if the animal type is a cat.
function isCat(animal) {
  return animal.type === "cat";
}

//isDog function - checks if the animal type is a dog.
function isDog(animal) {
  return animal.type === "dog";
}

//------ALL sorting----------- Sorting by name, type, desc, age in alphabetic order by using .sort.
function selectSort(event) {
  const sortBy = event.target.dataset.sort;
  const sortDir = event.target.dataset.sortDirection;

  //Find "old" sortBy element, and remove .sortBy
  const oldElement = document.querySelector(`[data-sort='${settings.sortBy}']`);
  oldElement.classList.remove("sortby");

  //Indicate active sort
  event.target.classList.add("sortby");

  //Toggle the direction!
  if (sortDir === "asc") {
    event.target.dataset.sortDirection = "desc";
  } else {
    event.target.dataset.sortDirection = "asc";
  }

  console.log(`User selected: ${sortBy} - ${sortDir}`);
  setSort(sortBy, sortDir);
}

function setSort(sortBy, sortDir) {
  settings.sortBy = sortBy;
  settings.sortDir = sortDir;

  buildList();
}

function sortList(sortedList) {
  //let sortedList = allAnimals;
  let direction = 1;

  if (settings.sortDir === "desc") {
    direction = -1;
  } else {
    direction = 1;
  }

  sortedList = sortedList.sort(sortByProperty);

  //console.log("sortBy: ", settings.sortBy);

  function sortByProperty(a, b) {
    if (a[settings.sortBy] < b[settings.sortBy]) {
      return -1 * direction;
    } else {
      return 1 * direction;
    }
  }

  return sortedList;
}
//------sorting END-----------//

function buildList() {
  const currentList = filterList(allAnimals);
  const sortedList = sortList(currentList);

  displayList(sortedList);
}

function displayList(animals) {
  // clear the list
  document.querySelector("#list tbody").innerHTML = "";

  // build a new list
  animals.forEach(displayAnimal);
}

function displayAnimal(animal) {
  // create clone
  const clone = document.querySelector("template#animal").content.cloneNode(true);

  // set clone data for the rest
  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  // set clone data for STAR
  if (animal.star === true) {
    clone.querySelector("[data-field=star]").textContent = "⭐";
  } else {
    clone.querySelector("[data-field=star]").textContent = "☆";
  }

  clone.querySelector("[data-field=star]").addEventListener("click", clickStar);

  function clickStar() {
    if (animal.star === true) {
      animal.star = false;
    } else {
      animal.star = true;
    }

    buildList();
  }

  // set clone data for WINNERS
  clone.querySelector("[data-field=winner]").dataset.winner = animal.winner;
  clone.querySelector("[data-field=winner]").addEventListener("click", clickWinner);

  function clickWinner() {
    if (animal.winner === true) {
      animal.winner = false;
    } else {
      tryToMakeAWinner(animal);
    }

    buildList();
  }

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}

function tryToMakeAWinner(selectedAnimal) {
  const winners = allAnimals.filter((animal) => animal.winner === true);
  const numberOfWinners = winners.length;
  const other = winners.filter((animal) => animal.type === selectedAnimal.type).shift();

  //check if there is another of the same type selected.
  if (other !== undefined) {
    removeOther(other);
  } else if (numberOfWinners >= 2) {
    removeAorB(winners[0], winners[1]);
  } else {
    makeWinner(selectedAnimal);
  }

  function removeOther(other) {
    //ask the user to ignore or remove the "other".
    document.querySelector("#remove_other").classList.remove("hide");
    document.querySelector("#remove_other .close_button").addEventListener("click", closeDialog);
    document.querySelector("#remove_other #removeother_button").addEventListener("click", clickRemoveOther);

    //Show the selected animal name on the button:
    document.querySelector("#remove_other [data-field=otherwinner]").textContent = other.name;

    //if user ignores then do nothing..
    function closeDialog() {
      //adding hide so the dialog box will be hidden when the user close the dialog box:
      document.querySelector("#remove_other").classList.add("hide");
      //remembering to remove eventListeners again:
      document.querySelector("#remove_other .close_button").removeEventListener("click", closeDialog);
      document.querySelector("#remove_other #removeother_button").removeEventListener("click", clickRemoveOther);
    }

    //if remove the "other" do this:
    function clickRemoveOther() {
      removeWinner(other);
      makeWinner(selectedAnimal);

      buildList();
      closeDialog();
    }
  }

  function removeAorB(winnerA, winnerB) {
    //ask the user to ignore or remove A or B.
    document.querySelector("#remove_aorb").classList.remove("hide");
    document.querySelector("#remove_aorb .close_button").addEventListener("click", closeDialog);
    document.querySelector("#remove_aorb #remove_a").addEventListener("click", clickRemoveA);
    document.querySelector("#remove_aorb #remove_b").addEventListener("click", clickRemoveB);

    //Show the selected animals names on the buttons:
    document.querySelector("#remove_aorb [data-field=winnerA]").textContent = winnerA.name;
    document.querySelector("#remove_aorb [data-field=winnerB]").textContent = winnerB.name;

    //if user ignores then do nothing..
    function closeDialog() {
      //adding hide so the dialog box will be hidden when the user close the dialog box:
      document.querySelector("#remove_aorb").classList.add("hide");
      //remembering to remove eventListeners again:
      document.querySelector("#remove_aorb .close_button").removeEventListener("click", closeDialog);
      document.querySelector("#remove_aorb #remove_a").removeEventListener("click", clickRemoveA);
      document.querySelector("#remove_aorb #remove_b").removeEventListener("click", clickRemoveB);
    }

    //if removeA do this:
    function clickRemoveA() {
      removeWinner(winnerA);
      makeWinner(selectedAnimal);

      buildList();
      closeDialog();
    }

    //else if removeB then:
    function clickRemoveB() {
      removeWinner(winnerB);
      makeWinner(selectedAnimal);

      buildList();
      closeDialog();
    }
  }

  function removeWinner(winnerAnimal) {
    winnerAnimal.winner = false;
  }

  function makeWinner(animal) {
    animal.winner = true;
  }
}
