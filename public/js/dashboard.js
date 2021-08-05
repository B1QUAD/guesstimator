const maxPersonalListEntries = 5;
const maxGlobalListEntries = 10;
const categoryDropDown = document.querySelector("#category-select");
let category = categoryDropDown.value;
const personalHeader=document.querySelector("#personal-header");
const globalHeader=document.querySelector("#global-header");
const profileName=document.querySelector("#profile-name");
category = "Programming";


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

const changeDom = () =>{
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            profileName.innerHTML=user.displayName;
            user.providerData.forEach(profile => {
                console.log(profile.photoURL);
                document.querySelector("#profile-pic").src=profile.photoURL;
            }); //this will give you all the urls once there is user data
        }
    });


    if(category=="Programming"){
        personalHeader.innerHTML="Top Programming Languages";
        globalHeader.innerHTML="Global Programming Info";
    }
    else if(category=="Lyrics"){
        personalHeader.innerHTML="Top Songs";
        globalHeader.innerHTML="Global Lyric Info";
    }
    getUserStats();
};

categoryDropDown.addEventListener('change', (e) => {
    category=document.querySelector("#category-select").value;
    changeDom();
});

const getUserStats = () => {
	const userRef = firebase.database().ref(`users/${userId}`);
	userRef.on('value', (snapshot) => {
        const data = snapshot.val();
        console.log(data);
		//changeUserDom(data);
	});
}

const changeUserDom = (data) => {
    if(category=="Programming"){
        category="proglang";
    }

	if(data.games.gameMode==category){
        console.log(data);
    }
}

function sortObjects(obj, sortFunction) {
	let list;


	list.sort(w)
}

function dashInit() {
	changeDom();

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
