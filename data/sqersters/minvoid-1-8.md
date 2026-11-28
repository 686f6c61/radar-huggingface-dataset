# Sqersters/MinVoid-1.8

## Resumen

MinVoid-1.8 es un modelo de lenguaje causal byte-level de 2,98 millones de parámetros entrenado desde cero por el desarrollador independiente Sqersters. No emplea pre-tokenización: el texto de entrada se codifica directamente como bytes UTF-8, con un vocabulario de 258 tokens (bytes 0-255 más BOS y EOS). Se trata de la evolucion de MinVoid-1.7, con contexto ampliado de 512 a 768 bytes y un entrenamiento de aproximadamente 2.600 millones de byte-tokens.

La arquitectura es un transformer decoder-only de 9 capas con dos innovaciones destacables: GLA (Grouped Latent Attention) y XSA (Exclusive Self-Attention), descritas en los papers arXiv:2505.21487 y arXiv:2603.09078. Con d_model de 128 y FFN SwiGLU de 704 unidades, el modelo es un ejercicio de investigacion sobre eficiencia extrema y modelos de lenguaje a escala minima, no una herramienta de produccion.

Su relevancia es principalmente academica y experimental: demuestra que es posible entrenar un modelo byte-level funcional en hardware de consumo (una AMD RX 7600 XT con ROCm) y publica resultados en el protocolo Open SLM Leaderboard, con un Int Index de 5,42. Es un modelo base, no ajustado a instrucciones, y su utilidad practica esta limitada por su tamano y su ventana de contexto efectiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GLA (Grouped Latent Attention) y XSA (Exclusive Self-Attention) |
| Parametros totales | 2.984.000 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 768 bytes (tokens byte-level) |
| Tipos de cuantizacion | No disponible (pesos en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | No disponible (entrenado principalmente con texto en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (con custom_code) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 9 capas con d_model de 128, 4 cabezas de consulta (d_head 32) y 2 cabezas latentes para GLA (d_latent 64). La atencion GLA almacena latentes en la KV cache (128 valores por token y capa), lo que reduce el coste de memoria frente a una atencion multi-cabeza convencional. XSA resta a la salida de atencion su proyeccion sobre el vector de valor propio. Emplea RMSNorm en q/k antes de RoPE (theta 10000), normalizacion RMSNorm de bloque paralelo (una norma compartida alimenta atencion y FFN), FFN SwiGLU con hidden 704 (5,5x d_model), embeddings de entrada y salida atados e inicializacion estilo muP.

El entrenamiento consistio en 105.794 pasos de optimizador, aproximadamente 2.600 millones de byte-tokens muestreados, con batch de 32 x secuencia 768, autocast bf16 y schedule coseno. Se exporto el mejor checkpoint de validacion (paso 104.001, aproximadamente 2.556 millones de tokens, perdida de validacion 0.8607). El optimizador es FastNorMuon+AdamW: NorMuon (lr 0.02, momentum/beta2 0.95, wd 0.01) sobre los pesos ocultos 2D y Adam (lr 6e-4) sobre el embedding atado y las ganancias de norma. El corpus (5,15 GB) mezcla novelas ligeras, TinyStories, wikitext-103, wikipedia-markdown, OASST1, alpaca/dolly, conversaciones cotidianas, problemas matematicos GSM8K-style, MathInstruct, OpenMathReasoning-CoT, diccionarios, citas y datos cientificos/QA (sciq, openbookqa, qasc, commonsense_qa, camel-ai, squad, boolq, trivia_qa, cosmopedia-100k). Se entrenó en una AMD RX 7600 XT con ROCm.

## Capacidades

- Generacion de texto causal byte-level: predice el siguiente byte, sin tokenizador subword.
- Razonamiento basico y respuesta a preguntas de sentido comun a nivel muy elemental.
- Aritmetica simple y problemas matematicos de palabra, limitados por el tamano del modelo.
- Comprension de texto en ingles (idioma dominante del corpus de entrenamiento).
- Codificacion y decodificacion directa de UTF-8, lo que permite en teoria procesar cualquier idioma sin vocabulario fijo, aunque el entrenamiento se centro en ingles.
- No soporta tool calling ni function calling de forma nativa.
- No soporta agentes ni razonamiento multi-paso de forma fiable.
- No dispone de modo thinking, vision ni audio.
- No es un modelo ajustado a instrucciones (base model).

## Casos de uso

- Investigacion sobre modelos byte-level: sirve como banco de pruebas reproducible para estudiar GLA y XSA en un regimen de parametros minimo, comparando con variantes de la misma familia (MinVoid-1.7).
- Educacion en arquitecturas transformer: su tamano (2,98M parametros) y su codigo custom permiten inspeccionar el flujo completo de atencion latente y XSA en una sola GPU de consumo.
- Generacion de texto creativo muy corto: continuaciones de frases o parrafos de hasta 768 bytes en ingles, utiles para demos de modelos pequenos.
- Experimentos de destilacion o inicializacion: puede servir como punto de partida para estudiar tecnicas de escalado o curricula de datos en modelos byte-level.
- Evaluacion de pipelines de datos: el corpus y el pipeline descritos permiten reproducir experimentos sobre filtrado, deduplicacion y empaquetado de documentos.
- Pruebas de despliegue ligero: validar integraciones con transformers y custom_code en entornos con recursos minimos (CPU o GPU de gama baja).

## Benchmarks y rendimiento

Resultados 0-shot bajo el protocolo Open SLM Leaderboard, segun la model card:

| Benchmark | Score |
|---|---:|
| HellaSwag (acc_norm) | 28,76 |
| ARC-Easy (acc_norm) | 30,22 |
| ARC-Challenge (acc_norm) | 21,33 |
| Combined ARC | 25,77 |
| PIQA (acc_norm) | 53,05 |
| ArithMark-3 (acc_norm) | 33,80 |
| Int Index | 5,42 |

Evaluado con `lm-evaluation-harness` (HellaSwag, ARC, PIQA) y el protocolo oficial de ArithMark-3. Combined ARC es la media de ARC-E y ARC-C antes de normalizar; `N(score, chance) = 100*(score-chance)/(100-chance)` con chance 25/25/50/25; `Int Index = (HellaSwag + ARC + PIQA + 0.65*ArithMark-3)/3.65`. No se dispone de comparaciones numericas con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en fp32 (2,98M parametros x 4 bytes), por lo que cabe holgadamente en cualquier GPU.
- GPU recomendadas: cualquier GPU moderna; el autor entreno en una AMD RX 7600 XT con ROCm. Funciona en CPU sin problema.
- Cabe en GPU de consumo: si, en todas las RTX (incluso GTX antiguas) y en GPUs integradas.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requerido por el codigo custom); llama.cpp, vLLM, Ollama y TGI no estan confirmados como compatibles en la informacion disponible.
- Latencia y throughput: no disponibles. Por el tamano, se espera latencia muy baja y throughput alto, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| MinVoid-1.8 | 2,98M | 768 bytes | Apache-2.0 | Byte-level, GLA + XSA, Int Index 5,42 |
| MinVoid-1.7 | No disponible | 512 bytes | Apache-2.0 | Predecesor directo, Int Index 5,20 |
| TinyStories-based SLMs | No disponible | No disponible | Variable | Modelos pequenos de narrativa; no disponible comparacion numerica |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Es un modelo base muy pequeno, no ajustado a instrucciones; no debe usarse como asistente conversacional.
- El contexto de 768 bytes es semanticamente mucho mas corto que 768 tokens subword de un modelo con tokenizador convencional.
- Riesgo elevado de alucinacion y de texto incoherente en generaciones largas.
- Entrenado principalmente con texto en ingles; el rendimiento en castellano u otros idiomas no esta medido y probablemente sea pobre.
- Sesgos desconocidos: no se documentan analisis de sesgo; el corpus incluye fuentes diversas (wikitext, OASST1, etc.) con sesgos potenciales.
- Requiere `trust_remote_code=True` por el codigo custom (GLA/XSA), lo que implica ejecutar codigo del autor.
- Licencia Apache-2.0 permite uso comercial, pero la calidad del modelo hace inviable su uso en produccion real.
- No hay garantia de compatibilidad con motores de inferencia estandar distintos de transformers.

## Enlaces

- Hugging Face: https://huggingface.co/Sqersters/MinVoid-1.8
- Paper GLA (Grouped Latent Attention): https://arxiv.org/abs/2505.21487
- Paper XSA (Exclusive Self-Attention): https://arxiv.org/abs/2603.09078
- Repositorio del modelo: no disponible
- Demo: no disponible
