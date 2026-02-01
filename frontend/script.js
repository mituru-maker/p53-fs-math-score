// API URLの設定
const API_URL = "http://127.0.0.1:8000"; // ローカル確認用
// const API_URL = "https://YOUR-BACKEND-URL.onrender.com"; // Renderデプロイ時にコメントアウトを解除

// ゲーム状態
let gameState = {
    currentQuestion: 0,
    totalQuestions: 10,
    startTime: null,
    endTime: null,
    timer: null,
    questions: [],
    answers: []
};

// DOM要素
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const resultScreen = document.getElementById('resultScreen');
const rankingScreen = document.getElementById('rankingScreen');

const startBtn = document.getElementById('startBtn');
const questionElement = document.getElementById('question');
const answerInput = document.getElementById('answer');
const submitBtn = document.getElementById('submitBtn');
const questionCount = document.getElementById('questionCount');
const timerElement = document.getElementById('timer');
const feedback = document.getElementById('feedback');
const finalTime = document.getElementById('finalTime');
const playerName = document.getElementById('playerName');
const saveScoreBtn = document.getElementById('saveScoreBtn');
const retryBtn = document.getElementById('retryBtn');
const viewRankingBtn = document.getElementById('viewRankingBtn');
const backToStartBtn = document.getElementById('backToStartBtn');
const rankingList = document.getElementById('rankingList');

// イベントリスナー
startBtn.addEventListener('click', startGame);
submitBtn.addEventListener('click', submitAnswer);
answerInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitAnswer();
    }
});
saveScoreBtn.addEventListener('click', saveScore);
retryBtn.addEventListener('click', startGame);
viewRankingBtn.addEventListener('click', showRanking);
backToStartBtn.addEventListener('click', showStartScreen);

// 問題生成
function generateQuestion() {
    const operations = ['+', '-', '*'];
    const operation = operations[Math.floor(Math.random() * operations.length)];
    let a, b;
    
    switch (operation) {
        case '+':
            a = Math.floor(Math.random() * 50) + 1;
            b = Math.floor(Math.random() * 50) + 1;
            break;
        case '-':
            a = Math.floor(Math.random() * 50) + 10;
            b = Math.floor(Math.random() * a) + 1;
            break;
        case '*':
            a = Math.floor(Math.random() * 12) + 1;
            b = Math.floor(Math.random() * 12) + 1;
            break;
    }
    
    const question = `${a} ${operation} ${b}`;
    const answer = eval(question);
    
    return { question, answer };
}

// ゲーム開始
function startGame() {
    gameState = {
        currentQuestion: 0,
        totalQuestions: 10,
        startTime: Date.now(),
        endTime: null,
        timer: null,
        questions: [],
        answers: []
    };
    
    // 10問生成
    for (let i = 0; i < gameState.totalQuestions; i++) {
        gameState.questions.push(generateQuestion());
    }
    
    showScreen('game');
    showQuestion();
    startTimer();
}

// タイマー開始
function startTimer() {
    gameState.timer = setInterval(() => {
        const elapsed = Date.now() - gameState.startTime;
        const seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        const displaySeconds = seconds % 60;
        timerElement.textContent = `${minutes.toString().padStart(2, '0')}:${displaySeconds.toString().padStart(2, '0')}`;
    }, 100);
}

// タイマー停止
function stopTimer() {
    if (gameState.timer) {
        clearInterval(gameState.timer);
        gameState.timer = null;
    }
}

// 問題表示
function showQuestion() {
    const currentQ = gameState.questions[gameState.currentQuestion];
    questionElement.textContent = `${currentQ.question} = ?`;
    questionCount.textContent = `${gameState.currentQuestion + 1} / ${gameState.totalQuestions}`;
    answerInput.value = '';
    answerInput.focus();
    feedback.textContent = '';
    feedback.className = 'feedback';
}

// 解答提出
function submitAnswer() {
    const userAnswer = parseInt(answerInput.value);
    const currentQ = gameState.questions[gameState.currentQuestion];
    
    if (isNaN(userAnswer)) {
        feedback.textContent = '数字を入力してください';
        feedback.className = 'feedback incorrect';
        return;
    }
    
    gameState.answers.push({
        question: currentQ.question,
        correctAnswer: currentQ.answer,
        userAnswer: userAnswer,
        isCorrect: userAnswer === currentQ.answer
    });
    
    if (userAnswer === currentQ.answer) {
        feedback.textContent = '正解！';
        feedback.className = 'feedback correct';
    } else {
        feedback.textContent = `不正解！正解は ${currentQ.answer} です`;
        feedback.className = 'feedback incorrect';
    }
    
    setTimeout(() => {
        gameState.currentQuestion++;
        if (gameState.currentQuestion >= gameState.totalQuestions) {
            endGame();
        } else {
            showQuestion();
        }
    }, 1000);
}

// ゲーム終了
function endGame() {
    stopTimer();
    gameState.endTime = Date.now();
    const totalTime = (gameState.endTime - gameState.startTime) / 1000;
    const minutes = Math.floor(totalTime / 60);
    const seconds = Math.floor(totalTime % 60);
    finalTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    
    const correctCount = gameState.answers.filter(a => a.isCorrect).length;
    
    showScreen('result');
}

// スコア保存
async function saveScore() {
    const name = playerName.value.trim();
    if (!name) {
        alert('名前を入力してください');
        return;
    }
    
    const totalTime = (gameState.endTime - gameState.startTime) / 1000;
    
    try {
        const response = await fetch(`${API_URL}/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: name,
                time: totalTime
            })
        });
        
        if (response.ok) {
            const result = await response.json();
            alert('スコアが保存されました！');
            if (result.is_top5) {
                showRanking();
            } else {
                showStartScreen();
            }
        } else {
            throw new Error('スコアの保存に失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('エラーが発生しました。もう一度お試しください。');
    }
}

// ランキング表示
async function showRanking() {
    try {
        const response = await fetch(`${API_URL}/ranking`);
        if (response.ok) {
            const data = await response.json();
            displayRanking(data.rankings);
            showScreen('ranking');
        } else {
            throw new Error('ランキングの取得に失敗しました');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('ランキングの取得中にエラーが発生しました');
    }
}

// ランキング表示
function displayRanking(rankings) {
    rankingList.innerHTML = '';
    
    if (rankings.length === 0) {
        rankingList.innerHTML = '<p class="no-rankings">まだスコアがありません</p>';
        return;
    }
    
    rankings.forEach((rank, index) => {
        const rankItem = document.createElement('div');
        rankItem.className = `ranking-item rank-${index + 1}`;
        
        const rankNumber = document.createElement('span');
        rankNumber.className = 'rank-number';
        rankNumber.textContent = `#${index + 1}`;
        
        const playerName = document.createElement('span');
        playerName.className = 'player-name';
        playerName.textContent = rank.name;
        
        const playerTime = document.createElement('span');
        playerTime.className = 'player-time';
        const minutes = Math.floor(rank.time / 60);
        const seconds = Math.floor(rank.time % 60);
        playerTime.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        
        rankItem.appendChild(rankNumber);
        rankItem.appendChild(playerName);
        rankItem.appendChild(playerTime);
        rankingList.appendChild(rankItem);
    });
}

// 画面切り替え
function showScreen(screenName) {
    const screens = [startScreen, gameScreen, resultScreen, rankingScreen];
    screens.forEach(screen => screen.classList.add('hidden'));
    
    switch (screenName) {
        case 'start':
            startScreen.classList.remove('hidden');
            break;
        case 'game':
            gameScreen.classList.remove('hidden');
            break;
        case 'result':
            resultScreen.classList.remove('hidden');
            break;
        case 'ranking':
            rankingScreen.classList.remove('hidden');
            break;
    }
}

// スタート画面表示
function showStartScreen() {
    showScreen('start');
    playerName.value = '';
}

// 初期化
showStartScreen();
