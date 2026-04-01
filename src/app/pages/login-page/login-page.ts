import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { UserProfileStore } from '../../data/user-profile.store';

@Component({
  selector: 'app-login-page',
  imports: [RouterLink],
  templateUrl: './login-page.html',
  styleUrl: './login-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly router = inject(Router);
  private readonly userProfileStore = inject(UserProfileStore);

  protected readonly loginError = signal('');

  protected signIn(username: string, password: string): void {
    if (!username.trim() || !password.trim()) {
      this.loginError.set('Ingresa tu usuario y tu contrasena para continuar.');
      return;
    }

    this.loginError.set('');
    this.userProfileStore.seedFromRegistration({
      username: username.trim(),
    });
    void this.router.navigate(['/candidatos'], {
      state: {
        currentUsername: username.trim(),
      },
    });
  }
}