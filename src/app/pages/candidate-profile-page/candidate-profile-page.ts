import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { getCandidateBySlug, inferLookingForFromSlug } from '../../data/candidates';

@Component({
  selector: 'app-candidate-profile-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './candidate-profile-page.html',
  styleUrl: './candidate-profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidateProfilePage {
  private readonly route = inject(ActivatedRoute);
  private readonly paramMap = toSignal(this.route.paramMap, { initialValue: this.route.snapshot.paramMap });

  protected readonly candidate = computed(() => {
    const slug = this.paramMap()?.get('slug') ?? '';
    return getCandidateBySlug(slug) ?? null;
  });

  protected readonly backNavigationState = computed(() => {
    const candidate = this.candidate();

    if (!candidate) {
      return { lookingFor: 'Mujer busca hombres' };
    }

    return {
      lookingFor: inferLookingForFromSlug(candidate.slug),
      selectedCandidateSlug: candidate.slug,
    };
  });
}
