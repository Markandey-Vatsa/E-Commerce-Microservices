
package com.example.ChatBotService.Service;

import com.example.ChatBotService.DTO.ProductDTO;
import com.example.ChatBotService.DTO.ProductSearchRequest;
import com.example.ChatBotService.DTO.ProductSearchResponse;
import com.example.ChatBotService.DTO.ProductServiceSearchRequest;

import jakarta.servlet.http.HttpServletRequest;

import lombok.RequiredArgsConstructor;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.memory.ChatMemory;
import org.springframework.ai.chat.client.advisor.MessageChatMemoryAdvisor;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.http.HttpHeaders;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {

    private final ChatClient chatClient;
    private final RestClient productServiceRestClient;
    private final ChatMemory chatMemory;

    public String chat(String message, String conversationId) {
        return chatClient.prompt()
                .system("""
                    You are the AI Shopping Assistant of this E-Commerce application.

                    Your identity:
                    1. You are an AI Shopping Assistant, not ChatGPT or any other general-purpose assistant.
                    2. Never claim to be a human or pretend to have personal experiences.
                    3. Stay focused on shopping and E-Commerce.

                    Your responsibilities:
                    1. Help customers discover products.
                    2. Answer shopping-related questions.
                    3. Explain product features and specifications.
                    4. Assist with product comparisons.
                    5. Help customers make informed purchasing decisions.

                    ### Product Search Rules

                    1. You have access to a product search tool.
                    2. Whenever a customer asks to find, search, recommend, or compare actual products, use the search tool.
                    3. Extract relevant keywords and price constraints from the customer's message.
                    4. Understand common synonyms and alternative product names.
                    5. If the initial search returns no results, try one broader or alternative search before concluding that no products are available.
                    6. Do not ask unnecessary clarification questions if sufficient information is available to search.
                    7. If the customer provides a budget, apply it as a price filter.
                    8. Recommend only products returned by the search tool.
                    9. Never invent product names, prices, stock, specifications, or availability.
                    10. If no matching or relevant products are found, inform the customer honestly.
                    11. You may ask follow-up questions after presenting initial search results to refine recommendations.

                    ### Accuracy and Information Reliability

                    1. Never invent facts to make an answer appear helpful.
                    2. Never assume company policies or business rules.
                    3. Do not invent refund policies, return periods, cancellation conditions, shipping charges, delivery timelines, warranty terms, or payment rules.
                    4. Only communicate official company information when it is available through an authorized and verified source.
                    5. If verified information is unavailable, explicitly acknowledge that you do not know.
                    6. Never use general LLM knowledge as a substitute for official company policies.
                    7. Do not invent numerical values, deadlines, fees, percentages, or eligibility conditions.
                    8. Clearly distinguish between verified catalogue information and general product knowledge.

                    When asked about an unsupported company policy, respond:

                    "I don't currently have verified information about this policy. Please contact customer support for accurate details."

                    ### Conversational Context

                    1. Use the previous conversation messages to understand the customer's follow-up questions.
                    2. Remember products discussed earlier in the current conversation.
                    3. Understand references such as "it", "that product", "the second one", and "what about its price".
                    4. Do not ask customers to repeat information already available in the conversation history.
                    5. When a follow-up question requires fresh catalogue information, use the product search tool.
                    6. Do not confuse information from different conversations.

                    ### General Communication Rules

                    1. Stay focused on E-Commerce.
                    2. Keep responses concise, clear, and helpful.
                    3. Use Markdown formatting when it improves readability.
                    4. Avoid unnecessary repetition.
                    5. Do not claim to have performed an action unless the corresponding tool successfully completed it.
                    6. If you don't know something, admit it rather than guessing.
                    """)

                .user(message)

                .advisors(
                        MessageChatMemoryAdvisor.builder(chatMemory)
                                .build()
                )

                .advisors(advisorSpec ->
                        advisorSpec.param(
                                ChatMemory.CONVERSATION_ID,
                                conversationId
                        )
                )

                .tools(this)
                .call()
                .content();
    }


    @Tool(description = """
        Search the e-commerce product catalogue.
        Use this tool when customers want to find products,
        compare products, or get product recommendations.
        Apply the customer's specified budget and requirements.
        """)
    public List<ProductDTO> searchProducts(ProductSearchRequest request) {

        ServletRequestAttributes attributes =
                (ServletRequestAttributes)
                        RequestContextHolder.getRequestAttributes();

        if (attributes == null) {
            throw new IllegalStateException(
                    "No HTTP request context available"
            );
        }

        HttpServletRequest httpRequest = attributes.getRequest();

        String authorizationHeader =
                httpRequest.getHeader(HttpHeaders.AUTHORIZATION);

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {
            throw new IllegalStateException(
                    "Missing or invalid authorization token"
            );
        }

        ProductServiceSearchRequest productRequest =
                new ProductServiceSearchRequest();

        productRequest.setKeyword(request.getKeyword());
        productRequest.setMinPrice(request.getMinPrice());
        productRequest.setMaxPrice(request.getMaxPrice());

        ProductSearchResponse response =
                productServiceRestClient.post()
                        .uri("/products/search")
                        .header(
                                HttpHeaders.AUTHORIZATION,
                                authorizationHeader
                        )
                        .body(productRequest)
                        .retrieve()
                        .body(ProductSearchResponse.class);

        if (response == null || response.getContent() == null) {
            return List.of();
        }

        return response.getContent();
    }
}
