import { TestBed } from '@angular/core/testing';

import { ModuleDataToMapHandler } from './module-data-to-map-handler.service';

describe('ModuleDataToMapHandler', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ModuleDataToMapHandler = TestBed.get(ModuleDataToMapHandler);
    expect(service).toBeTruthy();
  });
});
