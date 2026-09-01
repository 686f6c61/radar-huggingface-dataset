# Ttimms/bible-ai-qwen3.5-4b-lora

## Resumen

`Ttimms/bible-ai-qwen3.5-4b-lora` es un adaptador LoRA (`r=16`, `alpha=32`, `dropout=0.1`) entrenado sobre el modelo base `Qwen/Qwen3-4B` para construir un asistente de preguntas y respuestas sobre la Biblia. Lo desarrolla Ttimms como parte del proyecto de código abierto `bible-ai-assistant`, un sistema completo que combina este adaptador con recuperación híbrida RAG (BM25 + ChromaDB + fusión por rango recíproco + reranking con cross-encoder), guardrails de IA constitucional y un pipeline de voz opcional. El problema que resuelve es la limitación de las aplicaciones bíblicas tradicionales, que solo ofrecen búsqueda por palabras clave, frente a un asistente que comprende consultas teológicas y fundamenta sus respuestas en pasajes recuperados.

El adaptador se entrenó en dos etapas: primero supervisión (SFT) con aproximadamente 1.800 ejemplos diversos y después alineación por preferencias mediante ORPO con 500 pares, sumando 5.925 pasos de entrenamiento en total. El repositorio contiene únicamente los pesos del adaptador (0,2 GB) en formato safetensors, y el modelo base es Qwen3-4B, un transformer decoder-only de 4.000 millones de parámetros con ventana de contexto nativa de 256K tokens. El nombre del repositorio incluye "qwen3.5" por estabilidad de enlaces, pero el adaptador apunta explícitamente a Qwen3-4B, tal como indica `adapter_config.json`. El proyecto se encuentra en estado de snapshot, sin desarrollo activo en el momento de la publicación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3-4B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador LoRA; modelo base: 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible para el adaptador; en produccion se exporta a GGUF F16 y Q4_K_M |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador aplica LoRA con rango 16, alpha 32 y dropout 0,1 sobre todas las proyecciones de atención y MLP del modelo base: `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`. El entrenamiento se realizó con la pila Unsloth/PEFT/TRL en precisión bf16, en dos fases consecutivas: una primera de SFT con unos 1.800 ejemplos diversos y una segunda de ORPO con 500 pares de preferencia para alinear el comportamiento del asistente. El total de pasos de entrenamiento fue de 5.925, y el seguimiento se registró en Weights & Biases con 34 ejecuciones a lo largo del proyecto completo.

El modelo base Qwen3-4B es un transformer causal con atención completa, publicado por Alibaba bajo licencia Apache-2.0. El adaptador no introduce innovaciones arquitectónicas propias; su valor reside en la especialización del modelo para el dominio bíblico y en su integración con el sistema RAG que lo rodea. La documentación del proyecto advierte que el adaptador fue entrenado para la estructura de pesos de Qwen3 y que aplicarlo a un modelo Qwen3.5 produce salidas corruptas, por lo que debe usarse exclusivamente con Qwen3-4B.

## Capacidades

- Generación de texto conversacional especializada en preguntas y respuestas sobre la Biblia, con comprensión de consultas teológicas y referencias a pasajes.
- Razonamiento fundamentado en pasajes recuperados cuando se integra con el pipeline RAG híbrido del proyecto (BM25 + búsqueda densa + reranking).
- Alineación por preferencias mediante ORPO, orientada a respuestas útiles y seguras dentro del dominio.
- Integración con guardrails de IA constitucional para mitigar alucinaciones y respuestas fuera de los límites del sistema.
- Soporte opcional de entrada y salida de voz mediante Faster-Whisper (STT) y Kokoro (TTS) en el sistema completo.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documenta soporte explícito de tool calling ni de razonamiento multi-paso fuera del flujo RAG.

## Casos de uso

- Asistente de estudio bíblico personal: el usuario formula preguntas sobre interpretación de pasajes, contexto histórico o significado de términos, y el modelo responde con referencias recuperadas por el RAG, reduciendo el riesgo de respuestas inventadas.
- Herramienta educativa para seminarios y grupos de estudio: permite preparar materiales de discusión generando resúmenes de pasajes y comparaciones entre traducciones, con citas verificables gracias al reranking.
- Chatbot para comunidades religiosas: desplegado en una web o aplicación de iglesia, responde dudas frecuentes sobre doctrina o liturgia con un tono conversacional y fundamentado.
- Atención al cliente para organizaciones religiosas: gestiona consultas de miembros sobre eventos, publicaciones o recursos, apoyándose en la base de conocimiento recuperada.
- Generación de devocionales diarios: el modelo produce reflexiones breves a partir de un versículo seleccionado, integrado en un flujo automatizado con el pipeline de voz para lectura en audio.
- Sistema de preguntas y respuestas con verificación de fuentes: en entornos donde se requiere trazabilidad, el RAG adjunta los pasajes utilizados, permitiendo al usuario comprobar la respuesta contra la fuente bíblica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de evaluación como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. El proyecto reporta 183 pruebas con un 55% de cobertura en el sistema completo, pero no desglosa resultados de rendimiento del modelo lingüístico.

## Requisitos de hardware

- El adaptador en sí ocupa 0,2 GB, pero requiere cargar el modelo base Qwen3-4B completo para su uso con PEFT.
- Requisitos de VRAM: no disponibles en la información del adaptador; dependen del modelo base y de la cuantización elegida. Para Qwen3-4B en bf16 se necesitan aproximadamente 8 GB, y en cuantización de 4 bits alrededor de 4 GB, aunque estos valores no están confirmados en la documentación del proyecto.
- GPU recomendadas: no especificadas; el modelo base es ejecutable en GPUs de consumo como RTX 3060 o superiores con cuantización, y en GPUs profesionales como A100 o H100 para despliegue con mayor throughput.
- Opciones de despliegue: el proyecto documenta la fusión del adaptador y exportación a GGUF (F16 y Q4_K_M) para servir con Ollama. También es posible cargarlo con `transformers` + `peft` en Python, o servirlo con vLLM si se soportan adaptadores LoRA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El proyecto publica una versión posterior (`Ttimms/Bible-Assistant-Qwen3.5-4B-v2`) y su correspondiente versión GGUF, pero no se aportan métricas comparativas entre ambas. Tampoco se documentan alternativas de terceros para tareas de Q&A bíblica. Por tanto, la comparativa se limita a señalar que el adaptador se basa en Qwen3-4B, un modelo de 4B parámetros con contexto de 256K, frente a otros modelos de tamaño similar como Llama-3.2-3B o Gemma-2-9B, pero sin datos de rendimiento que permitan una evaluación objetiva.

## Limitaciones y advertencias

- Estado de snapshot: el proyecto no está en desarrollo activo y el checkpoint puede quedar obsoleto; se recomienda consultar el repositorio de GitHub antes de asumir que es la versión más reciente.
- Confusión de nomenclatura: el nombre del repositorio incluye "qwen3.5", pero el adaptador está entrenado para Qwen3-4B. Aplicarlo a un modelo Qwen3.5 produce salidas corruptas, como se documenta en el archivo de fusión y despliegue.
- Riesgo de alucinación: aunque el sistema RAG y los guardrails lo mitigan, el adaptador por sí solo puede generar respuestas no fundamentadas si se usa sin el pipeline de recuperación.
- Sesgos teológicos: el entrenamiento se realizó sobre un conjunto de datos específico de teología, lo que puede introducir una perspectiva particular y limitar la neutralidad en temas doctrinales controvertidos.
- Idiomas: no se especifican los idiomas soportados; el modelo base Qwen3-4B es principalmente multilingüe, pero el adaptador no documenta su cobertura.
- Licencia: MIT para el adaptador, compatible con uso comercial; el modelo base Qwen3-4B es Apache-2.0, también permisivo. No se identifican restricciones adicionales.
- Limitaciones de contexto: la ventana de 256K del modelo base no está confirmada para el adaptador; en la práctica, el uso con RAG puede requerir recortes de contexto según la implementación.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/Ttimms/bible-ai-qwen3.5-4b-lora
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio GitHub del proyecto bible-ai-assistant: https://github.com/t-timms/bible-ai-assistant
- Documentación de fusión y despliegue (advertencia sobre Qwen3.5): https://github.com/t-timms/bible-ai-assistant/blob/main/docs/QWEN35_MERGE_AND_DEPLOYMENT.md
- Versión posterior del modelo (v2): https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v2
- Versión GGUF de la v2: https://huggingface.co/Ttimms/Bible-Assistant-Qwen3.5-4B-v2-GGUF
