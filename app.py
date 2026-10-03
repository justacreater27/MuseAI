from backend.main import app

# Expose `app` for ASGI servers (uvicorn)

if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app:app", host="0.0.0.0", port=8000, reload=True)
