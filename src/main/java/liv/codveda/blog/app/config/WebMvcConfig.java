//package liv.codveda.blog.app.config;
//
//import org.springframework.context.annotation.Configuration;
//import org.springframework.web.accept.PathApiVersionStrategy;
//import org.springframework.web.servlet.config.annotation.ApiVersionConfigurer;
//import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;
//
//@Configuration
//public class WebMvcConfig implements WebMvcConfigurer {
//
//    @Override
//    public void configureApiVersioning(ApiVersionConfigurer configurer) {
//        configurer
//                .apiVersionStrategy(new PathApiVersionStrategy("v"))
//                .addSupportedVersions("1.0", "2.0")
//                .defaultVersion("1.0");
//    }
//}