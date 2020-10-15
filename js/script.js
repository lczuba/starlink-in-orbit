import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import * as UI from './ui.js';
import { Satellite } from './satellite.js';

(function(){
    const satellites = [];

    const globals = {
        clock: new THREE.Clock(),
        updateTimer: 0,
        setUpdateTime: 1,
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
            let sat = new Satellite(tle);
            if(sat.isValid) {
                sat.setSatelliteProps(moveToTargetAnimation, camera, scene);
                scene.add( sat.mesh );
            } 
            UI.addNewSatellite(sat);
            satellites.push(sat);
        })
        requestRenderIfNotRequested();
    }   
    
    loadFile('../static/starlink.txt')
        .then(parseData)
        .then(createSatellitesObj)
    
////////////////////////////////////////////////////////////////////////////////////////
//  Main properties of scene, render, resize etc.
    const renderer = new THREE.WebGLRenderer();
    let renderRequested = false;
    document.body.appendChild( renderer.domElement );

    const fov = 45;
    const aspect = 2;
    const near = 0.1;
    const far = 500;
    const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
    camera.position.set( 0, 0, 100);
    camera.lookAt( 0, 0, 0);

   

    const scene = new THREE.Scene();
    
    // x,y,z lines
    // const axesHelper = new THREE.AxesHelper( 2 );
    // scene.add( axesHelper )

    //main light
    const color = 0xFFFFFF;
    const intensity = 2;
    let light = new THREE.AmbientLight(color, intensity);
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
    controls.minDistance = 1.3;
    controls.maxDistance = 10;
    controls.update();
    
//  Create globe, texture etc.

    {  
        const loader = new THREE.TextureLoader;
        const texture = loader.load('../static/hologram-map.svg', function ( data ) {
            data.image.width *= 8;
            data.image.height *= 8;
        });

        const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
        
        const material1 = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.FrontSide,
            flatShading: true,
            transparent: true,
            opacity: 1
          });

        const material2 = new THREE.MeshPhongMaterial({
            map: texture,
            side: THREE.BackSide,
            flatShading: true,
            transparent: true,
            opacity: 0.8
          });
        
        const mesh = new THREE.Mesh(geometry, material1);
        mesh.renderOrder = 2;
        // mesh.rotateY(Math.PI/2);
        scene.add(mesh);
        const mesh2 = new THREE.Mesh(geometry, material2);
        // mesh2.rotateY(Math.PI/2);
        scene.add(mesh2);
        
        var customMaterial = new THREE.ShaderMaterial( 
            {
                uniforms:       
                { 
                },
                vertexShader: "varying vec3 vNormal; void main() {vNormal = normalize( normalMatrix * normal );gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );}",
                fragmentShader: "varying vec3 vNormal;void main() {float intensity = pow( 0.22 - dot( vNormal, vec3( 0.0, 0.0, 1.0 ) ), 2.5 ); gl_FragColor = vec4( 1.0, 1.0, 1.0, 1.0 ) * intensity;}",
                side: THREE.BackSide,
                blending: THREE.AdditiveBlending,
                transparent: true,
                // opacity: 0.5,
            }   );
                
        var atmosphereGeo = new THREE.SphereGeometry( 1.4, 64, 32 );
        var atmosphere = new THREE.Mesh( atmosphereGeo, customMaterial );
        scene.add( atmosphere );

        
        
        
        
    }

//  Skybox
    {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
          '../static/space_bk.png',
          '../static/space_bk.png',
          '../static/space_bk.png',
          '../static/space_bk.png',
          '../static/space_bk.png',
          '../static/space_bk.png',
        ]);
        scene.background = texture;
    }

    function moveSat() {
        satellites.forEach((sat) => {
            sat.updateLatLng();
        });
        requestRenderIfNotRequested();
        globals.updateTimer = globals.setUpdateTime;
    }

    const moveToTargetAnimation = {
        isMoveToTargetLat: false,
        isMoveToTargetLng: false,
        animationSpeed: 100,
        angleLatSpeed: null, //per sec
        angleLngSpeed: null, //per sec
        timeAnimation: null,
        timeAnimationClock: null,
        targetLat: null,
        targetLng: null,
        tagetHeight: null,
        move: function() {
            controls.enableRotate = false;
            let delta = moveToTargetAnimation.timeAnimationClock.getDelta()
            let timeFraction = moveToTargetAnimation.timeAnimationClock.elapsedTime / moveToTargetAnimation.timeAnimation;
            if (timeFraction > 1) timeFraction = 1;
            let fun = Math.sin(Math.acos(timeFraction / 1.15));
            // let fun = 1;
            let currentData = {
                lat: THREE.MathUtils.radToDeg( Math.atan(camera.position.y / Math.hypot(camera.position.x, camera.position.z) )),
                lng: THREE.MathUtils.radToDeg( Math.atan2(camera.position.z, camera.position.x) ),
                radius: Math.hypot(camera.position.y, Math.hypot(camera.position.x, camera.position.z))
            };

            let deltaLatSpeed = ( moveToTargetAnimation.angleLatSpeed * delta * fun);
            let nextAngleLat = THREE.MathUtils.degToRad(currentData.lat);

            let distanceXZ = currentData.radius * Math.cos(nextAngleLat);
            let deltaLngSpeed = ( moveToTargetAnimation.angleLngSpeed * delta * fun);
            let nextAngleLng = THREE.MathUtils.degToRad(currentData.lng);

            if( moveToTargetAnimation.angleLatSpeed > 0 && currentData.lat >= moveToTargetAnimation.targetLat ) moveToTargetAnimation.isMoveToTargetLat = false;
            else if( moveToTargetAnimation.angleLatSpeed < 0 && currentData.lat <= moveToTargetAnimation.targetLat ) moveToTargetAnimation.isMoveToTargetLat = false;
            else {
                nextAngleLat = THREE.MathUtils.degToRad(currentData.lat + deltaLatSpeed);
                distanceXZ = currentData.radius * Math.cos(nextAngleLat);

                camera.position.y = currentData.radius * Math.sin(nextAngleLat);
                camera.position.x = distanceXZ * Math.cos(nextAngleLng);
                camera.position.z = distanceXZ * Math.sin(nextAngleLng);
            }

            if( moveToTargetAnimation.angleLngSpeed > 0 && currentData.lng >= moveToTargetAnimation.targetLng ) moveToTargetAnimation.isMoveToTargetLng = false;
            else if( moveToTargetAnimation.angleLngSpeed < 0 && currentData.lng <= moveToTargetAnimation.targetLng ) moveToTargetAnimation.isMoveToTargetLng = false;
            else {
                nextAngleLng = THREE.MathUtils.degToRad(currentData.lng + deltaLngSpeed);

                camera.position.x = distanceXZ * Math.cos(nextAngleLng);
                camera.position.z = distanceXZ * Math.sin(nextAngleLng);     
            }
            requestRenderIfNotRequested();
        },
    }

    setInterval(function() {
        globals.updateTimer -= globals.clock.getDelta();
        
        //if camera is going to target don't update position of 'million' satelite
        if( moveToTargetAnimation.isMoveToTargetLat || moveToTargetAnimation.isMoveToTargetLng ) moveToTargetAnimation.move();
        else {
            if ( globals.updateTimer <= 0 ) moveSat();
            controls.enableRotate = true;
        }
        controls.update();
    }, 1000/60);

    function render() {
        renderRequested = false;

        if ( resizeRendererToDisplaySize(renderer) ) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        
        renderer.render( scene, camera );
    }
    render();

    function requestRenderIfNotRequested() {
        if(!renderRequested) {
            renderRequested = true;
            requestAnimationFrame( render );
        }
    }

    controls.addEventListener('change', requestRenderIfNotRequested);
    window.addEventListener('resize', requestRenderIfNotRequested)
    console.log("Start")

})();
