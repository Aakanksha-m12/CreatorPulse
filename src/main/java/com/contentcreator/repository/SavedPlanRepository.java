package com.contentcreator.repository;

import com.contentcreator.entity.SavedPlan;
import com.contentcreator.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SavedPlanRepository extends JpaRepository<SavedPlan, Long> {
    List<SavedPlan> findByUserOrderByPlannedForAscCreatedAtDesc(User user);
}
