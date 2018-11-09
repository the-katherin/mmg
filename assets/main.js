const doc = document;

const welcomeWindow = doc.getElementById('welcomeWindow');
const gameWindow = doc.getElementById('gameWindow');
const congratulationsWindow = doc.getElementById('congratulationsWindow');
const cardsContainer = doc.getElementById('cardsContainer');
const scoreList = doc.getElementById('score');
const form = document.forms.userSelectionForm;
const userDataForm = form.elements.userData.elements;
const usersStorage = localStorage.getItem("users");
const timer = document.getElementById('timer');


let user;
let userDataString;
let usersArray;
let userName;
let userLastName;
let userEmail;
let level;
let cardsBackNumber;
let card;
let cardsArray = [];
let firstGuess;
let secondGuess;
let previousGuess;
let delay = 1150;
let clickCounter = 0;
let matchesCounter = 1;
let second = 0;
let timerInterval;
let scoreTableLength = 0;

class User  {
    constructor(name, lastName, email, level){
      this.name = name;
      this.lastName = lastName;
      this.email = email;
      this.score = null;
      this.level = level;
    }
}

form.addEventListener('submit', startGame);

function startGame(event) {
  event.preventDefault();
  changeWindow(welcomeWindow, gameWindow);
  getUserChoiceFromForm();
  addUserDataToLocalStorage();
  loadImages();
  setTimer();
}

function finishGame() {
  changeWindow(gameWindow, congratulationsWindow);
  addResultsToScoreTable();
  clearInterval(timerInterval);
}

function changeWindow(window1, window2) {
        hideWindow(window1);
        showWindow(window2);
}

function hideWindow(windowForHide) {
      windowForHide.classList.remove('show');
      windowForHide.classList.add('hidden');
}

function showWindow(windowForShow) {
  windowForShow.classList.remove('hidden');
  windowForShow.classList.add('show');
}

function getUserChoiceFromForm() {
  userName = userDataForm[0].value;
  userLastName = userDataForm[1].value;
  userEmail = userDataForm[2].value;
  level = +form.elements.level.value;
  cardsBackNumber = +form.elements.cardsBack.value;
}

function addUserDataToLocalStorage() {
  user = new User(userName, userLastName, userEmail, level);
  userDataString = JSON.stringify(user);

  // if users Storage is empty create localStorage
  if (!usersStorage) {
    usersArray = [userDataString];
    localStorage.setItem("users", JSON.stringify(usersArray));
    return;
  }
  addToStorage();
}

function addToStorage() {

      // check whether user is already in localStorage
      usersArray = JSON.parse(usersStorage);
      if (usersArray.includes(userDataString)) {
        return;
      }

      // and if not change localStorage data
      usersArray.push(userDataString);
      localStorage.setItem("users", JSON.stringify(usersArray));
}


function loadImages() {
  gameWindow.classList.add('size' + level);
  loadFrontImages();
  loadShuffledBackImages(level);
}

function loadFrontImages() {
  let front = new Image();
  front.src = 'assets/images/cardsback' + cardsBackNumber + '.jpg';
  front.classList.add('front');
  card = doc.createElement('div');
  card.classList.add('card');
  card.appendChild(front);
}

function loadShuffledBackImages () {
  loadBackImages(level);
  shuffle(cardsArray);
  showShuffledCards(cardsArray);
}

function loadBackImages (numberOfImages) {
  for (numberOfImages; numberOfImages > 0; numberOfImages--) {
    let img = new Image();
    img.src = 'assets/images/' + numberOfImages + '.png';
    img.classList.add('back');
    cardsArray.push(img);
    let imgClone = img.cloneNode(true);
    cardsArray.push(imgClone);
  }
}

function shuffle(array) {
    array.sort(() => 0.5 - Math.random());
}

function showShuffledCards (array) {
      cardsArray.forEach(item => {
      let cardClone = card.cloneNode(true);
      cardClone.appendChild(item);
      cardsContainer.appendChild(cardClone);
   });
}

cardsContainer.addEventListener('click', function(event) {

  let clicked = event.target;

  if (clicked.nodeName === 'MAIN' || previousGuess === clicked) {
    return;
  }
  if (clickCounter < 2) {
    clickCounter += 1;
    clicked.parentNode.classList.add('selected');
    if (clickCounter === 1) {
      firstGuess = clicked.nextElementSibling.getAttribute("src");
      previousGuess = clicked.nextElementSibling;
    } else {
      secondGuess = clicked.nextElementSibling.getAttribute("src");
      if (firstGuess === secondGuess) {
        setTimeout(match, delay);
        setTimeout(resetSelections, delay);
        setTimeout(isFinished, delay);
      } else {
        setTimeout(resetSelections, delay);
      }
    }
  }
});


const match = () => {
  let selected = doc.querySelectorAll('.selected');
  selected.forEach(card => {
    card.classList.add('match');
  });
}

const resetSelections = () => {
  clickCounter = 0;
  previousGuess = '';
  let selected = doc.querySelectorAll('.selected');
  selected.forEach(card => {
    card.classList.remove('selected');
  });
};

function isFinished() {
  if (matchesCounter===level) {
    finishGame();
  }
  else {
  matchesCounter+=1;
  }
}

function setTimer () {
  timerInterval = setInterval(function(){
          timer.innerHTML = second+"secs";
          second++;
      },1000);
}


 function addResultsToScoreTable() {
  setUserScoreInLocaleStorage();
  usersArray.sort(compareScore);
  showScoreInTable(usersArray);
  refreshLocaleStorage(usersArray);
}

function setUserScoreInLocaleStorage() {
  let userIndex = usersArray.indexOf(userDataString);
  usersArray = usersArray.map(function(item) {
    return JSON.parse(item);
  });
  usersArray[userIndex].score = parseInt(timer.innerHTML);
}

function showScoreInTable(array) {
  array.forEach(item => {
    if (item.score && scoreTableLength < 10 && item.level == level) {
      let li = doc.createElement('li');
      li.innerHTML = item.name + " " + item.lastName + ": " + item.score + 'secs';
      scoreList.appendChild(li);
      scoreTableLength += 1;
    }
  });
}

function refreshLocaleStorage(array) {
  usersArray = usersArray.map(function(item) {
    return JSON.stringify(item);
  });
  localStorage.setItem("users", JSON.stringify(usersArray));
}

function compareScore(userA, userB) {
  return userA.score - userB.score;
}
