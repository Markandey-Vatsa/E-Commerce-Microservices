package com.example.ChatBotService.Controller;




import com.example.ChatBotService.RAG.DocumentIngestionService;
import com.example.ChatBotService.RAG.DocumentRetrievalService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/chat")
@RequiredArgsConstructor
public class DocumentIngestionController {

    private final DocumentIngestionService ingestionService;

    private final DocumentRetrievalService retrievalService;

    @GetMapping("/search")
    public ResponseEntity<String> searchDocuments(
            @RequestParam String query) {

        String context =
                retrievalService.retrieveRelevantContext(query);

        return ResponseEntity.ok(context);
    }

    @PostMapping("/ingest")
    public ResponseEntity<Map<String, Object>> ingestDocuments()
            throws IOException {

        int totalChunks = ingestionService.ingestDocuments();

        return ResponseEntity.ok(
                Map.of(
                        "message", "Documents ingested successfully",
                        "totalChunks", totalChunks
                )
        );
    }
}

