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

#define PRACTICLES_COUNT 23.

vec2 Hash12(float t)
{
    float x = fract( sin(t* 674.3) * 453.2);
    float y = fract( sin( (t + x) * 714.3) * 263.2);

    return vec2(x,y);

}

vec2 Hash12Polar(float t)
{
    float a = fract( sin(t* 674.3) * 453.2) * 6.2832; // * 2 PI
    float d = fract( sin( (t + a) * 714.3) * 263.2);

    return vec2(sin(a),cos(a))*d;

}

void main()
{
    vec2 uv = vuv - vec2(0.5, 0.5);

    vec3 col = vec3(0);
    vec3 color = sin(vec3(.34,.54,.43) *floor(iTime+32.0)* .5 + .5); // r = 12, g = 25, b = 32
    float t = iTime;
    for( float i =0.0; i < PRACTICLES_COUNT; i++)
    {
        vec2 dir = Hash12Polar(i + 1.0)*0.5;

        float d = length(uv*10.0 - dir* t);

        float brightness = mix( 0.005, .0001, smoothstep(0.05, 0.0, t) );
        brightness *= sin(t*20.0 + i)* .5 +.5;
        brightness*= smoothstep(1.,.5,t);
        col += brightness/d * color;
    }

    gl_FragColor = vec4(col,(col.x + col.y + col.z)-0.1);     // Output to screen
}
`;
