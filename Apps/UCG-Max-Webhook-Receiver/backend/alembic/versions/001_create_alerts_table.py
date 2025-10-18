"""create alerts table

Revision ID: 001
Revises: 
Create Date: 2025-10-17 12:00:00.000000

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    op.create_table('alerts',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('alert_id', sa.String(255), nullable=False),
        sa.Column('source', sa.String(255), nullable=False),
        sa.Column('device', sa.String(255), nullable=False),
        sa.Column('severity', sa.String(50), nullable=False),
        sa.Column('alert_type', sa.String(100), nullable=False),
        sa.Column('timestamp', sa.DateTime(timezone=True), nullable=False),
        sa.Column('summary', sa.Text(), nullable=False),
        sa.Column('details', sa.JSON(), nullable=True),
        sa.Column('raw_payload', sa.JSON(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('received_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=True),
        sa.Column('idempotency_key', sa.String(255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('alert_id')
    )
    op.create_index('idx_alerts_timestamp', 'alerts', ['timestamp'], unique=False)
    op.create_index('idx_alerts_severity', 'alerts', ['severity'], unique=False)
    op.create_index('idx_alerts_type', 'alerts', ['alert_type'], unique=False)
    op.create_index('idx_alerts_device', 'alerts', ['device'], unique=False)

def downgrade():
    op.drop_index('idx_alerts_device', table_name='alerts')
    op.drop_index('idx_alerts_type', table_name='alerts')
    op.drop_index('idx_alerts_severity', table_name='alerts')
    op.drop_index('idx_alerts_timestamp', table_name='alerts')
    op.drop_table('alerts')