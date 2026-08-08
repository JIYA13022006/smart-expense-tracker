package com.expensemanager.model;

import java.util.List;

public record CashFlowForecast(
        String asOfDate,
        String forecastEndDate,
        double currentBalance,
        double expectedIncome,
        double upcomingBills,
        double budgetCommitments,
        double safeToSpend,
        boolean riskOfNegativeBalance,
        List<String> alerts
) {
}
