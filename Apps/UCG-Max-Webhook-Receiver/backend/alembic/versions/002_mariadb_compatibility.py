"""mariadb compatibility

Revision ID: 002
Revises: 001
Create Date: 2025-10-18 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql, postgresql

# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None

def upgrade():
    # This migration makes the schema compatible with both PostgreSQL and MariaDB/MySQL
    # For existing PostgreSQL databases, we convert JSONB to JSON
    # For new MariaDB/MySQL databases, JSON is used directly
    
    bind = op.get_bind()
    dialect_name = bind.dialect.name
    
    if dialect_name == 'postgresql':
        # Drop PostgreSQL-specific GIN indexes
        try:
            op.drop_index('idx_alerts_raw_payload_gin', table_name='alerts')
        except:
            pass
        try:
            op.drop_index('idx_alerts_details_gin', table_name='alerts')
        except:
            pass
        
        # Alter columns to use JSON instead of JSONB
        op.execute('ALTER TABLE alerts ALTER COLUMN details TYPE JSON USING details::json')
        op.execute('ALTER TABLE alerts ALTER COLUMN raw_payload TYPE JSON USING raw_payload::json')
        
        # Add length constraints to string columns for cross-database compatibility
        op.alter_column('alerts', 'alert_id', type_=sa.String(255))
        op.alter_column('alerts', 'source', type_=sa.String(255))
        op.alter_column('alerts', 'device', type_=sa.String(255))
        op.alter_column('alerts', 'severity', type_=sa.String(50))
        op.alter_column('alerts', 'alert_type', type_=sa.String(100))
        op.alter_column('alerts', 'idempotency_key', type_=sa.String(255))

def downgrade():
    bind = op.get_bind()
    dialect_name = bind.dialect.name
    
    if dialect_name == 'postgresql':
        # Restore JSONB columns
        op.execute('ALTER TABLE alerts ALTER COLUMN details TYPE JSONB USING details::jsonb')
        op.execute('ALTER TABLE alerts ALTER COLUMN raw_payload TYPE JSONB USING raw_payload::jsonb')
        
        # Restore GIN indexes
        op.create_index('idx_alerts_details_gin', 'alerts', ['details'], unique=False, 
                       postgresql_using='gin', postgresql_ops={'details': 'jsonb_path_ops'})
        op.create_index('idx_alerts_raw_payload_gin', 'alerts', ['raw_payload'], unique=False,
                       postgresql_using='gin', postgresql_ops={'raw_payload': 'jsonb_path_ops'})
        
        # Remove length constraints
        op.alter_column('alerts', 'alert_id', type_=sa.String())
        op.alter_column('alerts', 'source', type_=sa.String())
        op.alter_column('alerts', 'device', type_=sa.String())
        op.alter_column('alerts', 'severity', type_=sa.String())
        op.alter_column('alerts', 'alert_type', type_=sa.String())
        op.alter_column('alerts', 'idempotency_key', type_=sa.String())
