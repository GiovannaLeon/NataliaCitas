import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import {
  CHAT_MESSAGES,
  type CandidateProfile,
  type ChatMessage,
  getCandidatesForLookingFor,
  getMatchListLabel,
  inferLookingForFromSlug,
  type LookingForOption,
} from '../../data/candidates';
import { UserProfileStore } from '../../data/user-profile.store';

type CandidateFilter = 'all' | 'active' | 'fast' | 'new';
type CandidateSection = 'candidatos' | 'chat' | 'favoritos' | 'explorar';

@Component({
  selector: 'app-candidates-page',
  imports: [RouterLink],
  templateUrl: './candidates-page.html',
  styleUrl: './candidates-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CandidatesPage {
  private readonly initialSelectedCandidateSlug = String(history.state?.selectedCandidateSlug ?? '');
  private readonly userProfileStore = inject(UserProfileStore);
  private readonly conversations = signal<Record<string, ChatMessage[]>>(
    Object.fromEntries(Object.entries(CHAT_MESSAGES).map(([slug, messages]) => [slug, [...messages]])) as Record<string, ChatMessage[]>,
  );
  protected readonly lookingFor = signal<LookingForOption>(
    (history.state?.lookingFor as LookingForOption | undefined) ?? inferLookingForFromSlug(this.initialSelectedCandidateSlug),
  );
  protected readonly showWelcomeModal = signal<boolean>(Boolean(history.state?.showWelcomeModal));
  protected readonly confirmationEmail = signal<string>(history.state?.email ?? 'tu-correo@privado.com');
  protected readonly activeFilter = signal<CandidateFilter>('all');
  protected readonly activeSection = signal<CandidateSection>('candidatos');
  protected readonly favoriteSlugs = signal<string[]>([]);

  constructor() {
    const currentUsername = String(history.state?.currentUsername ?? '').trim();

    if (currentUsername) {
      this.userProfileStore.seedFromRegistration({ username: currentUsername });
    }
  }

  protected readonly currentUsername = computed(() => {
    const username = this.userProfileStore.profile().username.trim();
    return username || 'Mi perfil';
  });

  protected readonly profileCompleted = computed(() => this.userProfileStore.isComplete());
  protected readonly currentUserPhotoUrl = computed(() => this.userProfileStore.profile().photoPreviewUrl.trim());
  protected readonly currentUserInitial = computed(() => this.currentUsername().charAt(0).toUpperCase());

  protected readonly matchListLabel = computed(() => {
    return getMatchListLabel(this.lookingFor());
  });

  protected readonly matchesHeading = computed(() => {
    return this.matchListLabel() === 'Candidatos' ? 'Candidatos listos para hablar contigo' : 'Candidatas listas para hablar contigo';
  });

  protected readonly allCandidates = computed(() => {
    return getCandidatesForLookingFor(this.lookingFor());
  });

  protected readonly candidates = computed(() => {
    const filter = this.activeFilter();
    const allCandidates = this.allCandidates();

    switch (filter) {
      case 'active':
        return allCandidates.filter((candidate) => candidate.status === 'Disponible ahora' || candidate.status === 'Le interesa chatear');
      case 'fast':
        return allCandidates.filter((candidate) => candidate.status === 'Responde en minutos');
      case 'new':
        return allCandidates.filter((candidate) => candidate.status === 'Nueva coincidencia');
      default:
        return allCandidates;
    }
  });

  protected readonly visibleCandidates = computed(() => {
    return this.activeSection() === 'explorar' ? this.candidates() : this.allCandidates();
  });

  protected readonly favoriteCandidates = computed(() => {
    const favorites = this.favoriteSlugs();
    return this.allCandidates().filter((candidate) => favorites.includes(candidate.slug));
  });

  protected readonly selectedCandidateSlug = signal<string>(this.initialSelectedCandidateSlug);

  protected readonly selectedCandidate = computed(() => {
    return this.allCandidates().find((candidate) => candidate.slug === this.selectedCandidateSlug()) ?? this.allCandidates()[0];
  });

  protected readonly chatMessages = computed<ChatMessage[]>(() => {
    return this.conversations()[this.selectedCandidate().slug] ?? [];
  });

  protected readonly exploreFilters: Array<{ label: string; value: CandidateFilter }> = [
    { label: 'Todas', value: 'all' },
    { label: 'Activos ahora', value: 'active' },
    { label: 'Respuesta rapida', value: 'fast' },
    { label: 'Nuevos', value: 'new' },
  ];

  protected openSection(section: CandidateSection): void {
    this.activeSection.set(section);

    if (section === 'chat' && !this.selectedCandidate()) {
      this.selectedCandidateSlug.set(this.allCandidates()[0]?.slug ?? '');
    }
  }

  protected selectCandidate(candidateSlug: string): void {
    this.selectedCandidateSlug.set(candidateSlug);
    this.activeSection.set('chat');
  }

  protected setFilter(filter: CandidateFilter): void {
    this.activeFilter.set(filter);
    this.activeSection.set('explorar');

    const firstVisibleCandidate = this.candidates()[0];

    if (firstVisibleCandidate && !this.candidates().some((candidate) => candidate.slug === this.selectedCandidateSlug())) {
      this.selectedCandidateSlug.set(firstVisibleCandidate.slug);
    }
  }

  protected isFavorite(candidateSlug: string): boolean {
    return this.favoriteSlugs().includes(candidateSlug);
  }

  protected toggleFavorite(candidateSlug: string): void {
    this.favoriteSlugs.update((favorites) =>
      favorites.includes(candidateSlug) ? favorites.filter((slug) => slug !== candidateSlug) : [...favorites, candidateSlug],
    );
  }

  protected sendMessage(input: HTMLInputElement): void {
    const text = input.value.trim();

    if (!text) {
      return;
    }

    const candidate = this.selectedCandidate();
    this.appendMessage(candidate.slug, {
      from: 'me',
      text,
      time: this.getCurrentTime(),
    });
    input.value = '';

    window.setTimeout(() => {
      this.appendMessage(candidate.slug, {
        from: 'candidate',
        text: `Recibi tu mensaje. ${candidate.name} te responde pronto por aqui.`,
        time: this.getCurrentTime(),
      });
    }, 700);
  }

  protected closeWelcomeModal(): void {
    this.showWelcomeModal.set(false);
    this.selectedCandidateSlug.set(this.allCandidates()[0].slug);

    requestAnimationFrame(() => {
      document.getElementById('chat-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }

  private appendMessage(candidateSlug: string, message: ChatMessage): void {
    this.conversations.update((conversations) => ({
      ...conversations,
      [candidateSlug]: [...(conversations[candidateSlug] ?? []), message],
    }));
  }

  private getCurrentTime(): string {
    return new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  }
}