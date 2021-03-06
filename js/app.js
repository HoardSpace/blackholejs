// ------------------------------------------------
// DAT.GUI
// ------------------------------------------------

var BlackHole = function() {
    this.radius = 0.1;
    this.multiplier = 2; // Should be 2
    this.offset = 1.0;
    this.k = 1.4;
    this.showHorizon = true;
};

var blackhole = new BlackHole();

window.onload = function() {
    var gui = new dat.GUI();
    gui.add(blackhole, 'radius', 0.1, 10);
    gui.add(blackhole, 'multiplier', 0.1, 10);
    gui.add(blackhole, 'offset', 1, 10);
    gui.add(blackhole, 'k', 1, 10);
    gui.add(blackhole, 'showHorizon');
};

// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------

// Create an empty scene
var scene = new THREE.Scene();

// Create a basic perspective camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(3,0,4);
camera.lookAt(new THREE.Vector3(0,0,0));

// Create a renderer with Antialiasing
var renderer = new THREE.WebGLRenderer({ antialias: true });

// Configure renderer clear color
renderer.setClearColor("#000000");

// Configure renderer size
renderer.setSize(window.innerWidth, window.innerHeight);

// Append Renderer to DOM
document.body.appendChild(renderer.domElement);

// ------------------------------------------------
// FUN STARTS HERE
// ------------------------------------------------

// Create camera controls

controls = new THREE.OrbitControls(camera, renderer.domElement);
controls.maxDistance = 20;
controls.minDistance = 1;

// Create objects

var geometry1 = new THREE.BoxGeometry(1, 1, 1);
var geometry2 = new THREE.SphereGeometry(0.5, 32, 32);
var geometry3 = new THREE.ConeGeometry(0.5, 1, 32);
var geometry4 = new THREE.CylinderGeometry(2, 2, 0.01, 32);

var material = new THREE.MeshBasicMaterial({ color: "#433F81" });

var texture = new THREE.TextureLoader().load( 'img/swirl.png' );
var swirl = new THREE.MeshBasicMaterial( { map: texture } );

var cube = new THREE.Mesh(geometry1, material);
var sphere = new THREE.Mesh(geometry2, material);
var cone = new THREE.Mesh(geometry3, material);
var disk = new THREE.Mesh(geometry4, swirl);

// Add objects to Scene

scene.add(cube);
scene.add(sphere);
scene.add(cone);
scene.add(disk);

// Create helpers

var grid = new THREE.GridHelper(10, 20);
var axes = new THREE.AxesHelper(2);

scene.add(grid);
scene.add(axes);

// Position the objects

cube.position.set(0, 0, -5);
sphere.position.set(5, 0, 0);
cone.position.set(-3, 0, 3);
disk.position.set(0, 0, 0);

// Create the skybox

var imagePrefix = "img/dawnmountain-";
var directions  = ["xpos", "xneg", "ypos", "yneg", "zpos", "zneg"];
var imageSuffix = ".png";

var materialArray = [];
for (var i = 0; i < 6; i++) {
    materialArray.push( new THREE.MeshBasicMaterial({
        map: THREE.ImageUtils.loadTexture( imagePrefix + directions[i] + imageSuffix ),
        side: THREE.BackSide
    }));
}

var skyMaterial = new THREE.MeshFaceMaterial(materialArray);
var skyGeometry = new THREE.CubeGeometry(100, 100, 100);
var skyBox = new THREE.Mesh(skyGeometry, skyMaterial);

scene.add( skyBox );

// Create an effect composer

var composer = new THREE.EffectComposer(renderer);
var renderPass = new THREE.RenderPass(scene, camera);
//renderPass.renderToScreen = true;
composer.addPass(renderPass);

var bhEffect = new THREE.ShaderPass( THREE.BlackHoleShader );

var bhPosition = new THREE.Vector3(0,0,0);
var bhScreen = new THREE.Vector2(0,0);
var bhDistance = 0;

var bhRatio = window.innerHeight/window.innerWidth;
bhEffect.uniforms['_Ratio'].value = bhRatio;

bhEffect.renderToScreen = true;
composer.addPass(bhEffect);

// Render Loop
var render = function () {

    requestAnimationFrame(render);

    controls.update();

    var p = new THREE.Vector3();
    p.set(bhPosition.x, bhPosition.y, bhPosition.z);
    p.project(camera);
    bhScreen.set((1 + p.x)*0.5, (1 + p.y)*0.5);

    bhDistance = camera.position.distanceTo(bhPosition);
    bhEffect.uniforms['_Distance'].value = bhDistance;
    bhEffect.uniforms['_Position'].value = bhScreen;
    bhEffect.uniforms['_Rad'].value = blackhole.radius;
    bhEffect.uniforms['_Mul'].value = blackhole.multiplier;
    bhEffect.uniforms['_Off'].value = blackhole.offset;
    bhEffect.uniforms['_K'].value = blackhole.k;
    bhEffect.uniforms['_EH'].value = blackhole.showHorizon ? 1 : 0;
    
    composer.render();
};

render();
