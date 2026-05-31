ControlMarcas - Attendance Control and Reporting System
Overview

ControlMarcas is a desktop application designed to automate employee attendance analysis, incident detection, and managerial reporting. The system processes clock-in and clock-out records from Excel files, identifies attendance irregularities, manages special schedules and justifications, and generates professional reports for Human Resources and administrative departments.

Built with React, Tauri, and SQLite, the application provides a lightweight, fast, and portable desktop solution that operates without requiring a dedicated server.

Features
Attendance Processing
Import attendance records from Excel files.
Employee schedule management.
Automatic attendance analysis by reporting period.
Support for multiple employees and schedules.
Incident Detection
Late arrivals detection.
Early departures detection.
Missing clock-in/clock-out records.
Unjustified absences.
Justified absences.
Special schedule management.
Automatic incident classification.
Report Generation
Editable attendance and incident reports.
Managerial summary reports.
Employee attendance balance calculations.
Daily attendance details.
Incident filtering and selection.
Report finalization and storage.
Export Options
PDF managerial reports.
DOCX attendance and justification reports.
Report history and retrieval.
Re-download previously generated reports.
Report Management
Report archive and history.
Report visualization.
Report deletion.
Report regeneration without reprocessing data.
Technologies
Frontend
React
JavaScript
Vite
SweetAlert2
Desktop Platform
Tauri
Database
SQLite
Data Processing
XLSX
jsPDF
jsPDF-AutoTable
DOCX
Database

The application uses a local SQLite database stored on the user's machine.

Main Tables
Employees
Schedules
Reports

The database is automatically created and managed by the application.

Architecture
Excel File
      │
      ▼
Attendance Processing
      │
      ▼
Incident Detection
      │
      ▼
Attendance Analysis
      │
      ▼
Managerial Summary
      │
      ▼
PDF / DOCX Generation
      │
      ▼
Report Storage
Installation

Clone the repository:

git clone https://github.com/JosiVP02/controlMarcasAsistencia.git

Install dependencies:

npm install

Run the application:

npm run tauri dev

Build the desktop application:

npm run tauri build
Key Benefits
Fully offline operation.
Portable local database.
Fast desktop performance.
Automated attendance analysis.
Professional report generation.
Reduced manual HR workload.
Easy deployment and maintenance.




















