# tadiecool29/STL-FullFT-afri-mt5-base-sentiment

## Resumen

STL-FullFT-afri-mt5-base-sentiment es un ajuste fino completo del modelo masakhane/afri-mt5-base, publicado por el usuario tadiecool29 en Hugging Face, para clasificación de sentimiento en amhárico como tarea única (single-task learning, STL). Se trata de un modelo de arquitectura transformer encoder-decoder de la familia T5/mT5, con 966.573.312 parámetros almacenados en formato safetensors, que resuelve la tarea como generación texto-a-texto (text2text-generation): recibe el texto en amhárico y genera la etiqueta de sentimiento como secuencia de salida.

Su relevancia radica en que el amhárico es una lengua de bajos recursos en procesamiento del lenguaje natural, y este modelo forma parte de la línea de trabajo de Masakhane orientada a lenguas africanas. El modelo base afri-mt5-base parte de mT5 con un vocabulario adaptado a lenguas africanas, lo que reduce la fragmentación de tokens respecto a un mT5 genérico. Este ajuste concreto permite disponer de una línea base (baseline) reproducible para experimentos de clasificación de sentimiento en amhárico.

Ahora bien, conviene relativizar su madurez: el repositorio acumula 0 descargas y 0 likes, la model card está generada automáticamente e indica explícitamente que el dataset de entrenamiento es desconocido ("unknown dataset"), y el rendimiento declarado se queda en 0,6783 de accuracy y 0,6676 de macro F1 sobre el conjunto de evaluación. Es, por tanto, un artefacto de investigación incipiente más que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder, familia T5/mT5 (text2text-generation) |
| Parámetros totales | 966.573.312 (≈966,6 M) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados sin cuantizar) |
| Idiomas soportados | Amhárico (según etiquetas del repositorio); el modelo base afri-mt5-base está orientado a lenguas africanas |
| Licencia | AFL-3.0 |
| Formato de pesos | safetensors (tamaño del repo: 2,0 GB) |
| Modelo base | masakhane/afri-mt5-base |
| Tarea | Clasificación de sentimiento (single-task) |
| Librería | transformers |
| Fecha de creación | 2026-09-15 |
| Última actualización | 2026-09-15 |

Datos de entrenamiento declarados en la model card:

| Parámetro | Valor |
|---|---|
| Learning rate | 0,0003 |
| Train batch size | 16 |
| Eval batch size | 32 |
| Gradient accumulation steps | 2 |
| Total train batch size | 32 |
| Optimizador | AdamW (torch fused), betas=(0,9; 0,999), epsilon=1e-08 |
| LR scheduler | cosine |
| Warmup steps | 300 |
| Épocas | 10 |
| Label smoothing | 0,1 |
| Seed | 42 |
| Pasos por época | 189 |
| Transformers | 5.0.0 |
| PyTorch | 2.10.0+cu128 |
| Datasets | 5.0.0 |
| Tokenizers | 0.22.2 |

## Arquitectura y entrenamiento

La arquitectura es la de mT5: un transformer encoder-decoder con atención completa (no es un modelo MoE, SSM ni híbrido), normalización previa a la atención y sesgos posicionales relativos en lugar de embeddings posicionales absolutos. El modelo base afri-mt5-base adapta el vocabulario de mT5 a lenguas africanas, lo que explica que el recuento de parámetros (966.573.312) sea superior al de un mT5-base estándar: el embedding de tokens crece con el vocabulario extendido y, en un modelo de este tamaño, ese embedding representa una fracción muy relevante de los parámetros totales.

El ajuste realizado es un full fine-tuning (no LoRA ni adaptadores) sobre un dataset que la model card no identifica ("unknown dataset"), con 10 épocas, batch total de 32 (16 × 2 pasos de acumulación), programación de learning rate coseno con 300 pasos de calentamiento, label smoothing de 0,1 y precisión mixta vía AdamW fused. No se documenta ningún uso de RLHF, DPO ni decodificación especulativa.

## Capacidades

- Generación de texto condicionada a la entrada (text2text-generation) aplicada a clasificación de sentimiento de una sola tarea en amhárico.
- Cabecera de clasificación materializada como salida de texto: la etiqueta se genera como secuencia, por lo que su consumo requiere parsear la salida del decodificador.
- Entrenamiento de tarea única (STL), sin mezcla de tareas ni instrucciones adicionales conocidas.
- Capacidad multilingüe potencial heredada del modelo base afri-mt5-base, aunque el ajuste solo está validado (según el autor) en amhárico.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles; el modelo no está entrenado para ello.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.

## Casos de uso

- Análisis de sentimiento en redes sociales en amhárico: el modelo permite clasificar publicaciones y comentarios como positivos, negativos o neutros dentro de un pipeline de monitorización de marca, sirviendo como clasificador de bajo coste para un idioma con pocas alternativas disponibles.
- Investigación en PLN de bajos recursos: al ser un ajuste de tarea única sobre afri-mt5-base, resulta útil como línea base frente a configuraciones multi-tarea (MTL) o arquitecturas basadas en XLM-R en experimentos académicos reproducibles.
- Monitorización de opinión pública y medios: agregación de sentimiento sobre corpus periodísticos o emisiones de radio transcritas en amhárico para estudios de opinión, con la advertencia de que la accuracy declarada (0,6783) limita las conclusiones a nivel agregado y no individual.
- Análisis de encuestas y atención al cliente: clasificación automática de respuestas abiertas de encuestados o transcripciones de centros de contacto en Etiopía, etiquetando la polaridad para priorizar los casos negativos antes de una revisión humana.
- Moderación de contenido asistida: detección de mensajes con carga negativa en foros y comunidades para enrutarlos a revisión, usando el modelo como filtro de primera fase y no como decisor final.
- Análisis de reseñas de comercio electrónico: procesamiento por lotes de valoraciones de productos escritas en amhárico para calcular métricas de satisfacción por categoría.
- Etiquetado automático (weak labelling) de corpus no anotados: generación de etiquetas preliminares sobre grandes volúmenes de texto para su posterior depuración humana, aprovechando el bajo coste de inferencia de un modelo de ~966 M de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible: el campo `model-index` del repositorio está vacío. Los únicos datos disponibles son las métricas de evaluación declaradas por el autor en la model card.

Resultados finales en el conjunto de evaluación:

| Métrica | Valor |
|---|---|
| Loss | 1,9457 |
| Accuracy | 0,6783 |
| Macro F1 | 0,6676 |
| Precision | 0,6679 |
| Recall | 0,6700 |

Evolución durante el entrenamiento (datos declarados por el autor):

| Época | Paso | Validation loss | Accuracy | Macro F1 | Precision | Recall |
|---|---|---|---|---|---|---|
| 1,0 | 189 | 2,1564 | 0,3566 | 0,1953 | 0,2243 | 0,2840 |
| 2,0 | 378 | 1,8879 | 0,6646 | 0,6569 | 0,6578 | 0,6577 |
| 3,0 | 567 | 1,8513 | 0,6658 | 0,6519 | 0,6633 | 0,6616 |
| 4,0 | 756 | 1,8845 | 0,6796 | 0,6771 | 0,6798 | 0,6765 |
| 5,0 | 945 | 1,8890 | 0,6671 | 0,6509 | 0,6650 | 0,6527 |
| 6,0 | 1134 | 1,9142 | 0,6808 | 0,6728 | 0,6730 | 0,6733 |
| 7,0 | 1323 | 1,9457 | 0,6783 | 0,6676 | 0,6679 | 0,6700 |

El mejor macro F1 se alcanza en la época 4 (0,6771) y la mejor accuracy en la época 6 (0,6808). No se publican resultados de las épocas 8, 9 y 10, pese a que el entrenamiento se configuró con 10 épocas.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, los pesos ocupan unos 3,9 GB; en FP16/BF16, unos 1,9 GB (coherente con el repo de 2,0 GB); en INT8, alrededor de 1 GB; en INT4, alrededor de 0,5 GB. Hay que sumar el coste de activaciones y caché del decodificador, que en un encoder-decoder crece con la longitud de entrada y de salida.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM es suficiente en FP16 con lotes pequeños; para lotes grandes o FP32 se recomienda una GPU de 16-24 GB (RTX 4090, A10, L4, A100 40 GB, H100).
- Cabe en GPU de consumo: sí. Una RTX 3060 de 12 GB, una RTX 4070/4080 o una RTX 4090 ejecutan el modelo sin problemas en FP16; también es viable en GPUs de 8 GB con lotes reducidos.
- CPU: la inferencia en CPU es posible con PyTorch, pero con latencias altas para un modelo de ~966 M de parámetros.
- Opciones de despliegue: transformers (referencia), Text Generation Inference (TGI), vLLM (soporta arquitecturas encoder-decoder tipo T5) y exportación a ONNX vía Optimum. Los runners basados en GGUF (llama.cpp, Ollama) no ofrecen soporte fiable para encoder-decoder T5, por lo que no se recomiendan para este modelo.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| STL-FullFT-afri-mt5-base-sentiment | 966.573.312 | no disponible | Accuracy 0,6783; macro F1 0,6676 (evaluación propia del autor) | AFL-3.0 | Hugging Face |
| masakhane/afri-mt5-base | Mismo orden (~966 M, es el modelo base sin ajustar) | no disponible | no disponible (modelo preentrenado, sin cabecera de clasificación) | no disponible | Hugging Face |
| mT5-base (google) | no disponible en la información proporcionada | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos verificados en la información proporcionada para comparar con alternativas de clasificación de sentimiento en amhárico basadas en XLM-R o AfroXLMR; cualquier comparación de ese tipo requeriría una evaluación propia con el mismo conjunto de test.

## Limitaciones y advertencias

- Model card autogenerada e incompleta: secciones como "Model description", "Intended uses & limitations" y "Training and evaluation data" contienen literalmente "More information needed".
- Dataset de entrenamiento desconocido: no se documenta composición, tamaño, procedencia ni método de anotación, lo que impide evaluar sesgos de dominio, de registro o de anotación.
- Riesgo de sobreajuste: la validation loss toca mínimo en la época 2 (1,8879) y repunta hasta 1,9457 en la época 7, mientras la training loss sigue bajando (de 9,3722 a 3,4349). El rendimiento se estanca en torno a 0,67-0,68 de accuracy desde la época 2.
- Rendimiento moderado: un macro F1 de 0,6676 indica un margen de error sustancial y un posible desequilibrio entre clases (la diferencia entre precisión y recall es pequeña, pero el F1 cae por debajo de la accuracy, señal habitual de clases minoritarias mal cubiertas).
- Ausencia de validación externa: 0 descargas y 0 likes en el repositorio; no hay informes de terceros que reproduzcan las métricas.
- Salida en formato texto: al ser text2text-generation, la etiqueta debe parsearse de la secuencia generada, lo que introduce fragilidad frente a salidas mal formadas.
- Cobertura lingüística limitada: solo hay evidencia de uso en amhárico; no hay datos sobre otros idiomas pese al vocabulario multilingüe del modelo base.
- Longitud de contexto no documentada: no se especifica el máximo de tokens soportado, lo que obliga a validar empíricamente el truncamiento antes de usarlo en producción.
- Licencia: AFL-3.0 es una licencia permisiva aprobada por la OSI que permite uso comercial con atribución y concede licencia de patentes; no obstante, conviene verificar la licencia del modelo base masakhane/afri-mt5-base (no indicada en la información disponible), porque las condiciones del derivado no pueden ser más permisivas que las del original.
- Fecha de creación (2026-09-15) y versiones de framework (Transformers 5.0.0, PyTorch 2.10.0) corresponden al entorno declarado por el autor; verificar compatibilidad antes de reproducir el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tadiecool29/STL-FullFT-afri-mt5-base-sentiment
- Modelo base masakhane/afri-mt5-base: https://huggingface.co/masakhane/afri-mt5-base
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo (papers, blogs, repositorios o demos) en la búsqueda realizada.
