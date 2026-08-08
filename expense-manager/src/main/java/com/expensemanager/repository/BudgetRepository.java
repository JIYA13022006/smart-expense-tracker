package com.expensemanager.repository;

import com.expensemanager.model.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByMonthOrderByCategoryAsc(String month);
    Optional<Budget> findByCategoryIgnoreCaseAndMonth(String category, String month);
}
