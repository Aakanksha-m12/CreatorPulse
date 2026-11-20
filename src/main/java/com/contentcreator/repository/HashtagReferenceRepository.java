package com.contentcreator.repository;

import com.contentcreator.entity.HashtagReference;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface HashtagReferenceRepository extends JpaRepository<HashtagReference, Long> {
    List<HashtagReference> findByNicheIgnoreCaseOrderByPopularityDesc(String niche);
    List<HashtagReference> findByNicheIgnoreCaseAndCategoryOrderByPopularityDesc(String niche, String category);
}
