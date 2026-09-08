# Zeolit/lettuce-thymos-26m-v1

## Resumen

`lettuce-thymos-26m-v1` es un clasificador de emociones multi-etiqueta desarrollado por Zeolit, que etiqueta texto conversacional corto en 22 idiomas con las 28 categorías del dataset GoEmotions. El modelo es un transformer encoder destilado de `FacebookAI/xlm-roberta-large`, con 26.5 millones de parámetros y una ventana de contexto de 128 tokens. Su característica más destacada es el tamaño reducido: ocupa solo 28 MB en una versión cuantizada int8 de ONNX, lo que permite ejecutarlo en CPU o en dispositivos de baja capacidad sin depender de la nube.

El nombre *Thymos* (θυμός) hace referencia al término griego homérico para la "sede de la emoción". El modelo resuelve el problema de clasificar emociones en un contexto multilingüe con un coste computacional mínimo, manteniendo un rendimiento competitivo frente a modelos mucho más grandes. Esto lo hace especialmente relevante para aplicaciones de análisis de sentimiento en tiempo real, moderación de contenido y procesamiento de lenguaje natural en entornos con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder destilado de XLM-RoBERTa large (8 capas, 384 unidades ocultas, 6 cabezas de atención, FFN 1152, pre-LN) |
| Parámetros totales | 26.747.950 (26,5 M: 14,6 M de embeddings, 11,9 M de encoder) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 128 tokens |
| Tipos de cuantización | int8 ONNX (28 MB), fp32 ONNX (62 MB) |
| Idiomas soportados | 22: en, es, fr, de, pt, it, nl, ru, pl, uk, ar, fa, hi, bn, zh, ja, ko, vi, th, id, sw, tr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (fp32 e int8), así como `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo es un encoder transformer cuya arquitectura consta de 8 capas con 384 dimensiones ocultas, 6 cabezas de atención y una red feedforward de 1152 unidades. Usa codificación posicional RoPE (base 10000) y normalización pre-LN. Los embeddings están factorizados: la tabla de embeddings tiene 114.087 entradas de dimensión 128, que se proyectan a 384. El pooling es un promedio enmascarado (masked mean), y la salida son 28 probabilidades sigmoid independientes.

El entrenamiento se realizó mediante destilación de conocimiento. El modelo profesor fue un `XLM-RoBERTa-large` ajustado en los 22 idiomas (3 épocas, batch 128, lr 1e-5 con coseno y 6% de warmup, decay por capas de 0.9, EMA 0.999, longitud máxima 96, bf16). El estudiante se entrenó durante 20 épocas con batch 512, lr 3e-4 y AdamW con weight decay 0.01. La función de pérdida combina un 0.7 de destilación binaria por etiqueta a temperatura 2 y un 0.3 de pérdida supervisada. Los embeddings se inicializaron con una SVD de bajo rango de la matriz de embeddings del profesor.

Los datos de entrenamiento provienen de GoEmotions (58.000 comentarios de Reddit, 27 emociones y neutral), traducidos automáticamente a 21 idiomas adicionales con `facebook/m2m100_1.2B`, generando 955.020 filas de entrenamiento. Los umbrales por clase se ajustaron mediante búsqueda en rejilla en pliegues de validación separados. Para la cuantización int8, la tabla de embeddings se cuantizó con escalas por fila de forma independiente a las multiplicaciones de matrices, dado que la cuantización dinámica de ONNX Runtime no cubre la operación `Gather`.

## Capacidades

- Clasificación multi-etiqueta de emociones sobre las 28 etiquetas de GoEmotions, con una sigmoid por etiqueta.
- Soporte multilingüe en 22 idiomas, incluyendo español, inglés, francés, alemán, portugués, italiano, ruso, árabe, hindi, chino, japonés, entre otros.
- Inferencia eficiente en CPU gracias a la cuantización int8: el modelo pesa 28 MB en formato ONNX.
- Manejo de textos largos mediante partición en ventanas superpuestas con stride 96 y agregación por máximo (para presencia de emociones) o media ponderada por longitud (para tono general).
- No soporta tool calling, ni agentes, ni generación de texto; es un encoder puro de clasificación.
- No procesa visión ni audio.

## Casos de uso

- Analítica de opinión en redes sociales: clasificar automáticamente las emociones expresadas en publicaciones multilingües en tiempo real, gracias al tamaño reducido y la baja latencia en CPU.
- Gestión de la experiencia del cliente: etiquetar el tono emocional de mensajes de soporte para priorizar incidentes y escalar los que requieran intervención humana.
- Moderación de contenido: identificar comentarios con carga emocional intensa (por ejemplo, ira o asco) en foros y comunidades, para su revisión manual.
- Investigación social y de mercado: analizar corpus multilingües de reseñas de productos o respuestas de encuestas, extrayendo señales emocionales sin necesidad de infraestructura de GPU.
- Aplicaciones de bienestar y salud mental (no diagnóstico): hacer seguimiento de señales emocionales en diarios personales o chats con consentimiento explícito, respetando la privacidad mediante procesamiento local.
- Asistentes conversacionales en el dispositivo: anotar emociones de forma local y sin conexión, lo que reduce la dependencia de APIs externas y el coste por uso.
- Mejora de sistemas de recomendación: incorporar la emocionalidad del feedback de los usuarios como señal adicional en la personalización de contenido.

## Benchmarks y rendimiento

Los resultados se presentan sobre el test split de GoEmotions traducido a 21 idiomas adicionales (119.394 filas). El modelo se compara con otros clasificadores de emociones que comparten las mismas 28 etiquetas, medidos bajo el mismo protocolo. Los umbrales en inglés se ajustaron con la validación en inglés; los umbrales multilingües se ajustaron sobre la validación combinada.

| Modelo | Parámetros | Idiomas | Macro-F1 (en) | Macro-F1 (22 idiomas) | Micro-F1 (22 idiomas) |
|---|---|---|---|---|---|
| lettuce-thymos-26m-v1 | 26,5 M | 22 | 0.527 | 0.446 | 0.523 |
| joeddav/distilbert-base-uncased-go-emotions-student | 67 M | 1 | 0.336 | 0.121 | 0.211 |
| SamLowe/roberta-base-go_emotions | 125 M | 1 | 0.505 | 0.147 | 0.296 |
| cirimus/modernbert-base-go-emotions | 149 M | 1 | 0.535 | 0.182 | 0.333 |
| cirimus/modernbert-large-go-emotions | 395 M | 1 | 0.542 | 0.185 | 0.338 |

El profesor (XLM-RoBERTa large ajustado) alcanza un macro-F1 de 0.462 en las 22 lenguas. Comparando por idioma, este modelo supera claramente a `SamLowe/roberta-base-go_emotions` en todos los casos:

| Idioma | Referencia (roberta-base) | Este modelo |
|---|---|---|
| en | 0.379 | 0.522 |
| pt | 0.134 | 0.474 |
| de | 0.144 | 0.470 |
| fr | 0.141 | 0.470 |
| it | 0.139 | 0.470 |
| vi | 0.130 | 0.469 |
| pl | 0.110 | 0.466 |
| id | 0.110 | 0.461 |
| es | 0.162 | 0.457 |
| zh | 0.069 | 0.457 |
| hi | 0.075 | 0.456 |
| nl | 0.157 | 0.455 |
| ru | 0.073 | 0.452 |
| uk | 0.067 | 0.445 |
| ja | 0.103 | 0.444 |
| fa | 0.051 | 0.434 |
| ko | 0.103 | 0.431 |
| th | 0.102 | 0.427 |
| bn | 0.056 | 0.419 |
| tr | 0.094 | 0.407 |
| sw | 0.098 | 0.361 |
| ar | 0.041 | 0.354 |

No se han proporcionado datos de benchmarks en BRIGHTER en la información disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en fp32 ocupan aproximadamente 106 MB (26.747.950 parámetros × 4 bytes). Con overhead de runtime y activaciones, la VRAM total se estima por debajo de 1 GB. La versión int8 ONNX reduce el peso a 28 MB en disco; no hay medición oficial de VRAM en la información proporcionada.
- GPU recomendadas: no disponible. Al ser un modelo pequeño, cualquier GPU con al menos 1 GB de VRAM (por ejemplo, NVIDIA T4, RTX 3060, Apple M1) es suficiente. También se ejecuta directamente en CPU.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU moderna; gracias a la cuantización int8 también puede ejecutarse en dispositivos móviles o edge.
- Opciones de despliegue: ONNX Runtime (CPUExecutionProvider o GPU), Hugging Face Transformers (pipeline `text-classification` con safetensors) o el script `inference.py` incluido en el repositorio para textos largos. No es compatible con vLLM, llama.cpp ni TGI, al ser un encoder de clasificación y no un modelo generativo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Macro-F1 (en) | Macro-F1 (22) | Licencia |
|---|---|---|---|---|---|---|
| lettuce-thymos-26m-v1 | 26,5 M | 128 tokens | 22 | 0.527 | 0.446 | Apache 2.0 |
| SamLowe/roberta-base-go_emotions | 125 M | no disponible | 1 (en) | 0.505 | 0.147 | no disponible |
| joeddav/distilbert-base-uncased-go-emotions-student | 67 M | no disponible | 1 (en) | 0.336 | 0.121 | no disponible |
| cirimus/modernbert-base-go-emotions | 149 M | no disponible | 1 (en) | 0.535 | 0.182 | no disponible |

El modelo de Zeolit ofrece un rendimiento competitivo en inglés, cercano a modelos mucho mayores, pero destaca especialmente en multilingüismo: su macro-F1 en 22 idiomas es más del doble que el de los modelos de referencia. Su licencia Apache 2.0 permite uso comercial y libre redistribución.

## Limitaciones y advertencias

- Contexto limitado a 128 tokens: para textos largos se debe usar la estrategia de partición en ventanas con stride 96, pero la documentación advierte que los umbrales de clasificación fueron ajustados sobre ventanas individuales y no están calibrados para la agregación a nivel de documento.
- No debe usarse en entornos clínicos, diagnósticos ni de seguridad crítica; no es una medida del estado emocional real de una persona.
- Los datos de entrenamiento proceden de comentarios de Reddit en inglés traducidos automáticamente, lo que puede introducir sesgos culturales y errores de traducción en los idiomas no ingleses.
- Riesgo de falsos positivos y falsos negativos en clases raras (por ejemplo, "remordimiento", "alivio"). Se recomienda usar los umbrales por clase incluidos en `labels.json` en lugar de un umbral fijo de 0.5, que degrada notablemente el macro-F1.
- La cuantización int8 puede reducir ligeramente el rendimiento respecto a la versión fp32.
- El modelo no es generativo; no puede producir texto, ni ejecutar tool calling ni tareas de agentes.
- Licencia Apache 2.0: permite uso comercial, pero requiere conservar la atribución y las condiciones de licencia en las redistribuciones.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/Zeolit/lettuce-thymos-26m-v1
- Perfil del autor en HuggingFace: https://huggingface.co/Zeolit
