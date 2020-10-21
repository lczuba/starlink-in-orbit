import SatelliteGroup from './components/SatelliteGroup.js'
import SatelliteListElement from './components/SatelliteListElement.js'

customElements.define('satellite-group', SatelliteGroup);
customElements.define('satellite-list-element', SatelliteListElement);

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

function createGroupOfSatellites(data, requestRenderIfNotRequested) {
  const SatelliteGroupDOM = new SatelliteGroup();
  SatelliteGroupDOM.state = data;
  satellite_group.appendChild(SatelliteGroupDOM);
  }

export {createGroupOfSatellites, createOptionElement};