import { TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';

import { UserProfileStore } from '../../data/user-profile.store';
import { LoginPage } from './login-page';

describe('LoginPage', () => {
  let router: Router;
  let seedFromRegistration: ReturnType<typeof vi.fn>;

  beforeEach(async () => {
    seedFromRegistration = vi.fn();

    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([]),
        {
          provide: UserProfileStore,
          useValue: {
            seedFromRegistration,
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigate').mockResolvedValue(true);
  });

  it('envia a GiovannaPlanes a candidatos con la prueba vencida', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;

    component['signIn']('GiovannaPlanes', '123456');

    expect(seedFromRegistration).toHaveBeenCalledWith({
      username: 'GiovannaPlanes',
      membershipStatus: 'expired-trial',
      selectedPlan: '',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/candidatos'], {
      state: {
        currentUsername: 'GiovannaPlanes',
      },
    });
  });

  it('mantiene acceso activo para otros usuarios', () => {
    const fixture = TestBed.createComponent(LoginPage);
    const component = fixture.componentInstance;

    component['signIn']('NataliaDemo', '123456');

    expect(seedFromRegistration).toHaveBeenCalledWith({
      username: 'NataliaDemo',
      membershipStatus: 'active',
      selectedPlan: '',
    });
    expect(router.navigate).toHaveBeenCalledWith(['/candidatos'], {
      state: {
        currentUsername: 'NataliaDemo',
      },
    });
  });
});