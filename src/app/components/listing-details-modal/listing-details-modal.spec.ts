import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingDetailsModal } from './listing-details-modal';

describe('ListingDetailsModal', () => {
  let component: ListingDetailsModal;
  let fixture: ComponentFixture<ListingDetailsModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingDetailsModal],
    }).compileComponents();

    fixture = TestBed.createComponent(ListingDetailsModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
