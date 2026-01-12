package liv.codveda.blog.app.service;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.prompt.Prompt;
import org.springframework.ai.chat.prompt.PromptTemplate;
import org.springframework.stereotype.Service;

@Service
public class AiChatService {

    private final ChatClient chatClient;

    public AiChatService(ChatClient.Builder chatClientBuilder) {
        this.chatClient = chatClientBuilder.build();
    }

    public String generateResponse(String prompt) {
//        String promptTemplate = """
//            You are a helpful AI assistant for a blog platform.
//            Based on the following context: {context}
//            Respond to this user message: {message}
//            Keep the response concise and relevant.
//        """;
//
//        PromptTemplate template = new PromptTemplate(promptTemplate);
//        template.add("context", context);
//        template.add("message", userMessage);

        //Prompt prompt = template.create();

        return chatClient.prompt(prompt)
                .call()
                .content();
    }
}