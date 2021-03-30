import { ElementRef, Injectable, OnDestroy, NgZone } from '@angular/core';
import * as THREE from 'three';
import {
  BasicCharacterController,
  BasicMovementController,
  InputController,
} from './character';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class GameService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private player: BasicCharacterController;
  private enemies: BasicCharacterController[] = [];
  private time: number;

  private readonly zoomFar = 0.5;
  private readonly zoomNear = 2;
  private readonly clickRadius = 1;
  private currentSelection: BasicCharacterController | null = null;
  public newSelection = new BehaviorSubject<BasicCharacterController | null>(
    null
  );
  private selectionCircle: THREE.Mesh;

  private frameId: number = null;

  constructor(private ngZone: NgZone) {}

  ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x193450);

    this.player = new BasicCharacterController(
      new BasicMovementController(),
      'ME',
      this.scene
    );

    const enemy = new BasicCharacterController(
      new InputController(),
      'Enemy',
      this.scene
    );
    this.enemies.push(enemy);

    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true, // transparent background
      antialias: true, // smooth edges
    });

    const width = window.innerWidth;
    const height = window.innerHeight;

    const aspec = width / height;
    this.renderer.setSize(width, height);

    this.camera = new THREE.OrthographicCamera(
      -5 * aspec, // left
      5 * aspec, // right
      5, // top
      -5, // bottom
      1, // near
      100 // far
    );

    this.camera.position.set(0, -5, 5);
    this.camera.lookAt(0, 0, 0);

    const bglight = new THREE.AmbientLight(0xffffff, 1.3);
    this.scene.add(bglight);

    this.scene.add(new THREE.AxesHelper(5));

    const geom = new THREE.CircleGeometry(1, 60);
    const mat = new THREE.LineBasicMaterial({ color: 0xff0000 });
    this.selectionCircle = new THREE.LineLoop(geom, mat);
    this.selectionCircle.position.z = -101;
    this.scene.add(this.selectionCircle);

    this._loadModel();
  }

  public animate(): void {
    // We have to run this outside angular zones,
    // because it could trigger heavy changeDetection cycles.
    this.time = 0;
    this.ngZone.runOutsideAngular(() => {
      if (document.readyState !== 'loading') {
        this.render();
      } else {
        document.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.player.update(0.01);
    if (this.currentSelection) {
      this.selectionCircle.position.x = this.currentSelection.model.position.x;
      this.selectionCircle.position.y = this.currentSelection.model.position.y;
    }

    this.renderer.render(this.scene, this.camera);
  }

  public onClick(evt: MouseEvent): void {
    const x =
      (((evt.clientX / window.innerWidth) * 2 - 1) * this.camera.right) /
      this.camera.zoom;
    const y =
      ((-(evt.clientY / window.innerHeight) * 2 + 1) * 7) / this.camera.zoom;

    for (const enemy of this.enemies) {
      const pos = enemy.model.position;
      if (
        pos.x < x + this.clickRadius &&
        pos.x > x - this.clickRadius &&
        pos.y < y + this.clickRadius &&
        pos.y > y - this.clickRadius
      ) {
        if (
          !this.currentSelection ||
          this.currentSelection.name !== enemy.name
        ) {
          this.selection = enemy;
          this.selectionCircle.position.z = -1;
          this.player.fire(enemy, 4);
        }
        return;
      }
    }

    this.selectionCircle.position.z = -101;
    this.selection = null;
  }

  set selection(value) {
    this.newSelection.next(value);
    this.currentSelection = value;
  }

  public resize(): void {
    console.log('resize');
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private _loadModel(): void {}

  public zoom(e: WheelEvent): void {
    console.log('scroll');
    this.camera.zoom = Math.min(
      Math.max(this.zoomFar, this.camera.zoom - e.deltaY * 0.005),
      this.zoomNear
    );

    this.camera.updateProjectionMatrix();
  }
}
