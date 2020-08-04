import { NgModule } from "@angular/core";
import { PreloadAllModules, RouterModule, Routes } from "@angular/router";
import { AuthGuard } from "./services/auth/auth.guard";
import { ErrorComponent } from "./components/error/error.component";

const routes: Routes = [
  {
    path: "",
    redirectTo: "sign-in",
    pathMatch: "full",
  },
  {
    path: "sign-in",
    loadChildren: () =>
      import("./sign-in/sign-in.module").then((m) => m.SignInPageModule),
  },
  { path: "channel-not-found", component: ErrorComponent },
  {
    path: ":id",
    canActivate: [AuthGuard],
    loadChildren: () =>
      import("./channel/channel.module").then((m) => m.ChannelPageModule),
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      preloadingStrategy: PreloadAllModules,
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
