const categoryDropDown2 = document.querySelector("#category-select");
const category2 = document.querySelector("#category-select").value;
const maxPersonalListEntries = 5;
const maxGlobalListEntries = 10;



// if(category === "Programming"){
//     category = "proglang";
// }
//
// categoryDropDown.addEventListener("click", function(){
//   getUserStats();
// });
//
// const getUserStats = () => {
// 	const userRef = firebase.database().ref(`users/${userId}`);
// 	userRef.on('value', (snapshot) => {
// 		const data = snapshot.val();
// 		changeUserDom(data);
// 	});
// }
//
// const changeUserDom = (data) => {
// 	if(data.games.gameMode === category){
//         console.log(data);
//     }
// }

// Sorts an array of objects
function sortObjects(obj, sortFunction) {
	let list;


	list.sort(w)
}

function dashInit() {
	var db = firebase.database();
	console.log('Hello there!!');
	// Work on data vis and pulling from the db
	// These are the ordered lists, append list item tags as children
	const personalTopThings = document.querySelector('#personal-top');
	const personalTopScores = document.querySelector('#personal-score');

	const globalHardest = document.querySelector('#hardest');
	const globalRecog = document.querySelector('#easiest');
	const globalLeader = document.querySelector('#leaderboard');

	db.ref().once('value')
  		.then(snapshot => snapshot.val()).then(function(data) {
    	// Handle read data.
		console.log('Test\n', data);
  	});
}

// Add load event listener to the window
window.addEventListener("load", dashInit, true);
