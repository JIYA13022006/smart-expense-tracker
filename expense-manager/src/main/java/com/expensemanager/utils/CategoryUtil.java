package com.expensemanager.utils;

public class CategoryUtil {

    public static String detectCategory(String title) {

        title = title.toLowerCase();

        if (title.contains("zomato") || title.contains("swiggy") || title.contains("restaurant")) {
            return "Food";
        }

        if (title.contains("uber") || title.contains("ola") || title.contains("bus") || title.contains("train")) {
            return "Travel";
        }

        if (title.contains("amazon") || title.contains("flipkart") || title.contains("shopping")) {
            return "Shopping";
        }

        if (title.contains("electricity") || title.contains("bill") || title.contains("recharge")) {
            return "Bills";
        }

        return "Other";
    }
}