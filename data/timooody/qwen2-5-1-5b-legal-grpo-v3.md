# Timooody/qwen2-5-1-5b-legal-grpo-v3

## Resumen

El modelo `Timooody/qwen2-5-1-5b-legal-grpo-v3` es un ajuste fino (fine-tuning) del modelo Qwen2.5 de 1.5 mil millones de parámetros, especializado en el dominio legal. Ha sido desarrollado por el usuario Timooody y se distribuye bajo licencia Apache-2.0. El proceso de entrenamiento combina la librería Unsloth, que acelera el ajuste fino, con la librería TRL de Hugging Face, y utiliza la técnica GRPO (Group Relative Policy Optimization) para optimizar el comportamiento del modelo en tareas legales.

Este modelo parte de un ajuste fino previo (`Timooody/qwen2-5-1-5b-legal-finetuned`) y aplica una segunda etapa de optimización con GRPO, una variante de aprendizaje por refuerzo que mejora la calidad de las respuestas en dominios específicos sin necesidad de un modelo de recompensa separado. Su relevancia radica en ofrecer una alternativa ligera y de código abierto para tareas de procesamiento de lenguaje natural legal, con un tamaño que permite su ejecución en hardware de consumo. La arquitectura subyacente es la de Qwen2.5, un transformer decoder-only denso, con una longitud de contexto estándar de 32 768 tokens (según la serie Qwen2.5).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 1 543 714 304 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32 768 tokens (estándar de Qwen2.5) |
| Tipos de cuantizacion | No disponible (se espera compatibilidad con cuantizaciones estándar de Qwen2.5: GPTQ, AWQ, GGUF) |
| Idiomas soportados | Inglés (según metadatos) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5, un transformer decoder-only con atención causal, normalización RMSNorm y embeddings rotatorios (RoPE). Al ser un modelo denso de 1.5B parámetros, no utiliza mezcla de expertos (MoE). La longitud de contexto es de 32 768 tokens, lo que permite manejar documentos legales extensos.

El entrenamiento se realizó en dos etapas: primero un ajuste fino supervisado sobre el modelo base Qwen2.5-1.5B (dando lugar a `Timooody/qwen2-5-1-5b-legal-finetuned`), y posteriormente una optimización con GRPO (Group Relative Policy Optimization) para refinar las respuestas en el dominio legal. GRPO es una técnica de aprendizaje por refuerzo que agrupa varias muestras generadas por el modelo y las compara entre sí para calcular ventajas relativas, evitando la necesidad de un crítico separado. El entrenamiento se aceleró con la librería Unsloth y se utilizó la librería TRL de Hugging Face. No se han publicado detalles sobre el volumen de datos de entrenamiento ni la composición exacta del dataset legal.

## Capacidades

- Generación de texto especializada en el dominio legal: redacción de cláusulas, resúmenes de sentencias, análisis de contratos y respuestas a consultas jurídicas.
- Razonamiento sobre documentos legales con contexto largo (hasta 32 768 tokens), adecuado para procesar expedientes o legislación extensa.
- Soporte de conversación multi-turno, gracias a la arquitectura Qwen2.5 y al entrenamiento con TRL.
- Capacidades multilingües limitadas: el modelo está etiquetado como inglés, aunque Qwen2.5 base soporta múltiples idiomas; no se garantiza un rendimiento óptimo fuera del inglés.
- No se ha confirmado soporte explícito para tool calling, function calling ni modo agente en la información disponible.
- No se ha confirmado soporte de visión, audio u otras modalidades; es un modelo de texto puro.

## Casos de uso

- Asistencia jurídica automatizada: el modelo puede responder consultas legales básicas, explicar conceptos jurídicos y redactar borradores de documentos, aprovechando su especialización en el dominio legal y su contexto de 32 768 tokens para manejar casos con múltiples antecedentes.
- Análisis y resumen de contratos: dado su contexto largo, puede procesar contratos extensos y generar resúmenes de cláusulas clave, riesgos y obligaciones, lo que facilita la revisión preliminar por parte de abogados.
- Búsqueda y extracción de información en jurisprudencia: el modelo puede leer sentencias o extractos de legislación y extraer hechos relevantes, fundamentos legales y decisiones, ayudando en tareas de investigación jurídica.
- Generación de documentos legales estandarizados: puede redactar plantillas de contratos, cartas de reclamación o escritos simples, reduciendo el tiempo de preparación de documentos repetitivos.
- Chatbot legal para despachos o plataformas de servicios legales: integrable en sistemas de atención al cliente para responder preguntas frecuentes sobre procedimientos, plazos o requisitos legales, con un coste computacional bajo gracias a su tamaño de 1.5B.
- Educación y formación legal: puede utilizarse como herramienta de estudio para estudiantes de derecho, generando explicaciones de conceptos, casos prácticos o preguntas de repaso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo específico. Tampoco se han publicado comparativas con otros modelos legales de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantización de 4 bits (por ejemplo, GGUF Q4_K_M), el modelo requiere aproximadamente 1-2 GB de VRAM; en precisión completa (FP16) necesita alrededor de 3 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente para inferencia en FP16 (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 4060). Para mayor velocidad, se recomienda una RTX 3060 o superior.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en la mayoría de GPUs de consumo actuales, incluso en versiones cuantizadas para tarjetas con 2 GB de VRAM.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama, Text Generation Inference (TGI) y Hugging Face Transformers. Al ser un modelo Qwen2.5, también es compatible con herramientas como ExLlamaV2 y GPTQ.
- Latencia y throughput estimados: no disponibles. En una RTX 4090, un modelo de 1.5B en FP16 puede generar decenas de tokens por segundo, pero no se han publicado mediciones específicas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Especialización |
|---|---|---|---|---|
| Timooody/qwen2-5-1-5b-legal-grpo-v3 | 1.5B | 32 768 | Apache-2.0 | Legal (inglés) |
| Qwen2.5-1.5B-Instruct | 1.5B | 32 768 | Apache-2.0 | General (instrucciones) |
| Llama-3.2-1B-Instruct | 1.2B | 128 000 | Llama 3.2 Community | General (instrucciones) |
| Phi-3-mini (3.8B) | 3.8B | 128 000 | MIT | General (razonamiento) |

El modelo se diferencia de Qwen2.5-1.5B-Instruct por su ajuste específico al dominio legal, aunque no se dispone de benchmarks que demuestren una mejora cuantitativa. Frente a Llama-3.2-1B, ofrece un contexto menor pero una licencia más permisiva (Apache-2.0 frente a Llama Community). Phi-3-mini es más grande y con mayor contexto, pero no está especializado en legal.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado sobre datos legales en inglés, puede reflejar sesgos presentes en la jurisprudencia y la doctrina anglosajona, y no es adecuado para sistemas jurídicos de otros países sin adaptación.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar citas legales, artículos o referencias inexistentes. No debe utilizarse como fuente autoritativa sin verificación humana.
- Limitaciones de idioma: el modelo está etiquetado como inglés; su rendimiento en otros idiomas no está garantizado y puede degradarse significativamente.
- Limitaciones de contexto: aunque soporta 32 768 tokens, el rendimiento en tareas que requieren razonamiento sobre documentos muy largos puede degradarse en los extremos de la ventana.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero el modelo se distribuye sin garantías. El autor no proporciona información sobre los datos de entrenamiento, por lo que podría haber problemas de derechos de autor sobre el corpus legal utilizado.
- Advertencia para producción: no se han publicado evaluaciones de seguridad, robustez ni sesgos. Se recomienda realizar pruebas exhaustivas antes de desplegarlo en entornos profesionales donde las consecuencias de errores sean altas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Timooody/qwen2-5-1-5b-legal-grpo-v3
- Modelo base (fine-tuning previo): https://huggingface.co/Timooody/qwen2-5-1-5b-legal-finetuned
- Repositorio de Unsloth: https://github.com/unslothai/unsloth
- Repositorio de Qwen2.5 (referencia de arquitectura): https://github.com/mx4ai/qwen2.5
- Entrada en FriendliAI (para el modelo v1, no v3): https://friendli.ai/models/Timooody/qwen2-5-1-5b-legal-grpo
