import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { FeatureTooltipComponent } from './feature-tooltip.component';

describe('FeatureTooltipComponent', () => {
  let component: FeatureTooltipComponent;
  let fixture: ComponentFixture<FeatureTooltipComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ FeatureTooltipComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(FeatureTooltipComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
