package com.expensemanager.controller;

import com.expensemanager.model.Expense;
import com.expensemanager.model.ExpenseSaveResponse;
import com.expensemanager.service.BudgetService;
import com.expensemanager.service.ExpenseService;
import com.expensemanager.service.InsightService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService service;
    private final InsightService insightService;
    private final BudgetService budgetService;

    public ExpenseController(ExpenseService service, InsightService insightService, BudgetService budgetService) {
        this.service = service;
        this.insightService = insightService;
        this.budgetService = budgetService;
    }

    @PostMapping
    public ExpenseSaveResponse addExpense(@RequestBody Expense expense) {
        Expense savedExpense = service.addExpense(expense);
        return new ExpenseSaveResponse(savedExpense, budgetService.getThresholdWarning(savedExpense));
    }

    @GetMapping
    public List<Expense> getExpenses() {
        return service.getAllExpenses();
    }

    @GetMapping("/splits/summary")
    public Map<String, Double> getSplitSummary() {
        return service.getSplitSummary();
    }

    @DeleteMapping("/{id}")
    public String deleteExpense(@PathVariable Long id) {
        service.deleteExpense(id);
        return "Deleted successfully";
    }

    @GetMapping("/insights")
    public String getInsights() {
        return insightService.analyzeExpenses(service.getAllExpenses());
    }

    @GetMapping("/prediction")
    public String getPrediction() {
        double predicted = insightService.predictNextMonth(service.getAllExpenses());
        return "Predicted next month spending: Rs " + predicted;
    }

    @PutMapping("/{id}")
    public Expense updateExpense(@PathVariable Long id, @RequestBody Expense expense) {
        return service.updateExpense(id, expense);
    }
}
