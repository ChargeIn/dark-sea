import {
  ElementRef,
  Injectable,
  OnDestroy,
  NgZone,
  EventEmitter,
} from '@angular/core';
import * as THREE from 'three';
import {
  BasicCharacterController,
  CharacterMovementController,
  InputController,
  PlayerController,
} from './lib/model/character';
import {
  gliziFragmentShader,
  gliziVertexShader,
} from './lib/sharders/glizi.shader';
import {
  explosionFragmentShader,
  explosionVertexShader,
} from './lib/sharders/explosion.shader';
import {
  selectionFragmentShader,
  selectionVertexShader,
} from './lib/sharders/selection.shader';

@Injectable({
  providedIn: 'root',
})
export class GameService implements OnDestroy {
  private canvas: HTMLCanvasElement;
  private renderer: THREE.WebGLRenderer;
  private camera: THREE.PerspectiveCamera;
  private scene: THREE.Scene;
  public player: PlayerController;
  private enemies: BasicCharacterController[] = [];
  private time: number;
  public loaded = new EventEmitter<void>();

  private readonly zoomFar = 0.5;
  private readonly zoomNear = 2;
  private readonly clickRadius = 1;
  private currentSelection: BasicCharacterController | null = null;
  private selectionCircle: THREE.Mesh;

  private frameId: number = null;
  private glizi: THREE.Mesh;
  private uniforms: { iTime: { value: number } };

  constructor(private ngZone: NgZone) {}

  ngOnDestroy(): void {
    if (this.frameId != null) {
      cancelAnimationFrame(this.frameId);
    }
  }

  public createScene(canvas: ElementRef<HTMLCanvasElement>): void {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x193450);

    this.player = new PlayerController(
      new CharacterMovementController(),
      'ME',
      3,
      this.scene
    );

    const enemy = new BasicCharacterController(
      new InputController(),
      'Enemy',
      1,
      this.scene
    );

    enemy.loaded.then(() => this.enemies.push(enemy));

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

    this.camera.position.set(30, 30, 100);

    this.camera.position.set(0, -5, 5);
    this.camera.lookAt(0, 0, 0);

    const bglight = new THREE.AmbientLight(0xffffff, 1.7);
    this.scene.add(bglight);

    const mat = new THREE.ShaderMaterial({
      vertexShader: selectionVertexShader,
      fragmentShader: selectionFragmentShader,
      transparent: true,
    });

    const geom = new THREE.PlaneGeometry(1.5, 1.5, 1);

    this.selectionCircle = new THREE.Mesh(geom, mat);
    this.selectionCircle.position.z = -101;
    this.scene.add(this.selectionCircle);

    // model
    this.uniforms = {
      iTime: { value: 0 },
    };

    // glizi test
    const material = new THREE.ShaderMaterial({
      vertexShader: gliziVertexShader,
      fragmentShader: gliziFragmentShader,
      uniforms: this.uniforms,
      transparent: true,
    });

    const geometry = new THREE.PlaneGeometry(0.75, 0.75, 1);
    this.glizi = new THREE.Mesh(geometry, material);
    this.scene.add(this.glizi);
    this.glizi.position.x = 1;
    this.glizi.position.z = -0.99;

    const level = new THREE.PlaneGeometry(width, height, 1);
    const texture = new THREE.TextureLoader().load('assets/textures/blur.jpeg');
    const levelMaterial = new THREE.MeshBasicMaterial({ map: texture });

    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(360, 180);

    const levelMesh = new THREE.Mesh(level, levelMaterial);
    levelMesh.position.z = -1;
    this.scene.add(levelMesh);

    this.player.loaded.then(() => this.loaded.emit());
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

    this.uniforms.iTime.value += 0.01;

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
      ((-(evt.clientY / window.innerHeight) * 2 + 1) * 7) / this.camera.zoom +
      1;

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
          this.selectionCircle.position.z = -0.9;
        }
        return;
      }
    }
    this.player.moveTo({ x, y });
  }

  cancel(): void {
    this.selectionCircle.position.z = -101;
    this.selection = null;
  }

  set selection(value) {
    this.currentSelection = value;
    this.player.target = value;
  }

  public resize(): void {
    const width = window.innerWidth;
    const height = window.innerHeight;

    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();

    this.renderer.setSize(width, height);
  }

  public zoom(e: WheelEvent): void {
    this.camera.zoom = Math.min(
      Math.max(this.zoomFar, this.camera.zoom - e.deltaY * 0.005),
      this.zoomNear
    );

    this.camera.updateProjectionMatrix();
  }
}
