"""Add professional fields to user model

Revision ID: a2b3c4d5e6f7
Revises: 973b8d5ee091
Create Date: 2026-04-17 23:40:00.000000

"""
from typing import Sequence, Union
from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'a2b3c4d5e6f7'
down_revision: Union[str, Sequence[str], None] = '973b8d5ee091'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

def upgrade() -> None:
    # Add new professional fields to users table
    op.add_column('users', sa.Column('birth_date', sa.Date(), nullable=True))
    op.add_column('users', sa.Column('education_info', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('experience_info', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('phone_number', sa.String(), nullable=True))
    op.add_column('users', sa.Column('bio', sa.Text(), nullable=True))
    op.add_column('users', sa.Column('headline', sa.String(), nullable=True))
    op.add_column('users', sa.Column('skills', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('languages', sa.JSON(), nullable=True))
    op.add_column('users', sa.Column('social_links', sa.JSON(), nullable=True))

def downgrade() -> None:
    # Remove professional fields
    op.drop_column('users', 'social_links')
    op.drop_column('users', 'languages')
    op.drop_column('users', 'skills')
    op.drop_column('users', 'headline')
    op.drop_column('users', 'bio')
    op.drop_column('users', 'phone_number')
    op.drop_column('users', 'experience_info')
    op.drop_column('users', 'education_info')
    op.drop_column('users', 'birth_date')
