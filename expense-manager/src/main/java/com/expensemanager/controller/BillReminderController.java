package com.expensemanager.controller;

import com.expensemanager.model.Expense;
import com.expensemanager.repository.ExpenseRepository;
import com.expensemanager.service.BillReminderService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bills")
public class BillReminderController {

    private final BillReminderService reminderService;
    private final ExpenseRepository expenseRepository;

    public BillReminderController(BillReminderService reminderService, ExpenseRepository expenseRepository) {
        this.reminderService = reminderService;
        this.expenseRepository = expenseRepository;
    }

    @GetMapping("/reminders")
    public List<Expense> reminders() {
        return reminderService.listUpcomingAndOverdueBills();
    }

    @PostMapping("/mark-paid/{expenseId}")
    public Expense markPaid(@PathVariable Long expenseId, @RequestBody Map<String, String> body) {
        Expense existing = expenseRepository.findById(expenseId).orElseThrow(() -> new RuntimeException("Expense not found"));

        String method = body.getOrDefault("paymentMethod", "OTHER");
        existing.setPaymentMethod(method);

        String status;
        if (method == null) method = "OTHER";
        method = method.toUpperCase();

        if (method.contains("UPI")) status = "PAID_UPI";
        else if (method.contains("CARD")) status = "PAID_CARD";
        else if (method.contains("CASH")) status = "PAID_CASH";
        else status = "PAID";

        existing.setPaymentStatus(status);

        return expenseRepository.save(existing);
    }
}

