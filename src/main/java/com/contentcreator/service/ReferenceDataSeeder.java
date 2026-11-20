package com.contentcreator.service;

import com.contentcreator.entity.HashtagReference;
import com.contentcreator.entity.PostingTimeRule;
import com.contentcreator.repository.HashtagReferenceRepository;
import com.contentcreator.repository.PostingTimeRuleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import java.util.List;

@Component
@Order(1)
@RequiredArgsConstructor
public class ReferenceDataSeeder implements CommandLineRunner {

    private final HashtagReferenceRepository hashtagRepo;
    private final PostingTimeRuleRepository postingRepo;

    @Override
    public void run(String... args) {
        seedHashtags();
        seedPostingTimes();
    }

    private void seedHashtags() {
        if (hashtagRepo.count() > 0) return;
        // niche -> (hashtag, popularity 1-100, category)
        Object[][] rows = {
            {"Gaming", "#gamingcommunity", 95, "community"}, {"Gaming", "#gamerlife", 90, "community"},
            {"Gaming", "#videogames", 88, "reach"}, {"Gaming", "#esports", 82, "niche"},
            {"Gaming", "#gameplay", 85, "content"}, {"Gaming", "#gamingsetup", 74, "niche"},
            {"Gaming", "#mobilegaming", 70, "niche"}, {"Gaming", "#pcgaming", 72, "niche"},
            {"Tech", "#techcommunity", 90, "community"}, {"Tech", "#techtips", 86, "content"},
            {"Tech", "#gadgets", 80, "reach"}, {"Tech", "#ai", 88, "trending"},
            {"Tech", "#coding", 75, "niche"}, {"Tech", "#techreview", 72, "content"},
            {"Tech", "#startups", 68, "niche"}, {"Tech", "#futuretech", 65, "trending"},
            {"Food", "#foodie", 95, "community"}, {"Food", "#foodphotography", 85, "content"},
            {"Food", "#homecooking", 80, "niche"}, {"Food", "#recipeoftheday", 78, "content"},
            {"Food", "#streetfood", 82, "reach"}, {"Food", "#veganrecipes", 70, "niche"},
            {"Food", "#dessertlover", 66, "niche"}, {"Food", "#foodreels", 84, "trending"},
            {"Fitness", "#fitnessjourney", 90, "community"}, {"Fitness", "#workoutmotivation", 88, "content"},
            {"Fitness", "#gymlife", 85, "community"}, {"Fitness", "#healthylifestyle", 80, "reach"},
            {"Fitness", "#personaltrainer", 68, "niche"}, {"Fitness", "#yogaeveryday", 72, "niche"},
            {"Fitness", "#fatloss", 75, "trending"}, {"Fitness", "#protein", 62, "niche"},
            {"Travel", "#travelgram", 92, "community"}, {"Travel", "#wanderlust", 90, "reach"},
            {"Travel", "#travelreels", 84, "trending"}, {"Travel", "#hiddenplaces", 74, "niche"},
            {"Travel", "#solotravel", 76, "niche"}, {"Travel", "#travelguide", 78, "content"},
            {"Travel", "#budgettravel", 68, "niche"}, {"Travel", "#travelphotography", 82, "content"},
            {"Fashion", "#fashionstyle", 90, "community"}, {"Fashion", "#ootd", 92, "trending"},
            {"Fashion", "#styleinspo", 82, "content"}, {"Fashion", "#streetstyle", 78, "niche"},
            {"Fashion", "#sustainablefashion", 70, "niche"}, {"Fashion", "#fashionreels", 80, "trending"},
            {"Fashion", "#lookbook", 66, "content"}, {"Fashion", "#thriftfinds", 64, "niche"},
            {"Education", "#studytips", 85, "content"}, {"Education", "#learnonline", 80, "reach"},
            {"Education", "#studymotivation", 82, "community"}, {"Education", "#examprep", 75, "niche"},
            {"Education", "#productivitytips", 78, "content"}, {"Education", "#onlinecourses", 68, "niche"},
            {"Education", "#careergrowth", 72, "trending"}, {"Education", "#languagelearning", 65, "niche"},
            {"Entertainment", "#entertainment", 88, "reach"}, {"Entertainment", "#behindthescenes", 80, "content"},
            {"Entertainment", "#viralvideo", 90, "trending"}, {"Entertainment", "#comedyreels", 86, "trending"},
            {"Entertainment", "#memesdaily", 82, "community"}, {"Entertainment", "#shortfilm", 70, "niche"},
            {"Entertainment", "#reactionvideo", 72, "content"}, {"Entertainment", "#trendingnow", 88, "trending"},
            {"Finance", "#personalfinance", 84, "content"}, {"Finance", "#investingtips", 82, "content"},
            {"Finance", "#moneymindset", 78, "community"}, {"Finance", "#stockmarket", 75, "niche"},
            {"Finance", "#passiveincome", 80, "trending"}, {"Finance", "#budgetingtips", 70, "content"},
            {"Finance", "#cryptonews", 66, "trending"}, {"Finance", "#financialfreedom", 76, "community"},
            {"Lifestyle", "#lifestyleblogger", 84, "community"}, {"Lifestyle", "#dailylife", 80, "reach"},
            {"Lifestyle", "#morningroutine", 78, "content"}, {"Lifestyle", "#selfcare", 82, "trending"},
            {"Lifestyle", "#homeaesthetic", 72, "niche"}, {"Lifestyle", "#minimalism", 68, "niche"},
            {"Lifestyle", "#weekendvibes", 75, "trending"}, {"Lifestyle", "#lifemotivation", 70, "community"},
        };
        for (Object[] r : rows) {
            hashtagRepo.save(HashtagReference.builder()
                    .niche((String) r[0]).hashtag((String) r[1])
                    .popularity((Integer) r[2]).category((String) r[3]).build());
        }
    }

    private void seedPostingTimes() {
        if (postingRepo.count() > 0) return;
        // platform, niche, dayType, startH, endH, label, reasoning, boost
        Object[][] rows = {
            {"YouTube", "General", "WEEKDAY", 19, 21, "7–9 PM", "Weekday evenings catch viewers after work and dinner — the largest concurrent YouTube audience in India.", 28},
            {"YouTube", "General", "WEEKEND", 10, 12, "10 AM–12 PM", "Weekend late mornings win on YouTube as viewers browse with free time and high watch intent.", 24},
            {"YouTube", "Gaming", "WEEKDAY", 20, 22, "8–10 PM", "Gamers peak after dinner; streams and uploads posted here get longer session times.", 30},
            {"YouTube", "Gaming", "WEEKEND", 15, 17, "3–5 PM", "Weekend afternoons are prime gaming hours — competition for attention is lower than evenings.", 26},
            {"YouTube", "Education", "WEEKDAY", 18, 20, "6–8 PM", "Students revise after school hours; study content posted here sees the best completion rate.", 27},
            {"YouTube", "Education", "WEEKEND", 9, 11, "9–11 AM", "Morning study sessions on weekends drive strong search traffic for tutorials.", 25},
            {"YouTube", "Food", "WEEKDAY", 12, 14, "12–2 PM", "Lunch breaks trigger recipe searches; food videos posted midday get shared into dinner planning.", 24},
            {"YouTube", "Food", "WEEKEND", 17, 19, "5–7 PM", "Pre-dinner browsing is peak for cooking inspiration on weekends.", 26},
            {"YouTube", "Fitness", "WEEKDAY", 6, 8, "6–8 AM", "Morning workout routines are searched before gym sessions — early posts rank all day.", 25},
            {"YouTube", "Fitness", "WEEKEND", 8, 10, "8–10 AM", "Weekend morning fitness intent is high; transformation content performs best here.", 23},
            {"YouTube", "Tech", "WEEKDAY", 20, 22, "8–10 PM", "Tech buyers research after work; reviews posted in this window earn more comments.", 26},
            {"YouTube", "Tech", "WEEKEND", 11, 13, "11 AM–1 PM", "Weekend gadget browsing peaks midday when purchase intent is highest.", 24},
            {"YouTube", "Travel", "WEEKDAY", 21, 23, "9–11 PM", "Dream-and-plan browsing happens late evening; cinematic travel content thrives here.", 25},
            {"YouTube", "Travel", "WEEKEND", 9, 11, "9–11 AM", "Trip planning starts on weekend mornings — guides posted early get bookmarked.", 24},
            {"YouTube", "Finance", "WEEKDAY", 20, 22, "8–10 PM", "Finance explainers do best when viewers can focus — after dinner on weekdays.", 26},
            {"YouTube", "Finance", "WEEKEND", 10, 12, "10 AM–12 PM", "Weekend mornings bring deliberate money-planning sessions.", 23},
            {"Instagram", "General", "WEEKDAY", 12, 13, "12–1 PM", "Midday scroll break: Reels posted at lunch get fast early velocity from office crowds.", 24},
            {"Instagram", "General", "WEEKDAY", 19, 21, "7–9 PM", "Evening unwind is Instagram's biggest window — posting here can lift reach ~24%.", 26},
            {"Instagram", "General", "WEEKEND", 10, 12, "10 AM–12 PM", "Late-morning weekend browsing favours Reels with high share rates.", 22},
            {"Instagram", "Fashion", "WEEKDAY", 19, 21, "7–9 PM", "Outfit inspiration peaks in the evening when shoppers browse before buying.", 28},
            {"Instagram", "Fashion", "WEEKEND", 11, 13, "11 AM–1 PM", "Weekend brunch-time try-ons and hauls convert best in this slot.", 25},
            {"Instagram", "Food", "WEEKDAY", 12, 14, "12–2 PM", "Lunch-time food Reels get saved for dinner — saves boost ranking heavily.", 26},
            {"Instagram", "Food", "WEEKEND", 13, 15, "1–3 PM", "Afternoon recipe hunts dominate food discovery on weekends.", 24},
            {"Instagram", "Fitness", "WEEKDAY", 6, 8, "6–8 AM", "Pre-work motivation content is shared into gym group chats in this window.", 25},
            {"Instagram", "Fitness", "WEEKEND", 9, 11, "9–11 AM", "Weekend workout posts ride the morning routine wave.", 23},
            {"Instagram", "Travel", "WEEKDAY", 20, 22, "8–10 PM", "Escape-browsing after dinner drives the highest saves for travel Reels.", 26},
            {"Instagram", "Travel", "WEEKEND", 10, 12, "10 AM–12 PM", "Weekend trip planning starts late morning — carousels get bookmarked here.", 24},
            {"Instagram", "Education", "WEEKDAY", 17, 19, "5–7 PM", "After-class study Reel consumption peaks; tips posted here get shared.", 24},
            {"Instagram", "Education", "WEEKEND", 10, 12, "10 AM–12 PM", "Weekend learners batch-consume carousel explainers late morning.", 22},
            {"Instagram", "Entertainment", "WEEKDAY", 20, 23, "8–11 PM", "Prime meme/comedy hours — late-evening shares drive virality.", 28},
            {"Instagram", "Entertainment", "WEEKEND", 18, 21, "6–9 PM", "Weekend evening entertainment scrolling is the week's highest-traffic slot.", 27},
        };
        for (Object[] r : rows) {
            postingRepo.save(PostingTimeRule.builder()
                    .platform((String) r[0]).niche((String) r[1]).dayType((String) r[2])
                    .startHour((Integer) r[3]).endHour((Integer) r[4])
                    .displayLabel((String) r[5]).reasoning((String) r[6]).scoreBoost((Integer) r[7])
                    .build());
        }
    }
}
