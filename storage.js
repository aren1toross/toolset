let stored = localStorage.getItem("toolset-history");
let currentData;
let defaultSave = {
    "location-history": [],
    "distance-history": [],
    "general": {
        "distance-unit": "metric"
    }
};

loadSave();

function loadSave() {
    let save;
    try {
        save = JSON.parse(localStorage.getItem("toolset-history"));
    } catch {
        save = null;
    }

    if (save === null) {
        localStorage.setItem("toolset-history", JSON.stringify(defaultSave));
        currentData = JSON.stringify(defaultSave);
    } else {
        currentData = save;
    }
}

export function getGeneralSetting(name) {
    let general = currentData["general"];
    if (general === undefined || general[name] === undefined) {
        return defaultSave["general"][name];
    }
    return general[name];
}

export function setGeneralSetting(name, value) {
    if (currentData["general"] === undefined) {
        currentData["general"] = {};
    }
    currentData["general"][name] = value;
    localStorage.setItem("toolset-history", JSON.stringify(currentData));
}

export function getSave(name) {
    return currentData[name];
}

export function saveData(name, data) {
    currentData[name] = data;
    localStorage.setItem("toolset-history", JSON.stringify(currentData));
}