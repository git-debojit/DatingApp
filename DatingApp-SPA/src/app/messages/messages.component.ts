import { AlertifyService } from './../_services/alertify.service';
import { ActivatedRoute } from '@angular/router';
import { UserService } from './../_services/user.service';
import { AuthService } from './../_services/auth.service';
import { Pagination, PaginatedResult } from './../_models/pagination';
import { Message } from './../_models/Message';
import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-messages',
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.css']
})
export class MessagesComponent implements OnInit {
  messages: Message[];
  pagination: Pagination;
  messageContainer = "Unread";

  constructor(private authService: AuthService,
    private userService: UserService,
    private route: ActivatedRoute,
    private alertify: AlertifyService) { }

  ngOnInit() {
    this.route.data.subscribe(data => {
      this.messages = data['messages'].results;
      this.pagination = data['messages'].pagination;
    });
    this.loadMessages();
  }

  loadMessages() {
    this.userService.getMessages(this.authService.decodedToken.nameid, this.pagination.currentPage,
      this.pagination.itemsPerPage, this.messageContainer).subscribe((res: PaginatedResult<Message[]>) => {
        this.messages = res.result;
        this.pagination = res.pagination;
      }, error => {
        this.alertify.error(error);
      });
  }

  deleteMessage(id: number){
    this.alertify.confirm('Are you sure you want to delete this message?', () =>{
      this.userService.deleteMessage(id, this.authService.decodedToken.nameid).subscribe(() => {
        this.messages.splice(this.messages.findIndex(m => m.id === id), 1);
        this.alertify.success("Message has been deleted");
      }, error => {
        this.alertify.error("Failed to delete the message");
      });
    })
  }

  pageChanged(event: any){
    this.pagination.currentPage = event.page;
    this.loadMessages();
  }
}
