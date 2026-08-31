import { getGeneralSetting, getSave, saveData } from "../../storage.js";

let newLocationRadiusIgnore = document.querySelector("#new-location-ignore-radius");
let newLocationRadiusIgnoreOut = document.querySelector("#new-location-ignore-radius-out");
let startTrackingBtn = document.querySelector("#start-tacking-distance");
let saveTrackingBtn = document.querySelector("#save-tracking-data");
let copyPreviousPointsBtn = document.querySelector("#copy-previous-points");

let startLocationSpan = document.querySelector("#start-location");
let currentLocationSpan = document.querySelector("#current-location");
let distanceFromStartSpan = document.querySelector("#distance-from-start");
let previousPointsListElem = document.querySelector("#previous-points");
let historyContainer = document.querySelector("#history-container");

let distanceValues = {
    isTracking: false,
    watchValue: 0,
    startedAt: [],
    currentlyAt: [],
    distanceSinceStart: 0,
    startTime: 0,
    previousPoints: []
}
let geolocationOptions = {
    enableHighAccuracy: true,
    timeout: 5000,
    maximumAge: 0,
};
let dateLocalOptions = {
  weekday: "long",
  year: "numeric",
  month: "long",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit"
};


let chosenUnit = getGeneralSetting("distance-unit");

function calculateDistance(c1, c2) {
    let earthRadius = 6371;
    let deltaLat = (c2[0] - c1[0]) * Math.PI / 180;
    let deltaLng = (c2[1] - c1[1]) * Math.PI / 180;
    let lat1 = c1[0] * Math.PI / 180;
    let lat2 = c2[0] * Math.PI / 180;

    let a = Math.pow(Math.sin(deltaLat / 2), 2) +
            Math.pow(Math.sin(deltaLng / 2), 2) *
            Math.cos(lat1) * Math.cos(lat2);
    let c = 2 * Math.asin(Math.sqrt(a));

    return earthRadius * c;
}

function getChosenUnitDistanceString(distance) {
    if (chosenUnit === "metric") {
        return `${Math.round(distance * 100) / 100} km`;
    } else if (chosenUnit === "imperial") {
        return `${Math.round(distance / 1.609 * 100) / 100} mi`;
    }
}

function copyButton(e, points) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(JSON.stringify(points))
        .then(() => {
            e.target.textContent = "Copied!";
            setTimeout(function() {
                e.target.textContent = "Copy points";
            }, 3000);
        });
    }
}

function addMeasureToHistory(date, distance, points) {
    let historyItem = document.createElement("div");
    historyItem.classList.add("history-item");

    let dateP = document.createElement("p");
    dateP.classList.add("history-item-date");
    dateP.innerHTML = `<b>Date:</b> ${new Date(date).toLocaleDateString("en-CA", dateLocalOptions)}`;
    historyItem.appendChild(dateP);

    let distanceP = document.createElement("p");
    distanceP.classList.add("history-item-distance");
    distanceP.innerHTML = `<b>Distance:</b> ${getChosenUnitDistanceString(distance)}`;
    historyItem.appendChild(distanceP);

    let pointsDetails = document.createElement("details");
    let pointsSummary = document.createElement("summary");
    pointsSummary.innerHTML = "<b>Saved points:</b>";
    pointsDetails.appendChild(pointsSummary);

    let copyBtn = document.createElement("button");
    copyBtn.textContent = "Copy points";
    copyBtn.addEventListener("click", e => {
        copyButton(e, points);
    });
    pointsDetails.appendChild(copyBtn);
    let list = document.createElement("ul");
    points.forEach(function(point) {
        let listItem = document.createElement("li");
        listItem.textContent = `${point[0]} ${point[1]}`;
        list.appendChild(listItem);
    });
    pointsDetails.appendChild(list);
    historyItem.appendChild(pointsDetails);
    
    historyContainer.appendChild(historyItem);
    historyContainer.appendChild(document.createElement("hr"));
}

loadHistory();
function loadHistory() {
    let currentData = getSave("distance-history");
    if (currentData === undefined) {
        return;
    }

    currentData.forEach((entry) => {
        addMeasureToHistory(entry["start-time"], entry["distance-since-start"], entry["points"]);
    });
}

// newLocationRadiusIgnoreOut.value = `0 ${chosenUnit}`;
// newLocationRadiusIgnore.addEventListener("input", e => {
//     newLocationRadiusIgnoreOut.value = `${e.target.value} ${chosenUnit}`;
// });

function resetValues() {
    distanceValues.startedAt = [];
    distanceValues.currentlyAt = [];
    distanceValues.distanceSinceStart = 0;
    distanceValues.previousPoints = [];
    previousPointsListElem.innerHTML = "";
    distanceValues.startTime = 0;
}

function updateText () {
    startLocationSpan.textContent = `${distanceValues.startedAt[0]}, ${distanceValues.startedAt[1]}`;
    currentLocationSpan.textContent = `${distanceValues.currentlyAt[0]}, ${distanceValues.currentlyAt[1]}`;
    distanceFromStartSpan.textContent = getChosenUnitDistanceString(distanceValues.distanceSinceStart);
    let newListItem = document.createElement("li");
    let lastPoint = distanceValues.previousPoints.at(-1);
    newListItem.textContent = `${lastPoint[0]}, ${lastPoint[1]}`;
    previousPointsListElem.appendChild(newListItem);
}

function locationWatchSuccess (pos) {
    startTrackingBtn.textContent = "Stop";
    distanceValues.isTracking = true;
    saveTrackingBtn.disabled = true;
    const coords = pos.coords;

    let currentPosition = [coords.latitude, coords.longitude]
    if(distanceValues.startedAt.length === 0) {
        distanceValues.startedAt = currentPosition;
        distanceValues.startTime = Date.now();
    }
    distanceValues.currentlyAt = currentPosition;
    if (distanceValues.previousPoints.length > 1) {
        distanceValues.distanceSinceStart += calculateDistance(
            distanceValues.previousPoints.at(-1),
            currentPosition
        );
    }
    distanceValues.previousPoints.push(currentPosition);
    updateText();
}

function locationWatchError (err) {
    console.error(`ERROR(${err.code}): ${err.message}`);
}

startTrackingBtn.addEventListener("click", e => {
    if (distanceValues.isTracking) {
        navigator.geolocation.clearWatch(distanceValues.watchValue);
        
        distanceValues.isTracking = false;
        startTrackingBtn.textContent = "Start";
        saveTrackingBtn.disabled = false;
    } else {
        resetValues();
        distanceValues.watchValue = navigator.geolocation.watchPosition(locationWatchSuccess, locationWatchError, geolocationOptions);
    }
});

copyPreviousPointsBtn.addEventListener("click", e => {
    copyButton(e, distanceValues.previousPoints);
});

saveTrackingBtn.addEventListener("click", e => {
    let currentSave = getSave("distance-history");
    let newData = {
        "start-time": distanceValues.startTime,
        "distance-since-start": distanceValues.distanceSinceStart,
        "points": distanceValues.previousPoints
    }

    if (currentSave !== undefined) {
        currentSave.push(newData);
        saveData("distance-history", currentSave);
    } else {
        saveData("distance-history", [newData]);
    }
    addMeasureToHistory(distanceValues.startTime, distanceValues.distanceSinceStart, distanceValues.previousPoints);
});