const key = "43eb6e8c13ee4e25bac80536240703";

//-------------------------------------------------------------------------------------------------------------------//

function updateLocalTime() {
    let currentDate = new Date();

    let hours = currentDate.getHours();
    let minutes = currentDate.getMinutes();
    let seconds = currentDate.getSeconds();

    hours = (hours < 10 ? "0" : "") + hours;
    minutes = (minutes < 10 ? "0" : "") + minutes;
    seconds = (seconds < 10 ? "0" : "") + seconds;

    let localTime = hours + ":" + minutes + ":" + seconds;

    document.getElementById("timedisplay").textContent = localTime;
}
updateLocalTime();
setInterval(updateLocalTime, 1000);

//-------------------------------------------------------------------------------------------------------------------//

let map = L.map('map');
map.setView([6.864184296768448, 79.89284979994966], 13);

L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
}).addTo(map);

//-------------------------------------------------------------------------------------------------------------------//

function showPosition(position) {
    var latitude = position.coords.latitude;
    var longitude = position.coords.longitude;

    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });
    L.marker([latitude, longitude]).addTo(map);

    let lat = latitude + "," + longitude;


    fetch(`https://api.weatherapi.com/v1/current.json?key=${key}&q=${lat}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("condiImg").src = "https:" + data["current"]["condition"]["icon"];
            document.getElementById("tempCel").innerHTML = data["current"]["temp_c"] + "° C";
            document.getElementById("crntLoc").innerHTML = data["location"]["name"];
            document.getElementById("locationLbl").innerHTML = data["location"]["tz_id"];
            document.getElementById("tempLbl").innerHTML = data["current"]["temp_c"] + "° C";
            document.getElementById("humidityLbl").innerHTML = data["current"]["humidity"];
            document.getElementById("windspLbl").innerHTML = data["current"]["wind_mph"] + " mph";
            document.getElementById("conditionLbl").innerHTML = data["current"]["condition"]["text"];
            document.getElementById("regionLbl").innerHTML = data["location"]["region"];
            document.getElementById("countryLbl").innerHTML = data["location"]["country"];
            document.getElementById("logtitudeLbl").innerHTML = data["location"]["lon"];
            document.getElementById("latitudeLbl").innerHTML = data["location"]["lat"];

            showForecast();

            document.getElementById("celBtn").addEventListener("click", () => {
                document.getElementById("tempCel").innerHTML = data["current"]["temp_c"] + "° C";
            });
            document.getElementById("farBtn").addEventListener("click", () => {
                document.getElementById("tempCel").innerHTML = data["current"]["temp_f"] + "° F";
            });
        })

}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

document.addEventListener('DOMContentLoaded', function () {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(showPosition, showError);
    } else {
        alert("Geolocation is not supported by this browser.");
    }
});

//-------------------------------------------------------------------------------------------------------------------//

document.getElementById("searchBtn").addEventListener("click", () => {
    let searchVal = document.getElementById("searchLbl").value

    let reop = {
        methord: "GET"
    };

    fetch(`https://api.weatherapi.com/v1/current.json?key=${key}&q=${searchVal}`)
        .then(response => response.json())
        .then(data => {
            document.getElementById("condiImg").src = "https:" + data["current"]["condition"]["icon"];
            document.getElementById("tempCel").innerHTML = data["current"]["temp_c"] + "° C";
            document.getElementById("crntLoc").innerHTML = data["location"]["name"];
            document.getElementById("locationLbl").innerHTML = data["location"]["tz_id"];
            document.getElementById("tempLbl").innerHTML = data["current"]["temp_c"] + "° C";
            document.getElementById("humidityLbl").innerHTML = data["current"]["humidity"];
            document.getElementById("windspLbl").innerHTML = data["current"]["wind_mph"] + " mph";
            document.getElementById("conditionLbl").innerHTML = data["current"]["condition"]["text"];
            document.getElementById("regionLbl").innerHTML = data["location"]["region"];
            document.getElementById("countryLbl").innerHTML = data["location"]["country"];
            document.getElementById("logtitudeLbl").innerHTML = data["location"]["lon"];
            document.getElementById("latitudeLbl").innerHTML = data["location"]["lat"];

            showForecast();

            document.getElementById("celBtn").addEventListener("click", () => {
                document.getElementById("tempCel").innerHTML = data["current"]["temp_c"] + "° C";
            });
            document.getElementById("farBtn").addEventListener("click", () => {
                document.getElementById("tempCel").innerHTML = data["current"]["temp_f"] + "° F";
            });

            map.eachLayer(function (layer) {
                if (layer instanceof L.Marker) {
                    map.removeLayer(layer);
                }
            });

            let lat = data["location"]["lat"];
            let lon = data["location"]["lon"];

            L.marker([lat, lon]).addTo(map);
            map.setView([lat, lon], 13);

        })
        .then(error => console.log("error", error));
});

//-------------------------------------------------------------------------------------------------------------------//


async function showForecast() {
    let Clocation = document.getElementById("crntLoc").innerText;

    if (Clocation != "") {
        let today = new Date();

        for (let i = 0; i < 7; i++) {
            await new Promise((resolve, reject) => {
                let date = new Date(today);
                date.setDate(today.getDate() + i + 1);
                let year = date.getFullYear();
                let month = (date.getMonth() + 1).toString().padStart(2, '0');
                let day = date.getDate().toString().padStart(2, '0');
                let formattedDate = year + '-' + month + '-' + day;
                fetch(`https://api.weatherapi.com/v1/forecast.json?key=${key}&q=${Clocation}&dt=${formattedDate}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        let forecastDate = data["forecast"]["forecastday"][0]["date"];
                        let conditionText = data["forecast"]["forecastday"][0]["day"]["condition"]["text"];

                        document.getElementById("d" + i).innerHTML = forecastDate;
                        document.getElementById("icon" + i).src = "https:" + data["forecast"]["forecastday"][0]["day"]["condition"]["icon"];
                        document.getElementById("condi" + i).innerHTML = conditionText;


                    })
                resolve();
            })
        }
    }

}//-------------------------------------------------------------------------------------------------------------------//

document.getElementById("forecastPreviousBtn").addEventListener("click", () => {
    let Clocation = document.getElementById("crntLoc").innerText;

    if (Clocation != "") {
        let today = new Date();

        for (let i = 6; i >= 0; i--) {
            new Promise((resolve, reject) => {
                let date = new Date(today);
                date.setDate(today.getDate() - i - 1);
                let year = date.getFullYear();
                let month = (date.getMonth() + 1).toString().padStart(2, '0');
                let day = date.getDate().toString().padStart(2, '0');
                let formattedDate = year + '-' + month + '-' + day;
                fetch(`https://api.weatherapi.com/v1/history.json?key=${key}&q=${Clocation}&dt=${formattedDate}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        return response.json();
                    })
                    .then(data => {
                        let forecastDate = data["forecast"]["forecastday"][0]["date"];
                        let conditionText = data["forecast"]["forecastday"][0]["day"]["condition"]["text"];

                        document.getElementById("d" + i).innerHTML = forecastDate;
                        document.getElementById("icon" + i).src = "https:" + data["forecast"]["forecastday"][0]["day"]["condition"]["icon"];
                        document.getElementById("condi" + i).innerHTML = conditionText;
                    })
                resolve();
            })
        }
    }
});

document.getElementById("forecastFutureBtn").addEventListener("click", showForecast);
document.getElementById("searchBtn").addEventListener("click", showForecast)

//-------------------------------------------------------------------------------------------------------------------//

async function showSearchForecast() {
    let Clocation = document.getElementById("crntLoc").innerText;

    if (Clocation != "") {
        let Sdate = new Date(document.getElementById("startDate").value);
        let Edate = new Date(document.getElementById("endDate").value);

        let differenceInMilliseconds = Edate - Sdate;

        let differenceInDays = differenceInMilliseconds / (1000 * 60 * 60 * 24);

        if (differenceInDays = 7) {

            let Clocation = document.getElementById("crntLoc").innerText;

            let Syear = Sdate.getFullYear();
            let Smonth = (Sdate.getMonth() + 1).toString().padStart(2, '0');
            let Sday = Sdate.getDate().toString().padStart(2, '0');

            let FormattedStartDate = Syear + '-' + Smonth + '-' + Sday;

            let Eyear = Edate.getFullYear();
            let Emonth = (Edate.getMonth() + 1).toString().padStart(2, '0');
            let Eday = Edate.getDate().toString().padStart(2, '0');

            let FormattedEndDate = Eyear + '-' + Emonth + '-' + Eday;

            fetch(`https://api.weatherapi.com/v1/history.json?key=${key}&q=${Clocation}&dt=${FormattedStartDate}&end_dt=${FormattedEndDate}`)
                .then(response => {
                    if (!response.ok) {
                        throw new Error('Network response was not ok');
                    }
                    return response.json();
                })
                .then(data => {
                    for (let i = 0; i < 7; i++) {
                        let forecastDate = data["forecast"]["forecastday"][i]["date"];
                        let conditionText = data["forecast"]["forecastday"][i]["day"]["condition"]["text"];

                        document.getElementById("D" + i).innerHTML = forecastDate;
                        document.getElementById("Icon" + i).src = "https:" + data["forecast"]["forecastday"][i]["day"]["condition"]["icon"];
                        document.getElementById("Condi" + i).innerHTML = conditionText;
                    }
                })

        } else {
            alert("Difference between selected days must be 7")
        }
    }
}
document.getElementById("searchBtn1").addEventListener("click", showSearchForecast);

//-------------------------------------------------------------------------------------------------------------------//

document.getElementById("homeBtn").addEventListener("click", function() {
    location.reload();
});

document.getElementById("forecastBtn").addEventListener("click", function() {
    event.preventDefault();
    document.getElementById("forecastSection").scrollIntoView({behavior:"smooth"});
});

document.getElementById("mapBtn").addEventListener("click", function() {
    event.preventDefault();
    document.getElementById("mapSection").scrollIntoView({behavior:"smooth"});
});


document.getElementById("homeBtn1").addEventListener("click", function() {
    location.reload();
});

document.getElementById("forecastBtn1").addEventListener("click", function() {
    event.preventDefault();
    document.getElementById("forecastSection").scrollIntoView({behavior:"smooth"});
});

document.getElementById("mapBtn1").addEventListener("click", function() {
    event.preventDefault();
    document.getElementById("mapSection").scrollIntoView({behavior:"smooth"});
});

//-------------------------------------------------------------------------------------------------------------------//

document.addEventListener('DOMContentLoaded', function () {
    document.getElementById("darkModeToggle").addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
        document.querySelectorAll(".btn").forEach(btn => btn.classList.toggle("dark-mode"));
    });
});
