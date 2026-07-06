import { Injectable, inject, signal, DestroyRef, computed } from '@angular/core';
import { GraphqlService } from '@core/graphql/graphql.service';
import { ProfileService } from '@core/services/profile.service';
import { SECUREX_MUTATIONS } from '@core/graphql/queries/securex.queries';
import { NOTIFICATION_MUTATIONS } from '@core/graphql/queries/notification.queries';

export type DeleteItemType = 'picture' | 'notification_device' | 'webauthn_device';

interface DeleteItem {
  type: DeleteItemType;
  id?: string;
  device_name?: string;
  [key: string]: any;
}

@Injectable()
export class ProfileDeleteFacade {
  private gql = inject(GraphqlService);
  private profileService = inject(ProfileService);

  deleteModalVisible = signal(false);
  itemToDelete = signal<DeleteItem | null>(null);

  title = computed(() =>
    this.itemToDelete()?.type === 'picture' ? 'Eliminar Foto de Perfil' : 'Eliminar Dispositivo'
  );

  message = computed(() =>
    this.itemToDelete()?.type === 'picture'
      ? '¿Está seguro de que desea eliminar su foto de perfil? Esta acción no puede deshacerse.'
      : `¿Eliminar el dispositivo <strong>${this.itemToDelete()?.device_name || ''}</strong>? Esta acción no puede deshacerse.`
  );

  requestDelete(type: DeleteItemType, extra?: Record<string, any>) {
    this.itemToDelete.set({ type, ...extra });
    this.deleteModalVisible.set(true);
  }

  close() {
    this.deleteModalVisible.set(false);
    this.itemToDelete.set(null);
  }

  executeDelete(onSuccess: (type: DeleteItemType) => void, onLoading: (v: boolean) => void) {
    const item = this.itemToDelete();
    if (!item) return;

    switch (item.type) {
      case 'picture':
        this.profileService.deletePicture().subscribe({
          next: () => {
            this.close();
            onSuccess('picture');
          }
        });
        break;

      case 'notification_device':
        onLoading(true);
        this.gql.query<any>('notification', NOTIFICATION_MUTATIONS.DELETE_DEVICE, { id: parseInt(item.id!, 10) })
          .subscribe({
            next: () => {
              onLoading(false);
              this.close();
              onSuccess('notification_device');
            }
          });
        break;

      case 'webauthn_device':
        onLoading(true);
        this.gql.query<any>('security', SECUREX_MUTATIONS.DELETE_WEBAUTHN_CREDENTIAL, { id: parseInt(item.id!, 10) })
          .subscribe({
            next: () => {
              onLoading(false);
              this.close();
              onSuccess('webauthn_device');
            }
          });
        break;
    }
  }
}
