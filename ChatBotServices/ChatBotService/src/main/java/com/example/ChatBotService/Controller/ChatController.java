package com.example.ChatBotService.Controller;


import com.example.ChatBotService.DTO.ChatRequest;
import com.example.ChatBotService.DTO.ChatResponse;
import com.example.ChatBotService.Service.ChatService;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class ChatController {
    private final ChatService chatService;
    @PostMapping("/message")
    public ResponseEntity<ChatResponse> chat(
            @RequestBody ChatRequest request) {

        String response = chatService.chat(
                request.getMessage(),
                request.getConversationId()
        );

        return new ResponseEntity<>(
                new ChatResponse(response),
                HttpStatus.OK
        );
    }
}
