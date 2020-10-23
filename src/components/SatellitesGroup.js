import SatelliteListElement from './SatelliteListElement.js'
customElements.define('satellite-list-item', SatelliteListElement);

const template = document.createElement('template');
template.innerHTML = `
    <div class="satellite-group__bar">

        <input class="satellite-group__checkbox" type="checkbox">

        <div class="satellite-group__name"></div>

        <div class="satellite-group__counter">123</div>

        <div class="satellite-group__arrow-list">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-down"
            class="svg-inline--fa fa-caret-down fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512">
            <path fill="currentColor"
                d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z">
            </path>
            </svg>
        </div>
    </div>
    <div class="satellite-group__list"></div>
`;

class GroupOfSatellites extends HTMLElement {
    constructor() {
        super();
        this.appendChild( template.content.cloneNode( true ));

        // Get DOM Elements
        this.groupName = this.querySelector('.satellite-group__name');
        this.groupCounter = this.querySelector('.satellite-group__counter');
        this.groupCheckbox = this.querySelector('.satellite-group__checkbox');
        this.groupBar = this.querySelector('.satellite-group__bar');
        this.groupListSatellites = this.querySelector('.satellite-group__list');

        // State
        this._dropped = false;

        // Method binding
        this.displayAllGroupCheckbox = this.displayAllGroupCheckbox.bind(this);
        this.droppGroupList = this.droppGroupList.bind(this);

        // On click
        this.groupCheckbox.onclick = this.displayAllGroupCheckbox;
        this.groupBar.onclick = this.droppGroupList;
    }

    static get observedAttributes() { return ['dropped'] };

    connectedCallback() {
        this._render();
    }

    attributeChangedCallback(attr, oldVal, newVal) {
        this._dropped = newVal;
        this._render();
    }

    get state() {
        return this._state;
    }

    set state(v) {
        this._state = v;
    }

    get dropped() {
        return this._dropped;
    }

    set dropped(v) {
        // this.groupListSatellites.setAttribute('dropped', v)
    }

    _render() {
        if(this._state) {
            this.groupName.innerHTML = this._state.name;
            this.groupCounter.innerHTML = this._state.satellites.length;
            this.groupCheckbox.checked = this._state.display;
        } 
    }

    displayAllGroupCheckbox() {
        if( this.groupCheckbox.checked ) this._state.addGroupOfSatellitesToScene();
        else this._state.removeGroupOfSatellitesFromScene();
    }

    droppGroupList(e) {
        if(e.target !== this.groupCheckbox) {
            if(this.groupListSatellites.hasAttribute('dropped')) {
                this.groupListSatellites.removeAttribute('dropped');
                this.groupListSatellites.innerHTML = "";
            } 
            else {
                this.groupListSatellites.setAttribute('dropped', '');
                this._state.satellites.forEach(satellite => {
                    const SatelliteElement = new SatelliteListElement();
                    SatelliteElement.state = satellite;
                    this.groupListSatellites.appendChild(SatelliteElement);
                });
            }   
        }  
    }
}

export default GroupOfSatellites;