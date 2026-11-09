
import json
import joblib
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field
from loguru import logger

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
    confianca: float
    versao_modelo: str


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

    # Calculate probabilities
    probas = model.predict_proba([dados.texto])[0]

    # Get the highest probability
    i = int(probas.argmax())

    # Get predicted sentiment
    sentimento = model.classes_[i]

    # Get confidence
    confianca = round(float(probas[i]), 4)

    # Build response
    resultado = Saida(
        texto=dados.texto,
        sentimento=str(sentimento),
        confianca=confianca,
        versao_modelo="0.1.0"
    )

    # Log prediction
    logger.info(
        json.dumps(
            resultado.model_dump(),
            ensure_ascii=False
        )
    )

    return resultado


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
