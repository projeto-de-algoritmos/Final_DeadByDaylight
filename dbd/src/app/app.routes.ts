import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AppComponent } from './app.component';
import { IntroComponent } from './intro/intro.component';
import { MapComponent } from './map/map.component';
import { TutorialComponent } from './tutorial/tutorial.component';

const routes: Routes = [
  {
    path: 'intro',
    component: IntroComponent
  },
  {
    path: 'tutorial',
    component: TutorialComponent
   },
  {
    path: 'map',
    component: MapComponent
   },
  {
    path: '',
    redirectTo: '/intro',
    pathMatch: 'full'
  },
  {
    path: '**',
    component: AppComponent
  }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
  })

export class AppRoutingModule { }
export const routingComponents = [ IntroComponent, TutorialComponent, MapComponent ]