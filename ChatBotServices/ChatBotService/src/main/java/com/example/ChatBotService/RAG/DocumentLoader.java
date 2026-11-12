package com.example.ChatBotService.RAG;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.stereotype.Component;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;
import org.springframework.core.io.support.ResourcePatternResolver;

@Component
@RequiredArgsConstructor
public class DocumentLoader {

    private final ResourcePatternResolver resourcePatternResolver;

    public List<LoadedDocument> loadDocuments() throws IOException {

        Resource[] resources = resourcePatternResolver
                .getResources("classpath:knowledge-base/*.txt");

        List<LoadedDocument> documents = new ArrayList<>();

        for (Resource resource : resources) {

            String content = new String(
                    resource.getInputStream().readAllBytes(),
                    StandardCharsets.UTF_8
            );

            documents.add(
                    new LoadedDocument(
                            resource.getFilename(),
                            content
                    )
            );
        }

        return documents;
    }

    public record LoadedDocument(
            String documentName,
            String content
    ) {}
}
