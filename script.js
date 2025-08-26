class BlackjackGame {
    constructor() {
        this.deck = [];
        this.playerCards = [];
        this.dealerCards = [];
        this.playerMoney = 1000;
        this.currentBet = 0;
        this.gameInProgress = false;
        this.dealerHidden = true;

        this.initializeElements();
        this.bindEvents();
        this.updateDisplay();
    }

    initializeElements() {
        this.elements = {
            playerMoney: document.getElementById('player-money'),
            currentBet: document.getElementById('current-bet'),
            dealerScore: document.getElementById('dealer-score'),
            playerScore: document.getElementById('player-score'),
            dealerCards: document.getElementById('dealer-cards'),
            playerCards: document.getElementById('player-cards'),
            gameMessage: document.getElementById('game-message'),
            dealBtn: document.getElementById('deal-btn'),
            hitBtn: document.getElementById('hit-btn'),
            standBtn: document.getElementById('stand-btn'),
            doubleBtn: document.getElementById('double-btn'),
            newGameBtn: document.getElementById('new-game-btn'),
            betButtons: document.querySelectorAll('.bet-btn'),
            rulesBtn: document.getElementById('rules-btn'),
            rulesModal: document.getElementById('rules-modal'),
            closeBtn: document.querySelector('.close')
        };
    }

    bindEvents() {
        this.elements.dealBtn.addEventListener('click', () => this.deal());
        this.elements.hitBtn.addEventListener('click', () => this.hit());
        this.elements.standBtn.addEventListener('click', () => this.stand());
        this.elements.doubleBtn.addEventListener('click', () => this.double());
        this.elements.newGameBtn.addEventListener('click', () => this.newGame());

        this.elements.betButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.placeBet(e.target.dataset.amount));
        });

        // 规则模态框事件
        this.elements.rulesBtn.addEventListener('click', () => this.openRulesModal());
        this.elements.closeBtn.addEventListener('click', () => this.closeRulesModal());
        
        // 点击模态框外部关闭
        window.addEventListener('click', (e) => {
            if (e.target === this.elements.rulesModal) {
                this.closeRulesModal();
            }
        });

        // ESC键关闭模态框
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.elements.rulesModal.style.display === 'block') {
                this.closeRulesModal();
            }
        });
    }

    openRulesModal() {
        this.elements.rulesModal.style.display = 'block';
    }

    closeRulesModal() {
        this.elements.rulesModal.style.display = 'none';
    }

    createDeck() {
        const suits = ['♠', '♥', '♦', '♣'];
        const ranks = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
        
        this.deck = [];
        
        for (let suit of suits) {
            for (let rank of ranks) {
                this.deck.push({
                    suit: suit,
                    rank: rank,
                    value: this.getCardValue(rank)
                });
            }
        }
        
        this.shuffleDeck();
    }

    getCardValue(rank) {
        if (rank === 'A') return 11;
        if (['J', 'Q', 'K'].includes(rank)) return 10;
        return parseInt(rank);
    }

    shuffleDeck() {
        for (let i = this.deck.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.deck[i], this.deck[j]] = [this.deck[j], this.deck[i]];
        }
    }

    dealCard() {
        return this.deck.pop();
    }

    calculateScore(cards) {
        let score = 0;
        let aces = 0;

        for (let card of cards) {
            score += card.value;
            if (card.rank === 'A') aces++;
        }

        while (score > 21 && aces > 0) {
            score -= 10;
            aces--;
        }

        return score;
    }

    placeBet(amount) {
        if (this.gameInProgress) return;

        if (amount === 'all') {
            this.currentBet = this.playerMoney;
        } else {
            const betAmount = parseInt(amount);
            if (betAmount <= this.playerMoney) {
                this.currentBet = betAmount;
            }
        }

        this.updateBetButtons();
        this.updateDisplay();
        this.elements.dealBtn.disabled = this.currentBet === 0;
    }

    updateBetButtons() {
        this.elements.betButtons.forEach(btn => {
            btn.classList.remove('active');
            if ((btn.dataset.amount === 'all' && this.currentBet === this.playerMoney) ||
                (btn.dataset.amount !== 'all' && parseInt(btn.dataset.amount) === this.currentBet)) {
                btn.classList.add('active');
            }
        });
    }

    deal() {
        if (this.currentBet === 0 || this.currentBet > this.playerMoney) {
            this.showMessage('请先下注！', '');
            return;
        }

        this.playerMoney -= this.currentBet;
        this.gameInProgress = true;
        this.dealerHidden = true;
        this.playerCards = [];
        this.dealerCards = [];

        this.createDeck();

        this.playerCards.push(this.dealCard());
        this.dealerCards.push(this.dealCard());
        this.playerCards.push(this.dealCard());
        this.dealerCards.push(this.dealCard());

        this.updateDisplay();
        this.updateButtons();

        const playerScore = this.calculateScore(this.playerCards);
        const dealerScore = this.calculateScore(this.dealerCards);

        if (playerScore === 21) {
            if (dealerScore === 21) {
                this.endGame('平局！', 'tie');
            } else {
                this.endGame('黑杰克！你赢了！', 'win');
                this.playerMoney += this.currentBet * 2.5;
            }
        }

        this.showMessage('', '');
    }

    hit() {
        if (!this.gameInProgress) return;

        this.playerCards.push(this.dealCard());
        this.updateDisplay();

        const playerScore = this.calculateScore(this.playerCards);
        
        if (playerScore > 21) {
            this.endGame('爆牌了！你输了！', 'lose');
        } else if (playerScore === 21) {
            this.stand();
        }

        this.updateButtons();
    }

    stand() {
        if (!this.gameInProgress) return;

        this.dealerHidden = false;
        this.updateDisplay();

        const dealerPlay = () => {
            const dealerScore = this.calculateScore(this.dealerCards);
            
            if (dealerScore < 17) {
                setTimeout(() => {
                    this.dealerCards.push(this.dealCard());
                    this.updateDisplay();
                    dealerPlay();
                }, 1000);
            } else {
                this.checkWinner();
            }
        };

        dealerPlay();
    }

    double() {
        if (!this.gameInProgress || this.currentBet * 2 > this.playerMoney + this.currentBet) {
            return;
        }

        this.playerMoney -= this.currentBet;
        this.currentBet *= 2;
        this.updateDisplay();

        this.hit();
        
        if (this.gameInProgress && this.calculateScore(this.playerCards) <= 21) {
            this.stand();
        }
    }

    checkWinner() {
        const playerScore = this.calculateScore(this.playerCards);
        const dealerScore = this.calculateScore(this.dealerCards);

        if (dealerScore > 21) {
            this.endGame('庄家爆牌！你赢了！', 'win');
            this.playerMoney += this.currentBet * 2;
        } else if (playerScore > dealerScore) {
            this.endGame('你赢了！', 'win');
            this.playerMoney += this.currentBet * 2;
        } else if (playerScore < dealerScore) {
            this.endGame('庄家赢了！', 'lose');
        } else {
            this.endGame('平局！', 'tie');
            this.playerMoney += this.currentBet;
        }
    }

    endGame(message, type) {
        this.gameInProgress = false;
        this.dealerHidden = false;
        this.showMessage(message, type);
        this.updateDisplay();
        this.updateButtons();

        if (this.playerMoney <= 0) {
            setTimeout(() => {
                alert('游戏结束！你没钱了！');
                this.newGame();
            }, 2000);
        }
    }

    showMessage(message, type) {
        this.elements.gameMessage.textContent = message;
        this.elements.gameMessage.className = `message ${type}`;
    }

    updateDisplay() {
        this.elements.playerMoney.textContent = this.playerMoney;
        this.elements.currentBet.textContent = this.currentBet;

        const playerScore = this.calculateScore(this.playerCards);
        this.elements.playerScore.textContent = `(${playerScore})`;

        if (this.dealerHidden && this.dealerCards.length > 0) {
            const visibleDealerScore = this.dealerCards[0].value;
            this.elements.dealerScore.textContent = `(${visibleDealerScore})`;
        } else {
            const dealerScore = this.calculateScore(this.dealerCards);
            this.elements.dealerScore.textContent = `(${dealerScore})`;
        }

        this.displayCards(this.elements.playerCards, this.playerCards, false);
        this.displayCards(this.elements.dealerCards, this.dealerCards, this.dealerHidden);
    }

    displayCards(container, cards, hideSecondCard = false) {
        container.innerHTML = '';
        
        cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'card';
            
            if (hideSecondCard && index === 1) {
                cardElement.classList.add('hidden');
                cardElement.innerHTML = '';
            } else {
                if (card.suit === '♥' || card.suit === '♦') {
                    cardElement.classList.add('red');
                }
                cardElement.innerHTML = `
                    <div>${card.rank}</div>
                    <div>${card.suit}</div>
                `;
            }
            
            container.appendChild(cardElement);
        });
    }

    updateButtons() {
        const canHit = this.gameInProgress && this.calculateScore(this.playerCards) < 21;
        const canDouble = this.gameInProgress && this.playerCards.length === 2 && 
                         this.currentBet * 2 <= this.playerMoney + this.currentBet;

        this.elements.dealBtn.disabled = this.gameInProgress || this.currentBet === 0;
        this.elements.hitBtn.disabled = !canHit;
        this.elements.standBtn.disabled = !this.gameInProgress;
        this.elements.doubleBtn.disabled = !canDouble;

        this.elements.betButtons.forEach(btn => {
            btn.disabled = this.gameInProgress;
        });
    }

    newGame() {
        this.playerMoney = 1000;
        this.currentBet = 0;
        this.gameInProgress = false;
        this.dealerHidden = true;
        this.playerCards = [];
        this.dealerCards = [];

        this.showMessage('', '');
        this.updateDisplay();
        this.updateButtons();
        this.updateBetButtons();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BlackjackGame();
});