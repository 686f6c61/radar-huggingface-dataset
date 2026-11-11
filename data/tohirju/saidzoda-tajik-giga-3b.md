# Tohirju/Saidzoda-Tajik-Giga-3B

## Resumen

Saidzoda-Tajik-Giga-3B es un modelo de embeddings de frases (sentence-transformers) especializado en recuperación de información (retrieval) y similitud semántica, desarrollado por el usuario Tohirju. Se trata de un fine-tuning del modelo ai-sage/Giga-Embeddings-instruct-3B-0826, un modelo de embeddings de 3.150.605.312 parámetros orientado originalmente al ruso, adaptado aquí para incorporar el tayiko (tg) como idioma principal junto con ruso (ru) e inglés (en).

El modelo emplea la arquitectura qwen3_bidirec, una variante bidireccional de la familia Qwen3, y se distribuye en formato safetensors con código personalizado (custom_code), lo que implica que requiere confiar en la implementación incluida en el repositorio para su carga. Su pipeline declarado es sentence-similarity, por lo que su función principal es generar representaciones vectoriales densas para búsqueda semántica, clustering y sistemas RAG.

Es relevante porque cubre un hueco poco atendido: los embeddings de calidad para lenguas de Asia Central como el tayiko, que habitualmente quedan fuera de los modelos multilingües comerciales. El acceso está restringido (gated) y la licencia es personalizada (saidzoda-model-licence), lo que condiciona su adopción en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen3_bidirec (variante bidireccional de Qwen3) |
| Parametros totales | 3.150.605.312 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tg (tayiko), ru (ruso), en (inglés) |
| Licencia | saidzoda-model-licence (other) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de ai-sage/Giga-Embeddings-instruct-3B-0826, un modelo de embeddings de 3B parámetros construido sobre una arquitectura qwen3_bidirec. Esta variante bidireccional permite que cada token atienda a todo el contexto en ambas direcciones, lo que es el enfoque habitual en modelos de representación densa para retrieval, a diferencia de los transformers decoder-only causales. El resultado es un vector de embedding por secuencia, utilizado para similitud semántica.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset de fine-tuning, ni si se aplicaron técnicas de RLHF o DPO. El repositorio incluye código personalizado (custom_code), lo que sugiere modificaciones específicas en la implementación del modelo respecto a la librería estándar de transformers. Tampoco se detalla la estrategia de pooling ni la dimensionalidad del vector de salida.

## Capacidades

- Generación de embeddings de frases para similitud semántica y recuperación densa.
- Búsqueda semántica multilingüe en tayiko, ruso e inglés.
- Soporte para tareas de retrieval (búsqueda documento-consulta).
- Adecuado para clustering y deduplicación de textos por similitud vectorial.
- Integración con sentence-transformers y con endpoints compatibles (tag endpoints_compatible).
- Capacidad de instrucción (instruct) heredada del modelo base Giga-Embeddings-instruct.
- No se ha documentado soporte de tool calling, agentes, visión ni audio.

## Casos de uso

- Búsqueda semántica en tayiko: indexar un corpus de documentos en tayiko y recuperar los pasajes más relevantes para una consulta en el mismo idioma, aprovechando la adaptación específica del fine-tuning.
- Sistemas RAG multilingües: usar el modelo como encoder de recuperación en un pipeline RAG que combine fuentes en tayiko, ruso e inglés, generando embeddings comparables entre los tres idiomas.
- Deduplicación de contenidos: calcular similitud coseno entre documentos para eliminar duplicados o near-duplicates en repositorios de noticias o bases de conocimiento en lenguas de Asia Central.
- Clustering temático: agrupar artículos o mensajes por temática mediante clustering sobre los embeddings generados, útil para análisis de medios o moderación.
- Motor de recomendación de contenidos: representar ítems y perfiles de usuario como vectores para recomendar artículos similares en ruso o tayiko.
- Evaluación de paráfrasis y similitud textual: medir la cercanía semántica entre pares de frases para tareas de anotación, control de calidad de traducciones o evaluación de sistemas de traducción automática tg-ru.
- Filtrado previo en pipelines de moderación: recuperar mensajes semánticamente cercanos a patrones conocidos para revisión humana posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6,3 GB solo para pesos (3,15B parámetros × 2 bytes), más overhead de activaciones y contexto.
- VRAM estimada en cuantización de 8 bits: en torno a 3,2 GB para pesos; en 4 bits, en torno a 1,6 GB, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: A100, H100 o L40S para despliegues de alto throughput; RTX 4090 o RTX 3090 suficientes para inferencia en fp16 de una sola instancia.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más de VRAM en fp16 (por ejemplo RTX 3070/4060 Ti en adelante), con margen ajustado.
- Opciones de despliegue: sentence-transformers (librería declarada), y potencialmente servidores compatibles con endpoints (tag endpoints_compatible). No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Estado |
|---|---|---|---|---|---|
| Saidzoda-Tajik-Giga-3B | 3.150.605.312 | no disponible | tg, ru, en | saidzoda-model-licence | gated |
| ai-sage/Giga-Embeddings-instruct-3B-0826 (base) | ~3B | no disponible | ru (principal) | no disponible | público |
| BAAI/bge-m3 | ~568M | 8192 | multilingüe (>100) | MIT | público |

El modelo base Giga-Embeddings-instruct-3B-0826 es la referencia directa: comparte arquitectura y tamaño, pero no está especializado en tayiko. BGE-M3 es una alternativa multilingüe consolidada, de menor tamaño y con licencia permisiva, aunque sin adaptación específica al tayiko. No se dispone de datos de rendimiento comparado entre ellos en la información proporcionada.

## Limitaciones y advertencias

- Acceso restringido (gated): es necesario aceptar las condiciones en Hugging Face antes de descargar el modelo.
- Licencia personalizada (saidzoda-model-licence): es imprescindible revisar los términos antes de cualquier uso comercial; no se garantiza permiso de uso comercial.
- Requiere código personalizado (custom_code): la carga depende de la implementación incluida en el repositorio, lo que añade riesgo de mantenimiento y compatibilidad.
- Cobertura lingüística limitada a tayiko, ruso e inglés; el rendimiento fuera de estos idiomas no está documentado.
- Sin datos publicados de benchmarks: no es posible verificar la calidad del fine-tuning frente al modelo base ni frente a alternativas.
- Modelo de embeddings, no generativo: no sirve para generación de texto, razonamiento, código ni tool calling.
- Riesgo de sesgos y de representaciones degradadas en dominios alejados de los datos de entrenamiento, cuyo contenido se desconoce.
- Sin información sobre longitud de contexto soportada ni dimensionalidad del embedding, lo que complica su integración en pipelines existentes.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria conocida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tohirju/Saidzoda-Tajik-Giga-3B
- Modelo base: https://huggingface.co/ai-sage/Giga-Embeddings-instruct-3B-0826
- Librería sentence-transformers: https://www.sbert.net/
