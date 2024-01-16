const scoreCounter = document.querySelector('.score-counter');
const grid = document.querySelector('.grid');
const endGameScreen = document.querySelector('.end-game-screen');
const endGameText = document.querySelector('.end-game-text');
const playAgainButton = document.querySelector('.play-again');

const totalCells = 100;
const totalBombs = 20;
const maxScore = 5;
const bombsList = [];

let score = 0;

function updateScore() {
  score++;

  scoreCounter.innerText = score.toString().padStart(5, '0');

  if (score === maxScore) {
    endGame(true);
  }
}

function endGame(isVictory) {
  if (isVictory) {
    endGameText.innerHTML = 'You<br>Won';
    endGameScreen.classList.add('win');
  }
  endGameScreen.classList.remove('hidden');
}

//console.log(`Your score is ${score}`);

for (let i = 1; i <= 100; i++) {
  // cell = <div></div>
  const cell = document.createElement('div');

  // cell = <div class="cell"> </div>
  cell.classList.add('cell');

  cell.addEventListener('click', function () {
    if (bombsList.includes(i)) {
      cell.classList.add('cell-bomb');
      endGame(false);
    }
    cell.classList.add('cell-clicked');
    updateScore();
  });

  // Add one cell to grid
  grid.appendChild(cell);
}

while (bombsList.length < totalBombs) {
  const randomNumber = Math.floor(Math.random() * totalCells) + 1;

  if (!bombsList.includes(randomNumber)) {
    bombsList.push(randomNumber);
  }

  console.log(randomNumber);
}

playAgainButton.addEventListener('click', function () {
  window.location.reload();
});
