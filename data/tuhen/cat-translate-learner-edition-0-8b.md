# tuhen/cat-translate-learner-edition-0.8b

## Resumen

`tuhen/cat-translate-learner-edition-0.8b` es un modelo de traducción automática japonés→inglés especializado para estudiantes de idiomas. Se trata de un fine-tune del modelo `cyberagent/CAT-Translate-0.8b`, desarrollado por el usuario `tuhen`, que añade una capa de anotación pedagógica: además de la traducción, genera furigana (lectura en kana de los kanji) y un glosario de vocabulario con sus correspondencias. La salida se estructura en JSON, lo que facilita su integración en aplicaciones educativas o herramientas de lectura asistida.

El modelo tiene 793 millones de parámetros (0.8B) y se distribuye en pesos bfloat16 (~1,5 GB). Su tokenizer original fue reemplazado por un Unigram multi-carácter fijo, y se fine-tuneó durante 2 épocas con una tasa de aprendizaje de 2e-5 usando FSDP en bf16. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones. Es relevante porque combina la calidad de traducción del modelo base de CyberAgent (diseñado para dominios técnicos y profesionales) con una salida enriquecida para el aprendizaje, algo poco común en modelos de este tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Llama) |
| Parametros totales | 793.048.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos completos) |
| Idiomas soportados | ja, en |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo base `cyberagent/CAT-Translate-0.8b` pertenece a una familia de modelos bilingües compactos (0.8B, 1.4B, 3.3B y 7B) desarrollados por CyberAgent para traducción bidireccional japonés-inglés. Según el paper asociado (arXiv:2606.21413), estos modelos se entrenaron con datos de dominios reales (negocio, legal, médico, financiero y patentes) y muestran una precisión alta en tareas de traducción especializada. La arquitectura es un transformer decoder estándar, sin mecanismos de atención lineal ni MoE.

El fine-tune de `tuhen` sustituye el tokenizer original por un Unigram multi-carácter fijo (con scores reales inyectados) y entrena el modelo sobre un corpus curado de frases japonesas anotadas con furigana, traducciones y vocabulario. El entrenamiento se realizó con FSDP en bf16, 2 épocas y learning rate 2e-5, validando sobre el mismo formato de chat usado en inferencia. No se menciona el uso de RLHF o DPO; es un fine-tune supervisado clásico.

## Capacidades

- Traducción japonés→inglés con salida JSON estructurada que incluye la frase original, furigana, traducción y lista de vocabulario.
- Generación de furigana para kanji, útil para estudiantes que necesitan lectura asistida.
- Extracción de vocabulario con traducción al inglés, facilitando el estudio de palabras nuevas.
- Soporte de chat multi-turno (usa plantilla de chat estándar) aunque el caso principal es una sola frase.
- Capacidad de tool calling: no disponible (el modelo no está entrenado para ello).
- Capacidades multilingües: limitadas a japonés e inglés, con foco en JA→EN.
- No incluye capacidades de visión, audio ni razonamiento avanzado más allá de la traducción.

## Casos de uso

- Aplicaciones de aprendizaje de japonés: el modelo puede alimentar una app que muestre la traducción de una frase junto con furigana y vocabulario, permitiendo al estudiante leer sin diccionario.
- Herramientas de lectura de textos japoneses: integrado en un lector de manga o noticias, genera automáticamente anotaciones para cada frase.
- Generación de tarjetas de vocabulario (flashcards): a partir de una frase, el modelo extrae los términos clave con su traducción, listos para importar en Anki o similares.
- Asistentes de traducción para profesores: un profesor puede usar el modelo para preparar materiales de clase con anotaciones pedagógicas.
- Chatbots educativos: el modelo puede responder a preguntas sobre gramática o vocabulario mostrando la estructura JSON con furigana.
- Preprocesamiento de corpus para NLP educativo: el modelo puede enriquecer automáticamente grandes volúmenes de texto japonés con anotaciones, útil para crear datasets de aprendizaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para este fine-tune en la información disponible. El modelo base `cyberagent/CAT-Translate-0.8b` fue evaluado en el paper de CAT-Translate sobre dominios de negocio, legal, médico, financiero y patentes, pero no se incluyen los números en los resultados de búsqueda. Por tanto, no se pueden presentar tablas comparativas fiables.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa ~1,5 GB de pesos, por lo que la inferencia requiere al menos 2-3 GB de VRAM (considerando overhead de activaciones y KV cache). Con cuantización a 8 bits o 4 bits (no proporcionada por el autor, pero posible con herramientas externas) cabría en GPUs con 1-2 GB.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060, etc.) puede ejecutarlo cómodamente. Una RTX 4090 o A100 no son necesarias.
- Despliegue: compatible con transformers (código de ejemplo incluido), vLLM, llama.cpp (si se convierte a GGUF), Ollama (si se empaqueta) y TGI.
- Latencia: al ser un modelo de 0.8B, la generación de 512 tokens típica tarda menos de 1 segundo en una GPU moderna, y unos pocos segundos en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Salida | Licencia | Notas |
|---|---|---|---|---|---|
| `tuhen/cat-translate-learner-edition-0.8b` | 0.8B | no disponible | JSON con furigana y vocabulario | Apache 2.0 | Fine-tune pedagógico |
| `cyberagent/CAT-Translate-0.8b` | 0.8B | no disponible | Traducción directa | Apache 2.0 | Modelo base, bidireccional |
| `tuhen/cat-translate-learner-edition-1.4b` | 1.4B | no disponible | JSON con furigana y vocabulario | Apache 2.0 | Versión mayor del mismo fine-tune |

La comparativa se limita a los modelos de la misma familia, ya que no hay datos de otros modelos de traducción con anotaciones pedagógicas. El modelo de 0.8B es más ligero y rápido que el de 1.4B, pero probablemente con menor calidad de traducción.

## Limitaciones y advertencias

- El modelo está especializado en traducción JA→EN; no soporta traducción EN→JA de forma fiable (aunque el base sí lo hace, el fine-tune no lo garantiza).
- La salida JSON puede contener errores de formato o alucinaciones en el vocabulario, especialmente con frases complejas o poco frecuentes.
- El tokenizer personalizado puede no ser compatible con todas las herramientas de inferencia; requiere usar el `tokenizer.json` incluido.
- No se han publicado evaluaciones de sesgos o robustez; al ser un fine-tune pequeño, puede heredar sesgos del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre la calidad en producción.
- El contexto máximo no está documentado; se recomienda limitar la entrada a frases cortas (menos de 100 tokens) para evitar degradación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tuhen/cat-translate-learner-edition-0.8b
- Modelo base: https://huggingface.co/cyberagent/CAT-Translate-0.8b
- Paper de CAT-Translate: https://arxiv.org/pdf/2606.21413
- Versión HTML del paper: https://arxiv.org/html/2606.21413v1
- Colección de CyberAgent: https://huggingface.co/collections/cyberagent/cat-translate
