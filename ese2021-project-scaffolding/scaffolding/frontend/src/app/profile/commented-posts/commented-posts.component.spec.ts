import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommentedPostsComponent } from './commented-posts.component';

describe('CommentedPostsComponent', () => {
  let component: CommentedPostsComponent;
  let fixture: ComponentFixture<CommentedPostsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ CommentedPostsComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CommentedPostsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
