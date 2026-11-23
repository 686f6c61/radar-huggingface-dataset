# spacetime9/QuatTucker-ZigZagGPT-16-95M

## Resumen

QuatTucker-ZigZagGPT-16-95M es un modelo de lenguaje base de 95,31 millones de parametros totales (56,71 millones en el backbone) desarrollado por Shubham Barmase, investigador independiente, y publicado bajo el identificador `spacetime9` en Hugging Face. Implementa la arquitectura Quaternion-Tucker ZigZag Networks v2.0, una propuesta experimental que combina capas lineales cuaternionicas compartidas, descomposicion tensorial de Tucker y un grafo de enrutamiento en zigzag con cuatro "diamantes" apilados. El modelo esta entrenado sobre 2,55 mil millones de tokens y emplea el tokenizador BPE de GPT-2 con un vocabulario de 50.257 entradas.

El interes del modelo no reside en su rendimiento absoluto, sino en la tesis que defiende: que es posible reducir el tamano del backbone de un transformer manteniendo o superando ligeramente a GPT-2 en tareas de comprension zero-shot, y que dicho backbone puede crecer de forma continua (en anchura y profundidad) sin reiniciar el entrenamiento ni sufrir olvido catastrofico. El autor reporta un crecimiento de profundidad de 12 a 16 capas con una diferencia bit a bit nula (`max_diff = 0.000000`) entre el estado previo y el expandido.

Se trata de un checkpoint de investigacion, no de un modelo listo para produccion: requiere cargar el codigo de arquitectura desde un repositorio GitHub externo, usa un formato de pesos `.pt` de PyTorch (no safetensors ni GGUF), solo soporta ingles y su ventana de contexto es de 512 tokens. Su valor es fundamentalmente academico y reproducible, orientado a quienes estudian eficiencia arquitectonica y escalado continuo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | QuatTucker-ZigZagGPT-16 (4 diamantes ZigZag trenzados apilados) |
| Parametros totales | 95,31 M |
| Parametros activos | No aplica (no es MoE); backbone de 56,71 M |
| Longitud de contexto | 512 tokens (`max_len = 512`) |
| Tipos de cuantizacion | no disponible (solo se distribuyen pesos en punto flotante `.pt`) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | PyTorch `.pt` (checkpoint `best_2.5B_depth16.pt`, ~0,4 GB) |

Especificaciones adicionales de la arquitectura:

| Componente | Valor |
|---|---|
| Profundidad y anchura | `L = 16` capas, `d_model = 768`, `n_heads = 12` |
| Atencion | `RoPEFlashAttn` densa por capa (RoPE + RMSNorm + FlashAttention) |
| FFN compartida | `QuatLinear` en cuaterniones de Hamilton, `rank = 8192`, una por diamante de 4 capas |
| Especializacion por profundidad | Nucleo SwiGLU Tucker diagonal por bloques `64x64` real por capa |
| Topologia de enrutamiento | `0 -> 2 -> 1(0.5*(h0+h2)) -> 3(0.5*(h1+h2))` |
| Tokenizador | GPT-2 BPE, `V = 50.257`, embeddings con pesos atados |

## Arquitectura y entrenamiento

La arquitectura sustituye la FFN densa convencional por una GEMM cuaternionica compartida entre las cuatro capas de cada diamante, operando en el algebra de cuaterniones de Hamilton con rango 8192, y anade una especializacion por profundidad mediante un nucleo SwiGLU con descomposicion de Tucker diagonal por bloques de 64x64 en valores reales. La atencion es densa e independiente en cada capa, con RoPE, RMSNorm y FlashAttention. El enrutamiento en zigzag trenzado combina las salidas de las capas 0 y 2, y de las capas 1 y 2, mediante medias aritmeticas antes de alimentar la capa 3. El resultado es un backbone un 33 % mas pequeno que el de GPT-2 (56,71 M frente a 85,0 M).

El entrenamiento se realizo en una unica linea evolutiva sobre una NVIDIA A100 de 40 GB, sin reinicios desde cero. La etapa 1 (controlada, 16,4 M tokens) comparo QuatTucker-12 (77,6 M) con StandardGPT-12 (123,6 M), ganando en 5 de 5 checkpoints (5,3706 frente a 5,4410 de perdida). La etapa 2 a 3 expandio el rango de 6144 a 8192 (+3,5 M parametros, 10,8 veces mas barato que una expansion densa de FFN, `max_diff = 0.0067`). La etapa 3 a 4 anadio un cuarto diamante ZigZag (`L = 12 -> 16`) con identidad bit a bit exacta y entreno 1,0 mil millones de tokens pre-tokenizados en `memmap` con la mezcla 60 % FineWeb-Edu, 25 % Cosmopedia-v2 y 15 % OpenWebMath, a 60,7 mil tokens por segundo y con 41 de 41 caidas monotonas de validacion. No se documenta RLHF ni DPO; es un modelo base.

## Capacidades

- Generacion de texto autoregresiva en ingles, con modelado de lenguaje causal estandar.
- Razonamiento de sentido comun y logica basica a nivel de modelo pequeno (HellaSwag, WinoGrande).
- Comprension lectora y respuesta a preguntas booleanas (BoolQ).
- Conocimiento cientifico elemental (ARC-Easy).
- Razonamiento matematico basico, dado que el 15 % del corpus de la etapa final fue OpenWebMath.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso explicito.
- No dispone de modo "thinking", vision ni audio.
- Multilingue: no, exclusivamente ingles.
- Existe un checkpoint derivado con SFT conversacional (`QuatTucker-ZigZagGPT-16-95M-Chat`), pero sus capacidades no se detallan en la informacion disponible.

## Casos de uso

- Investigacion en eficiencia arquitectonica: sirve como referencia reproducible para medir el impacto de sustituir FFN densas por GEMM cuaternionicas y descomposicion de Tucker en un transformer de juguete, con codigo y pesos publicos.
- Estudio de escalado continuo sin reinicio: el checkpoint permite verificar la afirmacion de crecimiento de profundidad con identidad bit a bit y de anchura con `max_diff` de 0,0067, replicando las etapas 2, 3 y 4 sobre FineWeb-Edu.
- Prototipado de bajo coste en una sola GPU: con 95,31 M de parametros y un checkpoint de 0,4 GB, cabe en cualquier GPU consumer y permite iterar rapidamente en experimentos de tokenizacion o curricula de datos.
- Generacion de texto en ingles para tareas de completado simple y evaluacion de perplejidad: util como linea base frente a GPT-2 en entornos academicos con recursos limitados.
- Docencia sobre algebras hipercomplejas en deep learning: el codigo `quattucker_zigzag_v2.py` y la topologia de enrutamiento en zigzag son material didactico concreto para explicar cuaterniones, Tucker y weight sharing.
- Evaluacion comparativa de tokenizadores: al usar GPT-2 BPE con pesos atados, permite aislar el efecto de la arquitectura frente al tokenizador en experimentos controlados.
- Fine-tuning ligero para tareas de clasificacion o completado en ingles, siempre que se acepte su ventana de 512 tokens y su naturaleza de modelo base sin alineacion.

## Benchmarks y rendimiento

Evaluacion zero-shot con puntuacion de log-verosimilitud normalizada por longitud, `N = 500` ejemplos de validacion por tarea:

| Benchmark | QuatTucker-16 (56,7 M bb, 2,55 B tok) | OpenAI gpt2 (85,0 M bb, ~10 B tok) | Delta |
|---|---:|---:|---:|
| ARC-Easy (ciencia) | 39,00 % | 37,00 % | +2,00 % |
| HellaSwag (sentido comun) | 34,00 % | 33,40 % | +0,60 % |
| WinoGrande (logica) | 51,00 % | 51,40 % | -0,40 % |
| BoolQ (comprension lectora) | 54,60 % | 48,20 % | +6,40 % |
| Media de 4 tareas | 44,65 % | 42,50 % | +2,15 % |

Perplejidad en validacion retenida de FineWeb-Edu:

| Checkpoint | Capas / rango | Total | Backbone | Tokens acumulados | Perdida de validacion | PPL |
|---|---|---:|---:|---:|---:|---:|
| Stage 2 (`best_1B.pt`) | L=12, R=6144 | 77,6 M | 39,0 M | 1,05 B | 3,5849 | 36,05 |
| Stage 3 (`best_1.5B_grown.pt`) | L=12, R=8192 | 81,1 M | 42,5 M | 1,55 B | 3,5963 | 36,46 |
| Stage 4 (`best_2.5B_depth16.pt`) | L=16, R=8192 | 95,3 M | 56,7 M | 2,55 B | 3,4647 | 31,97 |
| Referencia: OpenAI gpt2 | L=12, densa | 124,4 M | 85,0 M | ~10,0 B | 3,3439 | 28,33 |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision completa para los 95,31 M de parametros (unos 0,38 GB solo en pesos, mas activaciones y cache KV para 512 tokens).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el autor entreno en una NVIDIA A100 de 40 GB, pero no por requisito de memoria, sino por velocidad de entrenamiento (60,7 mil tokens por segundo).
- Cabe holgadamente en GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que los pesos estan en `.pt` y requieren el codigo de arquitectura propio del repositorio GitHub. La unica ruta documentada es cargar `quattucker_zigzag_v2.py` junto con el checkpoint mediante `torch.load`.
- Latencia y throughput: no se publican cifras de inferencia; solo se reporta throughput de entrenamiento de 60,7 mil tokens por segundo en A100-40GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento de referencia |
|---|---|---|---|---|---|
| QuatTucker-ZigZagGPT-16-95M | 95,31 M totales / 56,71 M backbone | 512 | MIT | `.pt` | Media de 44,65 % en 4 tareas; PPL 31,97 en FineWeb-Edu |
| OpenAI GPT-2 (124M) | 124,4 M totales / 85,0 M backbone | 1024 | MIT | safetensors, GGUF (comunidades) | Media de 42,50 % en 4 tareas; PPL 28,33 en FineWeb-Edu |
| QuatTucker-ZigZagGPT-12 (etapa 2) | 77,6 M totales / 39,0 M backbone | 512 | MIT | `.pt` | PPL 36,05 en FineWeb-Edu; perdida 5,3706 frente a 5,4410 de StandardGPT-12 |
| StandardGPT-12 (control interno del autor) | 123,6 M | no disponible | no disponible | no disponible | Perdida 5,4410 en etapa 1, peor que QuatTucker-12 |

No se dispone de comparaciones con otras familias de modelos pequenos (Pythia, OPT, SmolLM) en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo base sin alineacion: no ha pasado por RLHF ni DPO, por lo que puede generar contenido sesgado, toxico o factualmente incorrecto sin filtros.
- Riesgo de alucinacion elevado: con 2,55 mil millones de tokens de entrenamiento y 95,31 M de parametros, su conocimiento factual es muy limitado; no debe usarse como fuente de verdad.
- Ventana de contexto de solo 512 tokens, insuficiente para conversaciones multi-turno largas o documentos extensos.
- Solo soporta ingles; no hay capacidades multilingues documentadas.
- Perplejidad superior a GPT-2 (31,97 frente a 28,33) pese a ganar en las cuatro tareas zero-shot, lo que sugiere que la ventaja es especifica de la metrica de evaluacion y no generalizable.
- Resultados de benchmarks con `N = 500` ejemplos por tarea: diferencias de +0,60 % y -0,40 % estan dentro del ruido estadistico y no deben interpretarse como mejoras robustas.
- Requiere codigo externo del repositorio GitHub para instanciar el modelo; no es compatible con `transformers`, `vLLM`, `llama.cpp` ni `Ollama` de forma nativa.
- Pesos en `.pt` cargados con `weights_only=False`, lo que implica riesgos de seguridad al deserializar checkpoints de terceros.
- Licencia MIT permite uso comercial, pero la falta de alineacion y la calidad limitada hacen desaconsejable su uso en produccion orientada a usuarios.
- Proyecto de investigador individual con 0 descargas y 0 likes en el momento de la consulta; sin validacion independiente de las afirmaciones del autor.
- El checkpoint esta fechado en noviembre de 2026 segun los metadatos del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/spacetime9/QuatTucker-ZigZagGPT-16-95M
- Checkpoint con SFT conversacional: https://huggingface.co/spacetime9/QuatTucker-ZigZagGPT-16-95M-Chat
- Repositorio GitHub: https://github.com/shu195/QuatTucker-ZigZagGPT
- Preprint (DOI): https://doi.org/10.5281/zenodo.24424502
