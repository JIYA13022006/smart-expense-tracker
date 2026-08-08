package com.expensemanager.service;

import com.expensemanager.model.Expense;
import org.springframework.stereotype.Service;

import java.time.YearMonth;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class InsightService {

    public String analyzeExpenses(List<Expense> expenses) {
        double total = expenses.stream().mapToDouble(Expense::getAmount).sum();
        double foodTotal = expenses.stream()
                .filter(e -> "Food".equalsIgnoreCase(e.getCategory()))
                .mapToDouble(Expense::getAmount).sum();
        if (total == 0) return "No expenses recorded";
        if (foodTotal > 0.3 * total) return "High spending on Food (more than 30%)";
        return "Spending is balanced";
    }

    public double predictNextMonth(List<Expense> expenses) {
        if (expenses.isEmpty()) return 0;
        return expenses.stream().mapToDouble(Expense::getAmount).average().orElse(0);
    }

    // Targets are monthly, so only expenses from the current calendar month are analyzed.
    public Map<String, Object> analyzeExpensesData(List<Expense> expenses, double budget, double income, double savingsGoal) {
        String currentMonth = YearMonth.now().toString();
        List<Expense> monthlyExpenses = expenses.stream()
                .filter(expense -> expense.getDate() != null && expense.getDate().startsWith(currentMonth))
                .toList();
        double totalSpent = monthlyExpenses.stream().mapToDouble(Expense::getAmount).sum();
        Map<String, Double> categoryTotals = monthlyExpenses.stream()
                .filter(expense -> expense.getCategory() != null)
                .collect(Collectors.groupingBy(Expense::getCategory, Collectors.summingDouble(Expense::getAmount)));
        String topCategory = categoryTotals.entrySet().stream().max(Map.Entry.comparingByValue())
                .map(Map.Entry::getKey).orElse("General");
        double topCategorySum = categoryTotals.getOrDefault(topCategory, 0.0);
        Expense biggestExpense = monthlyExpenses.stream().max(Comparator.comparingDouble(Expense::getAmount)).orElse(null);
        String biggestExpenseSummary = biggestExpense == null ? "No expenses recorded this month"
                : biggestExpense.getTitle() + " (" + biggestExpense.getCategory() + ", Rs " + biggestExpense.getAmount() + ")";

        double foodSpend = monthlyExpenses.stream().filter(e -> "Food".equalsIgnoreCase(e.getCategory()))
                .mapToDouble(Expense::getAmount).sum();
        long missingDueDates = monthlyExpenses.stream().filter(e -> e.getDueDate() == null).count();
        double spendRatio = budget > 0 ? totalSpent / budget : 0;
        double savings = Math.max(0, income - totalSpent);
        double budgetUsedPct = spendRatio * 100;
        double savingsProgressPct = savingsGoal > 0 ? (savings / savingsGoal) * 100 : 100;
        double foodPct = totalSpent > 0 ? foodSpend / totalSpent * 100 : 0;
        double topCategoryPct = totalSpent > 0 ? topCategorySum / totalSpent * 100 : 0;

        String budgetAdvice = spendRatio > 1.0 ? "You have exceeded your budget. Cut non-essential spending and review recurring expenses."
                : spendRatio > 0.8 ? "You are close to the budget limit. Avoid extra purchases and focus on savings."
                : "Budget looks healthy. Keep tracking expenses and maintain discipline.";
        String recommendation = savings < savingsGoal ? "Your current savings are below the target. Reduce dining out, entertainment, or shopping expenses."
                : "You are on track with your savings goal. Consider investing the surplus.";

        // This intentionally reacts to both targets, not only to a category percentage.
        double budgetScore = budget > 0 ? Math.max(0, 100 - budgetUsedPct) : 0;
        int score = (int) Math.round(Math.min(100, Math.max(0,
                budgetScore * 0.55 + Math.min(100, savingsProgressPct) * 0.45)));
        String scoreLabel = score >= 80 ? "Excellent" : score >= 60 ? "Good" : score >= 40 ? "Watch" : "Needs Attention";

        List<String> warnings = new ArrayList<>();
        if (spendRatio > 1.0) warnings.add("Budget exceeded. Cut back on non-essential spending.");
        if (totalSpent > 0 && foodSpend > 0.3 * totalSpent) warnings.add("Food spending is high. Reduce dining out or grocery waste.");
        if (missingDueDates > 0) warnings.add("Some expenses have no due date. Add due dates to avoid surprises.");
        if (savings < savingsGoal) warnings.add("Savings are below your goal. Plan a low-spend week.");
        if (warnings.isEmpty()) warnings.add("No urgent spending risks were found this month.");

        List<String> suggestions = new ArrayList<>();
        suggestions.add("Review the top expense category and identify cost-saving opportunities.");
        suggestions.add("Set due dates or reminders for upcoming payments.");
        if (savings >= savingsGoal) suggestions.add("Consider investing the extra savings or building an emergency fund.");

        Map<String, Object> result = new java.util.HashMap<>();
        result.put("analysisMonth", currentMonth);
        result.put("totalSpent", totalSpent);
        result.put("avgExpense", monthlyExpenses.isEmpty() ? 0 : totalSpent / monthlyExpenses.size());
        result.put("topCategory", topCategory);
        result.put("topCategoryPct", Math.round(topCategoryPct * 100.0) / 100.0);
        result.put("biggestExpense", biggestExpenseSummary);
        result.put("budgetAdvice", budgetAdvice);
        result.put("recommendation", recommendation);
        result.put("riskWarning", totalSpent > 0 && foodSpend > 0.3 * totalSpent ? "High food spending detected." : "Food spending is within a healthy range.");
        result.put("savings", savings);
        result.put("budgetUsedPct", Math.round(budgetUsedPct * 100.0) / 100.0);
        result.put("savingsProgressPct", Math.round(savingsProgressPct * 100.0) / 100.0);
        result.put("budget", budget);
        result.put("income", income);
        result.put("savingsGoal", savingsGoal);
        result.put("missingDueDates", missingDueDates);
        result.put("expenseCount", monthlyExpenses.size());
        result.put("score", score);
        result.put("scoreLabel", scoreLabel);
        result.put("topInsight", spendRatio > 1.0 ? "You are overspending compared to your monthly budget."
                : savings < savingsGoal ? "Your budget is under control, but your savings target is not reached yet."
                : "Your monthly budget and savings target are on track.");
        result.put("warnings", warnings);
        result.put("suggestions", suggestions);
        result.put("foodPct", Math.round(foodPct * 100.0) / 100.0);
        return result;
    }
}
