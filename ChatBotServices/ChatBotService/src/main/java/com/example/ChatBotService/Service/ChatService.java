package com.example.ChatBotService.Service;
import com.example.ChatBotService.DTO.ProductDTO;
import com.example.ChatBotService.DTO.ProductSearchRequest;
import com.example.ChatBotService.DTO.ProductSearchResponse;
import com.example.ChatBotService.DTO.ProductServiceSearchRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ChatService {
    private final ChatClient chatClient;
    private final RestClient productServiceRestClient;

    public String chat(String message){
        return chatClient.prompt()
                .system("""
    You are an AI shopping assistant for an E-Commerce application.

    Your responsibilities:
    1. Help customers discover products.
    2. Answer shopping-related questions.
    3. Explain product features and specifications.
    4. Assist with product comparisons.

    Product Search Rules:

    1. You have access to a product search tool.
    2. Whenever a customer asks to find, search,
       or recommend actual products, use the search tool.
    3. Extract relevant keywords and price constraints
       from the customer's message.
    4. Do not ask unnecessary clarification questions
       if sufficient information is available to search.
    5. If the customer provides a budget, apply it
       as a price filter.
    6. Recommend only products returned by the tool.
    7. Never invent product names, prices, stock,
       specifications or availability.
    8. If no matching products are found, inform
       the customer honestly.
    9. You may ask follow-up questions after presenting
       initial search results to refine recommendations.

    General Rules:
    1. Stay focused on E-Commerce.
    2. Keep responses concise and helpful.
    """)
                .user(message)
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

        ProductServiceSearchRequest productRequest =
                new ProductServiceSearchRequest();

        productRequest.setKeyword(request.getKeyword());
        productRequest.setMinPrice(request.getMinPrice());
        productRequest.setMaxPrice(request.getMaxPrice());

        ProductSearchResponse response = productServiceRestClient.post()
                .uri("/products/search")
                .body(productRequest)
                .retrieve()
                .body(ProductSearchResponse.class);

        if (response == null || response.getContent() == null) {
            return List.of();
        }

        return response.getContent();
    }
}
