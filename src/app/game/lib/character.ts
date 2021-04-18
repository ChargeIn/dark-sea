import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { Bullet } from './object';
import { Subject } from 'rxjs';

export class BasicCharacterController {
  constructor(
    controller: InputController,
    name: string,
    bulletCount: number,
    private scene: THREE.scene,
    x = 0,
    y = 0
  ) {
    this.input = controller;
    this.name = name;
    this.loadModel(x, y);
    this.bulletCount = bulletCount;
  }

  get model(): THREE.scene {
    return this.ship;
  }

  private static readonly speed = 10;
  private input: InputController;
  private ship: THREE.Sceen;
  private visualsAddons: THREE.Sceen[] = [];
  private bullets: Bullet[] = [];
  private readonly bulletCount;
  public name: string;
  public loaded: Promise<void>;

  private loadModel(x, y): void {
    const loader = new GLTFLoader();

    this.loaded = new Promise<void>((resolve) =>
      loader.load(
        'assets/ships/destroyer/destroyer.gltf',
        (gltf) => {
          gltf.scene.traverse((c) => (c.castShadow = true));
          this.ship = gltf.scene;
          this.ship.name = this.name;
          this.ship.rotation.x = Math.PI / 2;
          this.ship.position.set(x, y, -0.4);
          this.scene.add(this.ship);
          resolve();
        },
        undefined,
        (error) => console.log(error)
      )
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
    const xd: number = +this.input.right - +this.input.left;
    const yd: number = +this.input.up - +this.input.down;

    const x =
      this.ship.position.x + xd * BasicCharacterController.speed * timeElapsed;

    const y =
      this.ship.position.y + yd * BasicCharacterController.speed * timeElapsed;

    this.setPosition(x, y);

    // update rotation

    let r = null;
    if (Math.abs(yd) > 0) {
      r = (+this.input.up - (yd * xd) / 4) * Math.PI;
    } else if (Math.abs(xd) > 0) {
      r = (xd / 2) * Math.PI;
    }

    // // visually more appealing but slower (rotation calculations)
    // r = Math.acos(yd / Math.sqrt(xd * xd + yd * yd)) - Math.PI;
    //
    // if (!isNaN(r)) {
    //   r = xd > 0 ? -r : r;
    // }

    if (r !== null) {
      this.setRotation(r);
    }

    this.bullets.forEach((bullet) => bullet.update(timeElapsed));
    while (this.bullets.length > 0 && this.bullets[0].done) {
      this.bullets.shift();
    }
  }

  public fire(target: BasicCharacterController): void {
    this.bullets.push(new Bullet(target, this.scene, this, this.bulletCount));
  }
}

export class PlayerController extends BasicCharacterController {
  private _target: BasicCharacterController | null = null;
  public targetObs = new Subject<BasicCharacterController>();
  private _fire = false;
  private _onFireCd = false;
  private readonly _fireCd = 1200;

  set target(target: BasicCharacterController | null) {
    this._target = target;
    this.targetObs.next(this._target);
  }

  get target(): BasicCharacterController | null {
    return this._target;
  }

  private autoFire(): void {
    if (this.target) {
      this._onFireCd = true;
      super.fire(this._target);

      setTimeout(() => {
        this._onFireCd = false;
        if (this._fire) {
          this.autoFire();
        }
      }, this._fireCd);
      return;
    }

    this._fire = false;
  }

  public toggleFire(): boolean {
    this._fire = !this._fire;

    if (this._fire) {
      if (!this._onFireCd) {
        this.autoFire();
      }
    }

    return this._fire;
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
