import { getSave, saveData } from "../../storage.js";

let form = document.querySelector("form");
let currentLocationText = document.querySelector("#current-location-text");
let updateLocationButton = document.querySelector("#update-location");
let historyContainer = document.querySelector("#history-container");

updateHistory();

form.addEventListener("submit", e => {
    e.preventDefault();
    let data = Object.fromEntries(new FormData(e.target));
    let current = getSave("location-history");
    current.push(data);
    saveData("location-history", current);
    form.reset();
    updateHistory();
});

updateLocationButton.addEventListener("click", e => {
    navigator.geolocation.getCurrentPosition((position) => {
        console.log(position.coords)
        form.querySelector("#current-location").value = `${position.coords.latitude}, ${position.coords.longitude}`;
    });
});

function updateHistory() {
    let current = getSave("location-history");
    historyContainer.innerHTML = "";
    historyContainer.appendChild(document.createElement("hr"));

    current.forEach((entry) => {
        let newDiv = document.createElement("div");
        newDiv.classList.add("history-item");
        let locationP = document.createElement("p");
        locationP.innerHTML = `<b>Location:</b> ${entry["current-location"]}`;
        newDiv.appendChild(locationP);
        let descriptionP = document.createElement("p");
        descriptionP.innerHTML = `<b>Description:</b> ${entry["location-description"]}`;
        newDiv.appendChild(descriptionP);

        historyContainer.appendChild(newDiv);
        historyContainer.appendChild(document.createElement("hr"));
    });
}