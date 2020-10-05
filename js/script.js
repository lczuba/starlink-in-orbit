import * as THREE from '../node_modules/three/build/three.module.js';
import {OrbitControls} from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

(function(){

    const satellites = [];

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

            satellites.push(sat)
        })

        // console.log(satellites);
    }
    
    loadFile('../static/starlink.txt')
        .then(parseData)
        .then(createSatellitesObj)
        .then(updataSat)
        
    // //////////////////////////////////////////////////////////////////////////////////////

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
        
    const axesHelper = new THREE.AxesHelper( 2 );
    scene.add( axesHelper )
    
    {
        const loader = new THREE.TextureLoader();
        const texture = loader.load('../static/globe1.jpg', render);
        const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
        const material = new THREE.MeshPhongMaterial({map: texture});
        scene.add(new THREE.Mesh(geometry, material));
    }

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

    const color = 0xFFFFFF;
    const intensity = 1;
    const light = new THREE.AmbientLight(color, intensity);
    scene.add(light);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minDistance = 1.2;
    controls.maxDistance = 5;
    controls.update();

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

    // const light2 = new THREE.DirectionalLight(color, intensity);
    // light2.position.set(0, 10, 0);
    // light2.target.position.set(-5, 0, 0);
    // scene.add(light2);
    // scene.add(light2.target);

    const lonHelper = new THREE.Object3D();
    scene.add(lonHelper);

    const latHelper = new THREE.Object3D();
    lonHelper.add(latHelper);

    const positionHelper = new THREE.Object3D();
    // const positionHelper = cube
    

    latHelper.add(positionHelper);


    function updataSat(){
        var geometry = new THREE.SphereBufferGeometry(0.005, 16, 16);
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        
        for(let i = 0; i < satellites.length; i++) {
            if(satellites[i].status === "ok"){
                satellites[i].cube = new THREE.Mesh( geometry, material );
                scene.add( satellites[i].cube );
            }
        }

        setInterval(function(){

            for(let i = 0; i < satellites.length; i++) {

                if(satellites[i].status === "ok"){

                    let data = window.TLE.getLatLngObj(satellites[i].tle)
                    // console.log(data);
                    latHelper.rotation.x = THREE.MathUtils.degToRad(data.lat * -1);
                    lonHelper.rotation.y = THREE.MathUtils.degToRad(90 + data.lng);
                    positionHelper.position.z = 1 + (satellites[i].info.height / 6371);
                    positionHelper.updateWorldMatrix(true, false);
                    satellites[i].cube.position.set(0,0,0);
                    satellites[i].cube.applyMatrix4(positionHelper.matrixWorld);
                }
            }

        }, 300);
    }

    function moveSat() {
            for(let i = 0; i < satellites.length; i++) {

                if(satellites[i].status === "ok"){

                    let data = window.TLE.getLatLngObj(satellites[i].tle)
                    // console.log(data);
                    latHelper.rotation.x = THREE.MathUtils.degToRad(data.lat * -1);
                    lonHelper.rotation.y = THREE.MathUtils.degToRad(90 + data.lng);
                    positionHelper.position.z = 1 + (satellites[i].info.height / 6371);
                    positionHelper.updateWorldMatrix(true, false);
                    satellites[i].cube.position.set(0,0,0);
                    satellites[i].cube.applyMatrix4(positionHelper.matrixWorld);
                }
            }
    }
    
    function render(time) {
        time *= 0.001;
        
        if (resizeRendererToDisplaySize(renderer)) {
            const canvas = renderer.domElement;
            camera.aspect = canvas.clientWidth / canvas.clientHeight;
            camera.updateProjectionMatrix();
        }

        controls.update();
        renderer.render( scene, camera );
        requestAnimationFrame( render );
    
    }
    requestAnimationFrame( render );
    console.log("start")

})();
