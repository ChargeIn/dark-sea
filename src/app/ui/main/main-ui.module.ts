import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MainUiComponent } from './main-ui.component';
import { ActionbarComponent } from './actionbar/actionbar/actionbar.component';
import { HealthbarComponent } from './resourcebars/healthbar/healthbar.component';
import {GameModule} from '../../game/game.module';
import {MatProgressBarModule} from '@angular/material/progress-bar';

@NgModule({
  declarations: [
    MainUiComponent,
    HealthbarComponent,
    ActionbarComponent
  ],
  imports: [
    CommonModule,
    GameModule,
    MatProgressBarModule
  ]
})
export class MainUiModule { }
