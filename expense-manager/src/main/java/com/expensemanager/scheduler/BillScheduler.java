package com.expensemanager.scheduler;

import com.expensemanager.model.Expense;
import com.expensemanager.model.RecurringExpense;
import com.expensemanager.repository.ExpenseRepository;
import com.expensemanager.repository.RecurringExpenseRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;

@Component
public class BillScheduler {

    private final RecurringExpenseRepository recurringRepo;
    private final ExpenseRepository expenseRepo;

    public BillScheduler(RecurringExpenseRepository recurringRepo, ExpenseRepository expenseRepo) {
        this.recurringRepo = recurringRepo;
        this.expenseRepo = expenseRepo;
    }

    // Run daily (fixed delay is acceptable for dev). If you want timezone correctness,
    // we can switch to cron.
    @Scheduled(fixedDelay = 60_000L)
    public void applyDueRecurringBills() {
        LocalDate today = LocalDate.now();

        for (RecurringExpense r : recurringRepo.findByEnabledTrueAndNextDueDateLessThanEqual(today)) {
            // Prevent duplicates: only apply once per due date.
            // We store lastAppliedAt as the last due date we applied.
            if (r.getLastAppliedAt() != null && r.getLastAppliedAt().isEqual(r.getNextDueDate())) {
                continue;
            }

            Expense ledger = new Expense();
            ledger.setTitle(r.getTitle());
            ledger.setAmount(r.getAmount());
            ledger.setCategory(r.getCategory());
            ledger.setDate(today.toString());
            ledger.setDueDate(r.getNextDueDate().toString());
            ledger.setNote("Auto-created recurring bill");
            ledger.setTags("recurring:" + r.getId());
            ledger.setPaymentStatus("PENDING");
            ledger.setPaymentMethod(r.getPaymentMethod());

            expenseRepo.save(ledger);

            // Advance next due date based on frequency
            LocalDate next = computeNextDueDate(r.getNextDueDate(), r.getFrequency());
            r.setLastAppliedAt(r.getNextDueDate());
            r.setNextDueDate(next);
            recurringRepo.save(r);
        }
    }

    private LocalDate computeNextDueDate(LocalDate currentDue, String frequency) {
        if (frequency == null) frequency = "Monthly";

        return switch (frequency) {
            case "Daily" -> currentDue.plusDays(1);
            case "Weekly" -> currentDue.plusWeeks(1);
            case "Yearly" -> currentDue.plusYears(1);
            case "Monthly" -> currentDue.plusMonths(1);
            default -> currentDue.plusMonths(1);
        };
    }
}

