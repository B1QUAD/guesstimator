var isGithubUser = false;
var potentialFiles = [];

// The key (file extension) is also considered a valid answer choice
var languages = {};

// This needs to be run and completed before anything else!!!!
async function githubApiInit() {
    await loadFromApi('/util/langs.json', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(response => response['jsonResponse']).then(function(langs) {
        languages = langs;
    });
}


// Rate limited to 10 requests per minute
function getGithubQuestion() {
    return new Promise((resolve, reject) => {
        let currentLang = getRandomLang();
        let choices; // Array of js objects containing matching files
        let json;
        let returnObj = {
            codeRef: '', // url to github blob
            answer: [currentLang].concat(languages[currentLang])
        };

        // Search for files with that language in them
        // https://api.github.com/search/code?q=language:${lang}+repo:leachim6/Hello-World
        loadFromApi(`https://api.github.com/search/code?q=language:${currentLang}+repo:leachim6/Hello-World`, {
            method: 'GET',
            headers: {
                'Accept': 'application/vnd.github.v3+json'
            }
        }).then(function(response) {
            json = response['jsonResponse'];
            choices = json['items'];

            // Check to see if the API returned nothing for some reason
            if (json['total_count'] < 1) {
                console.log('Re trying API request');
                resolve(getGithubQuestion());
            } else if (response['status'] === 403) {
                getBackupQuestion().then(question => {
                    resolve({
                        codeRef: question.content,
                        answer: question.acceptedAnswers
                    });
                });
            } else {
                returnObj['codeRef'] = getRandomValFromArray(choices)['html_url'];
                resolve(returnObj);
            }
        });
    });
}

function loadFromApi(url, params) {
    return new Promise((resolve, reject) => {
        fetch(url, params).then(async function(response) {
            let status = response.status;
            // console.log(typeof status, '\n' + status);
            let jsonResponse = await response.json();
            // console.log(jsonResponse);

            if (status === 403) {
                // alert('Rate limit for GitHub exceeded.\nPlease wait ~30 seconds before continuing play.')
            } else if (status !== 200) {
                alert('Error calling the GitHub API.\nPlease refresh the page.');
            } else {
                // window.location.href = window.location.search;
            }

            resolve({
                rawResponse: response,
                jsonResponse: jsonResponse,
                status: status
            });
        }).catch(function(error) {
            // console.log(error);
        });
    });
}

const getBackupQuestion = () => {
    return new Promise((resolve, reject) => {
        const questionsRef = firebase.database().ref('/questions/progLang');
        questionsRef.get().then(snapshot => {
            const questions = snapshot.val();
            const keys = Object.keys(questions);
            resolve(questions[keys[keys.length * Math.random() << 0]]);
        });
    });
};

// ********************************
// * Utility functions            *
// ********************************

// Returns random language for use with generating questions
function getRandomLang() {
    let keys = Object.keys(languages);
    // Returns a language given a random key
    return keys[randFromRange(0, keys.length - 1)];
}

// Does what it says on the can
// Returns a value from the provided array from a pseudo-random index
function getRandomValFromArray(array) { // return array[Math.floor(Math.random() * array.length)];
    return array[randFromRange(0, array.length - 1)];
}

// Returns an integer between min and max inclusive
function randFromRange(min, max) { // Just to be safe
    min = Math.ceil(min);
    max = Math.floor(max);

    return Math.floor(Math.random() * (max - min + 1)) + min;
}
