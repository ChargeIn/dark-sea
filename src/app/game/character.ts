import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
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
  public onLoad: () => any = () => {};

  private loadModel(): void {
    const loader = new GLTFLoader();

    loader.load(
      'assets/ships/destroyer/destroyer.gltf',
      (gltf) => {
        gltf.scene.traverse((c) => (c.castShadow = true));
        this.ship = gltf.scene;
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

    this.ship.rotation.y +=
      (+this.input.up - +this.input.down) *
      BasicCharacterController.rotationSpeed *
      timeElapsed;

    this.ship.position.x +=
      (+this.input.right - +this.input.left) *
      BasicCharacterController.speed *
      timeElapsed;

    this.ship.rotation.y +=
      (+this.input.right - +this.input.left) *
      BasicCharacterController.rotationSpeed *
      timeElapsed;
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

class BasicCharacterState {}
