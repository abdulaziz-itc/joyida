"""Add reel fields to projects

Revision ID: b3c4d5e6f7g8
Revises: a2b3c4d5e6f7
Create Date: 2026-04-19 19:26:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7g8'
down_revision: Union[str, Sequence[str], None] = 'a2b3c4d5e6f7'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # Add new fields to projects table
    op.add_column('projects', sa.Column('video_url', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('category', sa.String(), nullable=True))
    op.add_column('projects', sa.Column('views_count', sa.Integer(), nullable=True, server_default='0'))
    op.add_column('projects', sa.Column('likes_count', sa.Integer(), nullable=True, server_default='0'))
    op.create_index(op.f('ix_projects_category'), 'projects', ['category'], unique=False)


def downgrade() -> None:
    # Remove fields from projects table
    op.drop_index(op.f('ix_projects_category'), table_name='projects')
    op.drop_column('projects', 'likes_count')
    op.drop_column('projects', 'views_count')
    op.drop_column('projects', 'category')
    op.drop_column('projects', 'video_url')
