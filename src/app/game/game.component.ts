import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { GameService } from './game.service';
import { first } from 'rxjs/operators';

@Component({
  selector: 'ds-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss'],
})
export class GameComponent implements OnInit {
  @ViewChild('rendererCanvas', { static: true })
  public rendererCanvas: ElementRef<HTMLCanvasElement>;

  constructor(private gameService: GameService) {}

  ngOnInit(): void {
    this.gameService.createScene(this.rendererCanvas);
    this.gameService.loaded
      .pipe(first())
      .subscribe(() => this.gameService.animate());
  }

  onClick(evt: MouseEvent): void {
    this.gameService.onClick(evt);
  }

  scroll(e: WheelEvent): void {
    this.gameService.zoom(e);
  }
}
