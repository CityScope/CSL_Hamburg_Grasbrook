import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BasemapTestComponent } from './basemap-test.component';

describe('BasemapTestComponent', () => {
  let component: BasemapTestComponent;
  let fixture: ComponentFixture<BasemapTestComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BasemapTestComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BasemapTestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
