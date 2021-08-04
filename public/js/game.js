let currentGame;
let currentGameRef;
let isCheckingAnswer = false;
let userId = 'guest'; // temporary; this variable should be initialized in signIn.js

const initializeGame = () => {
    return new Promise((resolve, reject) => {
        getCurrentGame().then(currGameInfo => {
            if (!currGameInfo.isReady) {
                return resolve(false);
            }
            if (currentGame.gamemode == 'progLang') {
                githubApiInit().then(result => {
                    if (currGameInfo.needsNewQuestion) {
                        getProgLangQuestion(currGameInfo.newQuestionTimestamp).then(result => {
                            resolve(true);
                        });
                    } else {
                        renderProgLangQuestion();
                        resolve(true);
                    }
                });
            }
        });
    });
};

const getProgLangQuestion = (timestamp) => {
    return new Promise((resolve, reject) => {
        getQuestion().then(function (questionData) {
    		currentGame.currentQuestion.acceptedAnswers = questionData.answer.map(a => a.trim().toLowerCase());
            currentGame.currentQuestion.content = questionData.codeRef;
            currentGame.currentQuestion.timestamp = timestamp || new Date().toUTCString();
            currentGameRef.update(currentGame).then(renderProgLangQuestion);
            resolve(true);
        });
    });
};

const renderProgLangQuestion = () => {
    embed(`?target=${currentGame.currentQuestion.content}&style=atom-one-dark&showBorder=on&showLineNumbers=on`);
}

const checkAnswer = () => {
    if (isCheckingAnswer) return;

    const answerBox = document.querySelector('#answer-box');
    const answer = answerBox.value.trim().toLowerCase();
    if (!answer || answer.length === 0) return;

    isCheckingAnswer = true;

    if (currentGame.currentQuestion.acceptedAnswers.includes(answer)) {
        currentGame.numCorrect++;
    } else {
        currentGame.numIncorrect++;
    }
    currentGame.currentQuestion.questionNum++;

    currentGameRef.update(currentGame).then(result => {
        isCheckingAnswer = false;
        if (currentGame.gamemode === 'progLang') {
            getProgLangQuestion().then(result => {
                answerBox.value = '';
            });
        }
    });
};

/* If a game is in session, this function will resolve with true and set currentGame & currentGameRef to that game.
   If a game is not in session, this function will resolve with false and initialize currentGame & currentGameRef to a new template game. */
const getCurrentGame = () => {
    return new Promise((resolve, reject) => {
        const allGamesRef = firebase.database().ref(`/users/${userId}/games`);

        allGamesRef.get().then(snapshot => {
            let games = snapshot.val() || {};
            let gamesKeys = Object.keys(games);

            currentGameKey = gamesKeys[gamesKeys.length - 1];
            currentGame = games[currentGameKey];

            if (currentGame && !currentGame.hasFinished) {
                currentGameRef = firebase.database().ref(`/users/${userId}/games/${currentGameKey}`);

                let gameEndDate = new Date(currentGame.timestamp);
                gameEndDate.setSeconds(gameEndDate.getSeconds() + currentGame.totalQuestions * currentGame.timePerQuestion - 3);

                if (currentGame.currentQuestion && currentGame.currentQuestion.questionNum < currentGame.totalQuestions
                        && gameEndDate > new Date()) {
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
                        console.log("Updated previous game to finished.");
                    });
                }
            }

            const urlParams = new URLSearchParams(window.location.search);
            const gamemode = urlParams.get('gamemode');

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
                    content: "",
                    questionNum: 1,
                    timestamp: ""
                },
                currentStreak: 0,
                numCorrect: 0,
                numIncorrect: 0,
                totalQuestions: 10, // for now, this is fixed
                timePerQuestion: 10, // in seconds; for now, this is fixed
                timestamp: new Date().toUTCString()
            };

            currentGameRef = allGamesRef.push(currentGame);

            return resolve({isReady: true, needsNewQuestion: true});
        });
    });
};

window.onload = function() {
    initializeGame().then(isReady => {
        if (!isReady) {
            return;
        }

        // Refreshes the UI with the current game's data (useful if a player accidentally refreshes mid-game)
        const score = document.querySelector('#score');
        score.innerText = `Score: ${currentGame.numCorrect}/${currentGame.numCorrect + currentGame.numIncorrect}`;

        const streak = document.querySelector('#streak');
        streak.innerText = `Streak: ${currentGame.currentStreak}`;

        const timer = document.querySelector('#timer');
        const questionEndTime = (new Date(currentGame.currentQuestion.timestamp).getTime() + currentGame.timePerQuestion * 1000);
        const timeLeft = (questionEndTime - new Date().getTime()) / 1000;
        timer.innerText = Math.ceil(timeLeft);
    });
};
