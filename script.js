// Initiera funktioner när dokumentet är helt laddat
document.addEventListener("DOMContentLoaded", function() {
    // Function to get day name from date
    function getDayName(dateString) {
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const date = new Date(dateString);
        return days[date.getDay()];
    }

    // Function to get weather description based on weather code
    function getWeatherDescription(weatherCode) {
        switch (weatherCode) {
            case 0:
            case 1:
                return "Clear Sky";
            case 2:
            case 3:
            case 4:
            case "cloudy":
                return "Cloudy Sky";
            case "snow":
                return "Snow";
            case 61:
            case 80:
                return "Rain";
            case 51:
            case 52:
            case 53:
                return "Shower Rain";
            case 95:
            case 96:
            case 99:
                return "Thunderstorm";
            default:
                return "Unknown Weather"; // Return a generic description for unknown weather types
        }
    }

    // Function to toggle weather icon visibility based on weather code
    function toggleWeatherIcon(weatherCode) {
        const sunIcon = document.getElementById('sun');
        const moonIcon = document.getElementById('moon');
        const cloudIcon = document.getElementById('cloud');
        const rainIcon = document.getElementById('rain');
        const thunderIcon = document.getElementById('thunder');
        const snowIcon = document.getElementById('snow');

        // Hide all weather icons initially
        sunIcon.style.display = 'none';
        moonIcon.style.display = 'none';
        cloudIcon.style.display = 'none';
        rainIcon.style.display = 'none';
        thunderIcon.style.display = 'none';
        snowIcon.style.display = 'none';

        // Show the corresponding weather icon based on the weather code
        switch (weatherCode) {
            case 0:
            case 1:
                sunIcon.style.display = 'block';
                break;
            case 2:
            case 3:
            case 4:
            case "cloudy":
                cloudIcon.style.display = 'block';
                break;
            case "snow":
                snowIcon.style.display = 'block';
                break;
            case 61:
            case 80:
                rainIcon.style.display = 'block';
                break;
            case 51:
            case 52:
            case 53:
                rainIcon.style.display = 'block';
                break;
            case 95:
            case 96:
            case 99:
                thunderIcon.style.display = 'block';
                break;
        }
    }

    // Fetch weather data and update DOM
    fetch("https://api.open-meteo.com/v1/forecast?latitude=42.6507&longitude=18.0944&current=temperature_2m,wind_speed_10m,relative_humidity_2m,uv_index,weathercode&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&days=9") // Fetch data for the next 9 days
        .then(response => response.json()) // Convert the response to JSON format
        .then(data => {
            // Get current temperature, wind speed, humidity, UV index, and weather description
            const currentTemperature = Math.round(data.current.temperature_2m);
            const currentWindSpeed = data.current.wind_speed_10m;
            const currentHumidity = data.current.relative_humidity_2m;
            const currentUVIndex = data.current.uv_index;
            const currentWeatherCode = data.current.weathercode;
            const currentWeatherDescription = getWeatherDescription(currentWeatherCode);

            // Log current weather code
            console.log("Current Weather Code:", currentWeatherCode);

            // Display current weather information
            const temperatureDiv = document.querySelector('.temperature');
            temperatureDiv.innerHTML = `<p>${currentTemperature} °C</p>`;

            const currentWeatherDiv = document.querySelector('.current-weather');
            currentWeatherDiv.innerHTML = `
                <p>${currentWeatherDescription}</p>
            `;

            // Update humidity, wind speed, and UV index
            const humiditySpan = document.getElementById('humidity');
            humiditySpan.textContent = currentHumidity + '%';

            const windSpeedSpan = document.getElementById('wind-speed');
            windSpeedSpan.textContent = currentWindSpeed + ' m/s';

            const uvIndexSpan = document.getElementById('uv-index');
            uvIndexSpan.textContent = currentUVIndex;

            // Toggle weather icon visibility based on the weather code
            toggleWeatherIcon(currentWeatherCode);

            // Get hourly weather for the next 10 hours
            const currentTime = new Date(); // Get current time
            const currentHour = currentTime.getHours(); // Get current hour
            const hourlyTimes = data.hourly.time.map(time => new Date(time).getHours()); // Get hours of each data point

            // Find index of the current hour in hourly data
            let startIndex = 0;
            for (let i = 0; i < hourlyTimes.length; i++) {
                if (hourlyTimes[i] >= currentHour) {
                    startIndex = i;
                    break;
                }
            }

            // If current time is past or equal to the first hour in forecast, start from next hour
            if (currentHour >= hourlyTimes[startIndex]) {
                startIndex++;
            }

            const hourlyTemperatures = data.hourly.temperature_2m.slice(startIndex, startIndex + 10).map(temp => Math.round(temp)); // Round each temperature value

            // Display hourly weather information
            const hourlyWeatherDiv = document.getElementById('hourly-weather');
            for (let i = 0; i < 10; i++) {
                const index = startIndex + i;
                const hour = ('0' + hourlyTimes[index]).slice(-2); // Formatera timmen för att alltid ha två siffror
                hourlyWeatherDiv.innerHTML += `
                    <div class="hour-block">
                        <h4>${hour}:00</h4>
                        <p>${hourlyTemperatures[i]} °C</p>
                    </div>
                `;
            }

            // Get daily weather for the next 9 days
            const dailyTemperaturesMax = data.daily.temperature_2m_max.slice(0, 9).map(temp => Math.round(temp)); // Round each temperature value
            const dailyTemperaturesMin = data.daily.temperature_2m_min.slice(0, 9).map(temp => Math.round(temp)); // Round each temperature value
            const dailyWeatherCodes = data.daily.weathercode.slice(0, 9);
            const dailyWeatherDescriptions = dailyWeatherCodes.map(code => getWeatherDescription(code)); // Get weather descriptions
            const dailyDates = data.daily.time.slice(0, 9).map(date => getDayName(new Date(date).toDateString())); // Get day names

            // Check if today is included in the forecast, if so, remove it
            const today = getDayName(new Date().toDateString());
            const todayIndex = dailyDates.indexOf(today);
            if (todayIndex !== -1) {
                dailyDates.splice(todayIndex, 1);
                dailyTemperaturesMax.splice(todayIndex, 1);
                dailyTemperaturesMin.splice(todayIndex, 1);
                dailyWeatherDescriptions.splice(todayIndex, 1);
            }

            // Display daily weather information
            const dailyWeatherDiv = document.getElementById('daily-weather');
            for (let i = 0; i < dailyTemperaturesMax.length; i++) {
                dailyWeatherDiv.innerHTML += `
                    <h4>${dailyDates[i]}</h4>
                    <p>Max: ${dailyTemperaturesMax[i]} °C</p>
                    <p>Min: ${dailyTemperaturesMin[i]} °C</p>
                    <p>${dailyWeatherDescriptions[i]}</p>
                    <hr>
                `;
            }

        })
        .catch(error => console.error('Error fetching weather data:', error)); // Handle any errors

    // Använd JavaScript för att lägga till klassen 'nighttime' när det är natt
    const currentTime = new Date().getHours();
    const header = document.querySelector('header');
    const body = document.querySelector('body');

    if (currentTime >= 20 || currentTime < 6) {
        header.classList.add('nighttime');
        body.style.backgroundColor = "#002d62"; // Lägg till bakgrundsfärgen när det är natt
    } else {
        header.classList.remove('nighttime');
        body.style.backgroundColor = ""; // Återställ bakgrundsfärgen till standard om det inte är natt
    }
});