# Ttimms/KAT-Coder-V2.5-Dev-REAP-50-GGUF

## Resumen

KAT-Coder-V2.5-Dev-REAP-50-GGUF es una colección de cuantizaciones GGUF del modelo de código KAT-Coder-V2.5-Dev, originalmente desarrollado por Kwaipilot (equipo de IA de Kuaishou), tras aplicar un podado de expertos REAP al 50%. El resultado es un modelo Mixture-of-Experts (MoE) híbrido con arquitectura Gated-DeltaNet, que reduce los 256 expertos originales a 128 y pasa de aproximadamente 35 000 millones de parámetros totales a unos 17 500 millones, manteniendo alrededor de 3 000 millones de parámetros activos por token. Esta reducción permite ejecutar un modelo de alto rendimiento en hardware de consumo, como una GPU con 16 GB de VRAM, sin renunciar a capacidades agénticas de codificación.

El modelo original alcanza un 69,40 % en SWE-bench Verified, superando en casi 11 puntos a Qwen3.5-35B-A3B (58,60 %), gracias a un entrenamiento específico para uso de herramientas y optimización con aprendizaje por refuerzo en entornos sandbox. La versión podada y cuantizada mantiene una calidad cercana a la del modelo base, con resultados de HumanEval+ y MBPP+ en torno al 90 % en la cuantización NVFP4A16. Esta ficha se centra en los archivos GGUF, pensados para su uso con llama.cpp y otras herramientas compatibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated-DeltaNet + MoE híbrido (arquitectura `qwen3_5_moe`) |
| Parametros totales | 18 543 997 568 (según safetensors; ~17,5 B según la model card) |
| Parametros activos | ~3 B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | inglés |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base KAT-Coder-V2.5-Dev emplea una arquitectura híbrida que combina Gated-DeltaNet, una variante de atención lineal recurrente, con un bloque MoE de 256 expertos. Esta combinación permite un equilibrio entre eficiencia computacional y capacidad de razonamiento. El entrenamiento original incluyó fases de ajuste fino supervisado y optimización con aprendizaje por refuerzo orientada al uso de herramientas en entornos sandbox, lo que explica su alto rendimiento en tareas agénticas como SWE-bench Verified.

El proceso REAP (CerebrasResearch) poda el 50 % de los expertos, reduciendo el número de 256 a 128, con una renormalización del router para compensar la pérdida de capacidad. El resultado es un modelo con aproximadamente 17 500 millones de parámetros totales y unos 3 000 millones activos por token. Los archivos GGUF se generaron a partir del modelo podado en bf16, sin la cabeza MTP (multi-token prediction), y se cuantizaron en varios niveles. No se dispone de información detallada sobre el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Generación de código en múltiples lenguajes, con soporte para razonamiento y depuración.
- Razonamiento agéntico: puede planificar y ejecutar múltiples pasos para resolver tareas complejas, como modificar código en un repositorio.
- Tool calling / function calling: integración con herramientas externas, lo que permite su uso en agentes autónomos.
- Modo de pensamiento (thinking mode): la plantilla de chat incluye la opción de activar o desactivar el razonamiento explícito antes de responder.
- Capacidades multilingües limitadas al inglés, tanto en entrada como en salida.
- Eficiencia computacional: al ser un MoE con pocos parámetros activos, la inferencia es rápida incluso en CPU y Apple Silicon.

## Casos de uso

- Agente de codificación local en un IDE: el modelo puede actuar como asistente que edita archivos, ejecuta comandos y sugiere cambios, gracias a su entrenamiento agéntico y su capacidad de tool calling. Su tamaño reducido permite ejecutarlo en una estación de trabajo con GPU de 16 GB.
- Generación de código en pipelines de CI/CD: integrado mediante vLLM o llama.cpp, puede generar parches, tests o documentación automáticamente en cada commit, aprovechando su bajo coste por token.
- Refactorización automatizada de código legacy: con su capacidad de razonamiento multi-paso, puede analizar un proyecto, identificar patrones obsoletos y proponer refactorizaciones seguras.
- Generación de tests unitarios: dado su alto rendimiento en HumanEval+ y MBPP+, es adecuado para crear casos de prueba a partir de funciones existentes, reduciendo el trabajo manual del desarrollador.
- Chat técnico de soporte en inglés: puede responder preguntas sobre APIs, librerías o conceptos de programación con precisión, manteniendo conversaciones multi-turno.
- Prototipado rápido de scripts y herramientas: su capacidad de generar código funcional con pocos parámetros activos lo hace útil para entornos con recursos limitados, como portátiles con Apple Silicon.

## Benchmarks y rendimiento

Los datos de rendimiento disponibles provienen del modelo base o de la cuantización NVFP4A16, no de los archivos GGUF. Se presentan a continuación como referencia.

| Benchmark | KAT-Coder-V2.5-Dev (base) | KAT-Coder-V2.5-Dev-REAP-50 (NVFP4A16) | Qwen3.5-35B-A3B |
|---|---|---|---|
| SWE-bench Verified | 69,40 % | no disponible | 58,60 % |
| HumanEval+ (greedy, instruct) | no disponible | ~90 % | no disponible |
| MBPP+ (greedy, instruct) | no disponible | ~90 % | no disponible |

No se han publicado resultados específicos para las cuantizaciones GGUF. Se espera una ligera degradación respecto a la versión bf16 o NVFP4A16, pero no se dispone de mediciones concretas.

## Requisitos de hardware

- Q4_K_M (~11 GB): cabe en una GPU de 16 GB con margen para contexto. Es la opción recomendada por el autor.
- Q5_K_M (~13 GB): también cabe en 16 GB, dejando menos espacio para contexto.
- Q6_K (~15 GB): ajustado en 16 GB, puede requerir limitar el contexto o usar offload parcial.
- Q8_0 (~19 GB): requiere más de 16 GB de VRAM o descarga de capas a CPU.
- GPU recomendadas: RTX 5070 Ti (16 GB) o similares con soporte para SM120; también funciona en GPUs más antiguas con suficiente VRAM.
- CPU y Apple Silicon: al ser un MoE con ~3 B de parámetros activos, la inferencia en CPU es viable y rápida para su tamaño.
- Opciones de despliegue: llama.cpp (con una versión reciente que soporte la arquitectura `qwen3_5_moe`), vLLM (para la versión NVFP4A16), SGLang. Ollama aún no es compatible hasta que actualice su llama.cpp incluido.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | SWE-bench Verified | Licencia | Formato |
|---|---|---|---|---|---|
| KAT-Coder-V2.5-Dev (original) | ~35 B | ~3 B | 69,40 % | Apache-2.0 | bf16 |
| KAT-Coder-V2.5-Dev-REAP-50 (este modelo) | ~17,5 B | ~3 B | no disponible | Apache-2.0 | GGUF |
| Qwen3.5-35B-A3B | ~35 B | ~3 B | 58,60 % | Apache-2.0 | bf16, GGUF |

La comparativa muestra que el podado reduce significativamente los parámetros totales manteniendo el mismo número de activos, lo que facilita el despliegue local sin perder la eficiencia por token. El rendimiento en SWE-bench del modelo original supera claramente al de Qwen3.5-35B-A3B, aunque no se dispone de la cifra para la versión podada.

## Limitaciones y advertencias

- Solo soporta inglés; no se recomienda su uso para otros idiomas.
- Riesgo de alucinación en código, especialmente en APIs poco conocidas o contextos ambiguos, como cualquier modelo generativo.
- El podado REAP puede degradar ligeramente el rendimiento en tareas que dependen de la diversidad de expertos, aunque no se han cuantificado las pérdidas en los GGUF.
- Requiere una versión reciente de llama.cpp que implemente la arquitectura `qwen3_5_moe`; versiones antiguas no funcionarán.
- Ollama no es compatible todavía; habrá que esperar a que actualice su motor.
- La longitud de contexto no está documentada en la información disponible; se recomienda verificar el comportamiento con contextos largos antes de usarlo en producción.
- La licencia Apache-2.0 permite uso comercial, pero se debe mantener la atribución correspondiente.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-GGUF
- Modelo bf16 podado (fuente): https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-bf16
- Versión NVFP4A16 (flagship para vLLM): https://huggingface.co/Ttimms/KAT-Coder-V2.5-Dev-REAP-50-NVFP4A16
- Pipeline y benchmarks en GitHub: https://github.com/t-timms/kat-coder-16gb
- Guía de configuración local (GGUF, vLLM, SGLang): https://dev.to/ai_made_tools/kat-coder-v25-local-setup-guide-gguf-vllm-sglang-2fdi
- Artículo sobre KAT-Coder-V2.5-Dev en HackerNoon: https://hackernoon.com/kat-coder-v25-dev-an-open-agentic-coding-model
