package com.expensemanager.model;

public record ExpenseSaveResponse(
        Expense expense,
        String warning
) {
}
