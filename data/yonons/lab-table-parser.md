# yonons/lab-table-parser

## Resumen

`yonons/lab-table-parser` es un modelo publicado en Hugging Face por el usuario `yonons` y derivado de `bert-base-uncased` mediante fine-tuning para una tarea de parsing de tablas en documentos. Segun la model card, se ha entrenado sobre un dataset denominado `invoice-tables` durante 9 epocas con una tasa de aprendizaje de 3e-5 y un tamano de lote de 8, lo que sitúa el modelo en la categoria de encoder transformer de proposito especifico para extraccion de estructura tabular en facturas.

El modelo reporta metricas de evaluacion sobre un conjunto anotado manualmente (`gold-annotated`) con una precision de 0,747 y un recall de 0,827. El uso previsto declarado por el autor es el "batch scoring de documentos internos", es decir, procesamiento por lotes de documentos de una organizacion, no un servicio interactivo de proposito general.

La relevancia de esta ficha es limitada pero concreta: se trata de un modelo pequeno, sin licencia declarada, sin idiomas declarados y sin pipeline definido en Hugging Face, lo que obliga a evaluar su adopcion con cautela. La model card incluye mantenedores identificados (`aruiz`, `tkato`) y un changelog con tres entradas, lo que sugiere un ciclo de mantenimiento activo durante 2025.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (fine-tuning de `bert-base-uncased`) |
| Parametros totales | no disponible (base `bert-base-uncased`: aproximadamente 110 millones, dato no confirmado en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (la de `bert-base-uncased` es de 512 tokens, dato no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles unicamente (declarado en limitaciones) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no se especifica safetensors, GGUF ni otro) |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-uncased`, un encoder transformer bidireccional, y se ha ajustado mediante fine-tuning supervisado para la tarea de parsing de tablas. La model card no describe la cabeza de clasificacion ni el formato exacto de salida (por ejemplo, etiquetado BIO para celdas, deteccion de spans o clasificacion de relaciones entre celdas), por lo que la arquitectura de la tarea concreta no esta disponible.

Los hiperparametros declarados son 9 epocas, learning rate de 3e-5 y batch size de 8 sobre el dataset `invoice-tables`. No se indica el numero de tokens de entrenamiento, la composicion del dataset, si hubo aumento de datos, si se aplico validacion cruzada ni si se realizo alguna fase de RLHF o DPO (poco habitual en un encoder de este tipo). El changelog menciona un reentrenamiento sobre "cleaned data" el 2025-07-02 y una actualizacion de la tabla de evaluacion el 2025-07-18, pero no se detalla que limpieza se aplico ni como cambio el rendimiento entre versiones.

## Capacidades

- Extraccion de estructura tabular en documentos de tipo factura, segun el nombre del modelo y el dataset de entrenamiento (`invoice-tables`).
- Procesamiento por lotes de documentos internos, tal como declara la seccion de uso previsto.
- Clasificacion o etiquetado a nivel de token o de span (la model card no especifica la formulacion exacta).
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara capacidad multilingue; el autor indica explicitamente entrenamiento solo en ingles.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Digitalizacion de facturas en un ERP: el modelo puede puntuar por lotes documentos entrantes para extraer la estructura de las tablas de lineas de factura, aprovechando el uso previsto declarado de "batch scoring" y las metricas de recall reportadas (0,827), que priorizan no perder filas relevantes.
- Conciliacion contable automatizada: integrado en un pipeline nocturno, el modelo etiqueta tablas de facturas para alimentar un proceso de matching contra asientos contables, adecuado porque el autor lo disena para documentos internos y no para interaccion en tiempo real.
- Enriquecimiento de archivos documentales: procesamiento de un repositorio historico de facturas en ingles para generar metadatos estructurados (lineas, importes, descripciones) que alimenten un indice de busqueda.
- Preprocesado para extraccion de entidades: usar la salida del modelo como primera etapa que aísla regiones tabulares antes de aplicar un extractor de entidades o un OCR posterior.
- Control de calidad documental: deteccion de facturas cuyo parsing produce baja confianza, derivando esos casos a revision humana, apropiado dado el recall alto pero precision moderada (0,747).
- Prototipado rapido en un equipo de datos: al estar basado en `bert-base-uncased` y entrenado con hiperparametros estandar, sirve como linea base reproducible para comparar futuros modelos de parsing de tablas en el mismo dominio.

## Benchmarks y rendimiento

Resultados reportados en la model card sobre el conjunto `gold-annotated`:

| Metrica | Valor |
|---|---|
| Precision | 0,747 |
| Recall | 0,827 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, F1, exact match) en la informacion disponible, ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Al derivar de `bert-base-uncased` (aproximadamente 110 millones de parametros), la inferencia en fp32 requeriria del orden de 0,5 GB solo para pesos, mas memoria de activaciones; en fp16 se reduce a la mitad. Estas cifras son estimaciones por arquitectura, no datos confirmados por el autor.
- GPU recomendadas: no disponibles. Por tamano, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) seria suficiente para inferencia en fp16, pero el autor no lo declara.
- Cabe en GPU consumer: previsiblemente si, dado el tamano del modelo base, aunque no esta confirmado en la model card.
- Opciones de despliegue: no declaradas. Al ser un modelo tipo BERT, seria desplegable con Hugging Face Transformers, ONNX Runtime o TorchScript, pero el autor no especifica ninguna.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `yonons/lab-table-parser` | no disponible (base BERT ~110 M) | no disponible | Parsing de tablas en facturas | no disponible | Hugging Face, 0 descargas |
| `microsoft/table-transformer-detection` | no disponible en esta ficha | no disponible | Deteccion de tablas en documentos | no disponible en esta ficha | Hugging Face |
| `google/tapas-base` | no disponible en esta ficha | no disponible | Question answering sobre tablas | no disponible en esta ficha | Hugging Face |

No se dispone de datos de rendimiento de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos en ingles, segun declara el autor; su uso con documentos en castellano u otros idiomas no esta validado.
- Precision de 0,747: aproximadamente una de cada cuatro predicciones positivas podria ser incorrecta, lo que exige validacion o umbral de confianza en produccion.
- No se especifica la licencia, lo que impide confirmar si el uso comercial esta permitido; es un bloqueo potencial para adopcion empresarial.
- No se declara el formato de pesos ni el pipeline en Hugging Face, lo que complica la integracion automatica con `transformers` o con herramientas de despliegue.
- Sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion externa por parte de la comunidad.
- Riesgo de alucinacion estructural: en tareas de parsing, el modelo puede generar etiquetas plausibles pero incorrectas en tablas con formatos no vistos (por ejemplo, facturas con celdas combinadas o layouts irregulares).
- No se documentan sesgos conocidos; al entrenar sobre un dataset de facturas no descrito, pueden persistir sesgos de dominio (tipos de empresa, monedas, formatos regionales).
- La model card no detalla el esquema de salida, lo que obliga a inspeccionar el repositorio antes de integrarlo.
- Fecha de creacion del repositorio (2026-11-20) posterior a las fechas del changelog (2025), una inconsistencia de metadatos a tener en cuenta al evaluar la trazabilidad del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yonons/lab-table-parser
- Modelo base: https://huggingface.co/bert-base-uncased
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
