import { getGeneralSetting } from "../../storage.js";

let startSpeedTracking = document.querySelector("#start-speed-tracking");
let currentSpeedSpan = document.querySelector("#current-speed");
let maxSpeedSpan = document.querySelector("#max-speed");
let averageSpeedSpan = document.querySelector("#average-speed");

let speedometerValues = {
    isTracking: false,
    watchValue: 0,
    currentSpeed: 0,
    speeds: [],
    maxSpeed: 0,
    averageSpeed: 0,
};
let geolocationOptions = {
    enableHighAccuracy: false,
    timeout: 5000,
    maximumAge: 0,
};

function convertToPreferredUnit (speed) {
    let unit = getGeneralSetting("distance-unit");
    if (unit === "metric") {
        return Math.round(speed * 3.6);
    } else if (unit === "imperial") {
        return Math.round(speed * 2.237);
    }
}

function updateText () {
    let unit = getGeneralSetting("distance-unit");
    if (unit === "metric") {
        unit = "km/h";
    } else if (unit === "imperial") {
        unit = "mph";
    }
    currentSpeedSpan.textContent = `${speedometerValues.currentSpeed} ${unit}`;
    maxSpeedSpan.textContent = `${speedometerValues.maxSpeed} ${unit}`;
    averageSpeedSpan.textContent = `${speedometerValues.averageSpeed} ${unit}`;
}

function locationWatchSuccess (pos) {
    speedometerValues.isTracking = true;
    startSpeedTracking.textContent = "Stop";
    const coords = pos.coords;
    let speed = coords.speed;
    console.log(coords);
    
    let convertedSpeed = convertToPreferredUnit(speed)
    speedometerValues.currentSpeed = convertedSpeed;
    if (convertedSpeed > speedometerValues.maxSpeed) {
        speedometerValues.maxSpeed = convertedSpeed;
    }
    speedometerValues.speeds.push(convertedSpeed);
    let speedsSum = speedometerValues.speeds.reduce((acc, cur) => acc + cur, 0);
    speedometerValues.averageSpeed = (speedsSum / speedometerValues.speeds.length).toFixed(2);
    updateText();
}

function locationWatchError (err) {
    console.error(`ERROR(${err.code}): ${err.message}`);
}

startSpeedTracking.addEventListener("click", e => {
    if (speedometerValues.isTracking) {
        navigator.geolocation.clearWatch(speedometerValues.watchValue);
        
        speedometerValues.isTracking = false;
        startSpeedTracking.textContent = "Start";
        speedometerValues.speeds = [];
    } else {
        speedometerValues.watchValue = navigator.geolocation.watchPosition(locationWatchSuccess, locationWatchError, geolocationOptions);
    }
});