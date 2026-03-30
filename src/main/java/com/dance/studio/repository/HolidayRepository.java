package com.dance.studio.repository;

import com.dance.studio.model.Holiday;
import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface HolidayRepository extends JpaRepository<Holiday, Long> {
    List<Holiday> findByDateAfterOrderByDateAsc(LocalDate date);

    @org.springframework.data.jpa.repository.Query("SELECT h FROM Holiday h WHERE (h.batch.id = :batchId OR h.batch IS NULL) AND h.date > :date ORDER BY h.date ASC")
    List<Holiday> findByBatchIdOrBatchIsNullAndDateAfterOrderByDateAsc(Long batchId, LocalDate date);
}
