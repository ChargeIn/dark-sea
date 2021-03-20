import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';

export class BasicCharacterController {
  constructor() {
    this.input = new BasicInputController();

    this.loadModel();
  }

  get model(): THREE.scene {
    return this.ship;
  }

  private static readonly speed = 10;
  private static readonly rotationSpeed = 10;
  private input: BasicInputController;
  private ship: THREE.Sceen;
  public onLoad: () => any = () => {
  };

  private loadModel(): void {
    const loader = new GLTFLoader();

    loader.load(
      'assets/ships/destroyer/destroyer.gltf',
      (gltf) => {
        gltf.scene.traverse((c) => (c.castShadow = true));
        this.ship = gltf.scene;
        this.ship.rotation.x = Math.PI / 2;
        this.ship.position.z = -0.4;
        this.onLoad();
      },
      undefined,
      (error) => console.log(error)
    );
  }

  public update(timeElapsed: number): void {
    this.ship.position.y +=
      (+this.input.up - +this.input.down) *
      BasicCharacterController.speed *
      timeElapsed;

    this.ship.position.x +=
      (+this.input.right - +this.input.left) *
      BasicCharacterController.speed *
      timeElapsed;

    // update rotation
    if (this.input.up) {
      if (this.input.left) {
        this.ship.rotation.y = -Math.PI * 3 / 4;
      } else if (this.input.right) {
        this.ship.rotation.y =  Math.PI * 3 / 4;
      } else {
        this.ship.rotation.y = Math.PI;
      }
    } else if(this.input.down) {
      if (this.input.left) {
        this.ship.rotation.y = -Math.PI / 4;
      } else if (this.input.right) {
        this.ship.rotation.y =  Math.PI / 4;
      } else {
        this.ship.rotation.y = 0;
      }
    } else {
      if (this.input.left) {
        this.ship.rotation.y = -Math.PI / 2;
      } else if (this.input.right) {
        this.ship.rotation.y =  Math.PI / 2;
      }
    }
  }
}

export class BasicInputController {
  public up = false;
  public down = false;
  public left = false;
  public right = false;

  constructor() {
    document.addEventListener('keydown', (e) => this.keyPress(e, true), false);
    document.addEventListener('keyup', (e) => this.keyPress(e, false), false);
  }

  private keyPress(e: KeyboardEvent, pressed): void {
    switch (e.key.toLocaleLowerCase()) {
      case 'w':
        this.up = pressed;
        break;
      case 'a':
        this.left = pressed;
        break;
      case 'd':
        this.right = pressed;
        break;
      case 's':
        this.down = pressed;
        break;
    }
  }
}

class BasicCharacterState {
}
