import { ChangeDetectionStrategy, Component, computed, effect, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import type { LookingForOption } from '../../data/candidates';
import { UserProfileStore } from '../../data/user-profile.store';

@Component({
  selector: 'app-user-profile-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserProfilePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userProfileStore = inject(UserProfileStore);

  protected readonly profileForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(4)]],
    lookingFor: ['Mujer busca hombres' as LookingForOption, Validators.required],
    country: ['Peru', Validators.required],
    postalCode: ['', [Validators.required, Validators.minLength(4)]],
    city: ['Lima', Validators.required],
    district: ['', Validators.required],
    occupation: ['', Validators.required],
    discreetStyle: ['', Validators.required],
    relationshipGoal: ['Algo a corto plazo', Validators.required],
    headline: ['', [Validators.required, Validators.maxLength(110)]],
    greeting: ['', [Validators.required, Validators.maxLength(64)]],
    aboutMe: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    height: ['1,65m', Validators.required],
    weight: ['55kg', Validators.required],
    photoName: [''],
    photoPreviewUrl: [''],
    interestsText: ['', Validators.required],
    idealPlanText: ['', Validators.required],
    boundariesText: ['', Validators.required],
  });

  private readonly formValue = toSignal(this.profileForm.valueChanges, {
    initialValue: this.profileForm.getRawValue(),
  });

  protected readonly profilePreview = computed(() => {
    const value = this.formValue();

    return {
      username: value.username?.trim() || 'Tu alias',
      city: value.city?.trim() || 'Lima',
      district: value.district?.trim() || 'Distrito',
      occupation: value.occupation?.trim() || 'Tu ocupacion',
      headline: value.headline?.trim() || 'Tu frase principal del perfil aparecera aqui.',
      greeting: value.greeting?.trim() || 'Tu saludo corto aparecera aqui.',
      aboutMe: value.aboutMe?.trim() || 'Completa tu descripcion para que otras personas entiendan mejor tu estilo y lo que buscas.',
      discreetStyle: value.discreetStyle?.trim() || 'Estilo discreto pendiente',
      relationshipGoal: value.relationshipGoal?.trim() || 'Objetivo pendiente',
      height: value.height?.trim() || '1,65m',
      weight: value.weight?.trim() || '55kg',
      photoName: value.photoName?.trim() || 'Sin foto cargada',
      photoPreviewUrl: value.photoPreviewUrl?.trim() || '',
      interests: this.parseList(value.interestsText ?? ''),
      idealPlan: this.parseList(value.idealPlanText ?? ''),
      boundaries: this.parseList(value.boundariesText ?? ''),
    };
  });

  constructor() {
    effect(() => {
      const profile = this.userProfileStore.profile();

      this.profileForm.patchValue(
        {
          ...profile,
          interestsText: profile.interests.join(', '),
          idealPlanText: profile.idealPlan.join(', '),
          boundariesText: profile.boundaries.join(', '),
        },
        { emitEvent: true },
      );
    });
  }

  protected openPhotoPicker(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  protected onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    if (!file) {
      return;
    }

    this.profileForm.controls.photoName.setValue(file.name);
    this.profileForm.controls.photoName.markAsDirty();

    const reader = new FileReader();
    reader.onload = () => {
      this.profileForm.controls.photoPreviewUrl.setValue(String(reader.result ?? ''));
      this.profileForm.controls.photoPreviewUrl.markAsDirty();
    };
    reader.readAsDataURL(file);
  }

  protected saveProfile(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    const rawValue = this.profileForm.getRawValue();

    this.userProfileStore.updateProfile({
      email: rawValue.email,
      username: rawValue.username,
      lookingFor: rawValue.lookingFor,
      country: rawValue.country,
      postalCode: rawValue.postalCode,
      discreetStyle: rawValue.discreetStyle,
      relationshipGoal: rawValue.relationshipGoal,
      greeting: rawValue.greeting,
      aboutMe: rawValue.aboutMe,
      height: rawValue.height,
      weight: rawValue.weight,
      photoName: rawValue.photoName,
      photoPreviewUrl: rawValue.photoPreviewUrl,
      city: rawValue.city,
      district: rawValue.district,
      occupation: rawValue.occupation,
      headline: rawValue.headline,
      interests: this.parseList(rawValue.interestsText),
      idealPlan: this.parseList(rawValue.idealPlanText),
      boundaries: this.parseList(rawValue.boundariesText),
    });

    void this.router.navigate(['/candidatos'], {
      state: {
        lookingFor: rawValue.lookingFor,
      },
    });
  }

  private parseList(input: string): string[] {
    return input
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean);
  }
}
