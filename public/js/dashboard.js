const maxPersonalListEntries = 5;
const maxGlobalListEntries = 10;
const categoryDropDown = document.querySelector("#category-select");
let category = categoryDropDown.value;
const personalHeader = document.querySelector("#personal-header");
const globalHeader = document.querySelector("#global-header");
const profileName = document.querySelector("#profile-name");
category = "Programming";

const changeDom = () => {
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            userId = user.uid;
            profileName.innerHTML = user.displayName;
            user.providerData.forEach(profile => {
                console.log(profile.photoURL);
                document.querySelector("#profile-pic").src = profile.photoURL;
            }); //this will give you all the urls once there is user data
        } else {
            userId = "guest";
        }
    });


    if (category == "Programming") {
        personalHeader.innerHTML = "Top Programming Languages";
    } else if (category == "Lyrics") {
        personalHeader.innerHTML = "Top Songs";
    }
    getUserStats();
};

categoryDropDown.addEventListener('change', (e) => {
    category = document.querySelector("#category-select").value;
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
    if (category == "Programming") {
        category = "proglang";
    }

    if (data.games.gameMode == category) {
        console.log(data);
    }
}

function createChart(inputData) {
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        maintainAspectRatio: false,
        responsive: false,
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        theme: 'dark1',

        title: {
            text: "Your Stats"
        },
        axisX: {
            interval: 1
        },
        axisY2: {
            interlacedColor: "rgba(1,77,101,.2)",
            gridColor: "rgba(1,77,101,.1)",
            title: "-'s Score Over Time"
        },
        data: [{
            type: "bar",
            name: "scores",
            axisYType: "primary",
            color: "#50050a",
            dataPoints: inputData ? inputData : [{ // Checks if inputData is null
                    y: 3,
                    label: "Sweden"
                },
                {
                    y: 7,
                    label: "Taiwan"
                },
                {
                    y: 5,
                    label: "Russia"
                },
                {
                    y: 9,
                    label: "Spain"
                },
                {
                    y: 7,
                    label: "Brazil"
                },
                {
                    y: 7,
                    label: "India"
                },
                {
                    y: 9,
                    label: "Italy"
                },
                {
                    y: 8,
                    label: "Australia"
                },
                {
                    y: 11,
                    label: "Canada"
                },
                {
                    y: 15,
                    label: "South Korea"
                },
                {
                    y: 12,
                    label: "Netherlands"
                },
                {
                    y: 15,
                    label: "Switzerland"
                },
                {
                    y: 25,
                    label: "Britain"
                },
                {
                    y: 28,
                    label: "Germany"
                },
                {
                    y: 29,
                    label: "France"
                },
                {
                    y: 52,
                    label: "Japan"
                },
                {
                    y: 103,
                    label: "China"
                },
                {
                    y: 134,
                    label: "US"
                }
            ]
        }]
    });
    chart.render();

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
    if (typeof userId !== 'undefined') {
        db.ref(`users/${userId}`).once('value')
            .then(snapshot => snapshot.val())
            .then(function(data) {
                // Handle read data.
                console.log(data);

            });
    } else {
        const globalField = document.querySelector('#globalField');
        globalField.innerHTML =
            '<h1>Only logged in users may see their stats with the dashboard.</h1>';
			reloadCss();
    }
}

function reloadCss() {
    var links = document.getElementsByTagName("link");
    for (var cl in links) {
        var link = links[cl];
        if (link.rel === "stylesheet")
            link.href += "";
    }
}
