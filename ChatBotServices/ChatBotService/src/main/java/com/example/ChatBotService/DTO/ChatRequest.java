package com.example.ChatBotService.DTO;

import lombok.Data;

@Data
public class ChatRequest {

    private String conversationId;

    private String message;
}