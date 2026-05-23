package com.northwind.common.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Component;

@Component
public class ProductCategoryValidator implements ConstraintValidator<ValidProductCategory, Integer> {

    @Override
    public boolean isValid(Integer value, ConstraintValidatorContext context) {
        if (value == null) {
            return true;
        }
        return isValidCategory(value);
    }

    @Cacheable("product-categories")
    public boolean isValidCategory(Integer categoryId) {
        // Placeholder: wire CategoryRepository once the category entity is added.
        return categoryId > 0;
    }
}
