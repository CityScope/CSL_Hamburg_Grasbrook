import { TestBed } from "@angular/core/testing";

import { SumoService } from "./sumo.service";

describe("SumoService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: SumoService = TestBed.get(SumoService);
    expect(service).toBeTruthy();
  });
});
