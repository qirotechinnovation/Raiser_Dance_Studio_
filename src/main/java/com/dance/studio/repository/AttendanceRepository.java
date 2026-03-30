package com.dance.studio.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import com.dance.studio.model.Attendance;

import java.time.LocalDate;
import java.util.List;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByStudentBatchId(Long batchId);

    List<Attendance> findByStudentId(Long studentId);

    List<Attendance> findByStudentIdAndDate(Long studentId, LocalDate date);

    List<Attendance> findByStudentBatchIdAndDate(Long batchId, LocalDate date);

    List<Attendance> findByStudentBatchIdAndDateBetween(Long batchId, LocalDate start, LocalDate end);

    long countByStudentIdAndDateAfter(Long studentId, LocalDate date);
}
