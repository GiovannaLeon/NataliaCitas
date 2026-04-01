import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import type { LookingForOption } from '../../data/candidates';
import { UserProfileStore } from '../../data/user-profile.store';

@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register-page.html',
  styleUrl: './register-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RegisterPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly userProfileStore = inject(UserProfileStore);
  private readonly takenUsernames = new Set(['giovanna', 'natalia', 'admin', 'sofia']);
  private readonly passwordComplexityValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const password = String(control.value ?? '');

    const isValid =
      password.length >= 12 && /[a-z]/.test(password) && /[A-Z]/.test(password) && /\d/.test(password) && /[^A-Za-z0-9]/.test(password);

    return isValid ? null : { passwordComplexity: true };
  };

  protected readonly currentStep = signal<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);
  protected readonly selectedPhotoName = signal('');
  protected readonly selectedPhotoPreviewUrl = signal('');
  protected readonly selectedDiscreetStyle = signal('');
  protected readonly photoAdded = signal(false);

  protected readonly stepOneForm = this.formBuilder.nonNullable.group({
    lookingFor: ['Mujer busca hombres', Validators.required],
    birthDate: ['1996-02-10', Validators.required],
    country: ['Peru', Validators.required],
    postalCode: ['', [Validators.required, Validators.minLength(4)]],
  });

  protected readonly stepTwoForm = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    username: ['', [Validators.required, Validators.minLength(4)]],
    password: ['', [Validators.required, this.passwordComplexityValidator]],
    acceptedTerms: [false, Validators.requiredTrue],
    acceptedMarketing: [false],
  });

  protected readonly stepThreeForm = this.formBuilder.nonNullable.group({
    discreetStyle: ['', Validators.required],
  });

  protected readonly stepFiveForm = this.formBuilder.nonNullable.group({
    replyMode: ['preset', Validators.required],
    customReply: [''],
  });

  protected readonly stepSixForm = this.formBuilder.nonNullable.group({
    autoKeyExchange: [false],
    notifyOffers: [false],
    contactMatches: [true],
  });

  protected readonly stepSevenForm = this.formBuilder.nonNullable.group({
    relationshipGoal: ['Algo a corto plazo', Validators.required],
    greeting: ['', [Validators.required, Validators.maxLength(64)]],
    aboutMe: ['', [Validators.required, Validators.minLength(20), Validators.maxLength(2000)]],
    height: ['1,65m', Validators.required],
    weight: ['55kg', Validators.required],
  });

  protected readonly isFirstStep = computed(() => this.currentStep() === 1);
  protected readonly isSecondStep = computed(() => this.currentStep() === 2);
  protected readonly isThirdStep = computed(() => this.currentStep() === 3);
  protected readonly isFourthStep = computed(() => this.currentStep() === 4);
  protected readonly isFifthStep = computed(() => this.currentStep() === 5);
  protected readonly isSixthStep = computed(() => this.currentStep() === 6);
  protected readonly isSeventhStep = computed(() => this.currentStep() === 7);

  protected readonly usernameTaken = computed(() => {
    const username = this.stepTwoForm.controls.username.value.trim().toLowerCase();
    return username.length >= 4 && this.takenUsernames.has(username);
  });

  protected readonly passwordChecks = computed(() => {
    const password = this.stepTwoForm.controls.password.value;
    return {
      minLength: password.length >= 12,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      symbol: /[^A-Za-z0-9]/.test(password),
    };
  });

  protected readonly passwordScore = computed(() => {
    const checks = this.passwordChecks();
    return Object.values(checks).filter(Boolean).length;
  });

  protected readonly passwordStrengthLabel = computed(() => {
    const score = this.passwordScore();

    if (score <= 2) {
      return 'Debil';
    }

    if (score <= 4) {
      return 'Media';
    }

    return 'Fuerte';
  });

  protected readonly passwordStrengthPercent = computed(() => `${(this.passwordScore() / 5) * 100}%`);

  protected continueToStepTwo(): void {
    if (this.stepOneForm.invalid) {
      this.stepOneForm.markAllAsTouched();
      return;
    }

    this.currentStep.set(2);
  }

  protected backToStepOne(): void {
    this.currentStep.set(1);
  }

  protected continueToStepThree(): void {
    if (this.stepTwoForm.invalid || this.usernameTaken() || this.passwordScore() < 5) {
      this.stepTwoForm.markAllAsTouched();
      this.stepTwoForm.controls.username.markAsTouched();
      this.stepTwoForm.controls.password.markAsTouched();
      return;
    }

    this.currentStep.set(3);
  }

  protected backToStepTwo(): void {
    this.currentStep.set(2);
  }

  protected selectDiscreetStyle(style: string): void {
    this.stepThreeForm.controls.discreetStyle.setValue(style);
    this.stepThreeForm.controls.discreetStyle.markAsTouched();
    this.selectedDiscreetStyle.set(style);
  }

  protected continueToStepFour(): void {
    if (this.stepThreeForm.invalid) {
      this.stepThreeForm.markAllAsTouched();
      return;
    }

    this.currentStep.set(4);
  }

  protected backToStepThree(): void {
    this.currentStep.set(3);
  }

  protected openPhotoPicker(fileInput: HTMLInputElement): void {
    fileInput.click();
  }

  protected onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];

    this.selectedPhotoName.set(file?.name ?? '');
    this.photoAdded.set(Boolean(file));

    if (!file) {
      this.selectedPhotoPreviewUrl.set('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      this.selectedPhotoPreviewUrl.set(String(reader.result ?? ''));
    };
    reader.readAsDataURL(file);
  }

  protected continueFromPhotoStep(): void {
    this.currentStep.set(5);
  }

  protected skipPhotoStep(): void {
    this.selectedPhotoName.set('');
    this.selectedPhotoPreviewUrl.set('');
    this.photoAdded.set(false);
    this.currentStep.set(5);
  }

  protected canContinueSecondStep(): boolean {
    return this.stepTwoForm.valid && !this.usernameTaken() && this.passwordScore() === 5;
  }

  protected canContinueThirdStep(): boolean {
    return this.selectedDiscreetStyle().length > 0;
  }

  protected canContinuePhotoStep(): boolean {
    return this.photoAdded();
  }

  protected continueToStepSix(): void {
    const replyMode = this.stepFiveForm.controls.replyMode.value;
    const customReply = this.stepFiveForm.controls.customReply.value.trim();

    if (replyMode === 'custom' && customReply.length === 0) {
      this.stepFiveForm.controls.customReply.markAsTouched();
      return;
    }

    this.currentStep.set(6);
  }

  protected skipToStepSix(): void {
    this.currentStep.set(6);
  }

  protected backToStepFive(): void {
    this.currentStep.set(5);
  }

  protected continueToStepSeven(): void {
    this.currentStep.set(7);
  }

  protected skipToStepSeven(): void {
    this.currentStep.set(7);
  }

  protected backToStepSix(): void {
    this.currentStep.set(6);
  }

  protected submitOnboarding(): void {
    if (this.stepSevenForm.invalid) {
      this.stepSevenForm.markAllAsTouched();
      return;
    }

    this.openCandidatesPage();
  }

  protected skipFinalDetails(): void {
    this.openCandidatesPage();
  }

  protected customReplySelected(): boolean {
    return this.stepFiveForm.controls.replyMode.value === 'custom';
  }

  private openCandidatesPage(): void {
    this.userProfileStore.seedFromRegistration({
      email: this.stepTwoForm.controls.email.value,
      username: this.stepTwoForm.controls.username.value,
      lookingFor: this.stepOneForm.controls.lookingFor.value as LookingForOption,
      country: this.stepOneForm.controls.country.value,
      postalCode: this.stepOneForm.controls.postalCode.value,
      discreetStyle: this.stepThreeForm.controls.discreetStyle.value,
      relationshipGoal: this.stepSevenForm.controls.relationshipGoal.value,
      greeting: this.stepSevenForm.controls.greeting.value,
      aboutMe: this.stepSevenForm.controls.aboutMe.value,
      height: this.stepSevenForm.controls.height.value,
      weight: this.stepSevenForm.controls.weight.value,
      photoName: this.selectedPhotoName(),
      photoPreviewUrl: this.selectedPhotoPreviewUrl(),
    });

    void this.router.navigate(['/candidatos'], {
      state: {
        showWelcomeModal: true,
        email: this.stepTwoForm.controls.email.value,
        lookingFor: this.stepOneForm.controls.lookingFor.value,
      },
    });
  }
}
