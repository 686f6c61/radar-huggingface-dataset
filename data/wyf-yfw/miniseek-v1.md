# wyf-yfw/MiniSeek-V1

## Resumen
MiniSeek-V1 es un modelo de lenguaje conversacional de tipo decoder-only con arquitectura MoE (mixture of experts), desarrollado por el usuario wyf-yfw y publicado en Hugging Face bajo licencia MIT. Con 186.933.744 parámetros totales (aproximadamente 186,93 M), se posiciona como un modelo ultracompacto orientado a experimentación con arquitecturas MoE y a la reproducción de la ruta técnica de DeepSeek (componentes Dense, MoE y Flash). Deriva del modelo base `wyf-yfw/MiniSeek-V1-base` mediante un proceso de SFT (supervised fine-tuning) sobre un dataset corto de 256 tokens de contexto.

El modelo emplea una estructura propia denominada CED + MoE 1+64 top-6 + mHC + Engram, con embeddings y LM head no compartidos, y un tokenizador MiniMind de vocabulario 6.400 con plantilla ChatML. Su contexto de inferencia es de solo 256 tokens, lo que lo aleja de cualquier uso en producción general y lo acerca a un banco de pruebas de arquitecturas MoE a pequeña escala.

Es relevante ahora por su carácter didáctico y abierto: permite estudiar en detalle un MoE con enrutamiento top-6 sobre 64 expertos, con pesos en safetensors y carga directa mediante `AutoModelForCausalLM`. No obstante, sus capacidades reales son muy limitadas (respuestas cortas en chino, debilidad en inglés, código y razonamiento), por lo que debe evaluarse como artefacto de investigación, no como asistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only MoE (CED + MoE 1+64 top-6 + mHC + Engram) |
| Parametros totales | 186.933.744 (~186,93 M) |
| Parametros activos | no disponible (enrutamiento top-6 sobre 64 expertos; el autor no publica el recuento activo) |
| Longitud de contexto | 256 tokens (contexto de SFT) |
| Tipos de cuantizacion | no disponible (solo safetensors en el repo; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | chino (zh), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (`model.safetensors`), librería PyTorch, `custom_code` |

## Arquitectura y entrenamiento
El modelo es un transformer decoder-only con mezcla de expertos. La estructura declarada por el autor combina CED (componente denso), una capa MoE con 1 experto compartido más 64 expertos enrutados con top-6, mHC y Engram. Los embeddings y el LM head no están compartidos, lo que explica el recuento total de 186.933.744 parámetros. El tokenizador es MiniMind con `vocab_size=6400` y plantilla de chat ChatML.

El entrenamiento parte del checkpoint `last.pt` de la tarea `tasks/20261030-172542-ba2e` del modelo base `MiniSeek-V1-base`. El SFT se realizó sobre `data/SFT/sft_miniseek_v5_short256.jsonl`, con `max_seq_len` de 256, batch de 24 con packing, optimizador AdamW, LR pico de 5e-5 con decaimiento a 1e-6, warmup de 100 pasos y `aux_coef=1e-4` para el balanceo de expertos. El checkpoint publicado (`best.pt` de la tarea `tasks/20261030-233201-0c2a`) corresponde al paso 36.428 con una pérdida de entrenamiento de aproximadamente 1,4276. No se documentan fases de RLHF ni DPO, ni el volumen de tokens de preentrenamiento del modelo base.

## Capacidades
- Generación de texto conversacional breve en chino, con respuestas cortas y directas.
- Conversación multi-turno mediante plantilla ChatML, limitada por el contexto de 256 tokens.
- Comprensión básica de inglés, aunque el autor reconoce debilidad en este idioma.
- Carga estándar con `AutoModelForCausalLM` y `trust_remote_code=True`, sin dependencia de código local.
- Inferencia con pool de candidatos jerárquico y disperso mediante el flag `model.infer_candidate_pool = True`.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido.
- No se documentan capacidades de código ni matemáticas; el autor las califica explícitamente como débiles.

## Casos de uso
- Investigación de arquitecturas MoE a pequeña escala: el modelo permite estudiar el comportamiento del enrutamiento top-6 sobre 64 expertos con un coste computacional mínimo, inspeccionando la distribución de activaciones por experto.
- Reproducción de la ruta DeepSeek en miniatura: sirve como referencia didáctica de la progresión Dense → MoE → Flash y base → chat en un entorno controlado y con licencia permisiva.
- Pruebas de pipelines de carga HF: al soportar `AutoModelForCausalLM` con `trust_remote_code`, es útil para validar integraciones de transformers, plantillas ChatML y flags de inferencia personalizados antes de escalar a modelos mayores.
- Docencia y talleres sobre SFT: el registro de hiperparámetros (paso, pérdida, LR, warmup, `aux_coef`) permite reproducir un ciclo de fine-tuning corto y analizar la curva de pérdida.
- Experimentos de prompts cortos en chino: para tareas de respuesta inmediata (por ejemplo, preguntas factuales simples del tipo "¿cuál es la capital de China?") dentro de 256 tokens.
- Base para fine-tuning posterior: al ser un checkpoint SFT pequeño y con licencia MIT, puede reutilizarse como punto de partida para adaptaciones de dominio muy acotadas y con contexto corto.
- Validación de cuantización y despliegue ligero: útil para probar herramientas de serialización y carga en entornos con recursos mínimos, aunque el autor no publica cuantizaciones.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente reporta la pérdida de entrenamiento del mejor checkpoint (≈ 1,4276 en el paso 36.428) y no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones comparativas.

## Requisitos de hardware
- VRAM estimada para inferencia: con 186,93 M de parámetros en fp32, los pesos ocupan aproximadamente 0,75 GB; en fp16/bf16, unos 0,37 GB. A ello hay que sumar el estado del enrutador MoE y las activaciones, por lo que un presupuesto de 1-2 GB de VRAM es suficiente en la práctica.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es más que suficiente; también cabe en GPUs de portátil con 4 GB o más.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPUs dedicadas actuales e incluso en iGPU con memoria compartida suficiente.
- Opciones de despliegue: carga nativa con `transformers` y `AutoModelForCausalLM` (recomendada por el autor). No se documenta soporte verificado de vLLM, llama.cpp, Ollama ni TGI; la presencia de `custom_code` y la ausencia de GGUF dificultan el despliegue en runtimes alternativos.
- Latencia y throughput: no disponibles. El contexto de 256 tokens y el tamaño reducido sugieren latencias muy bajas, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Notas |
|---|---|---|---|---|---|
| MiniSeek-V1 | ~186,93 M | 256 | MoE decoder-only (1+64 top-6) | MIT | SFT corto, chino principalmente |
| MiniSeek-M0.1 | no disponible | no disponible | MoELM (SFT previo del mismo autor) | no disponible | Predecesor citado por el autor; estructura antigua |
| MiniMind (tokenizador de referencia) | no disponible | no disponible | no disponible | no disponible | Solo se cita como origen del tokenizador (`vocab_size=6400`) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias
- Contexto muy reducido: 256 tokens impiden conversaciones multi-turno largas, recuperación de documentos o razonamiento encadenado extenso.
- Calidad limitada: el propio autor indica que el inglés, el código y el razonamiento complejo son débiles; se trata de un SFT temprano.
- No es un asistente de nivel producción: el autor lo declara explícitamente como no apto para uso productivo.
- Riesgo de alucinación: al ser un modelo pequeño con SFT corto, la probabilidad de respuestas factualmente incorrectas es alta, especialmente fuera del chino.
- Sesgos: no se documentan evaluaciones de sesgo; el dataset de SFT no está descrito en composición, por lo que se desconocen sesgos de dominio y lingüísticos.
- Licencia MIT: permite uso comercial, pero ello no exime de validar la calidad y los riesgos del modelo en el caso de uso concreto.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio; conviene revisarlo antes de desplegar.
- Sin cuantizaciones publicadas: no hay GGUF ni versiones optimizadas, lo que limita el despliegue en runtimes ligeros.
- Idiomas: solo chino e inglés declarados; no hay soporte documentado de castellano.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/wyf-yfw/MiniSeek-V1
- Modelo base: https://huggingface.co/wyf-yfw/MiniSeek-V1-base
- Modelo predecesor citado: https://huggingface.co/wyf-yfw/MiniSeek-M0.1
- Repositorio de código: https://github.com/wyf-yfw/miniseek
- Licencia: https://huggingface.co/wyf-yfw/MiniSeek-V1/blob/main/LICENSE
