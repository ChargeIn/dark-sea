import { Component, OnInit } from '@angular/core';
import {GameService} from '../../../../game/game.service';

@Component({
  selector: 'ds-healthbar',
  templateUrl: './healthbar.component.html',
  styleUrls: ['./healthbar.component.scss']
})
export class HealthbarComponent implements OnInit {

  public health = 40;

  constructor(private gameService: GameService) {
    // TODO subscripe to health
  }

  ngOnInit(): void {
  }

}
