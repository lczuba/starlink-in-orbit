const satellitesHTML = document.getElementById('satellites');
const satelliteInfoHTML = document.getElementById('satellite-info');
const satelliteInfoBoxHTML = document.getElementById('satellite-info-box');
const satelliteInfoUpHTML = document.getElementById('satellite-info-up');


const oneSatelliteHTML = document.createElement("p");
oneSatelliteHTML.className = "child";

function addNewSatellite(satelliteObj) {
    const objSat = oneSatelliteHTML.cloneNode(true);;
    objSat.innerHTML = satelliteObj.name;
    objSat.addEventListener('click', function() {
      satelliteObj.setMeshColor('#ff0000');
      satelliteObj.moveToSatellite();
      satelliteObj.createSateliteOrbits();

      satelliteInfoUpHTML.addEventListener('click', function() {
        satelliteInfoHTML.style.height = '0';
        satelliteInfoHTML.style.opacity = '0';
        satelliteObj.setMeshColor('#00ff00');
        
        // satelliteInfoUpHTML.removeEventListener('click', this);
      })

      satelliteInfoHTML.style.height = '15rem';
      satelliteInfoHTML.style.opacity = '1';
      satelliteInfoBoxHTML.innerHTML = 
      "<p> name: " + satelliteObj.name + "</p>" +
      "<p> lat: " + satelliteObj.info.lat + "</p>" +
      "<p> lng: " + satelliteObj.info.lng + "</p>" +
      "<p> height: " + satelliteObj.info.height + "</p>" +
      "<p> velocity: " + satelliteObj.info.velocity + "</p>" +
      "<p> range: " + satelliteObj.info.range + "</p>"
    })
    satellitesHTML.appendChild(objSat);

  return {};
}

export {addNewSatellite};