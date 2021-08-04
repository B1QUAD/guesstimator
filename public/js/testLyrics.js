/*https://spotifycharts.com/regional/global/daily/latest/download
https://github.com/SOLENO/solenolyrics
https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M




https://developer.musixmatch.com/admin/applications
	c1562ca1935a6e4ef23613a28c7fc6ca


	https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=15953433&apikey=c1562ca1935a6e4ef23613a28c7fc6ca
	https://api.musixmatch.com/ws/1.1/chart.tracks.get?chart_name=top&page=1&page_size=50&country=US&f_has_lyrics=1&apikey=c1562ca1935a6e4ef23613a28c7fc6ca
*/


let key="c1562ca1935a6e4ef23613a28c7fc6ca";

let numSongs=50;
const topSongs=`https://radiant-ridge-05292.herokuapp.com/https://api.musixmatch.com/ws/1.1/chart.tracks.get?chart_name=mxmweekly&page=1&page_size=${numSongs}&country=US&f_has_lyrics=1&apikey=${key}`

/*let songNames=[];
let songArtists=[];
let songIds=[];*/
let songName;
let songArtist;
let songId;
let currSong=-1;

getLyrics= () => {
	fetch(topSongs)
		.then(response=>response.json())
		.then(data => {
			songList=data.message.body.track_list;
			//console.log(songList);
			for(let i=0;i<songList.length;i++){
				//console.log(songList[i].track.track_name + " - " + songList[i].track.artist_name);
				if(i===currSong){
					songName=songList[i].track.track_name;
					songArtist=songList[i].track.artist_name;
					songId=songList[i].track.track_id;
				}
				/*songNames.push(songList[i].track.track_name);
				songArtists.push(songList[i].track.artist_name);
				songIds.push(songList[i].track.track_id);*/
			}
			/*console.log(songNames);
			console.log(songArtists);
			console.log(songIds);*/
			console.log(songId);
			let trackId=songId;
			let lyrics=`https://radiant-ridge-05292.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${key}`;
			fetch(lyrics)
				.then(response=>response.json())
				.then(data => {
					let lyrics=data.message.body.lyrics.lyrics_body;
					let numLines=lyrics.split(/\r\n|\r|\n/).length;
					lyrics=lyrics.split(/\r\n|\r|\n/);
					lyrics=lyrics[Math.floor(numLines/2)] + " " + lyrics[Math.floor(numLines/2 + 1)];
					console.log(lyrics);
					console.log(songName + " - " + songArtist);
			});
		});
		currSong++;
}

