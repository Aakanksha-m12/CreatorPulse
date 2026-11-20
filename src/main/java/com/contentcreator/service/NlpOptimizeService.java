package com.contentcreator.service;

import com.contentcreator.entity.AnalysisRecord;
import com.contentcreator.entity.CreatorProfile;
import com.contentcreator.entity.User;
import com.contentcreator.config.PremiumRequiredException;
import com.contentcreator.repository.AnalysisRecordRepository;
import com.contentcreator.repository.CreatorProfileRepository;
import com.contentcreator.repository.HashtagReferenceRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Module 4 — NLP Caption/Title/Hashtag optimizer, pure Java.
 * Sentiment = lexicon balance; readability = Flesch-Kincaid on
 * vowel-group syllables; hashtags = niche reference list match;
 * title = rule checklist with per-rule reasons.
 */
@Service
@RequiredArgsConstructor
public class NlpOptimizeService {

    private final AnalysisRecordRepository analysisRepo;
    private final HashtagReferenceRepository hashtagRepo;
    private final CreatorProfileRepository profileRepo;
    private final SubscriptionService subscriptionService;
    private final ObjectMapper objectMapper;

    private static final Set<String> POSITIVE = Set.of(
            "amazing", "awesome", "love", "loved", "best", "great", "excellent", "fantastic",
            "wonderful", "brilliant", "happy", "excited", "exciting", "incredible", "perfect",
            "beautiful", "fun", "enjoy", "win", "winning", "success", "successful", "growth",
            "inspire", "inspiring", "motivate", "easy", "simple", "free", "new", "secret",
            "proven", "ultimate", "powerful", "epic", "fire", "lit", "wow", "yay", "yes",
            "thank", "thanks", "grateful", "blessed", "vibes", "dream", "magic", "unstoppable");
    private static final Set<String> NEGATIVE = Set.of(
            "hate", "terrible", "awful", "worst", "bad", "sad", "angry", "fail", "failed",
            "failure", "boring", "hard", "difficult", "problem", "issue", "mistake", "mistakes",
            "never", "no", "not", "cannot", "cant", "wont", "dont", "stop", "warning",
            "risky", "scam", "fake", "ugly", "slow", "broken", "cringe", "disappointing");
    private static final Set<String> POWER_WORDS = Set.of(
            "secret", "proven", "ultimate", "free", "new", "how", "why", "stop", "mistakes",
            "tested", "guaranteed", "insane", "shocking", "revealed", "step", "guide", "hack",
            "trick", "truth", "nobody", "everyone", "before", "after");
    private static final Set<String> GENERIC_TAGS = Set.of(
            "love", "instagood", "photooftheday", "beautiful", "happy", "follow", "like",
            "viral", "trending", "explore", "reels", "video", "content", "post");

    public Map<String, Object> analyze(User user, String caption, String title,
                                       List<String> hashtags, String nicheOverride) {
        caption = caption == null ? "" : caption.trim();
        title = title == null ? "" : title.trim();
        hashtags = normalizeTags(hashtags);
        if (caption.isEmpty() && title.isEmpty() && hashtags.isEmpty()) {
            throw new RuntimeException("Write a caption, a title, or add hashtags to analyse");
        }
        if (caption.length() > 2200) throw new RuntimeException("Caption must be under 2200 characters (Instagram limit)");        if (title.length() > 100) throw new RuntimeException("Title must be under 100 characters");
        if (hashtags.size() > 30) throw new RuntimeException("Maximum 30 hashtags per analysis");
        // Free quota (also enforced by PremiumQuotaInterceptor): 10 NLP analyses/week.
        if (!subscriptionService.isPremium(user.getId())) {
            long used = analysisRepo.countByUserAndTypeAndCreatedAtAfter(
                    user, AnalysisRecord.TYPE_COMBINED, LocalDateTime.now().minusDays(7));
            if (used >= 10) {
                throw new PremiumRequiredException(
                        "Free plan allows 10 content analyses per week — upgrade to Pro for unlimited access");
            }
        }

        String niche = resolveNiche(user, nicheOverride);
        String textForCards = caption.isEmpty() ? title : caption + " " + title;
        Map<String, Object> tone = toneCard(caption.isEmpty() ? title : caption);
        tone = withMethod(tone, "Lexicon-based sentiment (curated word lists)");
        Map<String, Object> readability = readabilityCard(caption.isEmpty() ? title : caption);
        Map<String, Object> tagResult = hashtagCard(hashtags, niche, title, caption);
        Map<String, Object> titleResult = titleCard(title);
        Map<String, Object> keywords = tfidfCard(textForCards, niche);

        int overall = (int) Math.round(
                num(tone, "score") * 0.25 + num(readability, "score") * 0.25
                        + num(tagResult, "score") * 0.25 + num(titleResult, "score") * 0.25);

        Map<String, Object> generated = buildImproved(title, caption, hashtags, tagResult, niche);
        persist(user, caption, title, hashtags, overall, tone, readability, tagResult, titleResult, niche, keywords);

        Map<String, Object> out = new LinkedHashMap<>();
        out.put("overallScore", overall);
        out.put("niche", niche);
        out.put("tone", tone);
        out.put("readability", readability);
        out.put("hashtags", tagResult);
        out.put("title", titleResult);
        out.put("keywords", keywords);
        out.put("generated", generated);
        out.put("premium", false);
        return out;
    }

    /**
     * What the creator should actually POST: rewritten titles, an opening
     * hook line, and a finished hashtag set. One tap applies all of it.
     */
    @SuppressWarnings("unchecked")
    private Map<String, Object> buildImproved(String title, String caption, List<String> tags,
                                             Map<String, Object> tagResult, String niche) {
        String base = title.isEmpty() && !caption.isEmpty()
                ? caption.split("[.!?\\n]")[0].trim() : title;
        if (base.isEmpty()) base = "My " + niche + " video";
        if (base.length() > 70) base = base.substring(0, 67).trim() + "...";

        List<String> variants = new ArrayList<>();
        String withNumber = base.matches(".*\\d.*") ? base : "5 " + lcFirst(base);
        variants.add(trimTitle(withNumber));
        String question = base.endsWith("?") ? base
                : ("How " + lcFirst(stripTrailing(base, ".")) + "?");
        variants.add(trimTitle(question));
        variants.add(trimTitle("Nobody tells " + niche.toLowerCase() + " beginners this: "
                + lcFirst(stripTrailing(base, "."))));

        String keyword = "";
        try {
            var sug = (List<Map<String, Object>>) tagResult.get("suggested");
            if (sug != null && !sug.isEmpty()) keyword = String.valueOf(sug.get(0).get("tag")).replace("#", "");
        } catch (Exception ignored) {}
        String hook = base + " — here is the part nobody shows you " + (keyword.isEmpty() ? "👇" : "#" + keyword + " 👇");

        List<String> matched = new ArrayList<>();
        try {
            var m = (List<String>) tagResult.get("matched");
            if (m != null) matched.addAll(m);
        } catch (Exception ignored) {}
        List<String> recommended = new ArrayList<>(matched);
        try {
            var sug = (List<Map<String, Object>>) tagResult.get("suggested");
            if (sug != null) for (var s : sug) {
                String t = String.valueOf(s.get("tag")).toLowerCase();
                if (!recommended.contains(t)) recommended.add(t);
                if (recommended.size() >= 10) break;
            }
        } catch (Exception ignored) {}
        for (String t : tags) {
            if (!recommended.contains(t) && recommended.size() < 12) recommended.add(t);
        }

        Map<String, Object> g = new LinkedHashMap<>();
        g.put("titles", variants.stream().distinct().limit(3).toList());
        g.put("pickTitle", variants.get(0));
        g.put("hook", hook);
        g.put("hookNote", "Put this as the FIRST line of your caption — it decides in 2 seconds whether someone keeps reading.");
        g.put("hashtags", recommended);
        g.put("hashtagsNote", "Copy-ready set: your niche tags first, then your own.");
        return g;
    }

    private String lcFirst(String s) {
        if (s == null || s.isEmpty()) return s;
        return Character.toLowerCase(s.charAt(0)) + s.substring(1);
    }

    private String stripTrailing(String s, String suffix) {
        if (s != null && s.endsWith(suffix)) return s.substring(0, s.length() - suffix.length());
        return s;
    }

    private String trimTitle(String s) {
        if (s == null) return "";
        s = s.trim();
        return s.length() <= 70 ? s : s.substring(0, 67).trim() + "...";
    }

    public List<Map<String, Object>> history(User user) {
        List<Map<String, Object>> out = new ArrayList<>();
        for (AnalysisRecord a : analysisRepo.findTop20ByUserOrderByCreatedAtDesc(user)) {
            if (!Set.of(AnalysisRecord.TYPE_CAPTION, AnalysisRecord.TYPE_TITLE,
                    AnalysisRecord.TYPE_HASHTAG, AnalysisRecord.TYPE_COMBINED).contains(a.getType())) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId()); m.put("type", a.getType());
            m.put("summary", a.getInputSummary()); m.put("score", a.getScore());
            m.put("createdAt", String.valueOf(a.getCreatedAt()));
            try { m.put("details", objectMapper.readValue(a.getDetails(), Object.class)); }
            catch (Exception ignored) { m.put("details", a.getDetails()); }
            out.add(m);
            if (out.size() >= 10) break;
        }
        return out;
    }

    // ---- cards ----
    private Map<String, Object> toneCard(String text) {
        List<String> words = words(text);
        long pos = words.stream().filter(POSITIVE::contains).count();
        long neg = words.stream().filter(NEGATIVE::contains).count();
        double raw = words.isEmpty() ? 0 : (double) (pos - neg) / Math.max(1, (pos + neg));
        int score = words.isEmpty() ? 50 : clamp((int) Math.round(62 + raw * 38));
        String label = raw > 0.3 ? "Positive" : raw < -0.2 ? "Negative" : "Neutral";
        String line = words.isEmpty() ? "Add text to measure tone"
                : label.equals("Positive") ? "Warm, upbeat tone — " + pos + " uplifting vs " + neg + " heavy words"
                : label.equals("Negative") ? "Heavy tone — swap " + neg + " negative words for encouraging ones"
                : "Balanced tone — add one vivid positive word to lift energy";
        return Map.of("score", score, "label", label, "line", line,
                "positive", pos, "negative", neg);
    }

    private Map<String, Object> readabilityCard(String text) {
        int sentences = Math.max(1, text.isEmpty() ? 1 : text.split("[.!?\\n]+").length);
        List<String> ws = words(text);
        int nWords = Math.max(1, ws.size());
        int syllables = ws.stream().mapToInt(this::syllables).sum();
        double ease = 206.835 - 1.015 * ((double) nWords / sentences) - 84.6 * ((double) Math.max(1, syllables) / nWords);
        ease = Math.max(0, Math.min(100, ease));
        double grade = 0.39 * ((double) nWords / sentences) + 11.8 * ((double) Math.max(1, syllables) / nWords) - 15.59;
        int score = text.isEmpty() ? 50 : clamp((int) Math.round(ease));
        String label = ease >= 70 ? "Easy to read" : ease >= 50 ? "Fairly readable" : "Hard to scan";
        String line = text.isEmpty() ? "Add a caption to check readability"
                : ease >= 70 ? String.format("Grade ~%.0f reading level — captions scan fast on mobile", Math.max(1, grade))
                : "Shorten sentences and swap long words — aim for grade 6–8";
        return Map.of("score", score, "label", label, "line", line,
                "fleschEase", Math.round(ease), "gradeLevel", Math.round(Math.max(1, grade) * 10) / 10.0,
                "words", nWords, "sentences", sentences);
    }

    private Map<String, Object> hashtagCard(List<String> tags, String niche, String title, String caption) {
        var refs = hashtagRepo.findByNicheIgnoreCaseOrderByPopularityDesc(niche);
        if (refs.isEmpty()) refs = hashtagRepo.findByNicheIgnoreCaseOrderByPopularityDesc("Entertainment");
        Set<String> refSet = refs.stream().map(r -> norm(r.getHashtag())).collect(Collectors.toSet());

        // Words from THIS title + caption — suggestions are ranked by them.
        Set<String> titleWords = new java.util.HashSet<>(words((title == null ? "" : title) + " " + (caption == null ? "" : caption)));
        titleWords.removeAll(STOPWORDS);

        List<String> matched = new ArrayList<>(), generic = new ArrayList<>();
        for (String t : tags) {
            String n = norm(t);
            if (refSet.contains(n)) matched.add(t);
            else if (GENERIC_TAGS.contains(n.replace("#", ""))) generic.add(t);
        }
        Set<String> used = tags.stream().map(this::norm).collect(Collectors.toSet());
        List<Map<String, Object>> suggested = refs.stream()
                .filter(r -> !used.contains(norm(r.getHashtag())))
                .map(r -> {
                    Set<String> tagWords = new java.util.HashSet<>(
                            Arrays.asList(norm(r.getHashtag()).replace("#", "").split("[^a-z]+")));
                    tagWords.retainAll(titleWords);
                    int pop = r.getPopularity() == null ? 50 : r.getPopularity();
                    double rank = pop + tagWords.size() * 60.0;
                    Map<String, Object> s = new LinkedHashMap<>();
                    s.put("tag", r.getHashtag());
                    s.put("popularity", pop);
                    s.put("why", tagWords.isEmpty()
                            ? "Top tag in " + niche
                            : "Matches your title word" + (tagWords.size() > 1 ? "s" : "") + ": "
                            + String.join(", ", tagWords.stream().limit(3).toList()));
                    s.put("rank", rank);
                    return s;
                })
                .sorted((a, b) -> Double.compare((double) b.get("rank"), (double) a.get("rank")))
                .limit(8)
                .peek(s -> s.remove("rank"))
                .collect(Collectors.toList());

        int score;
        String line;
        if (tags.isEmpty()) { score = 40; line = "Add 5–10 niche hashtags — tap a suggestion below to start"; }
        else {
            double hitRate = (double) matched.size() / tags.size();
            double sizeScore = tags.size() >= 5 && tags.size() <= 12 ? 1 : tags.size() < 5 ? 0.6 : 0.75;
            score = clamp((int) Math.round(hitRate * 70 + sizeScore * 30));
            line = matched.size() + " of " + tags.size() + " match your niche"
                    + (generic.isEmpty() ? " — drop generic tags like #love #viral" : "; replace generic: " + String.join(", ", generic.stream().limit(3).toList()));
        }
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("score", score); m.put("line", line);
        m.put("matched", matched); m.put("generic", generic); m.put("suggested", suggested);
        m.put("used", tags.size());
        return m;
    }

    private Map<String, Object> titleCard(String title) {
        List<Map<String, Object>> checks = new ArrayList<>();
        checks.add(check(!title.isEmpty(), "Has a title", "Missing — thumbnails + titles work as a pair"));
        checks.add(check(title.length() >= 30 && title.length() <= 70,
                "Length " + title.length() + " chars in the 30–70 sweet spot",
                title.isEmpty() ? "Add a title to check length" : title.length() < 30 ? "Too short (" + title.length() + ") — add a benefit or number" : "Too long (" + title.length() + ") — trim to under 70"));
        checks.add(check(Pattern.compile("\\d").matcher(title).find(),
                "Contains a number — numbers lift CTR", "Add a number (‘3’, ‘60s’, ‘2026’)"));
        checks.add(check(title.contains("?") || title.toLowerCase().matches(".*\\b(how|why|what|which|when)\\b.*"),
                "Curiosity hook present", "Ask a question or start with How/Why"));
        checks.add(check(words(title).stream().anyMatch(POWER_WORDS::contains),
                "Power word included", "Add one: secret, proven, free, shocking, hack"));
        checks.add(check(!title.equals(title.toUpperCase()) || title.isEmpty(),
                "Not full caps — readable", "Avoid ALL CAPS — it reads as shouting"));
        long passed = checks.stream().filter(c -> Boolean.TRUE.equals(c.get("pass"))).count();
        int score = title.isEmpty() ? 35 : (int) Math.round(passed * 100.0 / checks.size());
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("score", score); m.put("checks", checks);
        m.put("line", title.isEmpty() ? "Add a title to score clickability"
                : passed + " of " + checks.size() + " clickability rules passing");
        return m;
    }

    // ---- helpers ----
    private Map<String, Object> check(boolean pass, String okLine, String fixLine) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("pass", pass); m.put("line", pass ? okLine : fixLine);
        return m;
    }

    private List<String> words(String s) {
        if (s == null || s.isBlank()) return List.of();
        return Arrays.stream(s.toLowerCase().replaceAll("[^a-z'\\s]", " ").split("\\s+"))
                .filter(w -> !w.isBlank()).toList();
    }

    private int syllables(String word) {
        String w = word.toLowerCase().replaceAll("[^a-z]", "");
        if (w.isEmpty()) return 0;
        if (w.length() <= 3) return 1;
        int groups = 0; boolean prevVowel = false;
        for (char c : w.toCharArray()) {
            boolean v = "aeiouy".indexOf(c) >= 0;
            if (v && !prevVowel) groups++;
            prevVowel = v;
        }
        if (w.endsWith("e")) groups = Math.max(1, groups - 1);
        return Math.max(1, groups);
    }

    private List<String> normalizeTags(List<String> in) {
        if (in == null) return List.of();
        LinkedHashSet<String> out = new LinkedHashSet<>();
        for (String t : in) {
            if (t == null) continue;
            String v = t.trim().replaceAll("\\s+", "");
            if (v.isEmpty()) continue;
            if (!v.startsWith("#")) v = "#" + v;
            if (!v.matches("#[A-Za-z0-9_]{2,60}")) continue;
            out.add(v.toLowerCase());
        }
        return new ArrayList<>(out);
    }

    private String norm(String tag) { return tag == null ? "" : tag.trim().toLowerCase(); }

    private String resolveNiche(User user, String override) {
        if (override != null && !override.isBlank()) return cap(override.trim());
        Optional<CreatorProfile> p = profileRepo.findByUserId(user.getId());
        if (p.isPresent()) {
            if (p.get().getNiche() != null && !p.get().getNiche().isBlank()) return cap(p.get().getNiche());
            if (p.get().getNiches() != null && !p.get().getNiches().isBlank())
                return cap(p.get().getNiches().split(",")[0].trim());
        }
        return "Entertainment";
    }

    private String cap(String s) {
        if (s.isEmpty()) return s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }

    private int num(Map<String, Object> m, String k) { return ((Number) m.get(k)).intValue(); }
    private int clamp(int v) { return Math.max(0, Math.min(100, v)); }

    private Map<String, Object> withMethod(Map<String, Object> card, String method) {
        Map<String, Object> m = new LinkedHashMap<>(card);
        m.put("method", method);
        return m;
    }

    private static final Set<String> STOPWORDS = Set.of(
            "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for",
            "of", "with", "by", "is", "are", "was", "were", "be", "been", "this",
            "that", "these", "those", "it", "its", "as", "from", "you", "your",
            "we", "our", "they", "their", "he", "she", "his", "her", "my", "me",
            "i", "will", "can", "just", "about", "into", "over", "after", "before");

    /**
     * Real TF-IDF keyword extraction: TF from the user's text,
     * IDF over the hashtag-reference corpus (each niche tag list = a document).
     * TF-IDF(t,d) = TF(t,d) x log(N / df(t)).
     */
    private Map<String, Object> tfidfCard(String text, String niche) {
        List<String> tokens = words(text).stream()
                .filter(w -> w.length() > 2 && !STOPWORDS.contains(w)).toList();
        Map<String, Object> empty = new LinkedHashMap<>();
        empty.put("method", "TF-IDF over niche reference corpus");
        empty.put("keywords", List.of());
        empty.put("line", tokens.isEmpty() ? "Write more text to extract keywords" : "No distinctive keywords found");
        if (tokens.isEmpty()) return empty;
        // Corpus: one document per niche from hashtag reference + user's niche docs.
        List<List<String>> docs = new ArrayList<>();
        try {
            var all = hashtagRepo.findAll();
            Map<String, Set<String>> byNiche = new LinkedHashMap<>();
            for (var r : all) {
                byNiche.computeIfAbsent(r.getNiche().toLowerCase(), k -> new LinkedHashSet<>())
                        .addAll(words(r.getHashtag().replace("#", "").replace("_", " ")));
            }
            byNiche.values().forEach(s -> docs.add(new ArrayList<>(s)));
        } catch (Exception ignored) {}
        int n = docs.size() + 1;
        Map<String, Long> tf = tokens.stream().collect(Collectors.groupingBy(w -> w, Collectors.counting()));
        Map<String, Double> scored = new LinkedHashMap<>();
        for (var e : tf.entrySet()) {
            String term = e.getKey();
            double tfv = (double) e.getValue() / tokens.size();
            long df = docs.stream().filter(d -> d.contains(term)).count();
            double idf = Math.log((double) (n + 1) / (df + 1)) + 1.0;
            scored.put(term, tfv * idf);
        }
        List<Map<String, Object>> top = scored.entrySet().stream()
                .sorted((a, b) -> Double.compare(b.getValue(), a.getValue())).limit(6)
                .map(e -> Map.<String, Object>of("term", e.getKey(),
                        "score", Math.round(e.getValue() * 1000.0) / 1000.0)).toList();
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("method", "TF-IDF(t,d) = TF x log(N/df), N=" + n + " niche documents");
        m.put("keywords", top);
        m.put("line", top.isEmpty() ? "No distinctive keywords found"
                : "Top keywords: " + top.stream().map(k -> String.valueOf(k.get("term"))).collect(Collectors.joining(", ")));
        return m;
    }

    private void persist(User user, String caption, String title, List<String> tags, int overall,
                         Map<String, Object> tone, Map<String, Object> read,
                         Map<String, Object> tagR, Map<String, Object> titleR, String niche,
                         Map<String, Object> keywords) {
        try {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("tone", tone); details.put("readability", read);
            details.put("hashtags", tagR); details.put("title", titleR);
            details.put("keywords", keywords); details.put("niche", niche);
            String summary = !title.isEmpty() ? title.substring(0, Math.min(80, title.length()))
                    : !caption.isEmpty() ? caption.substring(0, Math.min(80, caption.length()))
                    : String.join(" ", tags.stream().limit(4).toList());
            analysisRepo.save(AnalysisRecord.builder().user(user)
                    .type(AnalysisRecord.TYPE_COMBINED).inputSummary(summary)
                    .score(overall).details(objectMapper.writeValueAsString(details)).build());
        } catch (Exception ignored) {}
    }
}
