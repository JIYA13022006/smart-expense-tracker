package com.expensemanager.service;

import com.expensemanager.model.Expense;
import com.expensemanager.model.SplitShare;
import com.expensemanager.repository.ExpenseRepository;
import com.expensemanager.utils.CategoryUtil;
import org.springframework.stereotype.Service;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseService {

    private final ExpenseRepository repo;

    public ExpenseService(ExpenseRepository repo) {
        this.repo = repo;
    }

    // Add Expense (FIXED logic)
    public Expense addExpense(Expense expense) {

        if (expense.getCategory() != null && !expense.getCategory().trim().isEmpty()) {
            return repo.save(expense);
        }

        String detectedCategory = CategoryUtil.detectCategory(expense.getTitle());
        expense.setCategory(detectedCategory);

        return repo.save(expense);
    }

    // Get all
    public List<Expense> getAllExpenses() {
        return repo.findAll();
    }

    // DELETE
    public void deleteExpense(Long id) {
        repo.deleteById(id);
    }

    // Get split summary (aggregate amounts per person)
    public Map<String, Double> getSplitSummary() {
        Map<String, Double> summary = new HashMap<>();
        for (Expense expense : repo.findAll()) {
            if (expense.getSplitShares() != null) {
                for (SplitShare share : expense.getSplitShares()) {
                    if (share.getPersonName() == null) continue;
                    summary.merge(share.getPersonName(), share.getAmount(), Double::sum);
                }
            }
        }
        return summary;
    }

    public Expense updateExpense(Long id, Expense updatedExpense) {

        Expense existing = repo.findById(id)
                .orElseThrow(() -> new RuntimeException("Expense not found"));

        existing.setTitle(updatedExpense.getTitle());
        existing.setAmount(updatedExpense.getAmount());
        existing.setCategory(updatedExpense.getCategory());
        existing.setDate(updatedExpense.getDate());
        existing.setNote(updatedExpense.getNote());
        existing.setDueDate(updatedExpense.getDueDate());
        existing.setPaymentStatus(updatedExpense.getPaymentStatus());
        existing.setPaymentMethod(updatedExpense.getPaymentMethod());
        existing.setTags(updatedExpense.getTags());

        return repo.save(existing);
    }
}
