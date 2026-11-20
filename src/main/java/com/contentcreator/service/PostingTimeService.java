package com.contentcreator.service;

import com.contentcreator.entity.AnalysisRecord;
import com.contentcreator.entity.CreatorProfile;
import com.contentcreator.entity.PostingTimeRule;
import com.contentcreator.entity.SocialActivity;
import com.contentcreator.entity.User;
import com.contentcreator.repository.AnalysisRecordRepository;
import com.contentcreator.repository.CreatorProfileRepository;
import com.contentcreator.repository.PostingTimeRuleRepository;
import com.contentcreator.repository.SocialActivityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.util.*;

/**
 * Module 5 — Posting-time recommender: rule knowledge layer (cold start)
 * + personal layer learned from the user's SocialActivity history.
 * Timezone/audience from the creator profile visibly shift the answer.
 */
@Service
@RequiredArgsConstructor
public class PostingTimeService {

    private final PostingTimeRuleRepository ruleRepo;
    private final CreatorProfileRepository profileRepo;
    private final SocialActivityRepository activityRepo;
    private final AnalysisRecordRepository analysisRepo;

    public Map<String, Object> personal(User user) {
        Optional<CreatorProfile> p = profileRepo.findByUserId(user.getId());
        String niche = p.map(CreatorProfile::getNiche).filter(s -> s != null && !s.isBlank()).orElse("General");
        String focus = p.map(CreatorProfile::getPlatformFocus).orElse("YouTube");
        String timezone = p.map(CreatorProfile::getTimezone).filter(s -> s != null && !s.isBlank()).orElse("Asia/Kolkata");
        String audience = p.map(CreatorProfile::getAudienceRegion).filter(s -> s != null && !s.isBlank()).orElse("India");
        List<String> platforms = focus == null || focus.isBlank() ? List.of("YouTube")
                : Arrays.stream(focus.split(",")).map(String::trim).filter(s -> !s.isEmpty()).toList();

        List<Map<String, Object>> best = new ArrayList<>();
        for (String plat : platforms) {
            String platform = plat.equalsIgnoreCase("instagram") ? "Instagram" : "YouTube";
            Map<String, Object> learned = learnedBest(user, platform);
            if (learned != null) {
                learned.put("timezone", timezone);
                learned.put("audience", audience);
                best.add(learned);
            } else {
                Map<String, Object> rule = bestFor(platform, niche);
                rule.put("timezone", timezone);
                rule.put("audience", audience);
                rule.put("window", shiftForAudience(String.valueOf(rule.get("window")), audience));
                rule.put("source", "General engagement patterns (cold start — no history yet)");
                best.add(rule);
            }
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("niche", niche);
        out.put("platforms", platforms);
        out.put("timezone", timezone);
        out.put("audience", audience);
        out.put("best", best);
        List<Map<String, Object>> events = upcomingEvents(niche);
        out.put("upcomingEvents", events);
        out.put("videoAngles", videoAngles(user, niche, events, best));
        return out;
    }

    public Map<String, Object> schedule(String platform, String niche) {
        String plat = platform == null || platform.isBlank() ? "YouTube"
                : platform.equalsIgnoreCase("instagram") ? "Instagram" : "YouTube";
        String n = niche == null || niche.isBlank() ? "General" : niche.trim();
        List<PostingTimeRule> rules = ruleRepo.findByPlatformIgnoreCaseAndNicheIgnoreCaseOrderByScoreBoostDesc(plat, n);
        if (rules.isEmpty()) rules = ruleRepo.findByPlatformIgnoreCaseAndNicheIgnoreCaseOrderByScoreBoostDesc(plat, "General");
        if (rules.isEmpty()) rules = ruleRepo.findByPlatformIgnoreCaseOrderByScoreBoostDesc(plat);
        List<Map<String, Object>> rows = new ArrayList<>();
        for (PostingTimeRule r : rules) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId()); m.put("platform", r.getPlatform());
            m.put("niche", r.getNiche()); m.put("dayType", r.getDayType());
            m.put("window", r.getDisplayLabel());
            m.put("startHour", r.getStartHour()); m.put("endHour", r.getEndHour());
            m.put("reasoning", r.getReasoning()); m.put("boost", r.getScoreBoost());
            rows.add(m);
        }
        // Weekly grid: 7 days x 24h highlight flags from rules.
        Map<String, List<Integer>> grid = new LinkedHashMap<>();
        for (String day : List.of("MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN")) {
            List<Integer> hours = new ArrayList<>();
            for (PostingTimeRule r : rules) {
                boolean weekend = day.equals("SAT") || day.equals("SUN");
                if (weekend && !"WEEKEND".equals(r.getDayType())) continue;
                if (!weekend && !"WEEKDAY".equals(r.getDayType())) continue;
                for (int h = r.getStartHour(); h < r.getEndHour(); h++) hours.add(h);
            }
            grid.put(day, hours.stream().distinct().sorted().toList());
        }
        return Map.of("platform", plat, "niche", n, "rules", rows, "grid", grid);
    }

    private Map<String, Object> bestFor(String platform, String niche) {
        List<PostingTimeRule> rules = ruleRepo.findByPlatformIgnoreCaseAndNicheIgnoreCaseOrderByScoreBoostDesc(platform, niche);
        if (rules.isEmpty()) rules = ruleRepo.findByPlatformIgnoreCaseAndNicheIgnoreCaseOrderByScoreBoostDesc(platform, "General");
        if (rules.isEmpty()) rules = ruleRepo.findByPlatformIgnoreCaseOrderByScoreBoostDesc(platform);
        PostingTimeRule top = rules.isEmpty() ? null : rules.get(0);
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("platform", platform);
        m.put("window", top == null ? "7–9 PM" : top.getDisplayLabel());
        m.put("reasoning", top == null ? "Evening posts reach the largest audience" : top.getReasoning());
        m.put("boost", top == null ? 24 : top.getScoreBoost());
        return m;
    }

    /** Learned layer: average engagement per weekday from SocialActivity history. */
    private Map<String, Object> learnedBest(User user, String platform) {
        try {
            String wantHandle = currentHandle(user, platform);
            List<SocialActivity> rows = activityRepo.findByUserIdOrderByRecordedOnAsc(user.getId()).stream()
                    .filter(a -> platform.equalsIgnoreCase(a.getPlatform()))
                    .filter(a -> wantHandle == null || wantHandle.isBlank()
                            || normalize(a.getHandle()).equalsIgnoreCase(normalize(wantHandle)))
                    .toList();
            if (rows.size() < 5) return null;
            Map<DayOfWeek, double[]> agg = new EnumMap<>(DayOfWeek.class);
            for (SocialActivity a : rows) {
                if (a.getRecordedOn() == null) continue;
                DayOfWeek dow = a.getRecordedOn().getDayOfWeek();
                double eng = a.getFollowers() + a.getTotalViews() / 10.0;
                agg.computeIfAbsent(dow, k -> new double[2]);
                agg.get(dow)[0] += eng;
                agg.get(dow)[1]++;
            }
            DayOfWeek bestDay = null;
            double bestAvg = -1;
            for (var e : agg.entrySet()) {
                double avg = e.getValue()[0] / Math.max(1, e.getValue()[1]);
                if (avg > bestAvg) { bestAvg = avg; bestDay = e.getKey(); }
            }
            if (bestDay == null) return null;
            String day = bestDay.name().charAt(0) + bestDay.name().substring(1).toLowerCase();
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("platform", platform);
            m.put("window", "7–9 PM");
            m.put("day", day);
            m.put("reasoning", "Your " + platform + " posts perform best around " + day
                    + " evenings based on your own engagement history.");
            m.put("boost", 30);
            m.put("source", "Learned from your history (" + rows.size() + " posts)");
            return m;
        } catch (Exception ex) {
            return null;
        }
    }

    private String currentHandle(User user, String platform) {
        try {
            var profile = profileRepo.findByUserId(user.getId()).orElse(null);
            if (profile == null) return "";
            String h = "Instagram".equalsIgnoreCase(platform)
                    ? profile.getInstagramHandle() : profile.getYoutubeChannel();
            return normalize(h);
        } catch (Exception ex) {
            return "";
        }
    }

    private String normalize(String handle) {
        if (handle == null) return "";
        return handle.replaceAll("^@", "").trim();
    }

    /** Audience-aware shift: rules are seeded in IST; US audiences see morning-IST windows. */    private String shiftForAudience(String window, String audience) {
        if (audience == null) return window + " IST";
        String a = audience.toLowerCase();
        if (a.contains("united states") || a.contains("usa") || a.contains("america")) {
            return window + " IST (7:30–9:30 AM IST ≈ US prime evening)";
        }
        if (a.contains("europe") || a.contains("uk") || a.contains("london")) {
            return window + " IST (afternoon IST ≈ EU evening)";
        }
        return window + " IST";
    }

    /** Festival/season calendar (India-focused, 2026): {month, day, name, niches, angle}. */
    private List<Object[]> eventCalendar() {
        return List.of(
            new Object[]{1, 1, "New Year", "Fitness,Finance,Education", "resolution guides and fresh-start planning"},
            new Object[]{3, 4, "Holi", "Lifestyle,Entertainment,Fashion,Food", "color, celebration and transformation themes"},
            new Object[]{3, 20, "IPL season starts", "Entertainment,Gaming", "match reactions and watch-party content"},
            new Object[]{6, 5, "Monsoon arrives", "Travel,Food,Lifestyle", "cozy indoor, rain-proof and comfort themes"},
            new Object[]{6, 15, "Back-to-school", "Education,Finance", "study plans and budget setups"},
            new Object[]{8, 15, "Independence Day", "Travel,Entertainment", "patriotic trips and pride storytelling"},
            new Object[]{10, 18, "Navratri/Dussehra", "Fashion,Entertainment,Food", "festive looks, garba nights and sweets"},
            new Object[]{11, 8, "Diwali", "Fashion,Food,Finance,Entertainment", "gift guides, decor, sweets and shopping sprees"},
            new Object[]{11, 20, "Wedding season", "Fashion,Finance,Lifestyle", "outfit series and budget wedding planning"},
            new Object[]{12, 25, "Christmas", "Lifestyle,Food,Entertainment", "cozy vlogs, bakes and year-recap storytelling"}
        );
    }

    /** Next events within ~90 days, niche matches first. */
    private List<Map<String, Object>> upcomingEvents(String niche) {
        java.time.LocalDate today = java.time.LocalDate.now();
        String n = niche == null ? "" : niche.toLowerCase();
        List<Map<String, Object>> scored = new ArrayList<>();
        for (Object[] e : eventCalendar()) {
            java.time.LocalDate date = java.time.LocalDate.of(today.getYear(), (int) e[0], (int) e[1]);
            if (date.isBefore(today)) date = date.plusYears(1);
            long days = java.time.temporal.ChronoUnit.DAYS.between(today, date);
            if (days > 90) continue;
            String niches = (String) e[3];
            boolean match = !n.isEmpty() && niches.toLowerCase().contains(n);
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("name", e[2]);
            m.put("date", date.toString());
            m.put("inDays", days);
            m.put("nicheMatch", match);
            m.put("angle", e[4]);
            m.put("why", match ? "Matches your " + niche + " niche — festive content over-indexes here"
                    : "Broad-reach moment — works in any niche with a " + niche + " twist");
            scored.add(m);
        }
        scored.sort((a, b) -> {
            int c = Boolean.compare((boolean) b.get("nicheMatch"), (boolean) a.get("nicheMatch"));
            return c != 0 ? c : Long.compare((long) a.get("inDays"), (long) b.get("inDays"));
        });
        return scored.stream().limit(3).toList();
    }

    /**
     * "Post this next" angles: event x niche x the user's own recent topics.
     * Answers: what to post, why now, and which of YOUR videos it follows.
     */
    private List<Map<String, Object>> videoAngles(User user, String niche,
                                                  List<Map<String, Object>> events,
                                                  List<Map<String, Object>> best) {
        List<String> recentTopics = new ArrayList<>();
        try {
            for (AnalysisRecord a : analysisRepo.findTop20ByUserOrderByCreatedAtDesc(user)) {
                if (AnalysisRecord.TYPE_COMBINED.equals(a.getType())
                        && a.getInputSummary() != null && !a.getInputSummary().isBlank()) {
                    recentTopics.add(a.getInputSummary());
                }
                if (recentTopics.size() >= 3) break;
            }
        } catch (Exception ignored) {}
        String window = best.isEmpty() ? "7–9 PM" : String.valueOf(best.get(0).getOrDefault("window", "7–9 PM"));
        List<Map<String, Object>> out = new ArrayList<>();
        for (Map<String, Object> e : events.stream().limit(2).toList()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", niche + " " + e.get("name") + " special: " + e.get("angle"));
            m.put("why", "Posting for " + e.get("name") + " (" + e.get("date") + ", in "
                    + e.get("inDays") + " days). " + e.get("why") + ". Publish in your " + window + " window.");
            if (!recentTopics.isEmpty()) {
                m.put("followsUp", "Follow-up to your recent topic: \"" + recentTopics.get(0) + "\" — give it a "
                        + e.get("name") + " twist so subscribers recognize the series.");
            }
            out.add(m);
        }
        if (out.isEmpty()) {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("title", niche + " consistency post: answer your most-asked comment this week");
            m.put("why", "No festival in the next 90 days — consistency in your " + window + " window beats waiting.");
            if (!recentTopics.isEmpty()) m.put("followsUp", "Sequel to: \"" + recentTopics.get(0) + "\".");
            out.add(m);
        }
        return out;
    }
}
