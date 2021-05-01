export const fireVertexShader = `
  varying vec2 vuv;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vuv = uv;
  }
`;

export const fireFragmentShader = `
uniform float iTime;

varying vec2 vuv;

// Taken from https://www.shadertoy.com/view/4ts3z2
float tri(in float x){return abs(fract(x)-.5);}
vec3 tri3(in vec3 p){return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));}


// Taken from https://www.shadertoy.com/view/4ts3z2
float triNoise3D(in vec3 p, in float spd)
{
  float z=1.4;
  float rz = 0.;
  vec3 bp = p;
  for (float i=0.; i<=3.; i++ )
  {
      vec3 dg = tri3(bp*2.);
      p += (dg+iTime*.1*spd);

      bp *= 1.8;
      z *= 1.5;
      p *= 1.2;
      //p.xz*= m2;

      rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;
      bp += 0.14;
  }
  return rz;
}


vec3 hsv(float h, float s, float v)
{
  return mix( vec3( 1.0 ), clamp( ( abs( fract(
    h + vec3( 3.0, 2.0, 1.0 ) / 3.0 ) * 6.0 - 3.0 ) - 1.0 ), 0.0, 1.0 ), s ) * v;
}

void main()
{
  vec2 uv = vuv - vec2(0.5, 0);

  float fadeLR = .5 - abs(vuv.x - .5) ;
  float fadeTB = 1.-vuv.y;
  vec3 pos = vec3( vuv * vec2( 3. , 1.) - vec2( 0. , iTime * .03 ) , 1. );
  float n  = pow((fadeLR * fadeTB) , 1. ) * .4 * triNoise3D( pos , .4 );
  n  += pow((fadeLR * fadeTB) , 2. ) * triNoise3D( pos  * .2, .4 );


  vec3 col = hsv( n * 1.4 + .9 , .6 , .9 );

  vec3 color = col * pow( n , 2. ) * 400.;
  gl_FragColor =  vec4( color  , color.x + color.y + color.z);
}
`;
