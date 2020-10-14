import * as THREE from '../node_modules/three/build/three.module.js';

class Satellite {
    constructor(data) {
        this.tle = data;
        try {
            this.name = window.TLE.getSatelliteName(this.tle);
            this.info = window.TLE.getSatelliteInfo(this.tle);
            this.isValid = true;
            
        } catch(e) {
            this.isValid = false;
            console.log("Error: " + this.name);
        }

        this.createSatMesh();
    }

    createSatMesh() {
        if(this.isValid) {
            console.log("tworzdde");
            const spriteMaterial = new THREE.SpriteMaterial( { color: 0x00ff00 } );
            this.mesh = new THREE.Sprite( spriteMaterial );
            this.mesh.scale.set(0.005, 0.005, 0.005);
        }
    }

    updateLatLng() {
        try {
            const data = window.TLE.getLatLngObj(this.tle);
            this.info.lat = data.lat;
            this.info.lng = data.lng;
        } catch(e) {
            this.isValid = false;
            console.log("Error: Can't get coordinate of " + this.name);
        }
    }

    setMeshColor() {
        this.mesh.material.color = new THREE.Color( { color: 0x00ff00 } );
    }

    setMeshColor(newColor) {
        this.mesh.material.color = new THREE.Color( newColor );
    }
  
}

export { Satellite }