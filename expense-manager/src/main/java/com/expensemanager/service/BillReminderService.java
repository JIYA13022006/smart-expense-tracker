package com.expensemanager.service;

import com.expensemanager.model.Expense;
import com.expensemanager.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class BillReminderService {

    private final ExpenseRepository expenseRepository;

    public BillReminderService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public List<Expense> listUpcomingAndOverdueBills() {
        // Ledger entries created for recurring bills have tags like "recurring:<id>".
        return expenseRepository.findAll().stream()
                .filter(e -> e.getTags() != null && e.getTags().startsWith("recurring:"))
                .filter(e -> e.getPaymentStatus() == null || !e.getPaymentStatus().startsWith("PAID"))
                .filter(e -> e.getDueDate() != null && !e.getDueDate().isBlank())
                .sorted(Comparator.comparing(Expense::getDueDate))
                .collect(Collectors.toList());
    }
}

