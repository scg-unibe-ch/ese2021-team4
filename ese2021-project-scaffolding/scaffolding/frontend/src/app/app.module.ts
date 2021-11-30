import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouterModule, Routes } from '@angular/router';

import { AppComponent } from './app.component';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { TodoListComponent } from './todo-list/todo-list.component';
// import { TodoItemComponent } from './todo-list/todo-item/todo-item.component';
import { HTTP_INTERCEPTORS, HttpClientModule } from '@angular/common/http';
import { MatListModule } from '@angular/material/list';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthInterceptor } from './auth/auth.interceptor';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { ProfileComponent } from './profile/profile.component';
import {MatIconModule} from "@angular/material/icon";
import { PostFeedComponent } from './post-feed/post-feed.component';
import { PostComponent } from './post-feed/post/post.component';
import {MatSelectModule} from "@angular/material/select";
import { AngularEditorModule } from '@kolkov/angular-editor';
import { CommentComponent } from './post-feed/post/comment/comment.component';
import {MatGridListModule} from '@angular/material/grid-list';
import {MatChipsModule} from "@angular/material/chips";
import { FanShopComponent } from './fan-shop/fan-shop.component';
import { ProductComponent } from './fan-shop/product/product.component';
import { OrderComponent } from './fan-shop/order/order.component';
import { OrderFormComponent } from './fan-shop/order-form/order-form.component';
import { NgxStripeModule } from 'ngx-stripe';
import { AdminDashboardComponent } from './admin-dashboard/admin-dashboard.component';
import { OrderFeedComponent } from './fan-shop/order-feed/order-feed.component';
import { UserListComponent } from './admin-dashboard/user-list/user-list.component';



const routes: Routes = [
  {path: 'home', component: HomeComponent},
  {path: '', redirectTo: '/home', pathMatch:'full'},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'profile', component: ProfileComponent},
  {path: 'home/post/:id', component: PostComponent},
  {path: 'profile/post/:id', component: PostComponent},
  {path: 'fan-shop', component: FanShopComponent},
  {path: 'fan-shop/product/:id', component: ProductComponent},
  {path: 'fan-shop/product/:id/order', component: OrderFormComponent},
  {path: 'dashboard', component: AdminDashboardComponent}
];
@NgModule({
  declarations: [
    AppComponent,
    // TodoListComponent,
    // TodoItemComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    PostFeedComponent,
    PostComponent,
    CommentComponent,
    PostComponent,
    FanShopComponent,
    ProductComponent,
    OrderComponent,
    OrderFormComponent,
    AdminDashboardComponent,
    OrderFeedComponent,
    UserListComponent
  ],
    imports: [
        BrowserModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatToolbarModule,
        MatTabsModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        MatListModule,
        FormsModule,
        MatCheckboxModule,
        RouterModule.forRoot(routes),
        MatIconModule,
        MatSelectModule,
        AngularEditorModule,
        ReactiveFormsModule,
        MatGridListModule,
        MatChipsModule,
        NgxStripeModule.forRoot('pk_test_51K0pOrIFU9ZBSiczIlnqN7V1M1A7mf0vb6KDUJR01ajD8j3Lfht3SPgImeSnweRtNr29wjknKCEn2gGd4Zwha6Bx00VKqhuUP6')
        // Component
    ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule {}
