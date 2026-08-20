# titmuny20/khmerfood-qwen3b-full

## Resumen

El modelo `titmuny20/khmerfood-qwen3b-full` es un fine-tune de un modelo base de la familia Qwen2 con 3.085.938.688 parámetros, desarrollado por Titmuny Sombo (usuario `titmuny20` en Hugging Face). Según los metadatos del repositorio, el modelo fue entrenado mediante *supervised fine-tuning* (SFT) con la librería TRL de Hugging Face, y está orientado a generación de texto conversacional. El nombre del repositorio sugiere una especialización en el dominio de la gastronomía jemer (cocina de Camboya), aunque la model card no proporciona detalles sobre el dataset de entrenamiento ni los objetivos específicos.

La relevancia de este modelo radica en que representa un caso de fine-tune vertical sobre una base abierta (Qwen2) para un nicho temático concreto, lo que puede resultar útil para aplicaciones de asesoramiento culinario, traducción de recetas o asistentes conversacionales especializados. Sin embargo, la documentación pública es prácticamente inexistente: la model card está generada automáticamente y no incluye información sobre arquitectura, datos de entrenamiento, licencia ni rendimiento. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un proyecto reciente y sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2 (fine-tune SFT) |
| Parametros totales | 3.085.938.688 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible (el modelo base Qwen2-3B soporta 32.768 tokens, pero no se confirma para este fine-tune) |
| Tipos de cuantizacion | no disponible (el repo incluye pesos en safetensors; se menciona compatibilidad con 4-bit y bitsandbytes en los tags) |
| Idiomas soportados | no disponible (el nombre sugiere ingles y jemer, pero no se confirma) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura corresponde a un transformer denso de la familia Qwen2, con aproximadamente 3.000 millones de parámetros. El modelo base es Qwen2-3B, un modelo de lenguaje autoregresivo con atención de múltiples cabezas y normalización RMSNorm, entrenado originalmente por Alibaba Cloud sobre un corpus multilingue. El fine-tune se realizó mediante *supervised fine-tuning* (SFT) utilizando la librería TRL, lo que implica un ajuste de los pesos del modelo base sobre un dataset de instrucciones o diálogos, probablemente centrado en el dominio de la comida jemer.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, las hiperparametros utilizados (tasa de aprendizaje, épocas, etc.) ni si se aplicaron técnicas adicionales como RLHF o DPO. Los tags del repositorio indican compatibilidad con `text-generation-inference` y `endpoints_compatible`, lo que sugiere que el modelo puede desplegarse en infraestructura de inferencia estándar. No hay evidencia de innovaciones técnicas más allá del fine-tune convencional.

## Capacidades

- Generación de texto conversacional: el modelo está entrenado con SFT para responder en formato diálogo, probablemente especializado en consultas sobre cocina jemer (recetas, ingredientes, técnicas).
- Especialización temática: el nombre del repositorio indica un enfoque en gastronomía de Camboya, aunque no se documentan los límites exactos de ese dominio.
- Compatibilidad con pipelines de Hugging Face: al ser un modelo de la familia transformers, puede usarse con `pipeline("text-generation")` y cargarse con `AutoModelForCausalLM`.
- Soporte de cuantización: los tags mencionan compatibilidad con 4-bit y bitsandbytes, lo que permite inferencia con menor consumo de VRAM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo *thinking*.

## Casos de uso

- Asistente de recetas jemeres: el modelo puede responder preguntas sobre ingredientes, pasos de preparación y variantes de platos tradicionales camboyanos, como *amok* o *num banh chok*, en un chat interactivo.
- Traducción de recetas: si el modelo fue entrenado con datos bilingües (inglés-jemer), podría ayudar a traducir recetas entre ambos idiomas, aunque esta capacidad no está confirmada.
- Generación de contenido para blogs o guías de viaje: redacción de descripciones de platos, historia culinaria o recomendaciones de restaurantes, siempre que el dominio esté cubierto por el entrenamiento.
- Chatbot de atención al cliente para restaurantes jemeres: integrado en un sitio web o aplicación de mensajería para responder consultas frecuentes sobre menú, alérgenos o horarios.
- Herramienta educativa para estudiantes de cocina: explicaciones sobre técnicas culinarias jemeres, sustituciones de ingredientes o maridajes.
- Prototipo de investigación en NLP de bajo recurso: dado que el jemer es un idioma con pocos recursos, este modelo puede servir como punto de partida para experimentos de fine-tune en dominios específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este fine-tune. Tampoco se dispone de comparaciones con el modelo base Qwen2-3B o con otros modelos de tamaño similar.

## Requisitos de hardware

- VRAM estimada para inferencia: para un modelo de 3B parámetros en precisión fp16, se necesitan aproximadamente 6 GB de VRAM. Con cuantización de 4 bits, la VRAM requerida se reduce a unos 2-3 GB.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM (por ejemplo, RTX 2060, RTX 3060, RTX 4060) puede ejecutar el modelo en fp16. Para cuantización 4-bit, una GPU con 4 GB (como RTX 3050) sería suficiente.
- Compatibilidad con GPU de consumo: sí, el modelo cabe en GPUs de consumo medio y bajo, lo que lo hace accesible para desarrollo local.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, o directamente con transformers y bitsandbytes para carga en 4-bit.
- Latencia y throughput: no se dispone de mediciones específicas. Para un modelo de 3B en una GPU moderna, se puede esperar una latencia de decodificación de decenas de milisegundos por token, pero estos valores dependen del hardware y la cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| titmuny20/khmerfood-qwen3b-full | 3.08B | no disponible | no disponible | Hugging Face |
| Qwen2-3B (base) | 3.08B | 32.768 tokens | Apache 2.0 | Hugging Face |
| Llama-3.2-3B | 3.21B | 128.000 tokens | Llama 3.2 Community License | Hugging Face |
| Gemma-2-2B | 2.6B | 8.192 tokens | Gemma Terms of Use | Hugging Face |

La comparación se limita a características generales, ya que no hay datos de rendimiento del fine-tune. El modelo base Qwen2-3B es la referencia natural, pero este fine-tune no documenta mejoras ni regresiones sobre él. Llama-3.2-3B y Gemma-2-2B son alternativas de tamaño similar con licencias más restrictivas que Qwen2.

## Limitaciones y advertencias

- Documentación insuficiente: la model card no especifica el dataset de entrenamiento, los hiperparámetros, la licencia ni los idiomas soportados, lo que dificulta evaluar su idoneidad para producción.
- Riesgo de alucinación: al ser un fine-tune sobre un dominio específico sin evaluación publicada, es probable que genere información incorrecta sobre recetas, ingredientes o datos históricos.
- Sesgos potenciales: el entrenamiento sobre un corpus limitado de gastronomía jemer puede introducir sesgos culturales o regionales no documentados.
- Sin garantías de calidad: con 0 descargas y 0 likes, el modelo no ha sido validado por la comunidad; su rendimiento real es desconocido.
- Licencia no especificada: el uso comercial del modelo es incierto, ya que no se indica la licencia del fine-tune ni la del dataset utilizado.
- Limitaciones de idioma: aunque el nombre sugiere un enfoque en jemer, no se confirma que el modelo funcione correctamente en ese idioma; podría estar entrenado principalmente en inglés con referencias a términos jemeres.

## Enlaces

- Repositorio del modelo: https://huggingface.co/titmuny20/khmerfood-qwen3b-full
- Perfil del autor: https://huggingface.co/titmuny20/models
- Colección Qwen3 (referencia de la familia): https://huggingface.co/collections/Qwen/qwen3
- Informe técnico de Qwen3 (contexto de la familia): https://arxiv.org/html/2505.09388v1
