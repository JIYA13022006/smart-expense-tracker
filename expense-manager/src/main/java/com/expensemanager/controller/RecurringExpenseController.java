package com.expensemanager.controller;

import com.expensemanager.model.Expense;
import com.expensemanager.model.RecurringExpense;
import com.expensemanager.repository.ExpenseRepository;
import com.expensemanager.service.RecurringExpenseService;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/recurring")
public class RecurringExpenseController {

    private final RecurringExpenseService service;
    private final ExpenseRepository expenseRepository;

    public RecurringExpenseController(RecurringExpenseService service, ExpenseRepository expenseRepository) {
        this.service = service;
        this.expenseRepository = expenseRepository;
    }

    @PostMapping
    public RecurringExpense add(@RequestBody RecurringExpense recurringExpense) {
        if (recurringExpense.getNextDueDate() == null) {
            // If not provided, default to today.
            recurringExpense.setNextDueDate(LocalDate.now());
        }
        return service.addRecurring(recurringExpense);
    }

    @GetMapping
    public List<RecurringExpense> getAll() {
        return service.getAll();
    }

    @PutMapping("/{id}")
    public RecurringExpense update(@PathVariable Long id, @RequestBody RecurringExpense updated) {
        return service.update(id, updated);
    }

    @DeleteMapping("/{id}")
    public String delete(@PathVariable Long id) {
        service.delete(id);
        return "Deleted successfully";
    }

    // Mirrors the UI action: apply recurring bill immediately
    // Creates a ledger Expense entry with paymentStatus=PENDING.
    @PostMapping("/{id}/apply")
    public Expense applyOnceForDueDate(@PathVariable Long id) {
        RecurringExpense r = service.getById(id);

        LocalDate today = LocalDate.now();
        if (r.getNextDueDate() == null) {
            r.setNextDueDate(today);
        }

        Expense ledger = new Expense();
        ledger.setTitle(r.getTitle());
        ledger.setAmount(r.getAmount());
        ledger.setCategory(r.getCategory());
        ledger.setDate(today.toString());
        ledger.setDueDate(r.getNextDueDate().toString());
        ledger.setNote("Manual apply recurring bill");
        ledger.setTags("recurring:" + r.getId());
        ledger.setPaymentStatus("PENDING");
        ledger.setPaymentMethod(r.getPaymentMethod());

        return expenseRepository.save(ledger);
    }
}


