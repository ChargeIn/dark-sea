//    //     makePoint(x,y,3.7,0.3,0.3,0.3,iTime);
//    // c=c+makePoint(x,y,1.9,1.3,0.4,0.4,iTime);
//    // c=c+makePoint(x,y,0.8,0.9,0.4,0.5,iTime);
//    // c=c+makePoint(x,y,1.2,1.7,0.6,0.3,iTime);
//    // c=c+makePoint(x,y,0.3,0.6,0.5,0.4,iTime);
//    // c=c+makePoint(x,y,0.3,0.3,0.4,0.4,iTime);
//    // c=c+makePoint(x,y,1.4,0.8,0.4,0.5,iTime);
//    // c=c+makePoint(x,y,0.2,0.6,0.6,0.3,iTime);
//    // c=c+makePoint(x,y,1.3,0.5,0.5,0.4,iTime);
//   // a=a+makePoint(x,y,0.8,1.7,0.5,0.4,iTime);
//    // a=a+makePoint(x,y,0.3,1.0,0.4,0.4,iTime);
//    // a=a+makePoint(x,y,1.4,1.7,0.4,0.5,iTime);
//    // a=a+makePoint(x,y,1.3,2.1,0.6,0.3,iTime);
//    // a=a+makePoint(x,y,1.8,1.7,0.5,0.4,iTime);
//   //     makePoint(x,y,1.2,1.9,0.3,0.3,iTime);
//    // b=b+makePoint(x,y,0.7,2.7,0.4,0.4,iTime);
//    // b=b+makePoint(x,y,1.4,0.6,0.4,0.5,iTime);
//    // b=b+makePoint(x,y,2.6,0.4,0.6,0.3,iTime);
//    // b=b+makePoint(x,y,0.7,1.4,0.5,0.4,iTime);
//    // b=b+makePoint(x,y,0.7,1.7,0.4,0.4,iTime);
//    // b=b+makePoint(x,y,0.8,0.5,0.4,0.5,iTime);
//    // b=b+makePoint(x,y,1.4,0.9,0.6,0.3,iTime);
//    // b=b+makePoint(x,y,0.7,1.3,0.5,0.4,iTime);

export const gliziVertexShader = `
  varying vec2 vuv;

  void main() {
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    vuv = uv;
  }
`;

export const gliziFragmentShader = `
uniform float iTime;

varying vec2 vuv;

// Blobs by @paulofalcao (toy shaders)

float makePoint(float x,float y,float fx,float fy,float sx,float sy,float t){
   float xx=x+sin(t*fx)/2.*sx;
   float yy=y+cos(t*fy)/1.5*sy;
   return 1.5/(xx*xx+yy*yy);
}

void main() {
   vec2 p= vuv - vec2(0.5, 0.5);

   p=p*2.0;

   float x=p.x;
   float y=p.y;

   float a=
   makePoint(x,y,1.9,2.0,0.4,0.4,iTime)/4.;
   a=a+makePoint(x,y,0.8,0.7,0.4,0.5,iTime);
   a=a+makePoint(x,y,2.3,0.1,0.6,0.3,iTime);


   float b=
   makePoint(x,y,1.9,2.0,0.4,0.4,iTime);
   b=b+makePoint(x,y,0.8,0.7,0.4,0.5,iTime)/4.;
   b=b+makePoint(x,y,2.3,0.1,0.6,0.3,iTime);

   float c=
   makePoint(x,y,1.9,2.0,0.4,0.4,iTime);
   c=c+makePoint(x,y,0.8,0.7,0.4,0.5,iTime);
   c=c+makePoint(x,y,2.3,0.1,0.6,0.3,iTime)/4.;


   vec3 d=vec3(a,b,c)/32.0;

    float brightness =(d.x+d.y+d.z)/10.0;
    brightness = brightness > 0.1 ? brightness : 0.;
   gl_FragColor = vec4(d.x,d.y,d.z,brightness);
}
`;
