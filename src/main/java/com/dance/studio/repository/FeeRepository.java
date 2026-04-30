package com.dance.studio.repository;

import com.dance.studio.model.Fee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface FeeRepository extends JpaRepository<Fee, Long> {

	List<Fee> findByStatus(String status);

	List<Fee> findByStudentId(Long studentId);

	List<Fee> findByStatusAndDueDateBefore(String status, LocalDate date);

	boolean existsByStudentIdAndStatus(Long studentId, String status);

	@Query("""
			   SELECT COALESCE(SUM(f.amount), 0.0)
			   FROM Fee f
			   WHERE f.status='PAID'
			   AND MONTH(f.paidDate)=:month
			   AND YEAR(f.paidDate)=:year
			""")
	Double sumPaidFeesForMonth(int month, int year);

	@Query("SELECT COALESCE(SUM(f.amount), 0.0) FROM Fee f WHERE f.status='PAID'")
	Double sumAllPaidFees();

	long countByStatus(String status);

	List<Fee> findByStatusAndDueDateLessThanEqual(String string, LocalDate today);

	List<Fee> findTop5ByStatusOrderByPaidDateDesc(String status);

	Fee findTopByReceiptNoIsNotNullOrderByReceiptNoDesc();
}
