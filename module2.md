🔵 MODULE 2 — ADMIN MANAGEMENT

(Everything the Admin can manage apart from authentication.)

This module includes:
	1.	Class / Section / Group Management
	2.	User Management (Expanded)
	3.	Bulk Operations
	4.	Admin Dashboard Functionalities
	5.	APIs and Functional Flows
	6.	Visual Flow Diagrams (Text-based)

We will build this exactly like Module 1 — fully detailed, then corrections, then move forward.

⸻

1️⃣ ADMIN MODULE — HIGH-LEVEL GOALS

The Admin should be able to:
	•	Manage classes, sections, groups, and academic structure.
	•	Manage students, teachers, and user statuses.
	•	Perform bulk operations (upload, disable, promote).
	•	View summary reports (user counts, class strength, recent activity).
	•	Control system parameters (competition rules, default settings).

⸻

2️⃣ ADMIN DASHBOARD — TEXT WIREFRAME (Updated Design)

+-----------------------------------------------------+
|                     ADMIN DASHBOARD                 |
+-----------------------------------------------------+
|  Users       |  Classes/Sections | Groups           |
|-----------------------------------------------------|
|  Bulk Upload |  Reports          | System Settings  |
+-----------------------------------------------------+
|  Recent Actions | Summary Cards (Students, Teachers)|
+-----------------------------------------------------+


⸻

3️⃣ MODULE 2 BREAKDOWN

A. CLASS & SECTION MANAGEMENT

Admin can:
	•	Create classes (e.g., Class 6, Class 7, etc.)
	•	Create sections inside each class (e.g., A, B, C)
	•	Edit class/section
	•	Activate/Deactivate class/section
	•	Assign students to class/section
	•	Bulk import class mappings (optional)

TEXT WIREFRAME

Classes & Sections
--------------------------------------------------------
| Class  | Section | Strength | Status | Actions       |
--------------------------------------------------------
| 6      | A       |    34    | Active | Edit / Disable|
| 6      | B       |    31    | Active | Edit / Disable|
| 7      | A       |    29    | Active | Edit / Disable|
--------------------------------------------------------
[ Add Class ]  [ Add Section ]


⸻

B. GROUP MANAGEMENT (Optional but common)

Groups may be used for:
	•	Competitions
	•	Batch learning
	•	Custom sets of students

Admin can:
	•	Create group
	•	Add/remove students
	•	Assign teacher to group (optional)
	•	Make group active/inactive

TEXT WIREFRAME

Groups
------------------------------------------------------------
| Group Name | Members | Created By | Status | Actions      |
------------------------------------------------------------
| Group 1    |   12    | Admin      | Active | Edit/Delete  |
| Top 10     |   10    | Teacher1   | Active | Edit/Delete  |
------------------------------------------------------------
[ Create Group ]


⸻

C. USER MANAGEMENT (Expanded from Module 1)

Admin can:
	•	View list of users
	•	Search by name/username/class
	•	Inline edit mobile, class, section
	•	Reset password
	•	Disable/Enable user
	•	Convert role (teacher <-> admin)
	•	Export users list (Excel)

TEXT WIREFRAME

Users List
---------------------------------------------------------------------
| Name     | Username | Role    | Class | Section | Mobile | Actions |
---------------------------------------------------------------------
| Arjun    | 23CS001  | Student |   9   |    B    | 98765  | Edit/Reset/Disable |
| Kavitha  | T002     | Teacher |   -   |    -    | 99887  | Edit/Reset/Disable |
---------------------------------------------------------------------
Filters: [Role] [Class] [Section] [Search]


⸻

D. BULK OPERATIONS

1. Bulk Create Users

(Already defined in Module 1)

2. Bulk Promote Students

Useful for year-end promotion.

Flow:

Admin → Bulk Promote
Select Current Class → Select Next Class  
System preview → Confirm → Promote All

3. Bulk Assign Section

Useful when rearranging classes.

4. Bulk Disable Users

For inactive students/teachers.

⸻

4️⃣ ADMIN MODULE — FUNCTIONAL FLOWS (TEXT DIAGRAMS)

⸻

A. CLASS CREATION FLOW

[Admin → Classes]
      |
      v
[Click "Add Class"]
      |
      v
[Enter Class Name]
      |
      v
[API: POST /admin/classes]
      |
      |-- Validate class name
      |-- Insert into DB
      |
      v
[Class Created Successfully]


⸻

B. SECTION CREATION FLOW

[Admin → Classes]
      |
      v
[Select Class → Add Section]
      |
      v
[Enter Section Name]
      |
      v
[API: POST /admin/classes/{id}/sections]


⸻

C. ASSIGN STUDENTS TO CLASS/SECTION

[Admin → Users → Select Student]
      |
      v
[Edit User Details]
      |
      v
[Set Class / Section fields]
      |
      v
[API: PUT /admin/users/{id}]


⸻

D. GROUP CREATION FLOW

[Admin → Groups]
      |
      v
[Create Group]
      |
      v
[Enter Group Name]
      |
      v
[API: POST /admin/groups]
      |
      v
[Group Created → Now Assign Students]


⸻

E. BULK UPLOAD FLOW (Admin)

[Download Template]
      |
      v
[Fill Excel]
      |
      v
[Upload]
      |
      v
API: POST /admin/users/bulk-upload
      |
      |-- Validation
      |-- Create users
      |-- If errors → Error file


⸻

5️⃣ APIs FOR MODULE 2

⸻

A. Class/Section APIs
	•	POST /admin/classes
	•	GET /admin/classes
	•	PUT /admin/classes/{id}
	•	POST /admin/classes/{id}/sections
	•	GET /admin/classes/{id}/sections
	•	PUT /admin/sections/{id}

⸻

B. Group APIs
	•	POST /admin/groups
	•	GET /admin/groups
	•	PUT /admin/groups/{id}
	•	POST /admin/groups/{id}/members
	•	DELETE /admin/groups/{id}/members/{studentId}

⸻

C. User Management APIs (More detailed)
	•	GET /admin/users
	•	POST /admin/users
	•	PUT /admin/users/{id}
	•	POST /admin/users/{id}/reset-password
	•	PUT /admin/users/{id}/status
	•	POST /admin/users/bulk-upload
	•	POST /admin/users/bulk-promote

⸻

6️⃣ DATABASE TABLES (MODULE 2)

A. classes

| id | class_name | status |

B. sections

| id | class_id | section_name | status |

C. groups

| id | group_name | created_by | status |

D. group_members

| id | group_id | user_id |

Updates to users table:
	•	Add columns: class_id, section_id, gender, parent_mobile

Great — proceeding to Module 2: Admin Management Module in full detail.

⸻

✅ MODULE 2 — ADMIN MANAGEMENT MODULE

This module is used only by admin (via route: /admin).

We will cover:
	1.	Functional scope
	2.	UI screens
	3.	Flow diagrams
	4.	Database schema
	5.	API endpoints
	6.	Validation rules
	7.	Notes & Assumptions

⸻

1️⃣ Functional Scope

The Admin can manage:

A. User Management
	•	Create single user (inline Excel-like row editor)
	•	Bulk user creation (upload template with data)
	•	Download template format
	•	Search users
	•	Edit user
	•	Delete user
	•	Reset password
	•	Activate/Deactivate user

B. Optional Metadata
	•	Student:
	•	Class/Grade
	•	Section
	•	Roll number
	•	Teacher:
	•	Department / Subject handled

C. Role-based Views

Admin sees all users
Teachers see only their own students (later)
Students see only their profile

⸻

2️⃣ UI SCREENS

2.1 Admin Dashboard (/admin)

Minimal clean menu:
	•	User Management
	•	Reports (later)
	•	System Settings (later)

2.2 User List Page

Columns:
	•	User ID
	•	Name
	•	Role (Student/Teacher/Admin)
	•	Class/Section (for students)
	•	Phone Number
	•	Status (Active/Inactive)
	•	Actions: View | Edit | Reset Password | Delete

Top Actions:
	•	“Create User (Inline)”
	•	“Bulk Upload”
	•	Search Box
	•	Filters:
	•	Role
	•	Class
	•	Status

⸻

2.3 CREATE USER — INLINE EXCEL-LIKE UI

UI looks like a small spreadsheet:

Name	Role	Username	Phone	Class	Section	Password	Save
[text]	[dropdown]	[text]	[text]	[text]	[text]	[auto-generate]	[✓]

Features:
	•	Tab navigation between fields
	•	Auto-fill username from name + class + roll
	•	Auto-generate password (visible to admin)
	•	Show validation errors inline

⸻

2.4 BULK USER UPLOAD

Steps:
	1.	Click Download Template
	2.	Admin fills Excel with:
	•	Name
	•	Role
	•	Username
	•	Phone
	•	Class
	•	Section
	•	Optional fields
	3.	Upload file
	4.	System validates file
	5.	Show preview table with errors highlighted
	6.	Admin clicks “Confirm Upload”

⸻

3️⃣ FLOW DIAGRAMS (Text-Based)

⸻

3.1 USER CREATION FLOW

Admin → User List Page
        |
        v
  Click "Create User"
        |
        v
 Excel-like Inline Entry
        |
        v
Validate fields → Errors? → Fix → Save
        |
        v
User Saved → Success Toast


⸻

3.2 BULK UPLOAD FLOW

Admin → Bulk Upload
        |
        v
Download Template → Fill Values → Upload File
        |
        v
System reads Excel
        |
        v
Validate each row
        |
     Errors?
     /     \
    Yes     No
    |        |
Show row    |
errors      |
    |        |
Admin fixes  |
re-uploads ← |
             |
             v
         Confirm Upload
             |
             v
        Save All Users
             |
             v
      Success → Show Summary


⸻

3.3 PASSWORD RESET FLOW

Admin → User List
        |
        v
Click "Reset Password"
        |
        v
Show Popup with:
  - Auto-generated password
  - Option to send SMS
        |
        v
Admin Confirms → Password Updated


⸻

3.4 USER LOGIN VIA OTP FLOW

User → Login Page
        |
        v
Enter Username
        |
        v
System sends OTP to registered phone
        |
        v
User enters OTP
        |
  OTP Valid? ---- No → Error Message
        |
       Yes
        |
        v
User Login Successful → Redirect to Role Dashboard


⸻

4️⃣ DATABASE SCHEMA (FINAL)

Table: users

Field	Type	Notes
id	PK	UUID/Auto ID
name	varchar	
username	varchar(unique)	Roll number or custom
role	enum(student,teacher,admin)	
password_hash	varchar	(hashed)
phone	varchar	Required
class	varchar	student only
section	varchar	student only
department	varchar	teacher only
subject	varchar	teacher only
is_active	boolean	default true
created_at	timestamp	
updated_at	timestamp	

Table: bulk_upload_logs

Field	Type	Notes
id	PK	
file_name	varchar	
total_rows	int	
success_count	int	
error_count	int	
uploaded_by	FK users.id	
created_at	timestamp	


⸻

5️⃣ API ENDPOINTS

User Management

POST /admin/users
GET  /admin/users
GET  /admin/users/{id}
PUT  /admin/users/{id}
DELETE /admin/users/{id}
POST /admin/users/{id}/reset-password

Bulk Upload

POST /admin/users/bulk-upload
GET  /admin/users/bulk-template


⸻

6️⃣ VALIDATION RULES

Name
	•	required
	•	alphabet only

Username
	•	required
	•	unique
	•	alphanumeric

Phone
	•	must be valid 10-digit mobile
	•	OTP required for login

Class/Section
	•	required for students
	•	optional for teachers/admin

Role
	•	must be one of: student, teacher, admin

Bulk Upload
	•	Template must match column structure
	•	All invalid rows must be flagged
	•	No partial save

⸻

7️⃣ NOTES & ASSUMPTIONS
	•	OTP provider will be handled later
	•	Password is hashed always
	•	Username auto-fill logic can be customized
	•	Admin is the only role that can create or delete users

⸻