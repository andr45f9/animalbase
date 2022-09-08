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
};

function start() {
  console.log("ready");

  // TODO: Add event-listeners to filter and sort buttons
  //Get the filter buttons
  const filterButtons = document.querySelectorAll("button");

  //Add eventlistener to filterButtons
  filterButtons.forEach((button) => button.addEventListener("click", animalTypeFilter));

  loadJSON();
}

async function loadJSON() {
  const response = await fetch("animals.json");
  const jsonData = await response.json();

  // when loaded, prepare data objects
  prepareObjects(jsonData);
}

function prepareObjects(jsonData) {
  allAnimals = jsonData.map(preapareObject);

  // TODO: This might not be the function we want to call first
  displayList(allAnimals);
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

//isCat function - checks if the animal type is a cat.
function isCat(animal) {
  if (animal.type === "cat") {
    return true;
  } else {
    return false;
  }
}

//isDog function - checks if the animal type is a dog.
function isDog(animal) {
  if (animal.type === "dog") {
    return true;
  } else {
    return false;
  }
}

//all function - makes it possible to see all animal types.
function all() {
  return true;
}

//(My function) - where i filter the animals before they are displayed.
function animalTypeFilter() {
  let filteredAnimals;

  //get filter depending on data-filter attribute
  filter = this.dataset.filter;

  //filtering the animals corret depending on what type of animal they are and put it into filteredAnimals.
  if (filter == "*") {
    filteredAnimals = getFilterData(all);
  } else if (filter == "cat") {
    filteredAnimals = getFilterData(isCat);
  } else if (filter == "dog") {
    filteredAnimals = getFilterData(isDog);
  }
  displayList(filteredAnimals);
}

function getFilterData(filterFunction) {
  //filter on a criteia
  let filteredAnimals = allAnimals.filter(filterFunction);

  return filteredAnimals;
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

  // set clone data
  clone.querySelector("[data-field=name]").textContent = animal.name;
  clone.querySelector("[data-field=desc]").textContent = animal.desc;
  clone.querySelector("[data-field=type]").textContent = animal.type;
  clone.querySelector("[data-field=age]").textContent = animal.age;

  // append clone to list
  document.querySelector("#list tbody").appendChild(clone);
}
