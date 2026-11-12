package com.example.ChatBotService.RAG;



import com.example.ChatBotService.RAG.Entity.DocumentEntity;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DocumentRepository extends JpaRepository<DocumentEntity, Long> {

    @Query(value = """
            SELECT *
            FROM knowledge_chunks
            WHERE MATCH(chunk_content)
            AGAINST (:query IN NATURAL LANGUAGE MODE)
            ORDER BY MATCH(chunk_content)
            AGAINST (:query IN NATURAL LANGUAGE MODE) DESC
            """, nativeQuery = true)
    List<DocumentEntity> searchRelevantChunks(
            @Param("query") String query,
            Pageable pageable
    );

    void deleteByDocumentName(String documentName);
}
