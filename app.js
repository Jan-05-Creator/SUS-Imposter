// Wörterbuch nach Kategorie
const WORDS = {
    objects: ['Stuhl', 'Tisch', 'Fenster', 'Tür', 'Lampe', 'Buch', 'Stift', 'Computer', 'Handy', 'Uhr'],
    animals: ['Katze', 'Hund', 'Elefant', 'Löwe', 'Papagei', 'Fisch', 'Biene', 'Schmetterling', 'Giraffe', 'Wal'],
    places: ['Strand', 'Berg', 'Stadt', 'Wald', 'Flughafen', 'Bahnhof', 'Schule', 'Supermarkt', 'Park', 'Cafe'],
    food: ['Pizza', 'Apfel', 'Schokolade', 'Käse', 'Nudeln', 'Brokkoli', 'Ei', 'Brot', 'Zucker', 'Milch'],
    jobs: ['Arzt', 'Lehrer', 'Polizist', 'Koch', 'Elektriker', 'Zahnarzt', 'Astronaut', 'Detektiv', 'Kapitän', 'Schauspieler'],
    sports: ['Fussball', 'Tennis', 'Schwimmen', 'Basketball', 'Eishockey', 'Golf', 'Yoga', 'Tanzen', 'Surfen', 'Skifahren'],
    technology: ['Roboter', 'Drohne', 'Satellit', 'Fernseher', 'Tastatur', 'Drucker', 'Mikrofon', 'Kopfhörer', 'Kamera', 'Monitor'],
    movies: ['Avatar', 'Avengers', 'Titanic', 'Inception', 'Joker', 'Matrix', 'Shrek', 'Frozen', 'Herr der Ringe', 'Jurassic Park']
};

// App-Status
let gameState = {
    playerCount: 6,
    imposterCount: 1,
    category: 'objects',
    word: '',
    imposters: [],
    currentPlayer: 0,
    revealed: false,
    timerRunning: false,
    timerInterval: null,
    timerSeconds: 180
};

// Hilfsfunktion: Zufallswort wählen
function getRandomWord(category) {
    const words = WORDS[category];
    return words[Math.floor(Math.random() * words.length)];
}

// Hilfsfunktion: Imposter bestimmen
function selectImposters(totalPlayers, imposterCount) {
    const imposters = [];
    while (imposters.length < imposterCount) {
        const random = Math.floor(Math.random() * totalPlayers);
        if (!imposters.includes(random)) {
            imposters.push(random);
        }
    }
    return imposters;
}

// Bildschirme wechseln
function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

// Konfigurationsformular
document.getElementById('configForm').addEventListener('submit', (e) => {
    e.preventDefault();
    
    gameState.playerCount = parseInt(document.getElementById('playerCount').value);
    gameState.imposterCount = parseInt(document.getElementById('imposterCount').value);
    gameState.category = document.getElementById('category').value;
    
    // Spiel vorbereiten
    gameState.word = getRandomWord(gameState.category);
    gameState.imposters = selectImposters(gameState.playerCount, gameState.imposterCount);
    gameState.currentPlayer = 0;
    gameState.revealed = false;
    gameState.timerSeconds = 180;
    
    // Zu Spieler-Bildschirm wechseln
    showScreen('playerScreen');
    updatePlayerScreen();
});

// Spieler-Anzahl Slider
document.getElementById('playerCount').addEventListener('input', (e) => {
    const value = e.target.value;
    document.getElementById('playerCountValue').textContent = value;
});

// Imposter-Anzahl Buttons
document.querySelectorAll('.btn-toggle').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.btn-toggle').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('imposterCount').value = btn.dataset.value;
    });
});

// Spieler-Bildschirm aktualisieren
function updatePlayerScreen() {
    const isImposter = gameState.imposters.includes(gameState.currentPlayer);
    
    document.getElementById('currentPlayer').textContent = gameState.currentPlayer + 1;
    document.getElementById('progressText').textContent = gameState.currentPlayer + 1;
    document.getElementById('totalPlayers').textContent = gameState.playerCount;
    
    const progressPercent = ((gameState.currentPlayer + 1) / gameState.playerCount) * 100;
    document.getElementById('progressFill').style.width = progressPercent + '%';
    
    // Karte zurücksetzen
    const roleCard = document.getElementById('roleCard');
    roleCard.classList.remove('revealed', 'imposter');
    gameState.revealed = false;
    
    document.getElementById('revealBtn').style.display = 'block';
    document.getElementById('hideBtn').style.display = 'none';
    document.getElementById('nextPlayerBtn').style.display = 'none';
}

// Karte aufdecken
document.getElementById('revealBtn').addEventListener('click', () => {
    if (gameState.revealed) return;
    
    gameState.revealed = true;
    const isImposter = gameState.imposters.includes(gameState.currentPlayer);
    const roleCard = document.getElementById('roleCard');
    
    if (isImposter) {
        roleCard.classList.add('revealed', 'imposter');
        roleCard.innerHTML = '<div class="card-content">🕵️ Imposter</div>';
    } else {
        roleCard.classList.add('revealed');
        roleCard.innerHTML = `<div class="card-content">${gameState.word}</div>`;
    }
    
    document.getElementById('revealBtn').style.display = 'none';
    document.getElementById('hideBtn').style.display = 'block';
    document.getElementById('nextPlayerBtn').style.display = 'block';
});

// Karte verbergen
document.getElementById('hideBtn').addEventListener('click', () => {
    const roleCard = document.getElementById('roleCard');
    roleCard.classList.remove('revealed', 'imposter');
    roleCard.innerHTML = '<div class="card-content"><span class="card-instruction">Tippe hier</span></div>';
    
    gameState.revealed = false;
    document.getElementById('revealBtn').style.display = 'block';
    document.getElementById('hideBtn').style.display = 'none';
    document.getElementById('nextPlayerBtn').style.display = 'none';
});

// Nächster Spieler
document.getElementById('nextPlayerBtn').addEventListener('click', () => {
    if (gameState.currentPlayer < gameState.playerCount - 1) {
        gameState.currentPlayer++;
        updatePlayerScreen();
    } else {
        // Diskussionsphase starten
        stopTimer();
        gameState.timerSeconds = 180;
        document.getElementById('timerMinutes').textContent = '3';
        document.getElementById('timerSeconds').textContent = '00';
        showScreen('discussionScreen');
    }
});

// Timer-Logik
function updateTimer() {
    const minutes = Math.floor(gameState.timerSeconds / 60);
    const seconds = gameState.timerSeconds % 60;
    
    document.getElementById('timerMinutes').textContent = minutes;
    document.getElementById('timerSeconds').textContent = seconds.toString().padStart(2, '0');
    
    if (gameState.timerSeconds <= 0) {
        stopTimer();
    }
}

function startTimer() {
    if (gameState.timerRunning) return;
    
    gameState.timerRunning = true;
    document.getElementById('startTimerBtn').style.display = 'none';
    document.getElementById('pauseTimerBtn').style.display = 'block';
    document.getElementById('timer').classList.add('running');
    
    gameState.timerInterval = setInterval(() => {
        gameState.timerSeconds--;
        updateTimer();
    }, 1000);
}

function stopTimer() {
    gameState.timerRunning = false;
    document.getElementById('startTimerBtn').style.display = 'block';
    document.getElementById('pauseTimerBtn').style.display = 'none';
    document.getElementById('timer').classList.remove('running');
    
    if (gameState.timerInterval) {
        clearInterval(gameState.timerInterval);
        gameState.timerInterval = null;
    }
}

document.getElementById('startTimerBtn').addEventListener('click', startTimer);
document.getElementById('pauseTimerBtn').addEventListener('click', stopTimer);

// Auflösen
document.getElementById('revealAnswerBtn').addEventListener('click', () => {
    stopTimer();
    
    // Auflösungs-Bildschirm vorbereiten
    document.getElementById('revealedWord').textContent = gameState.word;
    
    const imposterList = document.getElementById('revealedImposters');
    imposterList.innerHTML = '';
    
    if (gameState.imposters.length > 0) {
        gameState.imposters.forEach(imposterIndex => {
            const item = document.createElement('div');
            item.className = 'imposter-item';
            item.textContent = `Spieler ${imposterIndex + 1} 🕵️`;
            imposterList.appendChild(item);
        });
    } else {
        const item = document.createElement('div');
        item.className = 'imposter-item';
        item.textContent = 'Keine Imposter gefunden!';
        imposterList.appendChild(item);
    }
    
    showScreen('revealScreen');
});

// Neues Spiel
document.getElementById('restartBtn').addEventListener('click', () => {
    showScreen('configScreen');
});

// Service Worker registrieren
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
            console.error('Service Worker Registrierung fehlgeschlagen:', err);
        });
    });
}

// App installierbar machen (Prompt)
let deferredPrompt;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
});
