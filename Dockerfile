# Build stage
FROM openjdk:17-slim AS builder

WORKDIR /build

# Copy Java source files
COPY OrganicFruitsAPI.java .
COPY OrganicFruitsServer.java .

# Compile Java files
RUN javac OrganicFruitsAPI.java OrganicFruitsServer.java

---

# Runtime stage
FROM openjdk:17-slim

WORKDIR /app

# Copy compiled classes from builder
COPY --from=builder /build/*.class .

# Create non-root user for security
RUN useradd -m -u 1000 appuser && chown -R appuser:appuser /app
USER appuser

# Expose ports
EXPOSE 5000 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD java -version || exit 1

# Set environment variables
ENV PORT=5000
ENV MONGODB_URI=""
ENV NODE_ENV=production

# Run the Java API server
CMD ["java", "-Xmx256m", "-Xms128m", "OrganicFruitsAPI"]
