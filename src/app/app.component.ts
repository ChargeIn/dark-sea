import { Component } from '@angular/core';
import {
  PlayFab,
  PlayFabClientSDK,
} from 'playfab-web-sdk/src/PlayFab/PlayFabClientApi.js';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  constructor() {
    PlayFab.settings.titleId = 'D7467';
    const loginRequest = {
      // Currently, you need to look up the correct format for this object in the API-docs:
      // https://api.playfab.com/Documentation/Client/method/LoginWithCustomID
      TitleId: PlayFab.settings.titleId,
      CustomId: 'DC9E81EF49B416C2',
      CreateAccount: false,
    };

    PlayFabClientSDK.LoginWithCustomID(
      (result, _err) => console.log(result),
      (err) => console.log(err)
    );
  }
}
