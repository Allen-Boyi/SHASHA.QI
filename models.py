from datetime import datetime,timezone 
from flask_sqlalchemy import SQLAlchemy
from enum import Enum

db=SQLAlchemy()
class User(db.Model):
    __tablename__='users'
    user_id=db.Column(db.Integer,primary_key=True)
    username=db.Column(db.String(50),unique=True,nullable=False)
    email=db.Column(db.String(50),unique=True,nullable=False)
    phone=db.Column(db.String(20),nullable=True)
    user_password=db.Column(db.String(255),nullable=False)
    jid=db.Column(db.String(20),nullable=True)
    role_id=db.Column(db.Integer,db.ForeignKey('roles.role_id'),nullable=False)
    is_confirmed=db.Column(db.Boolean,default=False,nullable=False)
    confirm_token=db.Column(db.String(255),nullable=True)
    reset_token=db.Column(db.String(255),nullable=True)
    token_expiry=db.Column(db.DateTime,nullable=True)
    created_at=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    confirm_token_expires=db.Column(db.DateTime,nullable=True)
    is_active=db.Column(db.Boolean,default=False)
    role=db.relationship('Role',foreign_keys=[role_id],back_populates='users')
    uploaded_resources=db.relationship("Resource",foreign_keys="[Resource.uploaded_by]",
                                       back_populates="Rusers")
    alerts_users=db.relationship("Alert",foreign_keys="[Alert.user_id]",back_populates="users")
    sync_logs = db.relationship("Sync_log", foreign_keys="[Sync_log.triggered_by]",
                             back_populates="triggered_user")
    def __repr__(self):
        return f"<User{self.username}>"
    
class Sync_log(db.Model):
    __tablename__ = "sync_log"
    sync_id       = db.Column(db.Integer,  primary_key=True)
    synced_at     = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    files_synced  = db.Column(db.Integer,  nullable=False, default=0)
    files_skipped = db.Column(db.Integer,  nullable=False, default=0)
    files_failed  = db.Column(db.Integer,  nullable=False, default=0)
    triggered_by  = db.Column(db.Integer,  db.ForeignKey("users.user_id",
                              ondelete="SET NULL", onupdate="CASCADE"), nullable=True)
    notes         = db.Column(db.Text,     nullable=True)

    triggered_user = db.relationship("User", foreign_keys=[triggered_by],
                                     back_populates="sync_logs")

    def __repr__(self):
        return f"<Sync_log {self.sync_id} — synced_at={self.synced_at}, files_synced={self.files_synced}>"

class Role(db.Model):
    __tablename__='roles'
    role_id=db.Column(db.Integer,primary_key=True)
    role_name=db.Column(db.String(30),nullable=False)
    role_description=db.Column(db.Text,nullable=True)
    created_at=db.Column(db.DateTime,nullable=False,default=datetime.utcnow)
    users=db.relationship("User",foreign_keys="[User.role_id]",back_populates="role")
    roles=db.relationship("RolePermission",foreign_keys="[RolePermission.role_id]",back_populates="Rrole")
    def __repr__(self):
        return f"<Role{self.role_name}>"
    
class Resource_type(db.Model):
    __tablename__="resource_type"
    resource_type_id=db.Column(db.Integer,primary_key=True)
    resource_name=db.Column(db.String(50),nullable=False)
    resources=db.relationship("Resource",foreign_keys="[Resource.resource_type_id]",back_populates="ResourceTypes")
    def __repr__(self):
        return f"<Resource_type{self.resource_name}>"

class ZimProvince(str, Enum):
    HARARE = "Harare"
    BULAWAYO = "Bulawayo"
    MANICALAND = "Manicaland"
    MASH_CENTRAL = "Mashonaland Central"
    MASH_EAST = "Mashonaland East"
    MASH_WEST = "Mashonaland West"
    MASVINGO = "Masvingo"
    MAT_NORTH = "Matabeleland North"
    MAT_SOUTH = "Matabeleland South"
    MIDLANDS = "Midlands"

class Whatsappbot_user(db.Model):
    __tablename__ = 'whatsappbot_users'
    
    wuser_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    # Expanded length safely to 50 to accept international JIDs without string truncation
    jid = db.Column(db.String(50), unique=True, nullable=False)
    username = db.Column(db.String(50), nullable=True)
    email = db.Column(db.String(80), nullable=True)
    
    # 🌟 Academic Profile Context & Core Specialization Arrays
    current_level_id = db.Column(db.Integer, db.ForeignKey('level.level_id', ondelete='SET NULL', onupdate='CASCADE'), nullable=True)
    school = db.Column(db.String(120), nullable=True)
    syllabus_preference = db.Column(db.Enum('ZIMSEC', 'Cambridge'), nullable=False, default='ZIMSEC')
    # models.py
    province = db.Column( db.Enum(ZimProvince, values_callable=lambda x: [e.value for e in x]), nullable=True )
    
    # 🌟 Conversational State Machine Telemetry 
    current_state = db.Column(db.String(50), nullable=False, default='MAIN_MENU')
    state_context = db.Column(db.Text, nullable=True)
    
    # 🌟 Financial Balance Tiers & Campaign Management
    credits = db.Column(db.Integer, nullable=False, default=200)
    max_credits = db.Column(db.Integer, nullable=False, default=200)
    account_tier = db.Column(db.Enum('Free', 'Premium', 'Teacher'), nullable=False, default='Free')
    tier_expiry = db.Column(db.DateTime, nullable=True)
    referral_code = db.Column(db.String(15), unique=True, nullable=True)
    ref_id = db.Column(db.String(50), index=True, nullable=True) # Indexed for marketing dashboard ROI queries
    
    # Asset Usage Tracking Counters
    download_counts = db.Column(db.Integer, default=0)
    view_counts = db.Column(db.Integer, default=0)
    last_reset = db.Column(db.Date, nullable=True) # Adjusted to date layout for clean window boundaries
    
    # 🌟 Legal Consent & Opt-In Subscription Flags
    agree_terms = db.Column(db.Boolean, nullable=False, default=False)
    subscribe_news_and_alerts = db.Column(db.Boolean, nullable=False, default=True)
    
    # 🌟 Anti-Spam Abuse Layer Monitoring & Timing Triggers
    status = db.Column(db.Enum('Active', 'Inactive', 'Banned', 'Pending'), nullable=False, default='Active')
    is_flagged = db.Column(db.Boolean, nullable=False, default=False)
    last_active = db.Column(db.DateTime, nullable=True)
    last_message_at = db.Column(db.DateTime, nullable=True)
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    
    # Relationships point here
    wuser_activity = db.relationship('Wuser_activity', back_populates='whatsappbot_user', cascade="all, delete-orphan")
    usage_stats = db.relationship('Usage_stat', back_populates='whatsappbot_user', cascade="all, delete-orphan")
    ai_queries = db.relationship("Ai_Query", foreign_keys="[Ai_Query.wuser_id]", back_populates="wusers", cascade="all, delete-orphan")
    
    # Relationship pulling metadata properties from Level model safely
    academic_level = db.relationship("Level", foreign_keys=[current_level_id])

    def __repr__(self):
        return f"<Whatsappbot_user {self.jid} username={self.username}>"
    
class  Wuser_activity(db.Model):
    __tablename__="wuser_activity"
    activity_id=db.Column(db.Integer,nullable=False,primary_key=True)
    wuser_id=db.Column(db.Integer,db.ForeignKey("whatsappbot_users.wuser_id"),nullable=True)
    resource_id=db.Column(db.Integer,db.ForeignKey('resource.resource_id'),nullable=True)
    action_type=db.Column(db.String,nullable=True)
    created_at=db.Column(db.DateTime,nullable=False)
    resources=db.relationship("Resource",foreign_keys=[resource_id],back_populates='wuser_activity')
    whatsappbot_user=db.relationship("Whatsappbot_user",back_populates="wuser_activity")
    def __repr__(self):
        return f"<Wuser_activity{self.activity_id},action_type={self.action_type}>"

class Usage_stat(db.Model):
    """docstring for Usage_stat."""
    __tablename__='usage_stats'
    usage_id=db.Column(db.Integer,primary_key=True)
    wuser_id=db.Column(db.Integer,db.ForeignKey("whatsappbot_users.wuser_id"),nullable=False)
    usage_year=db.Column(db.Integer,nullable=True)
    usage_month=db.Column(db.SmallInteger,nullable=False)
    total_tokens=db.Column(db.Integer,nullable=False,default=0)
    total_queries=db.Column(db.Integer,nullable=False,default=0)
    created_at=db.Column(db.DateTime,nullable=False)
    whatsappbot_user=db.relationship("Whatsappbot_user",back_populates='usage_stats')
    def __repr__(self):
       return f"<Usage_stat{self.usage_id}>"
   
class Ai_Query(db.Model):
    __tablename__="ai_queries"
    query_id=db.Column(db.Integer,primary_key=True)
    wuser_id=db.Column(db.Integer,db.ForeignKey('whatsappbot_users.wuser_id'),nullable=False)
    tokens_used=db.Column(db.Integer,nullable=True)
    model_name=db.Column(db.String(50),nullable=True)
    query_text=db.Column(db.Text,nullable=True)
    created_at=db.Column(db.DateTime,nullable=False)
    wusers=db.relationship("Whatsappbot_user",foreign_keys=[wuser_id],back_populates="ai_queries")
    def __repr__(self):
        return f"<Ai_Query{self.query_id}>"
    
class Alert(db.Model):
    __tablename__="alerts"
    alerts_id=db.Column(db.Integer,primary_key=True)
    alert_source=db.Column(db.String(50),nullable=True)
    alert_type=db.Column(db.String(40),nullable=True)
    message=db.Column(db.Text,nullable=True)
    created_at=db.Column(db.DateTime,nullable=False)
    is_resolved=db.Column(db.Boolean,nullable=False,default=False,server_default="0")
    resolved_at=db.Column(db.DateTime,nullable=True)
    user_id=db.Column(db.Integer,db.ForeignKey("users.user_id"),nullable=False)
    users=db.relationship("User",foreign_keys=[user_id],back_populates='alerts_users')
    def __repr__(self):
        return f"<Alert{self.alerts_id},message={self.message}>"
    
class SubjectCategory(db.Model):
    __tablename__ = "subject_category"
    category_id   = db.Column(db.Integer, primary_key=True)
    category_name = db.Column(db.String(50), nullable=False)

    subjects = db.relationship("Subject",
                               foreign_keys="[Subject.category_id]",
                               back_populates="categories")

    def __repr__(self):
        return f"<SubjectCategory {self.category_id}, Category_Name={self.category_name}>"  # ← fixed typo


class Subject(db.Model):
    __tablename__  = "subjects"
    sub_id         = db.Column(db.Integer, primary_key=True)
    category_id    = db.Column(db.Integer, db.ForeignKey("subject_category.category_id"), nullable=False)
    subject_name   = db.Column(db.String(50), nullable=False)
    subject_Type   = db.Column(db.String(50), nullable=False)
    syllabus_board = db.Column(
                        db.Enum("ZIMSEC", "Cambridge", "Cambridge(GCSE)", "HEXCO"),
                        default="ZIMSEC", server_default="ZIMSEC", nullable=False
                    )
    subject_code   = db.Column(db.String(10), nullable=False)
    level_id       = db.Column(db.Integer, db.ForeignKey("level.level_id"), nullable=False)
    
    # ── Add the missing status column here
    status         = db.Column(
                        db.Enum("Active", "Locked", "Maintenance"), 
                        default="Active", server_default="Active", nullable=False
                    )

    # ── Your existing working relationships preserved exactly
    subjectsLevel = db.relationship("Level",
                                    foreign_keys=[level_id],
                                    back_populates="subjects")
    categories    = db.relationship("SubjectCategory",
                                    foreign_keys=[category_id],
                                    back_populates="subjects")
    resources     = db.relationship("Resource",
                                    foreign_keys="[Resource.sub_id]",
                                    back_populates="Rsubject")

    # ── Add relationship to WhatsappCommunity
    whatsapp_groups = db.relationship("WhatsappCommunity", foreign_keys="[WhatsappCommunity.sub_id]")

    def __repr__(self):
        return f"<Subject {self.subject_code}, subject_name={self.subject_name}>"
    
class Level(db.Model):
    __tablename__ = "level"
    
    level_id = db.Column(db.Integer, primary_key=True)
    level_name = db.Column(db.String(30), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False)

    # ── Existing relationships ──
    resources = db.relationship("Resource", foreign_keys="[Resource.level_id]", back_populates="Rlevel")
    subjects = db.relationship("Subject", foreign_keys="[Subject.level_id]", back_populates="subjectsLevel")
    whatsapp_groups = db.relationship("WhatsappCommunity", foreign_keys="[WhatsappCommunity.level_id]")

    # ── ADD THIS: Back-populates link to Whatsappbot_user ──
    bot_users = db.relationship(
        "Whatsappbot_user", 
        foreign_keys="[Whatsappbot_user.current_level_id]", 
        back_populates="academic_level"
    )

    def __repr__(self):
        return f"<Level {self.level_id}, levelname={self.level_name}>"
    
class Question_Paper(db.Model):
    __tablename__ = "question_paper"
    
    paper_id = db.Column(db.Integer, primary_key=True)
    # This now links ANY exam asset (QP or MS) to its metadata slot
    resource_id = db.Column(db.Integer, db.ForeignKey('resource.resource_id', ondelete='CASCADE'), nullable=False)
    
    session = db.Column(db.Enum('June', 'November'), default="November", server_default="November", nullable=False)
    year = db.Column(db.String(4), nullable=True)
    paper_number = db.Column(db.Enum("Paper 1", "Paper 2", "Paper 3", "Paper 4", "Paper 5"), nullable=False)
    is_specimen = db.Column(db.Boolean, nullable=False, default=False, server_default="0")
    created_at = db.Column(db.DateTime, nullable=False, default=datetime.utcnow)
    
    # Simple, direct relation to the parent Resource
    resource = db.relationship("Resource", foreign_keys=[resource_id], back_populates="exam_metadata")

    def __repr__(self):
        return f"<Question_Paper {self.paper_id}, resource_id={self.resource_id}, {self.year} {self.session} {self.paper_number}>"
    
class WhatsappCommunity(db.Model):
    __tablename__ = 'whatsapp_community'

    group_id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    group_name = db.Column(db.String(100), nullable=False)
    group_type = db.Column(db.String(50), nullable=False)  # 'scholarship', 'community', or 'study_group'
    invite_link = db.Column(db.String(255), nullable=False)
    admin_name = db.Column(db.String(100), nullable=True)
    
    # Structural Context Keys
    level_id = db.Column(db.Integer, db.ForeignKey('level.level_id', ondelete='SET NULL', onupdate='CASCADE'), nullable=True)
    sub_id = db.Column(db.Integer, db.ForeignKey('subjects.sub_id', ondelete='SET NULL', onupdate='CASCADE'), nullable=True)
    
    # Community Lifecycle Management
    status = db.Column(db.String(20), nullable=False, default='active', server_default='active')
    created_at = db.Column(db.DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))

    # Composite Index Definition matching idx_group_lookup
    __table_args__ = (
        db.Index('idx_group_lookup', 'group_type', 'level_id', 'sub_id', 'status'),
    )

    # Relationships
    group_level = db.relationship("Level", foreign_keys=[level_id])
    group_subject = db.relationship("Subject", foreign_keys=[sub_id])

    def __repr__(self):
        return f"<WhatsappCommunity {self.group_id}, group_name={self.group_name}, type={self.group_type}>"

class Resource(db.Model):
    __tablename__ = "resource"
    
    resource_id = db.Column(db.Integer, primary_key=True)
    resource_type_id = db.Column(db.Integer, db.ForeignKey("resource_type.resource_type_id"), nullable=False)
    title = db.Column(db.String(100), nullable=False) # Will act as placeholder on parsing failures
    description = db.Column(db.String(200), nullable=True)
    gdrive_file_id = db.Column(db.String(100), nullable=True)
    gdrive_view_url = db.Column(db.String(300), nullable=True) 
    gdrive_download_url = db.Column(db.String(300), nullable=True)
    gdrive_folder_id = db.Column(db.String(100), nullable=True) 
    file_size = db.Column(db.String(15), nullable=True)
    file_type = db.Column(db.String(20), nullable=True)
    cover_image = db.Column(db.String(250), nullable=True)
    download_count = db.Column(db.Integer, nullable=False, default=0)
    view_count = db.Column(db.Integer, nullable=False, default=0)
    author = db.Column(db.String(50), nullable=True)
    
    # Structural context constraints (These remain safe because folder metadata provides them!)
    sub_id = db.Column(db.Integer, db.ForeignKey("subjects.sub_id"), nullable=False)
    level_id = db.Column(db.Integer, db.ForeignKey("level.level_id"), nullable=False)
    
    # 🌟 FIXED: Changed to nullable=True so admin account deletions don't crash MySQL constraints
    uploaded_by = db.Column(db.Integer, db.ForeignKey("users.user_id"), nullable=True)
    uploaded_at = db.Column(db.DateTime, nullable=False, server_default=db.func.now())
    
    # =========================================================================
    # 🌟 SINGLE-TABLE INTEGRATION TRACKING EXTENSIONS
    # =========================================================================
    # Added 'Needs_Review' to separate structural data failures from routine 'Pending' files
    status = db.Column(
        db.Enum("Approved", "Locked", "Unlocked", "Pending", "Needs_Review"), 
        default="Pending", 
        server_default="Pending", 
        nullable=False
    )
    review_reason = db.Column(db.String(255), nullable=True)
    parser_confidence = db.Column(db.Enum("high", "low"), nullable=True)
    
    # Relations
    ResourceTypes = db.relationship("Resource_type", foreign_keys=[resource_type_id], back_populates="resources")
    Rlevel = db.relationship("Level", foreign_keys=[level_id], back_populates="resources")
    Rsubject = db.relationship("Subject", foreign_keys=[sub_id], back_populates="resources")
    Rusers = db.relationship("User", foreign_keys=[uploaded_by], back_populates="uploaded_resources")
    wuser_activity = db.relationship("Wuser_activity", foreign_keys="[Wuser_activity.resource_id]", back_populates="resources")
    exam_metadata = db.relationship("Question_Paper", foreign_keys="[Question_Paper.resource_id]", back_populates="resource", uselist=False, cascade="all, delete-orphan", passive_deletes=True)

    # =========================================================================
    # 🌟 SECURITY GUARDRAIL METHOD
    # =========================================================================
    @classmethod
    def visible_query(cls):
        """
        Canonical student scope. Protects users from files that are locked,
        awaiting routine review, or missing data structures entirely.
        """
        return cls.query.filter(cls.status.in_(["Approved", "Unlocked"]))

    def __repr__(self):
        return f"<Resource {self.resource_id}, name={self.title}, type={self.resource_type_id}>"
        
    def to_dict(self):
        return {
            "resource_id":        self.resource_id,
            "title":              self.title,
            "description":        self.description,
            "downloads":          self.download_count,
            "views":              self.view_count,
            "sub_id":             self.sub_id,
            "level_id":           self.level_id,
            "status":             self.status,
            "review_reason":      self.review_reason,
            "parser_confidence":  self.parser_confidence,
            "resource_type_id":   self.resource_type_id,
            "resource_type_name": self.ResourceTypes.resource_name if self.ResourceTypes else None,
            "author":             self.author,
            "file_size":          self.file_size,
            "file_type":          self.file_type,
            "paper_number":       self.exam_metadata.paper_number if self.exam_metadata else None,
            "year":               self.exam_metadata.year if self.exam_metadata else None,
            "session":            self.exam_metadata.session if self.exam_metadata else None
        }
    
class     Permission(db.Model):
    __tablename__="permissions"
    permission_id=db.Column(db.Integer,primary_key=True)
    permission_name = db.Column(db.String(50), nullable=True)
    permission_description=db.Column(db.Text,nullable=True)
    created_at=db.Column(db.DateTime,nullable=False)
    permissions=db.relationship("RolePermission",foreign_keys="[RolePermission.permission_id]",back_populates="Rpermissions")
    def __repr__(self):
        return f"<Permissions{self.permission_id} , permission name= {self.permission_name}>"
    
class RolePermission(db.Model):
    __tablename__="role_permissions"
    role_id = db.Column(db.Integer, db.ForeignKey("roles.role_id"), nullable=False, primary_key=True)
    permission_id=db.Column(db.Integer,db.ForeignKey("permissions.permission_id"),nullable=False,primary_key=True)
    Rrole=db.relationship("Role",foreign_keys=[role_id],back_populates="roles")
    Rpermissions=db.relationship("Permission",foreign_keys=[permission_id],back_populates="permissions")
    def __repr__(self):
        return f"<RolePermission{self.role_id}, Permission_id= {self.permission_id}"      
        
    
        
    
  
