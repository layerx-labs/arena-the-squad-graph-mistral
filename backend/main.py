"""
Squad Graph Explorer - FastAPI Backend

This backend loads the 2026 World Cup squad data, builds a social graph
of players connected by shared club history, and provides query endpoints.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Import routes
from routes import teammates, connection, strongest, graph, players, clubs

# Create FastAPI app
app = FastAPI(
    title="Squad Graph Explorer API",
    description="Social graph of 2026 World Cup players connected by shared club history",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(teammates.router, prefix="/api", tags=["teammates"])
app.include_router(connection.router, prefix="/api", tags=["connection"])
app.include_router(strongest.router, prefix="/api", tags=["strongest"])
app.include_router(graph.router, prefix="/api", tags=["graph"])
app.include_router(players.router, prefix="/api", tags=["players"])
app.include_router(clubs.router, prefix="/api", tags=["clubs"])


@app.get("/")
async def root():
    """Root endpoint with basic info"""
    return {
        "name": "Squad Graph Explorer API",
        "version": "1.0.0",
        "description": "Social graph of 2026 World Cup players connected by shared club history",
        "docs": "/docs",
        "health": "/health"
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {"status": "healthy"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
