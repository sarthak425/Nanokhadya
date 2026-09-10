package com.nanokhadya.repository;

import com.nanokhadya.model.TestSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.Optional;
import java.util.List;

@Repository
public interface TestSessionRepository extends JpaRepository<TestSession, String> {
    Optional<TestSession> findBySessionCode(String sessionCode);
    List<TestSession> findTop50ByOrderByStartedAtDesc();
    List<TestSession> findByOverallScreeningResult(TestSession.OverallResult result);

    @Query("SELECT COUNT(t) FROM TestSession t WHERE t.overallScreeningResult = 'PASS_SCREENING'")
    long countPassScreening();

    @Query("SELECT COUNT(t) FROM TestSession t WHERE t.overallScreeningResult = 'WARNING_SUSPICIOUS'")
    long countWarning();

    @Query("SELECT COUNT(t) FROM TestSession t WHERE t.overallScreeningResult = 'POSITIVE_SCREENING'")
    long countPositive();

    @Query("SELECT COUNT(t) FROM TestSession t WHERE t.overallScreeningResult = 'INVALID_TEST'")
    long countInvalid();
}
