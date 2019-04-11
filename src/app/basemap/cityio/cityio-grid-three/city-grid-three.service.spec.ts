import { TestBed } from "@angular/core/testing";

import { CityGridThreeService } from "./city-grid-three.service";

describe("CityGridThreeService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: CityGridThreeService = TestBed.get(CityGridThreeService);
    expect(service).toBeTruthy();
  });
});
