# Organic Fruits Java Backend

This is a Spring Boot migration of the Node.js backend.

## Requirements
- Java 21
- MongoDB (Running locally on port 27017 or provide MONGODB_URI)

## How to Run
Since Maven is not installed globally, you can:
1. Open this folder in **VS Code** (with the "Extension Pack for Java" installed). It will automatically detect the `pom.xml` and allow you to run the project.
2. Install Maven from [maven.apache.org](https://maven.apache.org/download.cgi).
3. Run using the command (once Maven is installed):
   ```bash
   mvn spring-boot:run
   ```

## Features Migrated
- **Authentication**: JWT-based login and registration (BCrypt hashing).
- **Products**: Full CRUD for product management.
- **Health**: System status endpoint.
- **Persistence**: MongoDB integration.
- **Models**: User, Product, Order, Note, Message.

## Configuration
Update `src/main/resources/application.properties` to change the port or database connection string.
