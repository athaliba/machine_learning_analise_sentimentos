
from pathlib import Path
import joblib
from fastapi import FastAPI
from pydantic import BaseModel, Field

ROOT = Path(__file__).resolve().parent.parent
MODEL_PATH = ROOT / "models" / "sentiment_model.joblib"

# Load trained model
model = joblib.load(MODEL_PATH)

# Create API
app = FastAPI(
    title="API de Análise de Sentimentos",
    version="0.1.0"
)


class Entrada(BaseModel):
    texto: str = Field(
        min_length=3,
        max_length=1000,
        examples=["Adorei o produto, excelente qualidade!"]
    )


class Saida(BaseModel):
    texto: str
    sentimento: str


@app.get("/health", summary="Verificar saúde da API")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "version": app.version
    }


@app.post(
    "/predict",
    summary="Classificar sentimento de um texto",
    response_model=Saida
)
def predict(dados: Entrada):
    sentimento = model.predict([dados.texto])[0]

    return {
        "texto": dados.texto,
        "sentimento": str(sentimento)
    }
