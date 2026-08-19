# unsloth/Laguna-S-2.1-GGUF

## Resumen

Laguna S 2.1 es un modelo de lenguaje de tipo Mixture-of-Experts (MoE) desarrollado por poolside, con 118.000 millones de parámetros totales y aproximadamente 8.000 millones activados por token. Está diseñado específicamente para tareas de codificación agéntica y trabajo de largo horizonte, como la resolución de incidencias en repositorios extensos o la ejecución de agentes autónomos que interactúan con herramientas. La versión GGUF publicada por unsloth permite ejecutarlo localmente con llama.cpp, vLLM o Transformers, con cuantizaciones calibradas mediante imatrix.

El modelo destaca por su ventana de contexto de 1.048.576 tokens (1M), lo que le permite procesar codebases completas, y por su soporte nativo de razonamiento intercalado entre llamadas a herramientas, controlable mediante el parámetro `enable_thinking`. Su licencia OpenMDW-1.1 permite uso comercial y modificación sin restricciones significativas, lo que lo convierte en una opción atractiva para equipos que necesitan un modelo de código abierto con capacidades de agente sin depender de APIs propietarias.

La arquitectura sigue la receta de la familia Laguna: router token-choice con gating softplus sobre 256 expertos enrutados más un experto compartido, atención grouped-query y una combinación de atención global y de ventana deslizante. Se sitúa entre Laguna XS 2.1 (33B-A3B) y Laguna M.1 (225B-A23B), ofreciendo un equilibrio entre capacidad y coste de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture-of-Experts) con router token-choice, gating softplus, 256 expertos enrutados (top-10) + 1 experto compartido |
| Parametros totales | 118.000 millones (118B) |
| Parametros activos | ~8.000 millones (8B) por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | GGUF (UD-Q4_K_XL, entre otros), FP8, NVFP4, INT4 (variantes oficiales de poolside) |
| Idiomas soportados | No disponible (el modelo no declara idiomas específicos; los benchmarks incluyen SWE-bench Multilingual) |
| Licencia | OpenMDW-1.1 (uso comercial y no comercial permitido) |
| Formato de pesos | GGUF (safetensors para el checkpoint BF16 original) |

## Arquitectura y entrenamiento

Laguna S 2.1 emplea una arquitectura MoE con 48 capas distribuidas en una proporción 1:3 entre atención global y atención de ventana deslizante: 12 capas con atención global y 36 con ventana deslizante de 512 tokens. La atención es grouped-query con 8 cabezas KV y dimensión de cabeza 128, e incorpora gating de salida softplus por cabeza y escalas rotatorias específicas por tipo de capa. El router utiliza gating softplus sobre 256 expertos enrutados, de los cuales se seleccionan los 10 mejores por token, más un experto compartido.

El vocabulario es de 100.352 tokens, propio de la familia Laguna. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas de RLHF o DPO. El modelo soporta decodificación especulativa mediante un modelo borrador DFlash entrenado específicamente, lo que reduce la latencia en servidores compatibles. La variante GGUF de unsloth utiliza cuantizaciones dinámicas 2.0 calibradas con imatrix, y requiere llama.cpp a partir de la versión b10087.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte nativo de modo de pensamiento intercalado entre llamadas a herramientas, controlable mediante `enable_thinking`.
- Codificación avanzada: resolución de incidencias, generación de código, refactorización y análisis de codebases completas gracias a la ventana de 1M tokens.
- Tool calling y function calling: integración con parsers de herramientas en vLLM y otros motores, diseñado para agentes que ejecutan múltiples pasos.
- Razonamiento multi-step y planificación de largo horizonte, orientado a tareas agénticas que requieren mantener estado y contexto durante largas secuencias.
- Capacidades multilingües parciales: el modelo participa en SWE-bench Multilingual, lo que sugiere soporte para varios idiomas en tareas de código, aunque no se especifica la lista completa.
- Decodificación especulativa con el modelo borrador DFlash para reducir latencia en despliegues de producción.

## Casos de uso

- Agente autónomo de resolución de incidencias: el modelo puede analizar un repositorio completo, identificar el origen de un bug, generar un parche y ejecutar pruebas, gracias a su contexto de 1M tokens y su capacidad de razonamiento intercalado con llamadas a herramientas.
- Asistente de programación con contexto de codebase completo: en lugar de fragmentos aislados, el modelo puede recibir el árbol de archivos y las dependencias relevantes para responder preguntas sobre arquitectura o proponer cambios coherentes.
- Automatización de tareas de terminal: con soporte para Terminal-Bench, puede ejecutar comandos, interpretar salidas y corregir errores de forma iterativa, útil para pipelines de CI/CD o administración de sistemas.
- Análisis y documentación de código heredado: su ventana de contexto permite ingerir proyectos grandes y generar documentación, diagramas de flujo o resúmenes de módulos sin perder información.
- Agente de soporte técnico con acceso a herramientas: puede gestionar conversaciones multi-turno, consultar bases de conocimiento o APIs externas y mantener el hilo de la conversación durante largas sesiones.
- Generación de código en producción con verificación: integrado en entornos de desarrollo, puede proponer implementaciones, revisar pull requests y ejecutar pruebas unitarias mediante tool calling, reduciendo la intervención manual.

## Benchmarks y rendimiento

Los siguientes resultados provienen de la tabla publicada por poolside en el anuncio del modelo (julio de 2026). Se comparan con otros modelos de la misma categoría, aunque algunos de ellos son posteriores o de terceros.

| Modelo | Tamano | Terminal-Bench 2.1 | SWE-bench Multilingual | SWE-Bench Pro (Public) | DeepSWE | SWE Atlas (Codebase QnA) | Toolathlon Verified |
|---|---|---|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | **70.2%** | **78.5%** | **59.4%** | **40.4%** | **46.2%** | **49.7%** |
| Tencent Hy3 | 295B-A21B | 71.7% | 75.8% | 57.9% | - | - | - |
| Inkling | 975B-A41B | 63.8% | - | 54.3% | - | - | 45.5%* |
| Nemotron 3 Ultra | 550B-A55B | 56.4% | 67.7% | - | - | - | 34.3%* |
| DeepSeek-V4-Pro Max | 1.6T-A49B | 64.0%* | 76.2% | 55.4% | 9.0%* | 27.2%* | 55.9%* |
| Kimi K3 | 2800B-A50B | 88.3% | - | - | 69% | - | - |
| Qwen 3.7 Max | - | 74.5%* | 78.3% | 60.6% | - | - | - |
| Muse Spark 1.1 | - | 80% | - | 61.5% | 53.3% | 42.2%* | 75.6% |
| Claude Fable 5 | - | 88% | - | 80.3% | 70% | - | - |

Nota: los valores marcados con * son reportados por terceros (Artificial Analysis, Scale AI, leaderboards oficiales). Un guion (-) indica que el modelo no fue evaluado en esa prueba. Laguna S 2.1 destaca especialmente en SWE-bench Multilingual y SWE-Bench Pro, superando a modelos mucho más grandes como DeepSeek-V4-Pro Max en tareas de código.

## Requisitos de hardware

- Checkpoint BF16: aproximadamente 236 GB de pesos, requiere múltiples GPUs (por ejemplo, 4x A100 80GB o 2x H200 141GB) para inferencia sin cuantizar.
- Cuantización UD-Q4_K_XL de unsloth: ~40 GB repartidos en 3 shards, cabe en una GPU de 48 GB (A6000, L40S, RTX 6000 Ada) o en dos GPUs de 24 GB (RTX 4090, RTX 3090) con reparto de capas.
- Otras cuantizaciones GGUF: no se especifican tamaños exactos, pero las variantes FP8 (~118 GB) e INT4 (~60-70 GB) de poolside reducen sustancialmente los requisitos.
- GPUs recomendadas: para uso local con GGUF, una RTX 4090 (24 GB) es insuficiente para el modelo completo; se necesitan al menos 48 GB de VRAM o memoria unificada (Apple Silicon con 64 GB o más).
- Opciones de despliegue: llama.cpp (llama-server, llama-cli), vLLM, SGLang, Transformers, TRT-LLM y Ollama (página oficial disponible).
- Latencia y throughput: no disponibles en la documentación. La decodificación especulativa con DFlash puede reducir la latencia en entornos compatibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque principal |
|---|---|---|---|---|
| **Laguna S 2.1** | 118B-A8B | 1M | OpenMDW-1.1 | Codificacion agéntica, razonamiento largo |
| Laguna XS 2.1 | 33B-A3B | 1M (presumible) | OpenMDW-1.1 | Codificacion ligera, misma familia |
| Laguna M.1 | 225B-A23B | 1M (presumible) | OpenMDW-1.1 | Codificacion de máxima capacidad |
| DeepSeek-V4-Pro Max | 1.6T-A49B | no disponible | no disponible | Razonamiento general y código |

Laguna S 2.1 se posiciona como la opción intermedia de la familia Laguna, ofreciendo un rendimiento cercano a modelos mucho más grandes (como DeepSeek-V4-Pro Max) con solo 8B de parámetros activos, lo que reduce el coste de inferencia. Frente a Laguna XS 2.1, duplica con creces la capacidad total y mejora los resultados en benchmarks de código, a costa de un mayor requisito de memoria. La licencia OpenMDW-1.1 es más permisiva que las de muchos competidores, que suelen restringir el uso comercial o exigir acuerdos específicos.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgos, toxicidad o seguridad; como modelo de gran tamaño, puede reflejar sesgos presentes en sus datos de entrenamiento.
- Riesgo de alucinación en tareas de código: puede generar parches incorrectos o sugerir APIs inexistentes, especialmente en contextos poco representados en el entrenamiento.
- Idiomas soportados no documentados: aunque participa en SWE-bench Multilingual, no se garantiza un rendimiento uniforme en todos los idiomas.
- Requisitos de hardware elevados para el checkpoint BF16: la inferencia local exige GPUs de alta gama o cuantizaciones agresivas que pueden degradar la calidad.
- La cuantización GGUF de unsloth requiere llama.cpp versión b10087 o superior; versiones antiguas no cargarán el modelo.
- La licencia OpenMDW-1.1 permite uso comercial, pero es recomendable revisar los términos exactos, especialmente en lo relativo a responsabilidad y atribución.
- Los benchmarks publicados son del autor y no han sido verificados de forma independiente; algunos resultados de terceros están marcados con asterisco.

## Enlaces

- Repositorio GGUF de unsloth: https://huggingface.co/unsloth/Laguna-S-2.1-GGUF
- Modelo base (poolside): https://huggingface.co/poolside/Laguna-S-2.1
- Blog de anuncio: https://poolside.ai/blog/introducing-laguna-s-2-1
- Modelo borrador DFlash: https://huggingface.co/poolside/Laguna-S-2.1-DFlash
- Variante FP8: https://huggingface.co/poolside/Laguna-S-2.1-FP8
- Variante NVFP4: https://huggingface.co/poolside/Laguna-S-2.1-NVFP4
- Variante INT4: https://huggingface.co/poolside/Laguna-S-2.1-INT4
- Variante GGUF oficial: https://huggingface.co/poolside/Laguna-S-2.1-GGUF
- Trayectorias de evaluación: https://trajectories.poolside.ai
- Página en OpenRouter: https://openrouter.ai/poolside/laguna-s-2.1
- Página en Vercel AI Gateway: https://vercel.com/ai-gateway/models/laguna-s-2.1
- Página en Ollama: https://ollama.com/library/laguna-s-2.1
- Unsloth Studio: https://github.com/unslothai/unsloth
