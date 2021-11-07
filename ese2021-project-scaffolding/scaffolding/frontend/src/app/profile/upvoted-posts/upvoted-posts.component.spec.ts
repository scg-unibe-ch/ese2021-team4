import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UpvotedPostsComponent } from './upvoted-posts.component';

describe('UpvotedPostsComponent', () => {
  let component: UpvotedPostsComponent;
  let fixture: ComponentFixture<UpvotedPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ UpvotedPostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(UpvotedPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
