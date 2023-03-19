let container = document.getElementsByName("container");
let weather_details = document.getElementById("weather-details");
let not_found = document.getElementById("not-found");
let location_img = document.getElementById("location_img");
let location_select = document.getElementById("location-select");

weather_details.style.display = "none";
not_found.style.display="none";
location_select.style.display="none";

var x;

function handleKeyPress(e){
    var key=e.keyCode || e.which;

    // Grab city name based on what's written in input text
    var city = document.getElementById("location");
    
    // Clear previous selection if any
    location_select.innerHTML="";
    
    // If enter key
     if (key==13){

        fetch("https://geocoding-api.open-meteo.com/v1/search?name="+city.value)
        .then((response) => response.json())
        .then((data) => {
            for(var i in data.results) {
                var a = document.createElement('a');
                var small = document.createElement('small');
                var li = document.createElement('li');
                var img = document.createElement('img');
                console.log(data.results[i]);
                
                img.src="http://assets.open-meteo.com/images/country-flags/"+data.results[i].country_code.toLowerCase()+".svg";
                img.height=24;
                img.textContent = data.results[i].name;
                img.title = data.results[i].country;

                small.className="text-muted"
                if("admin1" in data.results[i]) {
                    var details = document.createTextNode(" "+data.results[i].admin1);
                } else {
                    var details = document.createTextNode(" "+data.results[i].country);
                }

                small.appendChild(details);

                a.className="dropdown-item"
                a.href="#"
                a.appendChild(img);
                a.appendChild(document.createTextNode(" "+data.results[i].name));
                a.appendChild(small);

                li.append(a);
                location_select.appendChild(li);
         
                location_select.style.display="block";               
            }   
            location_img.src="https://assets.open-meteo.com/images/country-flags/"+data.results[0].country_code.toLowerCase()+".svg";         

        });
        //fetch("https://api.open-meteo.com/v1/forecast?latitude=52.52&longitude=13.41&current_weather=true&hourly=temperature_2m,relativehumidity_2m,windspeed_10m")
        //.then((response) => response.json())
        //.then((data) => console.log(data));
    }
   }
   