let stored = localStorage.getItem("toolset-history");
let currentData;

loadSave();

function loadSave() {
    let defaultSave = {
        "location-history": []
    };

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

export function getSave(name) {
    return currentData[name];
}

export function saveData(name, data) {
    currentData[name] = data;
    localStorage.setItem("toolset-history", JSON.stringify(currentData));
}