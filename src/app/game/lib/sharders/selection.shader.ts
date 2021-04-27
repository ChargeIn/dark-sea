export const selectionVertexShader = `
  varying vec2 vuv;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vuv = uv;
  }
`;

export const selectionFragmentShader = `
uniform float iTime;

varying vec2 vuv;

void main() {
   vec2 p = vuv - vec2(0.5, 0.5);

   float abs = 0.5 - sqrt(p.x*p.x + p.y*p.y);
   float outerAbs =  max(abs/(0.1-abs),0.);

   vec3 innerRing = vec3(1.-p.y*p.y*10.-p.x*p.x*10., 1., 1.);
   vec3 outerRing = vec3(1,-outerAbs ,-outerAbs);


     gl_FragColor = vec4(innerRing + outerRing,abs - 0.1 + outerAbs);
}
`;
