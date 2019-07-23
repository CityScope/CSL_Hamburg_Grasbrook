import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DeckglComponent } from './deckgl.component';

describe('DeckglComponent', () => {
  let component: DeckglComponent;
  let fixture: ComponentFixture<DeckglComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DeckglComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DeckglComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
