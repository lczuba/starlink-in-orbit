const template = document.createElement('template');
template.innerHTML = `
    <div>
        <p>test</p>
    </div>
`;

class SatelliteListElement extends HTMLElement {
    constructor() {
        super();

        // // //Add shadow DOM
        const shadowDOM = this.attachShadow({ mode: 'open' });

        // // //Render the template
        shadowDOM.appendChild( template.content.cloneNode(true) );
        

        //Binding
        // this.updateHTML = this.updateHTML.bind(this);

        // this.appendChild( template.content.cloneNode( true ) ); 
        // return this
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
        // this.updateHTML(this);
        // this.innerHTML = `<h1>Hello, World11111!</h1>`;
        // this.appendChild( template.content.cloneNode( true ) );
    }

    // attributeChangedCallback(attr, oldVal, newVal) {
    //     // this.updateHTML(this);
    // }

}

export default SatelliteListElement;
