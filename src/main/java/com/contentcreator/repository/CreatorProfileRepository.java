package com.contentcreator.repository;

import com.contentcreator.entity.CreatorProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CreatorProfileRepository extends JpaRepository<CreatorProfile, Long> {
    Optional<CreatorProfile> findByUserId(Long userId);
}
