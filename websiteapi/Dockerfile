# Imagem da API (Spring Boot 4 / Java 17) — build multi-stágio.
# Stage 1: compila e empacota o jar com o Maven Wrapper.
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copia o wrapper e o pom primeiro para aproveitar o cache de dependências.
COPY .mvn/ .mvn/
COPY mvnw pom.xml ./
RUN ./mvnw --batch-mode --no-transfer-progress dependency:go-offline

# Copia o código e empacota (testes já rodaram no estágio build-test da CI).
COPY src/ src/
RUN ./mvnw --batch-mode --no-transfer-progress clean package -DskipTests

# Stage 2: imagem de execução enxuta, só com o JRE.
FROM eclipse-temurin:17-jre AS runtime
WORKDIR /app

# Usuário sem privilégios.
RUN useradd --system --create-home --uid 1001 spring
USER spring

COPY --from=build /app/target/websiteapi-*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
