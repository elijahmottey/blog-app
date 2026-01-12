//package liv.codveda.blog.app.config;
//
//import org.springframework.beans.factory.annotation.Value;
//import org.springframework.boot.web.client.RestClientCustomizer;
//import org.springframework.context.annotation.Bean;
//import org.springframework.context.annotation.Configuration;
//import org.springframework.http.HttpHeaders;
//import org.springframework.http.client.ClientHttpRequestInterceptor;
//import org.springframework.web.client.RestClient;
//
//@Configuration
//public class OpenRouterAiConfig {
//
//    @Bean
//    RestClientCustomizer openRouterRestClientCustomizer(
//            @Value("${openrouter.referer}") String referer,
//            @Value("${openrouter.title}") String title
//    ) {
//        return new RestClientCustomizer() {
//            @Override
//            public void customize(RestClient.Builder builder) {
//                builder.defaultHeader("HTTP-Referer", referer);
//                builder.defaultHeader("X-Title", title);
//                builder.defaultHeader(HttpHeaders.ACCEPT, "application/json");
//                builder.defaultHeader(HttpHeaders.CONTENT_TYPE, "application/json");
//
//                builder.requestInterceptor(logMethodAndUrlOnly());
//            }
//        };
//    }
//
//    private ClientHttpRequestInterceptor logMethodAndUrlOnly() {
//        return (request, body, execution) -> {
//            // Safe: logs only HTTP method + URI (no headers, no body, no auth)
//            System.out.println("[AI-UPSTREAM] " + request.getMethod() + " " + request.getURI());
//            return execution.execute(request, body);
//        };
//    }
//}
