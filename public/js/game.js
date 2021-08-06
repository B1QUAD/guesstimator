let currentGame;
let currentGameRef;
let isCheckingAnswer = false;
let timerInterval;
let checkAnswerTimeout;

const questionBox = document.querySelector('#question-box');

const initializeGame = () => {
    getCurrentGame().then(currGameInfo => {
        if (!currGameInfo.isReady) {
            return;
        }
        if (currentGame.gamemode === 'progLang') {
            githubApiInit().then(result => {
                if (currGameInfo.needsNewQuestion) {
                    getProgLangQuestion(currGameInfo.newQuestionTimestamp).then(result => {
                        refreshUI();
                    });
                } else {
                    renderProgLangQuestion();
                    refreshUI();
                }
            });
        } else if (currentGame.gamemode === 'lyrics') {
            if (currGameInfo.needsNewQuestion) {
                getLyricsQuestion(currGameInfo.newQuestionTimestamp);
                refreshUI();
            } else {
                renderLyricsQuestion();
                refreshUI();
            }
        }
    });
};

const getProgLangQuestion = (timestamp) => {
    return new Promise((resolve, reject) => {
        getQuestion().then(function (questionData) {
    		currentGame.currentQuestion.acceptedAnswers = questionData.answer.map(a => a.trim().toLowerCase());
            console.log(currentGame.currentQuestion.acceptedAnswers);
            currentGame.currentQuestion.content = questionData.codeRef;
            currentGame.currentQuestion.timestamp = timestamp || new Date().toUTCString();
            currentGameRef.update(currentGame).then(renderProgLangQuestion);
            resolve(true);
        });
    });
};

const renderProgLangQuestion = () => {
    questionBox.innerHTML = '';
    embed(`?target=${currentGame.currentQuestion.content}&style=atom-one-dark&showBorder=on&showLineNumbers=on`);
};

const getLyricsQuestion = (timestamp) => {
    var songInfo = runLyricsApi();
    songInfo.lyrics = getFinalLyrics();

    currentGame.currentQuestion.acceptedAnswers = [songInfo.name, songInfo.artist].map(a => a.trim().toLowerCase());
    console.log(currentGame.currentQuestion.acceptedAnswers);
    currentGame.currentQuestion.content = songInfo.lyrics;
    currentGame.currentQuestion.timestamp = timestamp || new Date().toUTCString();
    currentGameRef.update(currentGame).then(renderLyricsQuestion);
};

const renderLyricsQuestion = () => {
    document.querySelector('#lyrics').innerHTML = currentGame.currentQuestion.content;
};

window.addEventListener('keypress', function (e) {
    if (e.key === 'Enter') {
      checkAnswer();
    }
});

const checkAnswer = () => {
    if (isCheckingAnswer) return;
    isCheckingAnswer = true;

    const answerBox = document.querySelector('#answer-box');
    let answer = answerBox.value.trim().toLowerCase();
    answer = answer || 'no-answer-provided';

    if (currentGame.currentQuestion.acceptedAnswers.includes(answer)) {
        currentGame.numCorrect++;
        currentGame.currentStreak++;
    } else {
        currentGame.numIncorrect++;
        currentGame.currentStreak = 0;
    }
    currentGame.currentQuestion.questionNum++;

    currentGameRef.update(currentGame).then(result => {
        // if game is finished
        if (currentGame.numCorrect + currentGame.numIncorrect >= currentGame.totalQuestions) {
            currentGame.incompleteFinish = false;
            delete currentGame.currentQuestion;
            currentGameRef.set(currentGame).then(result => {
                refreshUI(true);
                isCheckingAnswer=false;
                // display modal
                document.querySelector('#modal').style.display = 'block';
                document.querySelector('#modal-content').innerHTML = `Your score:\n${currentGame.numCorrect} out of ${currentGame.totalQuestions}`;
            });
            return;
        }

        // if game is not finished
        if (currentGame.gamemode === 'progLang') {
            getProgLangQuestion().then(result => {
                answerBox.value = '';
                refreshUI();
                isCheckingAnswer = false;
            });
        } else if (currentGame.gamemode === 'lyrics') {
            getLyricsQuestion();
            answerBox.value = '';
            refreshUI();
            isCheckingAnswer = false;
        }
    });
};

/* If a game is in session, this function will resolve with true and set currentGame & currentGameRef to that game.
   If a game is not in session, this function will resolve with false and initialize currentGame & currentGameRef to a new template game. */
const getCurrentGame = () => {
    return new Promise((resolve, reject) => {
        const allGamesRef = firebase.database().ref(`/users/${userId}/games`);

        allGamesRef.get().then(snapshot => {
            const urlParams = new URLSearchParams(window.location.search);
            const gamemode = urlParams.get('gamemode');

            let games = snapshot.val() || {};
            let gamesKeys = Object.keys(games);

            currentGameKey = gamesKeys[gamesKeys.length - 1];
            currentGame = games[currentGameKey];

            if (currentGame && !currentGame.hasFinished) {
                currentGameRef = firebase.database().ref(`/users/${userId}/games/${currentGameKey}`);

                let gameEndDate = new Date(currentGame.timestamp);
                gameEndDate.setSeconds(gameEndDate.getSeconds() + currentGame.totalQuestions * currentGame.timePerQuestion - 3);

                if (currentGame.currentQuestion && currentGame.currentQuestion.questionNum < currentGame.totalQuestions
                        && gameEndDate > new Date() && gamemode && currentGame.gamemode === gamemode) {
                    let questionEndDate = new Date(currentGame.currentQuestion.timestamp);
                    questionEndDate.setSeconds(questionEndDate.getSeconds() + currentGame.timePerQuestion);

                    if (questionEndDate > new Date()) {
                        return resolve({isReady: true, needsNewQuestion: false});
                    }

                    while (new Date() > questionEndDate) {
                        currentGame.numIncorrect++;
                        currentGame.currentQuestion.questionNum++;
                        questionEndDate.setSeconds(questionEndDate.getSeconds() + currentGame.timePerQuestion);
                    }

                    questionEndDate.setSeconds(questionEndDate.getSeconds() - currentGame.timePerQuestion);
                    return resolve({isReady: true, needsNewQuestion: true, newQuestionTimestamp: questionEndDate.toUTCString()});
                } else {
                    currentGame.hasFinished = true;
                    currentGameRef.update(currentGame).then(result => {
                        console.log('Updated previous game to finished.');
                    });
                }
            }

            if (!gamemode || gamemode !== 'progLang' && gamemode !== 'lyrics') {
                window.location = 'index.html';
                return resolve({isReady: false});
            }

            currentGame = {
                gamemode: gamemode,
                hasFinished: false,
                incompleteFinish: true,
                currentQuestion: {
                    acceptedAnswers: [],
                    content: '',
                    questionNum: 1,
                    timestamp: ''
                },
                currentStreak: 0,
                numCorrect: 0,
                numIncorrect: 0,
                totalQuestions: 10, // for now, this is fixed
                timePerQuestion: 25, // in seconds; for now, this is fixed
                timestamp: new Date().toUTCString()
            };

            currentGameRef = allGamesRef.push(currentGame);

            return resolve({isReady: true, needsNewQuestion: true});
        });
    });
};

const directionsGm = document.querySelector('#directions-gamemode');
const score = document.querySelector('#score');
const streak = document.querySelector('#streak');
const timer = document.querySelector('#timer');

const refreshUI = (gameHasEnded) => {
    if (currentGame.gamemode === 'progLang') directionsGm.innerText = 'Programming Language';
    else if (currentGame.gamemode === 'lyrics') directionsGm.innerText = 'Song';
    score.innerText = `Score: ${currentGame.numCorrect}/${currentGame.numCorrect + currentGame.numIncorrect}`;
    streak.innerText = `Streak: ${currentGame.currentStreak}`;

    const answerBox = document.querySelector('#answer-box');
    answerBox.value = '';

    if (!gameHasEnded) {
        const questionEndTime = (new Date(currentGame.currentQuestion.timestamp).getTime() + currentGame.timePerQuestion * 1000);
        const secondsLeft = (questionEndTime - new Date().getTime()) / 1000;
        timer.innerText = Math.ceil(secondsLeft);

        clearInterval(timerInterval);
        timerInterval = setInterval(function() {
            const newSecondsLeft = parseInt(timer.innerText) - 1;
            timer.innerText = newSecondsLeft;
            if (newSecondsLeft <= 0) clearInterval(timerInterval);
        }, 1000);

        clearTimeout(checkAnswerTimeout);
        checkAnswerTimeout = setTimeout(checkAnswer, secondsLeft * 1000);
    } else {
        clearInterval(timerInterval);
        clearTimeout(checkAnswerTimeout);
        timer.innerText = '-';
    }
};
