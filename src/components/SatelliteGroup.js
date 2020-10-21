const template = document.createElement('template');
template.innerHTML = `
<style>
    .satellite-group-bar {
        display: flex;
        padding: 0.5rem;
        
        align-items: center;
        justify-content: space-between;

        background-color: tan;
    }

    .satellite-group-bar:hover {
        opacity: 0.8;
    }

    .satellite-group-bar p {
        margin: 0;
        text-align: center;
    }

    .group-name {
        display: flex;
        align-items: center;
        max-width: 50%;
    }

    .group-more {
        display: flex;
        align-items: center;
    }

    .group-counter {
        border: 1px solid black;
        border-radius: 0.5rem;
        padding: 0.2rem;
        font-size: 0.9rem;
    }

    .group-arrow-list svg{
        min-width: 1.2rem;
    }

    .satellite-group-list {
        display: none;
        height: 0;
        overflow: scroll;
        cursor: pointer;
        transition: height 2s;
    }

    .satellite-group-list[dropped] {
        display: block;
        height: 200px;
    }
    
    .satellite-group-list-element {
        display: flex;
    }
    
    .satellite-group-list-element:hover {
        opacity: 0.2;
    }

</style>

<div class="satellite-group">
    <div class="satellite-group-bar">

        <input class="checkbox-display group-display" type="checkbox">

        <div class="group-name"></div>

        <div class="group-counter">123</div>

        <div class="group-arrow-list">
            <svg aria-hidden="true" focusable="false" data-prefix="fas" data-icon="caret-down"
            class="svg-inline--fa fa-caret-down fa-w-10" role="img" xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 320 512">
            <path fill="currentColor"
                d="M31.3 192h257.3c17.8 0 26.7 21.5 14.1 34.1L174.1 354.8c-7.8 7.8-20.5 7.8-28.3 0L17.2 226.1C4.6 213.5 13.5 192 31.3 192z">
            </path>
            </svg>
        </div>
    </div>
    <div class="satellite-group-list">
    <p>123</p>
    <p>123</p>
    <p>123</p>
    <p>123</p>
    </div>
</div>
`;

class SatelliteGroup extends HTMLElement {
    constructor() {
        super();
        const shadowDOM = this.attachShadow( {mode: 'open' });
        this.template = template.content.cloneNode( true );        
        shadowDOM.appendChild( this.template );

        this.groupCheckbox = shadowDOM.querySelector('.checkbox-display');
        this.groupBar = shadowDOM.querySelector('.satellite-group-bar');
        this.groupListSatellites = shadowDOM.querySelector('.satellite-group-list');

        this._dropped = false;

        // Method binding
        this.displayAllGroupCheckbox = this.displayAllGroupCheckbox.bind(this);
        this.droppGroupList = this.droppGroupList.bind(this);

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
        const shadowDOM = this.shadowRoot;
        shadowDOM.querySelector('.group-name').innerHTML = this._state.name;
        shadowDOM.querySelector('.group-counter').innerHTML = this._state.satellites.length;
        this.groupCheckbox.checked = this._state.display;
        // this.groupListSatellites.setAttribute()
    }

    displayAllGroupCheckbox() {
        if( this.groupCheckbox.checked ) this._state.addGroupOfSatellitesToScene();
        else this._state.removeGroupOfSatellitesFromScene();
    }

    droppGroupList(e) {
        if(e.target !== this.groupCheckbox) {
            // this._dropped = !this._dropped;
            if(this.groupListSatellites.hasAttribute('dropped')) this.groupListSatellites.removeAttribute('dropped');
            else this.groupListSatellites.setAttribute('dropped', '');
            
        }
        
    }
}

export default SatelliteGroup;