document.addEventListener('DOMContentLoaded', () => {
    const startGameButton = document.getElementById('startGameButton');
    const playerNameInput = document.getElementById('playerName');
    const menu = document.querySelector('.menu');
    const simon = document.querySelector('.simon');
    const recordDisplay = document.getElementById('record');

    startGameButton.addEventListener('click', () => {
        const playerName = playerNameInput.value.trim();
        if (playerName) {
            menu.style.display = 'none';
            simon.style.display = 'block';
        } else {
            alert('Por favor, ingresa tu nombre.');
        }
    });

    const round = document.getElementById('round');
    const simonButtons = document.getElementsByClassName('square');
    const startButton = document.getElementById('startButton');

    class Simon {
        constructor(simonButtons, startButton, round) {
            this.round = 0;
            this.userPosition = 0;
            this.totalRounds = 10;
            this.sequence = [];
            this.speed = 1000;
            this.blockedButtons = true;
            this.buttons = Array.from(simonButtons);
            this.display = {
                startButton,
                round
            }
            this.errorSound = new Audio('./Sounds/error.wav');
            this.buttonSounds = [
                new Audio('./Sounds/1.mp3'),
                new Audio('./Sounds/2.mp3'),
                new Audio('./Sounds/3.mp3'),
                new Audio('./Sounds/4.mp3'),
            ]
        }

        init() {
            this.display.startButton.onclick = () => this.startGame();
            this.loadRecords();
        }

        startGame() {
            this.display.startButton.disabled = true; 
            this.updateRound(0);
            this.userPosition = 0;
            this.sequence = this.createSequence();
            this.buttons.forEach((element, i) => {
                element.classList.remove('winner');
                element.onclick = () => this.buttonClick(i);
            });
            this.showSequence();
        }

        updateRound(value) {
            this.round = value;
            this.display.round.textContent = `Round ${this.round}`;
        }

        createSequence() {
            return Array.from({length: this.totalRounds}, () => this.getRandomColor());
        }

        getRandomColor() {
            return Math.floor(Math.random() * 4);
        }

        buttonClick(value) {
            if (!this.blockedButtons) {
                this.validateChosenColor(value);
            }
        }

        validateChosenColor(value) {
            if (this.sequence[this.userPosition] === value) {
                this.buttonSounds[value].play();
                if (this.userPosition === this.round) {
                    this.updateRound(this.round + 1);
                    this.speed /= 1.02;
                    this.isGameOver();
                } else {
                    this.userPosition++;
                }
            } else {
                this.gameLost();
            }
        }

        isGameOver() {
            if (this.round === this.totalRounds) {
                this.gameWon();
            } else {
                this.userPosition = 0;
                this.showSequence();
            }
        }

        showSequence() {
            this.blockedButtons = true;
            let sequenceIndex = 0;
            const timer = setInterval(() => {
                const button = this.buttons[this.sequence[sequenceIndex]];
                this.buttonSounds[this.sequence[sequenceIndex]].play();
                this.toggleButtonStyle(button);
                setTimeout(() => this.toggleButtonStyle(button), this.speed / 2);
                sequenceIndex++;
                if (sequenceIndex > this.round) {
                    this.blockedButtons = false;
                    clearInterval(timer);
                }
            }, this.speed);
        }

        toggleButtonStyle(button) {
            button.classList.toggle('active');
        }

        gameLost() {
            this.errorSound.play();
            this.display.startButton.disabled = false; 
            this.blockedButtons = true;
            this.saveRecord();
        }

        gameWon() {
            this.display.startButton.disabled = false;
            this.blockedButtons = true;
            this.buttons.forEach(element => {
                element.classList.add('winner');
            });
            this.updateRound("🏆");
            this.saveRecord();
        }

        saveRecord() {
            const playerName = playerNameInput.value.trim();
            const record = `Jugador: ${playerName}, Ronda alcanzada: ${this.round}`;
            let records = JSON.parse(localStorage.getItem('simonRecords')) || [];
            records.push(record);
            localStorage.setItem('simonRecords', JSON.stringify(records));
            this.displayRecords();
            menu.style.display = 'block';
            simon.style.display = 'none';
        }

        loadRecords() {
            this.displayRecords();
        }

        displayRecords() {
            let records = JSON.parse(localStorage.getItem('simonRecords')) || [];
            recordDisplay.innerHTML = records.map(record => `<p>${record}</p>`).join('');
        }
    }

    const simonGame = new Simon(simonButtons, startButton, round);
    simonGame.init();
});