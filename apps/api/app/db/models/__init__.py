"""Model package.

Importing every model here guarantees they are registered on ``Base.metadata``
before Alembic autogenerates a migration; a model that is never imported is
invisible to autogenerate and silently omitted.
"""

from app.db.models.user import RefreshToken, Role, User

__all__ = ["RefreshToken", "Role", "User"]
