package com.example.ChatBotService.RAG;

import com.example.ChatBotService.RAG.Entity.DocumentEntity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class DocumentIngestionService {

    private final DocumentLoader documentLoader;
    private final DocumentChunker documentChunker;
    private final DocumentRepository documentRepository;

    @Transactional(rollbackFor = Exception.class)
    public int ingestDocuments() throws IOException {

        List<DocumentLoader.LoadedDocument> documents =
                documentLoader.loadDocuments();

        List<DocumentEntity> entities = new ArrayList<>();

        for (DocumentLoader.LoadedDocument document : documents) {

            String documentName = document.documentName();

            // Split document into chunks
            List<String> chunks =
                    documentChunker.splitDocument(document.content());

            // Remove previously ingested chunks
            documentRepository.deleteByDocumentName(documentName);

            // Convert chunks into JPA entities
            for (int i = 0; i < chunks.size(); i++) {

                DocumentEntity entity = DocumentEntity.builder()
                        .documentName(documentName)
                        .documentType(
                                documentName.contains("_")
                                        ? documentName.substring(0, documentName.indexOf('_'))
                                        : documentName.substring(0, documentName.lastIndexOf('.'))
                        )
                        .chunkContent(chunks.get(i))
                        .chunkNumber(i)
                        .build();

                entities.add(entity);
            }
        }

        // Persist all document chunks
        documentRepository.saveAll(entities);

        return entities.size();
    }
}

