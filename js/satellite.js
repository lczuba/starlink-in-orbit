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
            // const data = window.TLE.getLatLngObj(this.tle);
            this.info = window.TLE.getSatelliteInfo(this.tle);
            // this.info.lat = data.lat;
            // this.info.lng = data.lng;

            let angleLat = THREE.MathUtils.degToRad(this.info.lat);
            let height = 1 + (this.info.height / 6371);

            this.mesh.position.y = height * Math.sin(angleLat);
            let radius = height * Math.cos(angleLat);

            let angleLng = THREE.MathUtils.degToRad(this.info.lng * -1);
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
        this.moveToTargetAnimation.targetLng= this.info.lng *-1,
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
        let date = new Date().getTime()
        let fromDate = date - 1000 * 60 * 60 * 100;
        let toDate = date + 1000 * 60 * 60 * 100 ;
        console.log(fromDate, date, toDate);
        let pointsDeg = [];

        for(let t = fromDate; t <= toDate; t+=50000) {
            pointsDeg.push(window.TLE.getSatelliteInfo(
                this.tle,
                t
            ))
        }
        // console.log( pointsDeg );

        let pointsXYZ = [];
        for(let i = 0; i < pointsDeg.length; i++) {
            let orbitPointData = {
                lat: THREE.MathUtils.degToRad(pointsDeg[i].lat),
                lng: THREE.MathUtils.degToRad(pointsDeg[i].lng) * -1,
                height: 1 + (pointsDeg[i].height / 6371),
            };
            // console.log(orbitPointData);

            let y = orbitPointData.height * Math.sin(orbitPointData.lat);
            let radius = orbitPointData.height * Math.cos(orbitPointData.lat);
            let x = radius * Math.cos(orbitPointData.lng);
            let z = radius * Math.sin(orbitPointData.lng);

            pointsXYZ.push( new THREE.Vector3( x, y, z) );
        }
        let geometry = new THREE.BufferGeometry().setFromPoints( pointsXYZ );
        let material = new THREE.LineBasicMaterial( {color: 0x004d66} );
        this.line = new THREE.Line( geometry, material);
        this.scene.add(this.line);
        
    }

    removeSatelliteOrbit() {
        // this.scene.remove(this.line[1]);
        this.scene.remove(this.line);
        // this.scene.remove(this.line[2]);
    }
}

export { Satellite }