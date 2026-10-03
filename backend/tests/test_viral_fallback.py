import os
import sys

from fastapi.testclient import TestClient

sys.path.append(os.path.dirname(os.path.dirname(__file__)))
import main


def test_viral_fallback_when_no_api_keys(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    monkeypatch.delenv("GROQ_API_KEY", raising=False)

    with TestClient(main.app) as client:
        response = client.post(
            "/viral",
            json={
                "ai_provider": "gemini",
                "system": "You are a helpful assistant.",
                "message": "Create 3 catchy brand names for a premium Indian skincare brand.",
            },
        )

    assert response.status_code == 200
    body = response.json()
    assert body["output"]
    assert body["provider"] in {"local_fallback", "gemini", "groq"}
