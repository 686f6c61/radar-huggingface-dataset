# vivekkopthsd/hinglish-st-33m

## Resumen

El modelo `vivekkopthsd/hinglish-st-33m` es un modelo de embeddings de frases (sentence-transformers) basado en arquitectura BERT, diseñado para tareas de similitud semántica y recuperación de información en Hinglish, una variante code-mixed de hindi y inglés muy usada en contextos informales y técnicos en la India. Fue desarrollado por el usuario vivekkopthsd y está pensado para su integración en pipelines de búsqueda semántica, especialmente en el ámbito fiscal y financiero indio, como sugieren los ejemplos de la model card.

Con 33,7 millones de parámetros, es un modelo compacto que se puede ejecutar en hardware modesto. Se entrenó con una pérdida de ranking de negativos múltiples (MultipleNegativesRankingLoss) sobre un conjunto de datos de 4000 muestras, lo que lo hace adecuado para tareas de recuperación de pasajes. No se han publicado detalles sobre la licencia, los idiomas exactos soportados o el contexto de entrenamiento, por lo que su uso en producción requiere validación adicional.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) |
| Parametros totales | 33.745.152 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors) |
| Idiomas soportados | No disponible (probablemente Hinglish, pero no declarado) |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo está basado en la arquitectura BERT (Bidirectional Encoder Representations from Transformers), como indica el tag `bert`. Se trata de un modelo de embeddings densos, no MoE ni SSM. Se ha adaptado para tareas de similitud semántica mediante la librería `sentence-transformers`. El entrenamiento se realizó con la función de pérdida `MultipleNegativesRankingLoss`, que optimiza el modelo para recuperar el pasaje correcto frente a negativos dentro de un batch. El dataset de entrenamiento tiene un tamaño de 4000 muestras, aunque no se especifica la composición exacta. No se han publicado detalles sobre el número de tokens de entrenamiento, ni sobre técnicas adicionales como RLHF o DPO. La referencia a los papers de Sentence-BERT (arxiv:1908.10084) y BERT (arxiv:1807.03748) en los tags sugiere que se basa en metodologías estándar de estos trabajos.

## Capacidades

- Genera embeddings de frases o párrafos para similitud semántica (similitud coseno).
- Permite búsqueda semántica en documentos, especialmente en dominios fiscales y legales, como se ve en los ejemplos de la model card (queries en Hinglish y pasajes de leyes indias).
- No soporta generación de texto, tool calling, ni agentes.
- No tiene capacidades multimodales (solo texto).
- Es multilingüe en el sentido de que procesa Hinglish (mezcla de hindi romanizado y inglés), pero no se ha declarado un soporte multilingüe más amplio.
- Al ser un modelo de embeddings, no tiene modo de razonamiento o pensamiento explícito.

## Casos de uso

- Recuperación de pasajes fiscales: dado un pregunta en Hinglish, el modelo puede recuperar el artículo o sección relevante de una ley tributaria india (por ejemplo, secciones del Income Tax Act) mediante similitud de embeddings.
- Búsqueda semántica en documentos financieros: permite indexar y consultar informes anuales, memorias o notas de prensa en Hinglish, mejorando la búsqueda por palabras clave.
- Chatbots de atención fiscal: integrar el modelo en un sistema de preguntas y respuestas para responder consultas de contribuyentes sobre normativa, usando los embeddings para seleccionar la respuesta correcta de una base de datos.
- Clasificación de textos fiscales: asignar categorías a documentos (por ejemplo, tipos de ingresos) basándose en la similitud de sus embeddings con categorías predefinidas.
- Deduplicación de documentos: comparar la similitud entre textos para detectar duplicados o versiones similares en bases de datos legales.
- Sistemas de recomendación de artículos: en portales de contenido financiero, recomendar artículos o secciones relevantes a partir de una consulta del usuario en Hinglish.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K o métricas de recuperación como NDCG o MRR para este modelo.

## Requisitos de hardware

- VRAM estimada: para inferencia en FP32, el modelo requiere aproximadamente 132 MB de VRAM (33.745.152 × 4 bytes). En FP16, unos 66 MB. Con cuantización INT8, unos 33 MB.
- GPU recomendadas: puede ejecutarse en GPUs de gama baja, como una NVIDIA GTX 1650 o RTX 2060, y también en CPU (con baja latencia).
- Cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) y en la mayoría de los entornos de CPU.
- Opciones de despliegue: se puede servir con `sentence-transformers` en Python, con `text-embeddings-inference` (como indica el tag `endpoints_compatible`), o exportarse a ONNX para ejecución con `onnxruntime`.
- Latencia: para un modelo de 33M parámetros, la latencia típica en CPU es de milisegundos por frase; en GPU, incluso menor.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos de la misma categoría (por ejemplo, `all-MiniLM-L6-v2` de 22M parámetros, `paraphrase-multilingual-MiniLM-L12-v2` de 118M, o `bge-small-en-v1.5` de 33M). No hay datos de rendimiento ni de licencia que permitan una comparación objetiva. Se recomienda evaluar el modelo en el dominio específico (fiscal indio) frente a alternativas como `all-MiniLM-L6-v2` o `distiluse-taxfinance-multilingual` (también del mismo autor) para determinar su eficacia.

## Limitaciones y advertencias

- El modelo está entrenado con un dataset muy reducido (4000 muestras), lo que limita su generalización a dominios fuera del fiscal indio.
- No se ha especificado la licencia, por lo que no es seguro su uso comercial sin confirmar los términos.
- La falta de información sobre la longitud de contexto y los idiomas soportados impide conocer sus límites en producción.
- El modelo puede presentar sesgos hacia el vocabulario y las estructuras del Hinglish usado en los datos de entrenamiento, que pueden no representar todas las variantes del code-mixed.
- Riesgo de alucinación en tareas de recuperación: aunque no genera texto, si se usa como componente de un sistema de QA, el modelo puede recuperar pasajes irrelevantes si no se filtra correctamente.
- Al ser un modelo de embeddings, no tiene capacidad de razonamiento ni de explicar sus resultados.

## Enlaces

- Hugging Face: https://huggingface.co/vivekkopthsd/hinglish-st-33m
- Paper de Sentence-BERT (arxiv:1908.10084): https://arxiv.org/abs/1908.10084
- Paper de BERT (arxiv:1807.03748): https://arxiv.org/abs/1807.03748
- Modelo relacionado del autor: https://huggingface.co/vivekkopthsd/distilluse-taxfinance-multilingual
- Repositorio del autor: https://huggingface.co/vivekkopthsd/vajra-1 (sin información clara)
