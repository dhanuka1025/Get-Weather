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

// Enhanced Search Functionality
document.getElementById("searchBtn").addEventListener("click", () => {
    let searchVal = document.getElementById("searchLbl").value.trim();
    
    if (!searchVal) {
        showNotification("Please enter a location to search", "warning");
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    fetch(`https://api.weatherapi.com/v1/current.json?key=${key}&q=${searchVal}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Location not found');
            }
            return response.json();
        })
        .then(data => {
            // Update weather display with animation
            updateWeatherDisplay(data);
            showForecast();
            updateMapLocation(data);
            showNotification(`Weather data loaded for ${data["location"]["name"]}`, "success");
        })
        .catch(error => {
            console.error("Error:", error);
            showNotification("Location not found. Please try a different city.", "error");
            hideLoadingState();
        });
});

// Enhanced weather display update function
function updateWeatherDisplay(data) {
    // Add fade animation
    const weatherCard = document.querySelector('.weather-main');
    weatherCard.style.opacity = '0';
    
    setTimeout(() => {
        document.getElementById("condiImg").src = "https:" + data["current"]["condition"]["icon"];
        document.getElementById("tempCel").innerHTML = data["current"]["temp_c"] + "° C";
        document.getElementById("crntLoc").innerHTML = data["location"]["name"];
        document.getElementById("locationLbl").innerHTML = data["location"]["tz_id"];
        document.getElementById("tempLbl").innerHTML = data["current"]["temp_c"] + "° C";
        document.getElementById("humidityLbl").innerHTML = data["current"]["humidity"] + "%";
        document.getElementById("windspLbl").innerHTML = data["current"]["wind_mph"] + " mph";
        document.getElementById("conditionLbl").innerHTML = data["current"]["condition"]["text"];
        document.getElementById("regionLbl").innerHTML = data["location"]["region"];
        document.getElementById("countryLbl").innerHTML = data["location"]["country"];
        document.getElementById("logtitudeLbl").innerHTML = data["location"]["lon"];
        document.getElementById("latitudeLbl").innerHTML = data["location"]["lat"];
        
        weatherCard.style.opacity = '1';
        hideLoadingState();
    }, 300);
    
    // Update temperature toggle buttons
    document.getElementById("celBtn").addEventListener("click", () => {
        document.getElementById("tempCel").innerHTML = data["current"]["temp_c"] + "° C";
    });
    document.getElementById("farBtn").addEventListener("click", () => {
        document.getElementById("tempCel").innerHTML = data["current"]["temp_f"] + "° F";
    });
}

// Update map location
function updateMapLocation(data) {
    map.eachLayer(function (layer) {
        if (layer instanceof L.Marker) {
            map.removeLayer(layer);
        }
    });

    let lat = data["location"]["lat"];
    let lon = data["location"]["lon"];

    L.marker([lat, lon]).addTo(map);
    map.setView([lat, lon], 13);
}

// Loading state functions
function showLoadingState() {
    const searchBtn = document.getElementById("searchBtn");
    searchBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Searching...';
    searchBtn.disabled = true;
}

function hideLoadingState() {
    const searchBtn = document.getElementById("searchBtn");
    searchBtn.innerHTML = '<i class="fas fa-search"></i> Search';
    searchBtn.disabled = false;
}

// Notification system
function showNotification(message, type = 'info') {
    // Remove existing notifications
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `notification alert alert-${type === 'error' ? 'danger' : type} alert-dismissible fade show`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 9999;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

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

// Enhanced Dark Mode Toggle
document.addEventListener('DOMContentLoaded', function () {
    const darkModeToggle = document.getElementById("darkModeToggle");
    const darkModeText = document.getElementById("darkModeText");
    
    // Check for saved theme preference or default to light mode
    const currentTheme = localStorage.getItem('theme') || 'light';
    if (currentTheme === 'dark') {
        document.body.classList.add("dark-mode");
        darkModeText.textContent = "☀️ Light Mode";
    }
    
    darkModeToggle.addEventListener("click", function() {
        document.body.classList.toggle("dark-mode");
        
        // Update button text and save preference
        if (document.body.classList.contains("dark-mode")) {
            darkModeText.textContent = "☀️ Light Mode";
            localStorage.setItem('theme', 'dark');
        } else {
            darkModeText.textContent = "🌙 Dark Mode";
            localStorage.setItem('theme', 'light');
        }
        
        // Add smooth transition effect
        document.body.style.transition = 'all 0.3s ease';
    });
    
    // Add loading animations
    const cards = document.querySelectorAll('.card');
    cards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
    
    // Add hover effects to forecast cards
    const forecastCards = document.querySelectorAll('.forecast-card');
    forecastCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px) scale(1.02)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
    
    // Add search input focus effects and keyboard support
    const searchInput = document.getElementById('searchLbl');
    if (searchInput) {
        searchInput.addEventListener('focus', function() {
            this.parentElement.style.transform = 'scale(1.02)';
        });
        
        searchInput.addEventListener('blur', function() {
            this.parentElement.style.transform = 'scale(1)';
        });
        
        // Add Enter key support for search
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                document.getElementById('searchBtn').click();
            }
        });
    }
    
    // Add smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
    
    // Add intersection observer for scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all cards for scroll animations
    document.querySelectorAll('.card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});
