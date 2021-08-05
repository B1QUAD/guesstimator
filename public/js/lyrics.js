/*https://spotifycharts.com/regional/global/daily/latest/download
https://github.com/SOLENO/solenolyrics
https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M




https://developer.musixmatch.com/admin/applications
	c1562ca1935a6e4ef23613a28c7fc6ca


	https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=15953433&apikey=c1562ca1935a6e4ef23613a28c7fc6ca
	https://api.musixmatch.com/ws/1.1/chart.tracks.get?chart_name=top&page=1&page_size=50&country=US&f_has_lyrics=1&apikey=c1562ca1935a6e4ef23613a28c7fc6ca
*/


let key="c1562ca1935a6e4ef23613a28c7fc6ca";
let key2="a15480b2b104cdb7ec707f3876c7e392";
key=key2;

let numSongs=50;
let topSongs=`https://radiant-ridge-05292.herokuapp.com/https://api.musixmatch.com/ws/1.1/chart.tracks.get?chart_name=top&page=1&page_size=${numSongs}&country=US&f_has_lyrics=1&apikey=${key}`;

let songNames=[];
let songArtists=[];
let songIds=[];

let currSongLs;

//will return answer
runLyricsApi = () => {
	var dateObj = new Date();
	var date = dateObj.getDate();
	if(JSON.parse(localStorage.getItem('allSongInfo'))){
		let retrievedSongObject = JSON.parse(localStorage.getItem('allSongInfo'));
		if(date==retrievedSongObject.date){
			if(localStorage.getItem('currSong')){
				currSongLs=localStorage.getItem('currSong');
			}else{
				localStorage.setItem('currSong', 0);
				currSongLs=0;
			}
			// console.log("Exists already");
			let songId=retrievedSongObject.songIds[currSongLs];
			let songName=retrievedSongObject.songName[currSongLs];
			let songArtist=retrievedSongObject.songArtists[currSongLs];
			currSongLs++;
			if(currSongLs>numSongs-1){
				currSongLs=0;
			}
			localStorage.setItem('currSong', currSongLs);
			getLyrics(songId, songName, songArtist);
			return {name: songName, artist: songArtist};
		}else{
			localStorage.clear();
			getSongInfo();
		}
	}else{
		localStorage.clear();
		getSongInfo();
	}
}

//will return lyrics
function getFinalLyrics(){
	// console.log(localStorage.getItem('lyrics'));
	return localStorage.getItem('lyrics');
}

function getSongInfo() {
	fetch(topSongs)
		.then(response=>response.json())
		.then(data => {
			songList=data.message.body.track_list;
			// console.log(songList);
			for(let i=0;i<songList.length;i++){
				// console.log(songList[i].track.track_name + " - " + songList[i].track.artist_name);
				songNames.push(songList[i].track.track_name);
				songArtists.push(songList[i].track.artist_name);
				songIds.push(songList[i].track.track_id);
			}
			var dateObj = new Date();
			var date = dateObj.getDate();
			// console.log(songNames);
			let songInfoObj={
				date:date,
				songName: songNames,
				songArtists: songArtists,
				songIds: songIds
			}
			localStorage.setItem('allSongInfo', JSON.stringify(songInfoObj));
			let retrievedSongObject = JSON.parse(localStorage.getItem('allSongInfo'));
			// console.log(retrievedSongObject);
			// console.log("ran get song info")
			runLyricsApi();
		});
}

getLyrics = (trackId, songName, songArtist) => {
	let lyrics=`https://radiant-ridge-05292.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${key}`;
			fetch(lyrics)
				.then(response=>response.json())
				.then(data => {
					let lyrics=data.message.body.lyrics.lyrics_body;
					let numLines=lyrics.split(/\r\n|\r|\n/).length;
					lyrics=lyrics.split(/\r\n|\r|\n/);
					lyrics=lyrics[Math.floor(numLines/2)] + " " + lyrics[Math.floor(numLines/2 + 1)];
					// console.log(lyrics);
					// console.log(songName + " - " + songArtist);
					localStorage.setItem('lyrics', lyrics);
					//return lyrics;
			});
}
