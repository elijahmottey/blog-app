package liv.codveda.blog.app.service.interfaces;

import liv.codveda.blog.app.domain.dto.response.AdminAnalyticsDto;
import liv.codveda.blog.app.domain.dto.response.UserAnalyticsDto;

public interface AnalyticsService {
    AdminAnalyticsDto getAdminOverview();
    UserAnalyticsDto getMyOverview();
}
