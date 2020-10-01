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

        console.log(satellites);
    }
    
    loadFile('../static/starlink.txt')
        .then(parseData)
        .then(createSatellitesObj)
        .then(updataSat)
        
    // //////////////////////////////////////////////////////////////////////////////////////

    const scene = new THREE.Scene();
    // scene.background = new THREE.Color('white')
    const camera = new THREE.PerspectiveCamera( 45, window.innerWidth / window.innerHeight, 0.1, 1000 );
    camera.position.set( 0, 0, 100);
    camera.lookAt( 0, 0, 0);

    const renderer = new THREE.WebGLRenderer();
    renderer.setSize( window.innerWidth, window.innerHeight );
    document.body.appendChild( renderer.domElement );

    const axesHelper = new THREE.AxesHelper( 2 );
    scene.add( axesHelper )
    
    renderer.render( scene, camera);
 
    {
        const loader = new THREE.TextureLoader();
        const texture = loader.load('../static/globe1.jpg', render);
        const geometry = new THREE.SphereBufferGeometry(1, 64, 32);
        const material = new THREE.MeshPhongMaterial({map: texture});
        scene.add(new THREE.Mesh(geometry, material));
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
        var geometry = new THREE.SphereBufferGeometry(0.005, 64, 32);
        var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
        
        var geometry2 = new THREE.SphereBufferGeometry(0.005, 64, 32);
        var material2 = new THREE.MeshBasicMaterial( {color: 0x000000} );

        for(let i = 0; i < satellites.length; i++) {
            if(satellites[i].status === "ok"){
                satellites[i].cube = new THREE.Mesh( geometry, material );
                // satellites[i].point = new THREE.Mesh( geometry2, material2 );
                scene.add( satellites[i].cube );
                // scene.add( satellites[i].point );
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

                    // positionHelper.position.z = 0.9999;
                    // satellites[i].point.position.set(0,0,0);
                    // positionHelper.updateWorldMatrix(true, false);
                    // satellites[i].point.applyMatrix4(positionHelper.matrixWorld);

                }
            }

        }, 300);
    }
    

    

    function render() {
    
        requestAnimationFrame( render );
    
        // required if controls.enableDamping or controls.autoRotate are set to true
        controls.update();
    
        renderer.render( scene, camera );
    
    }
    render();
    console.log("start")

})();
