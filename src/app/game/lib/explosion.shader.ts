export const explosionFragmentShader = '/* Explosion\n' +
  '\n' +
  'Created by Roman Komary 2014-2015\n' +
  'License Creative Commons Attribution-NonCommercial-ShareAlike 3.0 Unported License http://creativecommons.org/licenses/by-nc-sa/3.0/deed.en_US\n' +
  '\n' +
  'Based on huwb\'s Anatomy of an explosion https://www.shadertoy.com/view/Xss3DS\n' +
  'and on iq\'s Hell https://www.shadertoy.com/view/MdfGRX\n' +
  '\n' +
  'The background fun parts base on clouds of nimitz\'s Xyptonjtroz https://www.shadertoy.com/view/4ts3z2\n' +
  'and on bjarkeck\'s Simple star field https://www.shadertoy.com/view/lsc3z4\n' +
  '\n' +
  '\n' +
  'Nice to play with: MAX_MULT_EXPLOSIONS, SHOW_BOUNDS, LOW_Q, WITH_FUN, ALTERNATE_MOUSE\n' +
  '\n' +
  'If you are on a mobile device, switch on LOW_Q to 1, set steps to about 25,\n' +
  'MAX_MULT_EXPLOSIONS to 3. This should give acceptable results. (see also SHADERTOY_APP)\n' +
  '\n' +
  '\n' +
  'Many thanks to huwb and his Anatomy of an explosion shader, I got a great start for an explosion effect\n' +
  'that I was desiring so much.\n' +
  '\n' +
  'Extending it over time though did not result in a believable explosion effect. It looks like\n' +
  'a still cloud with more parts appearing instead of a moving, growing explosion.\n' +
  '\n' +
  'As a start, I just made a growing sphere that eats up the density from inside.\n' +
  '(The introductory "den" calculation in densityFn with ballness, growth and fade).\n' +
  'It looks nice for the fading-away of an explosion, but it is not enough yet.\n' +
  '\n' +
  'Many thanks to iq and his mathematical frameworks which brought so many shaders to live and\n' +
  'revealed the beauty of mathematics.\n' +
  '\n' +
  'It\'s especially his beautiful Hell shader (one of my favourites) and his idea of space inversion\n' +
  'which gave me the final idea for the explosion effect.\n' +
  'The space inversion actually converts a directional moving cloud space into a growing cloud effect.\n' +
  '\n' +
  'It is the nature of this effect that it grows on one end but shrinks in on the opposite.\n' +
  'To compensate on that, I could only realize composing multiple explosion balls like such to hide the\n' +
  'shrinking-in hemispheres as much as possible.\n' +
  '\n' +
  'Unfortunately, I only found a way to superpose these balls by having them independently\n' +
  'merged in color. That is, their animations do not interfere with each other, which is absolutely not\n' +
  'a realistic effect. It is not even a physical approximation.\n' +
  'Not that there would be anything in this shader near physical correctness, but it can be seen\n' +
  'that the balls are independent.\n' +
  '\n' +
  'I tried to fiddle with space inversion and cloud movements in multiple directions at once (instead of just one)\n' +
  'on just one explosion ball. It would melt the explosion to one cloud peace instead of being multiple independent\n' +
  'balls, but it always built up undesirable seams and stretched parts of the cloud which makes\n' +
  'the explosion not be an explosion at all anymore.\n' +
  '(Although it looks quite fancy on its own which goes in the direction of a bent sun bursts similar effect).\n' +
  '\n' +
  'Another disadvantage with the multiple balls is the need to sample noise space for each ball\n' +
  'separately, which eats up speed power rather quickly.\n' +
  'But I could not find a way around that.\n' +
  '\n' +
  'The fog I did add just for fun. I like this algorithm so much. It just needs a hand full of iterations\n' +
  'and yet the effect looks convincing even with a moving and rotating camera without any jumps or glitches.\n' +
  'Thanks to nimitz and his Xyptonjtroz shader (https://www.shadertoy.com/view/4ts3z2).\n' +
  '\n' +
  'Out of lazyness and for the reason that the main purpose of this shader is just the explosion,\n' +
  'I draw the explosion over the fog, always, no matter if fog layers actually should be before the explosion.\n' +
  '\n' +
  'I would have liked the explosion effect to suffice on just such a small number of iterations.\n' +
  '\n' +
  'But well, the explosion looks relatively believable and I still like to look at it,\n' +
  'so I am not unsatisfied.\n' +
  '\n' +
  'I also added the stars just for fun because I like bjarkeck\'s simple algorithm with the so believable result.\n' +
  '\n' +
  'And when playing around with night scenery setting, I discovered this great look of corridor light\n' +
  'by accident, so I had to keep it. :-) Just have a look on the nice shine the corridor light spreads a bit\n' +
  'around the top of the big columns and near the stairs. Pure luck.\n' +
  '*/\n' +
  '\n' +

  'uniform vec3      iResolution;           // viewport resolution (in pixels)\n' +
  'uniform float     iTime;                 // shader playback time (in seconds)\n' +
  'uniform float     iTimeDelta;            // render time (in seconds)\n' +
  'uniform int       iFrame;                // shader playback frame\n' +
  'uniform vec4      iMouse;                // mouse pixel coords. xy: current (if MLB down), zw: click\n' +
  'uniform samplerCube iChannel0;          // input channel. XX = 2D/Cube\n' +
  'uniform samplerCube iChannel1;          // input channel. XX = 2D/Cube\n' +
  'uniform samplerCube iChannel2;          // input channel. XX = 2D/Cube\n' +
  'uniform samplerCube iChannel3;          // input channel. XX = 2D/Cube\n' +
  'uniform vec4      iDate;                 // (year, month, day, time in seconds)\n' +
  'uniform float     iSampleRate;           // sound sample rate (i.e., 44100)' +
  '\n' +
  '\n' +
  '\n' +
  '// Define this if you use this shader in the Shadertoy app for mobile devices (Android).\n' +
  '// It reduces quality and adopts a few other settings to make it look quite fluent on a mobile.\n' +
  '//#define SHADERTOY_APP\n' +
  '\n' +
  '// In calcDens(), description mentions a bug which appeared with the old coloring.\n' +
  '//#define OLD_COLORING\n' +
  '\n' +
  '// if not defined, mouse y will move camera\n' +
  '// if defined, mouse y will override animation time stamp\n' +
  '//#define ALTERNATE_MOUSE\n' +
  '\n' +
  '// for (slight) speed improvement, use low quality fbm and noise and compensate with some settings adjustments\n' +
  '// if not defined, high quality\n' +
  '// if 1, medium quality. acceptable.\n' +
  '// if 2, low quality. not acceptable anymore.\n' +
  '// Notice, 1 and 2 have approximately the same speed when putting also the compensation adjustments. But compared to high quality, they are indeed faster.\n' +
  '//#define LOW_Q 1\n' +
  '\n' +
  '// some approximation to show the inner and outer bounds of the volumes. the y center plane is removed (transparent)\n' +
  '// to give a better look and feel on the inside.\n' +
  '//#define SHOW_BOUNDS\n' +
  '\n' +
  '// Disable this if you want purely procedural noise instead of using a lookup texture.\n' +
  '// The procedural is a bit slower but useful if you do not have easy access to textures.\n' +
  '#define NOISE_LUT\n' +
  '\n' +
  '#define CAM_ROTATION_SPEED 11.7\n' +
  '#define CAM_TILT .15\t\t\t\t// put 0. if you do not want to animate camera vertically\n' +
  '#define CAM_DIST 3.8\n' +
  '\n' +
  '#define MAX_MULT_EXPLOSIONS 5\n' +
  '\n' +
  '#ifdef SHADERTOY_APP\n' +
  '\t// lower noise quality\n' +
  '\t#undef LOW_Q\n' +
  '\t#define LOW_Q 1\n' +
  '\t// further distance from camera\n' +
  '\t#undef CAM_DIST\n' +
  '\t#define CAM_DIST 13.0\n' +
  '\t// fog and stars are still nice to see, especially without a cube texture background, so keep them up if you like\n' +
  '\t//\n' +
  '\t// Shadertoy app does not easily support noise texture, or I was not able to do it right, so we switch to purely procedural noise.\n' +
  '\t#undef NOISE_LUT\n' +
  '\t// faster camera rotation around the explosion\n' +
  '\t#undef CAM_ROTATION_SPEED\n' +
  '\t#define CAM_ROTATION_SPEED 70.\n' +
  '\t// less explosions to increase speed\n' +
  '\t#undef MAX_MULT_EXPLOSIONS\n' +
  '\t#define MAX_MULT_EXPLOSIONS 4\n' +
  '\n' +
  '\tprecision mediump float;\n' +
  '\t\n' +
  '\t// time in ms\n' +
  '\tuniform float time;\n' +
  '\t\n' +
  '\t// touch position in pixels\n' +
  '\t//uniform vec2 touch;\n' +
  '\t\n' +
  '\t// resolution in pixels\n' +
  '\tuniform vec2 resolution;\n' +
  '\t\n' +
  '\t// linear acceleration vector in m/s^2\n' +
  '\t//uniform vec3 linear;\n' +
  '\t\n' +
  '\t// gravity vector in m/s^2\n' +
  '\t//uniform vec3 gravity;\n' +
  '\t\n' +
  '\t// device rotation on the x, y and z axis\n' +
  '\t//uniform vec3 rotation;\n' +
  '\t\n' +
  '\t// battery level from 0.0 to 1.0\n' +
  '\t//uniform float battery\n' +
  '\t\n' +
  '\t// wallpaper offset from 0.0 to 1.0\n' +
  '\t//uniform vec2 offset;\n' +
  '\t\n' +
  '\t// previous frame, i.e. texture( backbuffer, uv ).rgb\n' +
  '\t//uniform sampler2D backbuffer;\n' +
  '\t\n' +
  '\t//uniform sampler2D sNoiseTexture;\n' +
  '\t\n' +
  '\tuniform sampler2D sTexture;\n' +
  '\t\n' +
  '\t#define iResolution resolution\n' +
  '\t#define iTime time\n' +
  '#endif\n' +
  '\n' +
  '// the bounding sphere of the explosion. this is less general but means that\n' +
  '// ray cast is only performed for nearby pixels, and raycast can begin from the sphere\n' +
  '// (instead of walking out from the camera)\n' +
  'float expRadius = 1.75;\n' +
  'float explosion_seed = 0.0;\t\t\t// keep this constant for a whole explosion, but when differing from explosion to the next one, you get non-identical looking ones\n' +
  'float downscale = 1.25;\t\t\t\t// how much smaller (than expRadius) one explosion ball should be. bigger value = smaller. 1.0 = no scale down.\n' +
  '#ifndef SHADERTOY_APP\n' +
  'const int steps = 64;\t\t\t\t// iterations when marching through cloud noise. default = 64. 40 might still suffice. When putting higher, explosion becomes too dense, so make colBottom and colTop more transparent.\n' +
  '#else\n' +
  'const int steps = 25;\n' +
  '#endif\n' +
  'float grain = 2.0;\t\t\t\t\t// increase for more detailed explosions, but then you should also increase iterations (and decrease step, which is done automatically)\n' +
  'float speed = 0.3;\t\t\t\t\t// total animation speed (time stretch). nice = 0.5, default = 0.4\n' +
  'float ballness = 2.0;\t\t\t\t// lower values makes explosion look more like a cloud. higher values more like a ball.\n' +
  'float growth = 2.2;\t\t\t\t\t// initial growth to explosion ball. lower values makes explosion grow faster\n' +
  'float fade = 1.6;\t\t\t\t\t// greater values make fade go faster but later. Thus greater values leave more smoke at the end.\n' +
  'float thinout_smooth = 0.7;\t\t\t// smoothed thinning out of the outer bounding sphere. 1.0 = no smoothening, 0.0 = heavy thinning, nice = 0.65 to 0.75\n' +
  'float density = 1.35;\t\t\t\t// higher values make sharper difference between dark and bright colors. low values make more blurry, less color spread and more transparent. default = 1.25 or 1.35\n' +
  'vec2 brightness = vec2(3.0, 2.2);\t// x = constant offset, y = time-dependent factor\n' +
  'vec2 brightrad = vec2(1.3, 1.0);\t// adds some variation to the radius of the brightness falloff. x = constant offset, y = density-dependent factor\n' +
  'vec4 colBottom = vec4(1.2,0.94,0.42,0.7);\n' +
  'vec4 colTop = vec4(0.15,0.15,0.15,0.1);\n' +
  'float color_low = 0.25;\t\t\t\t// the lower the value, the more black spots appear in the explosion. the higher, the more even the explosion looks like.\n' +
  'float contrast = 1.0;\t\t\t\t// final color contrast. higher values make ligher contrast. default = 1.0\n' +
  'float rolling_init_damp = 0.3;\t\t// rolling animation initial damping. 0.0 = no damping. nice = 0.2, default = 0.15\n' +
  'float rolling_speed = 2.0;\t\t\t// rolling animation speed (static over time). default = 1.0\n' +
  'const int mult_explosions = MAX_MULT_EXPLOSIONS;\t// how many explosion balls to draw\n' +
  'float variation_seed = 0.0;\t\t\t// influences position variation of the different explosion balls\n' +
  'float delay_seed = 0.0;\t\t\t\t// influences the start delay variation of the different explosion balls\n' +
  'const float delay_range = 0.25;\t\t\t// describes the maximum delay for explosion balls to start up. Notice, this delay is relative to one explosion ball duration, so actually before speed is applied.\n' +
  'float ball_spread = 1.0;\t\t\t// how much to spread ball starting positions from the up vector. 0.0 = all on up vector, 1.0 = any direction between up and down vector.\n' +
  '\n' +
  '/* for up-moving explosion similar to explosion mushroom, put\n' +
  '\tdownscale = 1.75;\n' +
  '\tgrain = 2.7;\n' +
  '\trolling_init_damp = 0.2;\n' +
  '\tball_spread = 0.4;\n' +
  '*/\n' +
  '\n' +
  '/* for mobile device, for faster rendering but with less quality, put\n' +
  '\tLOW_Q 1\n' +
  '\tturn off FOG\n' +
  '\tMAX_MULT_EXPLOSIONS 3\n' +
  '\tsteps = 25;\n' +
  '*/\n' +
  '\n' +
  '// Now come some fun effects which have nothing to do with the explosion effect.\n' +
  '// You can switch them all off completely by commenting WITH_FUN.\n' +
  '#define WITH_FUN\n' +
  '\t// The fog is just for fun and has nothing to do with the explosion.\n' +
  '\t#define FOG\n' +
  '\t// Same with the stars. Just for fun.\n' +
  '\t#define STARS\n' +
  '    \t#define STARDISTANCE 250.\n' +
  '    \t#define STARBRIGHTNESS 0.3\n' +
  '    \t#define STARDENCITY 0.05\n' +
  '\t// Night scenery settings, again just for fun.\n' +
  '\t#define DAY_NIGHT_CYCLE_TIME 20.\n' +
  '\t#define NIGHT_COLORING vec3(.92,.95,1.)\n' +
  '\t#define CORRIDOR_LIGHT vec3(1.,1.,.9)\n' +
  '\t#define ENLIGHTEN_PASSAGE .75\n' +
  '\t// explosion enlightening the floor (faked)\n' +
  '\t#define FLOOR_LIGHT_STRENGTH 1.\n' +
  '\n' +
  '\n' +
  '\n' +
  'struct Ball\n' +
  '{\n' +
  '\tvec3 offset;\n' +
  '    vec3 dir;\n' +
  '    float delay;\n' +
  '};\n' +
  '\n' +
  'Ball balls[MAX_MULT_EXPLOSIONS];\n' +
  '\n' +
  'float tmax = 1.0 + delay_range;\n' +
  'float getTime()\n' +
  '{\n' +
  '#if defined (ALTERNATE_MOUSE) && !defined (SHADERTOY_APP)\n' +
  '\tif( iMouse.z > 0.0 ) return iMouse.y/iResolution.y*tmax;\n' +
  '#endif\n' +
  '\treturn fract(iTime * speed / tmax) * tmax;\n' +
  '}\n' +
  '\n' +
  'const float pi=3.14159265;\n' +
  '\n' +
  'float hash( float n )\n' +
  '{\n' +
  '\treturn fract(cos(n)*41415.92653);\t//https://www.shadertoy.com/view/4sXGRM\n' +
  '    //return fract(sin(n)*753.5453123);\t//https://www.shadertoy.com/view/4sfGzS\n' +
  '}\n' +
  '\n' +
  'vec2 hash2( float n )\n' +
  '{\n' +
  '    //return fract(cos(n)*vec2(10003.579, 37049.7));\t//https://www.shadertoy.com/view/XtsSWs\n' +
  '    return fract(sin(vec2(n,n+1.0))*vec2(13.5453123,31.1459123));\n' +
  '}\n' +
  '\n' +
  'vec3 hash3( float n )\n' +
  '{\n' +
  '    return fract(sin(vec3(n,n+1.0,n+2.0))*vec3(13.5453123,31.1459123,37.3490423));\n' +
  '}\n' +
  '\n' +
  'float hash13(vec3 p3)\n' +
  '{\n' +
  '\tp3  = fract(p3 * vec3(.1031,.11369,.13787));\n' +
  '    p3 += dot(p3, p3.yzx + 19.19);\n' +
  '    return fract((p3.x + p3.y) * p3.z);\n' +
  '}\n' +
  '\n' +
  '#ifdef NOISE_LUT\n' +
  '//iq\'s LUT 3D noise\n' +
  'float noise( in vec3 x )\n' +
  '{\n' +
  '    vec3 f = fract(x);\n' +
  '    vec3 p = x - f; // this avoids the floor() but doesnt affect performance for me.\n' +
  '#ifndef LOW_Q\t\t// in low quality setting, for speed, we try to live without that. we compensate with growth and fade.\n' +
  '    f = f*f*(3.0-2.0*f);\n' +
  '#endif\n' +
  '     \n' +
  '    vec2 uv = (p.xy+vec2(37.0,17.0)*p.z) + f.xy;\n' +
  '#ifndef SHADERTOY_APP\n' +
  '    vec2 rg = textureLod( iChannel0, (uv+ 0.5)/256.0, 0.0 ).yx;\n' +
  '#else\n' +
  '    vec2 rg = texture( iChannel0, (uv+ 0.5)/256.0 ).yx;\n' +
  '#endif\n' +
  '    return mix( rg.x, rg.y, f.z );\n' +
  '}\n' +
  '#else\n' +
  '\n' +
  'float noise( in vec3 x )\n' +
  '{\n' +
  '    vec3 f = fract(x);\n' +
  '    vec3 p = x - f; // this avoids the floor() but doesnt affect performance for me.\n' +
  '#ifndef LOW_Q\t\t// in low quality setting, for speed, we try to live without that. we compensate with growth and fade.\n' +
  '    f = f*f*(3.0-2.0*f);\n' +
  '#endif\n' +
  '\t\n' +
  '    float n = p.x + p.y*157.0 + 113.0*p.z;\n' +
  '    return mix(mix(mix( hash(n+  0.0), hash(n+  1.0),f.x),\n' +
  '                   mix( hash(n+157.0), hash(n+158.0),f.x),f.y),\n' +
  '               mix(mix( hash(n+113.0), hash(n+114.0),f.x),\n' +
  '                   mix( hash(n+270.0), hash(n+271.0),f.x),f.y),f.z);\n' +
  '}\n' +
  '#endif\n' +
  '\n' +
  'float fbm( vec3 p, vec3 dir )\n' +
  '{\n' +
  '    float f;\n' +
  '#ifndef LOW_Q\n' +
  '    vec3 q = p - dir; f  = 0.50000*noise( q );\n' +
  '\tq = q*2.02 - dir; f += 0.25000*noise( q );\n' +
  '\tq = q*2.03 - dir; f += 0.12500*noise( q );\n' +
  '\tq = q*2.01 - dir; f += 0.06250*noise( q );\n' +
  '\tq = q*2.02 - dir; f += 0.03125*noise( q );\n' +
  '#elif LOW_Q == 1\n' +
  '    // in low quality setting, for speed, we try to live with a lower-quality fbm. we compensate with higher grain.\n' +
  '    vec3 q = p - dir; f  = 0.50000*noise( q );\n' +
  '\tq = q*2.02 - dir; f += 0.25000*noise( q );\n' +
  '\tq = q*2.03 - dir; f += 0.12500*noise( q );\n' +
  '\tq = q*2.04 - dir; f += 0.08250*noise( q );\n' +
  '#elif LOW_Q == 2\n' +
  '    vec3 q = p - dir; f  = 0.50000*noise( q );\n' +
  '\tq = q*2.14 - dir; f += 0.29000*noise( q );\n' +
  '\tq = q*2.25 - dir; f += 0.16500*noise( q );\n' +
  '#endif\n' +
  '\treturn f;\n' +
  '}\n' +
  '\n' +
  '\n' +
  'float tri(in float x){return abs(fract(x)-.5);}\n' +
  'vec3 tri3(in vec3 p){return vec3( tri(p.z+tri(p.y*1.)), tri(p.z+tri(p.x*1.)), tri(p.y+tri(p.x*1.)));}\n' +
  '\n' +
  'float triNoise3d(in vec3 p, in float spd, float ti)\n' +
  '{\n' +
  '    float z=1.1;\n' +
  '\tfloat rz = 0.;\n' +
  '    vec3 bp = p*1.5;\n' +
  '\tfor (float i=0.; i<=3.; i++ )\n' +
  '\t{\n' +
  '        vec3 dg = tri3(bp);\n' +
  '        p += (dg+spd);\n' +
  '        bp *= 1.9;\n' +
  '\t\tz *= 1.5;\n' +
  '\t\tp *= 1.3;\n' +
  '        \n' +
  '        rz+= (tri(p.z+tri(p.x+tri(p.y))))/z;\n' +
  '        bp += 0.14;\n' +
  '\t}\n' +
  '\treturn rz;\n' +
  '}\n' +
  '\n' +
  'float fogmap(in vec3 p, in float d, float ti)\n' +
  '{\n' +
  '    p.x *= .4;\n' +
  '    p.x += ti*1.5;\n' +
  '    p.z += sin(p.x*.5);\n' +
  '    p.z *= .4;\n' +
  '    return max(triNoise3d(p*.3/(d+20.),0.2, ti)-.4, 0.)*(smoothstep(0.,25.,p.y));\n' +
  '    //return triNoise3d(p*1.2/(d+20.),0.2, ti)*(1.25-smoothstep(0.,25.,p.y));\n' +
  '}\n' +
  '// Thanks to nimitz for the fast fog/clouds idea...\n' +
  '// https://www.shadertoy.com/view/4ts3z2\n' +
  'vec3 clouds(in vec3 col, in vec3 ro, in vec3 rd, in float mt, float ti, in vec3 cloudcolor)\n' +
  '{\n' +
  '    float d = 1.5;\t//.5\n' +
  '    for(int i=0; i<7; i++)\n' +
  '    {\n' +
  '        if (d>mt)break;\n' +
  '        vec3  pos = ro + rd*d;\n' +
  '        float rz = fogmap(pos, d, ti);\n' +
  '\t\t//float grd =  clamp((rz - fogmap(pos+.8-float(i)*0.1,d, ti))*3., 0.1, 1. );\n' +
  '        //vec3 cloudcolor = (vec3(.1,0.8,.5)*.5 + .5*vec3(.5, .8, 1.)*(1.7-grd))*0.55;\n' +
  '        //vec3 cloudcolor = (2.*vec3(.4,0.4,.4) + .5*vec3(.5)*(1.7-grd))*0.55;\n' +
  '        //vec3 cloudcolor = 2.*(vec3(.4,0.4,.4));\n' +
  '        col = mix(col,cloudcolor,clamp(rz*smoothstep(d-0.4,2.+d*1.75,mt),0.,1.) );\n' +
  '        //col = mix(col,cloudcolor,clamp(rz*smoothstep(d,d*1.86,mt),0.,1.) );\n' +
  '        d *= 1.5+0.3;\n' +
  '    }\n' +
  '    return col;\n' +
  '\n' +
  '}\n' +
  '\n' +
  '\n' +
  '// Thanks to bjarkeck for the fast star field implementation...\n' +
  '// https://www.shadertoy.com/view/lsc3z4\n' +
  'float stars(vec3 ray)\n' +
  '{\n' +
  '    vec3 p = ray * STARDISTANCE;\n' +
  '    float brigtness = smoothstep(1.0 - STARDENCITY, 1.0, hash13(floor(p)));\n' +
  '    return smoothstep(STARBRIGHTNESS, 0., length(fract(p) - 0.5)) * brigtness;\n' +
  '}\n' +
  '\n' +
  '\n' +
  '// assign colour to the media\n' +
  'vec4 computeColour( float density, float radius, float bright )\n' +
  '{\n' +
  '\t// colour based on density alone. gives impression of occlusion within\n' +
  '\t// the media\n' +
  '\t//vec4 result = vec4( mix( vec3(1.0,0.9,0.8), vec3(.7,0.3,0.2), density ), density );\n' +
  '\t//vec4 result = vec4( mix( vec3(1.0,0.9,0.8), vec3(0.4,0.15,0.1), density ), density );\n' +
  '\tvec4 result = vec4( vec3(mix( 1.0, color_low, density )), density );\n' +
  '    //vec4 result = vec4( mix( 1.1*vec3(1.0,0.9,0.8), 0.9*vec3(0.4,0.15,0.1), density ), density );\n' +
  '    //vec4 result = vec4(1.,1.,1.,density);\n' +
  '\n' +
  '\t\n' +
  '\t// colour added for explosion\n' +
  '    //result *= mix( colBottom * bright, colTop * bright, min( (radius+0.5)*0.588, 1.0 ) );\n' +
  '\tresult *= mix( colBottom, colTop, min( (radius+0.5)*0.588, 1.0 ) ) * bright;\n' +
  '    //result *= mix( colBottom, colTop, radius ) * bright;\n' +
  '\t//result.rgb *= mix( colBottom * bright, colTop, smoothstep( 0., 1., (radius-0.5)*0.6+0.5 ) );\n' +
  '\t//result *= mix( colBottom * bright, colTop, clamp( radius * 1.7-.2, 0.0, 1.0 ) );\n' +
  '    //result.a*=density*1.5;\n' +
  '\t//result.a *= mix( 1.0, 0.0, min( (radius / expRadius + 0.2)*0.5, 1.0 ) );\n' +
  '    //result.a *= mix( 1.0, 0.2, min( (radius+0.5)/1.7, 1.0 ) );\n' +
  '\t//result.a *= mix( 0.0, 1.0, 1.0-radius*0.25 );\n' +
  '\t//if(radius<1.0-mouseY) result.a=0.0;\n' +
  '\t// make central hole\n' +
  '\t//result.a *= clamp((radius/expRadius-0.5*mouseIn)*15.0, 0.0, 1.0);\n' +
  '\t//result.xyz *= mix( 3.1*vec3(1.0,0.5,0.05), vec3(0.48,0.53,0.5), min( radius*.76, 1.0 ) );\n' +
  '\t\n' +
  '    //result = mix( colBottom * bright * vec4(1.0,0.9,0.8,1.0), colTop*vec4(0.4,0.15,0.1,1.0), min( (radius+0.5)/1.7, 1.0 ) );\n' +
  '    //result.a *= density;\n' +
  '    \n' +
  '\treturn result;\n' +
  '}\n' +
  '\n' +
  '// maps 3d position to density\n' +
  'float densityFn( in vec3 p, in float r, float t, in vec3 dir, float seed )\n' +
  '{\n' +
  '    //const float pi = 3.1415926;\n' +
  '\tfloat den = ballness + (growth+ballness)*log(t)*r;\n' +
  '    den -= (2.5+ballness)*pow(t,fade)/r;\n' +
  '    //den = -1.7 - p.y;\n' +
  '\t//den *= 1.+smoothstep(0.75,1.,r);\n' +
  '    \n' +
  '    //if ( den <= -4. || den > -1. ) return -1.;\n' +
  '    //if ( den <= -2.8 ) return -1.;\n' +
  '    if ( den <= -3. ) return -1.;\n' +
  '    //if ( den > -1. ) return -1.;\n' +
  '    \n' +
  '#ifdef SHOW_BOUNDS\n' +
  '    p = 0.5 * normalize(p);\n' +
  '    return abs(p.y);\n' +
  '    //return 0.8;\n' +
  '#endif\n' +
  '    \n' +
  '\t// offset noise based on seed\n' +
  '\t// plus a time based offset for the rolling effect (together with the space inversion below)\n' +
  '    //float s = seed-(rolling_speed/(t+rolling_init_damp));\n' +
  '    float s = seed-(rolling_speed/(sin(min(t*3.,1.57))+rolling_init_damp));\n' +
  '\t//if( iMouse.z > 0.0 ) t += iMouse.y * 0.02;\n' +
  '    //vec3 dir = vec3(0.,1.,0.);\n' +
  '\t//vec3 dir = -0.5*(p - expCenter);\n' +
  '    //vec3 dir = normalize( vec3( noise(p.xyz), noise(p.yxz), noise(p.zyx) ) );\n' +
  '    dir *= s;\n' +
  '\n' +
  '    // invert space\n' +
  '    p = -grain*p/(dot(p,p)*downscale);\n' +
  '\n' +
  '    // participating media\n' +
  '    float f = fbm( p, dir );\n' +
  '    //f=clamp(f,.1,.7);\n' +
  '\t\n' +
  '\t// add in noise with scale factor\n' +
  '\tden += 4.0*f;\n' +
  '    //den -= r*r;\n' +
  '\t\n' +
  '\t//den *= density;\t// we do that outside\n' +
  '\t//den *= 1.25;\n' +
  '    //den *= .8;\n' +
  '\n' +
  '\treturn den;\n' +
  '}\n' +
  '\n' +
  '// rad = radius of complete mult explosion (range 0 to 1)\n' +
  '// r = radius of the explosion ball that contributes the highest density\n' +
  '// rawDens = non-clamped density at the current maching location on the current ray\n' +
  '// foffset = factor for offset how much the offsetting should be applied. best to pass a time-based value.\n' +
  'void calcDens( in vec3 pos, out float rad, out float r, out float rawDens, in float t, in float foffset, out vec4 col, in float bright )\n' +
  '{\n' +
  '    float radiusFromExpCenter = length(pos);\n' +
  '    rad = radiusFromExpCenter / expRadius;\n' +
  '\n' +
  '    r = 0.0;\n' +
  '    rawDens = 0.0;\n' +
  '    col = vec4(0.0);\n' +
  '\n' +
  '    for ( int k = 0; k < mult_explosions; ++k )\n' +
  '    {\n' +
  '        float t0 = t - balls[k].delay;\n' +
  '        if ( t0 < 0.0 || t0 > 1.0 ) continue;\n' +
  '\n' +
  '        vec3 p = pos - balls[k].offset * foffset;\n' +
  '        float radiusFromExpCenter0 = length(p);\n' +
  '\n' +
  '        float r0 = downscale* radiusFromExpCenter0 / expRadius;\n' +
  '        if( r0 > 1.0 ) continue;\n' +
  '\t\t// BUG: Skipping for r0 > 1.0 gives some artefacts on later smoke where the inside of sphere\n' +
  '        // is more transparent than the outside (for the parts where other expl balls contribute density in).\n' +
  '        // I can\'t figure yet what the problem is. Inside the sphere near border, densities should be\n' +
  '        // practically 0.0 which also does not contribute (almost) anything to sum in contributeDens.\n' +
  '        // So what\'s the problem then?\n' +
  '        // Notice, the same bug happens with skipping for t0 > 1.0, just there slight jumps can be seen near\n' +
  '        // end of animation for certain angle views.\n' +
  '        // Reason for the bug: Below, we pass r0 as r. If a density is not skipped but becomes in final color\n' +
  '        // actually transparent, r0 is still passed as r. Outside the r0, the r gains a value from another\n' +
  '        // explosion ball and thus gains also its rawDens0. Inside our r0, the other\'s ball\'s density gets\n' +
  '        // skipped, which is producing the jump.\n' +
  '\t\t// Fix would be to intermengle all densities altogether without\n' +
  '        // skipping any. But how? Especially how to intermengle all the r0\'s?\n' +
  '\t\t// Actually the problem comes from color calculation which makes the final color near transparent the\n' +
  '\t\t// higher the density value.\n' +
  '\t\t// So maybe the fix would be to put the transparency information into the density somehow before\n' +
  '\t\t// selecting one radius. Actually we could add up all the densities, but the one which was the\n' +
  '\t\t// highest could be that one who\'s r0 we will use as r. Maybe.\n' +
  '        // FIX: The bug is only with OLD_COLORING. New coloring should not have this bug anymore.\n' +
  '        \n' +
  '        float rawDens0 = densityFn( p, r0, t0, balls[k].dir, explosion_seed + 33.7*float(k) ) * density;\n' +
  '\n' +
  '#ifndef SHOW_BOUNDS\n' +
  '    \t// thin out the volume at the far extends of the bounding sphere to avoid\n' +
  '    \t// clipping with the bounding sphere\n' +
  '    \trawDens0 *= 1.-smoothstep(thinout_smooth,1.,r0);\n' +
  '#endif\n' +
  '\n' +
  '#ifndef OLD_COLORING\n' +
  '    \tfloat dens = clamp( rawDens0, 0.0, 1.0 );\n' +
  '\n' +
  '        //vec4 col0 = computeColour(dens, r0*(.9+.5*dens)/1.75, bright);\t// also adds some variation to the radius\n' +
  '        //vec4 col0 = computeColour(dens, r0*(1.4+rawDens0), bright);\t\t// also adds some variation to the radius\n' +
  '    \tvec4 col0 = computeColour(dens, r0*(brightrad.x+brightrad.y*rawDens0), bright);\t// also adds some variation to the radius\n' +
  '\n' +
  '#ifndef SHOW_BOUNDS\n' +
  '        // uniform scale density\n' +
  '        //col0.a *= 0.8;\n' +
  '        //col0.a *= col0.a + .4;\n' +
  '        col0.a *= (col0.a + .4) * (1. - r0*r0);\n' +
  '\n' +
  '        // colour by alpha\n' +
  '        col0.rgb *= col0.a;\n' +
  '#else\n' +
  '    \tcol0.a *= 5.;\n' +
  '#endif\n' +
  '\n' +
  '        col += col0;\n' +
  '\n' +
  '    \trawDens = max(rawDens, rawDens0);\n' +
  '        //rawDens+=max(rawDens0,0.);\n' +
  '\n' +
  '        /*if ( rawDens0 > rawDens )\n' +
  '        {\n' +
  '            rawDens = rawDens0;\n' +
  '            r = r0;\n' +
  '            col = col0;\n' +
  '        }*/\n' +
  '#else\n' +
  '        if ( rawDens0 > rawDens )\n' +
  '        {\n' +
  '            rawDens = rawDens0;\n' +
  '            r = r0;\n' +
  '        }\n' +
  '#endif\n' +
  '    }\n' +
  '\n' +
  '#ifdef SHOW_BOUNDS\n' +
  '    col /= float(mult_explosions);\n' +
  '#endif\n' +
  '    \n' +
  '\t//rawDens *= density;\n' +
  '}\n' +
  '\n' +
  '#ifdef OLD_COLORING\n' +
  '// rad = radius of complete mult explosion (range 0 to 1)\n' +
  '// r = radius of the explosion ball that contributes the highest density\n' +
  '// rawDens = non-clamped density at the current maching location on the current ray\n' +
  'void contributeDens( in float rad, in float r, in float rawDens, in float bright, out vec4 col, inout vec4 sum )\n' +
  '{\n' +
  '    //float dens = clamp( rawDens, 0.0, 1.0 );\n' +
  '    float dens = min( rawDens, 1.0 );\t// we expect already rawDens to be positive\n' +
  '\n' +
  '    //col = computeColour(dens, r*(.9+.5*dens)/1.75, bright);\t// also adds some variation to the radius\n' +
  '    //col = computeColour(dens, r*(1.4+rawDens), bright);\t// also adds some variation to the radius\n' +
  '    col = computeColour(dens, r*(brightrad.x+brightrad.y*rawDens), bright);\t// also adds some variation to the radius\n' +
  '\n' +
  '#ifndef SHOW_BOUNDS\n' +
  '    // uniform scale density\n' +
  '    //col.a *= 0.8;\n' +
  '    //col.a *= col.a + .4;\n' +
  '    col.a *= (col.a + .4) * (1. - r*r);\n' +
  '\n' +
  '    // colour by alpha\n' +
  '    col.rgb *= col.a;\n' +
  '\n' +
  '    // alpha blend in contribution\n' +
  '    sum = sum + col*(1.0 - sum.a);\n' +
  '    sum.a+=0.15*col.a;\n' +
  '#else\n' +
  '    col.a *= 5.;\n' +
  '   \tsum = max(sum, col);\n' +
  '#endif\n' +
  '}\n' +
  '#endif\n' +
  '\n' +
  '#ifndef OLD_COLORING\n' +
  'void contributeColor( in vec4 col, inout vec4 sum )\n' +
  '{\n' +
  '#ifndef SHOW_BOUNDS\n' +
  '    // alpha blend in contribution\n' +
  '    sum = sum + col*(1.0 - sum.a);\n' +
  '    sum.a+=0.15*col.a;\n' +
  '#else\n' +
  '   \tsum = max(sum, col);\n' +
  '#endif\n' +
  '}\n' +
  '#endif\n' +
  '\n' +
  'vec4 raymarch( in vec3 rayo, in vec3 rayd, in vec2 expInter, in float t, out float d )\n' +
  '{\n' +
  '    vec4 sum = vec4( 0.0 );\n' +
  '    \n' +
  '    float step = 1.5 / float(steps);\n' +
  '     \n' +
  '    // start iterating on the ray at the intersection point with the near half of the bounding sphere\n' +
  '\t//vec3 pos = rayo + rayd * (expInter.x + step*texture( iChannel2, gl_FragCoord.xy/iChannelResolution[0].x ).x);\t\t// dither start pos to break up aliasing\n' +
  '\t//vec3 pos = rayo + rayd * (expInter.x + 1.0*step*fract(0.5*(gl_FragCoord.x+gl_FragCoord.y)));\t// regular dither\n' +
  '\tvec3 pos = rayo + rayd * (expInter.x);\t// no dither\n' +
  '\n' +
  '    float march_pos = expInter.x;\n' +
  '    d = 4000.0;\n' +
  '    \n' +
  '    // t goes from 0 to 1 + mult delay. that is 0 to 1 is for one explosion ball. the delay for time distribution of the multiple explosion balls.\n' +
  '    // t_norm is 0 to 1 for the whole animation (incl mult delay).\n' +
  '    float t_norm = t / tmax;\n' +
  '    float smooth_t = sin(t_norm*2.1);\t//sin(t*2.);\n' +
  '\n' +
  '\t//float bright = 6.1;\n' +
  '\tfloat t1 = 1.0 - t_norm;\t// we use t_norm instead of t so that final color is reached at end of whole animation and not already at end of first explosion ball.\n' +
  '    //float bright = 3.1 + 18.0 * t1*t1;\n' +
  '\t//float bright = 3.1 + 1.4 * t1*t1;\n' +
  '\t//float bright = 3.1 + 4.4 * t1*t1;\n' +
  '\tfloat bright = brightness.x + brightness.y * t1*t1;\n' +
  '\t//float bright = smoothstep(0.0, 30.1, 1.0);\n' +
  '\t//float bright = smoothstep(20.0, 3.1, 1.0);\n' +
  '    //float bright = 10.;\n' +
  '\n' +
  '    for( int i=0; i<steps; i++ )\n' +
  '    {\n' +
  '        if( sum.a >= 0.98 ) { d = march_pos; break; }\n' +
  '        if ( march_pos >= expInter.y ) break;\n' +
  '        \n' +
  '        float rad, r, rawDens;\n' +
  '        vec4 col;\n' +
  '        calcDens( pos, rad, r, rawDens, t, smooth_t, col, bright );\n' +
  '\n' +
  '        if ( rawDens <= 0.0 )\n' +
  '        {\n' +
  '            float s = step * 2.0;\n' +
  '            pos += rayd * s;\n' +
  '            march_pos += s;\n' +
  '            continue;\n' +
  '        }\n' +
  '        \n' +
  '#ifdef OLD_COLORING\n' +
  '        contributeDens( rad, r, rawDens, bright, col, sum );\n' +
  '#else\n' +
  '        contributeColor( col, sum );\n' +
  '#endif\n' +
  '\t\t\n' +
  '\t\t// take larger steps through low densities.\n' +
  '\t\t// something like using the density function as a SDF.\n' +
  '\t\tfloat stepMult = 1.0 + (1.-clamp(rawDens+col.a,0.,1.));\n' +
  '\t\t// step along ray\n' +
  '\t\tpos += rayd * step * stepMult;\n' +
  '        march_pos += step * stepMult;\n' +
  '\n' +
  '\t\t//pos += rayd * step;\n' +
  '\t}\n' +
  '\n' +
  '#ifdef SHOW_BOUNDS\n' +
  '    if ( sum.a < 0.1 )\n' +
  '        sum = vec4(0.,0.,.5,0.1);\n' +
  '#endif\n' +
  '\t\n' +
  '    return clamp( sum, 0.0, 1.0 );\n' +
  '}\n' +
  '\n' +
  '// iq\'s sphere intersection, but here fixed for a sphere at (0,0,0)\n' +
  'vec2 iSphere(in vec3 ro, in vec3 rd, in float rad)\n' +
  '{\n' +
  '\t//sphere at origin has equation |xyz| = r\n' +
  '\t//sp |xyz|^2 = r^2.\n' +
  '\t//Since |xyz| = ro + t*rd (where t is the parameter to move along the ray),\n' +
  '\t//we have ro^2 + 2*ro*rd*t + t^2 - r2. This is a quadratic equation, so:\n' +
  '\t//vec3 oc = ro - sph.xyz; //distance ray origin - sphere center\n' +
  '\t\n' +
  '\tfloat b = dot(ro, rd);\t\t\t\t\t//=dot(oc, rd);\n' +
  '\tfloat c = dot(ro, ro) - rad * rad;\t\t//=dot(oc, oc) - sph.w * sph.w; //sph.w is radius\n' +
  '\tfloat h = b*b - c; // delta\n' +
  '\tif(h < 0.0) \n' +
  '\t\treturn vec2(-1.0);\n' +
  '    //h = sqrt(h);\n' +
  '    h *= 0.5;\t\t// just some rough approximation to prevent sqrt.\n' +
  '    return vec2(-b-h, -b+h);\n' +
  '}\n' +
  '\n' +
  'vec3 computePixelRay( in vec2 p, out vec3 cameraPos )\n' +
  '{\n' +
  '    // camera orbits around explosion\n' +
  '\t\n' +
  '    float camRadius = CAM_DIST;\n' +
  '\t// use mouse x coord\n' +
  '\tfloat a = iTime*CAM_ROTATION_SPEED;\n' +
  '    float b = CAM_TILT * sin(a * .014);\n' +
  '#ifndef SHADERTOY_APP\n' +
  '\tif( iMouse.z > 0. )\n' +
  '    {\n' +
  '\t\ta = iMouse.x;\n' +
  '#ifndef ALTERNATE_MOUSE\n' +
  '        b = iMouse.y/iResolution.y - 0.5;\n' +
  '#else\n' +
  '\t\tb = 0.0;\n' +
  '#endif\n' +
  '    }\n' +
  '#endif\n' +
  '    float phi = b * 3.14;\n' +
  '    float camRadiusProjectedDown = camRadius * cos(phi);\n' +
  '\tfloat theta = -(a-iResolution.x)/80.;\n' +
  '    float xoff = camRadiusProjectedDown * cos(theta);\n' +
  '    float zoff = camRadiusProjectedDown * sin(theta);\n' +
  '    float yoff = camRadius * sin(phi);\n' +
  '    cameraPos = vec3(xoff,yoff,zoff);\n' +
  '     \n' +
  '    // camera target\n' +
  '    vec3 target = vec3(0.);\n' +
  '     \n' +
  '    // camera frame\n' +
  '    vec3 fo = normalize(target-cameraPos);\n' +
  '    vec3 ri = normalize(vec3(fo.z, 0., -fo.x ));\n' +
  '    vec3 up = normalize(cross(fo,ri));\n' +
  '     \n' +
  '    // multiplier to emulate a fov control\n' +
  '    float fov = .5;\n' +
  '\t\n' +
  '    // ray direction\n' +
  '    vec3 rayDir = normalize(fo + fov*p.x*ri + fov*p.y*up);\n' +
  '\t\n' +
  '\treturn rayDir;\n' +
  '}\n' +
  '\n' +
  'void setup()\n' +
  '{\n' +
  '    // first expl ball always centered looking up\n' +
  '    balls[0] = Ball(\n' +
  '        vec3(0.),\n' +
  '        vec3(0.,.7,0.),\t\t// not normalized so that expl ball 0 rolls somewhat slower\n' +
  '        0.0\n' +
  '    );\n' +
  '\n' +
  '    float pseed = variation_seed;\n' +
  '    float tseed = delay_seed;\n' +
  '    float maxdelay = 0.0;\n' +
  '    for ( int k = 1; k < mult_explosions; ++k )\n' +
  '    {\n' +
  '        float pseed = variation_seed + 3. * float(k-1);\n' +
  '        float tseed = delay_seed + 3. * float(k-1);\n' +
  '        vec2 phi = hash2(pseed) * vec2(2.*pi, pi*ball_spread);\n' +
  '        vec2 tilted = vec2( sin(phi.y), cos(phi.y) );\n' +
  '        vec3 rotated = vec3( tilted.x * cos(phi.x), tilted.y, tilted.x * sin(phi.x) );\n' +
  '        balls[k].offset = 0.7 * rotated; //hash3(pseed) - 0.5;\n' +
  '        balls[k].dir = normalize( balls[k].offset );\n' +
  '        balls[k].delay = delay_range * hash(tseed);\n' +
  '        pseed += 3.;\n' +
  '        tseed += 3.;\n' +
  '        maxdelay = max(maxdelay, balls[k].delay);\n' +
  '    }\n' +
  '    \n' +
  '    if ( maxdelay > 0.0 )\n' +
  '    {\n' +
  '        // Now stretch the ball explosion delays to the maximum allowed range.\n' +
  '        // So that the last ball starts with a delay of exactly delay_range and thus we do not waste any final time with just empty space.\n' +
  '       \tfor ( int k = 0; k < mult_explosions; ++k )\n' +
  '            balls[k].delay *= delay_range / maxdelay;\n' +
  '    }\n' +
  '}\n' +
  '\n' +
  'void mainImage( out vec4 fragColor, in vec2 fragCoord )\n' +
  '{\n' +
  '#ifdef LOW_Q\n' +
  '    grain *= 1.0 + 0.1 * float(LOW_Q);\n' +
  '    growth *= 1.0 - 0.1 * float(LOW_Q);\n' +
  '    ballness *= 0.85;\n' +
  '#endif\n' +
  '\n' +
  '    float t = getTime();\n' +
  '\n' +
  '    // some global initialization.\n' +
  '    setup();\n' +
  '\n' +
  '\t// get aspect corrected normalized pixel coordinate\n' +
  '    vec2 q = gl_FragCoord.xy / iResolution.xy;\n' +
  '    vec2 p = -1.0 + 2.0*q;\n' +
  '    p.x *= iResolution.x / iResolution.y;\n' +
  '    \n' +
  '\tvec3 rayDir, cameraPos;\n' +
  '\t\n' +
  '    rayDir = computePixelRay( p, cameraPos );\n' +
  '\t\n' +
  '\tvec4 col = vec4(0.);\n' +
  '    float d = 4000.0;\n' +
  '\t\n' +
  '    // does pixel ray intersect with exp bounding sphere?\n' +
  '\tvec2 boundingSphereInter = iSphere( cameraPos, rayDir, expRadius );\n' +
  '\tif( boundingSphereInter.x > 0. )\n' +
  '\t{\n' +
  '\t\t// yes, cast ray\n' +
  '\t    col = raymarch( cameraPos, rayDir, boundingSphereInter, t, d );\n' +
  '\t}\n' +
  '\t\n' +
  '    // smoothstep final color to add contrast\n' +
  '    //col.xyz = col.xyz*col.xyz*(3.0-2.0*col.xyz);\n' +
  '\t//col.xyz = col.xyz*col.xyz*(2.0-col.xyz);\t// darker contrast\n' +
  '\tcol.xyz = col.xyz*col.xyz*(1.0+contrast*(1.0-col.xyz));\n' +
  '\n' +
  '\t// gamma\n' +
  '\t//col.xyz = pow( col.xyz, vec3(1.25) );\n' +
  '    //col.a = pow( col.a, 1.5 );\n' +
  '\n' +
  '    // from https://www.shadertoy.com/view/XdSXDc\n' +
  '    //col.rgb = clamp(pow(col.rgb, vec3(0.416667))*1.055 - 0.055,0.,1.); //cheap sRGB approx\n' +
  '    \n' +
  '    vec3 cloudcolor = vec3(.8,.8,.8);\n' +
  '    \n' +
  '#ifndef SHADERTOY_APP\n' +
  '\t//vec4 back = texture( iChannel1, -gl_FragCoord.xy/iChannelResolution[1].xy );\n' +
  '\t//vec4 back = texture( iChannel1, -gl_FragCoord.xy/iResolution.xy );\n' +
  '    vec4 back = texture( iChannel1, rayDir );\n' +
  '\n' +
  ' #ifdef WITH_FUN\n' +
  '    // day-night cycling\n' +
  '    float dnt = fract(iTime / DAY_NIGHT_CYCLE_TIME);\n' +
  '    float day = 1.-smoothstep(.3, .5, dnt);\n' +
  '    float night = smoothstep(.8, 1., dnt);\n' +
  '    day += night;\n' +
  '    night = 1.-day;\n' +
  '\n' +
  '    // night setting\n' +
  '    float gray = back.r+back.g+back.b;\n' +
  '    vec3 corridorlight = night < .9 ? vec3(0.) :\n' +
  '        smoothstep( 1., 0., gray ) * (CORRIDOR_LIGHT);\t// this is so cute looking\n' +
  '    //vec3 nightcolor = pow(back.b, 5. * clamp(rayDir.y+.7, 1. - (ENLIGHTEN_PASSAGE), 1.)) * (NIGHT_COLORING);\n' +
  '    vec3 nightcolor = pow(back.b, 4.) * (NIGHT_COLORING);\n' +
  '    nightcolor *= smoothstep( -1., 1., -(gray-1.7) ) + .1;\n' +
  '    \n' +
  ' #ifdef STARS\n' +
  '    if ( gray > 2.999 )\t// luck, practically just the sky in the cubemap is pure white\n' +
  '    \tnightcolor += stars( rayDir );\n' +
  ' #endif\n' +
  '\n' +
  '    // faking some light on the floor from the explosion\n' +
  '    vec3 floorlight = (smoothstep( .3, .99, -rayDir.y ) * (FLOOR_LIGHT_STRENGTH) * smoothstep(.6, .0, t)) * colBottom.rgb;\n' +
  '\n' +
  '    cloudcolor *= smoothstep( -.5, 1., day );\n' +
  '    \n' +
  '    back.rgb = back.rgb * day + nightcolor * night + corridorlight + floorlight;\n' +
  ' #endif\n' +
  '    \n' +
  '#else\n' +
  '\tvec4 back = vec4(.5);\n' +
  ' #ifdef WITH_FUN\n' +
  ' #ifdef STARS\n' +
  '\tback.rgb += stars( rayDir );\n' +
  ' #endif\n' +
  ' #endif\n' +
  '#endif\n' +
  '\n' +
  '#ifdef WITH_FUN\n' +
  '#ifdef FOG\n' +
  '    back.rgb = clouds(back.rgb,cameraPos+vec3(0.,40.,0.), rayDir, /*d*/ 4000.0, iTime*3., cloudcolor);\n' +
  '#endif\n' +
  '#endif\n' +
  '    \n' +
  '\tfragColor.xyz = mix( back.xyz, col.xyz, col.a );\n' +
  '\n' +
  '    //fragColor.rgb = clouds(fragColor.rgb,cameraPos, rayDir, d, iTime*3., cloudcolor);\n' +
  '\n' +
  '    // vignette\n' +
  '    fragColor.rgb *= pow(16.0*q.x*q.y*(1.0-q.x)*(1.0-q.y),0.1);\n' +
  '}\n' +
  '\n' +
  '#ifdef SHADERTOY_APP\n' +
  'void main()\n' +
  '{\n' +
  '\tmainImage( gl_FragColor, gl_FragCoord.xy );\n' +
  '}\n' +
  '#endif';


export const explosionVertexShader =
  'void main() {' +
  'gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);' +
  '}';
