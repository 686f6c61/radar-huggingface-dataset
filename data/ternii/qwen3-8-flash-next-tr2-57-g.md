# Ternii/Qwen3.8-Flash-Next-TR2.57-G

## Resumen

Qwen3.8-Flash-Next-TR2.57-G es una cuantización ternaria del modelo Qwen3.8-Flash-Next, publicada por el usuario Ternii (Wai Chung) bajo la licencia Qwen Community 1.0. No se trata de un modelo nuevo entrenado desde cero, sino de una traducción de los pesos originales en BF16 a un formato de trits (dígitos ternarios) con una media de 2,57 trits por peso, sin reentrenamiento ni ajuste fino: la arquitectura, el tokenizador y la plantilla de chat son los de Qwen. El objetivo es reducir el espacio en memoria y acelerar la decodificación para poder servir un modelo de gran tamaño en hardware modesto, concretamente en una única NVIDIA DGX Spark de 128 GB.

El modelo base, Qwen3.8-Flash-Next, es un transformer de tipo Mixture-of-Experts (MoE) de aproximadamente 180B parámetros totales, con 125B en el modelo principal (6B activados por token) más 51B de embeddings n-gram y 4B de cabeza MTP (multi-token prediction). Esta cuantización conserva los enrutadores, las normas, las conexiones hiperbólicas y la cabeza MTP en BF16, y almacena los expertos enrutados con dos profundidades distintas: los expertos más usados por el enrutador se guardan con 3 trits y el resto con 2, cada uno con una escala de 16 bits por grupo de pesos.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de cuantización extrema (por debajo de 3 bits por peso) aplicada a un MoE de gran escala; por otro, muestra un caso de despliegue real en hardware de consumo profesional. El repositorio ocupa 104,3 GB, los pesos en memoria de GPU con la cabeza MTP suman 63,84 GiB y el modelo se sirve con vLLM 0.32.0 mediante el plugin `tritq-qwen38`. El modelo solo declara soporte de inglés y no admite inferencia directa en el hub (`inference: false`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con embeddings n-gram y cabeza MTP; pesos cuantizados a trits |
| Parametros totales | 40.165.408.163 (safetensors del repo); el modelo base declara ~180B totales (125B principales + 51B n-gram + 4B MTP) |
| Parametros activos | 6B por token (modelo base) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de despliegue usa `--max-model-len 8192`) |
| Tipos de cuantizacion | TR Quantisation: media de 2,57 trits por peso, rejilla simétrica de 9 o 27 niveles, una escala de 16 bits por grupo; expertos enrutados a 3 o 2 trits según frecuencia de uso; códigos calibrados con GPTQ (-G) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | Safetensors (tensores trit empaquetados) + `ngram_tq27.bin` (tabla de embeddings n-gram empaquetada en filas de 3 trits) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 125B parámetros en el modelo principal y 6B activados por token, complementado con 51B de embeddings n-gram y una cabeza de predicción multi-token (MTP) de 4B. La cuantización TR no modifica la arquitectura: mantiene los enrutadores, las conexiones hiperbólicas, las normas y la cabeza MTP en BF16, y solo transforma los pesos de los expertos enrutados a trits empaquetados. La tabla de embeddings n-gram se almacena aparte en `ngram_tq27.bin` y el runtime la lee desde el SSD, de modo que no necesita caber en memoria. Los códigos ternarios se calibraron con GPTQ, de ahí el sufijo `-G` del nombre.

No hay reentrenamiento ni ajuste fino: los pesos se derivan directamente del checkpoint BF16 de Qwen (revisión `de4b8e4d`) y no de ningún checkpoint de NVIDIA. Los datasets listados en las etiquetas del repositorio (OpenCodeInstruct, Hendrycks Math, GSM8K, OASST2) corresponden al material de calibración y evaluación, no a un entrenamiento nuevo. La innovación técnica principal es la decodificación especulativa mediante MTP con umbral de confianza (`num_speculative_tokens: 6`, `draft_confidence_threshold: 0.7`, `draft_confidence_fallback_depth: 3`), que el autor mide como el principal responsable de la velocidad de decodificación.

## Capacidades

- Generación de texto y conversación multi-turno en inglés.
- Razonamiento matemático, incluido multilingüe en 11 idiomas según la evaluación MGSM del autor (aunque el modelo solo declara inglés como idioma soportado).
- Generación de código y resolución de problemas de programación (HumanEval+, MBPP+, LiveCodeBench).
- Function calling / tool calling, evaluado con BFCL v4.
- Seguimiento de instrucciones estrictas (IFEval).
- Modo de razonamiento explícito ("thinking"), desactivable mediante `chat_template_kwargs: {"enable_thinking": false}`; la evaluación con thinking activo se realizó en LiveCodeBench con 32k tokens.
- Decodificación especulativa con cabeza MTP integrada.
- Sin capacidades de visión: el codificador visual fue eliminado del repositorio (`--language-model-only`).

## Casos de uso

- Asistencia de código en producción: el modelo obtiene 92,07 en HumanEval+ y 79,10 en MBPP+, y soporta function calling (74,04 en BFCL v4), por lo que puede integrarse en pipelines de CI/CD o en asistentes de IDE que necesiten invocar herramientas externas.
- Razonamiento matemático y tutoría: con 92,11 en GSM8K y 89,96 en MGSM (11 idiomas), es adecuado para resolución de problemas paso a paso y para escenarios educativos donde se requiera verificación de cálculos.
- Agentes multi-paso con herramientas: la combinación de function calling, modo thinking y contexto de 8k tokens en el despliegue de referencia permite construir agentes que encadenen llamadas a APIs con razonamiento intermedio.
- Despliegue en hardware de una sola máquina: al ocupar 63,84 GiB de pesos en GPU, cabe en una DGX Spark de 128 GB y permite servir un MoE de escala ~180B sin clúster, lo que lo hace útil para prototipado y entornos de investigación con presupuesto limitado.
- Evaluación comparativa de técnicas de cuantización: sirve como referencia para estudiar el impacto de la cuantización ternaria frente a NVFP4 o FP8 en tareas de código, matemáticas e instrucciones.
- Servicio de inferencia compatible con OpenAI: al exponerse mediante vLLM con API compatible con OpenAI en `http://localhost:8000/v1`, puede conectarse a clientes existentes sin cambios en la aplicación.
- Generación de código con razonamiento extendido: con thinking activo y hasta 32k tokens, es adecuado para tareas de LiveCodeBench donde se requiere exploración de soluciones antes de responder.

## Benchmarks y rendimiento

| Benchmark | TR2.57-G | NVIDIA NVFP4 | Qwen FP8 (original) |
|---|---|---|---|
| GSM8K (1.319, 8 peticiones en vuelo) | 92,11 | 91,85 | 91,96 |
| HumanEval+ | 92,07 | 93,90 | 92,68 |
| MBPP+ | 79,10 | 78,84 | 79,10 |
| IFEval (prompt strict) | 83,73 | 84,84 | no ejecutado |
| MGSM (11 idiomas) | 89,96 | 89,13 | no ejecutado |
| BFCL v4 function calling | 74,04 | 72,20 | no ejecutado |
| LiveCodeBench, thinking, 32k tokens (454) | 64,54 | 61,45 | 64,98 |

| Métrica de eficiencia | TR2.57-G | NVIDIA NVFP4 | Qwen FP8 |
|---|---|---|---|
| Pesos en GPU con cabeza MTP | 63,84 GiB | 75,63 GiB | no disponible |
| Descarga del repositorio | 104,35 GB | 132,73 GB | no disponible |
| Decodificación, 1 usuario (tokens/s) | 84,3 | 40,5 | no ejecutado |
| Decodificación, 6 usuarios (tokens/s totales) | 95,2 | 62,0 | no disponible |

El autor indica que las diferencias de precisión no son estadísticamente significativas y advierte que, con estos tamaños de test, una diferencia de 2-3 puntos en HumanEval+ o LiveCodeBench no sería detectable. La velocidad se midió solo con prompts en inglés y no se comparó el procesamiento de prompt (prompt processing). El checkpoint de NVIDIA se ejecutó sin ajustar y con la tabla n-gram leída mediante la búsqueda respaldada por disco del autor, no con una configuración estándar.

## Requisitos de hardware

- VRAM estimada: 63,84 GiB de pesos en memoria de GPU incluyendo la cabeza MTP; el ejemplo de despliegue reserva 10 GiB de caché KV (`--kv-cache-memory-bytes 10737418240`) y usa `--gpu-memory-utilization 0.85`.
- GPU recomendadas: NVIDIA DGX Spark de 128 GB (configuración de referencia, un servidor por máquina). No se documentan otras GPU en la información disponible.
- Cabe en GPU de consumo: no se confirma; 63,84 GiB de pesos exceden la VRAM de las GPU de consumo habituales (RTX 4090 con 24 GB, por ejemplo). No disponible para otras configuraciones.
- Almacenamiento: se recomienda mantener el modelo en un NVMe local, ya que la tabla n-gram (`ngram_tq27.bin`) se lee desde el SSD durante la ejecución.
- Opciones de despliegue: vLLM 0.32.0 con el plugin `tritq-qwen38` (imagen Docker `ghcr.io/ternii-ai/tritq-qwen38:0.3`), API compatible con OpenAI. Para Mac y llama.cpp existe una variante experimental distinta (`Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF`, con todos los pesos a 3 trits).
- Arranque: la primera ejecución tarda unos 11-12 minutos por compilación de kernels, salvo que se monte un directorio de caché.
- Latencia y throughput: 84,3 tokens/s en decodificación con 1 usuario y 95,2 tokens/s totales con 6 usuarios, medidos en una DGX Spark.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (GSM8K / HumanEval+) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-TR2.57-G | ~180B totales, 6B activos | no disponible (despliegue a 8k) | 92,11 / 92,07 | Qwen Community 1.0 | Hugging Face, vLLM con plugin |
| NVIDIA NVFP4 (checkpoint del mismo base) | ~180B totales, 6B activos | no disponible | 91,85 / 93,90 | según checkpoint de NVIDIA | checkpoint NVFP4 |
| Qwen3.8-Flash-Next FP8 (original) | ~180B totales, 6B activos | no disponible | 91,96 / 92,68 | Qwen Community 1.0 | Hugging Face (Qwen) |
| Qwen3.8-Flash-Next BF16 (base) | ~180B totales, 6B activos | no disponible | no disponible | Qwen Community 1.0 | Hugging Face (Qwen) |

La comparación se limita a las variantes del mismo modelo base, ya que no se proporcionan datos de modelos de otros desarrolladores con características equiparables.

## Limitaciones y advertencias

- Solo se declara soporte de inglés; el rendimiento en otros idiomas no está garantizado pese a la evaluación MGSM multilingüe.
- El modelo no admite inferencia directa en el hub (`inference: false`); requiere el runtime específico `tritq-qwen38` con vLLM 0.32.0.
- El procesamiento de prompt (prompt processing) no se comparó con las alternativas, por lo que el rendimiento en cargas con prompts largos es desconocido.
- Las mediciones de velocidad se realizaron únicamente con prompts en inglés y sobre una sola DGX Spark; no hay datos de escalado a otras configuraciones.
- Riesgo de alucinación no cuantificado en la información disponible; como todo modelo generativo, puede producir contenido incorrecto, especialmente en modo thinking con contextos largos.
- La licencia Qwen Community 1.0 impone condiciones de uso comercial que deben revisarse en el archivo `LICENSE` del repositorio; no es una licencia permisiva tipo Apache 2.0.
- El modelo elimina el codificador visual; no admite entradas de imagen.
- La tabla n-gram se lee desde disco en tiempo de ejecución, lo que introduce dependencia de un NVMe local y puede afectar a la latencia si el almacenamiento es lento.
- El arranque inicial requiere compilación de kernels (11-12 minutos) salvo que se monte un directorio de caché.
- La cuantización ternaria es agresiva; aunque el autor reporta diferencias no significativas, no se garantiza equivalencia exacta con el modelo BF16 en todas las tareas.
- No se han publicado datos de sesgos en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR2.57-G
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del modelo base en GitHub: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Runtime y plugin de vLLM: https://github.com/ternii-ai/tritq-vllm
- Variante GGUF experimental (3 trits): https://huggingface.co/Ternii/Qwen3.8-Flash-Next-TR3-G-GGUF
