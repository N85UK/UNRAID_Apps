"""create alerts table

Revision ID: 001
Revises: 
Create Date: 2025-10-17 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('alert_id', sa.String(), nullable=False),
        sa.Column('source', sa.String(), nullable=False),
        sa.Column('device', sa.String(), nullable=False),
        sa.Column('severity', sa.String(), nullable=False),
        sa.Column('alert_type', sa.String(), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('details', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('raw_payload', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('received_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('idempotency_key', sa.String(), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('alert_id')
    )
    op.create_index('idx_alerts_timestamp', 'alerts', ['timestamp'], unique=False)
    op.create_index('idx_alerts_severity', 'alerts', ['severity'], unique=False)
    op.create_index('idx_alerts_type', 'alerts', ['alert_type'], unique=False)
    op.create_index('idx_alerts_device', 'alerts', ['device'], unique=False)
    op.create_index('idx_alerts_details_gin', 'alerts', ['details'], unique=False, postgresql_using='gin', postgresql_ops={'details': 'jsonb_path_ops'})
    op.create_index('idx_alerts_raw_payload_gin', 'alerts', ['raw_payload'], unique=False, postgresql_using='gin', postgresql_ops={'raw_payload': 'jsonb_path_ops'})

def downgrade():
    op.drop_index('idx_alerts_raw_payload_gin', table_name='alerts')
    op.drop_index('idx_alerts_details_gin', table_name='alerts')
    op.drop_index('idx_alerts_device', table_name='alerts')
    op.drop_index('idx_alerts_type', table_name='alerts')
    op.drop_index('idx_alerts_severity', table_name='alerts')
    op.drop_index('idx_alerts_timestamp', table_name='alerts')
    op.drop_table('alerts')