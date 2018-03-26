// ------------------------------------------------
// BASIC SETUP
// ------------------------------------------------

// Create an empty scene
var scene = new THREE.Scene();

// Create a basic perspective camera
var camera = new THREE.PerspectiveCamera(75, window.innerWidth/window.innerHeight, 0.1, 1000);
camera.position.set(3,2,4);
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

controls = new THREE.OrbitControls(camera);
controls.maxDistance = 20;
controls.minDistance = 1;

// Create objects

var geometry1 = new THREE.BoxGeometry(1, 1, 1);
var geometry2 = new THREE.SphereGeometry(0.5, 32, 32);
var geometry3 = new THREE.ConeGeometry(0.5, 1, 32);

var material = new THREE.MeshBasicMaterial({ color: "#433F81" });

var cube = new THREE.Mesh(geometry1, material);
var sphere = new THREE.Mesh(geometry2, material);
var cone = new THREE.Mesh(geometry3, material);

// Add objects to Scene

scene.add(cube);
scene.add(sphere);
scene.add(cone);

// Create helpers

var grid = new THREE.GridHelper(10, 20);
var axes = new THREE.AxesHelper(2);

scene.add(grid);
scene.add(axes);

// Position the objects

cube.position.set(0, 0, -1);
sphere.position.set(2, 0, 0);
cone.position.set(-1, 0, 1);

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

var bhRadius = 0.1;
bhEffect.uniforms['_Rad'].value = bhRadius;

bhEffect.renderToScreen = true;
composer.addPass(bhEffect);

// Render Loop
var render = function () {

    requestAnimationFrame(render);

    controls.update();

    var p = new THREE.Vector3(bhPosition.x, bhPosition.y, bhPosition.z);
    p.project(camera);
    bhScreen = new THREE.Vector2 (p.x / window.innerWidth + 0.5, p.y / window.innerHeight + 0.5);

    bhDistance = camera.position.distanceTo(bhPosition);
    bhEffect.uniforms['_Distance'].value = bhDistance;
    bhEffect.uniforms['_Position'].value = bhScreen;    
    
    composer.render();
};

render();
