let user;
let userId;

const signInBtn = document.querySelector("#signIn-btn");

// Handles sign in for google accounts. Can be used as an onClick handler
// Docs: https://firebase.google.com/docs/reference/js/firebase.auth.GoogleAuthProvider
const googleSignIn = () => {
    firebase.auth().setPersistence(firebase.auth.Auth.Persistence.SESSION)

    // Creates a new authentication provider for use with google accnts.
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth()
        .signInWithPopup(provider)
        .then(result => {
            const credential = result.credential;
            const token = credential.accessToken;
            user = result.user;

            console.log(user.uid);
            userId = user.uid;
            window.location = 'dashboard.html';
        }).catch(error => {
            // Handle the error
            console.log(error);
        });

};

function googleSignout() {
    firebase.auth().signOut()
        .then(function() {
            console.log('Signout Succesfull')
        }, function(error) {
            console.log('Signout Failed')
        });
}

const authStateChangedHandler = (callAfter) => {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            signInBtn.innerText = "Sign Out";
            userId = user.uid;
        } else {
            signInBtn.innerText = "Sign In";
            userId = "guest";
        }

        if (callAfter) callAfter();
    });
};

const checkIfSignedIn = () => {
    console.log(userId);
    if (userId && userId.length > 6) {
        console.log("sign out");
        firebase.auth().signOut();
        location.reload();
    } else {
        console.log("sign in");
        googleSignIn();
    }
};
