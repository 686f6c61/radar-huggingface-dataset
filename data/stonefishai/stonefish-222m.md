# StonefishAI/stonefish-222m

## Resumen

StonefishAI v2 222M es un modelo de lenguaje en inglés de 222.331.904 parámetros entrenado desde cero por StonefishAI. Su particularidad no es el rendimiento, sino la implementación: todo el stack (autograd, tokenizador BPE a nivel de byte, transformer y kernels CUDA) está escrito a mano en Rust sin dependencias externas, y se distribuye junto al código de inferencia en el repositorio del autor. El modelo es un transformer decoder-only pre-norm de 16 capas, anchura 1024 y 8 cabezas, con contexto de 512 tokens y vocabulario de 16.384 tokens.

El entrenamiento se hizo sobre TinyStories v2 y Project Gutenberg en inglés, con exactamente 2.047.457.313 tokens (una época) y 62.483 pasos en una única RTX 5070 de 12 GB durante unas 56 horas. La relación de 9,2 tokens por parámetro está deliberadamente por debajo de lo que recomiendan los estudios de escalado: el autor lo describe como un modelo limitado por cómputo, no por datos.

Su relevancia es doble: por un lado, sirve como caso de estudio reproducible de entrenamiento de un LLM completo en hardware de consumo; por otro, es una implementación de referencia en Rust con cero dependencias. No es un modelo para producción: no ha pasado por ajuste de instrucciones ni por alineamiento de seguridad, y el propio autor desaconseja su uso para preguntas y respuestas, chat, hechos, código o traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer decoder-only, pre-norm |
| Parametros totales | 222.331.904 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (checkpoint en fp32; el autor no documenta cuantizaciones) |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (código y pesos); corpus con sus propias licencias |
| Formato de pesos | `stonefish_en.final.state` (formato propio `SFEN001`, 848 MB); no safetensors ni GGUF |

Especificaciones adicionales reportadas por el autor:

| Parametro | Valor |
|---|---|
| Capas / anchura / cabezas | 16 / 1024 / 8 (d_head 128) |
| Vocabulario | 16.384 (BPE a nivel de byte) |
| Normalizacion | RMSNorm, sin bias, eps 1e-6 |
| Activacion | SwiGLU, hidden 2816 |
| Posicion | RoPE, theta 10.000 |
| Tying | la cabeza de salida reutiliza el embedding de tokens |
| Precision | fp32 |
| Tokenizador | `tiny.bpe` (126 KB), obligatorio junto al checkpoint |
| Tamano del repo | 0,9 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con pre-norm, 16 capas, anchura 1024 y 8 cabezas de atención con dimensión por cabeza de 128. Usa RMSNorm sin bias (eps 1e-6), activación SwiGLU con dimensión oculta 2816, embeddings posicionales rotatorios RoPE con theta 10.000 y peso atado entre la cabeza de salida y el embedding de tokens. El vocabulario es de 16.384 tokens con BPE a nivel de byte. El checkpoint se guarda en fp32 en un formato propio (`SFEN001`).

El entrenamiento usó TinyStories v2 y Project Gutenberg en inglés, con 2.047.457.313 tokens en exactamente una época, repartidos en 62.483 pasos con un batch efectivo de 32.768 tokens por paso (4 secuencias por acumulación de gradiente de 16). Optimizador Adam (0,9 / 0,999, eps 1e-6), pico de learning rate 4e-4, 1.000 pasos de warmup, decaimiento coseno y recorte de gradiente 1.0. Dropout de 0,1. Todo el entrenamiento se ejecutó en una RTX 5070 de 12 GB a 250 W durante unas 56 horas, con un throughput de aproximadamente 10.700 tokens/s. No se documenta RLHF, DPO ni ningún ajuste posterior al preentrenamiento.

La innovación técnica no está en la arquitectura, sino en la ingeniería: autograd, tokenizador, transformer y kernels CUDA implementados a mano en Rust sin dependencias. La ruta de generación con CUDA usa KV-cache en GPU (más de 100 tokens/s); la ruta de CPU carga el mismo checkpoint en el modelo de CPU a través del motor de autograd, a unos 3 tokens/s.

## Capacidades

- Generación de texto en inglés por continuación de prompt: es la única tarea para la que el modelo está pensado.
- Modelo base sin ajuste de instrucciones: no responde a preguntas ni mantiene conversaciones de forma fiable.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta visión, audio ni modo de pensamiento.
- No soporta generación de código ni traducción de forma fiable (desaconsejado explícitamente por el autor).
- Multilingüe: no; solo inglés.
- Implementación de referencia: sirve para estudiar un LLM completo sin framework subyacente.
- El contexto máximo efectivo es de 512 tokens, insuficiente para documentos largos o diálogos extensos.

## Casos de uso

- Estudio de implementaciones desde cero: el modelo y su código permiten trazar el pipeline completo (tokenizador BPE, autograd, atención, kernels CUDA) sin capas de abstracción de PyTorch o similares, lo que lo hace útil en docencia y en auditoría de arquitecturas.
- Reproducción de entrenamiento en hardware de consumo: con 56 horas en una RTX 5070 de 12 GB, sirve como referencia para calibrar expectativas de coste y throughput en proyectos de preentrenamiento a pequeña escala.
- Generación de texto creativo corto en inglés: continuación de relatos y fragmentos narrativos de hasta 512 tokens, aprovechando que el corpus incluye TinyStories (cuentos infantiles) y clásicos de Gutenberg.
- Benchmark de infraestructura de inferencia: comparar la ruta CUDA con KV-cache (más de 100 tokens/s) frente a la ruta CPU (unos 3 tokens/s) para medir el impacto del backend en un mismo checkpoint.
- Pruebas de tokenizadores BPE a nivel de byte: el par checkpoint + `tiny.bpe` permite validar implementaciones de tokenización contra un vocabulario de 16.384 tokens entrenado sobre el mismo corpus.
- Base para experimentos de ajuste fino: al ser un modelo pequeño y con licencia MIT, es un punto de partida barato para probar recetas de fine-tuning, aunque el autor no documenta ninguna y el contexto de 512 tokens limita los formatos de instrucción.
- Validación de formatos de checkpoint propios: el formato `SFEN001` y el requisito de colocar `tiny.bpe` junto al checkpoint sirven para probar cargadores y herramientas de conversión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a la sección 7 del README del repositorio principal para la pérdida de validación, perplejidad, bits por carácter y muestras de generación, con el comando exacto que produjo cada cifra, pero no duplica esos números en Hugging Face. No se dispone de MMLU, HumanEval, GSM8K ni métricas equivalentes.

Datos de rendimiento de entrenamiento e inferencia reportados por el autor:

| Metrica | Valor |
|---|---|
| Throughput de entrenamiento | ~10.700 tokens/s |
| Hardware de entrenamiento | 1x RTX 5070 (12 GB), 250 W |
| Duracion del entrenamiento | ~56 horas |
| Inferencia con CUDA (KV-cache en GPU) | ~100+ tokens/s |
| Inferencia en CPU | ~3 tokens/s |

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint en fp32 ocupa 848 MB; con overhead de activaciones y KV-cache para 512 tokens, cabe holgadamente en GPUs de 4-6 GB. No se documentan cuantizaciones, por lo que no hay cifras para fp16, int8 o int4.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos ~2-4 GB libres; el autor entrenó en una RTX 5070 de 12 GB. No se especifican modelos concretos para inferencia más allá de la ruta CUDA genérica.
- Cabe en GPU de consumo: sí, con margen amplio, dado el tamaño del checkpoint y el contexto de 512 tokens.
- Opciones de despliegue: exclusivamente el binario Rust del repositorio (`cargo build --release`, con `--no-default-features` para compilar sin CUDA). No hay soporte para vLLM, llama.cpp, Ollama ni TGI, y los pesos no están en safetensors ni GGUF.
- Latencia y throughput: ~100+ tokens/s con CUDA y KV-cache; ~3 tokens/s en CPU. No se reportan latencias de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| StonefishAI v2 222M | 222,3 M | 512 | en | MIT | formato propio `SFEN001` | Preentrenado desde cero en Rust sin dependencias; sin ajuste de instrucciones |
| TinyLlama 1.1B | 1.100 M | 2.048 | en (principalmente) | Apache 2.0 | safetensors, GGUF | Preentrenado sobre ~3 billones de tokens; mucho mayor y con ecosistema estándar |
| GPT-2 small | 124 M | 1.024 | en | MIT | safetensors, GGUF | Referencia histórica de modelo base pequeño; contexto mayor y ecosistema amplio |
| Pythia-160M | 160 M | 2.048 | en | Apache 2.0 | safetensors | Suite de modelos de estudio con checkpoints intermedios y amplia documentación |

La comparación es estructural, no de rendimiento: no hay benchmarks publicados de StonefishAI v2 que permitan situarlo frente a estas alternativas. Las diferencias relevantes son el contexto (512 frente a 1.024-2.048), el ecosistema (formato propio frente a safetensors/GGUF) y la ausencia de ajuste de instrucciones.

## Limitaciones y advertencias

- No ha pasado por ajuste de instrucciones: no es apto para preguntas y respuestas, chat, hechos, generación de código ni traducción, según el propio autor.
- Alucinación: el autor advierte que el modelo "afirma hechos inventados con fluidez".
- Sin alineamiento de seguridad: un prompt hostil puede producir continuaciones sesgadas o desagradables; no hay moderación ni filtros.
- Sesgos de los datos: el corpus combina cuentos infantiles (TinyStories) con un canon occidental mayoritariamente del siglo XIX (Project Gutenberg), y arrastra los puntos ciegos de esas fuentes.
- Contexto limitado a 512 tokens: insuficiente para documentos largos, diálogos extensos o RAG con múltiples fragmentos.
- Solo inglés: no hay capacidades multilingües documentadas.
- Licencia: MIT para código y pesos, lo que permite uso comercial de los pesos, pero los corpus conservan sus licencias (TinyStories: CDLA-Sharing-1.0; Gutenberg: dominio público en EE. UU.), y por eso el autor no redistribuye datos. Cualquier reentrenamiento o derivado debe revisar esas condiciones.
- Dependencia de código externo: los pesos no son utilizables sin el tokenizador `tiny.bpe` ni sin el binario Rust del repositorio; no hay integración con frameworks estándar.
- Modelo limitado por cómputo: 9,2 tokens por parámetro, menos de la mitad de lo recomendado en estudios de escalado, lo que sugiere que la calidad está por debajo de lo que su tamaño podría alcanzar con más datos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StonefishAI/stonefish-222m
- Repositorio principal (código de inferencia y entrenamiento): https://github.com/Edipcm-hash/stonefish
- Dataset TinyStories: https://huggingface.co/datasets/roneneldan/TinyStories
- Dataset Project Gutenberg (sedthh): https://huggingface.co/datasets/sedthh/gutenberg_english
