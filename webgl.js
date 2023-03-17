/** @type {WebGLRenderingContext} */
var gl

/** @type {WebGLProgram} */
var shaderProgram

var pentPosAtrLoc // место в общем буфере
var pentPosBuffer // локальный буфер

var vertices

// Shader programs
const pentVertShader = `
attribute vec3 vertPos;

void main() {
  gl_Position =  vec4(vertPos, 1.0);
}`

const cubeVertShader =`
attribute vec3 vertPos;
varying vec3 vPos;
float x_angle = 1.0;
float y_angle = 1.0;
mat3 transform = mat3(1,0,0,
                      0,cos(x_angle),sin(x_angle),
                      0,-sin(x_angle),cos(x_angle))
                * mat3(cos(y_angle),0,sin(y_angle),
                       0, 1, 0,
                       -sin(y_angle), 0, cos(y_angle));


void main() {
  gl_Position =  vec4(vertPos * transform, 1.0);
  vPos = vertPos;
}`

const squareShader = `
attribute vec2 vertPos;
varying vec2 vPos;

void main() {
  gl_Position =  vec4(vertPos,0.0, 1.0);
  vPos = vertPos;
}`

const squareFragShader = `
#ifdef GL_ES 
precision highp float;
#endif
varying vec2 vPos;

void main() { 
  float k = 14.0; 
  int sum = int( vPos.x * k);
  sum -= sum / 2 * 2;
  if ( sum == 0 ) {  
    if (vPos.x <= 0.0) gl_FragColor = vec4(1);
    else gl_FragColor = vec4(0, 1, 1, 1);
  } else {  
    if (vPos.x <= 0.0) gl_FragColor = vec4(0, 1, 1, 1);
    else gl_FragColor = vec4(1);
  }
}`

const cubeFragShader = `
#ifdef GL_ES 
precision highp float;
#endif
varying vec3 vPos;

void main() { 
  float k = 5.0; 
  int sum = int( vPos.x * k)+ int( vPos.y * k) + int(vPos.z * k);
  if ( (sum-(sum / 2 * 2)) == 0 ) {  
    gl_FragColor = vec4(0.8, 0.8, 0, 1);
  } else {  
    gl_FragColor = vec4(0.5, 0.0, 0, 1);
  }
}`

const fragShader = `
#ifdef GL_ES 
precision highp float;
#endif

void main() { 
  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);
}`

main()

function main() {
  // Initialize the GL context
  gl = document.getElementById("pentCanvas").getContext("webgl2")

  // Only continue if WebGL is available and working
  if (gl === null) {
    alert(
      "Unable to initialize WebGL. Your browser or machine may not support it."
    )
    return
  }

  // Set clear color to black, fully opaque
  gl.clearColor(0.0, 0.0, 0.0, 1.0)

  gl.enable(gl.DEPTH_TEST)

  gl.depthFunc(gl.LEQUAL)

  // Clear the color buffer with specified clear color
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  
  // Triangle
  initShaderProgram(pentVertShader, fragShader)
  pentPosAtrLoc = gl.getAttribLocation(shaderProgram,"vertPos")
  gl.enableVertexAttribArray(pentPosAtrLoc)
  
  initBuffers()
  gl.vertexAttribPointer(pentPosAtrLoc, 3, gl.FLOAT, false, 0, 0)
  drawScene()
  gl.drawArrays(gl.TRIANGLE_FAN, 0, 5)

  gl = document.getElementById("cubeCanvas").getContext("webgl2")
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  
  initShaderProgram(cubeVertShader, cubeFragShader)
  pentPosAtrLoc = gl.getAttribLocation(shaderProgram,"vertPos")
  gl.enableVertexAttribArray(pentPosAtrLoc)
  
  initCubeBuffers()
  gl.vertexAttribPointer(pentPosAtrLoc, 3, gl.FLOAT, false, 0, 0)
  drawScene()
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length/3)

  gl = document.getElementById("squareCanvas").getContext("webgl2")
  gl.clearColor(0.0, 0.0, 0.0, 1.0)
  gl.enable(gl.DEPTH_TEST)
  gl.depthFunc(gl.LEQUAL)
  gl.clear(gl.COLOR_BUFFER_BIT|gl.DEPTH_BUFFER_BIT)
  
  initShaderProgram(squareShader, squareFragShader)
  pentPosAtrLoc = gl.getAttribLocation(shaderProgram,"vertPos")
  gl.enableVertexAttribArray(pentPosAtrLoc)
  
  initSquareBuffers()
  gl.vertexAttribPointer(pentPosAtrLoc, 2, gl.FLOAT, false, 0, 0)
  drawScene()
  gl.drawArrays(gl.TRIANGLE_STRIP, 0, vertices.length/2)
}

// Initialize a shader program, so WebGL knows how to draw our data
function initShaderProgram(vsSource, fsSource) {
  const vertexShader = loadShader(gl.VERTEX_SHADER, vsSource)
  const fragmentShader = loadShader(gl.FRAGMENT_SHADER, fsSource)

  // Create the shader program
  shaderProgram = gl.createProgram()
  gl.attachShader(shaderProgram, vertexShader)
  gl.attachShader(shaderProgram, fragmentShader)
  gl.linkProgram(shaderProgram)

  // If creating the shader program failed, alert
  if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
    alert(`Unable to initialize the shader program: ${gl.getProgramInfoLog(
      shaderProgram)}`)
    return null
  }

  gl.useProgram(shaderProgram)
}

// creates a shader of the given type, uploads the source and compiles it.
function loadShader(type, source) {
  const shader = gl.createShader(type)

  // Send the source to the shader object
  gl.shaderSource(shader, source)

  // Compile the shader program
  gl.compileShader(shader)

  // See if it compiled successfully
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    alert(
      `An error occurred compiling the shaders: ${gl.getShaderInfoLog(shader)}`)
    gl.deleteShader(shader)
    return null
  }

  return shader
}

function initBuffers() {
  pentPosBuffer  = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, pentPosBuffer)
  vertices = [
    0.0, -0.7, 0.0,
    -0.7, 0.0, 0.0,
    -0.4, 0.7, 0.0,
    0.4, 0.7, 0.0,
    0.7, 0.0, 0.0
    ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
}

function initCubeBuffers() {
  pentPosBuffer  = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, pentPosBuffer)
  vertices = [
    -0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    0.5, -0.5, 0.5,
    0.5, -0.5, -0.5,
    0.5, 0.5, -0.5,
    -0.5, 0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, -0.5,
    -0.5, 0.5, -0.5,
    -0.5, 0.5, 0.5,
    -0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5,
    0.5, -0.5, -0.5,
    -0.5, -0.5, 0.5,
    0.5, -0.5, 0.5,
    -0.5, 0.5, 0.5,
    0.5, 0.5, 0.5,
    -0.5, 0.5, -0.5,
    0.5, 0.5, 0.5,
    0.5, 0.5, -0.5,
    ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
}

function drawScene() { 
  gl.viewport(0,0,gl.canvas.width, gl.canvas.height)
  gl.clear(gl.COLOR_BUFFER_BIT| gl.DEPTH_BUFFER_BIT)
}

function initSquareBuffers() {
  pentPosBuffer  = gl.createBuffer()
  gl.bindBuffer(gl.ARRAY_BUFFER, pentPosBuffer)
  vertices = [
    -0.7,-0.7,
    -0.7,0.7,
    0.7,-0.7,
    0.7,0.7
    ]
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
}