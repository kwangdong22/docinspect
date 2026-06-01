# DocInspect API - Automated Document Mailroom

**Author:** Tony Ko  
**Role:** Candidate for Software Engineering Co-op (Spring 2026)

## 📌 System Architecture Overview
DocInspect is an automated, containerized pipeline designed to process, extract, and index metadata from PDF and DOCX files. 

The architecture is split into four distinct microservices communicating over a secure internal Docker network:
1. **Reverse Proxy (Caddy):** Handles incoming traffic on port 80 and routes to the API.
2. **The Front Desk (Node.js/TypeScript):** An Express API utilizing `routing-controllers`. It handles file ingestion, calculates SHA256 checksums, and manages the database cache to prevent redundant processing.
3. **The Analyst (Python/FastAPI):** An internal extraction service utilizing `PyMuPDF` and `python-docx` to crack open binary files, count tokens, and search for PII.
4. **The Filing Cabinet (PostgreSQL):** A relational database strictly storing metadata in indexed columns (avoiding raw JSON blobs) for high-speed querying.

## 🚀 Quick Start (Clean Clone)
To launch the entire infrastructure from scratch:

1. Clone the repository and navigate into the directory.
2. Create an `.env` file in the root directory (see `.env.example` for required variables).
3. Run the master build command:
```bash
docker compose up -d --build
