import { Component, Input, Output, EventEmitter, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { TooltipModule } from 'primeng/tooltip';

@Component({
  selector: 'app-follow-up-notes',
  standalone: true,
  imports: [CommonModule, FormsModule, ScrollPanelModule, TooltipModule],
  templateUrl: './follow-up-notes.component.html',

})
export class FollowUpNotesComponent {
  @Input() notes: any[] = [];
  @Input() loading: boolean = false;
  @Input() saving: boolean = false;

  @Output() onAdd = new EventEmitter<string>();
  @Output() onEdit = new EventEmitter<{ uuid: string; content: string }>();
  @Output() onDelete = new EventEmitter<string>();

  newNoteText = signal('');
  editNoteText = signal('');
  editingNoteId = signal<string | null>(null);
  openNoteMenuId = signal<string | null>(null);

  toggleNoteMenu(noteId: string) {
    this.openNoteMenuId.set(this.openNoteMenuId() === noteId ? null : noteId);
  }

  closeNoteMenu() {
    this.openNoteMenuId.set(null);
  }

  startEditNote(note: any) {
    this.editingNoteId.set(note.uuid);
    this.editNoteText.set(note.note_content);
  }

  cancelEditNote() {
    this.editingNoteId.set(null);
    this.editNoteText.set('');
  }

  saveEditNote() {
    const text = this.editNoteText()?.trim();
    const noteId = this.editingNoteId();
    if (!text || !noteId) return;
    this.onEdit.emit({ uuid: noteId, content: text });
    this.editingNoteId.set(null);
    this.editNoteText.set('');
  }

  addNote() {
    const text = this.newNoteText()?.trim();
    if (!text) return;
    this.onAdd.emit(text);
    this.newNoteText.set('');
  }

  deleteNote(noteId: string) {
    this.onDelete.emit(noteId);
  }
}
