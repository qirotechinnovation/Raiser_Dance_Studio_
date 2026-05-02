
package com.dance.studio.repository;

import org.springframework.data.jpa.repository.JpaRepository;
import com.dance.studio.model.Student;

public interface StudentRepository extends JpaRepository<Student, Long> {
    java.util.List<Student> findByEmail(String email);

    java.util.List<Student> findTop5ByOrderByJoiningDateDesc();

    java.util.List<Student> findByBatchId(Long batchId);

    long countByBatchId(Long batchId);

    long countByActiveTrue();

    long countByActiveFalse();

    java.util.List<Student> findByBatchIsNull();
}
