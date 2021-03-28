import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainUiComponent } from './main-ui.component';
import { ActionbarComponent } from './actionbar/actionbar/actionbar.component';
import { HealthBarComponent } from './resourcebars/healthbar/health-bar.component';
import { GameModule } from '../../game/game.module';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@NgModule({
  declarations: [MainUiComponent, HealthBarComponent, ActionbarComponent],
  exports: [MainUiComponent],
  imports: [CommonModule, GameModule, MatProgressBarModule],
})
export class MainUiModule {}
