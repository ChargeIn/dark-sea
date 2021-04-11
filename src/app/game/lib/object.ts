import {BasicCharacterController} from './character';
import * as THREE from 'three';
import {FBXLoader} from './fbxloader';
import {explosionFragmentShader, explosionVertexShader} from "./explosion.shader";

export class Bullet {
  private upVelocity;
  private speed = 22;
  private readonly model: THREE.Mesh;
  private readonly startOffset = 1;
  private readonly shipOffset = 0.4;
  private visuals: THREE.Mesh[] = [];
  public done = false;
  private mixer;
  private stop = true;

  constructor(
    private target: BasicCharacterController,
    private scene: THREE.scene,
    start: BasicCharacterController,
    amount: number
  ) {
    this.model = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({color: 0xffffff})
    );
    const diff = start.model.position.x - target.model.position.x;
    const absDiff = Math.abs(diff);

    this.upVelocity = absDiff * 1.25;
    this.model.position.set(
      start.model.position.x,
      start.model.position.y,
      -this.startOffset
    );
    this.visuals.push(this.model);
    this.scene.add(this.model);

    let dirX = this.target.model.position.x - start.model.position.x;
    let dirY = this.target.model.position.y - start.model.position.y;
    const length = Math.sqrt(dirX * dirX + dirY * dirY);

    dirX /= length;
    dirY /= length;
    for (let i = 1; i < amount; i++) {
      const bullet = new THREE.Mesh(
        new THREE.SphereGeometry(0.03, 8, 8),
        new THREE.MeshBasicMaterial({color: 0xffffff})
      );

      bullet.position.set(
        this.model.position.x + Math.random() * dirX,
        this.model.position.y + Math.random() * dirY,
        -this.startOffset
      );

      this.scene.add(bullet);
      this.visuals.push(bullet);
    }
  }

  update(time: number): boolean {
    //if ( this.mixer ) { this.mixer.update( time ); }

    if (this.done) {
      return;
    }

    let diffX = this.target.model.position.x - this.model.position.x;
    let diffY = this.target.model.position.y - this.model.position.y;
    const diffZ =
      this.target.model.position.z - this.shipOffset - this.model.position.z;
    const abs = Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ);

    if (abs < 0.5 && this.stop) {
      this.stop = false;
      //this.done = true;
      this.visuals.forEach((bullet) => this.scene.remove(bullet));

      // model
      const material = new THREE.ShaderMaterial({

        uniforms: {
          iResolution: {value: new THREE.Vector3()},
          iTime: {value: 1.0},
          iTimeDelta: 0.1,
          iFrame: 60,
          iChannelTime: {value: [1, 1, 1, 1]},
          iChannelResolution: {value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()]},
          iMouse: {value: new THREE.Vector4()},
          iChannel0: {value: new THREE.CubeTexture()},
          iChannel1: {value: new THREE.CubeTexture()},
          iChannel2: {value: new THREE.CubeTexture()},
          iChannel3: {value: new THREE.CubeTexture()},
          iDate: {value: new THREE.Vector4()},
          iSimpleRate: {value: 1}
        },

        vertexShader: explosionVertexShader,

        fragmentShader: explosionFragmentShader,

      });

      const geometry = new THREE.PlaneGeometry(5, 20, 32);
      const plane = new THREE.Mesh(geometry, material);
      this.scene.add(plane);

    }

    this.visuals.forEach((bullet) => {
      diffX = this.target.model.position.x - bullet.position.x;
      diffY = this.target.model.position.y - bullet.position.y;
      bullet.position.x += (this.speed * time * diffX) / abs;
      bullet.position.y += (this.speed * time * diffY) / abs;
      bullet.position.z +=
        (this.speed * time * diffZ) / abs + this.upVelocity * time;
    });
    this.upVelocity -= this.upVelocity * 3 * time;
  }
}
