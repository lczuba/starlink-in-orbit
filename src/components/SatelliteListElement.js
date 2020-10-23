const template = document.createElement('template');
template.innerHTML = `
        <div class="group-item__header">
            <input class="group-item__display-checkbox" type="checkbox">
            <p class="group-item__name">test</p>
        </div>
        <div class="group-item__body">
            <div class="group-item__orbit"> 
                <label for="periodOrbit">Orbit Period</label>
                <input class="group-item__orbit-range"  type="range"  name="periodOrbit" min="0" max="100" value="0" step="1">
            </div>
            <div class="group-item__info"> </div>
        </div>
`;

class SatelliteListElement extends HTMLElement {
    constructor() {
        super();     
        this.appendChild( template.content.cloneNode( true ));

        // Get DOM Elements
        this.itemHead = this.querySelector('.group-item__header');
        this.itemBody = this.querySelector('.group-item__body');
        this.itemDisplayCheckbox = this.querySelector('.group-item__display-checkbox');
        this.itemName = this.querySelector('.group-item__name');
        this.itemInfo = this.querySelector('.group-item__info');
        this.itemOrbitRange = this.querySelector('.group-item__orbit-range')

        
        // Method binding
        this.displaySatellite = this.displaySatellite.bind(this);
        this.clickOnItem = this.clickOnItem.bind(this);
        this.changeOrbitRange = this.changeOrbitRange.bind(this);

        // On click
        this.itemDisplayCheckbox.onclick = this.displaySatellite;
        this.itemHead.onclick = this.clickOnItem;

        this.itemOrbitRange.oninput = this.changeOrbitRange;
    }

    // any attribute specified in the following array will automatically
    // trigger attributeChangedCallback when you modify it.
    // static get observedAttributes() {
    //     return ['props'];
    // }

    // updateHTML = (elem) => {
    //     // const element = elem;
    //     // const html = this.getAttribute('props');
    //     // element.querySelector('p').innerHTML = html;
    // }

    connectedCallback() {
        this._render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this._render();
    }

    disconnectedCallback() {
        this._state.activeElementUpdate = undefined;
    }

    get state() {
        return this._state;
    }

    set state(v) {
        this._state = v;
    }

    _render() {
        if(this._state) {
            this.itemName.innerHTML = this._state.name;
            this.itemDisplayCheckbox.checked = this._state.display;
            this.itemOrbitRange.value = this._state.orbitLineLength;

            this._state.activeElementUpdate = () => {
                this.itemDisplayCheckbox.checked= this._state.display;
                if(this.itemBody.hasAttribute('dropped')) {
                    this.itemInfo.innerHTML = `
                    <p>lat: ${this._state.info.lat} </p>
                    <p>lng: ${this._state.info.lng} </p>
                    <p>height: ${this._state.info.height} </p>
                `;
                }
            }  
        }
    };

    displaySatellite() {
        if(this.itemDisplayCheckbox.checked) {
            this._state.addSatelliteToScene();
            this._state.requestRenderIfNotRequested();
        } 
        else {
            this._state.removeSatelliteFromScene();
            this._state.requestRenderIfNotRequested();
            this.itemBody.removeAttribute('dropped');
            this.itemInfo.innerHTML = '';
        } 
    }

    clickOnItem(e) {
        if(e.target !== this.itemDisplayCheckbox) {
            
            if(this.itemBody.hasAttribute('dropped')) {
                this.itemBody.removeAttribute('dropped');
                this.itemInfo.innerHTML = '';
            } 
            else {
                if(!this.itemDisplayCheckbox.checked) {
                    this.itemDisplayCheckbox.checked = true;
                    this.displaySatellite();
                }
                this.itemBody.setAttribute('dropped', '');
                this.itemInfo.innerHTML = `
                    <p>lat: ${this._state.info.lat} </p>
                    <p>lng: ${this._state.info.lng} </p>
                    <p>height: ${this._state.info.height} </p>
                `;
            } 

            // this._state.moveToSatellite();
        }
    }

    changeOrbitRange(e) {
        this._state.orbitLineLength = e.target.value;
        this._state.createSateliteOrbit();
        this._state.requestRenderIfNotRequested();
    }

}

export default SatelliteListElement;
