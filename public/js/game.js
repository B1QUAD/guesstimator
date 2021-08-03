let correctAnswer;
let currentGame;
let currentGameRef;
let isCheckingAnswer = false;
let userId; // temporary; this variable should be initialized in signIn.js

const initializeGame = () => {
    // activate loading

    userId = userId || 'guests';
    const allGamesRef = firebase.database().ref(`/users/${userId}/games`);

    const gamemode = document.querySelector('#start-select').value;
    let totalQuestions = 20; // for now, the total number of questions will be fixed

    currentGame = {
        gamemode: gamemode,
        hasFinished: false,
        currentQuestion: {
            questionNum: 0,
            timestamp: ""
        },
        numCorrect: 0,
        numIncorrect: 0,
        totalQuestions: totalQuestions,
        timestamp: new Date().toString()
    };

    switch (gamemode) {
        case 'progLang':
            currentGameRef = allGamesRef.push(currentGame).then(result => {
                // window.location.href = 'game.html';
				// Note result is not really important
                githubApiInit().then(result => {
                    getProgLangQuestion();
                });
            });
            break;
        default:
            alert('Invalid gamemode');
            break;
    }
};

const getProgLangQuestion = () => {
    const questionData = getQuestion().then(questionData => {
        console.log(questionData);
        /*
            [1] fetch random code from GitHub API & set the correctAnswer variable
            [2] render it in HTML using emgithub.com
            [3] increment currentQuestion.questionNum by 1 & set currentQuestion.timestamp
        */
    });
};

// answerButton is the HTML element of the answer button which was clicked
const checkAnswer = (answerButton) => {
    if (isCheckingAnswer) return;
    isCheckingAnswer = true;
    answerButton.classList.add('is-loading');

    let answer = answerButton.dataset.answer;
    updateCurrentGameObj().then(result => {
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

/* makes currentGame & currentGameRef reference latest game in the database under that signed in user
   in case the user reloads the page, which would reload both variables as null */
const updateCurrentGameObj = () => {
    return new Promise((resolve, reject) => {
        userId = userId || 'guests';
        const allGamesRef = firebase.database().ref(`/users/${userId}/games`);

        allGamesRef.get().then(snapshot => {
            let games = snapshot.val();
            let gamesKeys = Object.keys(games);
            currentGameKey = gamesKeys[gamesKeys.length - 1];

            currentGameRef = firebase.database().ref(`/users/${userId}/games/${currentGameKey}`);
            currentGame = games[currentGameKey];
            resolve(true);
        });
    });
};
