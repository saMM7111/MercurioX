FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
COPY gateway/pom.xml gateway/pom.xml
COPY backend/pom.xml backend/pom.xml

RUN mvn -q -pl backend -am dependency:go-offline

COPY backend/src backend/src
RUN mvn -q -pl backend -am package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/backend/target/*.jar /app/app.jar

EXPOSE 8081
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
