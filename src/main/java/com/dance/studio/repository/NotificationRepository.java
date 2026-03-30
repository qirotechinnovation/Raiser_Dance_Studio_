package com.dance.studio.repository;

import com.dance.studio.model.Notification;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByIsReadFalseOrderByTimestampDesc();

    List<Notification> findAllByOrderByTimestampDesc();

    List<Notification> findByStudentId(Long studentId);

    List<Notification> findByStudentIdOrStudentIsNullOrderByTimestampDesc(Long studentId);
}
