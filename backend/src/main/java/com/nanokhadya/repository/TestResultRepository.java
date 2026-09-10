package com.nanokhadya.repository;

import com.nanokhadya.model.TestResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface TestResultRepository extends JpaRepository<TestResult, String> {
    List<TestResult> findByTestSessionId(String testSessionId);
}
