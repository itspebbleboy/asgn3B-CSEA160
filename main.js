// vertex shader source codes
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec4 a_Color;
  varying vec2 v_UV;
  varying vec4 v_Color;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Color = a_Color;
  }`;

// fragment shader source code
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec4 v_Color;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_WhichTexture;
  void main() {
    gl_FragColor = u_FragColor;
    if (u_WhichTexture == 0) {
      //gl_FragColor = v_Color;
      gl_FragColor = texture2D(u_Sampler0, v_UV);

    } else if (u_WhichTexture == 1) {
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    } else{
      gl_FragColor = vec4(1,0,0,1); //error, redish
    }
  }`;

// global vars for WebGL context & shader program attributes/uniforms
let gl;
let canvas;
  //attribute
let a_Position;
let a_UV;
let a_Color;
  //uniform
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Samplers = [];

let num_texts = 2;
let gl_TEXTURES;
let textures = ["./resources/blueflower.jpg", './resources/floor.jpg'];
let u_WhichTexture = 0;

let g_rotateMatrix;
let g_angle = 0;
let g_time = Date.now(); // Initialize g_time outside the tick function for persistence

let map_offset_X= 5;
let map_offset_Z=-30;

let camera_rotateY = 0;
let camera_rotateX = 0;
let key_state=0;
let mouseymove = false;
// Camera
var camera = new Camera();

/* 
REQUIREMENTS FOR ASGN 3A
    0.5 pts Have a ground created with a flattened cube and sky from a big cube.
    1 pts   Texture working on at least one object.
    0.5 pts Texture on some objects and color on some other objects. All working together.
    1 pts   Multiple textures
*/
// 0,0,0,0,0,0,0,0,
// 1,1,1,1,1,1,1,1,
let map =      [[1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
                [1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1],
];

let blocks = [];

function drawMap(map, texture, level){
  for(x=0;x<32;x++){
    for(y=0;y<map.length;y++){
        if(map[y][x] == 1){
          var b = new Cube();
          b.textureNum = texture;
          b.matrix.translate(x+map_offset_X,level,y+map_offset_Z);
          b.color = [50/255,50/255,50/255,1];
          blocks.push(b);
        }
    }
  }
}

function main() {
  if (!setupWebGL()) {
      return;
  }
  if (!connectVariablesToGLSL()) {
      return;
  }
  actionsForHTMLUI();
  document.onkeydown = keydown;
  document.onkeyup = keyup;
  canvas.addEventListener("click", async (ev) => {
    if (!mouseymove){
      await canvas.requestPointerLock({
        unadjustedMovement: true,
      });
    }
  });
  
  document.addEventListener("pointerlockchange", (ev) => {
    mouseymove = !mouseymove;
    console.log("pointerlockchange called, mouseymove = " + mouseymove);
  });

  document.addEventListener("mousemove", (ev) => {
    if(!mouseymove) return;  
    camera_rotateY += ev.movementX; // controls yaw
    camera_rotateX -= ev.movementY; // controls pitch  
  });  

  initTextures();
  gl.clearColor(75/255, 97/255, 84/255, 1.0);
  drawMap(map, 0, 0);
  function initGeometry(){
    cube = new Cube();
  }

  function renderScene() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);

    // making the projection  matrix 
    var projMat = new Matrix4();
    projMat.setPerspective(camera.fov, canvas.width/canvas.height, .1, 1000);
    gl.uniformMatrix4fv(u_ProjectionMatrix,false,projMat.elements);

    // making the view matrix 
    var viewMat = new Matrix4(0,0,0, 1,1,1, 0,1,0);
    viewMat.setLookAt(camera.eye.elements[0],camera.eye.elements[1], camera.eye.elements[2], 
        camera.at.elements[0], camera.at.elements[1], camera.at.elements[2], 
            camera.up.elements[0],camera.up.elements[1],camera.up.elements[2]);
    gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

    // rotate matrix
    g_rotateMatrix = new Matrix4();
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, g_rotateMatrix.elements);
    
    let cube = new Cube();
    cube.color = [50/255,50/255,50/255,1];
    cube.matrix.translate(5,0,-10);
    cube.render();

    let sky = new Cube();
    sky.textureNum = 0;
    sky.matrix.scale(200,200,200);
    
    sky.render();

    let floor = new Cube();
    floor.textureNum = 1; 
    floor.matrix.translate(0,-0.7 ,0);
    floor.matrix.scale(200,1,200);
    floor.render();

    blocks.forEach(b => {
      b.render();
    });
  }

  var tick = function(){
    let startTime = performance.now();

    var now = Date.now();
    var elapsed = now - g_time;// in milliseconds
    g_time = now;
      
    // init render call
    camera.rot[0] = camera_rotateX;
    camera.rot[1] = camera_rotateY;
    camera.update(elapsed);
    camera_rotateX = 0;
    camera_rotateY = 0;

    renderScene();
    requestAnimationFrame(tick);// req that the browser calls tick
    let duration = performance.now() - startTime;
    sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration), "fps");
  };

  //requestAnimationFrame(tick);
  requestAnimationFrame(tick);


  function actionsForHTMLUI(){
    //events go here
    
  }
  
  function keydown(ev){
    switch(ev.keyCode){ //PRESS DOWN
      case 68: //D 
        camera.move[0] = 1;
        console.log("D");
        break;
      case 65: //A
        camera.move[0] = -1;
        console.log("A");
        break;
      case 87: //W
        camera.move[2] = 1;
        console.log("W");
        break;
      case 83: //S
        camera.move[2] = -1;
        console.log("S"); 
        break;
      case 81: //Q
        camera_rotateY = -10;
        break;
      case 69: //E
        camera_rotateY =10;
        //camera_rotateX = key_state;
        break;
      case 186: //;
        addBlock();
        break;
      case 222: //'
        deleteBlock();
        break;
      default:
        console.log("invalid key");
        break; 
    }
    /*
    console.log("rot[0]: "+ camera.rot[0]);
    camera.update();
    renderScene();
    camera.rot[0] = 0;*/
  }
  function keyup(ev){
    switch(ev.keyCode){ // RELEASE
      case 68: //D
        camera.move[0] = 0;
        break;
      case 65: //A
        camera.move[0] = 0;
        break;
      case 87: //W
        camera.move[2] = 0;
        break;
      case 83: //S
        camera.move[2] = 0;
        break;
      default:
        break; 
    }
    /*
    console.log("rot[0]: "+ camera.rot[0]);
    camera.update();
    renderScene();
    camera.rot[0] = 0;*/
  }

  //tick();
  
  function addBlock() {
    let direction = camera.forward().norm(); // Ensure the direction vector is normalized
    let stepSize = 0.5; // Smaller step sizes result in more accurate raycasting
    let maxDistance = 5;
    let map_offset_X = 5; // Adjust based on how your map and drawing coordinates are aligned
    let map_offset_Z = 30; // Adjust based on how your map and drawing coordinates are aligned

    // Iterate from farthest point back towards the camera
    for (let t = maxDistance; t >= 0; t -= stepSize) {
        let checkX = Math.floor(camera.at.elements[0] + direction.elements[0] * t - map_offset_X);
        let checkY = Math.floor(camera.at.elements[1] + direction.elements[1] * t);
        let checkZ = Math.floor(camera.at.elements[2] + direction.elements[2] * t + map_offset_Z);

        console.log(" Check: {" + checkX+", "+checkZ +"}");

        // Ensure we're within map bounds
        if (checkZ >= 0 && checkZ < map.length && checkX >= 0 && checkX < map[0].length) {
          console.log("checking block @: " + checkX +", "+checkZ +" value: " + map[checkZ][checkX] );
            if (map[checkZ][checkX] === 0) {  // Assuming '0' is an empty space where a block can be added
                map[checkZ][checkX] = 1; // Add a block
                updateScene(); // Redraw the scene
                console.log("Block added at:", checkX, checkZ);
                return; // Exit the function after adding the block
            }
        }
    }

    console.log("No suitable space found to add a block.");
  }

  function deleteBlock() {
    let direction = camera.forward().norm(); // Ensure the direction vector is normalized
    let stepSize = 0.1; // Smaller step sizes result in more accurate raycasting
    let maxDistance = 5;

    for (let t = 0; t <= maxDistance; t += stepSize) {
        //let checkX = Math.floor(camera.at.elements[0] + direction.elements[0] * t - map_offset_X);
        //let checkY = Math.floor(camera.at.elements[1] + direction.elements[1] * t);
        //let checkZ = Math.floor(camera.at.elements[2] + direction.elements[2] * t - map_offset_Z);

        let checkX = Math.floor(camera.at.elements[0] + direction.elements[0] * t - map_offset_X);
        let checkY = Math.floor(camera.at.elements[1] + direction.elements[1] * t);
        let checkZ = Math.floor(camera.at.elements[2] + direction.elements[2] * t - map_offset_Z);
        // Ensure we're within map bounds
        if (checkZ >= 0 && checkZ < map.length && checkX >= 0 && checkX < map[0].length) {
            if (map[checkZ][checkX] === 1) {  // Assuming '1' is a solid block
                map[checkZ][checkX] = 0; // Remove the first block found
                updateScene(); // Redraw the scene
                console.log("Block removed at:", checkX, checkZ);
                return; // Exit the function after removing the block
            }
        }
    }

    console.log("No block found within range to delete.");
  }



  function updateScene() {
    blocks = []; // Clear existing blocks
    drawMap(map, 0, 0);
    renderScene(); // Render the whole scene
  }

}


function clearCanvas() {
    renderScene(); // Re-render the canvas, which should now be clear
}
function getTargetBlock() {
  let direction = camera.forward();
  let targetX = Math.floor(camera.eye.elements[0] + direction.elements[0] * 5);
  let targetY = Math.floor(camera.eye.elements[1] + direction.elements[1] * 5);
  let targetZ = Math.floor(camera.eye.elements[2] + direction.elements[2] * 5);
  return {x: targetX, y: targetY, z: targetZ};
}


function loadTexture(image, num) {
  let texture = gl.createTexture();
  if (!texture) {
    console.error("Failed to create texture");
    return -1;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);   // flip the image's y axis
  gl.activeTexture(gl_TEXTURES[num]);  // enable the texture unit 0
  gl.bindTexture(gl.TEXTURE_2D, texture); // bind texture obj to the target 
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); // set the texture parameters 
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image); // set the texture image
  gl.uniform1i(u_Samplers[num], num); // set the texture unit 0 to the sampler
}

function initTextures() {
  for (let i = 0; i < textures.length; i++) {
    let img = new Image();
    img.src = textures[i];
    img.onload = function() { loadTexture(img, i); }
  }
}


function setupWebGL() {
  // Retrieve <canvas> element & get the rendering context for WebGL
  canvas = document.getElementById('webgl');

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true }); // for performance
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return false;
  }
  gl_TEXTURES = [gl.TEXTURE0, gl.TEXTURE1];
  return true;
}


function connectVariablesToGLSL() {
  // init shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to initialize shaders.');
    return false;
  }

  // get storage locations of a_Position & u_FragColor
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');

  if (a_Position < 0 || !u_FragColor) {
    console.log('Failed to get the storage location of a_Position or u_FragColor');
    return false;
  }
  a_UV = gl.getAttribLocation(gl.program, "a_UV");
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) { 
    console.log('Failed to get the storage location of u_ModelMatrix');
    return false;
  }
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) { 
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return false;
  }
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, "u_ProjectionMatrix");
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  u_ViewMatrix = gl.getUniformLocation(gl.program, "u_ViewMatrix");
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }
  for (let i = 0; i < num_texts; i++) {
    let u_Sampler = gl.getUniformLocation(gl.program, `u_Sampler${i}`);
    if (!u_Sampler) {
      console.error(`Failed to get the storage location of u_Sampler${i}`);
      return -1;
    }
    u_Samplers.push(u_Sampler);
  }

  u_WhichTexture = gl.getUniformLocation(gl.program, "u_WhichTexture");
  if (!u_WhichTexture) {
    console.error('Failed to get the storage location of u_WhichTexture');
    return -1;
  }
  
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

  // set the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  return true;
}

function sendTextToHTML(text,htmlID){
    var htmlElm = document.getElementById(htmlID);
    if(!htmlElm){
        console.log('Failed to get ' + htmlID + ' from HTML');
        return;
    }
    htmlElm.innerHTML = text;
}
main();