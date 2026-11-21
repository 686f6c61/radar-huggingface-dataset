# surogate/Surogate3.7-35B-A3B

## Resumen

Surogate3.7-35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por Surogate (surogate.ai) y publicado en Hugging Face bajo licencia Apache 2.0. Se construye sobre la arquitectura Qwen3.5-35B-A3B-Base, de la que hereda la estructura MoE y el pipeline multimodal image-text-to-text, y aplica un post-entrenamiento orientado de forma explícita a flujos agénticos: uso de herramientas, interacciones estructuradas y tareas que se despliegan en múltiples pasos.

El modelo cuenta con 35.951.822.704 parámetros totales (unos 35B) y activa aproximadamente 3B parámetros por token, lo que lo sitúa en la categoría de MoE disperso. Declara una longitud de contexto de 1M tokens, incorpora una cabeza MTP (multi-token prediction) para decodificación especulativa y está optimizado para servirse en GPUs de consumo y en un único DGX Spark. Según el autor, el modelo fue entrenado en precisión FP4 sobre GPUs NVIDIA RTX 5090 con su propio motor de entrenamiento e inferencia (Surogate Engine).

Su relevancia actual radica en la combinación de contexto muy largo, eficiencia de inferencia por activación dispersa y un ajuste específico para agentes empresariales, un nicho donde los modelos frontera suelen requerir infraestructura mucho mayor. El autor lo presenta como el modelo de soporte para el despliegue local de su plataforma de IA, con capacidad declarada de hasta 8 usuarios agénticos concurrentes en un solo DGX Spark.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos) basada en Qwen3.5-35B-A3B-Base, con cabeza MTP |
| Parametros totales | 35.951.822.704 (~35B) |
| Parametros activos | ~3B por token |
| Longitud de contexto | 1M tokens (declarado); en el ejemplo de despliegue con vLLM se configura `--max-model-len 131072` |
| Tipos de cuantizacion | Entrenado en FP4; el ejemplo oficial usa `bfloat16` con KV cache en `fp8`; no se detallan otros formatos publicados |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |
| Pipeline | image-text-to-text (multimodal) |
| Tamano del repositorio | 350.7 GB |
| Modelo base | Qwen/Qwen3.5-35B-A3B-Base |
| Fecha de creacion | 2026-10-03 |
| Ultima actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer con capas de mezcla de expertos: de los ~35B parámetros totales se activan aproximadamente 3B por token, lo que reduce el coste computacional de inferencia respecto a un modelo denso del mismo tamaño. Hereda la estructura y el tokenizador de Qwen3.5-35B-A3B-Base e incorpora una cabeza de predicción multi-token (MTP) que habilita decodificación especulativa, configurable en vLLM mediante `--speculative-config '{"method": "mtp", "num_speculative_tokens": 2}'`. El pipeline declarado es image-text-to-text, por lo que el modelo conserva capacidad de entrada multimodal imagen-texto.

El post-entrenamiento se describe como «agentic-first»: fine-tuning y aprendizaje por refuerzo centrados en comportamientos necesarios para flujos conectados a herramientas y tareas en varias etapas (descomposición de tareas, interacción con herramientas y ejecución estructurada). El autor indica que el entrenamiento se realizó en precisión FP4 sobre GPUs NVIDIA RTX 5090 utilizando su propio Surogate Engine. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni los detalles concretos de las etapas de RLHF/DPO.

## Capacidades

- Generación de texto y razonamiento multi-paso, con modo de pensamiento (thinking) activado por defecto y opción de preservar el razonamiento entre turnos (`preserve_thinking`).
- Uso de herramientas y function calling: el despliegue recomendado en vLLM habilita `--enable-auto-tool-choice` con parser `qwen3_coder`, y el modelo reporta resultados en BFCL v4.
- Comportamiento agéntico: descomposición de tareas, interacción con herramientas y ejecución estructurada en flujos de múltiples etapas.
- Capacidad multimodal de entrada imagen-texto (pipeline `image-text-to-text` heredado del modelo base).
- Contexto largo de hasta 1M tokens, adecuado para tareas con historiales extensos o documentación voluminosa.
- Decodificación especulativa mediante cabeza MTP para acelerar la generación.
- Capacidades multilingües: no disponible (no se detallan idiomas soportados).
- Compatibilidad con endpoints tipo OpenAI a través de vLLM.

## Casos de uso

- Agentes empresariales locales: el modelo está diseñado para desplegarse en un único DGX Spark con hasta 8 usuarios agénticos concurrentes, lo que permite ejecutar asistentes internos sin salida de datos a la nube.
- Automatización de flujos con herramientas: gracias al soporte de tool calling y al ajuste agentic-first, puede encadenar llamadas a APIs internas, consultas a bases de datos y ejecución de comandos dentro de pipelines de automatización.
- Asistencia sobre documentación extensa: con contexto de hasta 1M tokens puede procesar manuales, contratos o repositorios completos en una sola pasada para tareas de extracción y resumen.
- Operaciones de terminal y DevOps: los resultados en Terminal-Bench 2.1 y el ejemplo oficial de listar y explicar ficheros en `/var/log` apuntan a uso en tareas de administración de sistemas asistidas.
- Ingeniería de software asistida: con resultados en SWE-bench Verified, puede integrarse en flujos de resolución de incidencias y modificación de código con validación contra tests.
- Atención al cliente con múltiples turnos: el contexto largo y la preservación del razonamiento entre turnos permiten conversaciones prolongadas manteniendo el hilo de la interacción y el estado de las herramientas invocadas.
- Procesamiento de documentos con imágenes: al conservar el pipeline image-text-to-text, puede emplearse en extracción de información de capturas, formularios escaneados o diagramas combinados con texto.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card:

| Benchmark | Surogate3.7-35B-A3B | DeepSeek V4 Flash (0731) | GLM-5.2 | Ornith-1.5-35B-A3B | LFM2.5-24B-A2B | MiniCPM-V-4.7-35B-A3B | Sage-A1.5-35B-A3B |
|---|---|---|---|---|---|---|---|
| AutomationBench | 34.3 | 25.1 | 28.0 | 18.5 | 27.69 | 2.7 | 8.7 |
| Terminal-Bench 2.1 | 76.4 | 82.7 | 82.7 | 58.4 | 13.5 | 31.5 | 60.6 |
| BFCL v4 | 68.7 | 67.3 | 70.3 | 68.5 | 65.01 | 60.06 | 55.5 |
| IFEval | 94.1 | 92.5 | 93.9 | 81.8 | 96.75 | 89.6 | 92.9 |
| SWE-bench Verified | 78.0 | 79.7 | 78.7 | 79.0 | 51.00 | 54.6 | 76.2 |
| OfficeQA Pro | 51.9 | 46.6 | 66.20 | 45.9 | 3.0 | 18.0 | 45.1 |
| τ²-Bench | 93.4 | 95.2 | 99.4 | 81.5 | 72.1 | 84.65 | 81.8 |
| Claw-Eval (media) | 82.4 | 79.7 | 81.60 | 64.40 | 60.8 | 75.1 | 77.3 |
| GPQA Diamond | 91.4 | 88.1 | 91.2 | 89.2 | 74.42 | 77.8 | 87.4 |
| EnterpriseOps-Gym | 38.1 | 43.3 | 42.7 | 28.8 | 12.1 | 28.6 | 29.2 |
| WildClawBench | 54.6 | 33.2 | 52.14 | 45.91 | 9.4 | 35.3 | 50.0 |
| CommerceAgentBench | 39.4 | 38.4 | 39.30 | 37.40 | 1.9 | 14.0 | 25.2 |

Nota del autor sobre Terminal-Bench 2.1: las tareas que fallaron en el primer intento se repitieron una vez con un límite de 3 horas por agente; se cuenta como superada si pasa cualquiera de los dos intentos (solo primer intento: 61.8).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 350.7 GB en precisión original; con ~35B parámetros totales, la inferencia en bfloat16 requiere del orden de 70 GB solo para pesos, más la KV cache, que con contexto de 1M tokens y KV cache en fp8 puede ser muy elevada.
- GPU recomendadas: el autor indica optimización para GPUs de consumo (entrenado en RTX 5090) y para un único NVIDIA DGX Spark, con hasta 8 usuarios agénticos concurrentes y 1M de contexto usando Surogate Engine.
- Cabe en GPU de consumo: sí, según el autor, en el ecosistema RTX 5090 y en DGX Spark; no se detalla la configuración exacta de memoria por GPU.
- Opciones de despliegue: vLLM es el método documentado (`vllm serve` con `--dtype bfloat16 --kv-cache-dtype fp8`, parser de razonamiento `qwen3`, parser de tool calls `qwen3_coder` y decodificación especulativa MTP). No se documentan en la información disponible despliegues con llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponibles. La decodificación especulativa con MTP y la activación de ~3B parámetros por token están orientadas a mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Surogate3.7-35B-A3B | ~35B totales, ~3B activos | 1M | Apache 2.0 | Hugging Face (transformers, safetensors) | Ajuste agentic-first, MTP, multimodal imagen-texto |
| Ornith-1.5-35B-A3B | ~35B (A3B) | no disponible | no disponible | no disponible | Comparable en tamaño; resultados inferiores en la mayoría de benchmarks de la tabla del autor |
| MiniCPM-V-4.7-35B-A3B | ~35B (A3B) | no disponible | no disponible | no disponible | Comparable en tamaño y modalidad; resultados muy inferiores en benchmarks agénticos |
| Sage-A1.5-35B-A3B | ~35B (A3B) | no disponible | no disponible | no disponible | Comparable en tamaño; cercano en SWE-bench Verified (76.2 frente a 78.0) |
| DeepSeek V4 Flash (0731) | no disponible | no disponible | no disponible | no disponible | Modelo frontera de referencia; supera a Surogate en Terminal-Bench 2.1 y τ²-Bench |
| GLM-5.2 | no disponible | no disponible | no disponible | no disponible | Modelo frontera de referencia; supera a Surogate en OfficeQA Pro y τ²-Bench |

## Limitaciones y advertencias

- El propio autor advierte que el enfoque de post-entrenamiento no garantiza corrección ni fiabilidad autónoma: hay que validar el comportamiento contra las herramientas, datos y límites de seguridad propios antes de desplegar en producción.
- Riesgo de alucinación: no se publican tasas de alucinación ni evaluaciones específicas de fidelidad factual.
- Sesgos conocidos: no disponible; no se documentan análisis de sesgo.
- Idiomas soportados: no disponible; no se especifica cobertura multilingüe.
- Contexto: aunque se declara 1M tokens, el ejemplo oficial de vLLM limita `--max-model-len` a 131072; el rendimiento real con contextos muy largos no está cuantificado.
- Resultados de benchmarks: la mayoría proceden del propio autor y algunos comparadores no tienen ficha pública verificable en la información disponible; Terminal-Bench 2.1 usa dos intentos, lo que infla la cifra frente al primer intento (61.8).
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-35B-A3B-Base conviene revisar las condiciones del modelo base.
- Repositorio de 350.7 GB y solo 27 descargas y 0 likes en el momento de la consulta: ecosistema y validación comunitaria todavía muy limitados.
- No se documentan cuantizaciones GGUF publicadas, lo que restringe el despliegue en herramientas como llama.cpp u Ollama.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/surogate/Surogate3.7-35B-A3B
- Sitio del autor: https://surogate.ai
- Repositorio del Surogate Engine: https://github.com/invergent-ai/surogate
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
