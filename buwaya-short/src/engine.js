// Core renderer: colour pass (MSAA) + normal/depth pass -> composite (ink outlines, lens blur, grade) -> 2D canvas with captions.
import * as THREE from "three";

export const W = 1080, H = 1920, FPS = 30;
export const S = H / 1920; // pixel-size scale for post parameters

export const glCanvas = document.createElement("canvas");
glCanvas.width = W; glCanvas.height = H;
export const renderer = new THREE.WebGLRenderer({ canvas: glCanvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
renderer.setPixelRatio(1);
renderer.setSize(W, H, false);
renderer.outputColorSpace = THREE.LinearSRGBColorSpace; // composite shader does the sRGB encode itself
renderer.toneMapping = THREE.NoToneMapping;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;

const rtColor = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, samples: 4 });
const rtND = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter });

// ---- normal + depth material for world meshes: rgb = view normal (faceted, from derivatives), a = depth/FAR
export const FAR = 900;
export const ndWorld = new THREE.ShaderMaterial({
  uniforms: { uFar: { value: FAR }, uSign: { value: 1 } },
  vertexShader: `varying vec3 vP; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vP = mv.xyz; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vP; uniform float uFar; uniform float uSign;
    void main(){ vec3 n = normalize(cross(dFdx(vP), dFdy(vP))); gl_FragColor = vec4(n*0.5+0.5, uSign*(-vP.z)/uFar); }`,
  side: THREE.DoubleSide,
});
// smooth-normal variant (spheres, round things) so facets don't ink
export const ndSmooth = new THREE.ShaderMaterial({
  uniforms: { uFar: { value: FAR } },
  vertexShader: `varying vec3 vP; varying vec3 vN; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.0); vP = mv.xyz; vN = normalMatrix*normal; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `varying vec3 vP; varying vec3 vN; uniform float uFar;
    void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n=-n; gl_FragColor = vec4(n*0.5+0.5, (-vP.z)/uFar); }`,
  side: THREE.DoubleSide,
});
// cards (characters, fx): no ink, but carry depth (negative) for the lens blur
export function ndCardMat(map) {
  return new THREE.ShaderMaterial({
    uniforms: { uFar: { value: FAR }, map: { value: map } },
    vertexShader: `varying vec3 vP; varying vec2 vUv; void main(){ vUv=uv; vec4 mv = modelViewMatrix*vec4(position,1.0); vP = mv.xyz; gl_Position = projectionMatrix*mv; }`,
    fragmentShader: `varying vec3 vP; varying vec2 vUv; uniform float uFar; uniform sampler2D map;
      void main(){ if(texture2D(map,vUv).a < 0.5) discard; gl_FragColor = vec4(0.5,0.5,0.5, -(-vP.z)/uFar); }`,
    side: THREE.DoubleSide,
  });
}

// ---- composite
const comp = new THREE.ShaderMaterial({
  uniforms: {
    tC: { value: rtColor.texture }, tN: { value: rtND.texture },
    uRes: { value: new THREE.Vector2(W, H) }, uFar: { value: FAR },
    uInkPx: { value: 3.2 * S }, uInk: { value: new THREE.Color("#0b0a0c") },
    uFocus: { value: 10 }, uBlur: { value: 0 }, uFogNear: { value: 40 }, uFogFar: { value: 300 },
    uSat: { value: 1.08 }, uExpo: { value: 1.0 }, uVig: { value: 0.22 }, uFlash: { value: 0 }, uTint: { value: new THREE.Color(1, 1, 1) },
    uFade: { value: 1 },
  },
  vertexShader: `varying vec2 vUv; void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }`,
  fragmentShader: `
    varying vec2 vUv; uniform sampler2D tC, tN; uniform vec2 uRes; uniform float uFar, uInkPx, uFocus, uBlur, uFogNear, uFogFar, uSat, uExpo, uVig, uFlash, uFade;
    uniform vec3 uInk, uTint;
    vec4 nd(vec2 uv){ return texture2D(tN, uv); }
    float lin2srgb(float c){ return c<=0.0031308 ? 12.92*c : 1.055*pow(c,1.0/2.4)-0.055; }
    float coc(float a){ // a = signed depth/far ; sky = 1
      float d = abs(a)*uFar; if (d<=0.0) d = uFar;
      return uBlur * clamp(abs(d-uFocus)/max(d,0.5) * 1.6, 0.0, 1.0);
    }
    void main(){
      vec2 px = 1.0/uRes;
      vec4 c0 = nd(vUv);
      // ---- lens blur (gather, 16 taps on two rings)
      vec3 col = texture2D(tC, vUv).rgb;
      float r = coc(c0.a);
      if (r > 0.4) {
        vec3 acc = col; float wsum = 1.0;
        for (int i=0;i<16;i++){
          float fi = float(i);
          float ang = fi*2.39996 ; float rr = sqrt((fi+0.5)/16.0) * r;
          vec2 o = vec2(cos(ang), sin(ang))*rr*px;
          vec4 sN = nd(vUv+o);
          float sr = coc(sN.a);
          float w = clamp(sr/ max(rr,0.001), 0.0, 1.0); // a sharp foreground sample doesn't smear into blurred bg
          w = mix(w, 1.0, step(abs(c0.a), abs(sN.a)-0.0001)); // samples behind always ok
          acc += texture2D(tC, vUv+o).rgb * w; wsum += w;
        }
        col = acc/wsum;
      }
      // ---- ink: world geometry only (cards have negative depth -> ignored)
      float ink = 0.0;
      if (c0.a > 0.0) {
        float d0 = c0.a*uFar; vec3 n0 = c0.rgb*2.0-1.0;
        float fogK = smoothstep(uFogNear, uFogFar, d0);
        float w = uInkPx * mix(1.0, 0.62, smoothstep(6.0, 90.0, d0)) * 0.5;
        for (int i=0;i<8;i++){
          float a = float(i)*0.785398;
          vec2 o = vec2(cos(a), sin(a))*w*px;
          vec4 s = nd(vUv+o);
          if (s.a < 0.0) continue;
          float ds = s.a*uFar;
          float e = 0.0;
          if (s.a >= 0.999) e = (d0 < uFar*0.95) ? 1.0 : 0.0; // silhouette against sky
          else {
            e = max(e, smoothstep(0.03, 0.06, (ds - d0)/d0));              // depth jump (outer side only)
            vec3 ns = s.rgb*2.0-1.0;
            e = max(e, smoothstep(0.42, 0.6, 1.0 - dot(n0, ns)) * 0.9);   // crease
          }
          ink = max(ink, e);
        }
        ink *= 1.0 - 0.75*fogK;
      }
      col = mix(col, uInk, ink);
      // ---- grade
      col *= uExpo * uTint;
      float l = dot(col, vec3(0.2126,0.7152,0.0722));
      col = max(mix(vec3(l), col, uSat), 0.0);
      col = col / (1.0 + max(0.0, l-0.85)*0.6); // soft shoulder
      vec3 o = vec3(lin2srgb(col.r), lin2srgb(col.g), lin2srgb(col.b));
      vec2 q = vUv-0.5; o *= 1.0 - uVig*smoothstep(0.25, 0.85, dot(q*vec2(1.0,0.75), q*vec2(1.0,0.75))*2.6);
      o = mix(o, vec3(1.0), uFlash);
      o *= uFade;
      gl_FragColor = vec4(clamp(o,0.0,1.0), 1.0);
    }`,
  depthTest: false, depthWrite: false,
});
const quadScene = new THREE.Scene();
const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), comp);
quad.frustumCulled = false;
quadScene.add(quad);
const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

export const post = comp.uniforms;

// ---- render one frame of a scene + camera
const _bg = new THREE.Color();
export function renderFrame(scene, camera) {
  // colour
  renderer.setRenderTarget(rtColor);
  renderer.render(scene, camera);
  // normal/depth: swap materials
  const saved = [];
  const bg = scene.background, fog = scene.fog;
  scene.background = null; scene.fog = null;
  scene.traverse((o) => {
    if (!o.isMesh && !o.isInstancedMesh) return;
    saved.push([o, o.material, o.visible]);
    if (o.userData.noND) { o.visible = false; return; }
    o.material = o.userData.nd || (o.userData.smooth ? ndSmooth : ndWorld);
  });
  renderer.setClearColor(0x000000, 1); // alpha 1 => "sky / far"
  renderer.setRenderTarget(rtND);
  renderer.clear();
  const sm = renderer.shadowMap.enabled; renderer.shadowMap.enabled = false;
  renderer.render(scene, camera);
  renderer.shadowMap.enabled = sm;
  for (const [o, m, v] of saved) { o.material = m; o.visible = v; }
  scene.background = bg; scene.fog = fog;
  renderer.setClearColor(0x000000, 0);
  // composite
  renderer.setRenderTarget(null);
  renderer.render(quadScene, quadCam);
}

// ---- 2D output canvas (gl frame + captions)
export const outCanvas = document.createElement("canvas");
outCanvas.width = W; outCanvas.height = H;
export const out2d = outCanvas.getContext("2d");
