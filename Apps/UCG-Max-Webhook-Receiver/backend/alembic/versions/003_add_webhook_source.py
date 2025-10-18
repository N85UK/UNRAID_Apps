"""add webhook_source field and make fields nullable

Revision ID: 003
Revises: 002
Create Date: 2025-10-18 15:00:00

"""
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade():
    # Add webhook_source column with default value
    op.add_column('alerts', sa.Column('webhook_source', sa.String(100), server_default='ucgmax', nullable=False))
    
    # Create index on webhook_source
    op.create_index('idx_alerts_webhook_source', 'alerts', ['webhook_source'])
    
    # Drop unique constraint on alert_id (if it exists)
    try:
        op.drop_constraint('alerts_alert_id_key', 'alerts', type_='unique')
    except:
        # Constraint might not exist in all databases
        pass
    
    # Make fields nullable for generic webhooks
    op.alter_column('alerts', 'source', existing_type=sa.String(255), nullable=True)
    op.alter_column('alerts', 'device', existing_type=sa.String(255), nullable=True)
    op.alter_column('alerts', 'severity', existing_type=sa.String(50), nullable=True)
    op.alter_column('alerts', 'alert_type', existing_type=sa.String(100), nullable=True)
    op.alter_column('alerts', 'summary', existing_type=sa.Text(), nullable=True)
    op.alter_column('alerts', 'details', existing_type=sa.JSON(), nullable=True)
    op.alter_column('alerts', 'idempotency_key', existing_type=sa.String(255), nullable=True)


def downgrade():
    # Remove webhook_source column
    op.drop_index('idx_alerts_webhook_source')
    op.drop_column('alerts', 'webhook_source')
    
    # Re-add unique constraint on alert_id
    op.create_unique_constraint('alerts_alert_id_key', 'alerts', ['alert_id'])
    
    # Make fields not nullable
    op.alter_column('alerts', 'source', existing_type=sa.String(255), nullable=False)
    op.alter_column('alerts', 'device', existing_type=sa.String(255), nullable=False)
    op.alter_column('alerts', 'severity', existing_type=sa.String(50), nullable=False)
    op.alter_column('alerts', 'alert_type', existing_type=sa.String(100), nullable=False)
    op.alter_column('alerts', 'summary', existing_type=sa.Text(), nullable=False)
    op.alter_column('alerts', 'details', existing_type=sa.JSON(), nullable=False)
    op.alter_column('alerts', 'idempotency_key', existing_type=sa.String(255), nullable=False)
