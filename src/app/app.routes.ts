import { Routes } from '@angular/router';

export const routes: Routes = [
	{
		path: '',
		loadComponent: () => import('./pages/home-page/home-page').then((module) => module.HomePage),
	},
	{
		path: 'candidatos',
		loadComponent: () => import('./pages/candidates-page/candidates-page').then((module) => module.CandidatesPage),
	},
	{
		path: 'perfil/:slug',
		loadComponent: () => import('./pages/candidate-profile-page/candidate-profile-page').then((module) => module.CandidateProfilePage),
	},
	{
		path: 'mi-perfil',
		loadComponent: () => import('./pages/user-profile-page/user-profile-page').then((module) => module.UserProfilePage),
	},
	{
		path: 'legal/privacidad',
		loadComponent: () => import('./pages/legal-page/legal-page').then((module) => module.LegalPage),
		data: { pageKey: 'privacidad' },
	},
	{
		path: 'legal/terminos',
		loadComponent: () => import('./pages/legal-page/legal-page').then((module) => module.LegalPage),
		data: { pageKey: 'terminos' },
	},
	{
		path: 'legal/cookies',
		loadComponent: () => import('./pages/legal-page/legal-page').then((module) => module.LegalPage),
		data: { pageKey: 'cookies' },
	},
	{
		path: 'legal/seguridad',
		loadComponent: () => import('./pages/legal-page/legal-page').then((module) => module.LegalPage),
		data: { pageKey: 'seguridad' },
	},
	{
		path: 'legal/faq',
		loadComponent: () => import('./pages/legal-page/legal-page').then((module) => module.LegalPage),
		data: { pageKey: 'faq' },
	},
	{
		path: 'registro',
		loadComponent: () => import('./pages/register-page/register-page').then((module) => module.RegisterPage),
	},
	{
		path: 'login',
		loadComponent: () => import('./pages/login-page/login-page').then((module) => module.LoginPage),
	},
	{
		path: 'planes',
		loadComponent: () => import('./pages/plans-page/plans-page').then((module) => module.PlansPage),
	},
	{
		path: '**',
		redirectTo: '',
	},
];
