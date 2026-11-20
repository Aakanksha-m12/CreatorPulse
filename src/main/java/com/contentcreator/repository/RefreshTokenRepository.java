package com.contentcreator.repository;

import com.contentcreator.entity.RefreshToken;
import com.contentcreator.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    List<RefreshToken> findByUserOrderByCreatedAtAsc(User user);
    void deleteByUser(User user);
}
