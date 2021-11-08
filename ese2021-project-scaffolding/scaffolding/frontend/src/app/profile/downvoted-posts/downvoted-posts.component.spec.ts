import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DownvotedPostsComponent } from './downvoted-posts.component';

describe('DownvotedPostsComponent', () => {
  let component: DownvotedPostsComponent;
  let fixture: ComponentFixture<DownvotedPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ DownvotedPostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DownvotedPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
