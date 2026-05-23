FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
COPY gateway/pom.xml gateway/pom.xml
COPY backend/pom.xml backend/pom.xml

RUN mvn -q install -N -DskipTests

RUN mvn -q -pl gateway dependency:go-offline

COPY gateway/src gateway/src
RUN mvn -q -pl gateway clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/gateway/target/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]