import { Component, OnInit } from '@angular/core';
import { GameService } from '../../../../game/game.service';

@Component({
  selector: 'ds-healthbar',
  templateUrl: './health-bar.component.html',
  styleUrls: ['./health-bar.component.scss'],
})
export class HealthBarComponent implements OnInit {
  public health = 40;
  public target: string;

  constructor(private gameService: GameService) {
    // TODO subscribe to health
    gameService.loaded.subscribe(() => {
      this.gameService.player.targetObs.subscribe(
        (t) => (this.target = t?.name || '')
      );
    });
  }

  ngOnInit(): void {}
}
