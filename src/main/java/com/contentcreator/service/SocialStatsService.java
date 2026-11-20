package com.contentcreator.service;

import com.contentcreator.entity.CreatorProfile;
import com.contentcreator.entity.SocialActivity;
import com.contentcreator.entity.User;
import com.contentcreator.repository.CreatorProfileRepository;
import com.contentcreator.repository.SocialActivityRepository;
import com.contentcreator.repository.UserRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SocialStatsService {

    private static final Logger log = LoggerFactory.getLogger(SocialStatsService.class);

    private final UserRepository userRepository;
    private final CreatorProfileRepository profileRepository;
    private final SocialActivityRepository activityRepository;
    private final RestClient.Builder restClientBuilder;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${app.social.youtube.api-key:}")
    private String youtubeApiKey;

    @Value("${app.social.instagram.access-token:}")
    private String instagramAccessToken;

    @Transactional
    public Map<String, Object> refresh(String email) {
        User user = resolveUser(email);
        activityRepository.deleteAllSimulated();
        CreatorProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        Map<String, Object> summary = new HashMap<>();
        if (profile == null) {
            summary.put("refreshed", false);
            summary.put("message", "Create a creator profile and link your accounts first.");
            return summary;
        }

        List<String> platforms = new ArrayList<>();
        if (profile.getYoutubeChannel() != null && !profile.getYoutubeChannel().isBlank()) {
            platforms.add(SocialActivity.PLATFORM_YOUTUBE);
        }
        if (profile.getInstagramHandle() != null && !profile.getInstagramHandle().isBlank()) {
            platforms.add(SocialActivity.PLATFORM_INSTAGRAM);
        }

        if (platforms.isEmpty()) {
            summary.put("refreshed", false);
            summary.put("message", "Link your YouTube channel or Instagram handle in your profile first.");
            return summary;
        }

        List<Map<String, Object>> details = new ArrayList<>();
        for (String platform : platforms) {
            String handleUsed = SocialActivity.PLATFORM_YOUTUBE.equals(platform)
                    ? profile.getYoutubeChannel() : profile.getInstagramHandle();
            Map<String, Object> detail = new HashMap<>();
            detail.put("platform", platform);
            SocialActivity snapshot = SocialActivity.PLATFORM_YOUTUBE.equals(platform)
                    ? fetchYoutube(user.getId(), handleUsed)
                    : fetchInstagram(user.getId(), handleUsed);
            if (snapshot != null) {
                snapshot.setHandle(normalizeHandle(handleUsed));
                upsert(user.getId(), platform, snapshot);
                detail.put("live", true);
                detail.put("message", "Live data saved.");
            } else {
                detail.put("live", false);
                detail.put("message", failureReason(platform));
            }
            details.add(detail);
        }

        boolean anyLive = details.stream().anyMatch(d -> Boolean.TRUE.equals(d.get("live")));
        summary.put("refreshed", anyLive);
        summary.put("details", details);
        summary.put("message", anyLive ? "Activity refreshed."
                : "Refresh did not save live data — see details for why.");
        return summary;
    }

    private String failureReason(String platform) {
        if (SocialActivity.PLATFORM_YOUTUBE.equals(platform)
                && (youtubeApiKey == null || youtubeApiKey.isBlank())) {
            return "YouTube API key is not configured on the server.";
        }
        if (SocialActivity.PLATFORM_INSTAGRAM.equals(platform)
                && (instagramAccessToken == null || instagramAccessToken.isBlank())) {
            return "Instagram token is not configured — add manual entries instead.";
        }
        return "Channel lookup failed — check the handle spelling and API quota.";
    }

    public Map<String, Object> overview(String email) {
        User user = resolveUser(email);
        CreatorProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);

        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> platforms = new ArrayList<>();

        if (profile != null) {
            if (profile.getYoutubeChannel() != null && !profile.getYoutubeChannel().isBlank()) {
                platforms.add(platformOverview(user.getId(), SocialActivity.PLATFORM_YOUTUBE, profile.getYoutubeChannel()));
            }
            if (profile.getInstagramHandle() != null && !profile.getInstagramHandle().isBlank()) {
                platforms.add(platformOverview(user.getId(), SocialActivity.PLATFORM_INSTAGRAM, profile.getInstagramHandle()));
            }
        }

        response.put("platforms", platforms);
        response.put("linked", !platforms.isEmpty());
        return response;
    }

    /** Per-platform growth series for the dashboard chart. Range: week | month | year. */
    public Map<String, Object> growth(String email, String range) {
        User user = resolveUser(email);
        CreatorProfile profile = profileRepository.findByUserId(user.getId()).orElse(null);
        String r = normalizeRange(range);

        // A user can see growth even without connecting a live account:
        // platforms come from (linked handles in profile) + (any stored/manual activity rows).
        Set<String> platformSet = new LinkedHashSet<>(activityRepository.findDistinctPlatformByUserId(user.getId()));
        if (profile != null) {
            if (profile.getYoutubeChannel() != null && !profile.getYoutubeChannel().isBlank()) {
                platformSet.add(SocialActivity.PLATFORM_YOUTUBE);
            }
            if (profile.getInstagramHandle() != null && !profile.getInstagramHandle().isBlank()) {
                platformSet.add(SocialActivity.PLATFORM_INSTAGRAM);
            }
        }

        Map<String, Object> response = new HashMap<>();
        List<Map<String, Object>> platforms = new ArrayList<>();
        for (String platform : platformSet) {
            if (!SocialActivity.PLATFORM_YOUTUBE.equals(platform) && !SocialActivity.PLATFORM_INSTAGRAM.equals(platform)) {
                continue;
            }
            String handle = profile != null && SocialActivity.PLATFORM_YOUTUBE.equals(platform)
                    ? profile.getYoutubeChannel() : profile != null ? profile.getInstagramHandle() : "";
            Map<String, Object> growthData = buildGrowth(user.getId(), platform, handle, r);
            boolean hasAnyData = growthData.containsKey("manual") && ((Boolean) growthData.get("manual"))
                    || growthData.containsKey("real") && ((Boolean) growthData.get("real"));
            if (hasAnyData) {
                platforms.add(growthData);
            }
        }
        response.put("platforms", platforms);
        response.put("range", r);
        return response;
    }

    /** Record a manual growth entry (no live account needed) and feed it into the chart. */
    public Map<String, Object> recordManual(String email, String platform, Long followers, Long views, String dateStr) {
        User user = resolveUser(email);
        String p = normalizePlatform(platform);
        LocalDate day = dateStr != null && !dateStr.isBlank() ? LocalDate.parse(dateStr) : LocalDate.now();
        String handle = currentHandleFor(user.getId(), p);

        SocialActivity existing = activityRepository
                .findByUserIdAndPlatformAndHandleAndRecordedOn(user.getId(), p, handle, day)
                .orElseGet(() -> activityRepository.findByUserIdAndPlatformAndRecordedOn(user.getId(), p, day)
                        .orElse(new SocialActivity()));
        existing.setUserId(user.getId());
        existing.setPlatform(p);
        existing.setHandle(handle);
        existing.setRecordedOn(day);
        existing.setFollowers(followers != null ? followers : 0);
        existing.setTotalViews(views != null ? views : 0);
        existing.setRealData(false);
        existing.setManualData(true);
        activityRepository.save(existing);

        Map<String, Object> r = new HashMap<>();
        r.put("saved", true);
        r.put("platform", p);
        r.put("date", day.toString());
        r.put("message", "Manual entry saved — it now feeds your growth chart.");
        return r;
    }

    /** List all activity entries for a user (manual + real), newest first. */
    public List<Map<String, Object>> listEntries(String email) {
        User user = resolveUser(email);
        return activityRepository.findByUserIdOrderByRecordedOnDesc(user.getId()).stream()
                .map(this::toEntryMap)
                .toList();
    }

    /** List only manual entries for a user, newest first. */
    public List<Map<String, Object>> listManualEntries(String email) {
        User user = resolveUser(email);
        return activityRepository.findByUserIdAndManualDataTrueOrderByRecordedOnDesc(user.getId()).stream()
                .map(this::toEntryMap)
                .toList();
    }

    /** Update an existing manual entry by ID (only if owned by user). */
    public Map<String, Object> updateEntry(String email, Long id, Map<String, Object> body) {
        User user = resolveUser(email);
        SocialActivity entry = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry not found"));
        if (!entry.getUserId().equals(user.getId())) {
            throw new RuntimeException("Not your entry");
        }
        if (body.containsKey("platform")) {
            entry.setPlatform(normalizePlatform(body.get("platform").toString()));
            entry.setHandle(currentHandleFor(user.getId(), entry.getPlatform()));
        }
        if (body.containsKey("followers") && body.get("followers") instanceof Number n) {
            entry.setFollowers(n.longValue());
        }
        if (body.containsKey("views") && body.get("views") instanceof Number v) {
            entry.setTotalViews(v.longValue());
        }
        if (body.containsKey("likes") && body.get("likes") instanceof Number l) {
            entry.setTotalLikes(l.longValue());
        }
        if (body.containsKey("comments") && body.get("comments") instanceof Number c) {
            entry.setTotalComments(c.longValue());
        }
        if (body.containsKey("posts") && body.get("posts") instanceof Number p2) {
            entry.setPostCount(p2.longValue());
        }
        if (body.containsKey("date") && body.get("date") != null) {
            entry.setRecordedOn(LocalDate.parse(body.get("date").toString()));
        }
        activityRepository.save(entry);

        Map<String, Object> r = new HashMap<>();
        r.put("saved", true);
        r.put("id", entry.getId());
        r.put("message", "Entry updated.");
        return r;
    }

    /** Delete an entry by ID (only if owned by user). */
    public Map<String, Object> deleteEntry(String email, Long id) {
        User user = resolveUser(email);
        SocialActivity entry = activityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Entry not found"));
        if (!entry.getUserId().equals(user.getId())) {
            throw new RuntimeException("Not your entry");
        }
        activityRepository.delete(entry);
        Map<String, Object> r = new HashMap<>();
        r.put("deleted", true);
        r.put("id", id);
        r.put("message", "Entry deleted.");
        return r;
    }

    private Map<String, Object> toEntryMap(SocialActivity a) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", a.getId());
        m.put("platform", a.getPlatform());
        m.put("handle", a.getHandle());
        m.put("date", a.getRecordedOn().toString());
        m.put("followers", a.getFollowers());
        m.put("totalViews", a.getTotalViews());
        m.put("totalLikes", a.getTotalLikes());
        m.put("totalComments", a.getTotalComments());
        m.put("postCount", a.getPostCount());
        m.put("manualData", a.isManualData());
        m.put("realData", a.isRealData());
        m.put("createdAt", a.getCreatedAt() != null ? a.getCreatedAt().toString() : null);
        m.put("updatedAt", a.getUpdatedAt() != null ? a.getUpdatedAt().toString() : null);
        return m;
    }

    private String normalizePlatform(String platform) {
        String p = platform == null ? "" : platform.toLowerCase();
        if (p.contains("youtube") || "yt".equals(p)) return SocialActivity.PLATFORM_YOUTUBE;
        if (p.contains("instagram") || "ig".equals(p)) return SocialActivity.PLATFORM_INSTAGRAM;
        throw new RuntimeException("Platform must be YouTube or Instagram");
    }

    private String normalizeRange(String range) {
        if (range != null && ("week".equalsIgnoreCase(range) || "month".equalsIgnoreCase(range) || "year".equalsIgnoreCase(range))) {
            return range.toLowerCase();
        }
        return "week";
    }

    private Map<String, Object> buildGrowth(Long userId, String platform, String handle, String range) {
        Map<String, Object> data = new HashMap<>();
        data.put("platform", platform);
        data.put("handle", handle);

        LocalDate today = LocalDate.now();
        List<String> labels = new ArrayList<>();
        List<LocalDate> buckets = new ArrayList<>();

        if ("year".equals(range)) {
            for (int i = 11; i >= 0; i--) {
                LocalDate d = today.minusMonths(i);
                labels.add(d.getMonth().name().substring(0, 3));
                buckets.add(d);
            }
        } else if ("month".equals(range)) {
            DateTimeFormatter fmt = DateTimeFormatter.ofPattern("d MMM");
            for (int i = 29; i >= 0; i--) {
                LocalDate d = today.minusDays(i);
                labels.add(d.format(fmt));
                buckets.add(d);
            }
        } else {
            for (int i = 6; i >= 0; i--) {
                LocalDate d = today.minusDays(i);
                labels.add(d.getDayOfWeek().name().substring(0, 3));
                buckets.add(d);
            }
        }

        List<SocialActivity> rows = activityRepository
                .findByUserIdAndPlatformAndRecordedOnBetweenOrderByRecordedOnAsc(userId, platform, buckets.get(0), today)
                .stream()
                .filter(row -> handle == null || handle.isBlank()
                        || normalizeHandle(row.getHandle()).equalsIgnoreCase(normalizeHandle(handle)))
                .toList();

        int n = buckets.size();
        long[] views = new long[n];
        long[] followers = new long[n];
        boolean[] present = new boolean[n];
        long anchorFollowers = 0;
        boolean anyReal = false;
        boolean anyManual = false;
        for (SocialActivity row : rows) {
            if (!row.isManualData() && !row.isRealData()) continue;
            int idx = bucketIndex(row.getRecordedOn(), range, buckets);
            if (idx < 0) continue;
            views[idx] += row.getTotalViews();
            followers[idx] = row.getFollowers();
            present[idx] = true;
            if (row.getFollowers() > anchorFollowers) anchorFollowers = row.getFollowers();
            if (row.isRealData()) anyReal = true;
            if (row.isManualData()) anyManual = true;
        }

        // No simulated data — only show actual manual/real entries.
        // Forward-fill: days after the first real entry carry the last known
        // value (marked estimated) instead of fake zeros. Days before any
        // data stay empty so the chart never invents history.
        int firstPresent = -1, lastPresent = -1;
        for (int i = 0; i < n; i++) {
            if (present[i]) { if (firstPresent < 0) firstPresent = i; lastPresent = i; }
        }
        boolean[] estimated = new boolean[n];
        if (firstPresent >= 0) {
            for (int i = firstPresent + 1; i < n; i++) {
                if (!present[i]) {
                    followers[i] = followers[i - 1];
                    views[i] = views[i - 1];
                    estimated[i] = true;
                }
            }
        }

        long firstViews = firstPresent >= 0 ? views[firstPresent] : 0;
        long lastViews = lastPresent >= 0 ? views[lastPresent] : 0;
        long firstFol = firstPresent >= 0 ? followers[firstPresent] : 0;
        long lastFol = lastPresent >= 0 ? followers[lastPresent] : 0;
        int presentCount = firstPresent >= 0 ? lastPresent - firstPresent + 1 : 0;
        long growthPct = (firstPresent >= 0 && lastPresent > firstPresent)
                ? Math.round(((double) (lastViews - firstViews) / Math.max(firstViews, 1)) * 100)
                : 0;

        List<Map<String, Object>> series = new ArrayList<>();
        for (int i = 0; i < n; i++) {
            Map<String, Object> point = new HashMap<>();
            point.put("label", labels.get(i));
            point.put("views", firstPresent >= 0 && i >= firstPresent ? views[i] : 0);
            point.put("followers", firstPresent >= 0 && i >= firstPresent ? followers[i] : 0);
            point.put("estimated", estimated[i]);
            point.put("hasData", present[i]);
            series.add(point);
        }

        data.put("series", series);
        data.put("growthPercent", growthPct);
        data.put("followers", lastFol);
        data.put("firstFollowers", firstFol);
        data.put("totalViews", lastViews);
        data.put("totalFirstViews", firstViews);
        data.put("dataPoints", presentCount);
        data.put("real", anyReal);
        data.put("manual", anyManual);
        data.put("source", anyReal ? "live" : anyManual ? "manual" : "simulated");
        data.put("range", range);

        if (SocialActivity.PLATFORM_YOUTUBE.equals(platform) && (anyReal || anyManual) && handle != null && !handle.isBlank()) {
            data.put("recentVideos", fetchRecentYoutubeVideos(handle));
        }
        return data;
    }

    private List<Map<String, Object>> fetchRecentYoutubeVideos(String handle) {
        List<Map<String, Object>> videos = new ArrayList<>();
        if (youtubeApiKey == null || youtubeApiKey.isBlank()) return videos;
        try {
            String clean = handle.replaceAll("^@", "").trim();
            RestClient client = restClientBuilder.build();

            String channelId = null;
            // Try handle lookup first
            try {
                JsonNode ch = client.get()
                        .uri("https://www.googleapis.com/youtube/v3/channels?part=id&forHandle=@{handle}&key={key}", clean, youtubeApiKey)
                        .retrieve()
                        .body(JsonNode.class);
                if (ch != null && ch.has("items") && !ch.get("items").isEmpty()) {
                    channelId = ch.get("items").get(0).path("id").asText();
                }
            } catch (Exception ignored) {}

            // Fallback: search by name
            if (channelId == null || channelId.isBlank()) {
                JsonNode sr = client.get()
                        .uri("https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={q}&maxResults=1&key={key}", clean, youtubeApiKey)
                        .retrieve()
                        .body(JsonNode.class);
                if (sr != null && sr.has("items") && !sr.get("items").isEmpty()) {
                    channelId = sr.get("items").get(0).path("id").path("channelId").asText();
                }
            }
            if (channelId == null || channelId.isBlank()) return videos;

            JsonNode searchResult = client.get()
                    .uri("https://www.googleapis.com/youtube/v3/search?part=snippet&channelId={cid}&type=video&order=date&maxResults=3&key={key}", channelId, youtubeApiKey)
                    .retrieve()
                    .body(JsonNode.class);

            List<String> videoIds = new ArrayList<>();
            List<String> videoTitles = new ArrayList<>();
            List<String> videoDates = new ArrayList<>();
            if (searchResult != null && searchResult.has("items")) {
                for (JsonNode item : searchResult.get("items")) {
                    String vid = item.path("id").path("videoId").asText("");
                    if (!vid.isEmpty()) {
                        videoIds.add(vid);
                        videoTitles.add(unescape(item.path("snippet").path("title").asText("Untitled")));
                        videoDates.add(item.path("snippet").path("publishedAt").asText(""));
                    }
                }
            }

            if (!videoIds.isEmpty()) {
                JsonNode statsResult = client.get()
                        .uri("https://www.googleapis.com/youtube/v3/videos?part=statistics,contentDetails&id={ids}&key={key}", String.join(",", videoIds), youtubeApiKey)
                        .retrieve()
                        .body(JsonNode.class);
                if (statsResult != null && statsResult.has("items")) {
                    for (int i = 0; i < statsResult.get("items").size() && i < videoIds.size(); i++) {
                        JsonNode stat = statsResult.get("items").get(i).path("statistics");
                        Map<String, Object> video = new HashMap<>();
                        video.put("id", videoIds.get(i));
                        video.put("title", videoTitles.get(i));
                        video.put("publishedAt", videoDates.get(i));
                        video.put("views", stat.path("viewCount").asLong(0));
                        video.put("likes", stat.path("likeCount").asLong(0));
                        video.put("comments", stat.path("commentCount").asLong(0));
                        video.put("url", "https://www.youtube.com/watch?v=" + videoIds.get(i));
                        videos.add(video);
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("Failed to fetch recent YouTube videos: {}", ex.getMessage());
        }
        return videos;
    }

    /** YouTube returns HTML-escaped titles (e.g. &quot;). Decode the common ones. */
    private String unescape(String s) {
        if (s == null) return "";
        return s.replace("&quot;", "\"").replace("&#39;", "'").replace("&amp;", "&")
                .replace("&lt;", "<").replace("&gt;", ">").replace("&#34;", "\"");
    }

    private int bucketIndex(LocalDate recordedOn, String range, List<LocalDate> buckets) {        for (int i = 0; i < buckets.size(); i++) {
            LocalDate b = buckets.get(i);
            if ("year".equals(range)) {
                if (b.getYear() == recordedOn.getYear() && b.getMonth() == recordedOn.getMonth()) return i;
            } else if (recordedOn.equals(b)) {
                return i;
            }
        }
        return -1;
    }

    private Map<String, Object> platformOverview(Long userId, String platform, String handle) {
        Map<String, Object> data = new HashMap<>();
        data.put("platform", platform);
        data.put("handle", handle);
        String want = normalizeHandle(handle);

        SocialActivity latest = activityRepository
                .findFirstByUserIdAndPlatformAndHandleOrderByRecordedOnDesc(userId, platform, want)
                .orElseGet(() -> activityRepository
                        .findByUserIdAndPlatformAndRecordedOnBetweenOrderByRecordedOnAsc(
                                userId, platform, LocalDate.now().minusDays(6), LocalDate.now())
                        .stream()
                        .filter(a -> normalizeHandle(a.getHandle()).equalsIgnoreCase(want))
                        .max(java.util.Comparator.comparing(SocialActivity::getRecordedOn))
                        .orElse(null));

        LocalDate from = LocalDate.now().minusDays(6);
        List<SocialActivity> week = activityRepository
                .findByUserIdAndPlatformAndRecordedOnBetweenOrderByRecordedOnAsc(userId, platform, from, LocalDate.now())
                .stream()
                .filter(a -> normalizeHandle(a.getHandle()).equalsIgnoreCase(want))
                .toList();

        List<Map<String, Object>> trend = new ArrayList<>();
        for (LocalDate d = from; !d.isAfter(LocalDate.now()); d = d.plusDays(1)) {
            final LocalDate day = d;
            SocialActivity row = week.stream()
                    .filter(a -> a.getRecordedOn().equals(day))
                    .findFirst().orElse(null);
            Map<String, Object> point = new HashMap<>();
            point.put("date", day.toString());
            point.put("views", row != null ? row.getTotalViews() : 0);
            point.put("likes", row != null ? row.getTotalLikes() : 0);
            point.put("comments", row != null ? row.getTotalComments() : 0);
            trend.add(point);
        }

        if (latest == null) {
            data.put("followers", 0);
            data.put("totalViews", 0);
            data.put("totalLikes", 0);
            data.put("totalComments", 0);
            data.put("postCount", 0);
            data.put("realData", false);
        } else {
            data.put("followers", latest.getFollowers());
            data.put("totalViews", latest.getTotalViews());
            data.put("totalLikes", latest.getTotalLikes());
            data.put("totalComments", latest.getTotalComments());
            data.put("postCount", latest.getPostCount());
            data.put("realData", latest.isRealData());
        }
        data.put("trend", trend);
        return data;
    }

    private void upsert(Long userId, String platform, SocialActivity snapshot) {
        LocalDate today = LocalDate.now();
        String handle = normalizeHandle(snapshot.getHandle());
        Optional<SocialActivity> existingOpt = activityRepository
                .findByUserIdAndPlatformAndHandleAndRecordedOn(userId, platform, handle, today);
        if (existingOpt.isEmpty()) {
            // Fall back to a handle-less row for today (legacy / manual rows).
            existingOpt = activityRepository.findByUserIdAndPlatformAndRecordedOn(userId, platform, today);
        }

        // Don't overwrite manual entries with simulated/live data
        if (existingOpt.isPresent() && existingOpt.get().isManualData()) {
            return;
        }

        SocialActivity existing = existingOpt.orElse(new SocialActivity());
        existing.setUserId(userId);
        existing.setPlatform(platform);
        existing.setHandle(handle);
        existing.setRecordedOn(today);
        existing.setFollowers(snapshot.getFollowers());
        existing.setTotalViews(snapshot.getTotalViews());
        existing.setTotalLikes(snapshot.getTotalLikes());
        existing.setTotalComments(snapshot.getTotalComments());
        existing.setPostCount(snapshot.getPostCount());
        existing.setRealData(snapshot.isRealData());
        existing.setManualData(false);
        activityRepository.save(existing);
    }

    private SocialActivity fetchYoutube(Long userId, String handle) {
        if (youtubeApiKey != null && !youtubeApiKey.isBlank()) {
            try {
                return fetchYoutubeReal(handle);
            } catch (Exception ex) {
                log.warn("YouTube API fetch failed for {}: {}.", handle, ex.getMessage());
            }
        }
        return null;
    }

    private SocialActivity fetchYoutubeReal(String handle) throws Exception {
        String clean = handle.replaceAll("^@", "").trim();
        RestClient client = restClientBuilder.build();
        String channelId = null;

        // Step 1: Try as @handle (no id= param: YouTube rejects mixed filters)
        try {
            JsonNode channels = client.get()
                    .uri("https://www.googleapis.com/youtube/v3/channels?part=statistics&forHandle=@{handle}&key={key}", clean, youtubeApiKey)
                    .retrieve()
                    .body(JsonNode.class);
            if (channels != null && channels.has("items") && !channels.get("items").isEmpty()) {
                channelId = channels.get("items").get(0).get("id").asText();
                JsonNode stats = channels.get("items").get(0).get("statistics");
                return buildYoutubeActivity(channelId, stats);
            }
        } catch (Exception ex) {
            log.info("Handle lookup for @{} failed, trying search...", clean);
        }

        // Step 2: Search by name (e.g. "Slayy Point")
        JsonNode search = client.get()
                .uri("https://www.googleapis.com/youtube/v3/search?part=snippet&type=channel&q={query}&maxResults=1&key={key}", clean, youtubeApiKey)
                .retrieve()
                .body(JsonNode.class);

        if (search != null && search.has("items") && !search.get("items").isEmpty()) {
            channelId = search.get("items").get(0).path("id").path("channelId").asText();
        }

        if (channelId == null || channelId.isBlank()) {
            throw new IllegalStateException("Channel not found: " + handle);
        }

        // Step 3: Fetch stats by channel ID
        JsonNode channelStats = client.get()
                .uri("https://www.googleapis.com/youtube/v3/channels?part=statistics&id={id}&key={key}", channelId, youtubeApiKey)
                .retrieve()
                .body(JsonNode.class);

        if (channelStats == null || !channelStats.has("items") || channelStats.get("items").isEmpty()) {
            throw new IllegalStateException("Channel stats not found");
        }

        JsonNode stats = channelStats.get("items").get(0).get("statistics");
        return buildYoutubeActivity(channelId, stats);
    }

    private SocialActivity buildYoutubeActivity(String channelId, JsonNode stats) {
        long subscribers = stats.path("subscriberCount").asLong(0);
        long channelViews = stats.path("viewCount").asLong(0);
        long videoCount = stats.path("videoCount").asLong(0);

        long videoViews = 0;
        long videoLikes = 0;
        long videoComments = 0;
        try {
            RestClient client = restClientBuilder.build();
            JsonNode search = client.get()
                    .uri("https://www.googleapis.com/youtube/v3/search?part=id&channelId={id}&maxResults=10&type=video&key={key}", channelId, youtubeApiKey)
                    .retrieve()
                    .body(JsonNode.class);
            if (search != null && search.has("items")) {
                List<String> ids = new ArrayList<>();
                search.get("items").forEach(i -> ids.add(i.path("id").path("videoId").asText()));
                if (!ids.isEmpty()) {
                    JsonNode videos = client.get()
                            .uri("https://www.googleapis.com/youtube/v3/videos?part=statistics&id={ids}&key={key}", String.join(",", ids), youtubeApiKey)
                            .retrieve()
                            .body(JsonNode.class);
                    if (videos != null && videos.has("items")) {
                        for (JsonNode v : videos.get("items")) {
                            JsonNode s = v.path("statistics");
                            videoViews += s.path("viewCount").asLong(0);
                            videoLikes += s.path("likeCount").asLong(0);
                            videoComments += s.path("commentCount").asLong(0);
                        }
                    }
                }
            }
        } catch (Exception ex) {
            log.warn("YouTube video stats fetch failed: {}", ex.getMessage());
        }

        return SocialActivity.builder()
                .followers(subscribers)
                .totalViews(Math.max(channelViews, videoViews))
                .totalLikes(videoLikes)
                .totalComments(videoComments)
                .postCount(videoCount)
                .realData(true)
                .build();
    }

    private SocialActivity fetchInstagram(Long userId, String handle) {
        if (instagramAccessToken != null && !instagramAccessToken.isBlank()) {
            try {
                return fetchInstagramReal(handle);
            } catch (Exception ex) {
                log.warn("Instagram fetch failed for {}: {}.", handle, ex.getMessage());
            }
        }
        return null;
    }

    private SocialActivity fetchInstagramReal(String handle) throws Exception {
        RestClient client = restClientBuilder.build();
        JsonNode user = client.get()
                .uri("https://graph.instagram.com/me?fields=username,media_count,followers_count&access_token={t}", instagramAccessToken)
                .retrieve()
                .body(JsonNode.class);
        if (user == null) {
            throw new IllegalStateException("Instagram account not found");
        }
        return SocialActivity.builder()
                .followers(user.path("followers_count").asLong(0))
                .postCount(user.path("media_count").asLong(0))
                .totalViews(0)
                .totalLikes(0)
                .totalComments(0)
                .realData(true)
                .build();
    }

    private User resolveUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    /** Normalized channel identity so switching channels keeps separate histories. */
    private String normalizeHandle(String handle) {
        if (handle == null) return "manual";
        String clean = handle.replaceAll("^@", "").trim();
        return clean.isEmpty() ? "manual" : clean;
    }

    private String currentHandleFor(Long userId, String platform) {
        try {
            var profile = profileRepository.findByUserId(userId).orElse(null);
            if (profile == null) return "manual";
            String h = SocialActivity.PLATFORM_YOUTUBE.equals(platform)
                    ? profile.getYoutubeChannel() : profile.getInstagramHandle();
            return normalizeHandle(h);
        } catch (Exception ex) {
            return "manual";
        }
    }
}
