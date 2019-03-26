import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CityioComponent } from './cityio.component';

describe('CityioComponent', () => {
  let component: CityioComponent;
  let fixture: ComponentFixture<CityioComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CityioComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CityioComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
