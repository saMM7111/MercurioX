FROM maven:3.9.8-eclipse-temurin-21 AS build
WORKDIR /app

COPY pom.xml ./
COPY gateway/pom.xml gateway/pom.xml
COPY backend/pom.xml backend/pom.xml

RUN mvn -q install -N -DskipTests

# Cache the .m2 directory across builds
RUN --mount=type=cache,id=maven-gateway,target=/root/.m2 \
    mvn -q -pl gateway dependency:go-offline

COPY gateway/src gateway/src

RUN --mount=type=cache,id=maven-gateway,target=/root/.m2 \
    mvn -q -pl gateway clean package -DskipTests

FROM eclipse-temurin:21-jre
WORKDIR /app

COPY --from=build /app/gateway/target/*.jar /app/app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]