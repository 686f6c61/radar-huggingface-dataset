# wooyeolj/gemma-3-4b-airecommender

## Resumen

wooyeolj/gemma-3-4b-airecommender es un adaptador LoRA (PEFT) entrenado mediante QLoRA sobre el modelo base google/gemma-3-4b-it, con el objetivo de especializar las respuestas en el dominio de recomendación de herramientas de IA (modelos LLM, frameworks de agentes y consultas generales). El proyecto surge del sistema LLM & AI Agent Recommender, donde un pipeline previo (clasificación → búsqueda en ChromaDB → generación) necesitaba mejorar la calidad de las respuestas generadas por el LLM, especialmente en la presentación de nombres concretos de herramientas y sus justificaciones.

El adaptador fue entrenado en Google Colab con una GPU T4 (15 GB VRAM) sobre un dataset propio de 60 pares pregunta-respuesta en coreano, distribuidos en tres categorías: MODEL (25), AGENT (25) y GENERAL (10). El entrenamiento usó QLoRA con cuantización de 4 bits (NF4), rank 16, y solo se guardó el adaptador (tamaño del repositorio: 0,1 GB). El modelo resultante mantiene la arquitectura completa de Gemma 3 4B (multimodal, contexto de 128K tokens en el modelo base) pero con pesos adaptados para seguir un estilo de respuesta estructurado: herramienta concreta + motivo de selección + condiciones contextuales.

La relevancia actual radica en que demuestra un caso práctico de fine-tuning eficiente con recursos limitados (una GPU T4 gratuita) para dominios verticales, y sirve como referencia para desarrolladores que necesitan especializar modelos de 4B en tareas de recomendación técnica sin incurrir en costes de entrenamiento completos. La licencia Apache 2.0 del adaptador y del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 3 4B) con adaptador LoRA |
| Parametros totales | 4B (modelo base) + adaptador LoRA (~16M parámetros entrenables, ~1% del total) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 128K tokens (modelo base Gemma 3 4B); el adaptador no modifica la ventana |
| Tipos de cuantizacion | NF4 (4-bit) para entrenamiento; el adaptador puede usarse sobre base cuantizada o en bfloat16 |
| Idiomas soportados | Coreano (ko) como idioma principal del dataset; el modelo base soporta más de 140 idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo base es google/gemma-3-4b-it, un transformer decoder-only con atención multi-cabeza, capacidades multimodales (texto e imagen) y una ventana de contexto de 128K tokens. Sobre esta base se aplicó un adaptador LoRA con rank 16 y alpha 32 (ratio alpha/r = 2), atacando todos los módulos de atención (q, k, v, o) y de feed-forward (gate, up, down). El entrenamiento se realizó con SFTTrainer de TRL 1.7.0, durante 3 épocas, con batch efectivo de 8 (batch size 1 × gradiente acumulación 8), learning rate 2e-4 y optimizador paged_adamw_8bit. La cuantización base fue NF4 con doble cuantización y compute dtype bfloat16.

El dataset consta de 60 ejemplos en coreano, con respuestas diseñadas manualmente para incluir siempre el nombre concreto de la herramienta, la razón de la elección y condiciones situacionales. Las categorías MODEL y AGENT contienen 25 ejemplos cada una, mientras que GENERAL (10 ejemplos) cubre preguntas ajenas a herramientas de IA para mantener la capacidad de respuesta general. La pérdida de entrenamiento descendió de 5,5207 a 1,3070 (reducción del 76,3%), sin signos de sobreajuste según el autor (la pérdida de evaluación convergió junto con la de entrenamiento). No se menciona el uso de RLHF ni DPO; es un fine-tuning supervisado puro.

## Capacidades

- Generación de texto en coreano especializada en recomendación de herramientas de IA: modelos LLM (p. ej., para generación de imágenes, chat, etc.) y frameworks de agentes.
- Respuestas estructuradas con formato consistente: nombre de herramienta + motivo de selección + condiciones de uso, en lugar de descripciones genéricas.
- Mantiene las capacidades generales del modelo base Gemma 3 4B: razonamiento, generación de código, matemáticas, comprensión multilingüe (aunque el ajuste se centró en coreano).
- Capacidad multimodal heredada del modelo base (procesamiento de imágenes y texto), aunque no se ha evaluado específicamente en el adaptador.
- Soporte de tool calling y function calling del modelo base Gemma 3 4B, no modificado por el adaptador.
- Ventana de contexto de 128K tokens, útil para conversaciones multi-turno con historial extenso.
- El adaptador no introduce nuevas capacidades; su valor es la especialización de estilo y vocabulario del dominio.

## Casos de uso

- Asistente de recomendación de modelos LLM: un chatbot interno que, ante preguntas como "recomiéndame un modelo gratuito para dibujar", responde con herramientas concretas (p. ej., Stable Diffusion, DALL-E) y justifica la elección según requisitos de coste, calidad o hardware.
- Selección de frameworks de agentes: desarrolladores que preguntan por frameworks como LangChain, AutoGen o CrewAI reciben una comparación estructurada con criterios de uso (complejidad, escalabilidad, integración).
- Integración en pipelines RAG: el adaptador puede usarse como generador final en un sistema de recuperación aumentada, mejorando la calidad de las respuestas al combinar búsqueda en ChromaDB con un estilo de respuesta coherente.
- Atención al cliente técnica en coreano: un bot que responde consultas sobre herramientas de IA con formato consistente, reduciendo la ambigüedad y mejorando la satisfacción del usuario.
- Generación de documentación de evaluación de herramientas: el modelo puede producir comparativas de herramientas en formato tabla o lista, útil para equipos de investigación que evalúan opciones.
- Fine-tuning de referencia para dominios verticales: sirve como ejemplo reproducible de cómo especializar un modelo de 4B con QLoRA en una GPU consumer, útil para equipos que quieran replicar el proceso en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del autor solo reporta la pérdida de entrenamiento (inicial 5,5207, final 1,3070) y una comparación cualitativa visual entre las respuestas del modelo base y el adaptado, sin métricas numéricas estándar como MMLU, HumanEval o GSM8K. No se dispone de datos de rendimiento comparativo con otros modelos.

## Requisitos de hardware

- El entrenamiento se realizó en una GPU T4 de 15 GB VRAM (Google Colab gratuito), lo que indica que el adaptador puede entrenarse con recursos modestos.
- Para inferencia, el modelo base Gemma 3 4B en bfloat16 requiere aproximadamente 8-10 GB de VRAM; con cuantización 4-bit (NF4) puede caber en GPUs con 6 GB o menos.
- GPUs recomendadas: RTX 3060 (12 GB), RTX 4060 (8 GB), RTX 4090 (24 GB) o cualquier GPU con al menos 6 GB de VRAM para cuantización 4-bit.
- Opciones de despliegue: el adaptador PEFT puede cargarse con Transformers + PEFT, o exportarse a GGUF para su uso con llama.cpp u Ollama. También es compatible con vLLM y TGI si se fusiona el adaptador con el modelo base.
- Latencia y throughput estimados: no se han medido específicamente para este adaptador; el modelo base Gemma 3 4B en una RTX 4090 suele generar entre 50 y 80 tokens/s con cuantización 4-bit, pero estos valores son orientativos y dependen de la implementación.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables específicamente entrenados para recomendación de herramientas de IA en coreano con la misma técnica QLoRA. Como referencia genérica, el modelo base Gemma 3 4B compite con otros modelos de 4B como Llama 3.2 3B o Qwen 2.5 3B, pero el adaptador no aporta datos de rendimiento comparativo.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy pequeño (60 ejemplos), lo que limita la generalización a variaciones de preguntas no vistas; el modelo puede fallar en consultas fuera del dominio o con formulaciones muy diferentes.
- Solo se ha entrenado en coreano; aunque el modelo base es multilingüe, el adaptador puede degradar ligeramente el rendimiento en otros idiomas si se usa con ellos.
- Riesgo de alucinación: el modelo puede inventar nombres de herramientas o razones de selección si la pregunta no está bien cubierta por el dataset, especialmente en categorías GENERAL.
- No se han realizado evaluaciones de sesgos ni de robustez; el modelo hereda los sesgos del modelo base Gemma 3 4B.
- El adaptador no incluye el modelo base; es necesario descargar google/gemma-3-4b-it por separado, lo que requiere acceso a Hugging Face y aceptar los términos de uso de Google (aunque la licencia es Apache 2.0, el modelo base tiene condiciones de uso específicas).
- No hay garantías de calidad en producción; se recomienda validar exhaustivamente antes de un despliegue comercial.

## Enlaces

- [Modelo en Hugging Face: wooyeolj/gemma-3-4b-airecommender](https://huggingface.co/wooyeolj/gemma-3-4b-airecommender)
- [Modelo base: google/gemma-3-4b-it](https://huggingface.co/google/gemma-3-4b-it)
- [Proyecto LLM & AI Agent Recommender (GitHub)](https://github.com/wooyeolj/LLM-AI-Agent-Recommender)
- [Notebook de fine-tuning (Colab)](llm_finetuning_colab.ipynb) (enlazado en la model card)
- [Página de Gemma 4 en DeepMind](https://deepmind.google/models/gemma/gemma-4/) (referencia del modelo base, aunque el adaptador usa Gemma 3)
