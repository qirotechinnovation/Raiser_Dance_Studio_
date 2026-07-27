package com.dance.studio.repository;

import com.dance.studio.model.FeeTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface FeeTransactionRepository extends JpaRepository<FeeTransaction, Long> {
    List<FeeTransaction> findByFeeId(Long feeId);
}
