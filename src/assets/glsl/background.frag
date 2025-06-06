uniform mat4 projectionMatrix;
uniform sampler2D msdf;

varying vec4 worldPos;
varying vec3 sculptureCenter;

#define USE_PBR
#define HEMISPHERE_LIGHT

uniform float time;
uniform float opacity;
uniform float _scale;
uniform vec3 mouse;
uniform float stepSize;
uniform vec2 resolution;

const float STEP_SIZE_CONSTANT = 0.85;
const int MAX_ITERATIONS = 3;
#define MAX_REFLECTIONS 0

float surfaceDistance(vec3 p);

const float PI = 3.14159265;
const float TAU = PI * 2.0;
const float TWO_PI = TAU;

const float max_dist = 100.0;
const float intersection_threshold = 0.00001;

struct Material {
  vec3 albedo;
  vec3 reflectiveAlbedo;
  float metallic;
  float roughness;
  float ao;
};

struct ShadedMaterial {
  Material mat;
  vec3 color;
  vec3 backgroundColor;
};

Material blendMaterial(Material a, Material b, float amount) {
  return Material(
    mix(a.albedo, b.albedo, amount),
    mix(a.reflectiveAlbedo, b.reflectiveAlbedo, amount),
    mix(a.metallic, b.metallic, amount),
    mix(a.roughness, b.roughness, amount),
    mix(a.ao, b.ao, amount)
  );
}

// Trig functions normalized to the range 0.0-1.0
float nsin(float x) {
  return sin(x) * 0.5 + 0.5;
}

float ncos(float x) {
  return cos(x) * 0.5 + 0.5;
}

float softSquare(float x, int pw) {
  return 1.0 / (pow(tan(x), float(pw+1) * 2.0) + 1.0);
}

// Simple oscillators

float osc(float freq, float amp, float base, float phase) {
  return base + amp * sin(TWO_PI * (freq * time + phase));
}

float osc(float freq, float amp, float base) {
  return osc(freq, amp, base, 0.0);
}

float osc(float freq, float amp) {
  return osc(freq, amp, 1.0);
}

float osc(float freq) {
  return osc(freq, 0.5);
}

float osc() {
  return osc(1.0);
}

// Color Conversion
// https://www.shadertoy.com/view/lsS3Wc
vec3 hsv2rgb( vec3 c ) {
  vec3 rgb = clamp(abs(mod(c.x * 6.0 + vec3(0.0, 4.0 ,2.0), 6.0) - 3.0) - 1.0, 0.0, 1.0);
  return c.z * mix(vec3(1.0), rgb, c.y);
}

vec3 rgb2hsv( vec3 c) {
  const float eps = 0.0000001;
  vec4 k = vec4(0.0, -1.0 / 3.0, 2.0 / 3.0, -1.0);
  vec4 p = mix(vec4(c.zy, k.wz), vec4(c.yz, k.xy), (c.z < c.y) ? 1.0 : 0.0);
  vec4 q = mix(vec4(p.xyw, c.x), vec4(c.x, p.yzx), (p.x < c.x) ? 1.0 : 0.0);
  float d = q.x - min(q.w, q.y);
  return vec3(abs(q.z + (q.w - q.y) / (6.0 * d + eps)), d / (q.x + eps), q.x);
}


// Primitives

float line(vec3 p, vec3 a, vec3 b) {
  vec3 pa = p - a;
  vec3 ba = b - a;
  float t = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba*t);
}

//line with radius
float line(vec3 p, vec3 a, vec3 b, float radius){
  vec3 pa = p - a, ba = b - a;
  float h = clamp(dot(pa,ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - radius;
}

float sphere( vec3 p, float size ){
  return length(p) - size;
}

float uBox( vec3 p, vec3 b ){
  return length(max(abs(p) - b, 0.0));
}

float uRoundBox( vec3 p, vec3 b, float r ){
  return length(max(abs(p) - b,0.0)) - r;
}

float box( vec3 p, vec3 box ){
  vec3 d = abs(p) - box;
  return min(max(d.x, max(d.y,d.z)), 0.0) + length(max(d, 0.0));
}

float box( vec3 p, float bx, float by, float bz) {
  vec3 box = vec3(bx,by,bz);
  vec3 d = abs(p) - box;
  return min(max(d.x, max(d.y, d.z)), 0.0) + length(max(d, 0.0));
}

float roundedBox( vec3 p, vec3 box , float r){
return length(max(abs(p)-box,0.0))-r;
}

float torus( vec3 p, vec2 t ){
vec2 q = vec2(length(p.xz)-t.x,p.y);
return length(q)-t.y;
}

float torus( vec3 p, float tx, float ty ){
  vec2 q = vec2(length(p.xz)-tx,p.y);
  return length(q)-ty;
}

float infCylinder( vec3 p, vec3 c )
{
return length(p.xz-c.xy)-c.z;
}

float cylinder( vec3 p, vec2 h )
{
vec2 d = abs(vec2(length(p.xz),p.y)) - h;
return min(max(d.x,d.y),0.0) + length(max(d,0.0));
}

float cylinder( vec3 p, float hx, float hy)
{
  return cylinder(p, vec2(hx,hy));
}

float cone( vec3 p, vec2 c )
{
  // c must be normalized
  float q = length(p.xy);
  return dot(c,vec2(q,p.z));
}

float plane( vec3 p, vec4 n )
{
// n must be normalized
return dot(p,n.xyz) + n.w;
}

float plane( vec3 p, float nx, float ny, float nz, float nw)
{
// n must be normalized
return dot(p,normalize(vec3(nx,ny,nz))) + nw;
}

float hexPrism( vec3 p, vec2 h )
{
  vec3 q = abs(p);
  return max(q.z-h.y,max((q.x*0.866025+q.y*0.5),q.y)-h.x);
}

float triPrism( vec3 p, vec2 h )
{
  vec3 q = abs(p);
  return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

float capsule( vec3 p, vec3 a, vec3 b, float r )
{
  vec3 pa = p - a, ba = b - a;
  float h = clamp( dot(pa,ba)/dot(ba,ba), 0.0, 1.0 );
  return length( pa - ba*h ) - r;
}

float triangularPrism( vec3 p, vec2 h ) {
  vec3 q = abs(p);
  return max(q.z-h.y,max(q.x*0.866025+p.y*0.5,-p.y)-h.x*0.5);
}

float cappedCone( vec3 p, vec3 c )
{
  vec2 q = vec2( length(p.xz), p.y );
  vec2 v = vec2( c.z*c.y/c.x, -c.z );
  vec2 w = v - q;
  vec2 vv = vec2( dot(v,v), v.x*v.x );
  vec2 qv = vec2( dot(v,w), v.x*w.x );
  vec2 d = max(qv,0.0)*qv/vv;
  return sqrt( dot(w,w) - max(d.x,d.y) ) * sign(max(q.y*v.x-q.x*v.y,w.y));
}

float roundCone(vec3 p, vec3 a, vec3 b, float r1, float r2)
{
  // sampling independent computations (only depend on shape)
  vec3  ba = b - a;
  float l2 = dot(ba,ba);
  float rr = r1 - r2;
  float a2 = l2 - rr*rr;
  float il2 = 1.0/l2;

  // sampling dependant computations
  vec3 pa = p - a;
  float y = dot(pa,ba);
  float z = y - l2;
  vec3 rv = pa*l2 - ba*y;
  float x2 = dot(rv,rv);
  float y2 = y*y*l2;
  float z2 = z*z*l2;

  // single square root!
  float k = sign(rr)*rr*rr*x2;
  if( sign(z)*a2*z2 > k ) return  sqrt(x2 + z2)        *il2 - r2;
  if( sign(y)*a2*y2 < k ) return  sqrt(x2 + y2)        *il2 - r1;
                          return (sqrt(x2*a2*il2)+y*rr)*il2 - r1;
}

float ellipsoid( vec3 p, vec3 r )
{
  return (length( p/r ) - 1.0) * min(min(r.x,r.y),r.z);
}

vec3 toSpherical(vec3 p) {
  float phi = atan(p.x,p.z);
  float r = length(p);
  float theta = acos(-p.y/r);
  return vec3(r,theta,phi);
}

vec3 fromSpherical(vec3 p) {
  return vec3(p.x*sin(p.y)*cos(p.z), p.x*sin(p.y)*sin(p.z), p.x*cos(p.y));
}

float dot2( vec3 v ) { return dot(v,v); }

float uTriangle( vec3 p, vec3 a, vec3 b, vec3 c )
{
  vec3 ba = b - a; vec3 pa = p - a;
  vec3 cb = c - b; vec3 pb = p - b;
  vec3 ac = a - c; vec3 pc = p - c;
  vec3 nor = cross( ba, ac );
  return sqrt(
  (sign(dot(cross(ba,nor),pa)) +
    sign(dot(cross(cb,nor),pb)) +
    sign(dot(cross(ac,nor),pc))<2.0)
    ?
    min( min(
    dot2(ba*clamp(dot(ba,pa)/dot2(ba),0.0,1.0)-pa),
    dot2(cb*clamp(dot(cb,pb)/dot2(cb),0.0,1.0)-pb) ),
    dot2(ac*clamp(dot(ac,pc)/dot2(ac),0.0,1.0)-pc) )
    :
    dot(nor,pa)*dot(nor,pa)/dot2(nor) );
}

float overwrite( float d1, float d2 )
{
  return d1;
}

float add( float d1, float d2 )
{
  return min(d1,d2);
}

float add(float d1, float d2, float d3) {
  return min(d1, min(d2,d3));
}

float add(float d1, float d2, float d3, float d4) {
  return min(min(d1,d2),min(d3,d4));
}

float add(float d1, float d2, float d3, float d4, float d5) {
  return min(min(min(d1,d2), min(d3,d4)),d5);
}

float add(float d1, float d2, float d3, float d4, float d5, float d6) {
  return min(min(min(d1,d2),min(d3,d4)),min(d5,d6));
}

float add(float d1, float d2, float d3, float d4, float d5, float d6, float d7) {
  return min(min(min(d1,d2),min(d3,d4)),min(min(d5,d6),d7));
}

float subtract( float d1, float d2 )
{
  return max(-d1,d2);
}

float intersect( float d1, float d2 )
{
  return max(d1,d2);
}

float shell(float d, float thickness) {
  return abs(d)-thickness;
}

vec3 repeat3D(vec3 p, vec3 c )
{
  return mod(p,c)-0.5*c;
}

float repeat1D(float p, float size)
{
float halfSize = size * 0.5;
float c = floor((p + halfSize) / size);
  p = mod(p + halfSize, size)-halfSize;
  return c;
}

mat2 rot2(float a)
{
  float c = cos(a); float s = sin(a);
return mat2(c, s, -s, c);
}

// from https://www.neilmendoza.com/glsl-rotation-about-an-arbitrary-axis/
vec3 rotateVec(vec3 inputVec, vec3 axis, float angle)
{
  axis = normalize(axis);
  float s = sin(angle);
  float c = cos(angle);
  float oc = 1.0 - c;

  return mat3(oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
              oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
              oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c ) * inputVec;
}

// polynomial smooth min (k = 0.1) (from IQ)
float smoothAdd( float a, float b, float k )
{
  float h = clamp( 0.5+0.5*(b-a)/k, 0.0, 1.0 );
  return mix( b, a, h ) - k*h*(1.0-h);
}

float smoothSubtract(float a,float b, float k)
{
  return -smoothAdd(-a,-b,k);
}

vec2 _hash( vec2 p ) // replace this by something better
{
p = vec2( dot(p,vec2(127.1,311.7)),
      dot(p,vec2(269.5,183.3)) );
return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise( vec2 p )
{
  const float K1 = 0.366025404; // (sqrt(3)-1)/2;
  const float K2 = 0.211324865; // (3-sqrt(3))/6;
vec2 i = floor( p + (p.x+p.y)*K1 );

  vec2 a = p - i + (i.x+i.y)*K2;
  vec2 o = step(a.yx,a.xy);
  vec2 b = a - o + K2;
vec2 c = a - 1.0 + 2.0*K2;
  vec3 h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
vec3 n = h*h*h*h*vec3( dot(a,_hash(i+0.0)), dot(b,_hash(i+o)), dot(c,_hash(i+1.0)));
  return dot( n, vec3(70.0) );
}

// from https://www.shadertoy.com/view/4djSRW
float _hash13(vec3 p3)
{
  p3  = fract(p3 * .1031);
  p3 += dot(p3, p3.zyx + 31.32);
  return fract((p3.x + p3.y) * p3.z);
}

vec3 _hash33(vec3 p3)
{
  p3 = fract(p3 * vec3(.1031,.11369,.13787));
  p3 += dot(p3, p3.yxz+19.19);
  return -1.0 + 2.0 * fract(vec3((p3.x + p3.y)*p3.z, (p3.x+p3.z)*p3.y, (p3.y+p3.z)*p3.x));
}

// simplex noise from https://www.shadertoy.com/view/4sc3z2
float noise(vec3 p)
{
  const float K1 = 0.333333333;
  const float K2 = 0.166666667;

  vec3 i = floor(p + (p.x + p.y + p.z) * K1);
  vec3 d0 = p - (i - (i.x + i.y + i.z) * K2);

  // thx nikita: https://www.shadertoy.com/view/XsX3zB
  vec3 e = step(vec3(0.0), d0 - d0.yzx);
vec3 i1 = e * (1.0 - e.zxy);
vec3 i2 = 1.0 - e.zxy * (1.0 - e);

  vec3 d1 = d0 - (i1 - 1.0 * K2);
  vec3 d2 = d0 - (i2 - 2.0 * K2);
  vec3 d3 = d0 - (1.0 - 3.0 * K2);

  vec4 h = max(0.6 - vec4(dot(d0, d0), dot(d1, d1), dot(d2, d2), dot(d3, d3)), 0.0);
  vec4 n = h * h * h * h * vec4(dot(d0, _hash33(i)), dot(d1, _hash33(i + i1)), dot(d2, _hash33(i + i2)), dot(d3, _hash33(i + 1.0)));

  return dot(vec4(31.316), n);
}

float fractalNoise(vec3 p, float falloff, int iterations) {
  float v = 0.0;
  float amp = 1.0;
  float invFalloff = 1.0/falloff;
  for (int i=0; i<10; i++) {
      v += noise(p)*amp;
if (i>=iterations) break;
      amp *= invFalloff;
      p *= falloff;
  }
  return v;
}

float fractalNoise(vec3 p) {
  return fractalNoise(p, 2.0, 5);
}

// Adapted from IQ's usage at https://www.shadertoy.com/view/lllXz4
// Spherical Fibonnacci points, Benjamin Keinert, Matthias Innmann,
// Michael Sanger and Marc Stamminger

const float PHI = 1.61803398875;

vec4 sphericalDistribution( vec3 p, float n )
{
  p = normalize(p);
  float m = 1.0 - 1.0/n;

  float phi = min(atan(p.y, p.x), PI), cosTheta = p.z;

  float k = max(2.0, floor( log(n * PI * sqrt(5.0) * (1.0 - cosTheta*cosTheta))/ log(PHI+1.0)));
  float Fk = pow(PHI, k)/sqrt(5.0);
  vec2 F = vec2( floor(Fk + 0.5), floor(Fk * PHI + 0.5) ); // k, k+1

  vec2 ka = 2.0*F/n;
  vec2 kb = 2.0*PI*( fract((F+1.0)*PHI) - (PHI-1.0) );

  mat2 iB = mat2( ka.y, -ka.x,
  kb.y, -kb.x ) / (ka.y*kb.x - ka.x*kb.y);

  vec2 c = floor( iB * vec2(phi, cosTheta - m));
  float d = 8.0;
  float j = 0.0;
  vec3 bestQ = vec3(0.0,0.0,8.0);
  for( int s=0; s<4; s++ )
  {
      vec2 uv = vec2( float(s-2*(s/2)), float(s/2) );

      float i = dot(F, uv + c); // all quantities are ingeters (can take a round() for extra safety)

      float phi = 2.0*PI*fract(i*PHI);
      float cosTheta = m - 2.0*i/n;
      float sinTheta = sqrt(1.0 - cosTheta*cosTheta);

      vec3 q = vec3( cos(phi)*sinTheta, sin(phi)*sinTheta, cosTheta );
      float squaredDistance = dot(q-p, q-p);
      if (squaredDistance < d)
      {
          d = squaredDistance;
          j = i;
          bestQ = q;
      }
  }
  return vec4(bestQ,sqrt(d));
}

// Compute intersection of ray and SDF. You probably won't need to modify this.
float intersect(vec3 ro, vec3 rd, float stepFraction) {
  float t = 0.0;
for(int i = 0; i < MAX_ITERATIONS; ++i) {
  float h = surfaceDistance((ro+rd*t));
  if(h < intersection_threshold || t > max_dist) break;
  t += h*STEP_SIZE_CONSTANT;
  }
return t;
}

vec3 getRayDirection() {
return normalize(worldPos.xyz-cameraPosition);
}

vec3 mouseIntersection() {
  vec3 rayDirection = getRayDirection();
  return mouse+rayDirection*intersect(mouse, rayDirection, 0.8);
}

// Calculate the normal of a SDF
vec3 calcNormal( vec3 pos )
{
  vec2 e = vec2(1.0,-1.0)*0.0005;
  return normalize( e.xyy*surfaceDistance( pos + e.xyy ) +
        e.yyx*surfaceDistance( pos + e.yyx ) +
        e.yxy*surfaceDistance( pos + e.yxy ) +
        e.xxx*surfaceDistance( pos + e.xxx ) );
}

// from https://learnopengl.com/PBR/Lighting
vec3 fresnelSchlick(float cosTheta, vec3 F0)
{
  return F0 + (1.0 - F0) * pow(1.0 - cosTheta, 5.0);
}

float DistributionGGX(vec3 N, vec3 H, float roughness)
{
  float a      = roughness*roughness;
  float a2     = a*a;
  float NdotH  = max(dot(N, H), 0.0);
  float NdotH2 = NdotH*NdotH;

  float num   = a2;
  float denom = (NdotH2 * (a2 - 1.0) + 1.0);
  denom = PI * denom * denom;

  return num / denom;
}

float GeometrySchlickGGX(float NdotV, float roughness)
{
  float r = (roughness + 1.0);
  float k = (r*r) / 8.0;

  float num   = NdotV;
  float denom = NdotV * (1.0 - k) + k;

  return num / denom;
}

float GeometrySmith(vec3 N, vec3 V, vec3 L, float roughness)
{
  float NdotV = max(dot(N, V), 0.0);
  float NdotL = max(dot(N, L), 0.0);
  float ggx2  = GeometrySchlickGGX(NdotV, roughness);
  float ggx1  = GeometrySchlickGGX(NdotL, roughness);

  return ggx1 * ggx2;
}

// adapted from https://learnopengl.com/PBR/Lighting
ShadedMaterial pbrLighting(vec3 WordPos, vec3 N, vec3 lightdir, Material mat, vec3 backgroundColor) {

  vec3 V = -getRayDirection();
  vec3 F0 = vec3(0.04);
  F0 = mix(F0, mat.albedo, mat.metallic);

  // reflectance equation
  vec3 Lo = vec3(0.0);

  // calculate per-light radiance
  vec3 L = normalize(lightdir);
  vec3 H = normalize(V + L);

  // cook-torrance brdf
  float NDF = DistributionGGX(N, H, mat.roughness);
  float G   = GeometrySmith(N, V, L, mat.roughness);
  vec3 F    = fresnelSchlick(max(dot(H, V), 0.0), F0);

  vec3 kS = F;
  vec3 kD = vec3(1.0) - kS;
  kD *= 1.0 - mat.metallic;

  vec3 numerator    = NDF * G * F;
  float denominator = 4.0 * max(dot(N, V), 0.0) * max(dot(N, L), 0.0);
  vec3 specular     = numerator / max(denominator, 0.001);

  // add to outgoing radiance Lo
  float NdotL = max(dot(N, L), 0.0);
  Lo += (kD * mat.albedo / PI + specular) * NdotL;

  float hemi = 1.0;
  #ifdef HEMISPHERE_LIGHT
  // ground is black, taken into account by ambient light
  hemi = NdotL*1.25;
  #endif

  vec3 ambient = (vec3(1.2+hemi) * mat.albedo) * mat.ao;
  vec3 color = ambient + Lo*1.7;

  /// this section adds edge glow as if there were a white env map ///
  /// there should probably be a way to disable it //
  float lt = 1.0-max(dot(N,V),0.0);
  lt = pow(lt,6.0);
  color += 16.0*lt*(0.2+mat.albedo)*mat.metallic*backgroundColor*(1.3-mat.roughness);
  ///

  // Caps color range close to 0-1. Things above 1 stay close to 1

  return ShadedMaterial(mat, color, backgroundColor);
}

float simpleLighting(vec3 p, vec3 normal, vec3 lightdir) {
  // Simple phong-like shading
  float value = clamp(dot(normal, normalize(lightdir)),0.0, 1.0);
  return value * 0.3 + 0.7;
}

float specularLighting(vec3 p, vec3 normal, vec3 lightDirection, float shine) {
  float lamb = clamp(dot(normal,normalize(lightDirection)),0.0,1.0);
  float spec = pow(lamb, exp(10.0*shine));
  lamb = 0.4*lamb + 0.4 + 0.2*spec;
  return lamb;
}

float shadow(vec3 p, vec3 lightDirection, float amount) {
  float t = intersect(p+0.001*lightDirection, lightDirection, stepSize);
  return t < (max_dist - 0.1) ? 1.0-amount : 1.0;
}

// From https://www.shadertoy.com/view/XslSWl
float occlusion(vec3 p,vec3 n) {
  const int AO_SAMPLES = 8;
  const float INV_AO_SAMPLES = 1.0/float(AO_SAMPLES);
  const float R = 0.9;
  const float D = 0.8;
  float r = 0.0;
  for(int i = 0; i < AO_SAMPLES; i++) {
      float f = float(i)*INV_AO_SAMPLES;
      float h = 0.05+f*R;
      float d = surfaceDistance(p + n * h) - 0.003;
      r += clamp(h*D-d,0.0,1.0) * (1.0-f);
  }
  return clamp(1.0-r,0.0,1.0);
}
float sdBoxFrame( vec3 p, vec3 b, float e )
{
  p = abs(p  )-b;
vec3 q = abs(p+e)-e;
return min(min(
  length(max(vec3(p.x,q.y,q.z),0.0))+min(max(p.x,max(q.y,q.z)),0.0),
  length(max(vec3(q.x,p.y,q.z),0.0))+min(max(q.x,max(p.y,q.z)),0.0)),
  length(max(vec3(q.x,q.y,p.z),0.0))+min(max(q.x,max(q.y,p.z)),0.0));
}
float sdLink( vec3 p, float le, float r1, float r2 )
{
  vec3 q = vec3( p.x, max(abs(p.y)-le,0.0), p.z );
  return length(vec2(length(q.xy)-r1,q.z)) - r2;
}

float sdCappedTorus(in vec3 p, in vec2 sc, in float ra, in float rb)
{
  p.x = abs(p.x);
  float k = (sc.y*p.x>sc.x*p.y) ? dot(p.xy,sc) : length(p.xy);
  return sqrt( dot(p,p) + ra*ra - 2.0*ra*k ) - rb;
}



float surfaceDistance(vec3 p) {
vec3 normal = vec3(0.0,1.0,0.0);
vec3 mouseIntersect = vec3(0.0,1.0,0.0);
  float d = 100.0;
  vec3 op = p;
  float scope_0_d = 100.0;
  vec3 scope_0_p = p;
  float v_0 = -0.20000000;
  float v_1 = (mouse.x*v_0);
  float v_2 = -0.20000000;
  float v_3 = (mouse.y*v_2);
  scope_0_p -= vec3( v_1, v_3, 0.00000000);
  vec3 v_4 = scope_0_p;
  vec3 v_5 = getRayDirection();
  float v_6 = 1.00000000;
  vec3 v_7 = (v_5*v_6);
  float v_8 = 0.10000000;
  float v_9 = (time*v_8);
  vec3 v_10 = vec3(0.00000000, 0.20000000, v_9);
  vec3 v_11 = (v_7+v_10);
  float v_12 = noise(v_11);
  float v_13 = 0.10000000;
  float v_14 = (time*v_13);
  vec3 v_15 = vec3(0.00000000, 0.00000000, v_14);
  vec3 v_16 = (v_4+v_15);
  vec3 v_17 = (v_16+v_12);
  float v_18 = noise(v_17);
  float v_19 = 0.50000000;
  float v_20 = (v_18*v_19);
  float v_21 = 0.50000000;
  float v_22 = (v_20+v_21);
  float v_23 = 0.50000000;
  float v_24 = (v_18*v_23);
  float v_25 = 0.75000000;
  float v_26 = (v_24+v_25);
  float v_27 = 0.10000000;
  vec3 v_28 = (normal*v_27);
  vec3 v_29 = vec3(0.97000000, 0.69000000, 0.36000000);
  vec3 v_30 = (v_28+v_29);
  vec3 v_31 = vec3(4.00000000, 4.00000000, 4.00000000);
  vec3 v_32 = scope_0_p;
  float v_33 = sdBoxFrame(v_32, v_31, 0.10000000);
  float prim_0 = v_33;
  scope_0_d = add( prim_0, scope_0_d  );
  float v_34 = 0.50000000;
  float v_35 = (v_18*v_34);
  float v_36 = 0.25000000;
  float v_37 = (v_36+v_35);
  float prim_1 = sphere(scope_0_p, v_37);
  scope_0_d = mix( prim_1, scope_0_d ,0.00000000 );

  return scope_0_d;
}

ShadedMaterial shade(vec3 p, vec3 normal) {
  float d = 100.0;
  vec3 op = p;
vec3 lightDirection = vec3(0.0, 1.0, 0.0);
vec3 backgroundColor = vec3(1.0, 1.0, 1.0);
vec3 mouseIntersect = vec3(0.0,1.0,0.0);
#ifdef USE_PBR
Material material = Material(vec3(1.0), vec3(1.0),0.5,0.7,1.0);
Material selectedMaterial = Material(vec3(1.0), vec3(1.0),0.5,0.7,1.0);
#else
float light = 1.0;
float occ = 1.0;
  vec3 color = vec3(1.0,1.0,1.0);
vec3 selectedColor = vec3(1.0,1.0,1.0);
#endif
  float scope_0_d = 100.0;
  vec3 scope_0_p = p;
  Material scope_0_material = material;
  Material scope_0_currentMaterial = material;
  float v_0 = -0.20000000;
  float v_1 = (mouse.x*v_0);
  float v_2 = -0.20000000;
  float v_3 = (mouse.y*v_2);
  scope_0_p -= vec3( v_1, v_3, 0.00000000);
  vec3 v_4 = scope_0_p;
  vec3 v_5 = getRayDirection();
  float v_6 = 1.00000000;
  vec3 v_7 = (v_5*v_6);
  float v_8 = 0.10000000;
  float v_9 = (time*v_8);
  vec3 v_10 = vec3(0.00000000, 0.20000000, v_9);
  vec3 v_11 = (v_7+v_10);
  float v_12 = noise(v_11);
  float v_13 = 0.10000000;
  float v_14 = (time*v_13);
  vec3 v_15 = vec3(0.00000000, 0.00000000, v_14);
  vec3 v_16 = (v_4+v_15);
  vec3 v_17 = (v_16+v_12);
  float v_18 = noise(v_17);
  float v_19 = 0.50000000;
  float v_20 = (v_18*v_19);
  float v_21 = 0.50000000;
  float v_22 = (v_20+v_21);
  scope_0_currentMaterial.metallic = v_22;
  float v_23 = 0.50000000;
  float v_24 = (v_18*v_23);
  float v_25 = 0.75000000;
  float v_26 = (v_24+v_25);
  scope_0_currentMaterial.roughness = 1.0-v_26;
  float v_27 = 0.10000000;
  vec3 v_28 = (normal*v_27);
  vec3 v_29 = vec3(0.97000000, 0.69000000, 0.36000000);
  vec3 v_30 = (v_28+v_29);
  scope_0_currentMaterial.albedo = v_30;
  scope_0_currentMaterial.reflectiveAlbedo = v_30;
  vec3 v_31 = vec3(4.00000000, 4.00000000, 4.00000000);
  vec3 v_32 = scope_0_p;
  float v_33 = sdBoxFrame(v_32, v_31, 0.10000000);
  float prim_0 = v_33;
  if (prim_0 < scope_0_d) { scope_0_material = scope_0_currentMaterial; }
  scope_0_d = add( prim_0, scope_0_d  );
  float v_34 = 0.50000000;
  float v_35 = (v_18*v_34);
  float v_36 = 0.25000000;
  float v_37 = (v_36+v_35);
  float prim_1 = sphere(scope_0_p, v_37);
  if (prim_1 < scope_0_d) { scope_0_material = scope_0_currentMaterial; }
  scope_0_d = mix( prim_1, scope_0_d ,0.00000000 );


#ifdef USE_PBR
return pbrLighting(worldPos.xyz, normal, lightDirection, scope_0_material, backgroundColor);
#else
// TODO FIX or remove?
return ShadedMaterial(scope_0_material, scope_0_material.albedo*simpleLighting(p, normal, lightDirection), backgroundColor);
#endif
}

// For advanced users //

void main() {
  vec3 rayOrigin = (cameraPosition - sculptureCenter) / max(intersection_threshold, _scale);
  vec3 rayDirection = getRayDirection();
  float t = intersect(rayOrigin, rayDirection, stepSize);
  ShadedMaterial col;
  vec3 outputColor = vec3(0.);

  if(t < max_dist) {
      vec3 p = (rayOrigin + rayDirection*t);
      //vec4 sp = projectionMatrix*viewMatrix*vec4(p,1.0); //could be used to set FragDepth
      vec3 normal = calcNormal(p);
      // p *= _scale;
      col = shade(p, normal);
      outputColor = col.color;
  } else {
      discard;
  }

  vec3 reflectionCoefficient = col.mat.reflectiveAlbedo;
  #ifdef MAX_REFLECTIONS

  #if MAX_REFLECTIONS > 0
  for(int i = 0; i < MAX_REFLECTIONS; i++) {
      if(length(reflectionCoefficient) < .001) {
          break;
      }
      rayOrigin = (rayOrigin + rayDirection*t);
      vec3 normal = calcNormal(rayOrigin);
      rayDirection = reflect(rayDirection, normal);
      rayOrigin += .001 * rayDirection;
      t = intersect(rayOrigin, rayDirection, stepSize);
      vec3 p = (rayOrigin + rayDirection * t);

      ShadedMaterial col;

      if(t < max_dist) {
          normal = calcNormal(p);
          col = shade(p, normal);
      } else {
          //outputColor = mix(outputColor, col.backgroundColor, reflectionCoefficient);
          // TODO col is undefined
          //outputColor += col.backgroundColor *  reflectionCoefficient;
          break;
      }

      //outputColor = mix(outputColor, col.color, reflectionCoefficient);
      // outputColor += col.mat.albedo;
      outputColor += col.color * reflectionCoefficient;

      reflectionCoefficient *= col.mat.reflectiveAlbedo ;


  }
  #endif
  #endif
  // TODO turn off with noLighting

  outputColor = outputColor / (outputColor + vec3(1.0));
  outputColor = pow(outputColor, vec3(1.0/2.2));


  pc_fragColor = vec4(outputColor, opacity);
}
