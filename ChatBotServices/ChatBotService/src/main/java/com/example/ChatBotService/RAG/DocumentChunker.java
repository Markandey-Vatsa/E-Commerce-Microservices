package com.example.ChatBotService.RAG;



import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
public class DocumentChunker {

    private static final int CHUNK_SIZE = 500;
    private static final int CHUNK_OVERLAP = 100;

    public List<String> splitDocument(String content) {

        List<String> chunks = new ArrayList<>();

        int start = 0;

        while (start < content.length()) {

            int end = Math.min(
                    start + CHUNK_SIZE,
                    content.length()
            );

            chunks.add(content.substring(start, end));

            if (end == content.length()) {
                break;
            }

            start = end - CHUNK_OVERLAP;
        }

        return chunks;
    }
}

