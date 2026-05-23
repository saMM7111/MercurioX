FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

# Copy all POMs first for layer caching
COPY pom.xml ./
COPY gateway/pom.xml gateway/pom.xml
COPY backend/pom.xml backend/pom.xml

# Install parent POM so backend can resolve it
RUN mvn -q install -N -DskipTests

# Pre-download backend dependencies
RUN mvn -q -pl backend dependency:go-offline

# Copy source and package
COPY backend/src backend/src
RUN mvn -q -pl backend clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/backend/target/*.jar /app/app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]