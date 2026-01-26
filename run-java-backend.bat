@echo off
set JAVA_HOME=C:\Program Files\Java\jdk-21
set PATH=%JAVA_HOME%\bin;%PATH%
cd backend-java
.\apache-maven-3.9.6\bin\mvn.cmd spring-boot:run
pause

<!--The Java Spring Boot backend is now running and serving the frontend directly.

URL: http://localhost:5000
API Health: http://localhost:5000/api/health
Products API: http://localhost:5000/api/products


🛠️ What I Did:
Analyzed the Architecture: Identified that the Java backend (running on port 5000) is configured to serve static files from the frontend directory.
Started the Backend: Executed the 

.\run-java-backend.bat 

 script, which uses the bundled Apache Maven to run the Spring Boot application.
Verified Status:
Confirmed port 5000 is listening.
Verified the backend health check returns a "running" status.
Verified that the frontend 
index.html
 and product data are being served correctly.
📝 Notes:
MongoDB: The backend is currently defaulting to mongodb://localhost:27017/organicfruits. If you plan to use MongoDB Atlas, make sure to update the MONGODB_URI environment variable or the 
backend-java/src/main/resources/application.properties
 file as described in the 
README.md
.
-->