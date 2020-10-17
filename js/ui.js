const nav_items = document.getElementsByClassName("nav-item");
  const nav_satellites = document.getElementById("nav_satellites");
  const nav_time = document.getElementById("nav_time");
  const nav_options = document.getElementById("nav_options");
  const nav_about = document.getElementById("nav_about");
  let nav_itemIsClicked = false;

const ui_box = document.getElementById("ui_box");
const ui_box_items = document.getElementsByClassName("ui_box_item");

for (const item of nav_items){
  item.addEventListener('click', function(){
    
    if(nav_itemIsClicked && ui_box.getAttribute("state") == item.id) {
      ui_box.style.left = '-20rem';
      nav_itemIsClicked = false;
    } 
    else {
      for(const ui_box_item of ui_box_items) ui_box_item.style.display = 'none';
      const ui_box_item = document.getElementById("ui_box_" + item.id);
      ui_box_item.style.display = 'block';
      ui_box.style.left = '0';
      nav_itemIsClicked = true;
    }
    
    ui_box.setAttribute("state", item.id);
  })
}

nav_satellites.addEventListener('click', function(){
  
});

// const satellitesHTML = document.getElementById('satellites');
// const satelliteInfoHTML = document.getElementById('satellite-info');
// const satelliteInfoBoxHTML = document.getElementById('satellite-info-box');
// const satelliteInfoUpHTML = document.getElementById('satellite-info-up');

// const oneSatelliteHTML = document.createElement("p");
// oneSatelliteHTML.className = "child";

// function addNewSatellite(satelliteObj) {
//     const objSat = oneSatelliteHTML.cloneNode(true);;
//     objSat.innerHTML = satelliteObj.name;
//     objSat.addEventListener('click', function() {
//       satelliteObj.setMeshColor('#ff0000');
//       satelliteObj.moveToSatellite();
//       satelliteObj.createSateliteOrbits();

//       satelliteInfoUpHTML.addEventListener('click', function() {
//         satelliteInfoHTML.style.height = '0';
//         satelliteInfoHTML.style.opacity = '0';
//         satelliteObj.setMeshColor('#00ff00');
//         satelliteObj.removeSatelliteOrbit();
        
//         // satelliteInfoUpHTML.removeEventListener('click', this);
//       })

//       satelliteInfoHTML.style.height = '15rem';
//       satelliteInfoHTML.style.opacity = '1';
//       satelliteInfoBoxHTML.innerHTML = 
//       "<p> name: " + satelliteObj.name + "</p>" +
//       "<p> lat: " + satelliteObj.info.lat + "</p>" +
//       "<p> lng: " + satelliteObj.info.lng + "</p>" +
//       "<p> height: " + satelliteObj.info.height + "</p>" +
//       "<p> velocity: " + satelliteObj.info.velocity + "</p>" +
//       "<p> range: " + satelliteObj.info.range + "</p>"
//     })
//     satellitesHTML.appendChild(objSat);

//   return {};
// }

export {};