package com.contentcreator.repository;

import com.contentcreator.entity.OtpCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface OtpCodeRepository extends JpaRepository<OtpCode, Long> {
    Optional<OtpCode> findFirstByEmailAndPurposeAndCodeOrderByIdDesc(String email, String purpose, String code);
    List<OtpCode> findByEmailAndPurposeAndUsedFalse(String email, String purpose);
}
