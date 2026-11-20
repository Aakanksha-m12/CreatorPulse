# CreatorPulse – Content Creator Growth Platform

CreatorPulse is a content creator platform designed to help creators manage their content and access tools for content analysis and optimization.

The project combines a React frontend, a Java Spring Boot backend, MySQL database integration, and a Python-based thumbnail analysis microservice.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, JavaScript |
| Backend | Java 17, Spring Boot |
| Security | Spring Security, JWT |
| Database | MySQL |
| ORM | Spring Data JPA, Hibernate |
| Microservice | Python, OpenCV |
| Build Tool | Maven |
| API Communication | REST |

## Main Components

### 1. Backend and Authentication
- User registration and login
- JWT-based authentication
- Spring Security integration
- REST API development
- User and creator profile management

### 2. Content Management
- Content upload
- Content listing
- Content download
- Content deletion
- File storage management

### 3. Thumbnail Analysis
The project includes a Python microservice for thumbnail analysis using OpenCV.

Image-processing techniques include:
- Haar Cascade
- Canny edge detection
- Histogram analysis
- Rule-of-thirds composition analysis

The Java backend communicates with the microservice and provides a fallback mechanism.

### 4. Content Optimization
The project includes text-analysis and recommendation techniques such as:
- TF-IDF
- Lexicon-based sentiment analysis
- Flesch readability analysis
- Rule-based title analysis
- Hashtag ranking

### 5. Additional Platform Components
The backend also contains subscription, payment, social activity, and posting-time-related components.

## Project Structure

```text
CreatorPulse/
│
├── frontend/
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── microservices/
│   └── thumbnail-scorer/
│
├── src/
│   └── main/
│       ├── java/
│       └── resources/
│
├── pom.xml
├── start-backend.bat
├── .gitignore
└── README.md
```

## Prerequisites

Install the following before running the project:

- Java JDK 17
- Apache Maven
- MySQL
- Node.js and npm
- Python 3 (for the thumbnail analysis microservice)

## Running the Project

### 1. Start MySQL

Make sure your MySQL server is running.

The application uses the database:

```text
contentcreator
```

Configure database credentials using your local application configuration.

### 2. Start the Backend

From the project root:

```bash
mvn spring-boot:run
```

Alternatively, on Windows:

```cmd
start-backend.bat
```

### 3. Start the Frontend

Open another terminal:

```bash
cd frontend
npm install
npm run dev
```

Open the local development URL displayed by Vite.

### 4. Thumbnail Microservice

The thumbnail scorer is located inside:

```text
microservices/thumbnail-scorer/
```

Refer to its application requirements before starting the service.

## Security Notes

- Never commit API keys, passwords, access tokens, or private configuration files.
- Use environment variables for sensitive credentials.
- Do not upload personal user files or uploaded content.
- Use separate development and production configurations.

## Project Status

CreatorPulse is a development project. Features and integrations may require additional configuration depending on the local environment.

## Author

Developed as a software development project.