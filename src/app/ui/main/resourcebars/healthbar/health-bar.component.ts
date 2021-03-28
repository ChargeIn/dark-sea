import { Component, OnInit } from '@angular/core';
import { GameService } from '../../../../game/game.service';

@Component({
  selector: 'ds-healthbar',
  templateUrl: './health-bar.component.html',
  styleUrls: ['./health-bar.component.scss'],
})
export class HealthBarComponent implements OnInit {
  public health = 40;
  public target = '';

  constructor(private gameService: GameService) {
    // TODO subscribe to health
    gameService.newSelection.subscribe((target) => {
      if (target) {
        this.target = target.name;
      } else {
        this.target = '';
      }
    });
  }

  ngOnInit(): void {}
}
