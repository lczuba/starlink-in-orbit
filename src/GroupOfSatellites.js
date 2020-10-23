import { Satellite } from './Satellite.js';

class GroupOfSatellites {
    constructor(data, scene, camera, requestRenderIfNotRequested) {
        this.scene = scene;
        this.camera = camera;
        this.requestRenderIfNotRequested = requestRenderIfNotRequested;

        this.tle = data.tle;
        this.name = data.name;
        this.display = data.display;
        this.color = data.color;
        this.satellites = [];

        this.createSatellitesObject();
        if(this.display) this.addGroupOfSatellitesToScene();

    }

    createSatellitesObject() {
        this.tle.forEach((tle) => {
            let satellite = new Satellite(
                tle,
                this.scene, 
                this.camera, 
                this.requestRenderIfNotRequested
            );
            this.satellites.push(satellite);
        });
    };

    addGroupOfSatellitesToScene() {
        this.display = true;
        this.satellites.forEach((satellite) => { satellite.addSatelliteToScene() });
        this.requestRenderIfNotRequested();
    };

    removeGroupOfSatellitesFromScene() {
        this.display = false;
        this.satellites.forEach((satellite) => { satellite.removeSatelliteFromScene() });
        this.requestRenderIfNotRequested();
    };

    updatePositionOfSatellites() {
        this.satellites.forEach(satellite => satellite.updateSatellitePosition());
        this.requestRenderIfNotRequested();
    };

};

export { GroupOfSatellites };