# tugaaa/simon-brain

## Resumen

Simon-brain es un modelo de lenguaje publicado en Hugging Face por el usuario `tugaaa` bajo licencia MIT. Se trata de un ajuste fino (fine-tuning) del modelo GPT-2 de 124 millones de parámetros, según se deduce de su nombre de arquitectura y del recuento real de parámetros en safetensors (124.439.808, prácticamente idéntico al GPT-2 base). El modelo está pensado para tareas conversacionales: según la model card, ha sido entrenado sobre mensajes reales de un chat de Telegram del grupo TF2bolnica, con un formato de log monolítico `[USER:id] texto` procedente de un worker de Cloudflare D1.

El modelo no presenta innovaciones arquitectónicas ni datos de entrenamiento detallados: es un GPT-2 estándar (transformer decoder-only, contexto de 1024 tokens) adaptado a un dominio conversacional muy concreto. Su relevancia es por tanto limitada al ámbito de experimentación con chatbots de dominio específico y a la reproducción de estilos conversacionales de una comunidad concreta. No hay información sobre benchmarks, idiomas soportados ni pipeline declarado en Hugging Face.

El repositorio ocupa 0,5 GB y contiene pesos en formato safetensors. En el momento de la consulta no registra descargas ni likes, y la model card mezcla metadatos de una aplicación Gradio (SDK 5.42.0, `app_file: app.py`, OAuth de Hugging Face) con una descripción en ruso del propio chatbot. La ficha que sigue refleja únicamente lo que puede verificarse a partir de los datos disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-2 (transformer decoder-only), ajuste fino |
| Parametros totales | 124.439.808 (≈124 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (GPT-2 base: 1024 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; cuantizacion GGUF/INT8 no confirmada) |
| Idiomas soportados | no disponible (la model card esta redactada en ruso; el corpus de entrenamiento es un chat de Telegram de idioma no especificado) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Tamano del repositorio | 0,5 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-11-22 |
| Ultima actualizacion | 2026-11-22 |

## Arquitectura y entrenamiento

La arquitectura es la de GPT-2, un transformer decoder-only con atención causal completa, normalización previa a la atención y embeddings posicionales aprendidos. Con 124.439.808 parámetros, coincide prácticamente con el GPT-2 base (124 M), lo que confirma que no se ha modificado el tamaño del modelo, solo sus pesos mediante ajuste fino. No hay información sobre si se congelaron capas, se aplicó LoRA o se reentrenó el modelo completo.

El entrenamiento se realizó, según la model card, sobre un log monolítico de mensajes de un chat de Telegram del grupo TF2bolnica, con el formato `[USER:id] texto` extraído de un worker de Cloudflare D1. No se especifican el número de tokens, la composición del dataset, la existencia de RLHF/DPO ni hiperparámetros de entrenamiento. Tampoco se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). La model card incluye además metadatos de una aplicación Gradio (`sdk_version: 5.42.0`, `hf_oauth` con scope `inference-api`), lo que sugiere que el modelo se distribuye junto con una demo de chatbot desplegada en Spaces, aunque el repositorio consultado solo contiene los pesos.

## Capacidades

- Generación de texto conversacional en el estilo del chat de Telegram TF2bolnica.
- Reproducción de turnos de conversación con el formato `[USER:id] texto` visto en el corpus de entrenamiento.
- Generación autoregresiva estándar de GPT-2 (continuación de texto, respuesta a prompts).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Capacidades multilingües: no documentadas; el idioma del corpus no se especifica y la model card está en ruso.
- No se documentan modos especiales (thinking, visión, audio) ni capacidades de código o matemáticas más allá de las heredadas del GPT-2 base.

## Casos de uso

- Chatbot de comunidad: reproducir el estilo y el tono de las conversaciones del grupo TF2bolnica en un bot de Telegram, usando el formato `[USER:id] texto` con el que fue entrenado.
- Demo educativa de fine-tuning: servir como ejemplo práctico de ajuste fino de GPT-2 sobre un log conversacional real extraído de Cloudflare D1.
- Prototipado de asistentes de dominio cerrado: generar respuestas con jerga y expresiones propias de una comunidad concreta, útil para pruebas de concepto antes de invertir en modelos mayores.
- Generación de respuestas sintéticas para aumentar un dataset conversacional de dominio específico (data augmentation), siempre con revisión humana.
- Experimentación con despliegue ligero: al tener 124 M de parámetros y 0,5 GB de pesos, puede ejecutarse en CPU o en GPUs de consumo para pruebas de latencia y formato.
- Integración en una app Gradio (como sugiere la model card) para exponer el chatbot vía `app.py` con OAuth de Hugging Face.
- Análisis de estilo lingüístico: estudiar cómo un modelo pequeño imita el registro de un chat real frente al GPT-2 base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB de pesos (124 M × 4 bytes) más overhead de activaciones y caché KV, en torno a 1 GB en total.
- En FP16/BF16: unos 0,25 GB de pesos; en INT8: unos 0,12 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe holgadamente en GPU de consumo (GTX 1650, RTX 2060, RTX 3050) e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` (PyTorch), llama.cpp/Ollama si se convierte a GGUF (no se distribuye GGUF oficial), y Gradio para la demo indicada en la model card. vLLM y TGI son compatibles con GPT-2 pero no se documenta su uso.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera decodificación en tiempo real en CPU moderna y muy rápida en GPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| simon-brain (tugaaa) | 124 M | no disponible (GPT-2 base: 1024) | MIT | Hugging Face, 0 descargas | Fine-tuning conversacional de GPT-2 |
| GPT-2 base (OpenAI) | 124 M | 1024 tokens | MIT | Hugging Face, ampliamente usado | Modelo original sin ajuste de dominio |
| GPT-2 medium (OpenAI) | 355 M | 1024 tokens | MIT | Hugging Face | Mayor capacidad, más VRAM |
| DistilGPT-2 (Hugging Face) | 82 M | 1024 tokens | Apache 2.0 | Hugging Face | Destilado, más rápido, menor calidad |

No se dispone de datos de rendimiento comparativo (benchmarks) para simon-brain, por lo que la comparación se limita a parámetros, contexto, licencia y disponibilidad.

## Limitaciones y advertencias

- Modelo de 124 M de parámetros: capacidad de razonamiento y conocimiento factual muy limitada en comparación con LLM modernos; alta probabilidad de respuestas incoherentes fuera del dominio conversacional.
- Riesgo elevado de alucinación, especialmente en preguntas factuales o técnicas.
- Sesgos heredados del corpus de Telegram TF2bolnica: posible reproducción de lenguaje coloquial, insultos, jerga interna o sesgos de la comunidad; no se documenta ningún filtrado.
- Idiomas soportados no documentados; el rendimiento fuera del idioma del corpus de entrenamiento es incierto.
- Longitud de contexto no confirmada en la información proporcionada; si se mantiene la de GPT-2 base, 1024 tokens, insuficiente para conversaciones largas o documentos.
- Licencia MIT permite uso comercial, pero el corpus de entrenamiento (mensajes de Telegram de terceros) puede plantear problemas de privacidad y derechos; no se documenta consentimiento ni anonimización.
- Sin benchmarks ni evaluaciones publicadas: no apto para producción sin una evaluación propia previa.
- Repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día: madurez y mantenimiento no verificables.
- La model card mezcla metadatos de una app Gradio con la descripción del modelo; la documentación es incompleta y parcialmente en ruso.

## Enlaces

- Hugging Face: https://huggingface.co/tugaaa/simon-brain
- GPT-2 base (referencia de arquitectura): https://huggingface.co/openai-community/gpt2
- Documentación de Gradio (SDK citado en la model card): https://www.gradio.app/docs
- No se han encontrado papers, blogs, repositorios adicionales ni demos en la información proporcionada.
