// cool expl:  https://www.shadertoy.com/view/MdfGRX

export const explosionVertexShader = `
  varying vec2 vuv;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vuv = uv;
  }
`;

export const explosionFragmentShader = `
uniform float iTime;

varying vec2 vuv;

void main()
{
    vec2 uv = vuv - vec2(0.5, 0);


    float middle = 1.-sin(uv.x*uv.x*8.);
    float top = 1.-sin(abs(uv.y - 0.1 + fract(iTime/4.)));

    gl_FragColor = vec4(1,0,0,middle*top);     // Output to screen
}
`;
