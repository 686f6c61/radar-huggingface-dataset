# Sqersters/MinVoid-1.0

## Resumen

MinVoid-1.0 es un modelo de lenguaje causal de arquitectura decoder-only desarrollado por el usuario Sqersters, entrenado desde cero con un enfoque radicalmente minimalista: no utiliza tokenizador. El texto de entrada se codifica directamente como bytes UTF-8, de modo que el vocabulario efectivo es de 258 tokens (bytes 0-255 más BOS y EOS). Con solo 2.959.232 parámetros, se posiciona en la categoria de small language models (SLM), pensado para experimentacion e investigacion en entornos con recursos muy limitados.

La arquitectura incorpora dos innovaciones tecnicas destacables: Grouped Latent Attention (GLA, arXiv:2505.21487), que almacena latentes en lugar de claves y valores completos en la KV cache (128 valores por token y capa), y Exclusive Self-Attention (XSA, arXiv:2603.09078), que resta de la salida de atencion su proyeccion sobre el vector de valor propio. El modelo fue entrenado con aproximadamente 250 millones de tokens en unos 45 minutos sobre una unica GPU de consumo.

Aunque sus resultados en benchmarks son modestos y cercanos al azar en varias tareas, su interes reside en la combinacion de byte-level modeling, atencion con latentes agrupados y un coste de entrenamiento e inferencia minimo. La licencia Apache-2.0 permite uso comercial sin restricciones significativas, si bien la implementacion de la arquitectura no esta incluida en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Grouped Latent Attention (GLA) y Exclusive Self-Attention (XSA) |
| Parametros totales | 2.959.232 (2,96 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/cuantizadas) |
| Idiomas soportados | no disponible (entrenamiento principalmente en ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 6 capas con d_model = 128, 4 cabecas de query (d_head 32), 2 cabecas latentes para GLA (d_latent 64) y una FFN SwiGLU con hidden de 1120 (aproximadamente 8,8x d_model). Usa pre-RMSNorm, RoPE con theta 10000 y embeddings de entrada/salida atados. La KV cache almacena latentes (128 valores por token y capa), lo que reduce el coste de memoria de atencion frente a una cache clasica de claves y valores. XSA modifica la salida de atencion restándole su proyeccion sobre el vector de valor propio, una tecnica descrita en arXiv:2603.09078.

El entrenamiento se realizo sobre aproximadamente 250 millones de tokens (~4,2 GB de texto mezclado en ingles) que incluyen light novels, TinyStories, wikitext-103, OASST1, datos de instruccion alpaca/dolly, corpus de conversacion cotidiana, problemas matematicos estilo GSM8K, MathInstruct, OpenMathReasoning-CoT y corpus de diccionarios y citas. Los splits de evaluacion y benchmark fueron excluidos. No se documenta explicitamente el uso de RLHF, DPO ni otras fases de alineamiento posteriores al preentrenamiento. El entrenamiento completo requirio unos 45 minutos en una unica GPU de consumo.

## Capacidades

- Generacion de texto causal autoregresiva a nivel de bytes, sin tokenizador.
- Codificacion directa de texto UTF-8: `encode(s) = list(s.encode('utf-8'))` y `decode(ids) = bytes(ids).decode('utf-8', errors='replace')`.
- Razonamiento aritmetico basico y resolucion de problemas matematicos sencillos (entrenado con GSM8K-style y MathInstruct).
- Seguimiento de instrucciones y conversacion (entrenado con OASST1, alpaca/dolly y corpus conversacionales).
- Capacidad multilingue potencial a nivel de bytes, aunque el entrenamiento es predominantemente en ingles; no se documentan idiomas oficialmente soportados.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni modo thinking.

## Casos de uso

- Investigacion en byte-level language modeling: permite estudiar como un modelo sin tokenizador aprende representaciones a partir de bytes UTF-8, con un coste computacional minimo y reproducible en una GPU de consumo.
- Experimentacion con GLA y XSA: sirve como banco de pruebas para validar tecnicas de atencion con latentes agrupados y self-attention exclusiva en un modelo de menos de 3 M de parametros.
- Prototipado rapido de pipelines de generacion de texto: al ser un modelo de 2,96 M de parametros, se puede cargar y ejecutar en entornos con muy poca memoria, lo que agiliza la iteracion sobre infraestructura de inferencia.
- Educacion y docencia: la implementacion completa ocupa aproximadamente 150 lineas segun el autor, lo que lo convierte en un caso de estudio adecuado para explicar transformers, RoPE, SwiGLU y KV cache.
- Generacion de texto corto y completado de frases en ingles: util para tareas de baja exigencia como autocompletado simple o generacion de texto de relleno, dado su contexto de 512 tokens.
- Pruebas de robustez frente a errores de codificacion UTF-8: al operar directamente sobre bytes, permite evaluar el comportamiento del modelo ante secuencias malformadas o caracteres multibyte.
- Baseline para comparaciones de SLM: sirve como referencia minima en estudios comparativos de modelos pequenos entrenados desde cero.

## Benchmarks y rendimiento

Resultados 0-shot segun el protocolo Open SLM Leaderboard, evaluados con `lm-evaluation-harness` y el protocolo oficial de ArithMark-3:

| Benchmark | Puntuacion |
|---|---|
| HellaSwag (acc_norm) | 25,93 |
| ARC-Easy (acc_norm) | 26,43 |
| ARC-Challenge (acc_norm) | 24,32 |
| Combined ARC | 25,37 |
| PIQA (acc_norm) | 51,41 |
| ArithMark-3 (acc_norm) | 29,80 |
| Int Index | 2,39 |

El autor define Combined ARC como la media de ARC-Easy y ARC-Challenge antes de normalizar; N(score, chance) = 100*(score-chance)/(100-chance) con chance 25/25/50/25; e Int Index = (HellaSwag + ARC + PIQA + 0,65*ArithMark-3)/3,65. No se proporcionan comparaciones directas con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa (2,96 M de parametros equivalen a unos 12 MB en fp32 y unos 6 MB en fp16); el overhead de runtime depende del framework.
- GPU recomendadas: cualquier GPU de consumo moderna es suficiente; el autor entreno el modelo en una unica GPU de consumo en unos 45 minutos.
- Cabe en cualquier GPU de consumo y tambien en CPU, dado el tamano reducido.
- Opciones de despliegue: no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI; al ser una arquitectura personalizada cuya implementacion no esta incluida, es necesario reimplementarla a partir de `config.json` (aproximadamente 150 lineas segun el autor).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MinVoid-1.0 | 2,96 M | 512 | Byte-level (258 tokens) | Apache-2.0 | Hugging Face (pesos safetensors) |
| TinyStories-1M (aproximado) | ~1 M | no disponible | BPE | no disponible | Hugging Face |
| SmolLM-135M | 135 M | no disponible | BPE | Apache-2.0 | Hugging Face |

La comparativa con TinyStories y SmolLM se ofrece como referencia de categoria (SLM entrenados desde cero); no se dispone de datos de rendimiento comparables en la informacion proporcionada para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Rendimiento cercano al azar en varias tareas: HellaSwag 25,93, ARC-Easy 26,43, ARC-Challenge 24,32 y PIQA 51,41 indican una capacidad de razonamiento muy limitada; no es adecuado para tareas de produccion que exijan precision.
- Riesgo elevado de alucinacion y de generar texto incoherente, especialmente fuera de dominios vistos en entrenamiento.
- Contexto muy corto (512 tokens), lo que limita conversaciones multi-turno y documentos largos.
- Entrenamiento predominantemente en ingles; el soporte multilingue no esta documentado ni evaluado.
- La implementacion de la arquitectura no esta incluida en el repositorio; es necesario reimplementarla a partir de `config.json`, lo que introduce riesgo de discrepancias.
- No se documentan sesgos conocidos ni evaluaciones de seguridad; al entrenarse con corpus diversos (light novels, wikitext, OASST1, etc.) puede heredar sesgos de esas fuentes.
- La licencia Apache-2.0 permite uso comercial de los pesos, pero no se ofrece garantia alguna sobre calidad o idoneidad para produccion.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sqersters/MinVoid-1.0
- Paper GLA (Grouped Latent Attention): https://arxiv.org/abs/2505.21487
- Paper XSA (Exclusive Self-Attention): arXiv:2603.09078 (referenciado en la model card; no se proporciona URL directa en la informacion disponible)
