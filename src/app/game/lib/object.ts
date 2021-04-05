import { BasicCharacterController } from './character';
import * as THREE from 'three';

export class Bullet {
  private upVelocity;
  private speed = 22;
  private readonly model: THREE.Mesh;
  private readonly startOffset = 1;
  private readonly shipOffset = 0.4;
  private visuals: THREE.Mesh[] = [];
  public done = false;

  constructor(
    private target: BasicCharacterController,
    private scene: THREE.scene,
    start: BasicCharacterController,
    amount: number
  ) {
    this.model = new THREE.Mesh(
      new THREE.SphereGeometry(0.03, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffffff })
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
        new THREE.MeshBasicMaterial({ color: 0xffffff })
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
    if (this.done) {
      return;
    }

    let diffX = this.target.model.position.x - this.model.position.x;
    let diffY = this.target.model.position.y - this.model.position.y;
    const diffZ =
      this.target.model.position.z - this.shipOffset - this.model.position.z;
    const abs = Math.sqrt(diffX * diffX + diffY * diffY + diffZ * diffZ);

    if (abs < 0.5) {
      this.done = true;
      this.visuals.forEach((bullet) => this.scene.remove(bullet));
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
