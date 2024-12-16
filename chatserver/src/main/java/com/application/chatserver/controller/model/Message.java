package com.application.chatserver.controller.model;

import lombok.*;

//@Getter
//@Setter
//@ToString

@Data
@NoArgsConstructor
public class Message {
    private String senderName;
    private String receiverName;
    private String message;
    private String date;
    private Status status;

}

