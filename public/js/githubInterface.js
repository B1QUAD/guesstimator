var isGithubUser = false;
var potentialFiles = [];

// The key (file extension) is also considered a valid answer choice
var languages = {};

// This needs to be run and completed before anything else!!!!
async function githubApiInit() {
<<<<<<< HEAD
	await loadFromApi('/util/langs.json', {
			method: 'GET',
			headers : {
				'Content-Type': 'application/json',
				'Accept': 'application/json'
 			}
		}).then(response => response['jsonResponse']).then(function(langs) {
			languages = langs;
		});
=======
    await loadFromApi('/util/langs.json', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        }
    }).then(response => response['jsonResponse']).then(function (langs) {
        languages = langs;
    });
>>>>>>> 660a4d51ad2b3b6cea8a21f2801820ada4c5862c
}


// Rate limited to 10 requests per minute
function getQuestion() {
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
            returnObj['codeRef'] = getRandomValFromArray(choices)['html_url'];
            resolve(returnObj);
    	});
    });
}

// Gets and returns an array with numQuestions indices.
// Capped at 10 questions per call
async function getQuestions(numQuestions) {
    let questions = [];
    if (numQuestions > 10) {
        console.log(`${numQuestions} would get rate limited after the 10th request.\n`);
        numQuestions = 10; // Cap at 10 requests
    }

    for (let i = 0; i < numQuestions; i++) {
        questions.push(await getQuestion());
    }

    console.log('Do not call getQuestion or getQuestions for another minute to avoid rate limiting.');
    return questions;
}

async function loadFromApi(url, params) {
<<<<<<< HEAD
	return await fetch(url, params)
		.then(function(response) {
			let status = response.status;
			console.log(typeof status, '\n' + status);
			if(status === 403) {
				alert('Rate limit for GitHub exceeded.\nPlease wait ~30 seconds before continuing play.')
			} else if (status !== 200) {
				alert('Error calling the GitHub API.\nPlease refresh the page.');
			}

			return {
				rawResponse: response,
				jsonResponse: response.json()
			};
		}).catch(function(error) {
			console.log(error);
		});
=======
    return new Promise((resolve, reject) => {
        fetch(url, params).then(async function (response) {
            let status = response.status;
            console.log(typeof status, '\n' + status);
            let jsonResponse = await response.json();
            console.log(jsonResponse);

            if (status === 403) {
                alert('Rate limit for GitHub exceeded.\nPlease wait ~30 seconds before continuing play.')
            } else if (status !== 200) {
                alert('Error calling the GitHub API.\nPlease refresh the page.');
            } else {
                // window.location.href = window.location.search;
            }

            resolve({rawResponse: response, jsonResponse: jsonResponse});
        }).catch(function (error) {
            console.log(error);
        });
    });
>>>>>>> 660a4d51ad2b3b6cea8a21f2801820ada4c5862c
}

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
