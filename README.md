# CreatorPulse

### A platform for content creators to manage and improve their content.

CreatorPulse is a full-stack web application built to bring useful content management and analysis tools together in one place.

The idea behind the project is simple: creating content involves more than just uploading it. Creators also need to organize their work, review their thumbnails, improve their titles and descriptions, and understand how their content can be presented more effectively.

CreatorPulse brings several of these activities together through a web-based platform.

---

## What can you do with CreatorPulse?

The application includes several components designed around common content creation tasks.

**User accounts**
- Register and log in securely.
- Authenticate requests using JWT.
- Manage user and creator profiles.

**Content management**
- Upload and store content.
- View uploaded content.
- Download and delete files.
- Manage stored content through the application.

**Thumbnail analysis**

CreatorPulse includes a separate Python service that uses OpenCV to examine thumbnail images.

Some of the techniques used include:
- Haar Cascade for face detection.
- Canny edge detection.
- Histogram analysis.
- Rule-of-thirds composition analysis.

**Text analysis and content suggestions**

The application also includes techniques that can help evaluate written content:

- TF-IDF for text analysis.
- Lexicon-based sentiment analysis.
- Flesch readability scoring.
- Rule-based title analysis.
- Hashtag ranking.

These techniques use text-processing, mathematical, and rule-based approaches rather than a machine-learning model.

**Other components**

The backend also contains functionality related to subscriptions, payments, social activity, and posting-time analysis.

---

## Built With

I used the following technologies to develop CreatorPulse.

| Area | Technology |
|---|---|
| Frontend | React, JavaScript, Vite |
| Backend | Java 17, Spring Boot |
| Database | MySQL |
| Security | Spring Security, JWT |
| Database access | Spring Data JPA, Hibernate |
| Image processing | Python, OpenCV |
| API communication | REST APIs |
| Build tool | Maven |

---

## How the Project Is Organized

The project is divided into a frontend, a backend, and a separate thumbnail-analysis service.

```text
CreatorPulse/
│
├── frontend/                  # React application
│   ├── public/
│   ├── src/
│   ├── package.json
│   └── vite.config.js
│
├── src/
│   └── main/
│       ├── java/              # Spring Boot backend
│       └── resources/         # Application configuration
│
├── microservices/
│   └── thumbnail-scorer/      # Python thumbnail analysis
│
├── pom.xml
├── start-backend.bat
├── .gitignore
└── README.md
```

---

## Running the Project Locally

To run CreatorPulse on your computer, you will need:

- Java JDK 17
- Apache Maven
- MySQL Server
- Node.js and npm
- Python 3 (for the thumbnail-analysis service)

### 1. Clone the repository

```bash
git clone https://github.com/Aakanksha-m12/CreatorPulse.git
cd CreatorPulse
```

### 2. Configure MySQL

Make sure your MySQL server is running.

The application uses a database named:

```text
contentcreator
```

Check `src/main/resources/application.properties` and configure your local database username and password.

Also configure the required environment variables for authentication and any external integrations you want to use. Never commit real passwords, API keys, or access tokens.

### 3. Start the backend

From the project root, run:

```bash
mvn spring-boot:run
```

On Windows, you can also use:

```cmd
start-backend.bat
```

The Spring Boot backend runs on port `8080` by default.

### 4. Start the frontend

Open another terminal and run:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the local development address in the terminal. Open that address in your browser.

### 5. Thumbnail-analysis service

The Python service is located inside:

```text
microservices/thumbnail-scorer/
```

Install its Python dependencies using the requirements file provided in that folder, then follow the service's startup configuration.

---

## A Note About the Project

CreatorPulse is a development project that brings together frontend development, backend programming, database management, authentication, REST APIs, and image-processing techniques.

Building it has been an opportunity to work with different technologies and understand how separate application components communicate with one another.

The project is still evolving, and some integrations may require additional local configuration.

---

## Developer

**Aakanksha M.**

GitHub: [Aakanksha-m12](https://github.com/Aakanksha-m12)

**Repository:** [CreatorPulse](https://github.com/Aakanksha-m12/CreatorPulse)