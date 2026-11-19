# vennyvirtuoso/tableparse-docvl-28m

## Resumen

`tableparse-docvl-28m` es un modelo de visión por computador especializado en el reconocimiento de estructura de tablas, desarrollado por el usuario de Hugging Face `vennyvirtuoso` como un fine-tuning del checkpoint `microsoft/table-transformer-structure-recognition`. Con 28,8 millones de parámetros totales, se trata de un modelo compacto de detección de objetos (pipeline `object-detection`) orientado a identificar elementos estructurales en tablas: filas, columnas, cabeceras de fila y columna, y celdas con spans (combinaciones). Su foco declarado es el parseo de tablas sin bordes y la extracción de estados financieros.

El modelo parte de la arquitectura Table Transformer de Microsoft, que combina un backbone convolucional ResNet-18 con un transformador DETR para la detección de elementos estructurales. En este fine-tuning, el backbone visual se mantiene congelado y se entrenan 17.661.707 parámetros (el 61,26 % del total). El entrenamiento se realizó sobre el dataset `katphlab/fintabnet-pubtables-full`, una combinación de FinTabNet y PubTables-1M, orientada a tablas financieras y científicas complejas.

La relevancia de este modelo radica en su tamaño reducido y su licencia Apache 2.0, que lo hacen adecuado para despliegues de alta throughput y baja latencia en pipelines de document AI, evitando llamadas a APIs multimodales de gran tamaño. El autor reporta mejoras sustanciales sobre el checkpoint base sin adaptar en pérdidas de entrenamiento y validación, aunque no se han publicado métricas estándar de benchmarks como mAP o F1.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Table Transformer (ResNet-18 backbone + transformer DETR para deteccion de objetos) |
| Parametros totales | 28.847.819 (28,8 M) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; se infiere soporte de fp16/bfloat16 por la model card) |
| Idiomas soportados | no disponible (modelo visual, no linguistico) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Table Transformer, un detector de objetos basado en DETR adaptado a la estructura de tablas. El backbone visual es una ResNet-18 congelada durante el fine-tuning, sobre la que se apila un transformador encoder-decoder que predice conjuntos de bounding boxes y etiquetas de clase (tabla, cabecera de columna, cabecera de fila, columna, fila, celda con span, etc.). El modelo base es `microsoft/table-transformer-structure-recognition`, entrenado originalmente en PubTables-1M.

El fine-tuning se realizó sobre el dataset `katphlab/fintabnet-pubtables-full`, con precisión mixta (bfloat16/fp16). Según la model card, se entrenaron 17.661.707 parámetros (61,26 % del total) manteniendo el backbone ResNet-18 congelado. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no aplicables a un detector de objetos). La evaluación se realizó sobre un split de test held-out de 400 tablas financieras complejas con 8.530 bounding boxes, con separación por grupos para evitar fuga de datos.

## Capacidades

- Detección de estructura de tablas: identifica tablas, filas, columnas, cabeceras de fila y columna, y celdas con spans.
- Reconocimiento de tablas sin bordes (borderless grid recognition), orientado a layouts financieros y científicos.
- Detección de celdas combinadas (spanning cells) mediante bounding boxes.
- Salida en formato de detección de objetos: cajas, etiquetas y puntuaciones de confianza.
- Integración con `transformers` mediante `TableTransformerForObjectDetection` y `AutoImageProcessor`.
- Compatibilidad declarada con `sentence-transformers`, `peft` y pipelines estándar de inferencia.
- No soporta generación de texto, tool calling, agentes ni capacidades multilingües (es un modelo puramente visual).
- No dispone de modo thinking, visión general, audio ni otras capacidades multimodales más allá de la imagen de entrada.

## Casos de uso

- Extracción de estados financieros: el modelo detecta filas, columnas y cabeceras en tablas de balances y cuentas de resultados (10-K, 10-Q), lo que permite reconstruir la rejilla y alimentar un pipeline de extracción de datos estructurados.
- Digitalización de tablas sin bordes: en documentos escaneados o PDFs con tablas sin líneas divisorias, el modelo identifica la estructura espacial para reconstruir la tabla antes de aplicar OCR.
- Automatización de document AI en empresa: al ser un modelo de 28,8 M con licencia Apache 2.0, puede desplegarse en microservicios de baja latencia para procesar lotes masivos de documentos sin depender de APIs multimodales costosas.
- Preprocesado para pipelines de OCR: la detección de celdas y cabeceras permite segmentar la imagen antes de pasar cada celda a un motor OCR, mejorando la precisión en tablas complejas.
- Extracción de tablas en literatura científica: gracias al entrenamiento con PubTables-1M, puede aplicarse a tablas de artículos académicos con estructuras irregulares y celdas combinadas.
- Procesamiento en el edge: su tamaño reducido (repo de 0,1 GB) permite ejecución en dispositivos con recursos limitados para tareas de verificación o preprocesado local.
- Control de calidad en digitalización: el modelo puede usarse para validar que una tabla detectada cumple la estructura esperada (número de columnas, presencia de cabeceras) antes de aceptar un documento en un flujo automatizado.

## Benchmarks y rendimiento

Los únicos datos disponibles provienen de la model card y corresponden a pérdidas de entrenamiento/validación sobre un split held-out de 400 tablas financieras complejas (8.530 bounding boxes), no a métricas estándar de detección como mAP o F1.

| Metrica | Fine-tuned | Baseline sin adaptar | Variacion |
|---|---|---|---|
| Hungarian loss (held-out) | 0,5867 | 0,8097 | -27,55 % |
| Cell / header classification loss | 0,1522 | 0,2490 | -38,88 % |
| Bounding box L1 loss | 0,0197 | 0,0285 | -30,88 % |
| GIoU spatial loss | 0,1680 | 0,2090 | -19,62 % |

No se han publicado resultados de benchmarks estándar (mAP, F1, precision/recall) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para un modelo de 28,8 M de parámetros; en la práctica, el uso de memoria depende del tamaño de la imagen de entrada y del batch.
- GPU recomendadas: cualquier GPU moderna es suficiente; para alto throughput se recomiendan A100, H100 o L4. Para desarrollo, una RTX 4090 o RTX 3090 es más que suficiente.
- Cabe en GPU de consumo: sí, en cualquier GPU con al menos 2-4 GB de VRAM (GTX 1650, RTX 3050, etc.), e incluso puede ejecutarse en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: `transformers` con `TableTransformerForObjectDetection`, `device_map="auto"`, y potencialmente exportación a ONNX o TorchScript para servicios de inferencia. No se mencionan integraciones específicas con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponibles en la información proporcionada; la model card menciona "production-ready latency" y "high-throughput batch evaluation" sin cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `vennyvirtuoso/tableparse-docvl-28m` | 28,8 M | Deteccion de estructura de tablas | no aplica (vision) | Apache 2.0 | Hugging Face |
| `microsoft/table-transformer-structure-recognition` | ~28,8 M (misma arquitectura) | Deteccion de estructura de tablas | no aplica (vision) | MIT (segun repositorio original) | Hugging Face |
| `microsoft/table-transformer-detection` | ~28,8 M (misma arquitectura) | Deteccion de tablas (no estructura) | no aplica (vision) | MIT | Hugging Face |

No se dispone de datos de rendimiento comparativo (mAP, F1) entre estos modelos en la información proporcionada. La comparativa se limita a parámetros, tarea y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan sesgos específicos; al entrenarse con FinTabNet y PubTables-1M, puede estar sesgado hacia layouts financieros y científicos, con menor generalización a otros dominios.
- Riesgo de alucinación: en un detector de objetos, el equivalente son falsos positivos (detecciones espurias); la model card indica que el fine-tuning "suprime drásticamente las predicciones falsas", pero no se aportan métricas de precisión/recall.
- Limitaciones de contexto o idioma: no aplica contexto textual; el modelo no procesa texto, solo imagen. No se especifican limitaciones de resolución de imagen.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base de Microsoft puede tener su propia licencia (MIT según el repositorio original); conviene verificar la compatibilidad.
- Caveat para producción: el modelo solo detecta estructura, no extrae el contenido textual de las celdas; requiere un OCR o un modelo de reconocimiento de texto adicional.
- El autor reporta 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación comunitaria independiente.
- No se han publicado métricas estándar de detección (mAP, F1) ni comparativas con alternativas, lo que dificulta evaluar su rendimiento real frente al modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/vennyvirtuoso/tableparse-docvl-28m
- Modelo base: https://huggingface.co/microsoft/table-transformer-structure-recognition
- Dataset de entrenamiento: https://huggingface.co/datasets/katphlab/fintabnet-pubtables-full
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
