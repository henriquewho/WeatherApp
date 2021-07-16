/* Using the OpenWeatherMap API https://api.openweathermap.org */

let k = config.key;

/* Elements from the HTML/page*/
const main = document.getElementById('main');
const form = document.getElementById('form');
const button = document.getElementById("submitButton");

const search1 = document.getElementById('mainCity');
const search2 = document.getElementById('otherCity');
const temp1 = document.getElementById('temp1');
const temp2 = document.getElementById('temp2');
const alert1 = document.getElementById('alert1');
const alert2 = document.getElementById('alert2');

const yesButton = document.getElementById('yes');
const question = document.getElementById('question-card');

/* Formats the search / API URL */
function url(city, k){
    return `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=metric&appid=${k}`
}

/* Queries the search in the API, with the formated url, then calls the 
function that adds the data to the page DOM */

async function getWeatherBycity(city){
    const urlAPI = url(city, k); 
    try {
        let resp = await fetch(urlAPI); 
        let respData = await resp.json(); 
        return respData; 
    } catch (err){
        console.log('Error with the API: '+err)
    }
}

/* After the data is obtained by getWeatherByCity, a div is dynamically
created on the page. */

function addDifferenceToPage(data1, data2, state){
    
    const weather = document.createElement('div'); 
    weather.classList.add('weather'); 
    let str='';

    if (state){
        if (state=='both'){
            str = `
            <div class="card response">
            <h3>We could't find both cities. Please try again.</h3>
            </div> `
        } else if (state=='first'){
            str = `
            <div class="card response">
            <h3>The first city was not found. Please try again.</h3>
            </div> `
        } else if (state =='second'){
            str = `
            <div class="card response">
            <h3>The second city was not found. Please try again.</h3>
            </div> `
        }
    } else {
        const temps = [Math.floor(data1.main.temp) , Math.floor(data2.main.temp)];
        const cities = [data1.name, data2.name];
        if (temps[0]>temps[1]){
            let temp = (temps[1]-temps[0])*-1;
            str = `
            <div class="card response" style="background-color: rgb(134, 134, 243)">
            <h3>${cities[1]} is ${temp} degrees colder than ${cities[0]} right now!</h3>
            </div> `
    
        } else if (temps[1]>temps[0]) {
            str = `
            <div class="card response" style="background-color: rgb(248, 160, 160)">
            <h3>${cities[1]} is ${temps[1]-temps[0]} degrees hotter than ${cities[0]} right now!</h3>
            </div> 
        `
        } else {
            str = `
            <div class="card response" style="background-color: white">
            <h3>The temperature is the same in ${cities[0]} and ${cities[1]} right now, ${temps[0]} dregrees!</h3>
            </div> 
        `
        }
    
        temp1.textContent = `${temps[0]}ºC`;
        temp2.textContent = `${temps[1]}ºC`;;
    }

    

    weather.innerHTML = str; 
    main.innerHTML = ''; 
    main.appendChild(weather); 
}


/* Event listener for the submission of the form, with the name of the city
preventDefault() prevents the field to be submited without a string
https://www.w3schools.com/jsref/event_preventdefault.asp

search is the text input field on the form. If there's a city string in this
input, run the function that consults the API. */

form.addEventListener('submit', inputField =>{
    inputField.preventDefault(); 
    const city = search2.value;

    if (city) {
        getWeatherBycity(city); 
    }
});

/* Makes the div button 'clickable' with the space bar and
enter button, not only with mouse click.
Makes 'enter' work in the search fields */
button.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.code === 'Enter' || event.code === 'Space') {
        button.click();
    }
});

search2.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.code === 'Enter') {
        button.click();
    }
});

search1.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.code === 'Enter') {
        button.click();
    }
});

/* Get the temperatures and call the function that will
present the information on the screen */

async function submitClick(){
    clearAlerts(); 
    clearTemperatures(); 
    let data1=data2=null;

    // First tests if both cities were entered
    if (!search1.value || search1.value=="") {
        alert('You need to enter "Your City"!');
    } else if (!search2.value || search2.value=="") {
        alert('You need to enter "Other City"!');
    } else {
        // Both cities were entered, call function
        data1 = await getWeatherBycity(search1.value); 
        data2 = await getWeatherBycity(search2.value); 

        if (data1.main && data2.main) {
            addDifferenceToPage(data1, data2); 

        } else if (data1.cod=='404' && data2.cod=='404'){
            alert1.style.display='flex'; 
            alert2.style.display='flex'; 
            addDifferenceToPage(null, null, 'both');

        } else if (data1.cod=='404') {
            alert1.style.display='flex'; 
            addDifferenceToPage(null, null, 'first');

        } else if (data2.cod=='404') {
            alert2.style.display='flex'; 
            addDifferenceToPage(null, null, 'second');
        }
        
    }
}

function clearTemperatures(){
    temp1.textContent = temp2.textContent = ``; 
}

function clearAlerts(){
    alert1.style.display = alert2.style.display = 'none'; 
}

function clearClick(){
    main.innerHTML = ''; 
    search1.value = ''; 
    search2.value = ''; 
    clearTemperatures(); 
    clearAlerts(); 
}

/* Get the current city if the user allows it. 
Simple API that fetches the location based on the IP
*/

function getLocationPopup(){
    let resp = confirm("This website wants to use your location (city),  based on your IP Address. Do you want to allow it?")
    if (resp){
        getLocation()
    }   
}

function getLocation(){
    fetch('https://extreme-ip-lookup.com/json/')
    .then( res => res.json())
    .then(response => {
        console.log('city '+response.city)
        search1.value = response.city;
    })
    .catch((data, status) => {
        console.log('Location request failed');
    })
}
if (!search1.value) {
    //getLocationPopup()
}

function yesClick(){
    getLocationJQ(); 
    noClick(); 
    showCard(); 
}

function noClick(){
    question.style.display = 'none'; 
    showCard(); 
}

function showCard(){
    document.getElementById('mainCard').style.display = 'block';
}

/* new location getter */

function getLocationJQ(){
    $.ajax({
        url: "https://geolocation-db.com/jsonp",
        jsonpCallback: "callback",
        dataType: "jsonp",
        success: function(location) {
          $('#city').html(location.city);
          //alert(location.city); 
          search1.value = location.city; 
        }
    });
}
