package com.dance.studio.repository;

import com.dance.studio.model.ClassSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClassScheduleRepository extends JpaRepository<ClassSchedule, Long> {
    List<ClassSchedule> findByBatchId(Long batchId);

    List<ClassSchedule> findByDayOfWeek(String dayOfWeek);
}
