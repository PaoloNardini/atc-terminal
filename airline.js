
function Airline() {
    this.name = '';         // Airline commercial name
    this.alias = '';        // Airline alias name
    this.callsign = '';     // Airline radio callsign
    this.icao = '';         // Airline 3 letters ICAO code
    this.iata = '';         // Airline 2 letters IATA code
    this.country = ''       // Airline base country
}

function getRandomAirline() {
    var a = Math.floor((Math.random() * airlines.length));
    return airlines[a];
}