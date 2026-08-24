# TigerByteCyber/codenlbert-tiny

## Resumen

CodeNLBERT-Tiny es un modelo de clasificación de texto diseñado para distinguir entre fragmentos de código fuente y lenguaje natural. Se basa en una arquitectura BERT-small, originalmente desarrollado por Vishnunkumar y re-publicado en esta cuenta por TigerByteCyber. El modelo resuelve un problema concreto de preprocesamiento: identificar automáticamente si un texto es código o prosa, lo que resulta útil en tareas de filtrado, limpieza de datasets y extracción de bloques de código. Su relevancia radica en su simplicidad, su pequeño tamaño (0.2 GB) y su alta precisión, alcanzando una exactitud superior al 99 % en validación. Está entrenado exclusivamente en inglés y su licencia MIT permite uso comercial sin restricciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT-small (fine-tuning sobre modelo de prajwall) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (típico de BERT: 512 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo de 0.2 GB, probablemente safetensors) |

## Arquitectura y entrenamiento

El modelo parte de un BERT-small (procedente de prajwall) y se somete a un fine-tuning para clasificación binaria de secuencias: código frente a lenguaje natural. El entrenamiento se realizó sobre el dataset `vishnun/CodevsNL`, con un total de 5 épocas. No se menciona el uso de RLHF, DPO ni otras técnicas de alineación. La innovación principal es la aplicación directa de un modelo pequeño a una tarea de clasificación específica, logrando una precisión muy alta con un coste computacional reducido. No se detallan hiperparámetros adicionales ni la composición exacta del dataset.

## Capacidades

- Clasificación de texto binaria: determina si una secuencia es código fuente o lenguaje natural.
- Soporte para inferencia en pipelines de `text-classification` de Hugging Face Transformers.
- Compatible con `text-embeddings-inference` y endpoints de Hugging Face.
- No dispone de generación de texto, tool calling, capacidades multimodales ni razonamiento multi-paso.
- Limitado al idioma inglés.

## Casos de uso

- Filtrado de datasets mixtos: en la preparación de corpus para entrenar modelos de código, se puede usar para separar automáticamente los ejemplos de código de los de texto natural, mejorando la calidad del conjunto de datos.
- Detección de fragmentos de código en documentación técnica: permite identificar bloques de código dentro de manuales, wikis o comentarios, facilitando su extracción y procesamiento.
- Clasificación de issues y pull requests en GitHub: ayuda a categorizar automáticamente si una entrada es principalmente código o descripción textual, útil para triaje y priorización.
- Preprocesamiento en pipelines de análisis de repositorios: integrado como paso previo para tareas como resaltado de sintaxis, indexación o búsqueda semántica.
- Extracción de código a partir de capturas de pantalla: el espacio asociado `SnapCode` utiliza este modelo para localizar y extraer bloques de código de imágenes, lo que facilita la digitalización de ejemplos impresos.
- Detección de código en foros o plataformas de preguntas y respuestas: permite etiquetar automáticamente publicaciones que contienen código, mejorando la moderación y la búsqueda.

## Benchmarks y rendimiento

El README del modelo proporciona las métricas de entrenamiento y validación. No se han publicado comparaciones con otros modelos en la información disponible.

| Época | Pérdida de entrenamiento | Pérdida de validación | Exactitud |
|---|---|---|---|
| 1 | 0.022500 | 0.012705 | 0.997203 |
| 2 | 0.008700 | 0.013107 | 0.996880 |
| 3 | 0.002700 | 0.014081 | 0.997633 |
| 4 | 0.001800 | 0.010666 | 0.997526 |
| 5 | 0.000900 | 0.010800 | 0.998063 |

La exactitud final en validación es del 99,8 %, lo que indica un rendimiento muy alto en la tarea de clasificación.

## Requisitos de hardware

- Al ser un modelo BERT-small, su huella de memoria es reducida. Se estima que la inferencia puede ejecutarse en CPU sin problemas, con un uso de RAM inferior a 1 GB.
- En GPU, cualquier tarjeta con al menos 2 GB de VRAM es suficiente (por ejemplo, NVIDIA GTX 1050 Ti, RTX 2060, etc.).
- Es adecuado para despliegue en entornos con recursos limitados, como dispositivos edge o servidores de baja potencia.
- Opciones de despliegue: puede servirse mediante Hug Face Inference Endpoints, o integrarse en aplicaciones con la librería Transformers. También es compatible con `text-embeddings-inference` para servir embeddings, aunque su uso principal es clasificación.
- La latencia es muy baja, del orden de milisegundos por muestra en GPU y decenas de milisegundos en CPU, aunque no se proporcionan cifras exactas.

## Comparativa con modelos similares

No se dispone de información sobre comparaciones con otros modelos de clasificación código vs. lenguaje natural en los datos proporcionados. No obstante, se puede contextualizar con alternativas genéricas:

| Modelo | Arquitectura | Parámetros | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| CodeNLBERT-Tiny | BERT-small | no disponible | no disponible | MIT | Clasificación código vs. lenguaje natural |
| CodeBERT | BERT (base) | ~125M | 512 | MIT | Embeddings y clasificación de código |
| GraphCodeBERT | BERT (base) | ~125M | 512 | MIT | Embeddings de código con estructura de grafo |

CodeBERT y GraphCodeBERT son modelos más grandes y generales, mientras que CodeNLBERT-Tiny está especializado en una única tarea con un coste mucho menor.

## Limitaciones y advertencias

- El modelo solo soporta inglés; no se ha entrenado para otros idiomas.
- Su capacidad se limita a clasificación binaria; no genera texto ni realiza otras tareas.
- El dataset de entrenamiento (`vishnun/CodevsNL`) puede contener sesgos en los tipos de código o lenguaje natural representados, lo que podría afectar a la generalización en dominios no vistos.
- No se han documentado pruebas de robustez frente a entradas adversarias o ruido.
- Aunque la licencia MIT permite uso comercial, el modelo se distribuye sin garantías y el autor original no proporciona soporte oficial.
- Para producción, se recomienda validar el rendimiento en el dominio específico antes de integrarlo.

## Enlaces

- Modelo en Hugging Face (TigerByteCyber): https://huggingface.co/TigerByteCyber/codenlbert-tiny
- Modelo original (vishnun): https://huggingface.co/vishnun/codenlbert-tiny
- Repositorio GitHub del autor: https://github.com/Vishnunkumar
- Space de extracción de código desde capturas: https://huggingface.co/spaces/vishnun/SnapCode
- Página de referencia en AIBase: https://model.aibase.com/models/details/1924737640763232256
