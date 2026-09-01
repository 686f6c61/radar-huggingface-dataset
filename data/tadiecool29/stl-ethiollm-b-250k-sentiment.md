# tadiecool29/STL-ethiollm-b-250K-sentiment

## Resumen

STL-ethiollm-b-250K-sentiment es un modelo de análisis de sentimiento (clasificación de polaridad) obtenido mediante fine-tuning del modelo multilingüe EthioNLP/EthioLLM-b-250K, desarrollado por el usuario independiente tadiecool29 (Tadesse Amare). El modelo base, EthioLLM, es una familia de modelos de lenguaje entrenados para cinco lenguas etíopes (amárico, ge'ez, afan oromo, somalí y tigriña) además de inglés, y este fine-tuning lo adapta específicamente a la tarea de detección de sentimiento en textos.

Con 278 millones de parámetros y un tamaño de repositorio de 1,1 GB, se trata de un modelo compacto, adecuado para entornos con recursos limitados. La licencia MIT permite uso comercial sin restricciones, aunque la documentación es escasa: el dataset de entrenamiento no se especifica y las métricas de evaluación son moderadas (F1 de 0,6451). Su relevancia radica en cubrir un nicho lingüístico poco atendido, como son las lenguas etíopes, en una tarea práctica de procesamiento del lenguaje natural.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basado en EthioLLM-b-250K, detalles no disponibles) |
| Parametros totales | 278.045.955 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (el modelo base soporta amárico, ge'ez, afan oromo, somalí, tigriña e inglés, pero no se confirma para este fine-tuning) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning del modelo base EthioNLP/EthioLLM-b-250K, que según el paper de EthioLLM (arXiv:2403.13737) es un transformer multilingüe preentrenado con un vocabulario de 250.000 tokens. No se dispone de detalles sobre el número de capas, cabezas de atención o tipo de arquitectura exacta (encoder-only o decoder) en la información proporcionada. El fine-tuning se realizó con el Trainer de HuggingFace, usando un dataset no especificado, durante 10 épocas con una tasa de aprendizaje de 1e-05, optimizador AdamW, scheduler coseno con 300 pasos de warmup y precisión mixta nativa. No se menciona el uso de RLHF, DPO u otras técnicas de alineación.

## Capacidades

- Clasificación de sentimiento (positivo, negativo, neutral) en textos, probablemente en lenguas etíopes e inglés, dado el origen del modelo base.
- Generación de texto limitada: al ser un modelo pequeño y especializado, su capacidad generativa es reducida y no está optimizada para tareas abiertas.
- No soporta tool calling, function calling ni razonamiento multi-paso.
- No tiene capacidades multimodales (visión, audio).
- No se ha documentado soporte para agentes o tareas de razonamiento complejo.

## Casos de uso

- Monitoreo de opiniones en redes sociales: el modelo puede clasificar comentarios o publicaciones en amárico u otras lenguas etíopes para medir la percepción pública sobre productos, servicios o eventos, gracias a su entrenamiento específico en sentimiento.
- Análisis de reseñas de clientes: integrable en pipelines de procesamiento de reseñas de comercio electrónico o plataformas de servicios para extraer polaridad de forma automática, con un coste computacional bajo.
- Investigación académica en NLP para lenguas de bajos recursos: sirve como punto de partida para estudios sobre análisis de sentimiento en lenguas etíopes, dado que hay pocos modelos disponibles.
- Filtrado de contenido en foros o plataformas de mensajería: puede usarse para detectar mensajes con sentimiento negativo o abusivo, aunque su precisión moderada (F1 0,6451) requiere validación adicional.
- Prototipos de sistemas de recomendación: la salida de sentimiento puede alimentar sistemas que sugieran productos o contenidos según la reacción del usuario.
- Educación y demostraciones: útil para enseñar fine-tuning de modelos multilingües en entornos con recursos limitados, gracias a su tamaño reducido y licencia permisiva.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados en el conjunto de evaluación (no se especifica el tamaño ni la composición del mismo):

| Metrica | Valor |
|---|---|
| Loss | 0,9272 |
| Precision (sentimiento) | 0,6650 |
| Recall (sentimiento) | 0,6514 |
| F1 | 0,6451 |
| Accuracy (sentimiento) | 0,6484 |

No se han publicado comparaciones con otros modelos en la información disponible. Estos valores indican un rendimiento moderado, con margen de mejora para uso en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: con 278M parámetros en fp32 (~1,1 GB), se necesitan aproximadamente 2-3 GB de VRAM para inferencia básica. Con cuantización int8 (no publicada, pero posible) podría reducirse a ~1 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, o incluso CPUs con suficiente RAM. No requiere GPUs de gama alta.
- Compatibilidad con GPUs de consumo: sí, cabe en GPUs de consumo como RTX 3060, RTX 4060, etc.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI, o mediante el pipeline de HuggingFace. También es compatible con llama.cpp si se convierte a GGUF, aunque no se proporcionan cuantizaciones oficiales.
- Latencia y throughput: no se dispone de datos medidos. Dado el tamaño, se espera una latencia de decenas de milisegundos por muestra en GPUs modernas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables específicos para análisis de sentimiento en lenguas etíopes. El modelo base EthioLLM-b-250K sin fine-tuning podría servir como referencia, pero no se han publicado sus métricas para esta tarea. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: no se especifica qué datos se usaron para el fine-tuning, lo que dificulta evaluar su generalización y posibles sesgos.
- Rendimiento moderado: con un F1 de 0,6451, el modelo puede cometer errores frecuentes en clasificación de sentimiento, especialmente en textos ambiguos o con matices.
- Sesgos potenciales: al estar entrenado sobre un corpus no documentado, puede reflejar sesgos presentes en los datos originales (género, etnia, dialecto, etc.).
- Limitaciones de idioma: aunque el modelo base es multilingüe, no se confirma que el fine-tuning haya cubierto todas las lenguas por igual; es posible que el rendimiento varíe entre idiomas.
- Riesgo de alucinación: al ser un modelo pequeño, su capacidad generativa es limitada, pero si se usa para generación de texto, puede producir contenido incoherente o falso.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero al no conocerse el dataset de entrenamiento, podrían existir problemas de propiedad intelectual si los datos no son de libre uso.
- Adecuación para producción: sin una evaluación más exhaustiva y sin conocer el dominio de aplicación, no se recomienda su uso directo en sistemas críticos sin validación adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/STL-ethiollm-b-250K-sentiment
- Modelo base EthioLLM-b-250K: https://huggingface.co/EthioNLP/EthioLLM-b-250K
- Paper de EthioLLM (arXiv): https://arxiv.org/html/2403.13737v3
- Perfil del autor en HuggingFace: https://huggingface.co/tadiecool29
- Repositorio GitHub del autor: https://github.com/tadiecool29/tadiecool29
