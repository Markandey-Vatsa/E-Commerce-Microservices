package com.example.ChatBotService.RAG;


import com.example.ChatBotService.RAG.Entity.DocumentEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentRetrievalService {

    private final DocumentRepository documentRepository;

    public String retrieveRelevantContext(String query) {

        if (query == null || query.isBlank()) {
            return "";
        }

        // Retrieve the top 5 relevant chunks
        List<DocumentEntity> relevantChunks =
                documentRepository.searchRelevantChunks(
                        query,
                        PageRequest.of(0, 5)
                );

        if (relevantChunks.isEmpty()) {
            return "";
        }

        // Combine retrieved chunks into context
        StringBuilder context = new StringBuilder();

        for (DocumentEntity chunk : relevantChunks) {

            context.append("Source: ")
                    .append(chunk.getDocumentName())
                    .append("\n");

            context.append(chunk.getChunkContent())
                    .append("\n\n");
        }

        return context.toString();
    }
}
