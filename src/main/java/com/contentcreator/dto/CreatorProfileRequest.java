package com.contentcreator.dto;

import lombok.Data;

import java.util.List;

@Data
public class CreatorProfileRequest {

    private String niche;

    private String platformFocus;

    private List<String> niches;
    private String displayName;
    private String username;
    private String email;
    private String country;
    private String timezone;
    private String language;
    private String goals;
    private String contentStyle;
    private String instagramHandle;
    private String youtubeChannel;
    private String youtubeFormat;
    private String instagramFormat;
    private String audienceAge;
    private String audienceGender;
    private String audienceRegion;
    private String postFrequency;
    private String profilePhoto;
}
