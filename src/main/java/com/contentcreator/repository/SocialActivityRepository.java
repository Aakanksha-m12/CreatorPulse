package com.contentcreator.repository;

import com.contentcreator.entity.SocialActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface SocialActivityRepository extends JpaRepository<SocialActivity, Long> {
    Optional<SocialActivity> findByUserIdAndPlatformAndRecordedOn(Long userId, String platform, LocalDate recordedOn);
    Optional<SocialActivity> findFirstByUserIdAndPlatformOrderByRecordedOnDesc(Long userId, String platform);
    Optional<SocialActivity> findFirstByUserIdAndPlatformAndHandleOrderByRecordedOnDesc(Long userId, String platform, String handle);
    List<SocialActivity> findByUserIdAndPlatformAndRecordedOnBetweenOrderByRecordedOnAsc(
            Long userId, String platform, LocalDate from, LocalDate to);
    List<SocialActivity> findByUserIdAndPlatformAndHandleAndRecordedOnBetweenOrderByRecordedOnAsc(
            Long userId, String platform, String handle, LocalDate from, LocalDate to);
    Optional<SocialActivity> findByUserIdAndPlatformAndHandleAndRecordedOn(
            Long userId, String platform, String handle, LocalDate recordedOn);
    @Query("select distinct a.platform from SocialActivity a where a.userId = :userId")
    List<String> findDistinctPlatformByUserId(@Param("userId") Long userId);

    List<SocialActivity> findByUserIdOrderByRecordedOnDesc(Long userId);
    List<SocialActivity> findByUserIdOrderByRecordedOnAsc(Long userId);
    List<SocialActivity> findByUserIdAndManualDataTrueOrderByRecordedOnDesc(Long userId);
    void deleteByIdAndUserId(Long id, Long userId);

    @Modifying
    @Query("DELETE FROM SocialActivity a WHERE a.manualData = false AND a.realData = false")
    int deleteAllSimulated();
}
