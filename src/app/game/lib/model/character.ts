import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import * as THREE from 'three';
import { Bullet } from './object';
import { Subject } from 'rxjs';

export class BasicCharacterController {
  constructor(
    controller: InputController,
    name: string,
    bulletCount: number,
    protected scene: THREE.scene,
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

  protected input: InputController;
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

  update(timeElapsed: number): void {
    this.updateVisuals(timeElapsed);
  }

  fire(target: BasicCharacterController): void {
    this.bullets.push(new Bullet(target, this.scene, this, this.bulletCount));
  }

  updateVisuals(timeElapsed: number): void {
    this.bullets.forEach((bullet) => bullet.update(timeElapsed));
    while (this.bullets.length > 0 && this.bullets[0].done) {
      this.bullets.shift();
    }
  }

  updatePosition(moveDirX: number, moveDirY: number): void {
    const x = this.ship.position.x + moveDirX;

    const y = this.ship.position.y + moveDirY;

    this.setPosition(x, y);

    // update rotation

    // // visually more appealing but slower (rotation calculations)
    // r = Math.acos(yd / Math.sqrt(xd * xd + yd * yd)) - Math.PI;
    //
    // if (!isNaN(r)) {
    //   r = xd > 0 ? -r : r;
    // }

    let r = null;
    if (Math.abs(moveDirY) > 0) {
      r =
        ((moveDirY > 0 ? 1 : 0) - Math.sign(moveDirY * moveDirX) / 4) * Math.PI;
    } else if (Math.abs(moveDirX) > 0) {
      r = (Math.sign(moveDirX) / 2) * Math.PI;
    }

    if (r !== null) {
      this.setRotation(r);
    }
  }
}

export class PlayerController extends BasicCharacterController {
  private static readonly speed = 10;

  private _target: BasicCharacterController | null = null;
  public targetObs = new Subject<BasicCharacterController>();
  private _fire = false;
  private _onFireCd = false;
  private move: { x: number; y: number } | null = null;
  private readonly _fireCd = 1200;
  private readonly movePointer = THREE.Mesh;

  set target(target: BasicCharacterController | null) {
    this._target = target;
    this.targetObs.next(this._target);
  }

  get target(): BasicCharacterController | null {
    return this._target;
  }

  constructor(
    controller: InputController,
    name: string,
    bulletCount: number,
    scene: THREE.scene,
    x = 0,
    y = 0
  ) {
    super(controller, name, bulletCount, scene, x, y);
    const geometry = new THREE.PlaneGeometry(0.2, 0.2, 1);
    const mat = new THREE.LineBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.8,
    });
    this.movePointer = new THREE.Mesh(geometry, mat);
    this.scene.add(this.movePointer);
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

  toggleFire(): boolean {
    this._fire = !this._fire;

    if (this._fire) {
      if (!this._onFireCd) {
        this.autoFire();
      }
    }

    return this._fire;
  }

  moveTo(moveVec: { x: number; y: number }): void {
    this.move = moveVec;
    this.movePointer.position.set(moveVec.x, moveVec.y, -0.9);
    this.movePointer.material.opacity = 1;
  }

  update(timeElapsed: number): void {
    if (this.movePointer.material.opacity > 0) {
      this.movePointer.material.opacity -= timeElapsed;
    }

    const mult = PlayerController.speed * timeElapsed;
    let x = this.input.x * mult;
    let y = this.input.y * mult;

    if (this.move) {
      if (Math.abs(x) + Math.abs(y) > 0) {
        this.move = null;
      } else {
        const diffX = this.move.x - this.model.position.x;
        const diffY = this.move.y - this.model.position.y;
        x =
          Math.sign(diffX) *
          Math.min(Math.abs(diffX), PlayerController.speed * timeElapsed);
        y =
          Math.sign(diffY) *
          Math.min(Math.abs(diffY), PlayerController.speed * timeElapsed);
      }
    }

    this.updatePosition(x, y);
    this.updateVisuals(timeElapsed);
  }
}

export class InputController {
  public left = false;
  public right = false;
  public up = false;
  public down = false;

  get x(): number {
    return +this.right - +this.left;
  }

  get y(): number {
    return +this.up - +this.down;
  }
}

export class CharacterMovementController extends InputController {
  constructor() {
    super();
    document.addEventListener('keydown', (e) => this.keyPress(e, true), false);
    document.addEventListener('keyup', (e) => this.keyPress(e, false), false);
  }

  private keyPress(e: KeyboardEvent, pressed: boolean): void {
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
