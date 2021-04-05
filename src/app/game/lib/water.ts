// code from: https://github.com/martinRenou/threejs-water
import * as THREE from 'three';

export class Water {
  public mesh: THREE.Mesh;
  private material: THREE.RawShaderMaterial;
  private geometry: any;

  constructor(width, height, private scene: THREE.Scene) {
    const geometry = new THREE.PlaneBufferGeometry(width, height, 200, 200);

    const shadersPromises = [
      loadFile('assets/shaders/water/vertex.glsl'),
      loadFile('assets/shaders/water/fragment.glsl'),
    ];

    // Light direction
    const light = [0.7559289460184544, 0.7559289460184544, -0.3779644730092272];

    const loaded = Promise.all(shadersPromises).then(
      ([vertexShader, fragmentShader]) => {
        this.material = new THREE.RawShaderMaterial({
          uniforms: {
            light: { value: light },
            // water: { value: null },
            // causticTex: { value: null },
            underwater: { value: false },
          },
          vertexShader,
          fragmentShader,
        });
        this.scene.add(new THREE.Mesh(this.geometry, this.material));
      }
    );

    // Shader chunks
    loadFile('assets/shaders/utils.glsl').then((utils) => {
      THREE.ShaderChunk['utils'] = utils;
    });
  }

  draw(renderer, camera): void {
    // this.material.uniforms["water"].value = waterTexture;
    // this.material.uniforms["causticTex"].value = causticsTexture;

    this.material.side = THREE.FrontSide;
    this.material.uniforms.underwater.value = true;
    renderer.render(this.mesh, camera);

    this.material.side = THREE.BackSide;
    this.material.uniforms.underwater.value = false;
    renderer.render(this.mesh, camera);
  }
}

function loadFile(filename): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const loader = new THREE.FileLoader();

    loader.load(filename, (data) => {
      resolve(data);
    });
  });
}
