import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListingCard } from './listing-card';

import { provideRouter } from '@angular/router';

describe('ListingCard', () => {
  let component: ListingCard;
  let fixture: ComponentFixture<ListingCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ListingCard],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(ListingCard);
    component = fixture.componentInstance;
    component.listing = {
      id: 1,
      advertiserId: 1,
      advertiserName: 'Test Advertiser',
      advertiserAvatar: 'test.jpg',
      title: 'Test Listing',
      description: 'Test Description',
      price: 100,
      type: 'ITEM',
      tags: ['test'],
      rating: 5,
      reviewCount: 0,
      imageUrl: 'test.jpg'
    };
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
