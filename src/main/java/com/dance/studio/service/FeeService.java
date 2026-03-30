package com.dance.studio.service;

import com.dance.studio.model.Fee;
import com.dance.studio.repository.FeeRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
@SuppressWarnings("null")
public class FeeService {

    private final FeeRepository repo;
    private final com.dance.studio.repository.StudentRepository studentRepo;

    public FeeService(FeeRepository repo, com.dance.studio.repository.StudentRepository studentRepo) {
        this.repo = repo;
        this.studentRepo = studentRepo;
    }

    public Fee createFee(Fee fee) {
        // Auto calculate next due date
        if ("MONTHLY".equals(fee.getPlan())) {
            fee.setDueDate(LocalDate.now().plusMonths(1));
        } else if ("QUARTERLY".equals(fee.getPlan())) {
            fee.setDueDate(LocalDate.now().plusMonths(3));
        } else if ("YEARLY".equals(fee.getPlan())) {
            fee.setDueDate(LocalDate.now().plusYears(1));
        }
        fee.setStatus("UNPAID");
        Fee saved = repo.save(fee);

        if (saved.getStudent() != null) {
            com.dance.studio.model.Student s = saved.getStudent();
            s.setTotalOutstanding(s.getTotalOutstanding() + saved.getAmount());
            studentRepo.save(s);
        }

        return saved;
    }

    public Fee markPaid(Long id) {
        Fee fee = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Fee not found"));

        if ("PAID".equalsIgnoreCase(fee.getStatus())) {
            return fee;
        }

        fee.setStatus("PAID");
        fee.setPaidDate(LocalDate.now());
        Fee saved = repo.save(fee);

        if (saved.getStudent() != null) {
            com.dance.studio.model.Student s = saved.getStudent();
            s.setTotalOutstanding(Math.max(0, s.getTotalOutstanding() - saved.getAmount()));
            studentRepo.save(s);
        }

        return saved;
    }

    public List<Fee> pendingFees() {
        return repo.findByStatus("UNPAID");
    }

    public List<Fee> dueFees() {
        return repo.findByStatusAndDueDateBefore("UNPAID", LocalDate.now());
    }
}
