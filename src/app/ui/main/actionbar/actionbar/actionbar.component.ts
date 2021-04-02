import { Component, OnInit } from '@angular/core';
import { GameService } from '../../../../game/game.service';

@Component({
  selector: 'ds-actionbar',
  templateUrl: './actionbar.component.html',
  styleUrls: ['./actionbar.component.scss'],
})
export class ActionbarComponent implements OnInit {
  public active = [false];

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    document.addEventListener('keydown', (e) => this.keyPress(e), false);
  }

  private keyPress(e: KeyboardEvent): void {
    switch (e.key.toLocaleLowerCase()) {
      case '1':
        this.fire();
        break;
    }
  }

  fire(): void {
    this.active[0] = this.gameService.player.toggleFire();
  }
}
