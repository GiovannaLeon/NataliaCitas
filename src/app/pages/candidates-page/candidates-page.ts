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
type CandidateSection = 'candidatos' | 'chat' | 'favoritos' | 'explorar' | 'actividad';
type ActivityTab = 'favoritos' | 'bloqueados' | 'conversaciones';
type ConversationRangePreset = 'all' | 'today' | '7d' | '30d' | 'custom';
type ConversationSummary = {
  slug: string;
  name: string;
  accent: string;
  latestMessage: string;
  latestTime: string;
  latestSentAt: string;
  unreadCount: number;
};
type ConversationActivity = {
  slug: string;
  name: string;
  accent: string;
  latestMessage: string;
  latestTimeLabel: string;
  latestDateLabel: string;
  latestSentAt: string;
  messagesInRange: number;
  totalMessages: number;
  isFavorite: boolean;
  isBlocked: boolean;
};

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
  private readonly readMessageCounts = signal<Record<string, number>>(this.buildInitialReadState());
  protected readonly lookingFor = signal<LookingForOption>(
    (history.state?.lookingFor as LookingForOption | undefined) ?? inferLookingForFromSlug(this.initialSelectedCandidateSlug),
  );
  protected readonly showWelcomeModal = signal<boolean>(Boolean(history.state?.showWelcomeModal));
  protected readonly confirmationEmail = signal<string>(history.state?.email ?? 'tu-correo@privado.com');
  protected readonly activeFilter = signal<CandidateFilter>('all');
  protected readonly activeSection = signal<CandidateSection>('candidatos');
  protected readonly activeActivityTab = signal<ActivityTab>('conversaciones');
  protected readonly activitySearchQuery = signal<string>('');
  protected readonly conversationRangePreset = signal<ConversationRangePreset>('30d');
  protected readonly conversationStartDate = signal<string>(this.getDateInputValue(this.shiftDays(new Date(), -30)));
  protected readonly conversationEndDate = signal<string>(this.getDateInputValue(new Date()));
  protected readonly favoriteSlugs = signal<string[]>([]);
  protected readonly blockedSlugs = signal<string[]>([]);

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

  protected readonly availableCandidates = computed(() => {
    const blocked = this.blockedSlugs();
    return this.allCandidates().filter((candidate) => !blocked.includes(candidate.slug));
  });

  protected readonly candidates = computed(() => {
    const filter = this.activeFilter();
    const allCandidates = this.availableCandidates();

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
    return this.activeSection() === 'explorar' ? this.candidates() : this.availableCandidates();
  });

  protected readonly favoriteCandidates = computed(() => {
    const favorites = this.favoriteSlugs();
    return this.availableCandidates().filter((candidate) => favorites.includes(candidate.slug));
  });

  protected readonly activityFavoriteCandidates = computed(() => {
    const favorites = this.favoriteSlugs();
    return this.allCandidates().filter((candidate) => favorites.includes(candidate.slug));
  });

  protected readonly filteredActivityFavoriteCandidates = computed(() => {
    const query = this.activitySearchQuery().trim().toLowerCase();
    return this.activityFavoriteCandidates().filter((candidate) => this.matchesCandidateQuery(candidate, query));
  });

  protected readonly blockedCandidates = computed(() => {
    const blocked = this.blockedSlugs();
    return this.allCandidates().filter((candidate) => blocked.includes(candidate.slug));
  });

  protected readonly filteredBlockedCandidates = computed(() => {
    const query = this.activitySearchQuery().trim().toLowerCase();
    return this.blockedCandidates().filter((candidate) => this.matchesCandidateQuery(candidate, query));
  });

  protected readonly selectedCandidateSlug = signal<string>(this.initialSelectedCandidateSlug);

  protected readonly selectedCandidate = computed(() => {
    return this.availableCandidates().find((candidate) => candidate.slug === this.selectedCandidateSlug()) ?? this.availableCandidates()[0] ?? null;
  });

  protected readonly chatMessages = computed<ChatMessage[]>(() => {
    const selectedCandidate = this.selectedCandidate();
    return selectedCandidate ? this.conversations()[selectedCandidate.slug] ?? [] : [];
  });

  protected readonly conversationSummaries = computed<ConversationSummary[]>(() => {
    const conversations = this.conversations();
    const readMessageCounts = this.readMessageCounts();

    return this.availableCandidates()
      .map((candidate) => {
        const messages = conversations[candidate.slug] ?? [];

        if (!messages.length) {
          return null;
        }

        const latestMessage = messages[messages.length - 1];

        return {
          slug: candidate.slug,
          name: candidate.name,
          accent: candidate.accent,
          latestMessage: latestMessage.text,
          latestTime: latestMessage.time,
          latestSentAt: latestMessage.sentAt,
          unreadCount: this.countUnreadMessages(messages, readMessageCounts[candidate.slug] ?? 0),
        } satisfies ConversationSummary;
      })
      .filter((summary): summary is ConversationSummary => summary !== null)
      .sort((left, right) => right.unreadCount - left.unreadCount || right.latestSentAt.localeCompare(left.latestSentAt));
  });

  protected readonly visibleConversationSummaries = computed(() => this.conversationSummaries().slice(0, 4));
  protected readonly unreadMessagesCount = computed(() => {
    return this.conversationSummaries().reduce((total, summary) => total + summary.unreadCount, 0);
  });
  protected readonly filteredConversationActivity = computed<ConversationActivity[]>(() => {
    const range = this.getConversationRange();
    const favorites = this.favoriteSlugs();
    const blocked = this.blockedSlugs();
    const query = this.activitySearchQuery().trim().toLowerCase();

    return this.allCandidates()
      .map((candidate) => {
        const messages = this.conversations()[candidate.slug] ?? [];

        if (!messages.length) {
          return null;
        }

        const messagesInRange = range
          ? messages.filter((message) => {
              const sentAt = new Date(message.sentAt).getTime();
              return sentAt >= range.start.getTime() && sentAt <= range.end.getTime();
            })
          : messages;

        if (!messagesInRange.length) {
          return null;
        }

        const latestMessage = messagesInRange[messagesInRange.length - 1];

        return {
          slug: candidate.slug,
          name: candidate.name,
          accent: candidate.accent,
          latestMessage: latestMessage.text,
          latestTimeLabel: latestMessage.time,
          latestDateLabel: this.formatDateLabel(latestMessage.sentAt),
          latestSentAt: latestMessage.sentAt,
          messagesInRange: messagesInRange.length,
          totalMessages: messages.length,
          isFavorite: favorites.includes(candidate.slug),
          isBlocked: blocked.includes(candidate.slug),
        } satisfies ConversationActivity;
      })
      .filter((activity): activity is ConversationActivity => activity !== null)
      .filter((activity) => this.matchesConversationQuery(activity, query))
      .sort((left, right) => right.latestSentAt.localeCompare(left.latestSentAt));
  });
  protected readonly activitySearchPlaceholder = computed(() => {
    switch (this.activeActivityTab()) {
      case 'favoritos':
        return 'Buscar favoritos por nombre, ciudad o profesion';
      case 'bloqueados':
        return 'Buscar bloqueados por nombre, ciudad o motivo';
      default:
        return 'Buscar conversaciones, personas o mensajes';
    }
  });

  protected readonly exploreFilters: Array<{ label: string; value: CandidateFilter }> = [
    { label: 'Todas', value: 'all' },
    { label: 'Activos ahora', value: 'active' },
    { label: 'Respuesta rapida', value: 'fast' },
    { label: 'Nuevos', value: 'new' },
  ];
  protected readonly activityTabs: Array<{ label: string; value: ActivityTab }> = [
    { label: 'Conversaciones', value: 'conversaciones' },
    { label: 'Favoritos', value: 'favoritos' },
    { label: 'Bloqueados', value: 'bloqueados' },
  ];
  protected readonly conversationRangePresets: Array<{ label: string; value: ConversationRangePreset }> = [
    { label: 'Todo', value: 'all' },
    { label: 'Hoy', value: 'today' },
    { label: '7 dias', value: '7d' },
    { label: '30 dias', value: '30d' },
    { label: 'Personalizado', value: 'custom' },
  ];

  protected openSection(section: CandidateSection): void {
    this.activeSection.set(section);

    if (section === 'chat' && !this.selectedCandidate()) {
      this.selectedCandidateSlug.set(this.availableCandidates()[0]?.slug ?? '');
    }

    if (section === 'chat' && this.selectedCandidateSlug()) {
      this.markConversationAsRead(this.selectedCandidateSlug());
    }
  }

  protected selectCandidate(candidateSlug: string): void {
    this.selectedCandidateSlug.set(candidateSlug);
    this.activeSection.set('chat');
    this.markConversationAsRead(candidateSlug);
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

  protected removeFavorite(candidateSlug: string): void {
    this.favoriteSlugs.update((favorites) => favorites.filter((slug) => slug !== candidateSlug));
  }

  protected isBlocked(candidateSlug: string): boolean {
    return this.blockedSlugs().includes(candidateSlug);
  }

  protected blockCandidate(candidateSlug: string): void {
    if (this.isBlocked(candidateSlug)) {
      return;
    }

    const nextBlocked = [...this.blockedSlugs(), candidateSlug];
    this.blockedSlugs.set(nextBlocked);
    this.favoriteSlugs.update((favorites) => favorites.filter((slug) => slug !== candidateSlug));

    if (this.selectedCandidateSlug() === candidateSlug) {
      const nextCandidate = this.allCandidates().find((candidate) => !nextBlocked.includes(candidate.slug));
      this.selectedCandidateSlug.set(nextCandidate?.slug ?? '');

      if (!nextCandidate && this.activeSection() === 'chat') {
        this.activeSection.set('candidatos');
      }
    }
  }

  protected unblockCandidate(candidateSlug: string): void {
    this.blockedSlugs.update((blocked) => blocked.filter((slug) => slug !== candidateSlug));
  }

  protected setActivityTab(tab: ActivityTab): void {
    this.activeActivityTab.set(tab);
  }

  protected updateActivitySearchQuery(value: string): void {
    this.activitySearchQuery.set(value);
  }

  protected setConversationRangePreset(preset: ConversationRangePreset): void {
    this.conversationRangePreset.set(preset);

    if (preset === 'custom') {
      return;
    }

    if (preset === 'all') {
      this.conversationStartDate.set('');
      this.conversationEndDate.set('');
      return;
    }

    const today = new Date();
    const startDate = preset === 'today' ? today : this.shiftDays(today, preset === '7d' ? -6 : -29);

    this.conversationStartDate.set(this.getDateInputValue(startDate));
    this.conversationEndDate.set(this.getDateInputValue(today));
  }

  protected updateConversationStartDate(value: string): void {
    this.conversationRangePreset.set('custom');
    this.conversationStartDate.set(value);
  }

  protected updateConversationEndDate(value: string): void {
    this.conversationRangePreset.set('custom');
    this.conversationEndDate.set(value);
  }

  protected sendMessage(input: HTMLInputElement): void {
    const text = input.value.trim();
    const candidate = this.selectedCandidate();

    if (!text || !candidate) {
      return;
    }

    this.appendMessage(candidate.slug, {
      from: 'me',
      text,
      time: this.getCurrentTime(),
      sentAt: new Date().toISOString(),
    });
    this.markConversationAsRead(candidate.slug);
    input.value = '';

    window.setTimeout(() => {
      this.appendMessage(candidate.slug, {
        from: 'candidate',
        text: `Recibi tu mensaje. ${candidate.name} te responde pronto por aqui.`,
        time: this.getCurrentTime(),
        sentAt: new Date().toISOString(),
      });

      if (this.activeSection() === 'chat' && this.selectedCandidateSlug() === candidate.slug) {
        this.markConversationAsRead(candidate.slug);
      }
    }, 700);
  }

  protected closeWelcomeModal(): void {
    this.showWelcomeModal.set(false);

    const firstCandidate = this.availableCandidates()[0];

    if (!firstCandidate) {
      return;
    }

    this.selectedCandidateSlug.set(firstCandidate.slug);

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

  private buildInitialReadState(): Record<string, number> {
    return Object.fromEntries(
      Object.entries(this.conversations()).map(([slug, messages]) => [slug, Math.max(0, messages.length - this.countTrailingCandidateMessages(messages))]),
    );
  }

  private countTrailingCandidateMessages(messages: ChatMessage[]): number {
    let unreadCount = 0;

    for (let index = messages.length - 1; index >= 0; index -= 1) {
      if (messages[index]?.from !== 'candidate') {
        break;
      }

      unreadCount += 1;
    }

    return unreadCount;
  }

  private countUnreadMessages(messages: ChatMessage[], readCount: number): number {
    return messages.slice(readCount).filter((message) => message.from === 'candidate').length;
  }

  private markConversationAsRead(candidateSlug: string): void {
    const messages = this.conversations()[candidateSlug] ?? [];

    this.readMessageCounts.update((current) => ({
      ...current,
      [candidateSlug]: messages.length,
    }));
  }

  private getCurrentTime(): string {
    return new Intl.DateTimeFormat('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).format(new Date());
  }

  private getConversationRange(): { start: Date; end: Date } | null {
    if (this.conversationRangePreset() === 'all') {
      return null;
    }

    const startValue = this.conversationStartDate();
    const endValue = this.conversationEndDate();

    if (!startValue || !endValue) {
      return null;
    }

    const start = new Date(`${startValue}T00:00:00`);
    const end = new Date(`${endValue}T23:59:59.999`);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
      return null;
    }

    return start <= end ? { start, end } : { start: end, end: start };
  }

  private getDateInputValue(date: Date): string {
    return date.toISOString().slice(0, 10);
  }

  private shiftDays(date: Date, amount: number): Date {
    const copy = new Date(date);
    copy.setDate(copy.getDate() + amount);
    return copy;
  }

  private formatDateLabel(isoDate: string): string {
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(new Date(isoDate));
  }

  private matchesCandidateQuery(candidate: CandidateProfile, query: string): boolean {
    if (!query) {
      return true;
    }

    const searchableText = [candidate.name, candidate.city, candidate.district, candidate.occupation, candidate.headline, candidate.intro]
      .join(' ')
      .toLowerCase();

    return searchableText.includes(query);
  }

  private matchesConversationQuery(activity: ConversationActivity, query: string): boolean {
    if (!query) {
      return true;
    }

    const searchableText = [activity.name, activity.latestMessage, activity.latestDateLabel, activity.isFavorite ? 'favorito' : '', activity.isBlocked ? 'bloqueado' : '']
      .join(' ')
      .toLowerCase();

    return searchableText.includes(query);
  }
}