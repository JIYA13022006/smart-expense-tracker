package com.expensemanager.controller;

import com.expensemanager.model.Budget;
import com.expensemanager.model.BudgetForecast;
import com.expensemanager.model.BudgetProgress;
import com.expensemanager.service.BudgetService;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.YearMonth;
import java.util.List;

@RestController
@RequestMapping("/api/budgets")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Budget create(@RequestBody Budget budget) {
        return budgetService.create(budget);
    }

    @GetMapping
    public List<BudgetProgress> getMonthlyProgress(
            @RequestParam(defaultValue = "") String month) {
        return budgetService.getProgress(month.isBlank() ? YearMonth.now().toString() : month);
    }

    @GetMapping("/forecast")
    public List<BudgetForecast> getForecast(@RequestParam(defaultValue = "") String month) {
        return budgetService.getForecast(month.isBlank() ? YearMonth.now().toString() : month);
    }

    @GetMapping("/{id}")
    public BudgetProgress getProgress(@PathVariable Long id) {
        return budgetService.getProgress(id);
    }

    @PutMapping("/{id}")
    public Budget update(@PathVariable Long id, @RequestBody Budget budget) {
        return budgetService.update(id, budget);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        budgetService.delete(id);
    }
}
