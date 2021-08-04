// This needs to get the game type from the menu and then redirect
// to game.html with the proper URL parameters.

let correctAnswer;
let currentGame;
let currentGameRef;
let isCheckingAnswer = false;
let userId; // temporary; this variable should be initialized in signIn.js

function menuHandler() {
	const gameMode = document.querySelector('#start-select').value;
	userId = userId || 'guests';
	const allGamesRef = firebase.database().ref(`/users/${userId}/games`);

	// TODO: Make dynamic --> should be able to omit switch
	switch (gameMode) {
        case 'progLang':

            currentGameRef = allGamesRef.push(currentGame).then(result => {
                window.location.href = `game.html?gameMode=progLang`;
				// Note result is not really important
                githubApiInit().then(result => {
					const questionBox = document.querySelector('#question-box');
					questionBox.createElement('script').setAttribute('id', 'prog-src');
                    getProgLangQuestion();
                });
            });
            break;
        default:
            alert('Invalid gamemode');
            break;
    }
}
