import { getGeneralSetting, setGeneralSetting } from "../storage.js";

let distanceUnitSetting = document.querySelector("#distance-unit-setting");

distanceUnitSetting.value = getGeneralSetting("distance-unit");
distanceUnitSetting.addEventListener("input", e => {
    setGeneralSetting("distance-unit", e.target.value);
});