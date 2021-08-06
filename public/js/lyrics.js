/*https://spotifycharts.com/regional/global/daily/latest/download
https://github.com/SOLENO/solenolyrics
https://open.spotify.com/playlist/37i9dQZF1DXcBWIGoYBM5M




https://developer.musixmatch.com/admin/applications
	c1562ca1935a6e4ef23613a28c7fc6ca


	https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=15953433&apikey=c1562ca1935a6e4ef23613a28c7fc6ca
	https://api.musixmatch.com/ws/1.1/chart.tracks.get?chart_name=top&page=1&page_size=50&country=US&f_has_lyrics=1&apikey=c1562ca1935a6e4ef23613a28c7fc6ca
*/


let key = "c1562ca1935a6e4ef23613a28c7fc6ca";
let key2 = "a15480b2b104cdb7ec707f3876c7e392";
key = key2;


let numSongs = 50;
let topSongs = `https://radiant-ridge-05292.herokuapp.com/https://api.musixmatch.com/ws/1.1/chart.tracks.get?chart_name=top&page=1&page_size=${numSongs}&country=US&f_has_lyrics=1&apikey=${key}`;

let songs = [];

let currSongLs;

//will return song
runLyricsApi = () => {
    return new Promise((resolve, reject) => {
        const currentDate = new Date().getDate();
        const retrievedSongs = JSON.parse(localStorage.getItem('allSongInfo'));

        if (!retrievedSongs || currentDate != retrievedSongs.dateRetrieved) {
            localStorage.clear();
            setAllSongInfo().then(result => {
                getNextSongWithLyrics(retrievedSongs).then(song => {
                    resolve(song);
                });
            });
            return;
        }

        getNextSongWithLyrics(retrievedSongs).then(song => {
            resolve(song);
        });
    });
}

function setAllSongInfo() {
    return new Promise((resolve, reject) => {
        fetch(topSongs)
            .then(response => response.json())
            .then(data => {
                songList = data.message.body.track_list;
                for (let i = 0; i < songList.length; i++) {
                    songs.push({
                        id: songList[i].track.track_id,
                        name: songList[i].track.track_name,
                        artist: songList[i].track.artist_name
                    });
                }
                var currentDate = new Date().getDate();
                let songInfoObj = {
                    dateRetrieved: currentDate,
                    songs: songs
                }
                localStorage.setItem('allSongInfo', JSON.stringify(songInfoObj));
                resolve(true);
            });
    });
}

function getNextSongWithLyrics(retrievedSongs) {
    return new Promise((resolve, reject) => {
        if (localStorage.getItem('currSong')) {
            currSongLs = localStorage.getItem('currSong');
        } else {
            localStorage.setItem('currSong', 0);
            currSongLs = 0;
        }
        
        // Does this fix the rate limit problem? //
        let song = retrievedSongs.songs[currSongLs];
        /*try {
            song = retrievedSongs.songs[currSongLs];
        }
        catch(err) {
            try{
                key = key2;
            }
            catch(err){
                key = key;
            }
            song = retrievedSongs.songs[currSongLs];
        }*/
        ///////////////////////////////////////////

        currSongLs++;
        if (currSongLs > numSongs - 1) {
            currSongLs = 0;
        }
        localStorage.setItem('currSong', currSongLs);

        getLyrics(song.id).then(lyrics => {
            song.lyrics = lyrics;
            resolve(song);
        });
    });
}

const getLyrics = (trackId) => {
    return new Promise((resolve, reject) => {
        let lyrics = `https://radiant-ridge-05292.herokuapp.com/https://api.musixmatch.com/ws/1.1/track.lyrics.get?track_id=${trackId}&apikey=${key}`;
        fetch(lyrics)
            .then(response => response.json())
            .then(data => {
                let lyrics = data.message.body.lyrics.lyrics_body;
                let numLines = lyrics.split(/\r\n|\r|\n/).length;
                lyrics = lyrics.split(/\r\n|\r|\n/);
                lyrics = lyrics[Math.floor(numLines / 2)] + "\n " + lyrics[Math.floor(numLines / 2 + 1)] + "\n " + lyrics[Math.floor(numLines / 2 + 2)] + "\n " + lyrics[Math.floor(numLines / 2 + 3)];
          
                let badWords=["anal,anus,arse,ass,ass fuck,ass hole,assfucker,asshole,assshole,bastard,bitch,black cock,bloody hell,boong,cock,cockfucker,cocksuck,cocksucker,coon,coonnass,crap,cunt,cyberfuck,damn,darn,dick,dirty,douche,dummy,erect,erection,erotic,escort,fag,faggot,fuck,Fuck off,fuck you,fuckass,fuckhole,god damn,gook,hard core,hardcore,homoerotic,hore,lesbian,lesbians,mother fucker,motherfuck,motherfucker,negro,nigger,orgasim,orgasm,penis,penisfucker,piss,piss off,porn,porno,pornography,pussy,retard,sadist,sex,sexy,shit,slut,son of a bitch,suck,tits,viagra,whore"];
                for(let i; i<badWords.length;i++){
                    lyrics.replace(badWords[i], "****");                        
                }
                resolve(lyrics);
            });
    });
}
