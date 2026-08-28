# Thiago-Reis-Porto/modernJabuticaBERT-large-8k

## Resumen

El modelo `modernJabuticaBERT-large-8k` es un encoder transformer en portugués, desarrollado por Thiago Reis Porto en colaboración con el grupo AMADEUS AI. Forma parte de la colección JabuticaBERT, que presenta encoders modernos entrenados desde cero con el corpus Jabuticaba, una gran colección de texto en portugués brasileño. El modelo emplea una arquitectura inspirada en ModernBERT, con entrenamiento de contexto largo (8.000 tokens) y una técnica de preentrenamiento basada en Replaced Token Detection (RTD), similar a ELECTRA.

Con aproximadamente 395 millones de parámetros, este modelo está diseñado para tareas de extracción de características (feature extraction) y representación de texto, ofreciendo una alternativa moderna a modelos anteriores como BERTimbau. Su relevancia radica en que aborda la escasez de encoders de alta calidad para portugués, con un enfoque en eficiencia y contexto extendido, lo que lo hace adecuado para aplicaciones de procesamiento de lenguaje natural en este idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer basado en ModernBERT (según nombre y colección, no confirmado en la model card) |
| Parametros totales | 394.781.696 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (indicado por "8k" en el nombre) |
| Tipos de cuantizacion | no disponible (repo solo contiene safetensors) |
| Idiomas soportados | Portugués (brasileño) según el paper y la colección |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de un encoder transformer moderno, probablemente basado en ModernBERT, que incorpora mejoras como atención eficiente y normalización pre-LayerNorm. Se entrenó desde cero utilizando el corpus Jabuticaba, una colección de texto brasileño diseñada para preentrenamiento de modelos de lenguaje. El entrenamiento emplea Replaced Token Detection (RTD), una variante de ELECTRA que consiste en predecir tokens reemplazados por un generador, lo que resulta más eficiente que el enmascaramiento clásico. Además, se aplicó entrenamiento de contexto largo, lo que permite manejar secuencias de hasta 8.000 tokens, superando el límite típico de 512 de BERT original.

No se dispone de detalles adicionales sobre el número exacto de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO, ya que la model card no los especifica. El paper asociado (presentado en PROPOR 2026) puede contener información más detallada, pero no está disponible en los materiales proporcionados.

## Capacidades

- Extracción de características y generación de embeddings contextuales para texto en portugués.
- Tareas de clasificación de texto, análisis de sentimiento, reconocimiento de entidades nombradas y otras tareas de PLN supervisadas mediante fine-tuning.
- Búsqueda semántica y similitud entre textos gracias a la representación densa generada por el encoder.
- Soporte de contexto largo (hasta 8.192 tokens), útil para documentos extensos o conversaciones multi-turno.
- No es un modelo generativo: no produce texto nuevo, solo representaciones vectoriales.
- No soporta tool calling ni capacidades de agente, al ser un encoder puro.

## Casos de uso

- Análisis de sentimiento en redes sociales: el modelo puede fine-tuning en datasets de opiniones en portugués para clasificar comentarios como positivos, negativos o neutros, aprovechando su contexto largo para analizar hilos completos.
- Clasificación de documentos legales o administrativos: su ventana de 8k permite procesar contratos o informes extensos sin truncamiento, mejorando la precisión en categorización.
- Búsqueda semántica en bases de conocimiento: al generar embeddings de alta calidad, se puede indexar y recuperar documentos en portugués mediante similitud coseno, útil para motores de búsqueda internos.
- Reconocimiento de entidades nombradas (NER): fine-tuning para extraer personas, organizaciones y lugares en textos periodísticos o clínicos, con mejor manejo de contexto.
- Sistemas de recomendación basados en contenido: representar artículos o productos en portugués para recomendar ítems similares según su semántica.
- Preprocesamiento para pipelines de NLP: como encoder base para tareas de pregunta-respuesta o razonamiento, aunque no sea generativo, puede alimentar modelos downstream.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El paper "JabuticaBERT: Modern Portuguese Encoders from Scratch with RTD and Long-Context Training" (PROPOR 2026) podría incluir evaluaciones comparativas, pero no se proporcionan datos numéricos en los materiales consultados. Se recomienda consultar el artículo para obtener métricas detalladas.

## Requisitos de hardware

- VRAM estimada: con 395M parámetros, el modelo en fp32 ocupa aproximadamente 1,6 GB (tamaño del repo). En inferencia con fp16, la huella se reduce a ~800 MB, y con cuantización int8 podría bajar a ~400 MB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, RTX 3050, GTX 1660 Super). Para entrenamiento o fine-tuning, se recomienda una GPU con 8-12 GB (RTX 3070, RTX 3080, A10).
- Cabe en GPUs de consumo: sí, en la mayoría de GPUs modernas con 6 GB o más.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con Hugging Face Inference Endpoints, Text Embeddings Inference (TEI), o mediante librerías como sentence-transformers para generar embeddings. También es compatible con vLLM para tareas de clasificación, aunque su uso principal es extracción de características.
- Latencia y throughput: no se dispone de datos medidos, pero al ser un encoder de tamaño medio, la inferencia es rápida en GPU (del orden de milisegundos por secuencia corta).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| modernJabuticaBERT-large-8k | 395M | 8.192 | Portugués (BR) | no disponible | Entrenado desde cero con RTD |
| BERTimbau large | 335M | 512 | Portugués (BR) | Apache 2.0 | Basado en BERT original, contexto corto |
| XLM-R large | 560M | 512 | Multilingüe (100+) | MIT | Entrenado con MLM, contexto corto |
| ModernBERT base | 149M | 8.192 | Multilingüe (inglés y otros) | Apache 2.0 | Arquitectura moderna, pero no específico para portugués |

La comparativa muestra que este modelo ofrece un contexto mucho mayor que BERTimbau y XLM-R, y está especializado en portugués, a diferencia de ModernBERT base que es multilingüe pero no entrenado específicamente para este idioma. Sin embargo, al carecer de licencia clara, su adopción en producción puede verse limitada.

## Limitaciones y advertencias

- Sesgos: al entrenarse con el corpus Jabuticaba (texto brasileño), el modelo puede reflejar sesgos culturales, regionales o de género presentes en los datos. No se han documentado evaluaciones de sesgo.
- Riesgo de alucinación: al ser un encoder, no genera texto, por lo que el riesgo de alucinación es bajo; sin embargo, los embeddings pueden verse afectados por ruido en los datos de entrenamiento.
- Limitaciones de idioma: está optimizado para portugués brasileño; su rendimiento en otras variantes del portugués (europeo, africano) o en otros idiomas puede ser inferior.
- Licencia: no se especifica, lo que impide su uso comercial sin autorización explícita del autor. Se recomienda contactar con el desarrollador antes de utilizarlo en producción.
- Contexto: aunque soporta 8k tokens, el rendimiento en secuencias muy largas puede degradarse si no se ha entrenado con suficientes ejemplos de esa longitud.
- Documentación: la model card es genérica y carece de detalles sobre entrenamiento, evaluación y limitaciones específicas, lo que dificulta la reproducibilidad.

## Enlaces

- Modelo en Hugging Face (autor original): [amadeusai/modernJabuticaBERT-large-8k](https://huggingface.co/amadeusai/modernJabuticaBERT-large-8k)
- Modelo en Hugging Face (copia del autor): [Thiago-Reis-Porto/modernJabuticaBERT-large-8k](https://huggingface.co/Thiago-Reis-Porto/modernJabuticaBERT-large-8k)
- Colección JabuticaBERT: [https://huggingface.co/collections/amadeusai/jabuticabert](https://huggingface.co/collections/amadeusai/jabuticabert)
- Paper en ACL Anthology: [JabuticaBERT: Modern Portuguese Encoders from Scratch with RTD and Long-Context Training](https://aclanthology.org/2026.propor-1.93/)
- PDF del paper: [https://aclanthology.org/2026.propor-1.93.pdf](https://aclanthology.org/2026.propor-1.93.pdf)
