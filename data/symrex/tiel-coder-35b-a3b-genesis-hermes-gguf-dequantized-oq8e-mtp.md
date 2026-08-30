# symrex/Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF-dequantized-oQ8e-mtp

## Resumen

Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF-dequantized-oQ8e-mtp es una versión cuantizada en 8 bits del modelo Tiel-Coder-35B-A3B, un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) basado en Qwen3.5 (tipo `qwen3_5_moe`). El modelo original ha sido desarrollado por la comunidad como un asistente de código de alto rendimiento, y esta variante concreta ha sido preparada por el usuario symrex mediante la herramienta oQ (oMLX v0.6.3) con cuantización mixta de precisión, en formato MLX safetensors. El nombre indica que el modelo pasó por un proceso de dequantización desde GGUF y posterior re-cuantización, lo que lo hace adecuado para ejecución en hardware Apple Silicon mediante MLX.

El modelo destaca por su relación entre tamaño y rendimiento: con 35 mil millones de parámetros totales y solo 3 mil millones activos por token (MoE), ofrece capacidades de generación de código comparables a modelos mucho más grandes, según evaluaciones independientes. Está orientado a tareas de programación, resolución de issues en repositorios y razonamiento técnico, y su cuantización en 8 bits reduce los requisitos de memoria sin sacrificar excesivamente la calidad. La licencia no está especificada en la información disponible, lo que debe tenerse en cuenta antes de un uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 MoE (tipo `qwen3_5_moe`) |
| Parametros totales | 35B (MoE) según nombre; archivo safetensors: 10.433.940.400 (~10,4B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8 bits, group size 64 (oQ mixed-precision) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | MLX safetensors (tambien existen versiones GGUF) |

## Arquitectura y entrenamiento

El modelo base Tiel-Coder-35B-A3B es un transformer de arquitectura MoE con 35B parámetros totales y 3B activos por token, derivado de la familia Qwen3.5. El nombre incluye los sufijos "Genesis" y "Hermes", lo que sugiere un fine-tuning sobre datasets de instrucciones y conversación de esos nombres, aunque no se han publicado detalles concretos del proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La versión aquí descrita ha sido cuantizada con oQ (oMLX v0.6.3) en precisión mixta de 8 bits con group size 64, partiendo de un archivo GGUF que fue dequantizado y posteriormente re-cuantizado al formato MLX safetensors. No se dispone de información sobre innovaciones técnicas adicionales en el modelo original más allá de la arquitectura MoE.

## Capacidades

- Generación de código: el modelo está especializado en tareas de programación, incluyendo generación de funciones, corrección de bugs y resolución de issues en repositorios reales.
- Razonamiento técnico: según evaluaciones independientes, iguala el rendimiento de Opus 4.6 Medium en tareas de repositorios y supera a modelos como KAT-Coder y Nail en velocidad y fiabilidad.
- Soporte de tool calling: no se ha confirmado explícitamente, aunque es probable dado su origen Qwen3.5; no hay datos disponibles.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de razonamiento extendido: no se menciona ningún "thinking mode" específico.

## Casos de uso

- Asistente de programación en entornos de desarrollo integrado (IDE): el modelo puede sugerir implementaciones, refactorizar código y explicar fragmentos complejos, gracias a su arquitectura MoE que activa solo 3B parámetros por token, lo que permite respuestas rápidas incluso en equipos de gama media.
- Resolución de issues en repositorios open source: su rendimiento en tareas de repositorios reales, comparable a Opus 4.6 Medium, lo hace adecuado para integrarse en flujos de trabajo de mantenimiento de proyectos, proponiendo parches y análisis de problemas.
- Generación de código en pipelines de CI/CD: puede utilizarse para autogenerar tests, documentación o snippets de código en integración continua, siempre que se valide la salida con herramientas de compilación.
- Chat técnico y soporte de desarrollo: su fine-tuning con datasets de instrucciones (Genesis/Hermes) le permite mantener conversaciones multi-turno sobre temas de ingeniería de software, aunque la longitud de contexto no está especificada.
- Prototipado rápido de aplicaciones: desarrolladores individuales pueden usarlo en local con MLX en Macs con Apple Silicon, gracias a la cuantización de 8 bits que reduce la huella de memoria.
- Evaluación de modelos y benchmarks: al ser una variante cuantizada, sirve como referencia para medir el impacto de la cuantización en tareas de código frente al modelo original sin cuantizar.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Existen referencias cualitativas en un artículo de baguaai.com que indican que Tiel-Coder-35B-A3B iguala a Opus 4.6 Medium en tareas de repositorios reales y supera a KAT-Coder y Nail, pero no se proporcionan cifras concretas. También hay una entrada en llm-bench.io para una versión GGUF Q6_K_XL, pero los datos de puntuación no están accesibles en la información recopilada. No se deben inferir números no verificados.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión. El archivo safetensors ocupa 38,6 GB en disco, pero al ser MoE con 3B activos, la memoria necesaria en inferencia depende de la implementación y del número de expertos cargados. Con cuantización de 8 bits, es plausible que quepa en GPUs de 12-16 GB, aunque no hay datos confirmados.
- GPU recomendadas: al estar en formato MLX, está pensado para Apple Silicon (M1/M2/M3/M4). Para otras plataformas, se necesitaría convertir a GGUF u otro formato.
- Compatibilidad con GPUs de consumo: probablemente sí en tarjetas con 12 GB o más, pero no hay confirmación oficial.
- Opciones de despliegue: MLX (Apple Silicon), llama.cpp/Ollama si se convierte a GGUF, vLLM o TGI si se adapta a CUDA (requiere conversión).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en codigo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tiel-Coder-35B-A3B (este) | 35B MoE (3B activos) | no disponible | Comparable a Opus 4.6 Medium en repositorios | no disponible | HuggingFace (MLX, GGUF) |
| KAT-Coder | no disponible | no disponible | Inferior segun baguaai.com | no disponible | no disponible |
| Nail | no disponible | no disponible | Inferior segun baguaai.com | no disponible | no disponible |
| Qwen3.5 (base) | 35B MoE (3B activos) | no disponible | Base sin fine-tuning | Apache 2.0 (probable) | HuggingFace |

No se dispone de datos suficientes para una comparativa cuantitativa rigurosa.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial puede estar restringido; se debe contactar con el autor o verificar la licencia del modelo base Qwen3.5 antes de desplegarlo en producción.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código incorrecto o plausible pero no funcional; se recomienda validación humana o pruebas automáticas.
- Sesgos desconocidos: al no haber documentación sobre el dataset de fine-tuning, no se pueden evaluar sesgos potenciales.
- Longitud de contexto no documentada: puede haber limitaciones en tareas que requieran ventanas largas, como análisis de repositorios extensos.
- Cuantización: la versión en 8 bits puede presentar degradación de calidad frente al modelo original, especialmente en tareas de razonamiento complejo.
- Formato MLX: limita el despliegue a hardware Apple Silicon; para otros entornos se requiere conversión a GGUF u otros formatos, lo que puede introducir pérdidas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/symrex/Tiel-Coder-35B-A3B-Genesis-Hermes-GGUF-dequantized-oQ8e-mtp
- Perfil del autor symrex: https://huggingface.co/symrex
- Artículo sobre TielCoder en baguaai.com: https://baguaai.com/tielcoder-the-new-35b-moe-benchmark-redefining-local-sota-coding-performance/
- Benchmark de versión GGUF en llm-bench.io: https://llm-bench.io/models/tiel-coder-35b-a3b-mtp-ud-q6-k-xl-gguf
- Evaluación independiente en GitHub: https://github.com/h00nigan/35b-moe-eval
- Herramienta oQ (oMLX): https://github.com/jundot/omlx
