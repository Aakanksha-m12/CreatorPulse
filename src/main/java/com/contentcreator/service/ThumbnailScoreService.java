package com.contentcreator.service;

import com.contentcreator.config.ModuleProperties;
import com.contentcreator.entity.AnalysisRecord;
import com.contentcreator.entity.User;
import com.contentcreator.config.PremiumRequiredException;
import com.contentcreator.repository.AnalysisRecordRepository;
import com.contentcreator.repository.CreatorProfileRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.nio.file.*;
import java.time.LocalDateTime;
import java.util.*;

/**
 * Module 3 — Thumbnail Intelligence orchestrated through Spring Boot.
 * Primary: OpenCV microservice (face detection, histogram, text overlay,
 * composition, colour) via ModuleOrchestrator-style call.
 * Fallback: pure-Java heuristics so the demo never breaks.
 */
@Service
@RequiredArgsConstructor
public class ThumbnailScoreService {

    private final AnalysisRecordRepository analysisRepo;
    private final SubscriptionService subscriptionService;
    private final ObjectMapper objectMapper;
    private final RestClient.Builder restClientBuilder;
    private final ModuleProperties moduleProperties;
    private final CreatorProfileRepository profileRepository;

    @Value("${app.upload.dir:./uploads}")
    private String uploadDir;

    @Value("${app.billing.free-thumbnail-per-week:3}")
    private int freePerWeek;

    private static final Set<String> ALLOWED = Set.of("image/jpeg", "image/png", "image/webp");

    public Map<String, Object> scoreMany(User user, java.util.List<MultipartFile> files) {
        if (files == null || files.isEmpty()) throw new RuntimeException("Upload 1–5 thumbnail images");
        if (files.size() > 5) throw new RuntimeException("Maximum 5 images per request");
        enforceFreeLimit(user);
        java.util.List<Map<String, Object>> items = new ArrayList<>();
        for (MultipartFile f : files) items.add(scoreOne(user, f));
        // Rank best-first so the UI can show "Thumbnail B — 82/100" + BEST PICK.
        items.sort((a, b) -> Integer.compare(num(b, "overallScore"), num(a, "overallScore")));
        for (int i = 0; i < items.size(); i++) {
            items.get(i).put("rank", i + 1);
            items.get(i).put("bestPick", i == 0);
        }
        java.util.List<Map<String, Object>> ranking = new ArrayList<>();
        for (Map<String, Object> r : items) {
            ranking.add(Map.of("fileName", r.get("fileName"), "score", r.get("overallScore"),
                    "grade", r.get("grade"), "rank", r.get("rank")));
        }
        Map<String, Object> out = new LinkedHashMap<>();
        out.put("count", items.size());
        out.put("results", items);
        out.put("ranking", ranking);
        out.put("bestPick", items.isEmpty() ? null : items.get(0));
        out.put("premium", subscriptionService.isPremium(user.getId()));
        return out;
    }

    public java.util.List<Map<String, Object>> history(User user) {
        java.util.List<Map<String, Object>> out = new ArrayList<>();
        for (AnalysisRecord a : analysisRepo.findTop20ByUserOrderByCreatedAtDesc(user)) {
            if (!AnalysisRecord.TYPE_THUMBNAIL.equals(a.getType())) continue;
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", a.getId());
            m.put("summary", a.getInputSummary());
            m.put("score", a.getScore());
            m.put("createdAt", String.valueOf(a.getCreatedAt()));
            try { m.put("details", objectMapper.readValue(a.getDetails(), Object.class)); }
            catch (Exception ignored) { m.put("details", a.getDetails()); }
            out.add(m);
            if (out.size() >= 10) break;
        }
        return out;
    }

    // ---- core: OpenCV primary, Java fallback ----
    private Map<String, Object> scoreOne(User user, MultipartFile file) {
        validateFile(file);
        Map<String, Object> openCv = tryOpenCv(user, file);
        if (openCv != null) return openCv;
        return scoreJava(user, file);
    }

    /** Calls the OpenCV thumbnail-scorer microservice; null when unavailable. */
    private Map<String, Object> tryOpenCv(User user, MultipartFile file) {
        try {
            ModuleProperties.Module mod = moduleProperties.getModules().stream()
                    .filter(m -> "thumbnail-scorer".equalsIgnoreCase(m.getName()))
                    .findFirst().orElse(null);
            if (mod == null) return null;
            byte[] bytes = file.getBytes();
            MultiValueMap<String, Object> parts = new LinkedMultiValueMap<>();
            ByteArrayResource filePart = new ByteArrayResource(bytes) {
                @Override public String getFilename() { return file.getOriginalFilename(); }
            };
            parts.add("file", filePart);
            parts.add("metadata", new ByteArrayResource(
                    buildMetadata(user, file).getBytes(java.nio.charset.StandardCharsets.UTF_8)));
            String body = restClientBuilder.build().post()
                    .uri(mod.getBaseUrl() + mod.getPath()).body(parts)
                    .retrieve().body(String.class);
            JsonNode root = objectMapper.readTree(body);
            int overall = root.path("overall_score").asInt(-1);
            if (overall < 0) return null;
            String grade = root.path("grade").asText("C");
            Map<String, Object> breakdown = new LinkedHashMap<>();
            JsonNode bd = root.path("breakdown");
            bd.fields().forEachRemaining(e -> {
                JsonNode v = e.getValue();
                breakdown.put(e.getKey(), Map.of(
                        "score", v.path("score").asInt(0),
                        "weight", v.path("weight_pct").asInt(v.path("weight").asInt(0)),
                        "detail", v.path("detail").asText("")));
            });
            java.util.List<String> suggestions = new ArrayList<>();
            root.path("top_suggestions").forEach(s -> suggestions.add(s.asText()));
            // Annotated overlay still generated locally for the viva visual.
            String annotated = null;
            try {
                BufferedImage img = ImageIO.read(new java.io.ByteArrayInputStream(bytes));
                if (img != null) annotated = saveAnnotated(user, img, 0.33, 0.33, grade);
            } catch (Exception ignored) {}
            persist(user, sanitize(file.getOriginalFilename()), overall, breakdown, suggestions, grade,
                    root.path("image_info").path("width").asInt(0), root.path("image_info").path("height").asInt(0),
                    annotated, root.path("verdict").asText(""), openCvFixes(breakdown));
            Map<String, Object> out = new LinkedHashMap<>();
            out.put("fileName", sanitize(file.getOriginalFilename()));
            out.put("fixes", openCvFixes(breakdown));
            out.put("overallScore", overall);
            out.put("grade", grade);
            out.put("verdict", root.path("verdict").asText(""));
            out.put("breakdown", breakdown);
            out.put("suggestions", suggestions.stream().limit(5).toList());
            out.put("annotatedUrl", annotated);
            out.put("source", "opencv");
            JsonNode ii = root.path("image_info");
            out.put("imageInfo", Map.of("width", ii.path("width").asInt(0), "height", ii.path("height").asInt(0)));
            return out;
        } catch (Exception ex) {
            return null;
        }
    }

    private Map<String, Object> scoreJava(User user, MultipartFile file) {
        validateFile(file);
        try {
            BufferedImage img = ImageIO.read(file.getInputStream());
            if (img == null) throw new RuntimeException("Cannot read image — use PNG/JPG/WebP");
            int w = img.getWidth(), h = img.getHeight();

            BufferedImage small = downscale(img, 160);
            int[] px = small.getRGB(0, 0, small.getWidth(), small.getHeight(), null, 0, small.getWidth());

            double[] bc = brightnessContrast(px);
            double[] cv = colorVibrancy(px);
            double[] comp = composition(small); // {fx, fy, score, regions}
            double sharp = sharpness(small);
            int sRes = clamp((int) Math.round(resolutionScoreValue(w, h)));
            String resDetail = resolutionDetail(w, h);

            int sBright = clamp((int) Math.round(bc[2]));
            int sColor = clamp((int) Math.round(cv[2]));
            int sComp = clamp((int) Math.round(comp[2]));
            int sSharp = clamp((int) Math.round(sharp));

            // weights: brightness 25, color 20, composition 20, sharpness 20, resolution 15
            int overall = clamp((int) Math.round(
                    sBright * 0.25 + sColor * 0.20 + sComp * 0.20 + sSharp * 0.20 + sRes * 0.15));

            String grade = overall >= 80 ? "A" : overall >= 65 ? "B" : overall >= 50 ? "C" : overall >= 35 ? "D" : "F";
            java.util.List<String> suggestions = suggestions(sBright, sColor, sComp, sSharp, sRes, bc, cv, w, h);

            String annotatedUrl = saveAnnotated(user, img, comp[0], comp[1], grade);

            String compDetail = String.format("Focal point (%.0f%%, %.0f%%), %.0f/9 active regions",
                    comp[0] * 100, comp[1] * 100, comp[3]);
            Map<String, Object> breakdown = new LinkedHashMap<>();
            breakdown.put("brightnessContrast", Map.of("score", sBright, "weight", 25,
                    "detail", String.format("Brightness %.0f/255, contrast %.0f", bc[0], bc[1])));
            breakdown.put("colorVibrancy", Map.of("score", sColor, "weight", 20,
                    "detail", String.format("Saturation avg %.0f, spread %.0f", cv[0], cv[1])));
            breakdown.put("composition", Map.of("score", sComp, "weight", 20, "detail", compDetail));
            breakdown.put("sharpness", Map.of("score", sSharp, "weight", 20,
                    "detail", sSharp >= 70 ? "Crisp edges — reads well at small sizes" : "Soft/blurry — small-size readability will suffer"));
            breakdown.put("resolution", Map.of("score", sRes, "weight", 15, "detail", resDetail));

            String fileName = sanitize(file.getOriginalFilename());
            java.util.List<Map<String, Object>> fixes = buildFixes(sBright, sColor, sComp, sSharp, sRes, bc, cv, comp, w, h);
            persist(user, fileName, overall, breakdown, suggestions, grade, w, h, annotatedUrl, verdict(grade), fixes);

            Map<String, Object> out = new LinkedHashMap<>();
            out.put("fileName", fileName);
            out.put("fixes", fixes);
            out.put("overallScore", overall);
            out.put("grade", grade);
            out.put("verdict", verdict(grade));
            out.put("breakdown", breakdown);
            out.put("suggestions", suggestions.stream().limit(5).toList());
            out.put("annotatedUrl", annotatedUrl);
            out.put("source", "java-fallback");
            out.put("imageInfo", Map.of("width", w, "height", h));
            return out;
        } catch (RuntimeException re) { throw re; }
        catch (Exception ex) { throw new RuntimeException("Scoring failed: " + ex.getMessage()); }
    }

    private int num(Map<String, Object> m, String k) {
        Object v = m.get(k);
        return v instanceof Number n ? n.intValue() : 0;
    }

    /**
     * Prescriptive fix list for a new creator: what to DO, in impact order,
     * with the points each fix is worth. Plain instructions, no jargon.
     */
    private java.util.List<Map<String, Object>> buildFixes(int sBright, int sColor, int sComp,
                                                           int sSharp, int sRes,
                                                           double[] bc, double[] cv, double[] comp,
                                                           int w, int h) {
        java.util.List<Map<String, Object>> fixes = new java.util.ArrayList<>();
        java.util.List<Map<String, Object>> polish = new java.util.ArrayList<>();
        String brightHow = bc[0] < 80 ? "Brighten the whole thumbnail (raise exposure) so it pops on phones"
                : bc[0] > 185 ? "Darken the background or add shadows so the subject stands out"
                : "Add a dark outline behind the subject or split the background light/dark";
        split(fixes, polish, sBright < 75, fix(brightHow, impact(sBright, 25), "More contrast means more taps at small sizes."),
                "Push the contrast one notch higher — test it against this version.");
        split(fixes, polish, sComp < 75, fix("Move your face or main object onto one of the white grid lines in the preview above",
                impact(sComp, 20), "Eyes go to those intersections first."),
                "Nudge the subject exactly onto a grid crossing for the last few points.");
        split(fixes, polish, sColor < 75, fix("Add ONE bright accent color (red, yellow or orange) on the text or an arrow",
                impact(sColor, 20), "One loud color beats five dull ones."),
                "Try a warmer accent color on one element and compare clicks.");
        split(fixes, polish, sSharp < 75, fix("Export sharper: less blur, no tiny text, keep words to 3 or fewer",
                impact(sSharp, 20), "Blurry thumbnails get skipped without a second look."),
                "Sharpen once more on export — crisp edges win at small sizes.");
        split(fixes, polish, sRes < 75, fix("Re-export at 1280x720 (16:9) so nothing looks pixelated",
                impact(sRes, 15), "YouTube shows your thumbnail big on TVs."),
                "Re-export at full 1280x720 so it stays crisp everywhere.");
        return topUp(fixes, polish);
    }

    /** Real fix goes to fixes; otherwise a gentler polish tip for the same area. */
    private void split(java.util.List<Map<String, Object>> fixes, java.util.List<Map<String, Object>> polish,
                       boolean needsFix, Map<String, Object> fixItem, String polishHow) {
        if (needsFix) { fixes.add(fixItem); return; }
        Map<String, Object> p = new LinkedHashMap<>();
        p.put("how", polishHow);
        p.put("impact", 2);
        p.put("why", "This area already scores well — this squeezes the last clicks out of it.");
        p.put("polish", true);
        polish.add(p);
    }

    /** Always return exactly 3 actions: biggest fixes first, then polish tips. */
    private java.util.List<Map<String, Object>> topUp(java.util.List<Map<String, Object>> fixes,
                                                      java.util.List<Map<String, Object>> polish) {
        fixes.sort((a, b) -> Integer.compare((int) b.get("impact"), (int) a.get("impact")));
        java.util.List<Map<String, Object>> out = new java.util.ArrayList<>(fixes);
        for (Map<String, Object> p : polish) {
            if (out.size() >= 3) break;
            out.add(p);
        }
        if (out.isEmpty()) {
            out.add(fix("Make a second version with different text and test both",
                    2, "Creators who A/B test grow CTR twice as fast."));
        }
        for (int i = 0; i < out.size() && i < 3; i++) out.get(i).put("step", i + 1);
        return out.stream().limit(3).toList();
    }

    private Map<String, Object> fix(String how, int impact, String why) {
        Map<String, Object> m = new LinkedHashMap<>();
        m.put("how", how);
        m.put("impact", impact);
        m.put("why", why);
        return m;
    }

    private int impact(int score, int weight) {
        return Math.max(2, (int) Math.round((90 - Math.min(90, score)) * weight / 100.0));
    }

    /** Prescriptive fixes from OpenCV breakdown scores (key -> fix + polish). */
    @SuppressWarnings("unchecked")
    private java.util.List<Map<String, Object>> openCvFixes(Map<String, Object> breakdown) {
        Map<String, String[]> how = Map.of(
                "face_detection", new String[]{"Make the face bigger and closer to the camera, with a strong expression", "Faces get the first look on every feed.", "Try an even tighter crop on the face and compare."},
                "brightness_contrast", new String[]{"Brighten the thumbnail and darken the background behind the subject", "Contrast is what makes people stop scrolling.", "Push contrast one notch higher and compare."},
                "text_overlay", new String[]{"Keep only 3 big words; delete the rest", "Small crowded text cannot be read on phones.", "Test a 2-word version against this one."},
                "composition", new String[]{"Move your subject onto one of the grid lines in the preview above", "Eyes go to those intersections first.", "Nudge the subject exactly onto a crossing."},
                "color_vibrancy", new String[]{"Add one bright accent color (red, yellow or orange)", "One loud color beats five dull ones.", "Try a warmer accent on one element."});
        java.util.List<Map<String, Object>> fixes = new java.util.ArrayList<>();
        java.util.List<Map<String, Object>> polish = new java.util.ArrayList<>();
        breakdown.forEach((key, val) -> {
            if (!(val instanceof Map<?, ?> v) || !how.containsKey(key)) return;
            int score = v.get("score") instanceof Number n ? n.intValue() : 0;
            int weight = v.get("weight") instanceof Number w ? w.intValue() : 15;
            if (score < 75) fixes.add(fix(how.get(key)[0], impact(score, weight), how.get(key)[1]));
            else {
                Map<String, Object> p = fix(how.get(key)[2], 2, "Already strong here — this squeezes the last clicks.");
                p.put("polish", true);
                polish.add(p);
            }
        });
        return topUp(fixes, polish);
    }

    /** Creator context sent to the OpenCV service (M2 feeds M3). */
    private String buildMetadata(User user, MultipartFile file) {
        try {
            Map<String, Object> meta = new LinkedHashMap<>();
            meta.put("fileName", file.getOriginalFilename());
            profileRepository.findByUserId(user.getId()).ifPresent(p -> {
                Map<String, Object> profile = new LinkedHashMap<>();
                profile.put("niche", p.getNiche());
                profile.put("platformFocus", p.getPlatformFocus());
                profile.put("goals", p.getGoals());
                meta.put("profile", profile);
            });
            return objectMapper.writeValueAsString(meta);
        } catch (Exception ex) {
            return "{\"fileName\":\"" + file.getOriginalFilename() + "\"}";
        }
    }

    private void validateFile(MultipartFile f) {
        if (f == null || f.isEmpty()) throw new RuntimeException("Empty file — attach a PNG/JPG/WebP image");
        String ct = f.getContentType();
        String name = f.getOriginalFilename() == null ? "" : f.getOriginalFilename().toLowerCase();
        boolean byType = ct != null && ALLOWED.contains(ct);
        boolean byExt = name.endsWith(".png") || name.endsWith(".jpg") || name.endsWith(".jpeg") || name.endsWith(".webp");
        if (!byType && !byExt) throw new RuntimeException("Only PNG, JPG or WebP thumbnails are allowed");
        if (f.getSize() > 10 * 1024 * 1024) throw new RuntimeException("Each thumbnail must be under 10MB");
        // Magic-byte check: JPEG FF D8 FF, PNG 89 50 4E 47, WebP RIFF....WEBP
        try (var in = f.getInputStream()) {
            byte[] magic = in.readNBytes(12);
            boolean jpeg = magic.length >= 3 && (magic[0] & 0xFF) == 0xFF && (magic[1] & 0xFF) == 0xD8 && (magic[2] & 0xFF) == 0xFF;
            boolean png = magic.length >= 4 && (magic[0] & 0xFF) == 0x89 && magic[1] == 0x50 && magic[2] == 0x4E && magic[3] == 0x47;
            boolean webp = magic.length >= 12 && magic[0] == 'R' && magic[1] == 'I' && magic[2] == 'F' && magic[3] == 'F'
                    && magic[8] == 'W' && magic[9] == 'E' && magic[10] == 'B' && magic[11] == 'P';
            if (!jpeg && !png && !webp) throw new RuntimeException("File content does not match PNG/JPG/WebP — upload a real image");
        } catch (RuntimeException re) { throw re; }
        catch (Exception ex) { throw new RuntimeException("Could not validate image content"); }
    }

    private void enforceFreeLimit(User user) {
        if (subscriptionService.isPremium(user.getId())) return;
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        long used = analysisRepo.countByUserAndTypeAndCreatedAtAfter(user, AnalysisRecord.TYPE_THUMBNAIL, weekAgo);
        if (used >= freePerWeek) {
            throw new PremiumRequiredException("Free plan allows " + freePerWeek + " thumbnail scores per week — upgrade to Pro for unlimited scoring");
        }
    }

    // ---- heuristics ----
    private double[] brightnessContrast(int[] px) {
        double sum = 0; for (int p : px) sum += (0.299 * ((p >> 16) & 255) + 0.587 * ((p >> 8) & 255) + 0.114 * (p & 255));
        double mean = sum / px.length;
        double var = 0; for (int p : px) { double g = 0.299 * ((p >> 16) & 255) + 0.587 * ((p >> 8) & 255) + 0.114 * (p & 255); var += (g - mean) * (g - mean); }
        double std = Math.sqrt(var / px.length);
        double sMean = mean < 60 ? 30 + mean * 0.5 : mean <= 170 ? 60 + (mean - 60) * (30.0 / 110) : Math.max(35, 90 - (mean - 170) * 0.4);
        double sStd = std < 25 ? 30 + std : std <= 75 ? 55 + (std - 25) * 0.7 : Math.max(45, 90 - (std - 75) * 0.5);
        return new double[]{mean, std, (sMean + sStd) / 2};
    }

    private double[] colorVibrancy(int[] px) {
        double sSum = 0, sSq = 0;
        for (int p : px) {
            float[] hsb = Color.RGBtoHSB((p >> 16) & 255, (p >> 8) & 255, p & 255, null);
            double s = hsb[1] * 100; sSum += s; sSq += s * s;
        }
        double mean = sSum / px.length;
        double std = Math.sqrt(Math.max(0, sSq / px.length - mean * mean));
        double sMean = mean < 15 ? 30 + mean : mean <= 60 ? 45 + (mean - 15) : Math.max(55, 90 - (mean - 60) * 0.8);
        double sStd = Math.min(95, 40 + std * 2.2);
        return new double[]{mean, std, (sMean + sStd) / 2};
    }

    /** Returns {fx, fy, score, regions} — focal mass vs rule-of-thirds intersections. */
    private double[] composition(BufferedImage small) {
        int w = small.getWidth(), h = small.getHeight();
        double m00 = 0, m10 = 0, m01 = 0;
        int[] active = new int[9];
        for (int y = 0; y < h; y++) for (int x = 0; x < w; x++) {
            int p = small.getRGB(x, y);
            int r = (p >> 16) & 255, g = (p >> 8) & 255, b = p & 255;
            float[] hsb = Color.RGBtoHSB(r, g, b, null);
            double mass = hsb[1] * 0.7 + (Math.abs(r - g) + Math.abs(g - b)) / 512.0 * 0.3;
            m00 += mass; m10 += mass * x; m01 += mass * y;
            int cx = Math.min(2, x * 3 / w), cy = Math.min(2, y * 3 / h);
            if (mass > 0.25) active[cy * 3 + cx]++;
        }
        double fx = m00 == 0 ? 0.5 : m10 / m00 / w;
        double fy = m00 == 0 ? 0.5 : m01 / m00 / h;
        double best = 1;
        for (double tx : new double[]{1/3.0, 2/3.0}) for (double ty : new double[]{1/3.0, 2/3.0}) {
            best = Math.min(best, Math.hypot(fx - tx, fy - ty));
        }
        long regions = Arrays.stream(active).filter(c -> c > (w * h / 9) * 0.08).count();
        double sFocal = best < 0.12 ? 90 : best < 0.2 ? 75 : best < 0.3 ? 60 : 45;
        double sSpread = regions >= 5 ? 85 : regions >= 3 ? 70 : 50;
        return new double[]{fx, fy, (sFocal + sSpread) / 2, regions};
    }

    private double sharpness(BufferedImage small) {
        int w = small.getWidth(), h = small.getHeight();
        double sum = 0; int n = 0;
        for (int y = 1; y < h - 1; y += 2) for (int x = 1; x < w - 1; x += 2) {
            int c = gray(small.getRGB(x, y));
            int lap = Math.abs(4 * c - gray(small.getRGB(x-1, y)) - gray(small.getRGB(x+1, y))
                    - gray(small.getRGB(x, y-1)) - gray(small.getRGB(x, y+1)));
            sum += lap; n++;
        }
        double avg = n == 0 ? 0 : sum / n;
        return Math.min(95, 30 + avg * 1.6);
    }

    private int gray(int p) { return (int) (0.299 * ((p >> 16) & 255) + 0.587 * ((p >> 8) & 255) + 0.114 * (p & 255)); }

    private double resolutionScoreValue(int w, int h) {
        long px = (long) w * h;
        double s = px >= 1920 * 1080 ? 95 : px >= 1280 * 720 ? 85 : px >= 640 * 360 ? 65 : 45;
        double aspect = (double) w / Math.max(1, h);
        if (Math.abs(aspect - 16 / 9.0) < 0.15) s = Math.min(100, s + 5);
        return s;
    }

    private String resolutionDetail(int w, int h) {
        double aspect = (double) w / Math.max(1, h);
        return w + "×" + h + (Math.abs(aspect - 16 / 9.0) < 0.15 ? " — ideal 16:9" : " — consider 16:9 (1280×720)");
    }

    // ---- presentation ----
    private java.util.List<String> suggestions(int b, int c, int comp, int sh, int res, double[] bc, double[] cv, int w, int h) {
        java.util.List<String> s = new ArrayList<>();
        if (bc[0] < 80) s.add("Too dark — lift brightness so it reads on mobile");
        if (bc[0] > 185) s.add("Washed out — deepen shadows for punch");
        if (bc[1] < 35) s.add("Flat contrast — add a dark outline or bolder background split");
        if (cv[0] < 22) s.add("Colours look muted — add one saturated accent (red/yellow)");
        if (comp < 60) s.add("Move the subject onto a rule-of-thirds intersection (see overlay)");
        if (sh < 60) s.add("Looks soft — export sharper, avoid heavy blur behind text");
        if ((long) w * h < 1280 * 720) s.add("Low resolution — export at least 1280×720");
        if (b >= 75 && c >= 70 && comp >= 70) s.add("Strong fundamentals — test a curiosity-gap text variant next");
        if (s.isEmpty()) s.add("Solid thumbnail — A/B test two text sizes to squeeze more CTR");
        return s;
    }

    private String verdict(String grade) {
        return switch (grade) {
            case "A" -> "Excellent — publish-ready";
            case "B" -> "Good — one tweak away from great";
            case "C" -> "Average — fix contrast or focal point";
            case "D" -> "Below average — rework colours and layout";
            default -> "Weak — redesign with a clear focal subject";
        };
    }

    private BufferedImage downscale(BufferedImage src, int maxW) {
        if (src.getWidth() <= maxW) return src;
        double r = (double) maxW / src.getWidth();
        BufferedImage d = new BufferedImage(maxW, (int) (src.getHeight() * r), BufferedImage.TYPE_INT_RGB);
        Graphics2D g = d.createGraphics();
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.drawImage(src, 0, 0, maxW, (int) (src.getHeight() * r), null);
        g.dispose();
        return d;
    }

    private String saveAnnotated(User user, BufferedImage img, double fx, double fy, String grade) {
        try {
            int w = Math.min(img.getWidth(), 1280);
            double r = (double) w / img.getWidth();
            int h = (int) (img.getHeight() * r);
            BufferedImage out = new BufferedImage(w, h, BufferedImage.TYPE_INT_RGB);
            Graphics2D g = out.createGraphics();
            g.drawImage(img, 0, 0, w, h, null);
            g.setColor(new Color(255, 255, 255, 140));
            g.setStroke(new BasicStroke(2f, BasicStroke.CAP_BUTT, BasicStroke.JOIN_BEVEL, 0, new float[]{10f}, 0));
            for (int i = 1; i < 3; i++) {
                g.drawLine(w * i / 3, 0, w * i / 3, h);
                g.drawLine(0, h * i / 3, w, h * i / 3);
            }
            Color dot = "A".equals(grade) || "B".equals(grade) ? new Color(74, 222, 128) : new Color(251, 191, 36);
            g.setColor(dot);
            g.fillOval((int) (w * fx - 10), (int) (h * fy - 10), 20, 20);
            g.setColor(Color.WHITE);
            g.setFont(new Font("SansSerif", Font.BOLD, 22));
            g.drawString(grade, 14, 30);
            g.dispose();
            Path dir = Paths.get(uploadDir, "analysis", String.valueOf(user.getId())).toAbsolutePath().normalize();
            Files.createDirectories(dir);
            String name = "annotated-" + UUID.randomUUID() + ".jpg";
            ImageIO.write(out, "jpg", dir.resolve(name).toFile());
            return "/uploads/analysis/" + user.getId() + "/" + name;
        } catch (Exception ex) { return null; }
    }

    private void persist(User user, String fileName, int overall, Map<String, Object> breakdown,
                         java.util.List<String> suggestions, String grade, int w, int h,
                         String annotatedUrl, String verdict, java.util.List<Map<String, Object>> fixes) {
        try {
            Map<String, Object> details = new LinkedHashMap<>();
            details.put("grade", grade);
            details.put("verdict", verdict);
            details.put("annotatedUrl", annotatedUrl);
            details.put("breakdown", breakdown);
            details.put("suggestions", suggestions);
            details.put("fixes", fixes);
            details.put("dimensions", w + "x" + h);
            analysisRepo.save(AnalysisRecord.builder().user(user)
                    .type(AnalysisRecord.TYPE_THUMBNAIL).inputSummary(fileName)
                    .score(overall).details(objectMapper.writeValueAsString(details)).build());
        } catch (Exception ignored) {}
    }

    private int clamp(int v) { return Math.max(0, Math.min(100, v)); }
    private String sanitize(String n) {
        if (n == null || n.isBlank()) return "thumbnail.jpg";
        return Paths.get(n).getFileName().toString().replaceAll("[^a-zA-Z0-9._-]", "_");
    }
}
