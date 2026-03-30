package com.dance.studio.repository;

import com.dance.studio.model.EventCancellationRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventCancellationRepository extends JpaRepository<EventCancellationRequest, Long> {
    List<EventCancellationRequest> findByStatus(String status);

    List<EventCancellationRequest> findByStudentId(Long studentId);

    List<EventCancellationRequest> findByStudentIdAndEventId(Long studentId, Long eventId);
}
