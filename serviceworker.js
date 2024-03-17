// Installera service workern
self.addEventListener('install', event => {
    console.log('Service worker installed');
});

// Aktivera service workern
self.addEventListener('activate', event => {
    console.log('Service worker activated');
});

// Lägg till en händelselyssnare för att lyssna efter meddelanden från huvudtråden
self.addEventListener('message', event => {
    if (event.data === 'updateWeather') {
        fetchWeatherData(); // Uppdatera väderinformationen när meddelandet 'updateWeather' tas emot
    }
});

// Funktion för att hämta väderdata och skicka till huvudtråden för att uppdatera gränssnittet
function fetchWeatherData() {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=42.6507&longitude=18.0944&current=temperature_2m,wind_speed_10m,relative_humidity_2m,uv_index,weathercode&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,weathercode&daily=temperature_2m_max,temperature_2m_min,weathercode&days=9")
        .then(response => response.json())
        .then(data => {
            // Här kan du hantera den nya väderinformationen och skicka den till huvudtråden för att uppdatera gränssnittet
            self.clients.matchAll().then(clients => {
                clients.forEach(client => {
                    client.postMessage({
                        type: 'weatherUpdate',
                        data: {
                            // Här skickar du den nya väderinformationen till huvudtråden
                        }
                    });
                });
            });
        })
        .catch(error => console.error('Error fetching weather data:', error)); 
}
