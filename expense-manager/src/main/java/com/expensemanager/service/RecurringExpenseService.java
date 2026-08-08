package com.expensemanager.service;

import com.expensemanager.model.RecurringExpense;
import com.expensemanager.repository.RecurringExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;

@Service
public class RecurringExpenseService {

    private final RecurringExpenseRepository repo;

    public RecurringExpenseService(RecurringExpenseRepository repo) {
        this.repo = repo;
    }

    public RecurringExpense addRecurring(RecurringExpense recurringExpense) {
        // enabled has default value in entity; keep null-safe for existing records
        // (Lombok boolean getter returns primitive, so getEnabled() can't be null)
        recurringExpense.setEnabled(true);
        return repo.save(recurringExpense);
    }

    public List<RecurringExpense> getAll() {
        return repo.findAll();
    }

    public void delete(Long id) {
        repo.deleteById(id);
    }

    public RecurringExpense update(Long id, RecurringExpense updated) {
        RecurringExpense existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("RecurringExpense not found"));

        existing.setTitle(updated.getTitle());
        existing.setAmount(updated.getAmount());
        existing.setCategory(updated.getCategory());
        existing.setFrequency(updated.getFrequency());
        existing.setPaymentMethod(updated.getPaymentMethod());
        existing.setReminderDaysBefore(updated.getReminderDaysBefore());
        existing.setNextDueDate(updated.getNextDueDate());
        existing.setLastAppliedAt(updated.getLastAppliedAt());
        existing.setEnabled(updated.isEnabled());

        return repo.save(existing);
    }

    public List<RecurringExpense> findDue(LocalDate today) {
        return repo.findByEnabledTrueAndNextDueDateLessThanEqual(today);
    }

    public RecurringExpense save(RecurringExpense recurringExpense) {
        return repo.save(recurringExpense);
    }

    public RecurringExpense getById(Long id) {
        return repo.findById(id).orElseThrow(() -> new RuntimeException("RecurringExpense not found"));
    }
}

