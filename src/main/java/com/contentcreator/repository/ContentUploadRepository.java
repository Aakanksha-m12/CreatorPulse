package com.contentcreator.repository;

import com.contentcreator.entity.ContentUpload;
import com.contentcreator.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ContentUploadRepository extends JpaRepository<ContentUpload, Long> {
    List<ContentUpload> findByUserOrderByCreatedAtDesc(User user);
}
