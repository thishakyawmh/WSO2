let map,position,directionsService,directionsDisplay,Home_location;
let allPlaces = [];
let final = [];

function removePlace(buttonId) {
    // Extract the item name from the button ID
    const itemName = buttonId.replace('r', '');
    
    // Find the table
    const table = document.getElementById("FinalPlaces");
    
    // Iterate through the rows to find the matching item
    for (let i = 1; i < table.rows.length; i++) { // Start from 1 to skip header row
        const cell = table.rows[i].cells[0]; // Assuming the place name is in the first cell
        if (cell.innerHTML.includes(itemName)) {
            table.deleteRow(i); // Remove the row
            break; // Exit the loop after removing the row
        }
    }
    
    // Optionally, remove the item from the final array if necessary
    final = final.filter(item => item.name !== itemName);
    console.log(final); // Log the updated array
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

function addPlace(id) {
    allPlaces.forEach(addfunc);

    function addfunc(item) {
        if (item.name === id) {
            let table = document.getElementById("FinalPlaces");

            // Check if the header already exists
            if (table.tHead === null) { // If there is no thead, create one
                let headerRow = table.createTHead().insertRow(0);
                let headers = ["Place Name", "Photo", "Rating", "Distance & Duration", "Action"];
                headers.forEach(headerText => {
                    let cell = document.createElement("th");
                    cell.innerHTML = headerText;
                    headerRow.appendChild(cell);
                    cell.style.width = "20%"; 
                    cell.style.backgroundColor = "#262626"; // Header background color
                    cell.style.color = "white"; // Header text color
                    cell.style.padding = "12px"; // Header padding
                    cell.style.textAlign = "center"; // Header text alignment
                    cell.style.fontWeight = "bold"; // Header font weight
                    cell.style.fontSize = "20px"; // Header font size
                });
            }

            let row = table.insertRow();
            
            // Apply table styles
            table.style.borderCollapse = "separate";
            table.style.borderSpacing = "15px";
            table.style.backgroundColor = "#f0f0f0"; // Table background color
            table.style.border = "none"; // Table border
            table.style.width = "100%"; // Table width
            table.style.margin = "auto 50px"; // Table margin
            table.style.borderRadius = "15px"; // Table border radius
            table.style.marginRight = "auto";
            table.style.marginLeft = "auto";

            // Set common style for table cells
            function styleCell(cell) {
                cell.style.backgroundColor = "#ffffff"; // Cell background color
                cell.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)"; // Cell shadow
                cell.style.textAlign = "center"; // Cell text alignment
                cell.style.fontSize = "16px"; // Cell font size
                cell.style.padding = "12px"; // Cell padding
            }

            let cell1 = row.insertCell(0);
            cell1.innerHTML = `${item.name} <br> <a href="#map" id="vr${item.name}" onclick="viewPlace(this.id)" style="padding: 10px; background-color: #FF5349; color: white; text-align: center; border-radius: 5px; margin-top: 15px; display: inline-block; text-decoration: none;">View on map</a>`;
            styleCell(cell1);

            let cell2 = row.insertCell(1);
            let photoUrl = item.photo ? item.photo : "https://via.placeholder.com/150";
            cell2.innerHTML = `<img width="200" height="150" style="border-radius: 8px" src="${photoUrl}"/>`;
            styleCell(cell2);

            let cell3 = row.insertCell(2);
            cell3.innerHTML = item.rating ? `${item.rating}/5 , ${item.user_ratings_total} Reviews` : `No Ratings`;
            styleCell(cell3);

            let cell4 = row.insertCell(3);
            let request = {
                origin: Home_location,
                destination: item.geometry.location,
                travelMode: google.maps.TravelMode.DRIVING, // WALKING, BYCYCLING, TRANSIT
                unitSystem: google.maps.UnitSystem.METRIC,
            };
            directionsService.route(request, function(result, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    // Get distance and time
                    cell4.innerHTML = `${result.routes[0].legs[0].distance.text}<br> ${result.routes[0].legs[0].duration.text}<br> <a href="#map" id="dr${item.name}" onclick="viewDirection(this.id)" style="padding: 10px; background-color: darkblue; color: white; text-align: center; border-radius: 5px; margin-top: 15px; display: inline-block; text-decoration: none;">View Route</a>`;
                }
            });
            styleCell(cell4);

            let cell5 = row.insertCell(4);
            cell5.style.padding = "0"; // Remove cell padding
            cell5.style.height = "100px"; // Set a fixed height for the cell
            cell5.innerHTML = `
                <button type="button" id="r${item.name}" onclick="removePlace(this.id)" 
                style="width: 100%; height: 100%; padding: 0; margin: 0; 
                background-color: #8B0000; color: white; border: none; 
                border-radius: 5px; cursor: pointer; display: block; box-sizing: border-box; 
                font-family: 'Poppins', sans-serif; font-size: 25px;">
                REMOVE
                </button>`;
            styleCell(cell5);
            cell5.style.padding = "0px"; 
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
                return function() {
                    popupContent.setContent(item.name);
                    popupContent.open(map, marker);
                };
            })(marker));
        }
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
        table.style.border = "none";``
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
        cell.style.boxShadow = "2px 2px 5px rgba(0, 0, 0, 0.2)";
        cell.style.textAlign = "center";
        cell.style.fontSize = "16px";
        cell.style.padding = "12px"; 
    }

    let cell1 = row.insertCell(0);
    cell1.innerHTML = `${place.name} <br> <a href="#map" id="va${place.name}" onclick="viewPlace(this.id)" style="padding: 10px; background-color: #FF5349; color: white; text-align: center; border-radius: 5px; margin-top: 15px; display: inline-block; text-decoration: none;">View on map</a>`;
    styleCell(cell1);
    placeObj.name = place.name;

    let cell2 = row.insertCell(1);
    let photoUrl = place.photos ? place.photos[0].getUrl() : "https://via.placeholder.com/150";
    cell2.innerHTML = `<img width="200" height="150" style="border-radius: 8px" src="${photoUrl}"/>`;
    cell2.style.padding = "12px"; // Cell padding
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
    cell5.style.padding = "0"; // Remove cell padding
    cell5.style.height = "100px"; // Set a fixed height for the cell
    cell5.innerHTML = `
        <button type="button" id="${placeObj.name}" onclick="addPlace(this.id)" 
        style="width: 100%; height: 100%; padding: 0; margin: 0; 
        background-color: #004000; color: white; border: none; 
        border-radius: 5px; cursor: pointer; display: block; box-sizing: border-box; 
        font-family: 'Poppins', sans-serif; font-size: 25px;">
        ADD
    </button>`; 
    styleCell(cell5);
    cell5.style.padding = "0px"; 
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
            window.location.href = `PlanAI.html?id=${planId}`;
        })
        .catch((error) => {
            console.error('Failed to submit plan', error);
        });
    });
});