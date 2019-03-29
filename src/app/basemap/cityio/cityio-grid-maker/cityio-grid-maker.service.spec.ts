import { TestBed } from "@angular/core/testing";

import { CityioGridMakerService } from "../cityio-grid-maker/cityio-grid-maker.service";

describe("CityioGridMakerService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CityioGridMakerService = TestBed.get(CityioGridMakerService);
    expect(service).toBeTruthy();
  });
});
