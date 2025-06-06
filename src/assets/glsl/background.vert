varying vec4 worldPos;
varying vec3 sculptureCenter;

void main() {
  // Set the position of the vertex in object space
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  // Calculate the world position of the vertex
  worldPos = modelMatrix * vec4(position, 1.0);
  sculptureCenter = (modelMatrix * vec4(0.0, 0.9, 0.0, 1.0)).xyz;
  // Set the position of the vertex in clip space
  gl_Position = projectionMatrix * mvPosition;
}
