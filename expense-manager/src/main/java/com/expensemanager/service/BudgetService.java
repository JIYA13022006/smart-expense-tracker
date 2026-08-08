package com.expensemanager.service;

import com.expensemanager.model.Budget;
import com.expensemanager.model.BudgetForecast;
import com.expensemanager.model.BudgetProgress;
import com.expensemanager.model.Expense;
import com.expensemanager.repository.BudgetRepository;
import com.expensemanager.repository.ExpenseRepository;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.time.format.DateTimeParseException;
import java.time.LocalDate;
import java.util.List;

@Service
public class BudgetService {

    public static final double NEAR_LIMIT_THRESHOLD = 0.80;
    public static final double OVER_LIMIT_THRESHOLD = 1.00;

    private final BudgetRepository budgetRepository;
    private final ExpenseRepository expenseRepository;

    public BudgetService(BudgetRepository budgetRepository, ExpenseRepository expenseRepository) {
        this.budgetRepository = budgetRepository;
        this.expenseRepository = expenseRepository;
    }

    public Budget create(Budget budget) {
        validateBudget(budget);
        budget.setCategory(budget.getCategory().trim());
        budget.setMonth(normalizeMonth(budget.getMonth()));

        budgetRepository.findByCategoryIgnoreCaseAndMonth(budget.getCategory(), budget.getMonth())
                .ifPresent(existing -> {
                    throw new IllegalArgumentException("A budget already exists for this category and month");
                });
        return budgetRepository.save(budget);
    }

    public Budget update(Long id, Budget updatedBudget) {
        validateBudget(updatedBudget);
        Budget existing = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));

        String category = updatedBudget.getCategory().trim();
        String month = normalizeMonth(updatedBudget.getMonth());
        budgetRepository.findByCategoryIgnoreCaseAndMonth(category, month)
                .filter(other -> !other.getId().equals(id))
                .ifPresent(other -> {
                    throw new IllegalArgumentException("A budget already exists for this category and month");
                });

        existing.setCategory(category);
        existing.setMonth(month);
        existing.setLimitAmount(updatedBudget.getLimitAmount());
        return budgetRepository.save(existing);
    }

    public List<BudgetProgress> getProgress(String month) {
        String normalizedMonth = normalizeMonth(month);
        List<Expense> expenses = expenseRepository.findAll();
        return budgetRepository.findByMonthOrderByCategoryAsc(normalizedMonth).stream()
                .map(budget -> toProgress(budget, expenses))
                .toList();
    }

    public BudgetProgress getProgress(Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Budget not found"));
        return toProgress(budget, expenseRepository.findAll());
    }

    public List<BudgetForecast> getForecast(String month) {
        String normalizedMonth = normalizeMonth(month);
        YearMonth yearMonth = YearMonth.parse(normalizedMonth);
        LocalDate today = LocalDate.now();
        int elapsedDays = yearMonth.equals(YearMonth.now()) ? today.getDayOfMonth() : yearMonth.lengthOfMonth();
        int totalDays = yearMonth.lengthOfMonth();
        List<Expense> expenses = expenseRepository.findAll();

        return budgetRepository.findByMonthOrderByCategoryAsc(normalizedMonth).stream()
                .filter(budget -> budget.getLimitAmount() > 0)
                .map(budget -> toForecast(budget, expenses, elapsedDays, totalDays))
                .toList();
    }

    public void delete(Long id) {
        if (!budgetRepository.existsById(id)) {
            throw new IllegalArgumentException("Budget not found");
        }
        budgetRepository.deleteById(id);
    }

    public String getThresholdWarning(Expense savedExpense) {
        if (savedExpense.getCategory() == null || savedExpense.getDate() == null || savedExpense.getDate().length() < 7) {
            return null;
        }

        String month = savedExpense.getDate().substring(0, 7);
        return budgetRepository.findByCategoryIgnoreCaseAndMonth(savedExpense.getCategory(), month)
                .map(budget -> {
                    double spent = expenseRepository.findAll().stream()
                            .filter(expense -> expense.getCategory() != null
                                    && expense.getCategory().equalsIgnoreCase(budget.getCategory()))
                            .filter(expense -> expense.getDate() != null && expense.getDate().startsWith(month))
                            .mapToDouble(Expense::getAmount)
                            .sum();
                    double ratio = budget.getLimitAmount() == 0 ? 0 : spent / budget.getLimitAmount();
                    if (ratio >= OVER_LIMIT_THRESHOLD) {
                        return "Alert: " + budget.getCategory() + " budget crossed 100%.";
                    }
                    if (ratio >= NEAR_LIMIT_THRESHOLD) {
                        return "Warning: " + budget.getCategory() + " budget crossed 80%.";
                    }
                    return null;
                })
                .orElse(null);
    }

    private BudgetProgress toProgress(Budget budget, List<Expense> expenses) {
        double spent = expenses.stream()
                .filter(expense -> expense.getCategory() != null
                        && expense.getCategory().equalsIgnoreCase(budget.getCategory()))
                .filter(expense -> expense.getDate() != null && expense.getDate().startsWith(budget.getMonth()))
                .mapToDouble(Expense::getAmount)
                .sum();
        double remaining = budget.getLimitAmount() - spent;
        double percentage = budget.getLimitAmount() == 0 ? 0 : (spent / budget.getLimitAmount()) * 100;
        String status = percentage >= 100 ? "OVER_BUDGET" : percentage >= 80 ? "NEAR_LIMIT" : "ON_TRACK";

        return new BudgetProgress(
                budget.getId(), budget.getCategory(), budget.getMonth(), budget.getLimitAmount(),
                spent, remaining, Math.round(percentage * 100.0) / 100.0, status
        );
    }

    private BudgetForecast toForecast(Budget budget, List<Expense> expenses, int elapsedDays, int totalDays) {
        double spent = expenses.stream()
                .filter(expense -> expense.getCategory() != null
                        && expense.getCategory().equalsIgnoreCase(budget.getCategory()))
                .filter(expense -> expense.getDate() != null && expense.getDate().startsWith(budget.getMonth()))
                .mapToDouble(Expense::getAmount)
                .sum();

        double averageDailySpend = elapsedDays <= 0 ? 0 : spent / elapsedDays;
        double projected = averageDailySpend * totalDays;
        double remaining = budget.getLimitAmount() - spent;
        Integer daysUntilRunOut = averageDailySpend <= 0 || remaining <= 0
                ? (remaining <= 0 ? 0 : null)
                : (int) Math.floor(remaining / averageDailySpend);
        double percentage = budget.getLimitAmount() == 0 ? 0 : (spent / budget.getLimitAmount()) * 100;

        String message;
        if (daysUntilRunOut == null) {
            message = budget.getCategory() + " budget has no spending yet.";
        } else if (daysUntilRunOut <= 0) {
            message = "Your " + budget.getCategory() + " budget is already used up.";
        } else {
            message = "At this rate, you'll run out of " + budget.getCategory() + " budget in "
                    + daysUntilRunOut + " days.";
        }

        return new BudgetForecast(
                budget.getCategory(),
                budget.getMonth(),
                budget.getLimitAmount(),
                spent,
                Math.round(averageDailySpend * 100.0) / 100.0,
                Math.round(projected * 100.0) / 100.0,
                daysUntilRunOut,
                Math.round(percentage * 100.0) / 100.0,
                message
        );
    }

    private void validateBudget(Budget budget) {
        if (budget.getCategory() == null || budget.getCategory().isBlank()) {
            throw new IllegalArgumentException("Budget category is required");
        }
        if (budget.getLimitAmount() < 0) {
            throw new IllegalArgumentException("Budget limit cannot be negative");
        }
    }

    private String normalizeMonth(String month) {
        if (month == null || month.isBlank()) {
            return YearMonth.now().toString();
        }
        try {
            return YearMonth.parse(month).toString();
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Month must use YYYY-MM format");
        }
    }
}
