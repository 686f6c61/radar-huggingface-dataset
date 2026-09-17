# yhhugging/DualMLC-eurlex-4k

## Resumen

DualMLC-eurlex-4k es un checkpoint de clasificación multietiqueta de texto publicado por el usuario yhhugging, asociado al artículo "LLM-Enhanced Dual-Branch Learning for Large-Scale Multi-Label Text Classification" de Hui Ye, Jing Zhang, Xiulong Yang y Rajshekhar Sunderraman. No es un modelo generativo: es un clasificador especializado que asigna a un documento un ranking de etiquetas pertenecientes a un vocabulario fijo, en este caso el del conjunto de datos EUR-Lex-4K. El repositorio pesa 0,5 GB porque no contiene el modelo base completo, sino únicamente los artefactos entrenados.

La arquitectura es de doble rama: una rama Qwen2.5-7B adaptada con LoRA y una rama BERT-base afinada por completo (google-bert/bert-base-uncased), cada una con su propia cabeza clasificadora. Las puntuaciones de ambas cabezas se combinan mediante fusión tardía de logits (late logit fusion), y el peso de fusión, el número de etiquetas y los detalles de arquitectura quedan registrados en `config.json`. El modelo base Qwen2.5-7B se descarga por separado desde su repositorio original.

Su relevancia es doble: por un lado, ilustra el patrón de usar un LLM con LoRA como rama complementaria de un encoder clásico en tareas de clasificación extrema multietiqueta; por otro, ofrece un punto de referencia reproducible para EUR-Lex-4K con métricas declaradas de P@1 = 88,82 %, P@3 = 75,60 % y P@5 = 62,49 % en el paso 7000. El entrenamiento declarado es de 0,45 horas en 8 × RTX 4090, lo que da una idea del coste computacional de esta estrategia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Doble rama: Qwen2.5-7B con adaptador LoRA + BERT-base afinado completo, cada rama con su cabeza clasificadora y fusion tardia de logits |
| Parametros totales | No disponible como cifra agregada; el autor no la publica. Comprende la rama Qwen2.5-7B (descargada aparte) y la rama BERT-base incluida en el checkpoint |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible; las entradas se truncan a las longitudes maximas definidas en `config.json`, cuyo valor no se publica |
| Tipos de cuantizacion | No disponible; el checkpoint se distribuye sin cuantizar (adaptador LoRA y encoder BERT en precision original) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0, declarada por el publicador; la licencia Apache 2.0 del repositorio de codigo original cubre solo el codigo |
| Formato de pesos | safetensors (adaptador LoRA y encoder BERT) y ficheros PyTorch `.pt` para las cabezas (`head_qwen.pt`, `head_bert.pt`) |

## Arquitectura y entrenamiento

DualMLC procesa cada documento con dos ramas paralelas. La primera es una rama Qwen2.5-7B adaptada mediante LoRA, es decir, sin reentrenar los pesos completos del LLM. La segunda es un encoder BERT-base afinado por completo. Cada rama dispone de su propia cabeza de clasificación sobre el vocabulario de etiquetas del conjunto de datos, y el ranking final se obtiene combinando los logits de ambas cabezas con una fusión tardía cuyo peso queda fijado en `config.json`. El checkpoint contiene únicamente `qwen_lora_adapter/`, `bert_encoder/`, los dos tokenizadores, las dos cabezas y, opcionalmente, `best_metrics.json` y `labels.txt` en el orden de índices de etiqueta del entrenamiento.

El entrenamiento declarado se completa en 0,45 horas sobre 8 × RTX 4090 con CUDA 11.8, sobre el conjunto EUR-Lex-4K en su variante preprocesada `xmc-base/eurlex-4k`. Las métricas registradas corresponden al paso 7000. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron fases de RLHF o DPO (poco probables en una tarea de clasificacion de este tipo). Los datos publicados tampoco especifican el valor concreto del peso de fusion ni el numero de etiquetas, aunque ambos estan serializados en `config.json`.

## Capacidades

- Clasificacion multietiqueta extrema (XMC) sobre un vocabulario fijo: asigna un ranking de etiquetas por documento, no una unica clase.
- Ranking de etiquetas con metricas de precision at k (P@1, P@3, P@5), segun lo reportado por el autor.
- Procesamiento de documentos en ingles con las longitudes maximas definidas en la configuracion del checkpoint.
- Uso de un LLM (Qwen2.5-7B) como rama complementaria de un encoder BERT dentro de un mismo pipeline de inferencia.
- No genera texto: no dispone de capacidad de generacion, resumen ni respuesta a instrucciones.
- No soporta tool calling ni function calling.
- No esta disenado para agentes ni razonamiento multi-paso.
- No acepta un vocabulario de etiquetas nuevo o arbitrario: solo el vocabulario de entrenamiento de este checkpoint.
- No se han documentado capacidades multimodales (vision, audio) ni modo de razonamiento explicito.

## Casos de uso

- Etiquetado automatico de documentacion juridica de la UE: dado un documento en ingles, el modelo devuelve los descriptores mas probables del vocabulario EUR-Lex-4K, lo que permite asignar multiples materias a la vez sin intervencion manual.
- Triaje y enrutado de expedientes legales: clasificar un lote de documentos entrantes para dirigirlos al departamento o area de practica correspondiente segun las etiquetas de mayor puntuacion.
- Enriquecimiento de metadatos en repositorios documentales: generar etiquetas tematicas para mejorar la indexacion y la busqueda en bases de conocimiento juridico que ya operan con vocabularios controlados similares.
- Filtrado y construccion de corpus para investigacion: seleccionar subconjuntos de documentos por materia dentro de grandes colecciones legales, usando el ranking de etiquetas como criterio de filtrado.
- Investigacion en clasificacion multietiqueta extrema: servir como punto de partida reproducible para comparar estrategias de fusión de ramas LLM + encoder sobre EUR-Lex-4K.
- Analisis de cumplimiento normativo por areas: clasificar textos regulatorios en ingles para identificar que dominios normativos cubren antes de una revision manual mas detallada.
- Preetiquetado en flujos de anotacion humana: reducir el esfuerzo de anotadores juridicos proponiendo las etiquetas candidatas con mayor puntuacion para su validacion.

En todos los casos el uso queda restringido a documentos en ingles y al vocabulario de etiquetas fijo del checkpoint; las puntuaciones de salida son valores transformados por sigmoide, no probabilidades calibradas.

## Benchmarks y rendimiento

| Conjunto | Metrica | Valor del checkpoint (`best_metrics.json`, paso 7000) | Valor reportado en el Model Zoo del repositorio |
|---|---|---:|---:|
| EUR-Lex-4K | P@1 (%) | 88,82 | 88,82 |
| EUR-Lex-4K | P@3 (%) | 75,60 | 75,80 |
| EUR-Lex-4K | P@5 (%) | 62,49 | 62,74 |

Los valores de la columna del checkpoint estan registrados en el propio `best_metrics.json` de la release y no proceden de una evaluacion nueva. El autor advierte explicitamente de que el P@3 y el P@5 del Model Zoo del repositorio de GitHub difieren de los registrados en el checkpoint. No se han publicado en la informacion disponible resultados comparativos con otros modelos sobre la misma metrica.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa: en torno a 16-20 GB contando los pesos de Qwen2.5-7B mas la rama BERT, las dos cabezas y las activaciones (estimacion propia, no publicada por el autor).
- El checkpoint en si ocupa 0,5 GB, pero el modelo base Qwen2.5-7B debe descargarse por separado y es el componente dominante en memoria.
- GPU recomendadas: A100 40 GB, H100, L40S o cualquier GPU con 24 GB o mas. El autor recomienda una GPU con memoria suficiente para el modelo base Qwen y ambas ramas.
- Cabe en GPU de consumo: si en RTX 4090 y RTX 3090 (24 GB). En tarjetas de 16 GB el margen es ajustado en bf16/fp16. Cuantizar la rama Qwen a 4 bits reduciria el requisito a unos 5-6 GB, pero el codigo de inferencia publicado no documenta soporte de cuantizacion.
- Opciones de despliegue: el unico camino documentado es PyTorch con el codigo del repositorio `huiyegit/DualMLC` (funcion `load_checkpoint` de `model.py` y script `test.py`). No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, ya que las cabezas y la fusion de ramas son personalizadas.
- Latencia y throughput: no disponibles. El unico dato de coste computacional publicado es el tiempo de entrenamiento de 0,45 horas en 8 × RTX 4090 con CUDA 11.8.

## Comparativa con modelos similares

No se dispone de resultados publicados de otros modelos sobre EUR-Lex-4K en la informacion proporcionada, por lo que no es posible una comparativa cuantitativa fiable. La unica comparacion documentada es entre el propio checkpoint y las cifras del Model Zoo del repositorio del autor, que difieren ligeramente:

| Fuente | P@1 (%) | P@3 (%) | P@5 (%) |
|---|---:|---:|---:|
| Checkpoint `yhhugging/DualMLC-eurlex-4k` | 88,82 | 75,60 | 62,49 |
| Model Zoo del repositorio DualMLC | 88,82 | 75,80 | 62,74 |

Como referencia estructural, el checkpoint combina un LLM de 7B con un encoder BERT-base afinado, pero no se publican las contribuciones individuales de cada rama ni comparaciones con alternativas como BERT-base afinado en solitario o Qwen2.5-7B en zero-shot. Otros checkpoints DualMLC para distintos conjuntos de datos no aparecen listados en la informacion disponible.

## Limitaciones y advertencias

- Vocabulario de etiquetas fijo: el modelo solo puede producir etiquetas del vocabulario EUR-Lex-4K con el que fue entrenado y no acepta un vocabulario nuevo. Los identificadores de etiqueta no son intercambiables entre conjuntos de datos ni entre variantes de preprocesado.
- Idioma: el modelo esta declarado unicamente para ingles. El rendimiento en otros dominios e idiomas no ha sido establecido por los resultados reportados.
- No genera texto: cualquier expectativa de uso como asistente conversacional, resumen o generacion es incorrecta.
- Truncamiento de entradas: los documentos se recortan a las longitudes maximas de `config.json`, de modo que el contenido que exceda ese limite no influye en la prediccion.
- Puntuaciones no calibradas: el codigo de inferencia reporta valores transformados por sigmoide, que no estan documentados como probabilidades calibradas; no deben interpretarse como niveles de confianza absolutos.
- Riesgo de sesgo heredado: al depender de Qwen2.5-7B y de BERT-base, el modelo puede arrastrar los sesgos de sus corpus de preentrenamiento, no evaluados en la informacion disponible. La distribucion tematica de EUR-Lex tambien puede sobrerrepresentar determinadas areas del derecho.
- Riesgo de error en la cola del ranking: aunque el P@1 es alto, el P@5 baja hasta 62,49 %, por lo que las etiquetas menos probables son notablemente menos fiables y requieren revision humana en flujos criticos.
- Licencia: el publicador declara apache-2.0 para el checkpoint, pero la licencia Apache 2.0 del repositorio original cubre unicamente el codigo. Los modelos base (Qwen2.5-7B y BERT) y los conjuntos de datos de evaluacion tienen sus propias licencias y terminos, que hay que revisar por separado antes de un uso comercial.
- Dependencia de descarga externa: el checkpoint no incluye el modelo base Qwen2.5-7B, por lo que la reproduccion exige descargarlo aparte y cumplir su licencia.
- Madurez y soporte: el repositorio acumula 12 descargas y 0 "likes" en el momento de la consulta, y el codigo debe usarse en el commit `de43c6b11a85b6d641ae8dc468930df40dac96bd`, lo que limita el soporte de la comunidad y la compatibilidad con versiones futuras.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yhhugging/DualMLC-eurlex-4k
- Paper (arXiv): https://arxiv.org/abs/2609.12915
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2609.12915
- Codigo fuente (GitHub): https://github.com/huiyegit/DualMLC
- Instrucciones de instalacion del repositorio: https://github.com/huiyegit/DualMLC#setup
- Modelo base Qwen2.5-7B: https://huggingface.co/Qwen/Qwen2.5-7B
- Modelo base BERT: https://huggingface.co/google-bert/bert-base-uncased

Nota: la busqueda web realizada no devolvio resultados relacionados con el modelo; los unicos enlaces relevantes son los procedentes de la model card y de los metadatos del repositorio.
