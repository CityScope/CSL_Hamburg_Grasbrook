import { TestBed } from '@angular/core/testing';

import { CityioService } from './cityio.service';

describe('CityioService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: CityioService = TestBed.get(CityioService);
    expect(service).toBeTruthy();
  });
});
