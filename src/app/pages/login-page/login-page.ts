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
  private readonly plansDemoUsername = 'giovannaplanes';

  protected readonly loginError = signal('');

  protected signIn(username: string, password: string): void {
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();

    if (!cleanUsername || !cleanPassword) {
      this.loginError.set('Ingresa tu usuario y tu contrasena para continuar.');
      return;
    }

    const hasExpiredTrial = cleanUsername.toLowerCase() === this.plansDemoUsername;

    this.loginError.set('');
    this.userProfileStore.seedFromRegistration({
      username: cleanUsername,
      membershipStatus: hasExpiredTrial ? 'expired-trial' : 'active',
      selectedPlan: '',
    });

    void this.router.navigate([hasExpiredTrial ? '/planes' : '/candidatos'], {
      state: {
        currentUsername: cleanUsername,
      },
    });
  }
}