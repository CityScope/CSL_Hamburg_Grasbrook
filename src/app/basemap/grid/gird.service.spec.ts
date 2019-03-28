import { TestBed } from "@angular/core/testing";

import { GirdService } from "./gird.service";

describe("GirdService", () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it("should be created", () => {
    const service: GirdService = TestBed.get(GirdService);
    expect(service).toBeTruthy();
  });
});
