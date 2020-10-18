const nav_items = document.getElementsByClassName("nav-item");
  const nav_satellites = document.getElementById("nav_satellites");
  const nav_time = document.getElementById("nav_time");
  const nav_options = document.getElementById("nav_options");
  const nav_about = document.getElementById("nav_about");
  let nav_itemIsClicked = false;

const ui_box = document.getElementById("ui_box");
const ui_box_pages = document.getElementsByClassName("ui-box-page");

for (const item of nav_items){
  item.addEventListener('click', function(){
    
    if(nav_itemIsClicked && ui_box.getAttribute("state") == item.id) {
      ui_box.style.left = '-20rem';
      nav_itemIsClicked = false;
    } 
    else {
      for(const ui_box_page of ui_box_pages) ui_box_page.style.display = 'none';
      const ui_box_page = document.getElementById("ui_box_" + item.id);
      ui_box_page.style.display = 'block';
      ui_box.style.left = '0';
      nav_itemIsClicked = true;
    }
    
    ui_box.setAttribute("state", item.id);
  })
}

nav_satellites.addEventListener('click', function(){
  
});

///////////////////////////////////////////////////////////////////////////////////////
const satellite_group = document.getElementById("ui_box_page_satellites");
const satellite_group_element = document.getElementsByClassName("satellite-group-element")[0];
satellite_group_element.remove();
const satellite_group_list_element = satellite_group_element.getElementsByClassName("satellite-group-list-element")[0];
satellite_group_list_element.remove();

function createGroupOfSatellites(data, requestRenderIfNotRequested) {
  const domElement = satellite_group_element.cloneNode(true);
  domElement.getElementsByClassName("group-name")[0].innerHTML = data.name;
  domElement.getElementsByClassName("group-counter")[0].innerHTML = data.satellites.length; 
  domElement.getElementsByClassName("group-arrow-list")[0].addEventListener('click', function() {
    const list = domElement.getElementsByClassName("satellite-group-list")[0];
    if(list.getAttribute("dropped") == 'false') {
      list.style.display = 'block';
      list.style.height = '200px'; 
      list.setAttribute('dropped', true);
      data.satellites.forEach(element => {
        const listElement = satellite_group_list_element.cloneNode(true);
        listElement.addEventListener('click', function() {
          element.moveToSatellite();
        });
        listElement.innerHTML = element.name
        list.appendChild(listElement);
      });
    }
    else {
      list.innerHTML = "";
      list.style.height = '0';
      list.style.display = 'none';
      list.setAttribute('dropped', false);

    }
  });
    const displayCheckbox = domElement.getElementsByClassName('group-display')[0];
    if (data.display) displayCheckbox.checked = true;
    displayCheckbox.addEventListener('click', function() {
    data.display = this.checked;
    console.log(data);
    data.satellites.forEach(sat => {
      if(sat.isValid) {
        sat.updateLatLng();
        sat.mesh.visible = data.display;
      }
    })
    requestRenderIfNotRequested();
  })


  satellite_group.appendChild(domElement);
}

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

export {createGroupOfSatellites};