
"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Gavel,
  Scale,
  Landmark,
  ShieldCheck,
  AlertTriangle,
  MinusCircle,
  RotateCcw,
  History,
  Brain,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

type Prediction = {
  texto: string;
  sentimento: string;
  confianca: number;
  versao_modelo: string;
};

type HistoryItem = Prediction & {
  id: string;
  horario: string;
};

type Verdict = {
  title: string;
  stamp: string;
  subtitle: string;
  message: string;
  color: string;
  background: string;
  border: string;
  icon: LucideIcon;
};

function getVerdict(sentimento: string): Verdict {
  const normalized = sentimento
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (normalized.includes("posit")) {
    return {
      title: "POSITIVO!",
      stamp: "POSITIVO",
      subtitle: "A corte reconheceu a felicidade!",
      message:
        "A inteligência artificial identificou sentimentos positivos neste comentário. A corte reconhece fortes sinais de satisfação!",
      color: "text-emerald-400",
      background: "bg-emerald-500/10",
      border: "border-emerald-400/40",
      icon: ShieldCheck,
    };
  }

  if (normalized.includes("negat")) {
    return {
      title: "NEGATIVO!",
      stamp: "NEGATIVO",
      subtitle: "A insatisfação foi identificada!",
      message:
        "A inteligência artificial identificou sentimentos negativos neste comentário. A corte detectou sinais de insatisfação!",
      color: "text-rose-400",
      background: "bg-rose-500/10",
      border: "border-rose-400/40",
      icon: AlertTriangle,
    };
  }

  return {
    title: "NEUTRO!",
    stamp: "NEUTRO",
    subtitle: "A corte não identificou polaridade!",
    message:
      "A inteligência artificial não identificou predominância de sentimentos positivos ou negativos neste comentário.",
    color: "text-amber-300",
    background: "bg-amber-500/10",
    border: "border-amber-400/40",
    icon: MinusCircle,
  };
}

const exemplos = [
  "Adorei o produto, excelente qualidade!",
  "Péssimo atendimento, não recomendo.",
  "O produto chegou ontem pela manhã.",
];

export default function Home() {
  const [texto, setTexto] = useState("");
  const [resultado, setResultado] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");
  const [abaMobile, setAbaMobile] = useState<"form" | "veredito">("form");
  const [historico, setHistorico] = useState<HistoryItem[]>([]);

  const veredito = resultado
    ? getVerdict(resultado.sentimento)
    : null;

  const ResultadoIcon = veredito?.icon;

  const positivos = historico.filter(
    (item) => getVerdict(item.sentimento).stamp === "POSITIVO"
  ).length;

  const negativos = historico.filter(
    (item) => getVerdict(item.sentimento).stamp === "NEGATIVO"
  ).length;

  const neutros = historico.filter(
    (item) => getVerdict(item.sentimento).stamp === "NEUTRO"
  ).length;

  async function julgar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      texto.trim().length < 3 ||
      texto.length > 1000 ||
      loading
    ) {
      return;
    }

    setLoading(true);
    setResultado(null);
    setErro("");
    setAbaMobile("veredito");

    try {
      const [response] = await Promise.all([
        fetch("/api/predict", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            texto: texto.trim(),
          }),
        }),
        new Promise((resolve) => setTimeout(resolve, 2200)),
      ]);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Não foi possível concluir a análise."
        );
      }

      setResultado(data);

      setHistorico((atual) =>
        [
          {
            ...data,
            id: `${Date.now()}`,
            horario: new Date().toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            }),
          },
          ...atual,
        ].slice(0, 9)
      );

    } catch (error) {
      setErro(
        error instanceof Error
          ? error.message
          : "Erro inesperado na análise."
      );
      setAbaMobile("form");
    } finally {
      setLoading(false);
    }
  }

  function novoJulgamento() {
    setTexto("");
    setResultado(null);
    setErro("");
    setAbaMobile("form");
  }

  return (
    <main className="fixed inset-0 z-50 flex h-dvh w-full flex-col overflow-hidden bg-[#090810] text-[#f7f1e8]">

      {/* FUNDO CINEMATOGRÁFICO */}
      <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_50%_20%,rgba(107,36,145,0.18),transparent_55%)]" />

      {/* CABEÇALHO */}
      <header className="relative z-30 flex h-14 shrink-0 items-center justify-between border-b border-[#c59a4b]/20 bg-[#0c0914]/95 px-3 backdrop-blur-xl sm:px-6 lg:px-9">

        <div className="flex items-center gap-2 sm:gap-3">
          <Landmark size={27} className="text-[#d7a94f]" />

          <div>
            <h2 className="text-base font-black sm:text-xl">
              Veredito<span className="text-[#d7a94f]">AI</span>
            </h2>
            <p className="text-[8px] uppercase tracking-[0.2em] text-slate-400 sm:text-[9px]">
              Tribunal dos Sentimentos
            </p>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-xs font-semibold text-slate-400 lg:flex">
          <span className="text-[#d7a94f]">Julgamento</span>
          <span>Inteligência Artificial</span>
          <span>Machine Learning</span>
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 text-[10px] text-slate-400 sm:flex">
            <History size={14} />
            {historico.length} análises
          </div>

          <div className="flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-1.5">
            <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-400">
              ONLINE
            </span>
          </div>
        </div>

      </header>

      {/* TÍTULO */}
      <section className="relative z-10 shrink-0 px-3 py-2 text-center sm:py-3">

        <div className="mb-1 flex items-center justify-center gap-2 text-[#d7a94f]">
          <div className="h-px w-7 bg-[#d7a94f]/50 sm:w-10" />
          <Scale size={14} />
          <span className="text-[9px] font-bold uppercase tracking-[0.3em]">
            Justiça emocional
          </span>
          <div className="h-px w-7 bg-[#d7a94f]/50 sm:w-10" />
        </div>

        <h1 className="text-xl font-black tracking-tight sm:text-3xl lg:text-4xl">
          TRIBUNAL DOS{" "}
          <span className="text-[#e4ae4c]">SENTIMENTOS</span>
        </h1>

        <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
          Toda opinião merece um julgamento.
        </p>

      </section>

      {/* PAINÉIS PRINCIPAIS */}
      <section className="relative z-10 grid min-h-0 flex-1 grid-cols-1 grid-rows-[minmax(115px,0.36fr)_40px_minmax(0,0.64fr)] gap-2 overflow-hidden px-2 pb-2 sm:px-3 md:grid-cols-2 md:grid-rows-[minmax(0,0.76fr)_minmax(0,1.24fr)] md:gap-3 xl:grid-cols-[minmax(250px,0.9fr)_minmax(350px,1.35fr)_minmax(250px,0.9fr)] xl:grid-rows-1 xl:gap-4 xl:px-5 xl:pb-4 2xl:px-7">

        {/* FORMULÁRIO */}
        <section
          className={`row-start-3 col-start-1 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border-2 border-[#b38a4b]/50 bg-gradient-to-br from-[#f4dfb6] to-[#d5b783] p-3 text-[#2c1b13] shadow-xl sm:p-4 xl:row-start-1 xl:col-start-1 xl:p-5 ${
            abaMobile === "form" ? "flex" : "hidden"
          } md:row-start-2 md:col-start-1 md:flex`}
        >

          <div className="mb-3 flex shrink-0 items-center gap-3">
            <div className="rounded-xl bg-[#5b267f]/10 p-2.5 text-[#6a2b86]">
              <Gavel size={23} />
            </div>

            <div>
              <h2 className="text-base font-black sm:text-lg">
                Depoimento
              </h2>
              <p className="text-[10px] text-[#684c35]">
                Processo nº 0001/2026
              </p>
            </div>
          </div>

          <form onSubmit={julgar} className="flex min-h-0 flex-1 flex-col">

            <label className="mb-2 shrink-0 text-[10px] font-bold uppercase tracking-wider sm:text-xs">
              Digite o comentário:
            </label>

            <textarea
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              maxLength={1000}
              placeholder="O réu tem direito à palavra..."
              className="min-h-0 w-full flex-1 resize-none rounded-xl border-2 border-[#813caa] bg-[#160d20] p-3 text-xs leading-6 text-white outline-none transition placeholder:text-slate-500 focus:border-[#d4a3ff] focus:ring-4 focus:ring-purple-500/20 sm:p-4 sm:text-sm"
            />

            <div className="mt-2 flex shrink-0 justify-between text-[9px] text-[#63472e]">
              <span>Depoimento registrado.</span>
              <span>{texto.length}/1000</span>
            </div>

            <div className="mt-3 hidden shrink-0 space-y-2 xl:block">
              <p className="text-[9px] font-black uppercase tracking-widest text-[#684c35]">
                Experimente um comentário
              </p>

              {exemplos.map((exemplo, index) => (
                <button
                  key={index}
                  type="button"
                  disabled={loading}
                  onClick={() => {
                    setTexto(exemplo);
                    setResultado(null);
                    setErro("");
                  }}
                  className="block w-full truncate rounded-full border border-white/50 bg-white/35 px-3 py-2 text-left text-[10px] font-semibold transition hover:bg-white/70 disabled:opacity-40"
                >
                  {index === 0 ? "🟢" : index === 1 ? "🔴" : "🟡"}{" "}
                  {exemplo}
                </button>
              ))}
            </div>

            {erro && (
              <p className="mt-2 shrink-0 rounded-lg bg-red-900/10 p-2 text-[10px] text-red-800">
                {erro}
              </p>
            )}

            <motion.button
              whileHover={{ scale: 1.025 }}
              whileTap={{ scale: 0.97 }}
              type="submit"
              disabled={loading || texto.trim().length < 3}
              className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-[#f5ca64] bg-gradient-to-r from-[#651b96] to-[#9a38bb] px-3 py-3 text-xs font-black tracking-wider text-white shadow-lg transition hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40 sm:py-3.5"
            >
              <Gavel size={17} />
              {loading ? "ANALISANDO..." : "SUBMETER À CORTE"}
            </motion.button>

          </form>

        </section>

        {/* PERSONAGEM CENTRAL */}
        <section className="relative row-start-1 col-start-1 flex min-h-0 flex-col items-center justify-between overflow-hidden rounded-2xl border border-[#bd8e45]/40 bg-gradient-to-b from-[#261334] via-[#180d23] to-[#100c15] px-2 pb-2 pt-2 shadow-2xl md:row-start-1 md:col-span-2 xl:row-start-1 xl:col-span-1 xl:col-start-2 xl:px-3 xl:pt-4">

          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_40%,rgba(180,90,220,0.25),transparent_65%)]" />

          <div className="pointer-events-none absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-[#8e4a16]/10 to-transparent" />

          <div className="relative z-10 shrink-0 text-center">
            <div className="mb-1 flex items-center justify-center gap-2 text-[9px] font-bold uppercase tracking-[0.2em] text-[#dcb45d] sm:text-[10px]">
              <Sparkles size={13} />
              Sala de audiência
              <Sparkles size={13} />
            </div>

            <h2 className="text-base font-black text-[#f3d18b] sm:text-xl xl:text-2xl">
              A CORTE ESTÁ EM SESSÃO
            </h2>
          </div>

          {/* JUIZ ANIMADO */}
          <motion.div
            className="relative z-10 flex min-h-0 w-full flex-1 items-center justify-center overflow-hidden"
            animate={
              loading
                ? {
                    x: [0, -3, 3, -3, 0],
                    y: [0, -5, 0],
                  }
                : resultado
                  ? {
                      y: [0, -9, 0],
                      scale: [1, 1.02, 1],
                    }
                  : {
                      y: [0, -5, 0],
                    }
            }
            transition={
              loading
                ? { duration: 0.45, repeat: Infinity }
                : resultado
                  ? { duration: 0.8 }
                  : {
                      duration: 3.5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }
            }
          >
            <Image
              src="/images/juiz-tribunal.png"
              alt="Juiz do Tribunal dos Sentimentos"
              width={1000}
              height={730}
              priority
              className="h-full w-full object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.55)]"
            />

            {loading && (
              <motion.div
                animate={{ opacity: [0.1, 0.6, 0.1] }}
                transition={{
                  duration: 0.8,
                  repeat: Infinity,
                }}
                className="pointer-events-none absolute inset-0 rounded-full bg-purple-500/10 blur-3xl"
              />
            )}
          </motion.div>

          {/* FALA DO JUIZ */}
          <div className="relative z-10 w-full shrink-0 rounded-xl border border-[#d3a750]/30 bg-black/50 p-2 text-center backdrop-blur-md sm:p-3">

            <AnimatePresence mode="wait">
              <motion.div
                key={loading ? "loading" : resultado ? "result" : "idle"}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
              >
                <p className="text-[10px] font-black text-[#e7c27c] sm:text-xs">
                  {loading
                    ? "O TRIBUNAL ESTÁ ANALISANDO..."
                    : resultado
                      ? "A CLASSIFICAÇÃO FOI REVELADA!"
                      : "SILÊNCIO NO TRIBUNAL!"}
                </p>

                <p className="mt-1 text-[9px] text-slate-300 sm:text-[10px]">
                  {loading
                    ? "O juiz está analisando as evidências."
                    : resultado
                      ? "Confira o resultado da inteligência artificial."
                      : "O próximo comentário está prestes a ser julgado."}
                </p>
              </motion.div>
            </AnimatePresence>

            {loading && (
              <div className="mt-2 flex justify-center gap-2">
                {[0, 1, 2].map((item) => (
                  <motion.span
                    key={item}
                    className="h-1.5 w-1.5 rounded-full bg-[#e7c27c]"
                    animate={{ opacity: [0.2, 1, 0.2] }}
                    transition={{
                      duration: 0.9,
                      repeat: Infinity,
                      delay: item * 0.2,
                    }}
                  />
                ))}
              </div>
            )}

          </div>

        </section>

        {/* ABAS MOBILE */}
        <div className="row-start-2 col-start-1 grid grid-cols-2 gap-2 md:hidden">

          <button
            onClick={() => setAbaMobile("form")}
            className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-[10px] font-bold ${
              abaMobile === "form"
                ? "border-purple-400 bg-purple-500/20 text-purple-200"
                : "border-white/10 bg-white/5 text-slate-400"
            }`}
          >
            <Gavel size={15} />
            DEPOIMENTO
          </button>

          <button
            onClick={() => setAbaMobile("veredito")}
            className={`flex items-center justify-center gap-2 rounded-lg border p-2 text-[10px] font-bold ${
              abaMobile === "veredito"
                ? "border-amber-400 bg-amber-500/20 text-amber-200"
                : "border-white/10 bg-white/5 text-slate-400"
            }`}
          >
            <Scale size={15} />
            RESULTADO
          </button>

        </div>

        {/* RESULTADO */}
        <section
          className={`row-start-3 col-start-1 flex h-full min-h-0 flex-col overflow-hidden rounded-2xl border border-[#d0a74f]/40 bg-[#10140f] shadow-xl ${
            abaMobile === "veredito" ? "flex" : "hidden"
          } md:row-start-2 md:col-start-2 md:flex xl:row-start-1 xl:col-start-3`}
        >

          <div className="flex h-10 shrink-0 items-center justify-center border-b border-[#c49b4a]/30 bg-gradient-to-r from-[#583c19] via-[#a27b32] to-[#583c19]">
            <h2 className="text-xs font-black uppercase tracking-widest text-[#fff0c7]">
              Resultado da Análise
            </h2>
          </div>

          <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden p-3 text-center sm:p-4">

            <AnimatePresence mode="wait">

              {resultado && veredito && ResultadoIcon ? (

                <motion.div
                  key={resultado.sentimento + resultado.texto}
                  initial={{ opacity: 0, scale: 0.55, y: 35 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  transition={{
                    type: "spring",
                    stiffness: 170,
                    damping: 13,
                  }}
                  className="flex w-full min-h-0 flex-col items-center justify-center"
                >

                  {/* CARIMBO */}
                  <motion.div
                    initial={{
                      opacity: 0,
                      scale: 2.5,
                      rotate: -25,
                    }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: -7,
                    }}
                    transition={{
                      delay: 0.25,
                      type: "spring",
                      stiffness: 250,
                    }}
                    className={`mb-2 shrink-0 rounded-lg border-[3px] px-4 py-2 text-xl font-black tracking-widest sm:mb-3 sm:text-2xl ${veredito.color} ${veredito.border} ${veredito.background}`}
                  >
                    {veredito.stamp}
                  </motion.div>

                  <div className={`mb-2 flex h-12 w-12 shrink-0 items-center justify-center rounded-full border sm:h-16 sm:w-16 ${veredito.border} ${veredito.background}`}>
                    <ResultadoIcon size={32} className={veredito.color} />
                  </div>

                  <h3 className={`shrink-0 text-2xl font-black sm:text-3xl ${veredito.color}`}>
                    {veredito.title}
                  </h3>

                  <p className="mt-1 shrink-0 text-[10px] font-bold text-[#d8b46d] sm:text-xs">
                    {veredito.subtitle}
                  </p>

                  <p className="mt-2 max-w-sm text-[10px] leading-4 text-slate-300 sm:text-xs sm:leading-5">
                    {veredito.message}
                  </p>

                  {/* CONFIANÇA */}
                  <div className="mt-3 w-full shrink-0 sm:mt-4">

                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-[9px] font-bold text-slate-400 sm:text-xs">
                        Confiança da previsão
                      </span>

                      <span className={`text-lg font-black sm:text-xl ${veredito.color}`}>
                        {(resultado.confianca * 100).toFixed(1).replace(".", ",")}%
                      </span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{
                          width: `${resultado.confianca * 100}%`,
                        }}
                        transition={{
                          duration: 1.3,
                          delay: 0.4,
                        }}
                        className={`h-full rounded-full ${
                          veredito.stamp === "POSITIVO"
                            ? "bg-emerald-400"
                            : veredito.stamp === "NEGATIVO"
                              ? "bg-rose-400"
                              : "bg-amber-300"
                        }`}
                      />
                    </div>

                  </div>

                  <div className="mt-3 hidden w-full items-center justify-between rounded-lg border border-white/10 bg-white/5 p-2 text-[9px] text-slate-400 sm:flex">
                    <span className="flex items-center gap-2">
                      <Brain size={13} className="text-purple-300" />
                      Machine Learning
                    </span>
                    <span>v{resultado.versao_modelo}</span>
                  </div>

                  <button
                    onClick={novoJulgamento}
                    className="mt-3 flex w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-[#c59a4b]/50 bg-[#c59a4b]/10 px-3 py-2 text-[10px] font-bold text-[#e6c47c] transition hover:bg-[#c59a4b]/20 sm:mt-4"
                  >
                    <RotateCcw size={13} />
                    NOVA ANÁLISE
                  </button>

                </motion.div>

              ) : (

                <motion.div
                  key="waiting"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex flex-col items-center"
                >

                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-[#c59a4b]/20 bg-[#c59a4b]/5 sm:h-20 sm:w-20">
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 2,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Scale size={38} className="text-[#d6b46e]" />
                      </motion.div>
                    ) : (
                      <Scale size={38} className="text-[#d6b46e]" />
                    )}
                  </div>

                  <h3 className="text-base font-black text-[#d6b46e] sm:text-lg">
                    {loading ? "ANALISANDO..." : "AGUARDANDO ANÁLISE"}
                  </h3>

                  <p className="mt-3 max-w-xs text-[10px] leading-5 text-slate-500 sm:text-xs">
                    {loading
                      ? "A inteligência artificial está analisando o sentimento do comentário."
                      : "O resultado da classificação aparecerá aqui após o envio do comentário."}
                  </p>

                </motion.div>

              )}

            </AnimatePresence>

          </div>
        </section>

      </section>

      {/* RODAPÉ E ESTATÍSTICAS */}
      <footer className="relative z-10 flex h-7 shrink-0 items-center justify-between border-t border-white/10 bg-[#0c0914] px-3 text-[8px] text-slate-500 sm:px-6 sm:text-[9px] lg:px-9">

        <span className="hidden sm:block">
          VEREDITOAI · TRIBUNAL DOS SENTIMENTOS
        </span>

        <div className="flex items-center gap-3 sm:gap-5">
          <span className="text-emerald-400">
            Positivos: {positivos}
          </span>

          <span className="text-rose-400">
            Negativos: {negativos}
          </span>

          <span className="text-amber-300">
            Neutros: {neutros}
          </span>
        </div>

        <span className="hidden md:block">
          PYTHON · FASTAPI · NEXT.JS
        </span>

      </footer>

    </main>
  );
}
