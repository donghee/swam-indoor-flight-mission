require('three')
require('three/OrbitControls')
require('lib/timeliner')

var target = {
  x1: 0, y1: 0, z1: 0,
  x2: 1, y2: 0, z2: 1,
};

var timeliner = new Timeliner(target);
timeliner.addLayer('x1');
timeliner.addLayer('y1');
timeliner.addLayer('z1');
timeliner.addLayer('x2');
timeliner.addLayer('y2');
timeliner.addLayer('z2');

var scene = new THREE.Scene();
var renderer = new THREE.WebGLRenderer();
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var grid = new THREE.GridHelper( 50, 50, 0xffffff, 0x555555 );
scene.add( grid );

var geometry = new THREE.SphereGeometry( 0.7, 10, 10 );
var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

var geometry2 = new THREE.BoxGeometry( 1, 1, 1 );
var material2 = new THREE.MeshBasicMaterial( { color: 0x0000ff } );
var cube = new THREE.Mesh( geometry2, material2 );
scene.add( cube );

var camera = new THREE.PerspectiveCamera( 35, window.innerWidth / window.innerHeight, 1, 500 );
camera.position.set( 1, 1, 10 );
// camera.lookAt( 0, 0, 0 );

var controls = new THREE.OrbitControls( camera, renderer.domElement );
controls.addEventListener( 'change', render );
controls.update();

renderer.render( scene, camera );

function render() {
  renderer.render( scene, camera );
}

function animate() {
  requestAnimationFrame( animate );
  render()

  sphere.position.set(target.x1, target.y1, target.z1)
  cube.position.set(target.x2, target.y2, target.z2)

  // sphere.rotation.x += 0.01;
  // sphere.rotation.y += 0.01;
  // cube.position.set(x, y, 0);
  // x += 0.1
  // y += 0.1
  // if ( x > 2) x = 0
  // if ( y > 2) y = 0
}
animate();

