import * as THREE from '../node_modules/three/build/three.module.js';

class Satellite {
    constructor(data) {
        this.tle = data;
        try {
            this.name = window.TLE.getSatelliteName(this.tle);
            this.info = window.TLE.getSatelliteInfo(this.tle);
            this.isValid = true;
            this.createSatelliteMesh();
            
        } catch(e) {
            this.isValid = false;
            console.log("Error: " + this.name);
        }
    }

    createSatelliteMesh() {
            const spriteMaterial = new THREE.SpriteMaterial( { color: 0x00ff00 } );
            this.mesh = new THREE.Sprite( spriteMaterial );
            this.mesh.scale.set(0.005, 0.005, 0.005);
    }

    updateLatLng() {
        if(this.isValid) {
            const data = window.TLE.getLatLngObj(this.tle);
            this.info.lat = data.lat;
            this.info.lng = data.lng;

            let angleLat = THREE.MathUtils.degToRad(this.info.lat);
            let height = 1 + (this.info.height / 6371);

            this.mesh.position.y = height * Math.sin(angleLat);
            let radius = height * Math.cos(angleLat);

            let angleLng = THREE.MathUtils.degToRad(this.info.lng);
            this.mesh.position.x = radius * Math.cos(angleLng);
            this.mesh.position.z = radius * Math.sin(angleLng);
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