# valiant9000/bert4ner-base-chinese-onnx

## Resumen

`valiant9000/bert4ner-base-chinese-onnx` es una exportación a formato ONNX del modelo `shibing624/bert4ner-base-chinese`, un sistema de reconocimiento de entidades nombradas (NER) para chino basado en la arquitectura BERT. El autor de la exportación es el usuario de Hugging Face valiant9000, mientras que el entrenamiento original corresponde a shibing624, autor del proyecto nerpy. El modelo resuelve la tarea de etiquetado de secuencias (token classification) identificando entidades de tipo persona (PER), organización (ORG), localización (LOC) y tiempo (TIME) en texto en chino.

La relevancia de esta ficha radica en que la exportación ONNX está pensada específicamente para su uso con Transformers.js y ONNX Runtime, lo que permite ejecutar el modelo directamente en el navegador o en entornos JavaScript/Node.js sin necesidad de un backend Python. Los pesos se mantienen en FP32 sin modificaciones respecto al modelo original; solo se ha convertido el formato.

Se trata de un modelo de tamaño base (arquitectura BERT, aproximadamente 110 millones de parámetros, aunque el dato exacto no se detalla en la información disponible), con licencia Apache-2.0 heredada del modelo original y soporte exclusivo para chino. El repositorio ocupa 0,4 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder), exportado a ONNX |
| Parametros totales | no disponible (modelo base BERT, aproximadamente 110 M según arquitectura, no confirmado en la información) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (BERT base típicamente 512 tokens, no confirmado) |
| Tipos de cuantizacion | FP32 (pesos sin modificar); no se documentan otras cuantizaciones |
| Idiomas soportados | chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`onnx/model.onnx`) + `tokenizer.json` |

## Arquitectura y entrenamiento

El modelo subyacente es un BERT de tipo base adaptado a etiquetado de secuencias (token classification) para NER en chino. La exportación ONNX conserva la arquitectura transformer encoder original y solo cambia el formato de serialización. Las entradas del grafo ONNX son `input_ids`, `attention_mask` y `token_type_ids`, y la salida es `logits`. El tokenizador incluido usa `BertNormalizer` con un vocabulario idéntico al de `bert-base-chinese`.

La conversión se realizó con `optimum-cli export onnx` sobre una revisión fijada del modelo original (`5d660ed2aa9da482bf2d99c6bc8cf2ce66758f6a`), usando optimum 2.1.0, optimum-onnx 0.1.0, transformers 4.57.6 y torch 2.15.0+cpu. El autor reporta que los logits exportados coinciden con el modelo PyTorch original dentro de 4e-6 (máximo absoluto) y que las etiquetas argmax son idénticas en una frase de comprobación. No se documentan en la información disponible detalles sobre el dataset de entrenamiento original, número de tokens, ni si hubo RLHF/DPO; esa información correspondería al modelo base `shibing624/bert4ner-base-chinese` y al proyecto nerpy.

Las etiquetas del esquema NER son: `O`, `B-/I-PER`, `B-/I-ORG`, `B-/I-LOC` y `B-/I-TIME`, definidas en el `config.json` del repositorio.

## Capacidades

- Reconocimiento de entidades nombradas en chino: personas (PER), organizaciones (ORG), localizaciones (LOC) y expresiones de tiempo (TIME).
- Etiquetado a nivel de token con esquema BIO (B- e I- para cada tipo de entidad).
- Ejecución en navegador y en JavaScript/Node.js mediante Transformers.js y ONNX Runtime.
- Inferencia sin dependencias de Python en el entorno de despliegue.
- No soporta tool calling ni function calling (es un modelo de clasificación, no generativo).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo chino.
- No dispone de modo thinking, visión ni audio.
- No es un modelo generativo: no produce texto libre, solo etiquetas por token.

## Casos de uso

- Extracción de entidades en pipelines de procesamiento de documentos chinos: el modelo puede integrarse en un flujo de OCR + NER para identificar nombres de personas, empresas, lugares y fechas en contratos, facturas o informes, ejecutándose en el navegador con Transformers.js.
- Anonimización de datos personales (PII) en aplicaciones web: al detectar etiquetas PER, ORG y LOC, se pueden enmascarar entidades sensibles antes de enviar texto a un servidor, aprovechando la inferencia local en el cliente.
- Enriquecimiento de bases de datos de noticias o artículos en chino: extracción automática de entidades para construir índices de búsqueda o grafos de conocimiento, con despliegue en Node.js sin backend Python.
- Procesamiento de formularios y correos en aplicaciones de atención al cliente: identificación de nombres de clientes, empresas y fechas para enrutamiento o extracción de campos estructurados.
- Análisis de opiniones y redes sociales en chino: detección de marcas (ORG) y localizaciones (LOC) en comentarios para análisis de sentimiento a nivel de entidad.
- Herramientas de edición de texto en el navegador: resaltado en tiempo real de entidades nombradas mientras el usuario escribe, gracias a la ejecución ONNX en el cliente sin latencia de red.
- Preprocesamiento para sistemas de búsqueda o RAG: etiquetado de entidades en fragmentos de texto antes de la indexación, ejecutándose en entornos JavaScript.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta una comprobación de equivalencia numérica entre los logits ONNX y los de PyTorch (diferencia máxima absoluta de 4e-6 y argmax idéntico en una frase de prueba), pero no se proporcionan métricas de precisión, recall o F1 sobre conjuntos de datos NER estándar.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; para un BERT base en FP32 el peso ronda los 0,4 GB, por lo que la inferencia cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos 2 GB de memoria libre es suficiente para un BERT base en FP32; no se documentan requisitos específicos.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier GPU moderna (GTX 1050 o superior, RTX 2060, RTX 3060, RTX 4090), aunque el dato no se confirma en la información.
- Opciones de despliegue: Transformers.js (principal), ONNX Runtime (web, Node.js, C++), y potencialmente otros runtimes compatibles con ONNX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Arquitectura | Parámetros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| valiant9000/bert4ner-base-chinese-onnx | BERT + ONNX | no disponible (~110 M) | no disponible | zh | Apache-2.0 | ONNX |
| shibing624/bert4ner-base-chinese | BERT | no disponible (~110 M) | no disponible | zh | Apache-2.0 | PyTorch (safetensors/bin) |
| bert-base-chinese | BERT | ~110 M | 512 | zh | Apache-2.0 | PyTorch |

La comparación principal es con el modelo original `shibing624/bert4ner-base-chinese`, del que esta exportación es una conversión directa de formato: mismos pesos, misma licencia y mismas capacidades. La diferencia es el formato ONNX, que habilita el despliegue en JavaScript y en navegador. No se dispone de datos de rendimiento comparativo entre ambos ni con otras alternativas NER en chino.

## Limitaciones y advertencias

- Solo soporta chino; no es utilizable para otros idiomas.
- Es un modelo de clasificación de tokens, no generativo: no responde preguntas ni genera texto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí puede producir etiquetas incorrectas o falsos positivos/negativos en entidades ambiguas.
- No se documentan sesgos específicos, pero al ser un modelo entrenado sobre datos en chino puede reflejar sesgos presentes en dichos datos.
- La longitud máxima de contexto no se especifica en la información; los modelos BERT base suelen limitarse a 512 tokens, lo que restringe documentos largos.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validación comunitaria ni reportes de uso en producción.
- Aunque la licencia es Apache-2.0 y permite uso comercial, se recomienda revisar `LICENSE.txt` y `NOTICE.txt` del repositorio y respetar la atribución al autor original (shibing624).
- La exportación se realizó con versiones concretas de herramientas (optimum 2.1.0, transformers 4.57.6, torch 2.15.0); cambios de versión en el runtime podrían afectar a la compatibilidad.
- No se proporcionan métricas de calidad (F1, precisión, recall) que permitan evaluar su idoneidad para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/valiant9000/bert4ner-base-chinese-onnx
- Modelo base original: https://huggingface.co/shibing624/bert4ner-base-chinese
- Proyecto nerpy (autor original): https://github.com/shibing624/nerpy
- Transformers.js: https://github.com/huggingface/transformers.js
- ONNX Runtime: https://onnxruntime.ai/
