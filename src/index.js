require('three')
require('three/OrbitControls')
require('three/GLTFLoader')
require('lib/timeliner/timeliner')

var target = {
  x1: 0, y1: 0, z1: 0,
};

var timeliner = new Timeliner(target);
timeliner.addLayer('x1');
timeliner.addLayer('y1');
timeliner.addLayer('z1');

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
var container = document.getElementById('site-container');
renderer.setSize( window.innerWidth, window.innerHeight-120 );
renderer.setClearColor(0xEEEEEE);
container.appendChild( renderer.domElement );

var axes = new THREE.AxesHelper(10);
scene.add(axes);

     // station
     var geometry = new THREE.CylinderBufferGeometry(0.1, 0.1, 2, 32);
     var material = new THREE.MeshBasicMaterial({color: 0xFE98A0});
     var cube = new THREE.Mesh(geometry, material);
     scene.add(cube);
     cube.position.y = 1

     var cube1 = new THREE.Mesh(geometry, material);
     scene.add(cube1);
     cube1.position.x = 10
     cube1.position.y = 1
     cube1.position.z = 0

     var cube2 = new THREE.Mesh(geometry, material);
     scene.add(cube2);
     cube2.position.x = 10
     cube2.position.y = 1
     cube2.position.z = -6

     var cube3 = new THREE.Mesh(geometry, material);
     scene.add(cube3);
     cube3.position.x = 0
     cube3.position.y = 1
     cube3.position.z = -6

     // loader
     var loader = new THREE.GLTFLoader();

     var duck, chicken;

     // Load a glTF resource
     loader.load(
	   // resource URL
	 '/3dr_arducopter_quad_x.glb',
	   // called when the resource is loaded
	   function ( gltf ) {
         duck = gltf.scene;
         /* Math.PI / 2 */
         duck.rotation.x = Math.PI/2;
		 scene.add( duck );

		 gltf.animations; // Array<THREE.AnimationClip>
		 gltf.scene; // THREE.Scene
		 gltf.scenes; // Array<THREE.Scene>
		 gltf.cameras; // Array<THREE.Camera>
		 gltf.asset; // Object
	   },
	   // called while loading is progressing
	   function ( xhr ) {

		 console.log( ( xhr.loaded / xhr.total * 100 ) + '% loaded' );

	   },
	   // called when loading has errors
	   function ( error ) {

		 console.log( 'An error happened' );

	   }
     );

// grid
var size = 1000;
var divisions = 1000;

var gridHelper = new THREE.GridHelper( size, divisions, 0x0000ff, 0x808080 );
gridHelper.position.y = 0;
gridHelper.position.x = 0;

scene.add( gridHelper );

// var geometry = new THREE.SphereGeometry( 0.5, 20, 20 );
// var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
// var sphere = new THREE.Mesh( geometry, material );
// scene.add( sphere );


// Camera
var camera = new THREE.PerspectiveCamera(25, window.innerWidth / window.innerHeight, 0.1, 100);
// camera.lookAt(new THREE.Vector3(0, 0, 0));
camera.position.x = 0;
camera.position.y = 0;
camera.position.z = 50;


     // Lighting
     var ambient = new THREE.AmbientLight(0x808080);
     scene.add(ambient);

     var spotLight = new THREE.SpotLight(0xffffff);
     spotLight.position.set(10, 20, 20);
     spotLight.shadow.camera.near = 10;
     spotLight.shadow.camera.far = 40;
     spotLight.castShadow = true;
     scene.add(spotLight);

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render );
controls.update();

renderer.render( scene, camera );

function render() {
  renderer.render( scene, camera );
}

var x = [ 0, 0, 0, 0, 0, 0, ]
var y = [ 0, 0, 0, 0, 0, 0, ]
var z = [ 0, 2, 0, 2, 0, 2, ]
var i = 0

// function animate() {
//   console.log('animate', x[i], z[i], y[i])
//     requestAnimationFrame( animate );
//   render()

//     sphere.position.set(x[i], z[i], y[i])
//   i += 1
//   if ( i === x.length) i = 0
// }
// requestAnimationFrame( animate ); // 얘만 불러도 animate_original 이 계속 됨

// setTimeout(animate, 1000)
// animate();

function animate_original() {
  requestAnimationFrame( animate_original );
  render()

  // sphere.position.set(target.x1, target.z1, target.y1)
  duck.position.set(target.x1, target.z1, target.y1)
}
animate_original();
