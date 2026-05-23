package com.northwind.common.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

@Target({ElementType.FIELD, ElementType.PARAMETER})
@Retention(RetentionPolicy.RUNTIME)
@Constraint(validatedBy = ProductCategoryValidator.class)
public @interface ValidProductCategory {
    String message() default "Invalid product category";
    Class<?>[] groups() default {};
    Class<? extends Payload>[] payload() default {};
}
