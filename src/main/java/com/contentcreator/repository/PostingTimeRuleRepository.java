package com.contentcreator.repository;

import com.contentcreator.entity.PostingTimeRule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PostingTimeRuleRepository extends JpaRepository<PostingTimeRule, Long> {
    List<PostingTimeRule> findByPlatformIgnoreCaseAndNicheIgnoreCaseOrderByScoreBoostDesc(String platform, String niche);
    List<PostingTimeRule> findByPlatformIgnoreCaseOrderByScoreBoostDesc(String platform);
    List<PostingTimeRule> findAllByOrderByPlatformAscScoreBoostDesc();
}
