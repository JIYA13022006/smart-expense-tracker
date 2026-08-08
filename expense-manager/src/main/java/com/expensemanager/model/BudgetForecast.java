package com.expensemanager.model;

public record BudgetForecast(
        String category,
        String month,
        double limitAmount,
        double spentAmount,
        double averageDailySpend,
        double projectedEndOfMonthSpend,
        Integer daysUntilBudgetRunsOut,
        double usedPercentage,
        String message
) {
}
