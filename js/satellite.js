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

    setMeshColor(newColor) {
        this.mesh.material.color = new THREE.Color( newColor );
    }

    setSatelliteProps(moveToTargetAnimation, camera, scene) {
        this.moveToTargetAnimation = moveToTargetAnimation;
        this.camera = camera;
        this.scene = scene;
    }

    moveToSatellite()  {
        console.log("start move");
        const currentData = {
            lat: THREE.MathUtils.radToDeg( Math.atan(this.camera.position.y / Math.hypot(this.camera.position.x, this.camera.position.z) )),
            lng: THREE.MathUtils.radToDeg( Math.atan2(this.camera.position.z, this.camera.position.x) ),
            radius: Math.hypot(this.camera.position.y, Math.hypot(this.camera.position.x, this.camera.position.z))
        };

        this.moveToTargetAnimation.targetLat= this.info.lat,
        this.moveToTargetAnimation.targetLng= this.info.lng,
        this.moveToTargetAnimation.tagetHeight= 1 + (this.info.height / 6371);

        if( Math.abs(this.moveToTargetAnimation.targetLat - currentData.lat) > Math.abs(this.moveToTargetAnimation.targetLng - currentData.lng) ) {
            const angle1 = Math.abs(this.moveToTargetAnimation.targetLat - currentData.lat)
            this.moveToTargetAnimation.angleLatSpeed = this.moveToTargetAnimation.animationSpeed;
            this.moveToTargetAnimation.timeAnimation = angle1 / this.moveToTargetAnimation.animationSpeed;
            const angle2 = Math.abs(this.moveToTargetAnimation.targetLng - currentData.lng);
            this.moveToTargetAnimation.angleLngSpeed = angle2 / this.moveToTargetAnimation.timeAnimation;
        }else {
            const angle1 = Math.abs(this.moveToTargetAnimation.targetLng - currentData.lng); 
            this.moveToTargetAnimation.angleLngSpeed = this.moveToTargetAnimation.animationSpeed;
            this.moveToTargetAnimation.timeAnimation = angle1 / this.moveToTargetAnimation.animationSpeed;
            const angle2 = Math.abs(this.moveToTargetAnimation.targetLat - currentData.lat)
            this.moveToTargetAnimation.angleLatSpeed = angle2 / this.moveToTargetAnimation.timeAnimation;
        }

        if(this.moveToTargetAnimation.targetLat < currentData.lat) this.moveToTargetAnimation.angleLatSpeed *= -1;
        if(this.moveToTargetAnimation.targetLng < currentData.lng) this.moveToTargetAnimation.angleLngSpeed *= -1;

        this.moveToTargetAnimation.isMoveToTargetLat = true;
        this.moveToTargetAnimation.isMoveToTargetLng = true;
        this.moveToTargetAnimation.timeAnimationClock = new THREE.Clock();
    }

    async createSateliteOrbits() {
        console.log("start orbit");
            await window.TLE.getGroundTracks({
                tle: this.tle,
                isLngLatFormat: true,
                stepMS: 10000,
            }).then((data) => this.createSateliteOrbits2(data))
            
           
    }

    createSateliteOrbits2(satOrbit) {
         let material = new THREE.LineBasicMaterial( {color: 0x0000ff} );
            
            for(let n=0; n<3; n++) {
                let points = [];
                for(let i = 0; i < satOrbit[n].length; i++) {
                    let orbitPointData = {
                        lat: THREE.MathUtils.degToRad(satOrbit[n][i][1]),
                        lng: THREE.MathUtils.degToRad(satOrbit[n][i][0]),
                        height: 1 + (this.info.height / 6371),
                    };
                    
                    let y = orbitPointData.height * Math.sin(orbitPointData.lat);
                    let radius = orbitPointData.height * Math.cos(orbitPointData.lat);
                    let x = radius * Math.cos(orbitPointData.lng);
                    let z = radius * Math.sin(orbitPointData.lng);
    
                    points.push( new THREE.Vector3( x, y, z) );
                }
                let geometry = new THREE.BufferGeometry().setFromPoints( points);
                let line = new THREE.Line( geometry, material);
                this.scene.add(line);
            }
            
           
            console.log("end orbit");
    };
}

export { Satellite }