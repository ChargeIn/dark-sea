import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { Bullet } from './object';

export class BasicCharacterController {
  constructor(
    controller: InputController,
    name: string,
    private scene: THREE.scene,
    x = 0,
    y = 0
  ) {
    this.input = controller;
    this.name = name;
    this.loadModel(x, y);
  }

  get model(): THREE.scene {
    return this.ship;
  }

  private static readonly speed = 10;
  private static readonly rotationSpeed = 10;
  private input: InputController;
  private ship: THREE.Sceen;
  private visualsAddons: THREE.Sceen[] = [];
  private bullets: Bullet[] = [];
  public name: string;

  private loadModel(x, y): void {
    const loader = new GLTFLoader();

    loader.load(
      'assets/ships/destroyer/destroyer.gltf',
      (gltf) => {
        gltf.scene.traverse((c) => (c.castShadow = true));
        this.ship = gltf.scene;
        this.ship.name = this.name;
        this.ship.rotation.x = Math.PI / 2;
        this.ship.position.set(x, y, -0.4);
        this.scene.add(this.ship);
      },
      undefined,
      (error) => console.log(error)
    );
  }

  setPosition(x, y): void {
    this.ship.position.x = x;
    this.ship.position.y = y;

    for (const visual of this.visualsAddons) {
      visual.position.x = x;
      visual.position.y = y;
    }
  }

  setRotation(y): void {
    this.ship.rotation.y = y;

    for (const visual of this.visualsAddons) {
      visual.rotation.y = y;
    }
  }

  public update(timeElapsed: number): void {
    const x =
      this.ship.position.x +
      (+this.input.right - +this.input.left) *
        BasicCharacterController.speed *
        timeElapsed;

    const y =
      this.ship.position.y +
      (+this.input.up - +this.input.down) *
        BasicCharacterController.speed *
        timeElapsed;

    this.setPosition(x, y);

    // update rotation
    let r = null;
    if (this.input.up) {
      if (this.input.left) {
        r = (-Math.PI * 3) / 4;
      } else if (this.input.right) {
        r = (Math.PI * 3) / 4;
      } else {
        r = Math.PI;
      }
    } else if (this.input.down) {
      if (this.input.left) {
        r = -Math.PI / 4;
      } else if (this.input.right) {
        r = Math.PI / 4;
      } else {
        this.ship.rotation.y = 0;
      }
    } else {
      if (this.input.left) {
        r = -Math.PI / 2;
      } else if (this.input.right) {
        r = Math.PI / 2;
      }
    }

    if (r) {
      this.setRotation(r);
    }

    this.bullets.forEach((bullet) => bullet.update(timeElapsed));
    while (this.bullets.length > 0 && this.bullets[0].done) {
      this.bullets.shift();
    }
  }

  public fire(target: BasicCharacterController, count: number): void {
    for (let i = 0; i < count; i++) {
      this.bullets.push(
        new Bullet(target, this.scene, this, this.bullets.length)
      );
    }
  }
}

export class InputController {
  public up = false;
  public down = false;
  public left = false;
  public right = false;
}

export class BasicMovementController extends InputController {
  constructor() {
    super();
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
