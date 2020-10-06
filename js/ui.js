const satellitesHTML = document.getElementById('satellites');

const oneSatelliteHTML = document.createElement("p");
oneSatelliteHTML.className = "child";

function addNewSatellite(satelliteObj) {
    const objSat = oneSatelliteHTML.cloneNode(true);;
    objSat.innerHTML = satelliteObj.name;
    satellitesHTML.appendChild(objSat);

  return {};
}

export {addNewSatellite};