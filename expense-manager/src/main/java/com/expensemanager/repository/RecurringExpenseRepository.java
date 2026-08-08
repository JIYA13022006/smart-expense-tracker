package com.expensemanager.repository;

import com.expensemanager.model.RecurringExpense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RecurringExpenseRepository extends JpaRepository<RecurringExpense, Long> {
    List<RecurringExpense> findByEnabledTrueAndNextDueDateLessThanEqual(LocalDate date);
}

