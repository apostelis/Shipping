package com.smartshipping.platform.api.controller;

import com.smartshipping.platform.infrastructure.ai.AiChatService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/chat")
@Tag(name = "AI Chat", description = "LLM-powered shipping intelligence chat")
public class AiChatController {

    private final AiChatService chatService;

    public AiChatController(AiChatService chatService) {
        this.chatService = chatService;
    }

    @PostMapping
    @Operation(summary = "Chat with AI", description = "Ask questions about shipping data and get AI-powered answers")
    public ResponseEntity<Map<String, String>> chat(@RequestBody Map<String, String> request) {
        String message = request.get("message");
        if (message == null || message.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Message is required"));
        }

        String response = chatService.chat(message);
        return ResponseEntity.ok(Map.of("response", response));
    }
}
