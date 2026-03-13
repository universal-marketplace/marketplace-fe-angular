import {Component, EventEmitter, inject, Input, OnChanges, Output} from '@angular/core';
import {State} from '../../services/state';
import {User} from '../../models';
import {CommonModule} from '@angular/common';
import {FormsModule} from '@angular/forms';
import {MatIconModule} from '@angular/material/icon';

@Component({
  selector: "app-edit-profile-modal",
  standalone: true,
  imports: [CommonModule, MatIconModule, FormsModule],
  templateUrl: './edit-profile-modal.html',
  styleUrl: './edit-profile-modal.css',
})
export class EditProfileModal implements OnChanges {
  state = inject(State);

  @Input() isOpen = false;
  @Output() isOpenChange = new EventEmitter<boolean>();
  @Input() user!: User;

  editData: Partial<User> = {};

  ngOnChanges() {
    if (this.user) {
      this.editData = { ...this.user };
    }
  }

  close() {
    this.isOpen = false;
    this.isOpenChange.emit(this.isOpen);
  }

  save() {
    if (this.user) {
      this.state.updateUser(this.user.id, this.editData);
      this.close();
    }
  }
}
