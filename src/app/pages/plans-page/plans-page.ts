import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { UserProfileStore } from '../../data/user-profile.store';

type PlanCard = {
  name: string;
  price: string;
  cadence: string;
  badge: string;
  summary: string;
  features: string[];
  featured: boolean;
};

@Component({
  selector: 'app-plans-page',
  imports: [RouterLink],
  templateUrl: './plans-page.html',
  styleUrl: './plans-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PlansPage {
  private readonly router = inject(Router);
  private readonly userProfileStore = inject(UserProfileStore);

  protected readonly hasRestrictedAccess = computed(() => this.userProfileStore.hasRestrictedAccess());
  protected readonly currentUsername = computed(() => this.userProfileStore.profile().username.trim() || 'Invitada');
  protected readonly selectedPlan = computed(() => this.userProfileStore.profile().selectedPlan.trim());
  protected readonly headline = computed(() =>
    this.hasRestrictedAccess() ? 'Sigue usando Natalia con un plan privado' : 'Gestiona tu acceso premium desde el frontend',
  );
  protected readonly intro = computed(() =>
    this.hasRestrictedAccess()
      ? 'La prueba visual de esta cuenta ya vencio. Elige un plan para volver a entrar a chats, favoritos y actividad.'
      : 'Esta pantalla es solo frontend. Puedes simular activacion de planes sin backend ni cobros reales.',
  );
  protected readonly planActionLabel = computed(() =>
    this.hasRestrictedAccess() ? 'Simular pago y activar acceso' : 'Simular activacion',
  );
  protected readonly plans: PlanCard[] = [
    {
      name: 'Escapada',
      price: 'S/ 59',
      cadence: 'por mes',
      badge: 'Entrada privada',
      summary: 'Para volver a chatear y revisar actividad sin limitar la navegacion.',
      features: ['Mensajes privados ilimitados', 'Favoritos y actividad activos', 'Perfil visible todo el mes'],
      featured: false,
    },
    {
      name: 'Reserva',
      price: 'S/ 99',
      cadence: 'por mes',
      badge: 'Mas elegido',
      summary: 'Activa prioridad visual, filtros rapidos y una experiencia mas completa.',
      features: ['Todo lo del plan Escapada', 'Prioridad en coincidencias', 'Acceso rapido a perfiles destacados'],
      featured: true,
    },
    {
      name: 'Secreto Black',
      price: 'S/ 149',
      cadence: 'por mes',
      badge: 'Alta discrecion',
      summary: 'Pensado para una cuenta premium con mayor control y un tono mas exclusivo.',
      features: ['Todo lo del plan Reserva', 'Etiqueta premium en el perfil', 'Simulacion de soporte prioritario'],
      featured: false,
    },
  ];

  protected choosePlan(planName: string): void {
    this.userProfileStore.activatePlan(planName);

    void this.router.navigate(['/candidatos'], {
      state: {
        currentUsername: this.currentUsername(),
      },
    });
  }
}