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


// 2D Random
float random (in vec2 st) {
    return fract(sin(dot(st.xy,
                         vec2(12.9898,78.233)))
                 * 43758.5453123);
}

// 2D Noise based on Morgan McGuire @morgan3d
// https://www.shadertoy.com/view/4dS3Wd
float noise (in vec2 st) {
    vec2 i = floor(st);
    vec2 f = fract(st);

    // Four corners in 2D of a tile
    float a = random(i);
    float b = random(i + vec2(1.0, 0.0));
    float c = random(i + vec2(0.0, 1.0));
    float d = random(i + vec2(1.0, 1.0));

    // Smooth Interpolation

    // Cubic Hermine Curve.  Same as SmoothStep()
    vec2 u = f*f*(3.0-2.0*f);
    // u = smoothstep(0.,1.,f);

    // Mix 4 coorners percentages
    return mix(a, b, u.x) +
            (c - a)* u.y * (1.0 - u.x) +
            (d - b) * u.x * u.y;
}


void main()
{
    vec2 uv = vuv - vec2(0.5, 0);


    float vertical = 0.8-sin(uv.x*uv.x*8.) -uv.y/2.*uv.y ;
    float horizontal = 1.-sin(abs(uv.y*uv.y - 0.1 + fract(iTime/4.)));

    // Scale the coordinate system to see
    // some noise in action
    vec2 pos = vec2(vuv*100.);

    // Use the noise function
    float n = noise(pos);

    gl_FragColor = vec4(1.-n, 0., 0.,vertical*horizontal);     // Output to screen
}
`;
