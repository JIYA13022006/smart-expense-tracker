package com.expensemanager.model;

public record BudgetProgress(
        Long id,
        String category,
        String month,
        double limitAmount,
        double spentAmount,
        double remainingAmount,
        double usedPercentage,
        String status
) {
}
