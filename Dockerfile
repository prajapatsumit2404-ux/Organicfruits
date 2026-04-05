# Dockerfile for Java Spring Boot Backend
FROM eclipse-temurin:21-jdk

WORKDIR /app

# Copy Maven and project files
COPY backend-java/apache-maven-3.9.6 /app/apache-maven-3.9.6
COPY backend-java/pom.xml /app/pom.xml
COPY backend-java/src /app/src

# Build the application
RUN /app/apache-maven-3.9.6/bin/mvn clean package -DskipTests

# Run the application
EXPOSE 5000
CMD ["/app/apache-maven-3.9.6/bin/mvn", "spring-boot:run"]
