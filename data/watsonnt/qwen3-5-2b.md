# WatsonNT/Qwen3.5-2B

## Resumen

Qwen3.5-2B es un modelo de lenguaje causal multimodal (imagen-texto) desarrollado por Alibaba, publicado en HuggingFace por el usuario WatsonNT. Forma parte de la familia Qwen3.5, que integra avances en aprendizaje multimodal, eficiencia arquitectónica y escalado de reinforcement learning. Este modelo concreto, con 2.274 millones de parámetros, está diseñado para prototipado, fine-tuning específico de tareas e investigación, según indica su model card.

Su arquitectura híbrida combina Gated Delta Networks (atención lineal) con capas de atención tradicional, logrando una ventana de contexto nativa de 262.144 tokens. Es un modelo multimodal que acepta entradas de imagen y texto, y soporta 201 idiomas y dialectos. Su licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para despliegues en producción a pequeña escala o en dispositivos edge.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder, híbrida (Gated DeltaNet + Gated Attention) |
| Parametros totales | 2.274.069.824 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | no disponible (se esperan versiones GGUF, AWQ, GPTQ en ecosistema Qwen) |
| Idiomas soportados | 201 idiomas y dialectos |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con Transformers, vLLM, SGLang, KTransformers) |

## Arquitectura y entrenamiento

El modelo sigue un diseño híbrido que intercala bloques de atención lineal (Gated DeltaNet) con bloques de atención tradicional (Gated Attention). La configuración del language model incluye 24 capas, dimensión oculta de 2048, embedding de 248.320 tokens (padding) y una estructura de capas 6 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)). La atención lineal usa 16 cabezas para V y 16 para QK con dimensión de cabeza 128; la atención tradicional usa 8 cabezas Q y 2 cabezas KV con dimensión 256 y RoPE de 64 dimensiones. El FFN tiene dimensión intermedia de 6144 y la salida LM está atada al embedding. Se entrenó con multi-token prediction (MTP) en múltiples pasos.

El entrenamiento combinó pre-training y post-training, con un enfoque de fusión temprana de tokens multimodales para lograr paridad con Qwen3 en tareas de razonamiento, código, agentes y comprensión visual. Se aplicó reinforcement learning escalado en entornos multi-agente con distribuciones de tareas progresivamente complejas. La infraestructura de entrenamiento alcanzó una eficiencia cercana al 100% en entrenamiento multimodal comparado con solo texto.

## Capacidades

- Generación de texto y razonamiento: soporta modos thinking y non-thinking, con mejoras sobre Qwen3 en instrucciones complejas.
- Comprensión visual: acepta imágenes como entrada y puede describir, analizar y razonar sobre contenido visual.
- Generación de código: entrenado para tareas de programación, con soporte para múltiples lenguajes.
- Multilingüismo: cobertura de 201 idiomas y dialectos, con comprensión cultural y regional matizada.
- Tool calling y function calling: compatible con el ecosistema Qwen, permite integración con herramientas externas.
- Capacidades de agente: diseñado para razonamiento multi-paso y orquestación de tareas en entornos agénticos.
- Contexto largo: ventana nativa de 262.144 tokens, adecuada para documentos extensos y conversaciones multi-turno.

## Casos de uso

- Asistente virtual en dispositivos móviles: su tamaño de 2B permite ejecución on-device con baja latencia, ideal para asistentes personales que requieren comprensión multimodal (fotos, capturas) y respuestas en varios idiomas.
- Análisis de documentos con imágenes: puede procesar PDFs escaneados, facturas o informes con gráficos, extrayendo y resumiendo información relevante gracias a su contexto de 262K tokens.
- Chatbot de atención al cliente multilingüe: con soporte para 201 idiomas, puede gestionar conversaciones con usuarios de distintas regiones, manteniendo el contexto de la interacción completa.
- Generación de código asistida en IDE: integrable como autocompletado o asistente de programación, con capacidad de razonar sobre código existente y sugerir modificaciones.
- Prototipado rápido de aplicaciones de IA: su licencia Apache 2.0 y formato estándar permiten experimentar con fine-tuning para tareas específicas sin coste de licencia.
- Análisis de imágenes médicas o técnicas: aunque no es un modelo especializado, puede describir y razonar sobre imágenes en contextos de investigación o documentación técnica.
- Agente de automatización de tareas: con tool calling, puede orquestar llamadas a APIs, bases de datos o servicios web en flujos multi-paso.

## Benchmarks y rendimiento

La model card proporciona resultados en modo instruct (non-thinking) comparando con Qwen3-4B-2507, Qwen3-1.7B y Qwen3.5-0.8B:

| Benchmark | Qwen3-4B-2507 | Qwen3-1.7B | Qwen3.5-2B | Qwen3.5-0.8B |
|---|---|---|---|---|
| MMLU-Pro | 69.6 | 40.2 | 55.3 | 29.7 |
| MMLU-Redux | 84.2 | 64.4 | 69.2 | 48.5 |
| C-Eval | 80.2 | 61.0 | 65.2 | 46.4 |

Qwen3.5-2B supera claramente a Qwen3-1.7B en todos los benchmarks, y se acerca a Qwen3-4B-2507 en MMLU-Redux y C-Eval, a pesar de tener la mitad de parámetros. No se dispone de resultados para benchmarks de código (HumanEval, MBPP) ni matemáticas (GSM8K, MATH) en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: ~4,5 GB en FP16, ~2,5 GB en cuantización 8-bit, ~1,5 GB en 4-bit (estimaciones basadas en el tamaño de parámetros).
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 2060, RTX 3060, RTX 4060, etc.) para FP16; con cuantización 4-bit puede ejecutarse en GPUs con 4 GB.
- Compatible con Apple Silicon (M1/M2/M3) mediante llama.cpp o MLX.
- Opciones de despliegue: vLLM, SGLang, KTransformers, Transformers, llama.cpp, Ollama (disponible como `qwen3.5:2b`).
- Latencia estimada: en una RTX 4090, generación de ~50-100 tokens/s en FP16; en CPU, ~5-10 tokens/s con cuantización 4-bit (estimaciones orientativas).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | MMLU-Pro | Licencia | Multimodal |
|---|---|---|---|---|---|
| Qwen3.5-2B | 2,27B | 262K | 55.3 | Apache 2.0 | Sí (imagen) |
| Qwen3-1.7B | 1,7B | 256K | 40.2 | Apache 2.0 | No |
| Qwen3-4B-2507 | 4B | 256K | 69.6 | Apache 2.0 | No |

Qwen3.5-2B ofrece mejor rendimiento que Qwen3-1.7B con solo 0,5B más de parámetros, y añade capacidades multimodales. Qwen3-4B-2507 sigue siendo superior en razonamiento puro, pero requiere el doble de recursos. La ventaja principal de Qwen3.5-2B es su equilibrio entre tamaño, rendimiento y multimodalidad.

## Limitaciones y advertencias

- Modelo pequeño: con 2B parámetros, su rendimiento en tareas complejas de razonamiento o generación de código extenso es inferior a modelos de mayor escala (7B+).
- Riesgo de alucinación: como todo LLM, puede generar información falsa o inventada, especialmente en dominios especializados.
- Sesgos: no se han publicado evaluaciones de sesgos específicas para este modelo; puede reflejar sesgos presentes en los datos de entrenamiento.
- Limitaciones de visión: aunque es multimodal, su capacidad de comprensión visual es limitada comparada con modelos dedicados como Qwen2.5-VL o Llama 3.2 Vision.
- Dependencia del ecosistema Qwen: algunas capacidades (tool calling, agentes) pueden requerir el formato de chat específico de Qwen.
- Disponibilidad de cuantizaciones: no se han publicado oficialmente versiones GGUF o AWQ en el repositorio, aunque el ecosistema Ollama ya lo ofrece.
- Fecha de creación: el repositorio data de agosto de 2026, por lo que es un modelo reciente con posible falta de adopción y herramientas de terceros.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/WatsonNT/Qwen3.5-2B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Blog oficial Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Guía completa de Qwen 3.5: https://qwen-ai.com/qwen-3-5/
- Página en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_5_2b
- Página en Ollama: https://ollama.com/library/qwen3.5:2b
- Herramienta de compatibilidad: https://www.canirun.ai/model/qwen3.5-2b
