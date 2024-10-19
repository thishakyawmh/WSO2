let map,position,directionsService,directionsDisplay,Home_location;
let allPlaces = [];
let final = [];

function removePlace(id){
    id = id.slice(1,);
    console.log(id);
    final.forEach(rmfunc);

    function rmfunc(item,index){
        if(item.name === id){
            final.splice(index, 1);
            document.getElementById("FinalPlaces").deleteRow(index);
        }
    }
    console.log(final);
    
}

function viewPlace(id){
    const check = id.slice(0,2);
    id = id.slice(2,);
    console.log(id);
    if(check === 'va'){
        allPlaces.forEach(vifunc);
    }
    else{
        final.forEach(vifunc);
    }

    function vifunc(item){
        if(item.name === id){
            let bounds = new google.maps.LatLngBounds();
            if (!item.geometry) {
            return;
            }
            if (item.geometry.viewport) {
            bounds.union(item.geometry.viewport);
            } else {
            bounds.extend(item.geometry.viewport);
            }
            map.fitBounds(bounds);
            return;
        }
    }
    
}

function viewDirection(id){
    const check = id.slice(0,2);
    id = id.slice(2,);
    if(check === 'da'){
        allPlaces.forEach(dfunc);
    }
    else{
        final.forEach(dfunc);
    }

    function dfunc(item){
        let request = {
            origin:Home_location,
            destination:item.geometry.location,
            travelMode:google.maps.TravelMode.DRIVING,//WALKING,BYCYCLING,TRANSIT
            unitSystem:google.maps.UnitSystem.METRIC,
        }
        directionsService.route(request,function(result,status){
            if(status == google.maps.DirectionsStatus.OK){
                    directionsDisplay.setDirections(result);
                }
            }
        )
    }
}

function addPlace(id){
    allPlaces.forEach(addfunc);

    function addfunc(item) {
        if(item.name === id){

            //!!!!!!!!!!!!!!!!!!First Table Start!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
            let table = document.getElementById("FinalPlaces");
            table.classList.add("styled-table"); // Add a class to your table
            let row = table.insertRow();
            let cell1 = row.insertCell(0);
            cell1.innerHTML = `${item.name} <br> <a href="#map" id="vr${item.name}" onclick="viewPlace(this.id)">View on map</a>`;
            if (item.photo){
                let cell2 = row.insertCell(1);
                cell2.innerHTML = `<img width="200" height="150" style="border-radius: 8px" src="${item.photo}"/>`;
            }
            else{
                let photoUrl = "https://via.placeholder.com/150";
                let cell2 = row.insertCell(1);
                cell2.innerHTML = `<img width="200" height="150" style="border-radius: 8px" src="${photoUrl}"/>`
            }
            if(item.rating){
                let cell3 = row.insertCell(2);
                cell3.innerHTML = `${item.rating}/5 , ${item.user_ratings_total} Reviews`;
            }
            else{
                let cell3 = row.insertCell(2);
                cell3.innerHTML = `No Ratings`;
            }

            let cell4 = row.insertCell(3);
            let request = {
                origin:Home_location,
                destination: item.geometry.location,
                travelMode:google.maps.TravelMode.DRIVING,//WALKING,BYCYCLING,TRANSIT
                unitSystem:google.maps.UnitSystem.METRIC,
            }
            directionsService.route(request,function(result,status){
                if(status == google.maps.DirectionsStatus.OK){
                    //Get distance and time
                    cell4.innerHTML = 
                       `${result.routes[0].legs[0].distance.text}<br> ${result.routes[0].legs[0].duration.text}
                        <br> <a href="#map" id="dr${item.name}" onclick="viewDirection(this.id)">View Route</a>`
                    }
            });

            let cell5 = row.insertCell(4);
            cell5.innerHTML = `<button type="button" id="r${item.name}" onclick="removePlace(this.id)" class="btn btn-warning">REMOVE</button>`;
            final.push(item);
            console.log(final);
            
            const marker = new google.maps.Marker({
                map: map,
                position: item.geometry.location,
                title: item.name,
            });
            let bounds = new google.maps.LatLngBounds();
            if (!item.geometry) {
            return;
            }
            if (item.geometry.viewport) {
            bounds.union(item.geometry.viewport);
            } else {
            bounds.extend(item.geometry.viewport);
            }
            map.fitBounds(bounds);
            const popupContent = new google.maps.InfoWindow();
            google.maps.event.addListener(marker, 'click', (function(marker) {
                return function(){
                popupContent.setContent(item.name)
                popupContent.open(map, marker)
            }
            })(marker)
        )//!!!!!!!!!!!!!!!!!!First Table End!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
        };
    }
}

function initMap(){
    autocomplete = new google.maps.places.Autocomplete((document.getElementById("autocomplete")),
    {
        types:['geocode']
    });

    autocomplete.addListener('place_changed',searchNearbyPlaces);

    const popupContent = new google.maps.InfoWindow();

    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 12,
    });

    if(navigator.geolocation){
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const pos = {
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                };
                Home_location = pos;
                const icon = {
                url: "img/home-icon-br.png", 
                scaledSize: new google.maps.Size(50, 50),
                };
                const marker = new google.maps.Marker({
                    position: pos,
                    icon: icon,
                    title: "Home",
                });
                marker.setMap(map)
                map.setCenter(pos);
                map.setZoom(13)

                google.maps.event.addListener(marker, 'click', (function(marker) {
                return function(){
                popupContent.setContent("Home")
                popupContent.open(map, marker)
                }
                })(marker)

                )
            }
        );
    }
    directionsService = new google.maps.DirectionsService();
    directionsDisplay = new google.maps.DirectionsRenderer();

    directionsDisplay.setMap(map);


}
document.getElementById('type').onchange = searchNearbyPlaces;

function searchNearbyPlaces(){
    allPlaces = [];
    document.getElementById('places').innerHTML = '';
    let place = autocomplete.getPlace();
    let bounds = new google.maps.LatLngBounds();
        if (!place.geometry) {
            return;
        }
        if (place.geometry.viewport) {
            bounds.union(place.geometry.viewport);
        } else {
            bounds.extend(place.geometry.viewport);
        }
    map.fitBounds(bounds);

    service = new google.maps.places.PlacesService(map);
    service.nearbySearch({
        location: place.geometry.location,
        radius: '5000',
        type: [document.getElementById('type').value]
    },callback);

    function callback(results, status){
        if(status === google.maps.places.PlacesServiceStatus.OK){
            console.log(results.length);
            results.sort(function(a, b){return b.user_ratings_total
                - a.user_ratings_total
            });
            for(let i = 0; i < results.length; i++){
                createMaker(results[i]);
            }
        }
    }
}

function createMaker(place, length) {
    const placeObj = {};
    let table = document.getElementById("places");

    // Add table heading if it does not exist
    if (table.rows.length === 0) {
        let header = table.createTHead();
        let row = header.insertRow(0);
        row.style.backgroundColor = "#f2f2f2"; // Example background color for the header

        let headers = ["Place Name", "Photo", "Rating", "Distance & Duration", "Action"];
        headers.forEach(headerText => {
            let cell = document.createElement("th");
            cell.innerHTML = headerText;
            row.appendChild(cell);
            cell.style.width = "20%"; 
            cell.style.backgroundColor = "#262626";
            cell.style.color = "white";
            cell.style.padding = "12px";
            cell.style.textAlign = "center";
            cell.style.fontWeight = "bold";
            cell.style.fontSize = "20px";
            cell.style.width = "20%"; // Set equal width for each column
        });

        // Apply table styles
        table.style.borderCollapse = "separate";
        table.style.borderSpacing = "15px";
        table.style.backgroundColor = "#f0f0f0";
        table.style.border = "none";
        table.style.width = "100%";
        table.style.margin = "auto 50px";
        table.style.borderRadius = "15px";
        table.style.marginRight = "auto";
        table.style.marginLeft = "auto";

    }

    // Add rows with place data
    let row = table.insertRow();
    
    // Set common style for table cells
    function styleCell(cell) {
        cell.style.backgroundColor = "#ffffff";
        cell.style.padding = "12px";
        cell.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
        cell.style.textAlign = "center";
        cell.style.fontSize = "16px";
    }

    let cell1 = row.insertCell(0);
    cell1.innerHTML = `${place.name} <br> <a href="#map" id="va${place.name}" onclick="viewPlace(this.id)" style="padding: 10px; background-color: #FF5349; color: white; text-align: center; border-radius: 5px; margin-top: 15px; display: inline-block; text-decoration: none;">View on map</a>`;
    styleCell(cell1);
    placeObj.name = place.name;

    let cell2 = row.insertCell(1);
    let photoUrl = place.photos ? place.photos[0].getUrl() : "https://via.placeholder.com/150";
    cell2.innerHTML = `<img width="200" height="150" style="border-radius: 8px" src="${photoUrl}"/>`;
    styleCell(cell2);
    placeObj.photo = photoUrl;

    let cell3 = row.insertCell(2);
    cell3.innerHTML = place.rating ? `${place.rating}/5 , ${place.user_ratings_total} Reviews` : "No Ratings";
    styleCell(cell3);
    placeObj.user_ratings_total = place.user_ratings_total;
    placeObj.rating = place.rating;

    let cell4 = row.insertCell(3);
    let request = {
        origin: Home_location,
        destination: place.geometry.location,
        travelMode: google.maps.TravelMode.DRIVING, //WALKING, BYCYCLING, TRANSIT
        unitSystem: google.maps.UnitSystem.METRIC,
    };

    directionsService.route(request, function (result, status) {
        if (status == google.maps.DirectionsStatus.OK) {
            // Get distance and time
            cell4.innerHTML =
                `${result.routes[0].legs[0].distance.text}<br> ${result.routes[0].legs[0].duration.text}
                <br> <a href="#map" id="da${place.name}" onclick="viewDirection(this.id)" style="padding: 10px; background-color: darkblue; color: white; text-align: center; border-radius: 5px; margin-top: 15px; display: inline-block; text-decoration: none;">View Route</a>`;
            placeObj.distanceResult = result;
        } else {
            console.log("Distance result fetch Fail!");
        }
    });
    styleCell(cell4);

    let cell5 = row.insertCell(4);
    cell5.innerHTML = `<button type="button" id="${placeObj.name}" onclick="addPlace(this.id)" class="btn btn-primary">ADD</button>`;
    styleCell(cell5);
    placeObj.geometry = place.geometry;
    placeObj.types = place.types;
    console.log(place);
    allPlaces.push(placeObj);
}





// Get the input elements
const plannameInput = document.getElementById('plan-name');
const dateInput = document.getElementById('date');
const startTimeInput = document.getElementById('start-time');
const returnTimeInput = document.getElementById('return-time');
const participantsInput = document.getElementById('participants');
const budgetInput = document.getElementById('budget');
const LocationInput = document.getElementById('autocomplete');


document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('submitButton').addEventListener('click', function(event) {
        event.preventDefault();

        // Ensure these variables correctly reference your input elements
        let plannameInput = document.getElementById('plan-name');
        let dateInput = document.getElementById('date');
        let startTimeInput = document.getElementById('start-time');
        let returnTimeInput = document.getElementById('return-time');
        let participantsInput = document.getElementById('participants');
        let budgetInput = document.getElementById('budget');
        let locationInput = document.getElementById('autocomplete');

        let data = {
            planName: plannameInput.value,
            date: dateInput.value,
            startTime: startTimeInput.value,
            returnTime: returnTimeInput.value,
            participants: participantsInput.value,
            budget: budgetInput.value,
            location: locationInput.value
        };

        // Assuming 'final' is a global variable
        final.push(data);
        console.log(final);
        const finalJSON = JSON.stringify(final);


        axios.post("http://localhost:9090/plans/plans", { plan: finalJSON })
        .then((response) => {
            const planId = response.data; // Ensure the response contains the ID
            window.location.href = `output.html?id=${planId}`;
        })
        .catch((error) => {
            console.error('Failed to submit plan', error);
        });
    });
});



// function incrementCount(id, targetValue, duration) {
//     let currentValue = 0;
//     const incrementStep = Math.ceil(targetValue / (duration / 10)); // Calculate step size

//     const counter = setInterval(() => {
//         currentValue += incrementStep;
//         if (currentValue >= targetValue) {
//             currentValue = targetValue;
//             clearInterval(counter); // Stop the interval when the target is reached
//             document.getElementById(id).innerText = currentValue.toLocaleString() + '+'; // Append "+" after reaching target
//         } else {
//             document.getElementById(id).innerText = currentValue.toLocaleString(); // Format the number
//         }
//     }, 10); // Interval time in milliseconds
// }

// // Run the function for both live user count and total plans
// document.addEventListener("DOMContentLoaded", function() {
//     incrementCount('live-user-count', 1500, 2000); // 1500 users in 2 seconds
//     incrementCount('total-plans', 5000, 2500); // 5000 plans in 2.5 seconds
// });


// const apiKey = 'YOUR_API_KEY'; // Replace with your actual API key
// const weatherForm = document.getElementById('weather-form');
// const weatherOutput = document.getElementById('weather-output');
// const weatherText = document.getElementById('weather-text');
// const weatherIcon = document.getElementById('weather-icon');

// // Function to fetch weather forecast
// async function getWeatherForecast(location) {
//     const url = `http://api.weatherapi.com/v1/forecast.json?key=${apiKey}&q=${location}&days=3`;
    
//     try {
//         const response = await fetch(url);
//         const data = await response.json();
//         return data.forecast.forecastday;
//     } catch (error) {
//         console.error('Error fetching weather data:', error);
//     }
// }

// // Function to find the closest forecast based on the selected date
// function getForecastForDate(forecastData, selectedDate) {
//     return forecastData.find(forecast => forecast.date === selectedDate);
// }

// Event listener for the form submission
// weatherForm.addEventListener('submit', async (event) => {
//     event.preventDefault();

//     // Get the user's input
//     const location = document.getElementById('autocomplete');
//     const selectedDate = document.getElementById('date');

//     // Fetch the weather forecast
//     const forecastData = await getWeatherForecast(location);

//     // Get the forecast for the selected date
//     const forecast = getForecastForDate(forecastData, selectedDate);
    
//     if (forecast) {
//         const condition = forecast.day.condition.text; // Weather condition (e.g., "Sunny", "Rainy")
//         const temp = forecast.day.avgtemp_c; // Average temperature in Celsius
//         const icon = forecast.day.condition.icon; // Icon URL from the API

//         // Update the text and icon
//         weatherText.textContent = `${condition}, ${temp}°C`;
//         weatherIcon.src = icon; // Set the icon from API

//         // Optionally change the icon or text based on weather condition
//         if (condition.toLowerCase().includes('sunny')) {
//             weatherIcon.src = 'weather-images/sun.png';  // Use local sunny icon
//         } else if (condition.toLowerCase().includes('cloudy')) {
//             weatherIcon.src = 'weather-images/cloudy.png';  // Use local cloudy icon
//         } else if (condition.toLowerCase().includes('rain')) {
//             weatherIcon.src = 'weather-images/rainy-day.png';  // Use local rainy icon
//         }
//     } else {
//         weatherText.textContent = "No forecast available for this date";
//         weatherIcon.src = ''; // Remove the icon if no data
//     }
// });
