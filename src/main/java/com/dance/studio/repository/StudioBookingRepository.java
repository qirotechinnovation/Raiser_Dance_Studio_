package com.dance.studio.repository;

import com.dance.studio.model.StudioBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface StudioBookingRepository extends JpaRepository<StudioBooking, Long> {
    List<StudioBooking> findByStudentIdOrderByCreatedAtDesc(Long studentId);

    List<StudioBooking> findAllByOrderByCreatedAtDesc();

    boolean existsByBookingDateAndTimeSlotAndStatus(java.time.LocalDate bookingDate, String timeSlot, String status);
}
