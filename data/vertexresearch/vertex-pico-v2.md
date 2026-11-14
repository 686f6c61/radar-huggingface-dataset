# VertexResearch/Vertex-Pico-v2

## Resumen

Vertex Pico v2 es un modelo de lenguaje base de tipo transformer desarrollado por Vertex Research, diseñado como una release de investigación dentro de la serie Vertex Pico, una familia de modelos extremadamente pequeños orientados a explorar los límites de eficiencia en tamaño. Con 798.903 parámetros (0,8 M), se entrena desde cero sobre aproximadamente 180 millones de tokens, lo que lo sitúa en la categoría de "tiny language models" empleados principalmente para experimentación académica, ablaciones arquitectónicas y benchmarking de técnicas de entrenamiento a pequeña escala.

La relevancia de esta versión radica en las mejoras introducidas respecto a Vertex Pico v1: una arquitectura más profunda (4 capas frente a la anterior), un tokenizador más compacto (BPE byte-level con 1.536 tokens), una mezcla de datos revisada y una fase final de entrenamiento con objetivo de ranking de opción múltiple. Estas modificaciones elevan su Intelligence Index de 4,68 a 5,84, según la fórmula de la Open SLM Leaderboard.

El modelo no está pensado para uso productivo: es un base model sin instruction tuning, con una ventana de atención de 1.024 tokens (hasta 2.048 posiciones), y su salida es frecuentemente incoherente. Su valor está en servir como banco de pruebas reproducible para investigadores que estudian dinámicas de entrenamiento, tokenización y evaluación en regímenes de parámetros sub-millón.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (4 capas, width 128, 2 cabezas, MLP width 332) |
| Parámetros totales | 798.903 (0,8 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens de ventana de atención (sliding window), hasta 2.048 posiciones |
| Tipos de cuantización | no disponible (pesos en float32 para evaluación; repo en safetensors) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con custom_code, requiere `trust_remote_code=True`) |

## Arquitectura y entrenamiento

Vertex Pico v2 es un transformer decoder-only de 4 capas con anchura 128, 2 cabezas de atención y anchura de MLP de 332. Emplea embeddings atados (tied embeddings), RoPE para codificación posicional, conexiones residuales densas y de valor, y salidas con gating tanto en atención como en MLP. El tokenizador es un BPE byte-level con un vocabulario de 1.536 tokens, deliberadamente pequeño para reducir el coste de los embeddings en un modelo de este tamaño. La atención usa una ventana deslizante de 1.024 tokens, con hasta 2.048 posiciones soportadas.

El entrenamiento se realizó desde cero sobre aproximadamente 180 millones de tokens en una sola época. La mezcla de datos incluye ClimbMix (licenciado CC-BY-NC 4.0), DCLM-Edu, FineWeb-Edu, UltraX, TxT360 QA, Wikipedia, WikiHow, FineMath, MegaMath QA, SciQ y texto aritmético sintético. Una innovación destacable respecto a v1 es la incorporación de un objetivo de ranking de opción múltiple en la fase final del entrenamiento, que mejora el rendimiento en tareas de elección entre candidatos (ARC, HellaSwag) y eleva el Intelligence Index de 4,68 a 5,84. No se menciona uso de RLHF ni DPO.

## Capacidades

- Generación de texto autoregresiva en inglés, a nivel de base model (sin instruction tuning).
- Razonamiento de sentido común limitado, evaluado vía HellaSwag, ARC-Easy, ARC-Challenge y PIQA.
- Aritmética básica, evaluada con ArithMark-3.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no, solo inglés.
- Capacidades especiales (thinking mode, visión, audio): no disponible.
- Ranking de opción múltiple mediante el objetivo de entrenamiento final (no expuesto como API separada).

## Casos de uso

- Investigación en dinámicas de entrenamiento a escala tiny: el modelo sirve como banco de pruebas reproducible para estudiar cómo afectan la profundidad, el tamaño del tokenizador y la mezcla de datos al rendimiento en benchmarks de sentido común, gracias a su tamaño de 0,8 M y su entrenamiento documentado sobre 180 M tokens.
- Ablaciones de tokenización: con un vocabulario de 1.536 tokens, permite medir el impacto del tamaño del vocabulario en la eficiencia de parámetros y en la calidad de la generación en modelos sub-millón.
- Benchmarking de evaluación zero-shot: útil para validar pipelines de `lm-evaluation-harness` y scripts de ArithMark-3 en modelos extremadamente pequeños, comparando contra la Open SLM Leaderboard.
- Estudio de objetivos de ranking: la inclusión del objetivo de opción múltiple en la fase final permite analizar su efecto en tareas de elección frente a objetivos puramente de modelado de lenguaje.
- Docencia y divulgación: modelo didáctico para explicar arquitecturas transformer, RoPE, gating y atención deslizante con un coste computacional mínimo.
- Pruebas de integración de `trust_remote_code`: sirve para verificar flujos de carga de modelos con código personalizado en `transformers` sin requerir hardware significativo.

## Benchmarks y rendimiento

Evaluación zero-shot en float32, sobre todos los ítems de cada conjunto (sin submuestreo). Mejor puntuación por columna en negrita según la model card.

| Modelo | Params | HellaSwag | ARC-Easy | ARC-Challenge | PIQA | ArithMark-3 | Intelligence Index |
|:---|:---:|:---:|:---:|:---:|:---:|:---:|:---:|
| **Vertex Pico v2** | 0,80M | 28,49 | 32,20 | **23,72** | 55,06 | 28,00 | 5,84 |
| Vertex Pico v1 | 0,80M | 27,49 | 32,03 | 21,59 | 54,24 | 28,30 | 4,68 |
| Ember | 2,87M | 27,35 | **33,25** | 21,08 | 54,41 | 32,90 | 5,94 |
| CMA-1M-Mini | 0,96M | **29,35** | 29,29 | 21,76 | 54,62 | 31,20 | 5,78 |
| GPT-S-1.4M | 1,43M | 26,89 | 31,57 | 21,93 | **55,17** | 30,20 | 5,40 |
| Sol Nano | 2,90M | 28,40 | 32,07 | 21,16 | 53,92 | **33,80** | **6,07** |

HellaSwag, ARC y PIQA se evaluaron con `lm-evaluation-harness` (acc_norm); ArithMark-3 con el script oficial. El Intelligence Index sigue la fórmula de la Open SLM Leaderboard.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en float32 (0,8 M de parámetros); en la práctica cabe en cualquier GPU consumer, CPU o incluso en memoria de un dispositivo móvil.
- GPU recomendadas: cualquier GPU moderna (RTX 4090, A100, H100) es sobredimensionada; el modelo funciona en CPU sin problema.
- Cabe en consumer GPU: sí, en cualquier GPU consumer e incluso en CPU.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y el uso de `custom_code` puede complicar su conversión a GGUF.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Params | Contexto | Intelligence Index | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Vertex Pico v2 | 0,80M | 1.024 (hasta 2.048 posiciones) | 5,84 | Apache 2.0 | Hugging Face |
| Vertex Pico v1 | 0,80M | no disponible | 4,68 | no disponible | Hugging Face |
| CMA-1M-Mini | 0,96M | no disponible | 5,78 | no disponible | Open SLM Leaderboard |
| GPT-S-1.4M | 1,43M | no disponible | 5,40 | no disponible | Open SLM Leaderboard |
| Ember | 2,87M | no disponible | 5,94 | no disponible | Open SLM Leaderboard |
| Sol Nano | 2,90M | no disponible | 6,07 | no disponible | Open SLM Leaderboard |

Vertex Pico v2 destaca por obtener el mejor ARC-Challenge (23,72) de la comparativa con solo 0,8 M de parámetros, aunque queda por debajo de Sol Nano (6,07) y Ember (5,94) en el índice agregado, y por debajo de CMA-1M-Mini en HellaSwag.

## Limitaciones y advertencias

- Es un base model sin instruction tuning: no sigue instrucciones ni mantiene diálogos coherentes.
- El texto generado es frecuentemente incoherente y factualmente incorrecto; el propio autor indica que no debe usarse para nada que importe.
- Ventana de contexto muy limitada (1.024 tokens de atención deslizante, 2.048 posiciones), insuficiente para documentos o conversaciones largas.
- Solo soporta inglés.
- Riesgo elevado de alucinación inherente a su escala y a su entrenamiento sobre datos mayoritariamente educativos y sintéticos.
- Sesgos: no documentados explícitamente, pero la mezcla de datos (Wikipedia, FineWeb-Edu, etc.) puede introducir sesgos de dominio y de representación propios de esas fuentes.
- Restricciones de licencia: el modelo es Apache 2.0, pero ClimbMix, uno de los datasets de entrenamiento, está licenciado CC-BY-NC 4.0, lo que puede condicionar el uso comercial derivado de los pesos.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código personalizado del autor; conviene auditar el código antes de cargarlo en entornos de producción.
- No apto para producción, atención al cliente, generación de código ni tareas de razonamiento fiables.

## Enlaces

- Hugging Face: https://huggingface.co/VertexResearch/Vertex-Pico-v2
- Open SLM Leaderboard (referenciado en la model card): no disponible como URL en la información proporcionada
- Repositorio de `lm-evaluation-harness` (herramienta de evaluación citada): no disponible como URL en la información proporcionada
- Script oficial de ArithMark-3: no disponible como URL en la información proporcionada
