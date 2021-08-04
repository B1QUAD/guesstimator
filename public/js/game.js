let correctAnswer;
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

// <<<<<<< HEAD
// const getProgLangQuestion = () => {
//     getQuestion().then(function (questionData) {
// 		const questionBox = document.querySelector('#question-box');
// 		const code = document.querySelector('#embedContainer');
//
// 		// Force JS reload
// 		// code.parentNode.removeChild(code);
// 		// console.log(questionData["codeRef"]);
// 		embed(`?target=${questionData["codeRef"]}&style=atom-one-dark&showBorder=on&showLineNumbers=on`);
//         /*
//             [1] fetch random code from GitHub API & set the correctAnswer variable
//             [2] render it in HTML using emgithub.com
//             [3] increment currentQuestion.questionNum by 1 & set currentQuestion.timestamp
//         */
//     }).catch(function(err) {
// 		getProgLangQuestion();
// 	});
// =======
const getProgLangQuestion = (timestamp) => {
    return new Promise((resolve, reject) => {
        getQuestion().then(function (questionData) {
            // Deal with firebase (DY)
			currentGame.currentQuestion.acceptedAnswers = questionData.answer;
            currentGame.currentQuestion.content = questionData.codeRef;
            currentGame.currentQuestion.timestamp = timestamp || new Date().toUTCString();
            currentGameRef.update(currentGame).then(renderProgLangQuestion);
            resolve(true);

            // Render (DP)
            const questionBox = document.querySelector('#question-box');
		        const code = document.querySelector('#embedContainer');

		        console.log(questionData["codeRef"]);
		        embed(`?target=${questionData["codeRef"]}&style=atom-one-dark&showBorder=on&showLineNumbers=on`);
            /*
                [1] fetch random code from GitHub API & set the correctAnswer variable
                [2] render it in HTML using emgithub.com
                [3] increment currentQuestion.questionNum by 1 & set currentQuestion.timestamp
            */
        }).catch(function(err) {
            getProgLangQuestion();
        });
    });
// >>>>>>> 0773dc2f844726c8a654f11e2f35eacd32aa778b
};

const renderProgLangQuestion = () => {
    // render in HTML using emgithub.com
    console.log('ready to render prog lang question');
}

const checkAnswer = () => {
    if (isCheckingAnswer) return;
    isCheckingAnswer = true;
    // toggle loading

    const answerBox = document.querySelector('#answer-box');
    const answer = answerBox.value;

    getCurrentGame().then(result => {
        if (answer === correctAnswer) {
            currentGame.numCorrect++;
            currentGameRef.update(currentGame).then(result => {
                isCheckingAnswer = false;
                answerButton.classList.remove('is-loading');
            }).catch(err => {
                console.error(err);
            });
        } else {
            currentGame.numIncorrect++;
            currentGameRef.update(currentGame).then(result => {
                isCheckingAnswer = false;
                answerButton.classList.remove('is-loading');
            }).catch(err => {
                console.error(err);
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
        timer.innerText = Math.round(timeLeft);
    });
};
