import { Routes } from '@angular/router';
import {Marketplace} from './components/marketplace/marketplace';
import {Profile} from './components/profile/profile';


export const routes: Routes = [
  { path: '', component: Marketplace },
  { path: 'profile/:id', component: Profile },
  { path: '**', redirectTo: '' }
];
