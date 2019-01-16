require('three')
require('three/OrbitControls')
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
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );

var grid = new THREE.GridHelper( 50, 50, 0xffffff, 0x555555 );
scene.add( grid );

var geometry = new THREE.SphereGeometry( 0.5, 20, 20 );
var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
var sphere = new THREE.Mesh( geometry, material );
scene.add( sphere );

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

var x = [ 0, 0, 0, 0, 0, 0, ]
var y = [ 0, 0, 0, 0, 0, 0, ]
var z = [ 0, 2, 0, 2, 0, 2, ]
var i = 0

function animate() {
  console.log('animate', x[i], z[i], y[i])
  requestAnimationFrame( animate );
  render()

  sphere.position.set(x[i], z[i], y[i])
  i += 1
  if ( i === x.length) i = 0
}
// requestAnimationFrame( animate ); // 얘만 불러도 animate_original 이 계속 됨

// setTimeout(animate, 1000)
// animate();

function animate_original() {
  requestAnimationFrame( animate_original );
  render()

  sphere.position.set(target.x1, target.z1, target.y1)
}
animate_original();
