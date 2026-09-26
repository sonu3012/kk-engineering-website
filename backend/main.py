from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime
from sqlalchemy.orm import sessionmaker, declarative_base
from datetime import datetime, date
from pathlib import Path
import hashlib
import sqlite3
import uuid


# ==========================================
# DATABASE SETUP
# ==========================================

DATABASE_URL = "sqlite:///./kk_engineering.db"

engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

Base = declarative_base()


# ==========================================
# BASE DIRECTORY
# ==========================================

BASE_DIR = Path(__file__).resolve().parent


# ==========================================
# UPLOAD FOLDER SETUP
# ==========================================

UPLOAD_DIR = BASE_DIR / "uploads" / "projects"

UPLOAD_DIR.mkdir(
    parents=True,
    exist_ok=True
)


# ==========================================
# DATABASE MODELS
# ==========================================

class EnquiryDB(Base):
    __tablename__ = "enquiries"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(100),
        nullable=False
    )

    phone = Column(
        String(20),
        nullable=False
    )

    email = Column(
        String(150),
        nullable=False
    )

    requirement = Column(
        Text,
        nullable=False
    )

    status = Column(
        String(50),
        nullable=False,
        default="New"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


class AdminDB(Base):
    __tablename__ = "admins"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    email = Column(
        String(150),
        unique=True,
        nullable=False
    )

    password_hash = Column(
        String(255),
        nullable=False
    )


class ProjectDB(Base):
    __tablename__ = "projects"

    id = Column(
        Integer,
        primary_key=True,
        index=True
    )

    name = Column(
        String(200),
        nullable=False
    )

    location = Column(
        String(150),
        nullable=False
    )

    service = Column(
        String(200),
        nullable=False
    )

    description = Column(
        Text,
        nullable=False
    )

    image_url = Column(
        String(500),
        nullable=True
    )

    status = Column(
        String(50),
        nullable=False,
        default="Completed"
    )

    created_at = Column(
        DateTime,
        default=datetime.utcnow
    )


# ==========================================
# CREATE DATABASE TABLES
# ==========================================

Base.metadata.create_all(bind=engine)


# ==========================================
# DATABASE MIGRATION
# ==========================================
# Adds "status" column to existing enquiries
# table if it does not already exist.
# ==========================================

def ensure_enquiry_status_column():

    db_path = BASE_DIR / "kk_engineering.db"

    conn = sqlite3.connect(db_path)

    try:

        cursor = conn.cursor()

        cursor.execute(
            "PRAGMA table_info(enquiries)"
        )

        columns = [
            row[1]
            for row in cursor.fetchall()
        ]

        if "status" not in columns:

            cursor.execute(
                """
                ALTER TABLE enquiries
                ADD COLUMN status TEXT
                NOT NULL
                DEFAULT 'New'
                """
            )

            conn.commit()

            print(
                "Enquiry status column added successfully."
            )

    finally:

        conn.close()


ensure_enquiry_status_column()


# ==========================================
# FASTAPI APP
# ==========================================

app = FastAPI(
    title="KK Engineering API"
)


# ==========================================
# CORS
# ==========================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:3000",
        "https://kk-engineering-website-1.onrender.com",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]
)


# ==========================================
# SERVE UPLOADED IMAGES
# ==========================================

app.mount(
    "/uploads",
    StaticFiles(
        directory=str(
            BASE_DIR / "uploads"
        )
    ),
    name="uploads"
)


# ==========================================
# PYDANTIC MODELS
# ==========================================

class Enquiry(BaseModel):

    name: str

    phone: str

    email: str

    requirement: str


class EnquiryStatusUpdate(BaseModel):

    status: str


class AdminLogin(BaseModel):

    email: str

    password: str


class ProjectCreate(BaseModel):

    name: str

    location: str

    service: str

    description: str

    image_url: str = ""

    status: str = "Completed"


class ProjectUpdate(BaseModel):

    name: str

    location: str

    service: str

    description: str

    image_url: str = ""

    status: str = "Completed"


# ==========================================
# PASSWORD HASHING
# ==========================================

def hash_password(password: str) -> str:

    return hashlib.sha256(
        password.encode("utf-8")
    ).hexdigest()


# ==========================================
# HOME
# ==========================================

@app.get("/")
def home():

    return {
        "message": "KK Engineering Backend is running!"
    }


# ==========================================
# API TEST
# ==========================================

@app.get("/api/test")
def test_api():

    return {
        "success": True,
        "message": "KK Engineering API is working!"
    }


# ==========================================
# CREATE ENQUIRY
# ==========================================

@app.post("/api/enquiries")
def create_enquiry(
    enquiry: Enquiry
):

    db = SessionLocal()

    try:

        new_enquiry = EnquiryDB(

            name=enquiry.name,

            phone=enquiry.phone,

            email=enquiry.email,

            requirement=enquiry.requirement,

            status="New"
        )

        db.add(new_enquiry)

        db.commit()

        db.refresh(new_enquiry)

        return {

            "success": True,

            "message": "Enquiry saved successfully!",

            "data": {

                "id": new_enquiry.id,

                "name": new_enquiry.name,

                "phone": new_enquiry.phone,

                "email": new_enquiry.email,

                "requirement": new_enquiry.requirement,

                "status": new_enquiry.status,

                "created_at": new_enquiry.created_at
            }
        }

    finally:

        db.close()


# ==========================================
# GET ALL ENQUIRIES
# ==========================================

@app.get("/api/enquiries")
def get_enquiries():

    db = SessionLocal()

    try:

        enquiries = (

            db.query(EnquiryDB)

            .order_by(
                EnquiryDB.id.desc()
            )

            .all()
        )

        return {

            "success": True,

            "count": len(enquiries),

            "data": [

                {

                    "id": enquiry.id,

                    "name": enquiry.name,

                    "phone": enquiry.phone,

                    "email": enquiry.email,

                    "requirement": enquiry.requirement,

                    "status": enquiry.status,

                    "created_at": enquiry.created_at
                }

                for enquiry in enquiries
            ]
        }

    finally:

        db.close()


# ==========================================
# UPDATE ENQUIRY STATUS
# ==========================================

@app.put(
    "/api/enquiries/{enquiry_id}/status"
)
def update_enquiry_status(

    enquiry_id: int,

    update: EnquiryStatusUpdate

):

    db = SessionLocal()

    try:

        allowed_statuses = [

            "New",

            "Contacted",

            "Completed"

        ]

        if update.status not in allowed_statuses:

            return {

                "success": False,

                "message": (
                    "Invalid status. "
                    "Use New, Contacted or Completed."
                )
            }


        enquiry = (

            db.query(EnquiryDB)

            .filter(
                EnquiryDB.id == enquiry_id
            )

            .first()
        )


        if not enquiry:

            return {

                "success": False,

                "message": "Enquiry not found"
            }


        enquiry.status = update.status

        db.commit()

        db.refresh(enquiry)


        return {

            "success": True,

            "message": "Enquiry status updated successfully!",

            "data": {

                "id": enquiry.id,

                "status": enquiry.status
            }
        }

    finally:

        db.close()


# ==========================================
# DASHBOARD STATS
# ==========================================

@app.get("/api/dashboard/stats")
def get_dashboard_stats():

    db = SessionLocal()

    try:

        total_enquiries = (

            db.query(
                EnquiryDB
            ).count()
        )


        today = date.today()


        all_enquiries = (

            db.query(
                EnquiryDB
            ).all()
        )


        today_enquiries = 0


        for enquiry in all_enquiries:

            if enquiry.created_at:

                if (
                    enquiry.created_at.date()
                    == today
                ):

                    today_enquiries += 1


        new_enquiries = (

            db.query(
                EnquiryDB
            )

            .filter(
                EnquiryDB.status == "New"
            )

            .count()
        )


        contacted_enquiries = (

            db.query(
                EnquiryDB
            )

            .filter(
                EnquiryDB.status == "Contacted"
            )

            .count()
        )


        completed_enquiries = (

            db.query(
                EnquiryDB
            )

            .filter(
                EnquiryDB.status == "Completed"
            )

            .count()
        )


        recent_enquiries = (

            db.query(
                EnquiryDB
            )

            .order_by(
                EnquiryDB.id.desc()
            )

            .limit(5)

            .all()
        )


        return {

            "success": True,

            "stats": {

                "total_enquiries":
                    total_enquiries,

                "today_enquiries":
                    today_enquiries,

                "new_enquiries":
                    new_enquiries,

                "contacted_enquiries":
                    contacted_enquiries,

                "completed_enquiries":
                    completed_enquiries
            },

            "recent_enquiries": [

                {

                    "id": enquiry.id,

                    "name": enquiry.name,

                    "phone": enquiry.phone,

                    "email": enquiry.email,

                    "requirement":
                        enquiry.requirement,

                    "status":
                        enquiry.status,

                    "created_at":
                        enquiry.created_at
                }

                for enquiry
                in recent_enquiries
            ]
        }

    finally:

        db.close()


# ==========================================
# DELETE ENQUIRY
# ==========================================

@app.delete(
    "/api/enquiries/{enquiry_id}"
)
def delete_enquiry(
    enquiry_id: int
):

    db = SessionLocal()

    try:

        enquiry = (

            db.query(EnquiryDB)

            .filter(
                EnquiryDB.id == enquiry_id
            )

            .first()
        )


        if not enquiry:

            return {

                "success": False,

                "message": "Enquiry not found"
            }


        db.delete(enquiry)

        db.commit()


        return {

            "success": True,

            "message":
                "Enquiry deleted successfully"
        }

    finally:

        db.close()


# ==========================================
# PROJECTS - GET ALL
# ==========================================

@app.get("/api/projects")
def get_projects():

    db = SessionLocal()

    try:

        projects = (

            db.query(ProjectDB)

            .order_by(
                ProjectDB.id.desc()
            )

            .all()
        )


        return {

            "success": True,

            "count": len(projects),

            "data": [

                {

                    "id": project.id,

                    "name": project.name,

                    "location": project.location,

                    "service": project.service,

                    "description":
                        project.description,

                    "image_url":
                        project.image_url,

                    "status":
                        project.status,

                    "created_at":
                        project.created_at
                }

                for project
                in projects
            ]
        }

    finally:

        db.close()


# ==========================================
# PROJECT IMAGE UPLOAD
# ==========================================

@app.post(
    "/api/upload-project-image"
)
async def upload_project_image(

    file: UploadFile = File(...)

):

    allowed_extensions = {

        ".jpg",

        ".jpeg",

        ".png",

        ".webp"
    }


    if not file.filename:

        return {

            "success": False,

            "message":
                "Please select an image."
        }


    file_extension = (

        Path(
            file.filename
        ).suffix.lower()
    )


    if (
        file_extension
        not in allowed_extensions
    ):

        return {

            "success": False,

            "message":
                "Only JPG, JPEG, PNG and WEBP "
                "images are allowed."
        }


    contents = await file.read()


    max_size = (
        5 * 1024 * 1024
    )


    if len(contents) > max_size:

        return {

            "success": False,

            "message":
                "Image size must be less than 5 MB."
        }


    unique_filename = (

        f"{uuid.uuid4().hex}"
        f"{file_extension}"
    )


    file_path = (

        UPLOAD_DIR
        / unique_filename
    )


    with open(
        file_path,
        "wb"
    ) as buffer:

        buffer.write(contents)


    image_url = (

        f"/uploads/projects/"
        f"{unique_filename}"
    )


    return {

        "success": True,

        "message":
            "Project image uploaded successfully!",

        "image_url":
            image_url
    }


# ==========================================
# CREATE PROJECT
# ==========================================

@app.post("/api/projects")
def create_project(
    project: ProjectCreate
):

    db = SessionLocal()

    try:

        new_project = ProjectDB(

            name=project.name,

            location=project.location,

            service=project.service,

            description=project.description,

            image_url=project.image_url,

            status=project.status
        )


        db.add(new_project)

        db.commit()

        db.refresh(new_project)


        return {

            "success": True,

            "message":
                "Project created successfully!",

            "data": {

                "id": new_project.id,

                "name": new_project.name,

                "location":
                    new_project.location,

                "service":
                    new_project.service,

                "description":
                    new_project.description,

                "image_url":
                    new_project.image_url,

                "status":
                    new_project.status,

                "created_at":
                    new_project.created_at
            }
        }

    finally:

        db.close()


# ==========================================
# UPDATE PROJECT
# ==========================================

@app.put(
    "/api/projects/{project_id}"
)
def update_project(

    project_id: int,

    project: ProjectUpdate

):

    db = SessionLocal()

    try:

        existing_project = (

            db.query(ProjectDB)

            .filter(
                ProjectDB.id == project_id
            )

            .first()
        )


        if not existing_project:

            return {

                "success": False,

                "message":
                    "Project not found"
            }


        existing_project.name = (
            project.name
        )

        existing_project.location = (
            project.location
        )

        existing_project.service = (
            project.service
        )

        existing_project.description = (
            project.description
        )

        existing_project.image_url = (
            project.image_url
        )

        existing_project.status = (
            project.status
        )


        db.commit()

        db.refresh(
            existing_project
        )


        return {

            "success": True,

            "message":
                "Project updated successfully!",

            "data": {

                "id":
                    existing_project.id,

                "name":
                    existing_project.name,

                "location":
                    existing_project.location,

                "service":
                    existing_project.service,

                "description":
                    existing_project.description,

                "image_url":
                    existing_project.image_url,

                "status":
                    existing_project.status,

                "created_at":
                    existing_project.created_at
            }
        }

    finally:

        db.close()


# ==========================================
# DELETE PROJECT
# ==========================================

@app.delete(
    "/api/projects/{project_id}"
)
def delete_project(
    project_id: int
):

    db = SessionLocal()

    try:

        project = (

            db.query(ProjectDB)

            .filter(
                ProjectDB.id == project_id
            )

            .first()
        )


        if not project:

            return {

                "success": False,

                "message":
                    "Project not found"
            }


        db.delete(project)

        db.commit()


        return {

            "success": True,

            "message":
                "Project deleted successfully!"
        }

    finally:

        db.close()


# ==========================================
# DEFAULT ADMIN
# ==========================================

def create_default_admin():

    db = SessionLocal()

    try:

        email = (
            "admin@kkengineering.com"
        )

        password = (
            "KKAdmin@123"
        )

        password_hash = (
            hash_password(password)
        )


        existing_admin = (

            db.query(AdminDB)

            .filter(
                AdminDB.email == email
            )

            .first()
        )


        if existing_admin:

            existing_admin.password_hash = (
                password_hash
            )

            db.commit()


            print(
                "======================================"
            )

            print(
                "Admin account updated"
            )

            print(
                "Email:",
                email
            )

            print(
                "Password:",
                password
            )

            print(
                "======================================"
            )


        else:

            new_admin = AdminDB(

                email=email,

                password_hash=password_hash
            )


            db.add(new_admin)

            db.commit()


            print(
                "======================================"
            )

            print(
                "Default admin account created"
            )

            print(
                "Email:",
                email
            )

            print(
                "Password:",
                password
            )

            print(
                "======================================"
            )

    finally:

        db.close()


create_default_admin()


# ==========================================
# ADMIN LOGIN
# ==========================================

@app.post(
    "/api/admin/login"
)
def admin_login(
    login: AdminLogin
):

    db = SessionLocal()

    try:

        admin = (

            db.query(AdminDB)

            .filter(
                AdminDB.email
                == login.email
            )

            .first()
        )


        if not admin:

            return {

                "success": False,

                "message":
                    "Invalid email or password."
            }


        entered_password_hash = (

            hash_password(
                login.password
            )
        )


        if (
            admin.password_hash
            != entered_password_hash
        ):

            return {

                "success": False,

                "message":
                    "Invalid email or password."
            }


        return {

            "success": True,

            "message":
                "Login successful!",

            "admin": {

                "id":
                    admin.id,

                "email":
                    admin.email
            }
        }

    finally:

        db.close()

        
