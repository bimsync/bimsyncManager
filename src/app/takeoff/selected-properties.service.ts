import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Property, IPropertiesListService } from './selected-properties.model';
import { inherits } from 'util';

@Injectable({
  providedIn: 'root'
})
export class SelectedPropertiesService extends IPropertiesListService  {

  constructor() {
    super();
    this.propertiesListChange = new BehaviorSubject<Property[]>([]);
  }
}
