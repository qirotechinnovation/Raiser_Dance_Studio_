# Stage 1: Build
FROM eclipse-temurin:17-jdk-jammy AS build
WORKDIR /app

# Copy the current folder contents to the build directory
# Since this Dockerfile is inside Dance_Backend, we copy everything from here
COPY . /app/

# Ensure the Maven wrapper is executable
RUN chmod +x mvnw


RUN ./mvnw dependency:go-offline


RUN ./mvnw clean package -DskipTests

# Stage 2: Runtime
FROM eclipse-temurin:17-jre-jammy
WORKDIR /app

# Copy the built JAR from the build stage
# The path is relative to the WORKDIR in the build stage
COPY --from=build /app/target/studio-0.0.1-SNAPSHOT.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
