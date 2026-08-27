# theprint/ProgramManager-v1-2B

## Resumen

ProgramManager-v1-2B es un modelo de lenguaje generativo de texto, desarrollado por el usuario theprint, que consiste en un ajuste fino (fine-tuning) del modelo base `unsloth/Qwen3.5-2B` mediante la técnica LoRA. El modelo está entrenado específicamente sobre el conjunto de datos `TechPM-Combined-6.40k-sharegpt`, que parece orientado a tareas de gestión de proyectos técnicos, y se ha generado con el pipeline Auto-SFT, una herramienta de búsqueda automática de hiperparámetros y entrenamiento supervisado. Con 1.942.653.248 parámetros (1,94 mil millones), es un modelo compacto pensado para ejecutarse en hardware de consumo o entornos con recursos limitados, aunque su licencia no está especificada y su documentación es escasa.

La relevancia de este modelo radica en su enfoque en el dominio de gestión de proyectos (TechPM), lo que lo convierte en una opción interesante para aplicaciones específicas de planificación, seguimiento y documentación técnica, siempre que se valide su rendimiento con datos propios. Al ser un modelo pequeño, puede desplegarse fácilmente en entornos de producción con requisitos de VRAM moderados, aunque su ventana de contexto de entrenamiento es de solo 512 tokens, lo que limita su uso en tareas que requieren contexto largo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.5-2B) |
| Parámetros totales | 1.942.653.248 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no especificada (el entrenamiento se realizó con `max_seq_length=512`) |
| Tipos de cuantizacion | no disponible (se entrega en precisión completa de 16 bits) |
| Idiomas soportados | inglés |
| Licencia | no disponible |
| Formato de pesos | safetensors (modelo completo, con pesos LoRA fusionados) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3.5-2B de la serie Qwen3.5, que es un transformer causal (decoder-only) con atención de ventana deslizante y mecanismos de atención por capas. El ajuste fino se realizó mediante LoRA con un rango `r=4` y `alpha=4` sobre los módulos `q_proj`, `v_proj`, `k_proj` y `o_proj`. El entrenamiento se ejecutó durante 2 épocas con un `learning_rate` de 1e-5, `batch_size` de 1 y `gradient_accumulation_steps` de 8, sobre un dataset de 6.400 ejemplos en formato ShareGPT. No se ha publicado información sobre el proceso de alineación posterior (RLHF, DPO, etc.), ni sobre la composición exacta del dataset más allá del nombre.

## Capacidades

- Generación de texto en inglés con estilo conversacional y orientado a gestión de proyectos técnicos.
- Sigue instrucciones de forma básica gracias al ajuste supervisado (SFT) sobre datos tipo chat.
- Puede utilizarse para tareas de resumen, extracción de información y redacción de informes en el dominio técnico.
- No se ha verificado soporte explícito para tool calling o function calling; el modelo base Qwen3.5-2B podría tener cierta capacidad, pero no se confirma en la documentación.
- Capacidades multilingües limitadas: solo se indica inglés como idioma de entrenamiento.
- No se especifica modo de razonamiento extendido (thinking mode) ni capacidades multimodales.

## Casos de uso

- Asistente de planificación de proyectos: el modelo puede ayudar a generar cronogramas, listas de tareas y descripciones de hitos en formato conversacional, aprovechando su entrenamiento en datos de gestión técnica.
- Generación de documentación técnica: puede redactar resúmenes de reuniones, actas o especificaciones breves a partir de entradas textuales, aunque su contexto corto limita documentos extensos.
- Chatbot de soporte interno para equipos de desarrollo: al estar ajustado con datos de conversación, puede responder preguntas frecuentes sobre procesos de gestión.
- Automatización de reportes de estado: dado un formato de entrada simple, puede generar actualizaciones de progreso o bloqueos en español.
- Herramienta de brainstorming para roadmap: puede sugerir ideas de funcionalidades o riesgos en base a descripciones de productos.
- Prototipos de RAG con contexto corto: en entornos donde se necesite una respuesta breve basada en un fragmento de documento técnico, el modelo puede integrarse en un pipeline de recuperación aumentada (RAG) con ventana de 512 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: con precisión 16 bits (FP16), el modelo ocupa aproximadamente 3,9 GB en memoria (según el tamaño del repositorio). En cuantización de 8 bits podría reducirse a unos 2 GB, y en 4 bits a alrededor de 1 GB, pero no se ofrecen archivos cuantizados en el repositorio.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16. Una RTX 3060 (12 GB), RTX 4060 (8 GB), o incluso una RTX 3050 (4 GB) son suficientes. Para inferencia en CPU con llama.cpp, se puede usar RAM de 8 GB.
- Compatibilidad con GPUs de consumo: sí, cabe en la mayoría de GPUs modernas de consumo, incluso sin cuantización.
- Opciones de despliegue: vLLM, Hugging Face Transformers, llama.cpp, Ollama (si se convierte a GGUF), TGI (Text Generation Inference) y ONNX Runtime.
- Latencia y throughput: no se han publicado mediciones. En una RTX 4060, se puede esperar una velocidad de generación de entre 20 y 40 tokens por segundo, dependiendo del batch y la longitud de secuencia.

## Comparativa con modelos similares

No hay modelos comparables directos en el mismo dominio (gestión de proyectos) con el mismo tamaño y licencia. Se puede comparar con el modelo base:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| ProgramManager-v1-2B | 1,94B | 512 (entrenamiento) | no disponible | Hugging Face |
| Qwen3.5-2B (base) | ~2B | 32.768 (original) | Apache 2.0 (probable, verificar) | Hugging Face |
| Llama-3.2-1B | 1,23B | 128.000 | Llama 3.2 Community License | Hugging Face |

La comparativa es limitada porque el modelo no publica benchmarks y la licencia es desconocida.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un ajuste fino de un modelo base no documentado, puede presentar sesgos heredados y alucinaciones frecuentes, especialmente en tareas no representadas en el dataset de entrenamiento.
- Contexto limitado: el entrenamiento se realizó con secuencias de 512 tokens, por lo que no se recomienda su uso con entradas de mayor longitud sin evaluar su comportamiento.
- Idioma: solo se ha entrenado en inglés, no se garantiza un rendimiento adecuado en otros idiomas.
- Licencia: no se ha especificado la licencia del modelo, lo que impide su uso comercial legal sin consultar al autor.
- Calidad del dataset: el dataset `Tech-SFT-Combined-6.40k` es de autoría propia y no se ha descrito su contenido, lo que puede generar respuestas poco fiables fuera de ese dominio.
- Falta de benchmarks: no hay evidencia objetiva de su rendimiento, por lo que se recomienda evaluar con casos propios antes de integrarlo en producción.
- Actualización: el modelo se creó en 2026-08-26, por lo que es reciente pero sin evolución documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theprint/ProgramManager-v1-2B
- Repositorio de Auto-SFT: https://github.com/theprint/auto-sft
- Página de benchmarks de theprint en BenchmarkList: https://benchmarklist.com/providers/theprint/
- Modelo base unsloth/Qwen3.5-2B: https://huggingface.co/unsloth/Qwen3.5-2B
