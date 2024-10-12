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

            let table = document.getElementById("FinalPlaces");
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
                        <br> <a href="#map" id="dr${item.name}" onclick="viewDirection(this.id)">View on map</a>`
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
        )
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
            results.sort(function(a, b){return b.rating - a.rating});
            for(let i = 0; i < results.length; i++){
                createMaker(results[i]);
            }
        }
    }
}
function createMaker(place,length){
    const placeObj = {};
    let table = document.getElementById("places");
    let row = table.insertRow();
    let cell1 = row.insertCell(0);
    cell1.innerHTML = `${place.name} <br> <a href="#map" id="va${place.name}" onclick="viewPlace(this.id)">View on map</a>`;
    placeObj.name = place.name;
    if (place.photos){
        let photoUrl = place.photos[0].getUrl();
        let cell2 = row.insertCell(1);
        cell2.innerHTML = `<img width="200" height="150" style="border-radius: 8px" src="${photoUrl}"/>`
        placeObj.photo = photoUrl;
    }
    else{
        let photoUrl = "https://via.placeholder.com/150";
        let cell2 = row.insertCell(1);
        cell2.innerHTML = `<img width="200" height="150" style="border-radius: 8px" src="${photoUrl}"/>`
    }
    if(place.rating){
        let cell3 = row.insertCell(2);
        cell3.innerHTML = `${place.rating}/5 , ${place.user_ratings_total} Reviews`;
        placeObj.rating = place.rating;
        placeObj.user_ratings_total = place.user_ratings_total
    }
    else{
        let cell3 = row.insertCell(2);
        cell3.innerHTML = `No Ratings`;
    }

    let cell4 = row.insertCell(3);
    let request = {
        origin:Home_location,
        destination: place.geometry.location,
        travelMode:google.maps.TravelMode.DRIVING,//WALKING,BYCYCLING,TRANSIT
        unitSystem:google.maps.UnitSystem.METRIC,
    }

    directionsService.route(request,function(result,status){
        if(status == google.maps.DirectionsStatus.OK){
            //Get distance and time
            cell4.innerHTML = 
                `${result.routes[0].legs[0].distance.text}<br> ${result.routes[0].legs[0].duration.text}
                <br> <a href="#map" id="da${place.name}" onclick="viewDirection(this.id)">View on map</a>`
            placeObj.distanceResult = result;
            }
        else{
            console.log("Distance result fetch Fail!")
        }
        });

    let cell5 = row.insertCell(4);
    cell5.innerHTML = `<button type="button" id="${placeObj.name}" onclick="addPlace(this.id)" class="btn btn-primary">ADD</button>`;
    placeObj.geometry = place.geometry;
    allPlaces.push(placeObj);
    console.log(place);
}

function incrementCount(id, targetValue, duration) {
    let currentValue = 0;
    const incrementStep = Math.ceil(targetValue / (duration / 10)); // Calculate step size

    const counter = setInterval(() => {
        currentValue += incrementStep;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(counter); // Stop the interval when the target is reached
            document.getElementById(id).innerText = currentValue.toLocaleString() + '+'; // Append "+" after reaching target
        } else {
            document.getElementById(id).innerText = currentValue.toLocaleString(); // Format the number
        }
    }, 10); // Interval time in milliseconds
}

// Run the function for both live user count and total plans
document.addEventListener("DOMContentLoaded", function() {
    incrementCount('live-user-count', 1500, 2000); // 1500 users in 2 seconds
    incrementCount('total-plans', 5000, 2500); // 5000 plans in 2.5 seconds
});


