const categoryDropDown=document.querySelector("#category-select");
const category=document.querySelector("#category-select").value;

if(category=="Programming"){
    category="proglang";
}

categoryDropDown.addEventListener("click", function(){
  getUserStats();
});

const getUserStats = () => {
	const userRef = firebase.database().ref(`users/${userId}`);
	userRef.on('value', (snapshot) => {
		const data = snapshot.val();
		changeUserDom(data);
	});
} 

const changeUserDom = (data) => {
	if(data.games.gameMode==category){
        console.log(data);
    }
}