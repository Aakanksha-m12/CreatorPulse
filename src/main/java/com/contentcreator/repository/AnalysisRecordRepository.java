package com.contentcreator.repository;

import com.contentcreator.entity.AnalysisRecord;
import com.contentcreator.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;

public interface AnalysisRecordRepository extends JpaRepository<AnalysisRecord, Long> {
    List<AnalysisRecord> findByUserOrderByCreatedAtDesc(User user);
    List<AnalysisRecord> findTop20ByUserOrderByCreatedAtDesc(User user);
    long countByUserAndTypeAndCreatedAtAfter(User user, String type, LocalDateTime after);
    long countByUserAndCreatedAtAfter(User user, LocalDateTime after);

    @Query("SELECT a FROM AnalysisRecord a WHERE a.user.id = :userId ORDER BY a.createdAt DESC")
    List<AnalysisRecord> findRecentByUserId(@Param("userId") Long userId);
}
