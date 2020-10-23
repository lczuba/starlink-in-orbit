import SatellitesGroup from './components/SatellitesGroup.js'
customElements.define('satellite-group', SatellitesGroup);

// Navbar
{
  const navbar__items = document.getElementsByClassName('navbar__item');
  let nav_itemIsClicked = false;
  
  const toolbox = document.querySelector('.toolbox');
  const toolbox__pages = document.getElementsByClassName('toolbox__page');
  
  for (const item of navbar__items){
    item.addEventListener('click', function(){
      if(nav_itemIsClicked && toolbox.getAttribute('type') == item.getAttribute('type')) {
        toolbox.classList.remove('toolbox--active');
        nav_itemIsClicked = false;
      } 
      else {
        for(const toolbox__page of toolbox__pages) toolbox__page.classList.remove('toolbox__page--active');
        const toolbox__page = document.querySelector(".toolbox__page--" + item.getAttribute('type'));
        toolbox__page.classList.add('toolbox__page--active');
        toolbox.classList.add('toolbox--active');
        nav_itemIsClicked = true;
      }
      
      toolbox.setAttribute("type", item.getAttribute('type'));
    })
  }
}


///////////////////////////////////////////////////////////////////////////////////////

function createGroupOfSatellites(data) {
  const page_satellites = document.querySelector('.toolbox__page--satellites');
  const page_satellites_body = page_satellites.querySelector('.toolbox__body');

  const satellite_group = new SatellitesGroup();
  satellite_group.state = data;
  page_satellites_body.appendChild(satellite_group);
  }

export {createGroupOfSatellites};