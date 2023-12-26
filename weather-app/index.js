let container = document.getElementsByName("container");
let weather_details = document.getElementById("weather-details");
let not_found = document.getElementById("not-found");
let location_img = document.getElementById("location_img");
let location_select = document.getElementById("location-select");

// Set stuff that should not be visible
weather_details.style.display = "none";
not_found.style.display="none";
location_select.style.display="none";

var debug;

async function getData(query) {
    fetch(query).then((response) => response.json()).then(data =>{
        debug=data;
        console.log(data);
        console.log("Pedro");
    });
}

location_select.addEventListener('click', function(e) {
    e.preventDefault();
    urlParams = new URLSearchParams(window.location.search);

    // Acquire parameters from url
    const latitude = urlParams.get('latitude');
    const longitude = urlParams.get('longitude');
    console.log(latitude);
    console.log(longitude);

    // Build the query
    /*
    var query =  "https://api.open-meteo.com/v1/forecast"
        query += "?latitude=" + latitude;
        query += "&longitude=" + longitude;
        query +="&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m";
    */
    var query = "https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m"

    console.log(query);
    getData(query);

});


// Handle keys pressed
function handleKeyPress(e){
    var key=e.keyCode || e.which;

    // Grab city name based on what's written in input text
    var city = document.getElementById("location");
    
    // Clear previous selection if any
    location_select.innerHTML="";
    
    // Reset not found
    not_found.style.display="none";
    

    // If enter key
    if (key == 13) {

        // Fetch the city from open-meteo
        fetch("https://geocoding-api.open-meteo.com/v1/search?name="+city.value)
        .then((response) => response.json())
        .then((data) => {
            console.log(data);

            
            if (!data.results) {
                // React to the fact that there might not be results
                console.log("Is undefined");
                not_found.style.display="block";
            } else {
                // Go through the fetch results
                for(var i in data.results) {
                    // Create elements to store in <ul> list
                    var a = document.createElement('a');
                    var small = document.createElement('small');
                    var li = document.createElement('li');
                    var img = document.createElement('img');


                    //console.log(data.results[i]);
                
                    // Get circle flag 
                    img.src="https://hatscripts.github.io/circle-flags/flags/"+data.results[i].country_code.toLowerCase()+".svg";
                    img.height=24;
                    img.textContent = data.results[i].name;
                    img.title = data.results[i].country;

                    small.className="text-muted"

                    var country = data.results[i].country;
                    
                    // Add selected city details 
                    let str = " "+`${country}`+" ("+ `${data.results[i].latitude}; ${data.results[i].longitude}`+ ")";
                    var details = document.createTextNode(str);
                    small.appendChild(details);

                    a.className="dropdown-item"
                    a.href ="?latitude=" + `${data.results[i].latitude}`;
                    a.href+="&longitude=" + `${data.results[i].longitude}`;


                    a.appendChild(img);
                    a.appendChild(document.createTextNode(" "+data.results[i].name));
                    a.appendChild(small);

                    li.className="city"+i;
                    li.data_input=i;
                    li.append(a);
                    location_select.appendChild(li);
         
                    location_select.style.display="block";               
                }   
            }
        });
        //fetch("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m")
        //.then((response) => response.json())
        //.then((data) => console.log(data));
    }
   }
   