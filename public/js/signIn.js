let userId;
let user;



// We are using google auth for now bc it does not require github auth tokens
function signIn() {
	// Redirect to sign in page with options for google or github sign in
}

const getUserId = () => {
    return userId;
}

// Handles sign in for google accounts. Can be used as an onClick handler
// Docs: https://firebase.google.com/docs/reference/js/firebase.auth.GoogleAuthProvider
const googleSignIn = () => {
	console.log('signIn function called!');

	// Creates a new authentication provider for use with google accnts.
	const provider = new firebase.auth.GoogleAuthProvider();

	firebase.auth()
		.signInWithPopup(provider)
		.then(result => {
			const credential = result.credential;
			const token = credential.accessToken;
			user = result.user;

            console.log(user.uid);
            userId=user.uid;
			window.location = 'dashboard.html';
		}).catch(error => {
			// Handle the error
			console.log(error);
		});
};



const categoryDropDown=document.querySelector("#category-select");
const personalHeader=document.querySelector("#personal-header");
const globalHeader=document.querySelector("#global-header");
const profileName=document.querySelector("#profile-name");
const signInBtn=document.querySelector("#signIn-btn");



let category="Programming";

window.onload = () =>{
  changeDom();  

  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        signInBtn.innerHTML="Change Accounts";
    }
    if (!user) {
        signInBtn.innerHTML="Sign In"
  });
};


categoryDropDown.addEventListener('change', (e) => {
    category=document.querySelector("#category-select").value;
    changeDom();
});

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