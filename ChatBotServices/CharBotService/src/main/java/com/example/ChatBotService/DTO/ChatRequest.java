package com.example.ChatBotService.DTO;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class ChatRequest {
    @NotBlank(message = "Message can't be empty !!")
    private String message;
}
