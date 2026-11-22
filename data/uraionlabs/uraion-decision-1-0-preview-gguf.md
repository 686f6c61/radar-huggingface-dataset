# UraionLabs/Uraion-Decision-1.0-Preview-GGUF

## Resumen

Uraion Decision 1.0 Preview es un modelo de decisión de "Sistema 1" publicado por Uraion Labs en formato GGUF para llama.cpp. Se construye sobre el modelo base `thinkingmachines/Inkling-2-Mini` (25.608.742.080 parámetros totales, arquitectura MoE según las etiquetas del autor) y no genera texto de forma autorregresiva: elimina la cabeza de modelado de lenguaje (`output.weight`, 492,1 MB) y la sustituye por una cabeza de decisión nativa `LLAMA_POOLING_TYPE_RANK` calibrada por temperatura, que devuelve distribuciones de probabilidad normalizadas en un único pase forward (`output_tokens = 0`).

El modelo responde a tres tipos de preguntas: booleanas (`noul`), de elección entre 2 y 64 opciones arbitrarias (`choice`) y de puntuación ordinal (`score`). Está pensado para enrutamiento, clasificación y toma de decisiones dentro de pipelines agénticos, con pesos cuantizados IQ4_NL/Q8_0 (17,14 GB) y soporte declarado para Apple Silicon y Metal. La licencia es Apache-2.0 y el idioma declarado es únicamente inglés.

Esta publicación es una compilación "Preview": el backbone está congelado en 4 bits y solo la cabeza de decisión ha sido entrenada. La versión completa V1.0, con fine-tuning LoRA sobre las capas densas del backbone, está en desarrollo activo según el autor. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture-of-experts) sobre Inkling-2-Mini, con cabeza de decisión Residual Anchored MLP (`LLAMA_POOLING_TYPE_RANK`) |
| Parametros totales | 25.608.742.080 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_NL / Q8_0 (fichero Q4_K_M citado; repo de 17,5 GB) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo parte del backbone MoE de `thinkingmachines/Inkling-2-Mini`, importado vía `ggml-org/Inkling-2-Mini-GGUF`, congelado en 4 bits. La innovación central es la sustitución de la cabeza generativa por una "Residual Anchored MLP decision head" con 64 códigos de salida, entrenada para producir distribuciones calibradas sobre booleanos, elecciones de 2 a 64 opciones y puntuaciones ordinales. La inferencia es de un solo pase, sin decodificación autorregresiva, lo que elimina la latencia de generación de tokens.

El entrenamiento usó 6.200 ejemplos estratificados de 8 fuentes de decisión: los primeros 5.000 de `train_10k` más 1.200 ejemplos de enriquecimiento (500 ítems de `BANKING77` con 8 a 16 opciones y 700 ítems Choice con orden de opciones permutado, incluyendo distribuciones soft gold de `LocalLLaMA/typed-decisions` para divergencia KL). Se aplicó calibración post-hoc de temperatura escalar `T = 1.7150`, ajustada sobre un conjunto de validación disjunto (`val_calib`, n = 1.408) e incorporada en `cls.output`. No se documenta RLHF ni DPO en la información disponible.

## Capacidades

- Clasificación booleana (`noul`): devuelve probabilidad normalizada de sí/no en un único pase.
- Elección múltiple (`choice`): decisión entre 2 y 64 opciones arbitrarias, con invariancia al orden de las opciones (según el autor).
- Puntuación ordinal (`score`): salida de score calibrado para decisiones graduadas.
- Probabilidades calibradas: temperatura ajustada e incorporada en la cabeza, con métricas de Brier y ECE reportadas.
- Enrutamiento y clasificación de intención: adecuado para selección de herramientas, rutas o categorías en pipelines.
- Integración con llama.cpp: ejecución local en CPU, GPU y Apple Silicon (Metal).
- Compatibilidad con endpoints: etiqueta `endpoints_compatible` en el repo.
- No dispone de generación de texto libre, tool calling generativo ni razonamiento multi-paso: la salida es una distribución de decisión, no tokens.

## Casos de uso

- Enrutamiento de consultas en un agente: el modelo clasifica la intención del usuario entre un conjunto acotado de rutas (2 a 64) en un solo pase, reduciendo la latencia frente a un LLM generativo que tendría que emitir JSON.
- Filtro de seguridad y moderación: clasificación binaria o multiclase de contenido ofensivo, con umbrales ajustables gracias a las probabilidades calibradas (ECE reportado de 4,9 % en TweetEval Offensive).
- Selección de herramienta (tool routing): dado un catálogo de herramientas descritas como opciones, el modelo devuelve la distribución sobre la herramienta correcta sin generar una llamada completa.
- Triaje de tickets de soporte: clasificación de categorías tipo `BANKING77` (8 a 16 opciones) para derivar tickets al equipo adecuado.
- Verificación de afirmaciones y NLI: decisión de entailment/contradiction/neutral (evaluado en ANLI Round 3) como paso de validación en pipelines RAG.
- Puntuación de calidad o relevancia: uso de la salida `score` ordinal para rankear respuestas, resúmenes o candidatos en un sistema de generación.
- Ejecución local en portátiles Apple Silicon: al ser GGUF con soporte Metal y 17,14 GB de pesos, permite despliegue self-hosted sin GPU dedicada en equipos con 64 GB de memoria unificada (configuración de medida del autor).

## Benchmarks y rendimiento

Resultados declarados por el autor, single-pass (`n_permutations = 1`, `output_tokens = 0`), medidos en Apple M5 Pro 64 GB con Metal (`ngl = 99`). No verificados de forma independiente.

| Benchmark | Items | Inkling-2-Mini ZS (Acc / Brier / ECE) | Uraion Decision 1.0 Preview (Acc / Brier / ECE) |
|---|---|---|---|
| Bespoke Nimble Holdout | 324 | 84,26 % / 0,274 / 12,5 % | 82,72 % / 0,286 / 13,3 % |
| TREC | 500 | 92,00 % / 0,129 / 5,2 % | 93,60 % / 0,102 / 6,8 % |
| TweetEval Offensive | 860 | 67,91 % / 0,478 / 18,6 % | 78,02 % / 0,306 / 4,9 % |
| OpenBookQA | 500 | no disponible | 89,40 % |
| ANLI Round 3 | 500 | no disponible | 61,40 % |
| SST-5 | 500 | no disponible | 50,20 % |
| Typed-Decisions | 500 | no disponible | 75,40 % |

Índice agregado Jev Decision Index 0.4.1 (panel público estratificado, n = 50 por benchmark, 350 peticiones, 5 áreas): Public Skill 55,01 y Balanced Raw 66,77 (Residual MLP). En Bespoke Nimble Holdout el autor reporta además log-loss de 1,047 a 0,530, Macro-F1 de 80,1 % y MAE de 0,293.

## Requisitos de hardware

- Pesos en disco: 17,14 GB (IQ4_NL/Q8_0); repositorio de 17,5 GB.
- VRAM/memoria unificada estimada: aproximadamente 17 a 20 GB para los pesos más overhead de contexto y buffers de llama.cpp; el autor midió en un equipo con 64 GB de memoria unificada.
- GPU dedicadas: no se han publicado requisitos ni latencias para A100, H100 o RTX 4090 en la información disponible.
- Consumer GPU: viable en GPUs con 24 GB de VRAM (por ejemplo, RTX 3090/4090) siempre que el contexto se mantenga moderado; no confirmado por el autor.
- Apple Silicon: soporte declarado para Metal; configuración de referencia Apple M5 Pro 64 GB con `ngl = 99`.
- Despliegue: llama.cpp (formato nativo GGUF), compatible con endpoints; no se documenta soporte para vLLM ni TGI.
- Latencia y throughput: no disponibles; la ventaja estructural es `output_tokens = 0`, es decir, un único forward pass por decisión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Uraion Decision 1.0 Preview | 25,6 B (MoE) | no disponible | TREC 93,6 %; TweetEval 78,02 %; Jev Public Skill 55,01 | Apache-2.0 | GGUF en Hugging Face |
| thinkingmachines/Inkling-2-Mini (base) | 25,6 B (MoE) | no disponible | TREC 92,00 %; TweetEval 67,91 %; Bespoke 84,26 % | no disponible | Hugging Face |
| Jev 1.13 / 1.14 (referencia del autor) | no disponible | no disponible | Bespoke 93,2 %; TREC 92,8 % | no disponible | no disponible |
| PPLX v1.1 / flash v1.2 (referencia del autor) | no disponible | no disponible | TREC 94,0 % / 93,6 %; TweetEval 84,9 % | no disponible | no disponible |

Las referencias Jev y PPLX provienen de la tabla comparativa del autor y corresponden a modelos con backbone completo ajustado; sus parámetros, contexto y licencia no se detallan en la información disponible.

## Limitaciones y advertencias

- Es una compilación Preview: el backbone está congelado en 4 bits y solo la cabeza de decisión ha sido entrenada; el rendimiento completo V1.0 aún no está publicado.
- Solo inglés: no hay soporte multilingüe declarado.
- No genera texto: no puede usarse como LLM conversacional, para tool calling generativo ni para razonamiento multi-paso.
- Resultados no verificados: todas las métricas del model-index están marcadas `verified: false` y proceden del propio autor.
- Rendimiento desigual: SST-5 (50,20 %) y ANLI Round 3 (61,40 %) están cerca o por debajo del azar ajustado, lo que sugiere debilidad en sentimiento fino de 5 clases e inferencia de lenguaje natural.
- En Bespoke Nimble Holdout la precisión baja respecto al zero-shot del base (84,26 % a 82,72 %) y el ECE empeora (12,5 % a 13,3 %), aunque el log-loss mejora.
- Riesgo de alucinación de calibración: las probabilidades solo están garantizadas como calibradas dentro de la distribución de entrenamiento y validación; fuera de dominio pueden desviarse.
- Sesgos: no se documenta ninguna evaluación de sesgos demográficos o sociales; el entrenamiento incluye datos de TweetEval Offensive y BANKING77, con posibles sesgos de dominio.
- Licencia Apache-2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Inkling-2-Mini, cuya licencia no se detalla en la información disponible.
- Repositorio sin tracción: 0 descargas y 0 likes, sin validación comunitaria.
- No hay datos publicados de latencia, throughput, contexto máximo ni requisitos de GPU dedicada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/UraionLabs/Uraion-Decision-1.0-Preview-GGUF
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- GGUF del modelo base: https://huggingface.co/ggml-org/Inkling-2-Mini-GGUF
- Licencia: https://huggingface.co/UraionLabs/Uraion-Decision-1.0-Preview-GGUF/blob/main/LICENSE
- Sitio de Uraion Labs: https://uraionlabs.com/
- Dataset de referencia citado: `LocalLLaMA/typed-decisions` (no se proporciona URL directa en la información disponible)
