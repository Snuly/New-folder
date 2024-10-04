let words = []; // To store country names from JSON
let guessedWords = new Set(); // To track guessed words
let currentWord = '';
let scrambledWord = '';
let startTime;
let timerInterval;

// Load countries from JSON file
fetch('./countries.json')
    .then(response => {return response.json();}) 
    .then(data => {
        words = data.countries;
        newGame();
    });

// Function to scramble the word
function scrambleWord(word) {
    const wordArr = word.split('');
    for (let i = wordArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [wordArr[i], wordArr[j]] = [wordArr[j], wordArr[i]];
    }
    return wordArr.join('');
}

// Start a new game
function newGame() {
    if (timerInterval) clearInterval(timerInterval);
    startTimer();

    // Select a random word that hasn't been guessed yet
    let availableWords = words.filter(word => !guessedWords.has(word));
    if (availableWords.length === 0) {
        endGame();
        return;
    }
    currentWord = availableWords[Math.floor(Math.random() * availableWords.length)];
    scrambledWord = scrambleWord(currentWord);

    // Clear previous tiles and letters
    document.getElementById('tiles-container').innerHTML = '';
    document.getElementById('letters-container').innerHTML = '';
    document.getElementById('result').innerText = '';
    document.getElementById('continue-btn').style.display = 'none';
    document.getElementById('end-btn').style.display = 'none';

    // Create empty tiles
    for (let i = 0; i < currentWord.length; i++) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.id = `tile-${i}`;
        tile.ondrop = drop;
        tile.ondragover = allowDrop;
        document.getElementById('tiles-container').appendChild(tile);
    }

    // Create letter cubes
    scrambledWord.split('').forEach((letter, index) => {
        const letterDiv = document.createElement('div');
        letterDiv.className = 'letter';
        letterDiv.draggable = true;
        letterDiv.ondragstart = drag;
        letterDiv.id = `letter-${index}`;
        letterDiv.innerText = letter;
        document.getElementById('letters-container').appendChild(letterDiv);
    });
}

// Start the timer
function startTimer() {
    startTime = new Date();
    timerInterval = setInterval(updateTimer, 1000);
}

// Update the timer
function updateTimer() {
    const currentTime = new Date();
    const timeSpent = Math.floor((currentTime - startTime) / 1000);
}

// Allow drop on tiles
function allowDrop(event) {
    event.preventDefault();
}

// Drag start function
function drag(event) {
    event.dataTransfer.setData('text', event.target.id);
}

// Drop function
function drop(event) {
    event.preventDefault();
    const data = event.dataTransfer.getData('text');
    const targetTile = event.target;

    // Ensure the tile is empty before dropping
    if (targetTile.innerText === '') {
        const letterDiv = document.getElementById(data);
        targetTile.innerText = letterDiv.innerText;

        // Remove the letter from the bottom
        letterDiv.style.visibility = 'hidden';

        // Check if all tiles are filled
        if (areAllTilesFilled()) {
            checkGuess();
        }
    }
}

// Check if all tiles are filled
function areAllTilesFilled() {
    for (let i = 0; i < currentWord.length; i++) {
        const tile = document.getElementById(`tile-${i}`);
        if (tile.innerText === '') {
            return false;
        }
    }
    return true;
}

// Check the user's guess
function checkGuess() {
    let userGuess = '';

    // Construct the guessed word from the tiles
    for (let i = 0; i < currentWord.length; i++) {
        const tile = document.getElementById(`tile-${i}`);
        userGuess += tile.innerText;
    }

    if (userGuess === currentWord) {
        document.getElementById('result').innerText = 'Correct! Well done!';
        guessedWords.add(currentWord);
        document.getElementById('continue-btn').style.display = 'inline';
        document.getElementById('end-btn').style.display = 'inline';
        clearInterval(timerInterval);
    } else {
        document.getElementById('result').innerText = 'Incorrect! Removing wrong letters...';

        // Remove incorrect letters but keep the correct ones
        for (let i = 0; i < currentWord.length; i++) {
            const tile = document.getElementById(`tile-${i}`);
            if (tile.innerText !== currentWord[i]) {
                // Make the letter visible again in the bottom
                const letterToReveal = scrambledWord.split('').indexOf(tile.innerText);
                if (letterToReveal !== -1) {
                    document.getElementById(`letter-${letterToReveal}`).style.visibility = 'visible';
                }
                tile.innerText = ''; // Clear incorrect letter
            }
        }
    }
}

// Continue the game with a new word
function continueGame() {
    newGame();
}

// End the game
function endGame() {
    clearInterval(timerInterval);
    const timeSpent = Math.floor((new Date() - startTime) / 1000);
    document.getElementById('result').innerText = `Thank you for playing! You spent ${timeSpent} seconds in the game.`;
    document.getElementById('continue-btn').style.display = 'none';
    document.getElementById('end-btn').style.display = 'none';
}