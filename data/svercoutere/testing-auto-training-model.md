# svercoutere/testing-auto-training-model

## Resumen

`svercoutere/testing-auto-training-model` es un clasificador de texto multi-etiqueta obtenido por ajuste fino (*fine-tuning*) del modelo neerlandés `svercoutere/robbert-2023-dutch-base-abb`, orientado a la asignación de códigos de una *codelist* sobre textos. El modelo resuelve una tarea de clasificación multietiqueta con cuatro etiquetas posibles (`A1.1`, `A1.2`, `A1.7` y `A2`), es decir, un mismo texto puede recibir cero, una o varias de esas etiquetas simultáneamente, con un umbral global de decisión fijado en 0,85 y umbrales por etiqueta almacenados en el fichero `threshold.json` del repositorio.

El checkpoint tiene 124.445.188 parámetros reales (según los pesos en `safetensors`), lo que lo sitúa en la liga de los encoders tipo BERT/RoBERTa de tamaño *base*, y ocupa 0,5 GB en el repositorio. La model card publica una evaluación en un conjunto reservado con métricas de clasificación multietiqueta que son razonablemente altas: `macro_f1` de 0,8590, `micro_f1` de 0,8794, `subset_accuracy` de 0,8827 y un `mean_brier_score` de 0,0318, lo que sugiere probabilidades bien calibradas.

Es relevante ahora como ejemplo de canalización de entrenamiento automatizado para tareas de codificación con listas de códigos cerradas, y por publicar umbrales por etiqueta junto al modelo, algo poco habitual. Sin embargo, el propio nombre del repositorio ("testing-auto-training-model"), la ausencia de licencia declarada, la falta de documentación sobre datos de entrenamiento y el hecho de que no tenga descargas ni *likes* indican que se trata de un artefacto experimental, no de un modelo listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer con cabeza de clasificación multietiqueta; el modelo base es de la familia RobBERT-2023 (inferido del campo `base_model`; no explicitado en la model card) |
| Parámetros totales | 124.445.188 (dato real extraído de los pesos en `safetensors`) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (no se documentan versiones GGUF, AWQ, GPTQ ni int8/4-bit) |
| Idiomas soportados | no disponible; el modelo base es neerlandés (`robbert-2023-dutch-base-abb`), por lo que el uso esperable es en neerlandés, pero la model card no lo declara |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tarea (*pipeline*) | text-classification (multi-label-classification, codelist-labeling) |
| Etiquetas | 4: `A1.1`, `A1.2`, `A1.7`, `A2` |
| Umbral de decisión | 0,8500 global; umbrales por etiqueta en `threshold.json` |
| Tamaño del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-10 |
| Última actualización | 2026-09-10 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura ni el procedimiento de entrenamiento. Los únicos datos verificables son que se trata de un ajuste fino del modelo `svercoutere/robbert-2023-dutch-base-abb`, que la tarea es de clasificación multietiqueta y que los pesos están en `safetensors`. Por la naturaleza del modelo base (familia RobBERT, encoder tipo RoBERTa para neerlandés) y por el *pipeline* declarado, cabe esperar un transformer *encoder-only* con una cabeza lineal de clasificación sobre la representación del token `[CLS]` y una función de activación sigmoide independiente por etiqueta, propia del régimen multietiqueta. Esta descripción es una inferencia razonada, no un dato documentado.

Tampoco hay información sobre el número de tokens de entrenamiento, la composición del dataset, si hubo anotación humana o sintética, ni si se aplicaron técnicas de ajuste como *RLHF* o *DPO* (poco habituales en clasificadores de este tamaño). El nombre del repositorio sugiere que forma parte de una canalización de entrenamiento automatizado, pero no se documenta en qué consiste esa automatización. El único elemento metodológico explícito es la política de decisión: un umbral global de 0,85 más umbrales específicos por etiqueta, lo que indica que el autor optimizó el punto de corte para equilibrar precisión y exhaustividad en lugar de usar el 0,5 por defecto.

## Capacidades

- Clasificación multietiqueta de texto sobre una lista cerrada de cuatro códigos (`A1.1`, `A1.2`, `A1.7`, `A2`), permitiendo que un mismo documento active varias etiquetas a la vez.
- Salida de probabilidades por etiqueta, calibradas según el `mean_brier_score` de 0,0318 reportado en el conjunto de evaluación reservado.
- Decisión configurable: umbral global de 0,85 y umbrales por etiqueta cargables desde `threshold.json`, lo que permite ajustar el compromiso precisión/exhaustividad por código.
- Ejecución eficiente de inferencia sobre lotes de documentos, dado el tamaño de 124 M de parámetros y un repositorio de 0,5 GB.
- Capacidad de ajuste fino adicional sobre nuevos códigos, ya que se distribuye con pesos completos en `safetensors` y no solo como servicio.
- No se documenta soporte de *tool calling*, *function calling*, razonamiento multi-paso, agentes, visión, audio, modo de razonamiento explícito ni capacidades multilingües. La model card no menciona ninguna de estas funciones.

## Casos de uso

- Codificación automática de documentos en un flujo de trabajo con *codelist*: el clasificador recibe el texto y devuelve la probabilidad de cada código, que se compara con los umbrales de `threshold.json` para decidir qué etiquetas asignar. Es el caso de uso directo para el que fue entrenado.
- Pre-etiquetado con revisión humana (*human-in-the-loop*): el modelo propone códigos y un revisor valida o corrige. El `macro_precision` de 0,8761 y el `mean_brier_score` de 0,0318 permiten priorizar la cola de revisión por confianza, enviando primero los casos con probabilidad cercana al umbral.
- Enrutado y triaje de documentos: si los códigos representan categorías operativas, la salida multietiqueta puede usarse para dirigir cada documento al equipo, cola o sistema correspondiente, aprovechando que un texto puede pertenecer a más de una categoría.
- Auditoría de codificación existente: comparar los códigos ya registrados en un sistema con los que predice el modelo para detectar omisiones o asignaciones dudosas, usando las probabilidades como medida de discrepancia.
- Análisis de cohortes y estudios retrospectivos: aplicar el modelo a un corpus histórico para agrupar documentos por código (`macro_recall` de 0,8456) y construir subconjuntos de análisis reproducibles sin anotación manual completa.
- Construcción de conjuntos de datos etiquetados: usar el modelo como anotador débil para generar datos de entrenamiento de modelos más pequeños o específicos, con control del umbral para limitar el ruido introducido.
- Inferencia a bajo coste en CPU: con 124 M de parámetros, es viable desplegar el modelo en servidores sin GPU para volúmenes moderados de documentos, evitando el coste de un modelo generativo.
- Reentrenamiento periódico dentro de una canalización automatizada: al distribuirse pesos completos y ser un encoder pequeño, se puede reajustar de forma frecuente cuando cambie la definición de la *codelist* o aparezcan nuevas etiquetas.

## Benchmarks y rendimiento

No se han publicado comparaciones con otros modelos en la información disponible. La model card únicamente reporta la evaluación del propio modelo sobre un conjunto reservado (*held-out*), sin especificar su tamaño ni su composición:

| Métrica | Valor |
|---|---|
| macro_average_precision | 0,9005 |
| mean_brier_score | 0,0318 |
| macro_f1 | 0,8590 |
| micro_f1 | 0,8794 |
| weighted_f1 | 0,8791 |
| macro_precision | 0,8761 |
| macro_recall | 0,8456 |
| micro_precision | 0,8875 |
| micro_recall | 0,8715 |
| subset_accuracy | 0,8827 |
| hamming_loss | 0,0334 |

No hay resultados de MMLU, HumanEval, GSM8K ni de ningún otro *benchmark* general, algo esperable en un clasificador de dominio específico. Tampoco se dispone de datos de latencia, *throughput* ni consumo de memoria durante la evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia: no publicada. Por el tamaño del modelo (124,4 M de parámetros), una copia en fp32 ocupa aproximadamente 0,5 GB y en fp16 alrededor de 0,25 GB de pesos, a lo que hay que sumar el consumo de activaciones y del *tokenizador*; el repositorio de 0,5 GB es coherente con pesos en fp32.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con al menos 2 GB de VRAM debería ser suficiente para inferencia en lotes pequeños, dado el tamaño del modelo.
- Cabe en GPU de consumo: sí, previsiblemente en cualquier tarjeta consumer actual (GTX 1050 Ti o superior, RTX serie 20/30/40), así como en CPU.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")` o `AutoModelForSequenceClassification`; exportación a ONNX Runtime para inferencia acelerada en CPU; TorchScript o `sentence-transformers`-style wrapper para servir con FastAPI. Las herramientas orientadas a modelos generativos (vLLM, llama.cpp, Ollama, TGI en modo generativo) no son el vehículo natural para un encoder de clasificación de este tipo.
- Latencia y throughput estimados: no disponibles. No se han publicado medidas.

## Comparativa con modelos similares

No se dispone de datos comparativos verificados en la información proporcionada. La única referencia disponible es el propio modelo base, del que no se documentan parámetros ni métricas en esta ficha:

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| svercoutere/testing-auto-training-model | 124.445.188 | no disponible | Clasificación multietiqueta (4 códigos) | no disponible | HuggingFace |
| svercoutere/robbert-2023-dutch-base-abb (base) | no disponible | no disponible | Modelo de lenguaje enmascarado (encoder neerlandés) | no disponible | HuggingFace |
| Otras alternativas de la misma categoría (encoders neerlandeses ajustados para clasificación) | no disponible | no disponible | Clasificación de texto | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explícita, el uso comercial y la redistribución quedan en un limbo legal. No debe integrarse en producción sin aclarar este punto con el autor.
- Artefacto experimental: el nombre del repositorio (`testing-auto-training-model`) y la ausencia total de descargas sugieren un *checkpoint* de prueba, no una versión estable ni validada.
- Documentación mínima: no se especifican datos de entrenamiento, composición del conjunto de evaluación, tamaño del mismo, ni el procedimiento de ajuste. Las métricas publicadas no son auditables ni reproducibles con la información disponible.
- Ámbito funcional muy restringido: solo cuatro etiquetas de una *codelist* concreta. El modelo no sirve para ninguna otra tarea de clasificación sin reentrenamiento.
- Idiomas: la model card no declara idiomas. El modelo base es neerlandés, por lo que el rendimiento en otros idiomas es indeterminado y probablemente deficiente.
- Riesgo de falsos positivos y falsos negativos: en clasificación de códigos, un falso negativo puede implicar una omisión relevante en un expediente. Las probabilidades deben tratarse como señales, no como decisiones definitivas, y calibrarse con datos propios.
- Umbrales dependientes del dominio: el umbral global de 0,85 y los umbrales por etiqueta se fijaron sobre el conjunto de evaluación del autor; al cambiar la distribución del texto de entrada, su comportamiento puede degradarse.
- Sesgos: no hay ningún análisis de sesgo ni de equidad. No se puede descartar que el modelo herede sesgos del corpus de preentrenamiento del modelo base o del conjunto de ajuste fino.
- Posible desbalanceo de clases: no se informa de la distribución de etiquetas en entrenamiento ni en evaluación, por lo que las métricas macro podrían estar dominadas por etiquetas poco frecuentes sin que sea verificable.
- Ausencia de validación externa: no hay comparaciones con otros modelos ni evaluación en conjuntos independientes, por lo que la generalización más allá del conjunto reservado del autor es una incógnita.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/svercoutere/testing-auto-training-model
- Modelo base: https://huggingface.co/svercoutere/robbert-2023-dutch-base-abb
- Fichero de umbrales por etiqueta: `threshold.json`, incluido en el repositorio del modelo
- La búsqueda web realizada no ha devuelto ningún resultado relevante sobre este modelo: los enlaces recuperados corresponden a sitios de comercio y bolsa de empleo (SHEIN, SHINE, Cambridge Dictionary, Shine.com) sin relación con el modelo. No se han encontrado *papers*, blogs, repositorios ni demos asociados.
