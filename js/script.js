import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import * as UI from './ui.js';

(function(){
    const satellites = [];
    const globals = {
        clock: new THREE.Clock(),
        updateTimer: 0,
        setUpdateTime: 2,

        isMoveToTargetLat: false,
        isMoveToTargetLng: false,
        animationSpeed: 180,
        angleLatSpeed: null, //per sec
        angleLngSpeed: null, //per sec
        targetLat: null,
        targetLng: null,
        tagetHeight: null,
    }

    async function loadFile(url) {
        const req = await fetch(url)
        return req.text();
    }
    
    function parseData(text) {
        const data = [];
        text = text.split('\n');
        for(let i = 0; i < text.length;) {
            data.push([text[i], text[i+1], text[i+2]]);
            i = i+3;
        }
        return data;
    }

    function createSatellitesObj(data) {
        data.forEach((tle) => {
            const sat = {}
            try {
                sat.name = window.TLE.getSatelliteName(tle);
                sat.info = window.TLE.getSatelliteInfo(tle);
                sat.tle = tle;
                sat.status = "ok";
            } catch(e) {
                sat.status = "error";
                console.log("Error: Can't get info from this TLE data, sory :(");
            }
            UI.addNewSatellite(sat);
            satellites.push(sat)
        })
        console.log(satellites[0]);
    }
    
    loadFile('../static/starlink.txt')
        .then(parseData)
        .then(createSatellitesObj)
        .then(updataSat)
        
////////////////////////////////////////////////////////////////////////////////////////
//  Main properties of scene, render, resize etc.
    const renderer = new THREE.WebGLRenderer();
    document.body.appendChild( renderer.domElement );

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 5;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set( 0, 0, 100);
    camera.lookAt( 0, 0, 0);

    const scene = new THREE.Scene();
    
    //x,y,z lines
    const axesHelper = new THREE.AxesHelper( 2 );
    scene.add( axesHelper )

    //main light
    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);
    
    //responsive
    function resizeRendererToDisplaySize( renderer ) {
        const canvas = renderer.domElement;
        const pixelRatio = window.devicePixelRatio;
        const width = canvas.clientWidth * pixelRatio | 0;
        const height = canvas.clientHeight * pixelRatio | 0;
        const needResize = canvas.width !== width || canvas.height !== height;
        if(needResize) {
            renderer.setSize(width, height, false);
        }
        return needResize;
    }

///////////////////////////

//  Orbit Controls 
    
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 5;
    controls.update();
    
//  Create globe, texture etc.
    {
        const loader = new THREE.TextureLoader();
        const texture = loader.load('../static/globe1.jpg', render);
        const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
        const material = new THREE.MeshPhongMaterial({map: texture});
        scene.add(new THREE.Mesh(geometry, material));
    }

//  Skybox
    {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
          '../static/Starscape.png',
          '../static/Starscape.png',
          '../static/Starscape.png',
          '../static/Starscape.png',
          '../static/Starscape.png',
          '../static/Starscape.png',
        ]);
        scene.background = texture;
    }

    function updataSat(){
        
        for(let i = 0; i < satellites.length; i++) {
            if(satellites[i].status === "ok"){
                const spriteMaterial = new THREE.SpriteMaterial( { color: 0x00ff00 } );
                satellites[i].cube = new THREE.Sprite( spriteMaterial );
                satellites[i].cube.scale.set(0.005, 0.005, 0.005)

                satellites[i].changeColor = function(color) { satellites[i].cube.material.color = new THREE.Color( color ) }
                satellites[i].moveToSatellite = function()  {
                    const data = window.TLE.getLatLngObj(satellites[i].tle);
                    let currentData = {
                        lat: THREE.MathUtils.radToDeg( Math.atan(camera.position.y / Math.hypot(camera.position.x, camera.position.z) )),
                        lng: THREE.MathUtils.radToDeg( Math.atan2(camera.position.z, camera.position.x) ),
                        radius: Math.hypot(camera.position.y, Math.hypot(camera.position.x, camera.position.z))
                    };
                    globals.targetLat= data.lat,
                    globals.targetLng= data.lng,
                    globals.tagetHeight= 1 + (satellites[i].info.height / 6371);

                    if( Math.abs(globals.targetLat - currentData.lat) > Math.abs(globals.targetLng - currentData.lng) ) {
                        const angle1 = Math.abs(globals.targetLat - currentData.lat)
                        globals.angleLatSpeed = globals.animationSpeed;
                        const timeAnimation = angle1 / globals.animationSpeed;
                        const angle2 = Math.abs(globals.targetLng - currentData.lng);
                        globals.angleLngSpeed = angle2 / timeAnimation;
                    }else {
                        const angle1 = Math.abs(globals.targetLng - currentData.lng); 
                        globals.angleLngSpeed = globals.animationSpeed;
                        const timeAnimation = angle1 / globals.animationSpeed;
                        const angle2 = Math.abs(globals.targetLat - currentData.lat)
                        globals.angleLatSpeed = angle2 / timeAnimation;
                    }

                    if(globals.targetLat < currentData.lat) globals.angleLatSpeed *= -1;
                    if(globals.targetLng < currentData.lng) globals.angleLngSpeed *= -1;

                    globals.isMoveToTargetLat = true;
                    globals.isMoveToTargetLng = true;
                }
                scene.add( satellites[i].cube );
            }
        }

    }

    function moveSat() {
        for(let i = 0; i < satellites.length; i++) {
            if(satellites[i].status === "ok"){
                let data = window.TLE.getLatLngObj(satellites[i].tle)
                let angleLat = THREE.MathUtils.degToRad(data.lat);
                let height = 1 + (satellites[i].info.height / 6371);

                satellites[i].cube.position.y = height * Math.sin(angleLat);
                let radius = height * Math.cos(angleLat);

                let angleLng = THREE.MathUtils.degToRad(data.lng);
                satellites[i].cube.position.x = radius * Math.cos(angleLng);
                satellites[i].cube.position.z = radius * Math.sin(angleLng);
            }
        }
        globals.updateTimer = globals.setUpdateTime;
    }

    function moveToTarget() {
        let currentData = {
            lat: THREE.MathUtils.radToDeg( Math.atan(camera.position.y / Math.hypot(camera.position.x, camera.position.z) )),
            lng: THREE.MathUtils.radToDeg( Math.atan2(camera.position.z, camera.position.x) ),
            radius: Math.hypot(camera.position.y, Math.hypot(camera.position.x, camera.position.z))
        };

        let deltaLatSpeed = ( globals.angleLatSpeed / 200);
        let nextAngleLat = THREE.MathUtils.degToRad(currentData.lat);

        let distanceXZ = currentData.radius * Math.cos(nextAngleLat);
        let deltaLngSpeed = ( globals.angleLngSpeed / 200);
        let nextAngleLng = THREE.MathUtils.degToRad(currentData.lng);

        if( globals.angleLatSpeed > 0 && currentData.lat >= globals.targetLat ) globals.isMoveToTargetLat = false;
        else if( globals.angleLatSpeed < 0 && currentData.lat <= globals.targetLat ) globals.isMoveToTargetLat = false;
        else {
            nextAngleLat = THREE.MathUtils.degToRad(currentData.lat + deltaLatSpeed);
            distanceXZ = currentData.radius * Math.cos(nextAngleLat);

            camera.position.y = currentData.radius * Math.sin(nextAngleLat);
            camera.position.x = distanceXZ * Math.cos(nextAngleLng);
            camera.position.z = distanceXZ * Math.sin(nextAngleLng);
            // console.log("1");
        }

        if( globals.angleLngSpeed > 0 && currentData.lng >= globals.targetLng ) globals.isMoveToTargetLng = false;
        else if( globals.angleLngSpeed < 0 && currentData.lng <= globals.targetLng ) globals.isMoveToTargetLng = false;
        else {
            nextAngleLng = THREE.MathUtils.degToRad(currentData.lng + deltaLngSpeed);

            camera.position.x = distanceXZ * Math.cos(nextAngleLng);
            camera.position.z = distanceXZ * Math.sin(nextAngleLng);
            // console.log("2");       
        }
    }

    function render() {
        globals.updateTimer -= globals.clock.getDelta();
        if ( globals.updateTimer <= 0 ) moveSat();

        if( globals.isMoveToTargetLat || globals.isMoveToTargetLng ) moveToTarget()
        
        if ( resizeRendererToDisplaySize(renderer) ) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        controls.update();
        renderer.render( scene, camera );
        requestAnimationFrame( render );
    }
    requestAnimationFrame( render );
    console.log("Start")

})();
