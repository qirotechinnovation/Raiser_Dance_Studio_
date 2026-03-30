package com.dance.studio.repository;

import com.dance.studio.model.Event;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    long countByDateAfter(LocalDate date);

    Event findFirstByDateAfter(LocalDate date);

    List<Event> findByDateAfter(LocalDate now);

    List<Event> findByDateAfterOrderByDateAsc(LocalDate now);

    List<Event> findByDate(LocalDate now);

    List<Event> findByDateGreaterThanEqualOrderByDateAsc(LocalDate date);

    List<Event> findByParticipantsId(Long studentId);
}
