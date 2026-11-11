
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const dados = await request.json();

    const API_URL =
      process.env.SENTIMENT_API_URL || "http://127.0.0.1:8000";

    const response = await fetch(`${API_URL}/predict`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(dados),
      cache: "no-store",
    });

    const resultado = await response.json();

    return NextResponse.json(resultado, {
      status: response.status,
    });

  } catch {
    return NextResponse.json(
      {
        detail: "Não foi possível conectar à API de sentimentos.",
      },
      { status: 502 }
    );
  }
}
