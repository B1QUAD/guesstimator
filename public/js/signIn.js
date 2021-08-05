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


const signInBtn = document.querySelector("#signIn-btn");

window.onload = () => {
  firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        signInBtn.innerHTML="Change Accounts";
    }
    if (!user) {
        signInBtn.innerHTML="Sign In";
        userId="guest";
    }
  });
};
