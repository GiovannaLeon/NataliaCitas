import { Injectable, computed, signal } from '@angular/core';

import type { LookingForOption } from './candidates';

export type UserProfileDraft = {
  email: string;
  username: string;
  lookingFor: LookingForOption;
  country: string;
  postalCode: string;
  discreetStyle: string;
  relationshipGoal: string;
  greeting: string;
  aboutMe: string;
  height: string;
  weight: string;
  photoName: string;
  photoPreviewUrl: string;
  city: string;
  district: string;
  occupation: string;
  headline: string;
  interests: string[];
  idealPlan: string[];
  boundaries: string[];
};

const STORAGE_KEY = 'natalia-user-profile';

const DEFAULT_PROFILE: UserProfileDraft = {
  email: '',
  username: '',
  lookingFor: 'Mujer busca hombres',
  country: 'Peru',
  postalCode: '',
  discreetStyle: '',
  relationshipGoal: 'Algo a corto plazo',
  greeting: '',
  aboutMe: '',
  height: '1,65m',
  weight: '55kg',
  photoName: '',
  photoPreviewUrl: '',
  city: 'Lima',
  district: '',
  occupation: '',
  headline: '',
  interests: [],
  idealPlan: [],
  boundaries: [],
};

@Injectable({ providedIn: 'root' })
export class UserProfileStore {
  private readonly profileState = signal<UserProfileDraft>(this.load());

  readonly profile = this.profileState.asReadonly();

  readonly isComplete = computed(() => {
    const profile = this.profileState();
    return Boolean(
      profile.username.trim() &&
        profile.city.trim() &&
        profile.district.trim() &&
        profile.occupation.trim() &&
        profile.headline.trim() &&
        profile.greeting.trim() &&
        profile.aboutMe.trim().length >= 20 &&
        profile.interests.length >= 2,
    );
  });

  seedFromRegistration(payload: Partial<UserProfileDraft>): void {
    const merged = {
      ...this.profileState(),
      ...payload,
    } satisfies UserProfileDraft;

    this.profileState.set(merged);
    this.persist(merged);
  }

  updateProfile(payload: UserProfileDraft): void {
    this.profileState.set(payload);
    this.persist(payload);
  }

  private load(): UserProfileDraft {
    if (typeof localStorage === 'undefined') {
      return DEFAULT_PROFILE;
    }

    const saved = localStorage.getItem(STORAGE_KEY);

    if (!saved) {
      return DEFAULT_PROFILE;
    }

    try {
      return {
        ...DEFAULT_PROFILE,
        ...(JSON.parse(saved) as Partial<UserProfileDraft>),
      };
    } catch {
      return DEFAULT_PROFILE;
    }
  }

  private persist(profile: UserProfileDraft): void {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
  }
}
