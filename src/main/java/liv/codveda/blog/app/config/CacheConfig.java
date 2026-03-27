package liv.codveda.blog.app.config;

import jakarta.annotation.PostConstruct;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.cache.CacheManager;
import org.springframework.context.annotation.Configuration;

import java.util.Objects;
import java.util.stream.Collectors;

@Configuration
@Slf4j
public class CacheConfig {

    private final ObjectProvider<CacheManager> cacheManagerProvider;

    public CacheConfig(ObjectProvider<CacheManager> cacheManagerProvider) {
        this.cacheManagerProvider = cacheManagerProvider;
    }

    @PostConstruct
    public void logCacheManager() {
        CacheManager cacheManager = cacheManagerProvider.getIfAvailable();
        if (cacheManager == null) {
            log.warn("No CacheManager available. Spring Cache may be disabled or misconfigured.");
            return;
        }
        try {
            String name = cacheManager.getClass().getName();
            String caches = "";
            try {
                caches = Objects.requireNonNullElseGet(cacheManager.getCacheNames(), java.util.List::<String>of)
                        .stream().collect(Collectors.joining(", "));
            } catch (Throwable t) {
                // Some CacheManager impls may not support enumeration reliably at startup
                caches = "<unknown>";
            }
            log.info("CacheManager in use: {}", name);
            log.info("Available caches: {}", caches);
        } catch (Exception e) {
            log.debug("Failed to log CacheManager details: {}", e.getMessage());
        }
    }
}
