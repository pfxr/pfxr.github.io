const grid = document.querySelector('.grid');
const timer = document.querySelector('.timer');
const endGameScreen = document.querySelector('.end-game-screen');
const endGameText = document.querySelector('.end-game-text');
const playAgainBtn = document.querySelector('.play-again');

const gridMatrix = [
  ['', '', '', '', '', '', '', '', ''],
  [
    'river',
    'wood',
    'wood',
    'river',
    'wood',
    'river',
    'river',
    'river',
    'river',
  ],
  ['river', 'river', 'river', 'wood', 'wood', 'river', 'wood', 'wood', 'river'],
  ['', '', '', '', '', '', '', '', ''],
  ['road', 'bus', 'road', 'road', 'road', 'car', 'road', 'road', 'road'],
  ['road', 'road', 'road', 'car', 'road', 'road', 'road', 'road', 'bus'],
  ['road', 'road', 'car', 'road', 'road', 'road', 'bus', 'road', 'road'],
  ['', '', '', '', '', '', '', '', ''],
  ['', '', '', '', '', '', '', '', ''],
];

const victoryRow = 0;
const riverRows = [1, 2];
const roadRows = [4, 5, 6];
const duckPosition = { x: 4, y: 8 };

let contentBeforeDuck = '';
let time = 15;

// Draw on the grid
function drawGrid() {
  grid.innerHTML = '';

  // Go through each element of gridMatrix
  gridMatrix.forEach(function (gridRow, gridRowIndex) {
    gridRow.forEach(function (cellContent, cellContentIndex) {
      // Draw the cells
      // <div> </div>
      const cellDiv = document.createElement('div');

      // <div class="cell"> </dev>
      cellDiv.classList.add('cell');

      grid.appendChild(cellDiv);

      if (riverRows.includes(gridRowIndex)) {
        cellDiv.classList.add('river');
      }
      if (roadRows.includes(gridRowIndex)) {
        cellDiv.classList.add('road');
      }

      if (cellContent) {
        cellDiv.classList.add(cellContent);
      }
    });
  });
}

function placeDuck() {
  contentBeforeDuck = gridMatrix[duckPosition.y][duckPosition.x];
  gridMatrix[duckPosition.y][duckPosition.x] = 'duck';
}

function moveDuck(event) {
  const key = event.key;

  gridMatrix[duckPosition.y][duckPosition.x] = contentBeforeDuck;

  console.log(key);
  switch (key) {
    case 'ArrowUp':
      if (duckPosition.y > 0) {
        duckPosition.y--;
      }
      break;
    case 'ArrowDown':
      if (duckPosition.y < 8) {
        duckPosition.y++;
      }
      break;
    case 'ArrowLeft':
      if (duckPosition.x > 0) {
        duckPosition.x--;
      }
      break;
    case 'ArrowRight':
      if (duckPosition.x < 8) {
        duckPosition.x++;
      }
      break;
  }
  render();
}

// Animation functions
function moveRight(gridRowIndex) {
  const currentRow = gridMatrix[gridRowIndex];

  // Remove last element
  const lastElement = currentRow.pop();

  // Put it back
  currentRow.unshift(lastElement);
}

function moveLeft(gridRowIndex) {
  const currentRow = gridMatrix[gridRowIndex];

  // Remove last element
  const firstElement = currentRow.shift();

  // Put it back
  currentRow.push(firstElement);
}

function animateGame() {
  moveRight(1);
  moveLeft(2);
  moveRight(4);
  moveRight(5);
  moveRight(6);
}

function render() {
  placeDuck();
  drawGrid();
}

function endGame(reason) {
  if (reason === 'duck-arrived') {
    endGameText.innerHTML = 'YOU <br> WON';
    endGameScreen.classList.add('win');
  }

  clearInterval(countDownLoop);
  clearInterval(renderLoop);

  endGameScreen.classList.remove('hidden');
  document.removeEventListener('keyup', moveDuck);
}

function countDown() {
  if (time !== 0) {
    time--;
    timer.innerHTML = time.toString().padStart(5, '0');
  } else {
    endGame('times-up');
  }
}

function checkPosition() {
  console.log(duckPosition);
  if (duckPosition.y === victoryRow) endGame('duck-arrived');
  else if (contentBeforeDuck === 'river') endGame('duck-drowned');
  else if (contentBeforeDuck === 'car' || contentBeforeDuck == 'bus')
    endGame('duck-hit');
}

const renderLoop = setInterval(function () {
  gridMatrix[duckPosition.y][duckPosition.x] = contentBeforeDuck;

  animateGame();
  render();
  updateDuckPosition();
}, 600);

function updateDuckPosition() {
  gridMatrix[duckPosition.y][duckPosition.x] = contentBeforeDuck;
  checkPosition();
}

const countDownLoop = setInterval(countDown, 1000);

document.addEventListener('keyup', moveDuck);
playAgainBtn.addEventListener('click', function () {
  location.reload();
});
