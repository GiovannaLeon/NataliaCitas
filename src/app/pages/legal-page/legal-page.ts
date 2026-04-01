import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';

type LegalSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

type LegalPageContent = {
  key: string;
  eyebrow: string;
  title: string;
  updatedAt: string;
  intro: string;
  sections: LegalSection[];
};

const LEGAL_PAGES: Record<string, LegalPageContent> = {
  privacidad: {
    key: 'privacidad',
    eyebrow: 'Privacidad',
    title: 'Politica de privacidad',
    updatedAt: '1 de abril de 2026',
    intro:
      'Natalia trata datos personales conforme a la Ley N.° 29733, Ley de Proteccion de Datos Personales del Peru, su reglamento y principios de consentimiento, finalidad, proporcionalidad, calidad y seguridad.',
    sections: [
      {
        title: '1. Responsable del tratamiento',
        paragraphs: [
          'Si el servicio se opera en Peru, Natalia debera identificar claramente al titular del banco de datos personales, su domicilio, canal de contacto y el medio para ejercer derechos ARCO.',
          'Para esta maqueta, Natalia actua como plataforma digital para interaccion entre adultos y debe informar de manera visible quien administra la informacion personal recolectada.',
        ],
      },
      {
        title: '2. Datos que se recopilan',
        bullets: [
          'Datos de registro: correo electronico, alias, fecha de nacimiento y preferencias de busqueda.',
          'Datos de perfil: fotos, ciudad, presentacion y preferencias de interaccion.',
          'Datos de uso: actividad dentro de la plataforma, coincidencias, mensajes y eventos tecnicos.',
        ],
      },
      {
        title: '3. Finalidades del tratamiento',
        bullets: [
          'Crear y administrar la cuenta del usuario.',
          'Permitir coincidencias, mensajeria y seguridad de la plataforma.',
          'Prevenir fraude, abuso, suplantacion o usos prohibidos.',
          'Enviar comunicaciones comerciales solo cuando exista consentimiento expreso.',
        ],
      },
      {
        title: '4. Derechos ARCO',
        paragraphs: [
          'La persona usuaria puede ejercer sus derechos de acceso, rectificacion, cancelacion y oposicion respecto de sus datos personales.',
          'Natalia debe habilitar un canal claro para solicitudes ARCO y responder dentro de los plazos previstos por la normativa peruana aplicable.',
        ],
      },
      {
        title: '5. Conservacion y seguridad',
        paragraphs: [
          'Los datos solo deben conservarse durante el tiempo necesario para las finalidades informadas o por obligaciones legales.',
          'Natalia debe adoptar medidas tecnicas y organizativas razonables para proteger cuentas, mensajes y documentos contra acceso no autorizado, perdida o alteracion.',
        ],
      },
    ],
  },
  terminos: {
    key: 'terminos',
    eyebrow: 'Legal',
    title: 'Terminos y condiciones',
    updatedAt: '1 de abril de 2026',
    intro:
      'Estos terminos regulan el acceso y uso de Natalia como servicio digital de interaccion entre personas adultas. Deben interpretarse junto con la normativa peruana de proteccion al consumidor y de datos personales.',
    sections: [
      {
        title: '1. Elegibilidad',
        bullets: [
          'El servicio esta destinado exclusivamente a personas mayores de 18 anos.',
          'No se permite crear cuentas en nombre de terceros ni usar datos falsos con fines de fraude.',
          'No se permite publicar contenido que involucre menores de edad o actividad ilegal.',
        ],
      },
      {
        title: '2. Uso permitido',
        bullets: [
          'Mantener un trato respetuoso con otras personas usuarias.',
          'No difundir spam, acoso, amenazas, contenido no consentido o informacion financiera sensible.',
          'No emplear bots, scrapers o automatizaciones para extraer informacion de la plataforma.',
        ],
      },
      {
        title: '3. Cuenta y seguridad',
        paragraphs: [
          'Cada usuario es responsable de custodiar su clave y de informar cualquier acceso no autorizado.',
          'Natalia puede suspender temporalmente perfiles ante indicios razonables de fraude, abuso o incumplimiento de estos terminos.',
        ],
      },
      {
        title: '4. Pagos y cancelaciones',
        paragraphs: [
          'Si a futuro existen planes o creditos, Natalia debera informar de forma clara precios, renovaciones, condiciones de cancelacion y reembolsos antes de cualquier cobro.',
          'Estas condiciones deberan adecuarse al Codigo de Proteccion y Defensa del Consumidor del Peru.',
        ],
      },
      {
        title: '5. Contacto',
        paragraphs: [
          'Natalia debe ofrecer un canal de soporte visible para consultas legales, reclamos y solicitudes de privacidad.',
        ],
      },
    ],
  },
  cookies: {
    key: 'cookies',
    eyebrow: 'Transparencia',
    title: 'Politica de cookies',
    updatedAt: '1 de abril de 2026',
    intro:
      'Natalia puede utilizar cookies tecnicas, de seguridad, analitica y personalizacion. Cuando corresponda, debe informar y obtener consentimiento para categorias no esenciales.',
    sections: [
      {
        title: '1. Tipos de cookies',
        bullets: [
          'Esenciales para inicio de sesion, navegacion y seguridad.',
          'Analiticas para entender el uso del servicio.',
          'Preferencias para idioma, region y configuraciones recordadas.',
        ],
      },
      {
        title: '2. Gestion de consentimiento',
        paragraphs: [
          'La plataforma debe permitir aceptar, rechazar o configurar cookies no esenciales antes de activarlas.',
        ],
      },
    ],
  },
  seguridad: {
    key: 'seguridad',
    eyebrow: 'Seguridad',
    title: 'Consejos de seguridad y privacidad',
    updatedAt: '1 de abril de 2026',
    intro:
      'Natalia debe ofrecer recomendaciones claras para reducir riesgos en interacciones online, incluyendo fraude romantico, suplantacion, phishing y solicitudes de dinero.',
    sections: [
      {
        title: 'Reglas basicas de seguridad',
        bullets: [
          'Nunca envies dinero a alguien que acabas de conocer online.',
          'No compartas datos bancarios, direccion o documentos personales por chat.',
          'Reporta presion, amenazas, chantaje o solicitudes sospechosas de inmediato.',
          'Verifica con calma antes de mover la conversacion fuera de la plataforma.',
        ],
      },
    ],
  },
  faq: {
    key: 'faq',
    eyebrow: 'Ayuda',
    title: 'Preguntas frecuentes',
    updatedAt: '1 de abril de 2026',
    intro: 'Estas son preguntas base para Natalia mientras el backend aun no existe.',
    sections: [
      {
        title: 'Preguntas',
        bullets: [
          'Como verifico mi correo electronico despues del registro?',
          'Como oculto o elimino mi perfil?',
          'Como reporto una cuenta sospechosa o un comportamiento abusivo?',
          'Que datos personales guarda Natalia y para que se usan?',
          'Como solicito acceso, rectificacion o eliminacion de mis datos?',
          'Que ocurre si cierro mi cuenta o dejo de usar la plataforma?',
        ],
      },
    ],
  },
};

@Component({
  selector: 'app-legal-page',
  imports: [CommonModule, RouterLink],
  templateUrl: './legal-page.html',
  styleUrl: './legal-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPage {
  private readonly route = inject(ActivatedRoute);
  private readonly routeData = toSignal(this.route.data, { initialValue: this.route.snapshot.data });

  protected readonly menuOpen = signal(false);
  protected readonly page = computed<LegalPageContent>(() => {
    const pageKey = String(this.routeData()?.['pageKey'] ?? 'privacidad');
    return LEGAL_PAGES[pageKey] ?? LEGAL_PAGES['privacidad'];
  });

  protected readonly menuItems = [
    { label: 'Preguntas frecuentes', path: '/legal/faq' },
    { label: 'Terminos y condiciones', path: '/legal/terminos' },
    { label: 'Privacidad', path: '/legal/privacidad' },
    { label: 'Politica de cookies', path: '/legal/cookies' },
    { label: 'Seguridad y privacidad', path: '/legal/seguridad' },
  ];

  protected toggleMenu(): void {
    this.menuOpen.update((value) => !value);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}