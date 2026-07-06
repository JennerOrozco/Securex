---
name: securex-design-system
description: >
  Skill para usar el sistema de diseño de SECUREX correctamente. Actívate cuando
  el usuario pida "diseñar componente", "nueva UI", "formulario", "tabla",
  "dashboard", "card", "componente visual", "layout", "modal", "diseño de
  pantalla", o cuando necesites construir cualquier interfaz de usuario en SECUREX.
  Contiene el catálogo de los 39 componentes shared y cuándo usar cada uno.
---

# SECUREX — Sistema de Diseño

Antes de usar PrimeNG directamente, **revisa si existe un componente shared** que ya lo encapsula. Este proyecto tiene 39 componentes reutilizables en `src/app/shared/components/`.

---

## Regla de oro

```
Primero: ¿Hay un componente shared para esto?  →  Úsalo
Segundo: ¿Hay un componente PrimeNG adecuado?  →  Úsalo con tokens del sistema
Tercero: CSS propio                            →  Solo si es 100% único
```

---

## Stack visual

- **PrimeNG 21** + tema `Aura` (configurado en `app.config.ts`)
- **Tailwind CSS v3** para utilidades de layout y spacing
- **Lucide Angular** para iconos funcionales
- **PrimeIcons** (`pi pi-*`) solo dentro de componentes PrimeNG
- **Dark mode**: selector `.my-app-dark` (configurado en PrimeNG)

---

## Catálogo de componentes shared

### 📊 Datos y tablas

| Componente | Import | Cuándo usarlo |
|---|---|---|
| `CrudPageComponent` | `@shared/crud-page/crud-page.component` | **Siempre** para pantallas CRUD con tabla + modal |
| `TableShared` | `@shared/table-shared/` | Tabla standalone sin CRUD completo |
| `ActivityTimeline` | `@shared/components/activity-timeline` | Historial / log de actividad en orden cronológico |
| `MetricCard` | `@shared/components/metric-card` | KPI / número grande con etiqueta y tendencia |
| `ChartCard` | `@shared/components/chart-card` | Gráfica de Chart.js dentro de una card con título |

### 🃏 Cards y contenedores

| Componente | Cuándo usarlo |
|---|---|
| `CardComponent` | Contenedor con borde y sombra para agrupar contenido |
| `InfoCardComponent` | Card con icono + título + descripción (info estática) |
| `MetricCardComponent` | KPI con número grande + tendencia porcentual |
| `ChartCardComponent` | Gráfica con título + acciones en header |

### 📝 Formularios e inputs

| Componente | Tipo | Cuándo usarlo |
|---|---|---|
| `DynamicFormComponent` | `@shared/components/dynamic-form` | **Siempre** para formularios en modales CRUD |
| `InputComponent` | `@shared/components/input` | Input de texto standalone |
| `InputNumberComponent` | `@shared/components/input-number` | Input numérico con formato |
| `SelectComponent` | `@shared/components/select` | Dropdown de opciones |
| `SelectGridComponent` | `@shared/components/select-grid` | Dropdown con tabla búsqueda (para listas largas) |
| `TextareaComponent` | `@shared/components/textarea` | Área de texto multilínea |
| `PasswordComponent` | `@shared/components/password` | Input contraseña con toggle de visibilidad |
| `DatepickerComponent` | `@shared/components/datepicker` | Selector de fecha |
| `FileInputComponent` | `@shared/components/file-input` | Input de archivo genérico |
| `InputImageComponent` | `@shared/components/input-image` | Input de imagen con preview |
| `InputAvatarComponent` | `@shared/components/input-avatar` | Avatar editable circular |
| `InputColorComponent` | `@shared/components/input-color` | Selector de color |
| `NitInputComponent` | `@shared/components/nit-input` | Input especializado para NIT fiscal |
| `PhoneInputComponent` | `@shared/components/phone-input` | Input de teléfono con prefijo de país |
| `AutocompleteComponent` | `@shared/components/autocomplete` | Input con suggestions |
| `SegmentSelectComponent` | `@shared/components/segment-select` | Toggle entre opciones tipo tab |

### 🔔 Notificaciones y feedback

| Componente | Cuándo usarlo |
|---|---|
| `RichNotificationComponent` | Toast enriquecido con datos extra (acción, link) |
| `NotificationPanelComponent` | Panel lateral de notificaciones (en header) |
| `LoaderComponent` | Spinner de carga inline |
| `SpinnerComponent` | Spinner overlay de pantalla completa |
| `EmptyStateComponent` | Estado vacío para tablas/listas sin datos |
| `UpdatePromptComponent` | Prompt de actualización de PWA |

### 🗂️ Modales y overlays

| Componente | Cuándo usarlo |
|---|---|
| `ModalShell` | Modal base del CRUD (usado internamente por CrudPage) |
| `BottomSheetComponent` | Panel deslizante desde abajo (móvil-first) |
| `ContextMenuComponent` | Menú contextual flotante |

### 🖼️ Media y visuales

| Componente | Cuándo usarlo |
|---|---|
| `GalleryComponent` | Galería de imágenes con lightbox |
| `ImageCropperComponent` | Recortador de imagen |
| `AvatarUploadComponent` | Upload de avatar con crop integrado |
| `TiktokBadgeComponent` | Badge con animación TikTok-style |

### 🧩 Otros utilitarios

| Componente | Cuándo usarlo |
|---|---|
| `ButtonComponent` | Botón estilizado del sistema |
| `ToolbarComponent` | Barra de acciones superior de una sección |
| `PermissionTreeComponent` | Árbol interactivo de permisos por rol |
| `LineItemFormComponent` | Formulario de items de línea (facturas, presupuestos) |
| `WizardComponent` | Formulario multi-paso con steps |

---

## Layout del sistema

```
MainLayoutComponent
├── SidebarComponent        ← navegación principal
├── HeaderComponent         ← usuario, notificaciones, company switcher
│   └── NotificationPanelComponent
└── <router-outlet>         ← contenido de cada feature
    └── MobileNavComponent  ← navegación inferior en móvil
```

### Cómo inyectar el LayoutService

```typescript
import { LayoutService } from '@core/services/layout.service';

const layout = inject(LayoutService);
layout.toggleSidebar();
layout.isSidebarOpen();  // signal
```

---

## Paleta de colores (tokens PrimeNG Aura)

Usa siempre las variables CSS de PrimeNG. Nunca hardcodees colores hex:

```css
/* Superficies */
var(--p-surface-0)      /* blanco / fondo card */
var(--p-surface-100)    /* gris muy claro */
var(--p-surface-800)    /* gris oscuro */
var(--p-surface-900)    /* casi negro */

/* Texto */
var(--p-text-color)           /* texto principal */
var(--p-text-muted-color)     /* texto secundario */

/* Colores de acción */
var(--p-primary-color)        /* color primario del tema */
var(--p-primary-contrast-color)

/* Colores semánticos */
var(--p-green-500)    /* éxito */
var(--p-red-500)      /* error */
var(--p-yellow-500)   /* advertencia */
var(--p-blue-500)     /* información */
```

---

## CSS global del proyecto

Estilos de inputs compartidos:
```
src/app/shared/style-inputs.css    ← estilos de form controls
src/app/styles/                    ← estilos globales adicionales
src/styles.css                     ← estilos raíz
```

Para estilos específicos de componente, crea un `.scss` junto al `.ts`.

---

## Patrones de formulario

### ✅ En modales CRUD (usa DynamicForm + FormField[])

El `CrudPageComponent` ya renderiza el formulario automáticamente.  
Solo necesitas definir el array `FormField[]` en el `.config.ts`:

```typescript
const formFields: FormField[] = [
  { name: 'nombre', label: 'Nombre', type: 'text', required: true, icon: 'pi pi-tag' },
  { name: 'tipo', label: 'Tipo', type: 'select', options: [...], required: true }
];
```

### ✅ En formularios de configuración únicos (sin CRUD)

Usa Angular Reactive Forms con signals para el estado:

```typescript
form = signal<Record<string, any>>({});

save() {
  // validar y llamar al servicio
}
```

### ❌ Nunca uses Template-driven forms (`[(ngModel)]` en producción)

---

## Responsive / Mobile

El layout usa **Mobile-first** con Tailwind:

```html
<!-- Grid responsive: -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
  <app-metric-card ...></app-metric-card>
</div>

<!-- Ocultar en móvil: -->
<div class="hidden md:block">...</div>

<!-- Solo en móvil: -->
<div class="block md:hidden">...</div>
```

---

## Iconos — cuándo usar cada librería

```typescript
// Lucide Angular — iconos funcionales de interfaz:
import { LucideAngularModule, Bell, User, Settings } from 'lucide-angular';
// Uso en template: <lucide-icon name="bell" [size]="20"></lucide-icon>

// PrimeIcons — solo dentro de inputs y componentes PrimeNG:
// <p-button icon="pi pi-save" label="Guardar"></p-button>
// <i class="pi pi-user"></i>
```

---

## Animaciones y transiciones

El proyecto usa animaciones CSS nativas. Para micro-animaciones:

```css
/* Hover de card: */
transition: transform 0.2s ease, box-shadow 0.2s ease;
&:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.12); }

/* Fade in: */
@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
animation: fadeIn 0.3s ease;
```

No uses librerías de animación externas (GSAP, Framer Motion) sin consultar primero.
