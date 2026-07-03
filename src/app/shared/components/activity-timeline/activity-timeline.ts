import { Component, Input, Output, EventEmitter, signal, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface OpportunityMetrics {
  title?: string;
  total_venta?: number;
  total_costo_estimado?: number;
  ganancia_proyectada?: number;
  probability?: number;
  status?: string;
}

export interface ActivityTimelineLog {
  id?: string | number;
  action_type: string;
  entity_type?: string;
  description?: string;
  created_at: string;
  user_name?: string | null;
  profile_picture?: string | null;
  old_values?: any;
  new_values?: any;
  opportunity?: OpportunityMetrics | null;
  [key: string]: any;
}

const NODE_CLASS_MAP: Record<string, string> = {
  create: 'dot--create',
  update: 'dot--update',
  delete: 'dot--delete',
  login: 'dot--login',
  logout: 'dot--logout',
  view: 'dot--view',
  export: 'dot--export',
};

const ACTION_ICON_MAP: Record<string, string> = {
  create: 'pi-plus',
  update: 'pi-pencil',
  delete: 'pi-trash',
  login: 'pi-sign-in',
  logout: 'pi-sign-out',
  view: 'pi-eye',
  export: 'pi-download',
};

const ACTION_LABEL_MAP: Record<string, string> = {
  create: 'Creación',
  update: 'Actualización',
  delete: 'Eliminación',
  login: 'Inicio sesión',
  logout: 'Cierre sesión',
  view: 'Vista',
  export: 'Exportación',
};

const ENTITY_LABEL_MAP: Record<string, string> = {
  opportunity: 'Oportunidad',
  opportunity_line_item: 'Línea de oportunidad',
  contact: 'Contacto',
  account: 'Cuenta',
  branch: 'Sucursal',
  lead: 'Prospecto',
  order: 'Pedido',
  invoice: 'Factura',
  user: 'Usuario',
  role: 'Rol',
  pipeline_stage: 'Etapa',
  task: 'Tarea',
  meeting: 'Reunión',
  call: 'Llamada',
  email: 'Correo',
  note: 'Nota',
  file: 'Archivo',
  report: 'Reporte',
};

@Component({
  selector: 'app-activity-timeline',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './activity-timeline.html',
  styleUrl: './activity-timeline.css'
})
export class ActivityTimelineComponent {
  activities = input<ActivityTimelineLog[]>([]);
  @Input() loading: boolean = false;
  @Input() compact: boolean = false;
  @Input() emptyMessageTitle: string = 'Sin actividades registradas';
  @Input() emptyMessageSub: string = 'No hay logs de auditoría aún.';
  @Input() filterable: boolean = false;
  @Input() filterPlaceholder: string = 'Buscar en actividades...';

  @Output() onViewChanges = new EventEmitter<ActivityTimelineLog>();

  filterText = signal('');

  filteredActivities = computed(() => {
    const text = this.filterText().toLowerCase().trim();
    const acts = this.activities();
    if (!text) return acts;

    return acts.filter(a => {
      return (a.description || '').toLowerCase().includes(text) ||
             (a.user_name || '').toLowerCase().includes(text) ||
             (a.action_type || '').toLowerCase().includes(text) ||
             (a.entity_type || '').toLowerCase().includes(text);
    });
  });

  groupedActivities = computed(() => {
    const acts = this.filteredActivities();
    const groups = new Map<string, ActivityTimelineLog[]>();
    for (const act of acts) {
      const key = this.formatDateLabel(act.created_at);
      if (!groups.has(key)) groups.set(key, []);
      const userObj = act['user'];
      const normalized: ActivityTimelineLog = {
        ...act,
        user_name: userObj?.name || act.user_name,
        profile_picture: userObj?.profile_picture || act['profile_picture'] || null
      };
      groups.get(key)!.push(normalized);
    }
    return Array.from(groups.entries()).map(([key, items]) => ({ key, items }));
  });

  onSearch(event: Event) {
    this.filterText.set((event.target as HTMLInputElement).value);
  }

  getNodeClass(actionType: string): string {
    return NODE_CLASS_MAP[(actionType || '').toLowerCase()] || 'dot--create';
  }

  getPillClass(actionType: string): string {
    return NODE_CLASS_MAP[(actionType || '').toLowerCase()].replace('dot', 'badge') || 'badge--create';
  }

  getActionIcon(actionType: string): string {
    return ACTION_ICON_MAP[(actionType || '').toLowerCase()] || 'pi-circle-fill';
  }

  getActionLabel(actionType: string): string {
    const type = (actionType || '').toLowerCase();
    return ACTION_LABEL_MAP[type] || actionType || 'Evento';
  }

  getEntityLabel(entityType: string): string {
    return ENTITY_LABEL_MAP[entityType] || entityType?.replace(/_/g, ' ') || 'Registro';
  }

  getUserInitials(name?: string | null): string {
    if (!name) return '?';
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
  }

  getUserColor(name?: string | null): string {
    if (!name) return '#6366f1';
    const colors = ['#6366f1', '#8b5cf6', '#a855f7', '#06b6d4', '#14b8a6', '#f59e0b', '#ef4444', '#ec4899', '#3b82f6', '#10b981'];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  }

  private formatDateLabel(dateStr: string): string {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoy';
    if (date.toDateString() === yesterday.toDateString()) return 'Ayer';

    return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' });
  }

  shouldShowOppChip(act: ActivityTimelineLog): boolean {
    if (!act.opportunity) return false;
    return !!(act.opportunity.total_venta || act.opportunity.total_costo_estimado || act.opportunity.ganancia_proyectada || act.opportunity.probability);
  }

  translateStatus(status: string): string {
    const map: Record<string, string> = {
      'Open': 'Abierta',
      'Closed Won': 'Ganada',
      'Closed Lost': 'Perdida',
      'In Progress': 'En progreso',
      'On Hold': 'En pausa',
    };
    return map[status] || status || '';
  }
}
