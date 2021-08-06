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
        dashInit();
    });


    if (category == "Programming") {
        personalHeader.innerHTML = "Top Programming Languages";
        // dashInit(); // Refresh for category change
    } else if (category == "Lyrics") {
        personalHeader.innerHTML = "Top Songs";
        // dashInit(); // Refresh for category change
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

function createChart(inputData, title) {
    var chart = new CanvasJS.Chart("chartContainer", {
        animationEnabled: true,
        maintainAspectRatio: false,
        responsive: false,
        backgroundColor: 'rgba(0, 0, 0, 0.0)',
        theme: 'dark1',

        title: {
            // text: "Your Stats"
            text: title
        },
        toolTip: {
            enabled: true,
            animationEnabled: true,
			fontColor: 'white',
			cornerRadius: 10
        },
		axisX: {
			tickPlacement: 'inside',
			tickLength: 0
		},
        axisY: {
			includeZero: true,
			maximum: 10,
			interval: 1,
			tickPlacement: 'outside'
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
    var db = firebase.database();

    // Work on data vis and pulling from the db
    // These are the ordered lists, append list item tags as children
    const personalTopThings = document.querySelector('#personal-top');
    const personalTopScores = document.querySelector('#personal-score');
    const globalHardest = document.querySelector('#hardest');
    const globalRecog = document.querySelector('#easiest');
    const globalLeader = document.querySelector('#leaderboard');

    let avgCorrectRatio, avgStreak, avgCounter = 0;
    let arr = [];
    let categoryTranslator = {
        'progLang': 'Programming'
    }

    if (typeof userId !== 'undefined') {
        db.ref(`users/${userId}/games`).once('value')
            .then(snapshot => snapshot.val())
            .then(function(data) {
                // Handle read data.
                console.log(data);

                for (let key in data) {
                    let val = data[key];
                    console.log(category);
                    if (val['hasFinished'] && categoryTranslator[val['gamemode']] === category) {
                        arr.push({
                            y: val['numCorrect'],
                            label: val['timestamp']
                        });
                        avgCorrectRatio += ((val['numCorrect'] / val['numIncorrect']) / avgCounter);
                        avgStreak += val['currentStreak'] / avgCounter;
                    }
                }

                console.log(arr);

                // Sort by lowest date
                arr = arr.sort(function(el0, el1) {
                    // Get unix epoch time stamps for each date
                    let ts0 = new Date(el0['label']).getTime();
                    let ts1 = new Date(el1['label']).getTime();

                    // If the number of milliseconds is greater than the date is later
                    return ts0 < ts1 ? ts0 : ts1;
                });

                createChart(arr, arr.length === 0 ? 'No Data' : 'Number Correct Per Session');
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
