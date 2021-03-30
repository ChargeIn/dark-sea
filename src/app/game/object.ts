import { BasicCharacterController } from './character';
import * as THREE from 'three';

export class Bullet {
  private upVelocity;
  private speed = 22;
  private readonly model: THREE.Mesh;
  public done = false;

  constructor(
    private target: BasicCharacterController,
    private scene: THREE.scene,
    start: BasicCharacterController,
    id: number
  ) {
    this.model = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
    );

    this.upVelocity =
      Math.abs(start.model.position.x - target.model.position.x) / 2;
    this.model.position.set(
      start.model.position.x + Math.random() * 1.2,
      start.model.position.y - 0.6 + Math.random() / 2,
      0
    );
    this.model.name = id.toString();
    this.scene.add(this.model);
  }

  update(time: number): boolean {
    if (this.done) {
      return;
    }

    this.model.position.y += this.upVelocity * time;

    const diffX = this.target.model.position.x - this.model.position.x;
    const diffY = this.target.model.position.y - 0.75 - this.model.position.y;
    const abs = Math.sqrt(diffX * diffX + diffY * diffY);

    if (abs < 0.5) {
      this.done = true;
      this.scene.remove(this.model);
    }

    this.model.position.x += (this.speed * time * diffX) / abs;
    this.model.position.y += (this.speed * time * diffY) / abs;
    this.upVelocity -= this.upVelocity * time;
  }
}
