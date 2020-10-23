import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';
import * as DATA from './data.js';
import { GroupOfSatellites } from './GroupOfSatellites.js';
import * as UI from './ui.js';

(function(){
    const groups = [];
    const globals = {
        clock: new THREE.Clock(),
        updateTime: 0,
        resetUpdateTime : function() {
            globals.updateTime = 1;
        },
    }

    function createGroupOfSatellites() {
        const numberOfGroup = DATA.getNumberOfGroupsSatellites();
        for(let i=0; i<numberOfGroup; i++) {
            DATA.getGroupSatelite(i).then(
                data => {
                    const group = new GroupOfSatellites(
                        data, 
                        scene, 
                        camera, 
                        function() { requestRenderIfNotRequested() }
                    );
                    groups.push(group);
                    UI.createGroupOfSatellites(group);
                },
                error => {
                    console.log(error);
                }
            )
        }
    }
    createGroupOfSatellites();

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
    

    // Main light
    {
        const color = 0xFFFFFF;
        const intensity = 2;
        let light = new THREE.AmbientLight(color, intensity);
        scene.add(light);
    }

    // Responsive
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

    // Create globe, texture etc.
    {  
        const loader = new THREE.TextureLoader;
        const texture = loader.load('../static/hologram-map.svg', function ( data ) {
            data.image.width *= 8;
            data.image.height *= 8;

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
            requestRenderIfNotRequested();
        })

    }

    // Orbit Controls 
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.3;
    controls.maxDistance = 10;
    controls.update();
    
    // Skybox
    {
        const loader = new THREE.CubeTextureLoader();
        const texture = loader.load([
          '../static/space_bk.png',
          '../static/space_bk.png',
          '../static/space_bk.png',
          '../static/space_bk.png',
          '../static/space_bk.png',
          '../static/space_bk.png',
        ], function() {
            scene.background = texture;
            requestRenderIfNotRequested();
        });
    }

    function updatePositionOfGroupSatellites() {
        groups.forEach((group) => group.updatePositionOfSatellites() );
        globals.resetUpdateTime();
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
        globals.updateTime -= globals.clock.getDelta();
        if( moveToTargetAnimation.isMoveToTargetLat || moveToTargetAnimation.isMoveToTargetLng ) moveToTargetAnimation.move();
        else {
            if ( globals.updateTime <= 0 ) updatePositionOfGroupSatellites();
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
