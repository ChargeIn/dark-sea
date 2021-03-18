import { ElementRef, Injectable, OnDestroy, NgZone } from '@angular/core';
import * as THREE from 'three';
import { BasicCharacterController } from './character';

@Injectable({
  providedIn: 'root',
})
export class GameService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  private player: BasicCharacterController;
  private time: number;

  private frameId: number = null;

  private ship: THREE.Mesh;

  constructor(private ngZone: NgZone) {}

  ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.player = new BasicCharacterController();

    // The first step is to get the reference of the canvas element from our HTML document
    this.canvas = canvas.nativeElement;

    this.renderer = new THREE.WebGLRenderer({
      canvas: this.canvas,
      alpha: true, // transparent background
      antialias: true, // smooth edges
    });

    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x193450);

    this.player.onLoad = () => this.scene.add(this.player.model);

    const width = window.innerWidth;
    const height = window.innerHeight;

    this.renderer.setSize(width, height);

    this.camera = new THREE.OrthographicCamera(
      -5, // left
      5, // right
      5, // top
      -5, // bottom
      1, // near
      100 // far
    );

    this.camera.position.set(4, 4, 4);
    this.camera.lookAt(0, 0, 0);
    this.camera.lookAt(0, 0, 0);

    const bglight = new THREE.AmbientLight(0xffffff, 1.3);
    this.scene.add(bglight);

    this.scene.add(new THREE.AxesHelper(5));

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
        window.addEventListener('DOMContentLoaded', () => {
          this.render();
        });
      }
      window.addEventListener('resize', () => {
        this.resize();
      });
    });
  }

  public render(): void {
    this.frameId = requestAnimationFrame(() => {
      this.render();
    });

    this.player.update(0.01);

    this.renderer.render(this.scene, this.camera);
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  private _loadModel(): void {}
}
