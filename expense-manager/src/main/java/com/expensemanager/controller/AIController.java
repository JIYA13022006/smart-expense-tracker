package com.expensemanager.controller;

import com.expensemanager.model.Expense;
import com.expensemanager.service.ExpenseService;
import com.expensemanager.service.InsightService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ai")
public class AIController {

    private final ExpenseService expenseService;
    private final InsightService insightService;

    public AIController(ExpenseService expenseService, InsightService insightService) {
        this.expenseService = expenseService;
        this.insightService = insightService;
    }

    @PostMapping("/analyze")
    public Map<String, Object> analyze(@RequestBody Map<String, Object> payload) {
        double budget = parseDouble(payload.get("budget"), 10000);
        double income = parseDouble(payload.get("income"), 30000);
        double savingsGoal = parseDouble(payload.get("savingsGoal"), 5000);

        List<Expense> expenses = expenseService.getAllExpenses();
        return insightService.analyzeExpensesData(expenses, budget, income, savingsGoal);
    }

    private double parseDouble(Object value, double defaultValue) {
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        if (value instanceof String) {
            try {
                return Double.parseDouble((String) value);
            } catch (NumberFormatException ignored) {
            }
        }
        return defaultValue;
    }
}