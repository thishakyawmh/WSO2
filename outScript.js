let planArr = [];

let map,position,directionsService,directionsDisplay,Home_location;

function viewPlace(id){
    planArr.forEach(vifunc);

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
    planArr.forEach(dfunc);

    function dfunc(item){
        if(item.name === id){
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
}

function initMap(){

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

function fetchPlanData(planId) {
    return axios.get(`http://localhost:9090/plans/plans/${planId}`)
        .then((res) => {
            const plan = res.data;
            console.log(plan);
            planArr = JSON.parse(plan.plan);
            // Call any function that needs to use planArr here
            processPlanData(planArr);
        })
        .catch((err) => {
            console.error('Failed to fetch plan details', err);
        });
}

function processPlanData(planArr) {
    const plan_overview =  planArr[planArr.length-1]
    console.log(planArr);
    console.log('Processing Plan Data:', plan_overview);

    document.getElementById('plan_name').innerHTML = plan_overview.planName;
    document.getElementById('dateTime').innerHTML = `${plan_overview.date} at ${plan_overview.startTime}`;
    document.getElementById('location').innerHTML = plan_overview.location;
    document.getElementById('participants').innerHTML = plan_overview.participants;
    document.getElementById('budget').innerHTML = plan_overview.budget;

    for (let i = 0; i < planArr.length-1; i++) {
        addfunc(planArr[i])

        function addfunc(item) {
    
                let table = document.getElementById("places");
                let row = table.insertRow();
                let cell1 = row.insertCell(0);
                cell1.innerHTML = `${item.name} <br> <a href="#map" id="${item.name}" onclick="viewPlace(this.id)">View on map</a>`;
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
                            <br> <a href="#map" id="${item.name}" onclick="viewDirection(this.id)">View Route</a>`
                        }
                });
                
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

window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const planId = urlParams.get('id');

    if (planId) {
        console.log('Plan ID:', planId);
        fetchPlanData(planId);
    } else {
        console.error('No plan ID found in URL');
    }
});
