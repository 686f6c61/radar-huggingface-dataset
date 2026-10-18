# vlmurthylab/1dvit_base_patch50_5000.ssl_mimic

## Resumen

El modelo `vlmurthylab/1dvit_base_patch50_5000.ssl_mimic` es un checkpoint de un Vision Transformer 1D (ViT base) de 99.341.360 parámetros, con parches de tamaño 50, publicado como espejo del original de 4dm-labs. Está asociado a ECGFlow, un trabajo sobre modelado de electrocardiogramas publicado en NEJM AI (Moody JB et al., 2025), y su identificador indica preentrenamiento auto-supervisado con enmascaramiento (SSL/MIM) sobre datos MIMIC. El repositorio contiene únicamente pesos en safetensors bajo licencia Apache-2.0, sin cabecera de tarea ni pipeline declarado.

Su relevancia radica en que ofrece un backbone ligero y reutilizable para señales fisiológicas 1D, en un ecosistema donde la mayoría de los modelos publicados son transformers de texto o visión 2D. Al tener ~99 M de parámetros, se puede ajustar y desplegar en hardware modesto, lo que facilita investigación reproducible y transferencia a tareas con pocas etiquetas. Sin embargo, la información pública disponible es mínima: no se documentan la longitud de entrada exacta, el número de tokens de preentrenamiento, la composición del dataset ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer 1D (ViT base) con parches de tamaño 50; número de capas, dimensión oculta y cabezas no documentados |
| Parámetros totales | 99.341.360 |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no se documenta la longitud máxima de señal ni el número de tokens de entrada. El identificador incluye «5000», pero no se aclara su significado |
| Tipos de cuantización | no disponible; solo se publican pesos safetensors, sin variantes cuantizadas documentadas |
| Idiomas soportados | no disponible; no es un modelo de lenguaje, la entrada es una señal 1D |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer 1D: divide la señal en parches de 50 muestras y aplica autoatención sobre los tokens resultantes. El sufijo `base` y el recuento de 99,3 M son coherentes con un ViT de escala base; no se especifican el número de capas, las dimensiones ocultas ni las cabezas de atención. El checkpoint parece contener solo el encoder preentrenado, sin cabeza de clasificación ni decoder generativo documentado.

El preentrenamiento es auto-supervisado con enmascaramiento (MIM), según el identificador `ssl_mimic`, sobre datos MIMIC. No se dispone del número de tokens, la composición del corpus, la frecuencia de muestreo, la configuración de aumentos ni el número de derivaciones. Tampoco se documenta si hubo ajuste con RLHF/DPO, algo que no aplica a un encoder de señal. La model card remite a ECGFlow y al repositorio de 4dm-labs para el código y la descripción completa.

## Capacidades

- Extracción de embeddings de señales 1D: el encoder produce representaciones por token que pueden agregarse para clasificación, regresión o recuperación de registros similares.
- Inicialización para fine-tuning: al ser un checkpoint SSL, sirve para transfer learning en tareas con etiquetas limitadas.
- Reconstrucción de señal enmascarada: la tarea pretexta de enmascaramiento permite evaluar la calidad de las representaciones, aunque no se documenta si el decoder está incluido.
- Procesamiento mediante parches de 50 muestras: adecuado para series temporales de longitud moderada, si bien la longitud máxima no está documentada.
- No incluye generación de texto, tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües; no es un modelo de lenguaje.
- No se documentan capacidades de visión 2D, audio, vídeo ni modo de razonamiento explícito.
- No se documenta soporte nativo para clasificación de arritmias u otras etiquetas clínicas; requeriría añadir y entrenar una cabeza específica.

## Casos de uso

- Clasificación de arritmias con fine-tuning: se carga el encoder, se añade una cabeza lineal o temporal y se entrena con ECG etiquetados. Los 99 M de parámetros permiten ajustar en una GPU consumer y reducir el coste frente a entrenar desde cero.
- Extracción de embeddings para búsqueda de ECG similares: generar vectores de señal y usar similitud coseno para recuperar registros morfológicamente parecidos, útil en investigación y control de duplicados.
- Detección de anomalías no supervisada: entrenar un modelo de densidad o un autoencoder sobre embeddings de ECG normales y marcar desviaciones; el backbone preentrenado reduce la necesidad de etiquetas.
- Transferencia a dominios con pocas etiquetas: congelar el encoder o ajustar solo una parte en un hospital concreto; el preentrenamiento en MIMIC actúa como inicialización y disminuye el riesgo de sobreajuste.
- Agrupamiento de fenotipos: aplicar clustering sobre embeddings para explorar subpoblaciones de pacientes o patrones de señal sin supervisión.
- Reproducción de ECGFlow: usar el checkpoint como base para replicar experimentos del artículo y comparar variantes de preentrenamiento o preprocesado.
- Evaluación de calidad de señal: fine-tuning para detectar derivaciones ruidosas o artefactos antes del análisis; requiere un conjunto etiquetado específico.
- Investigación en SSL para series temporales: comparar tareas de enmascaramiento, tamaños de parche y estrategias de aumento sobre un backbone 1D estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

| Benchmark | Resultado |
|---|---|
| Métricas de ECG (AUROC, F1, exactitud) | no disponible |
| MMLU, HumanEval, GSM8K | no aplica (modelo no lingüístico) |
| Comparación con ECGFlow | no disponible en la información proporcionada |

## Requisitos de hardware

- Pesos: 99,3 M de parámetros. En FP32 ocupan aproximadamente 0,40 GB, coherente con el repositorio de 0,4 GB; en FP16/BF16, ~0,20 GB; en INT8, ~0,10 GB; en INT4, ~0,05 GB. No hay variantes cuantizadas publicadas.
- VRAM estimada para inferencia: menos de 1 GB solo para pesos. Con activaciones, lote y longitud de entrada típicos, 1-2 GB suele ser suficiente; la cifra exacta no está documentada.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (GTX 1650, RTX 3050/3060/4090) puede ejecutar inferencia y fine-tuning ligero. A100/H100 son innecesarias pero compatibles. La CPU es viable para inferencia por lotes pequeños.
- Opciones de despliegue: PyTorch, Hugging Face Transformers si se incluye el código de la arquitectura, ONNX Runtime o TorchScript. vLLM, TGI, llama.cpp y Ollama no están documentados y no son adecuados para un encoder 1D no generativo; no hay GGUF.
- Latencia y throughput: no disponibles. Al ser un modelo pequeño, se espera un throughput alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este checkpoint (espejo) | 99,3 M | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Original de 4dm-labs | 99,3 M | no disponible | no disponible | Apache-2.0 | Hugging Face |
| Alternativas 1D ViT para ECG | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de modelos comparables en la información proporcionada. La comparación más directa es con el checkpoint original de 4dm-labs, que es el mismo modelo redistribuido sin cambios.

## Limitaciones y advertencias

- Información insuficiente: no se documentan preprocesado, frecuencia de muestreo, número de derivaciones, normalización ni longitud de entrada. Esto impide reproducir el preentrenamiento sin consultar el código de ECGFlow.
- No es un dispositivo médico: no hay validación clínica, resultados de sensibilidad/especificidad ni certificación sanitaria.
- Sesgos: al preentrenarse en MIMIC, puede heredar sesgos demográficos y de adquisición del dataset; no se detallan en la información disponible.
- Riesgo de alucinación: no aplica como modelo generativo, pero las predicciones downstream pueden estar mal calibradas y producir falsos positivos o falsos negativos.
- Dominio: cambios de dispositivo, derivación, frecuencia de muestreo o población pueden degradar el rendimiento; no hay estudios de robustez en la información proporcionada.
- Licencia: Apache-2.0 permite uso comercial, pero el acceso a MIMIC y las condiciones de la publicación original deben verificarse; el espejo no añade garantías.
- Sin cabeza de tarea: no se puede usar directamente para clasificar; requiere fine-tuning y datos etiquetados.
- Mantenimiento: el repositorio espejo tiene 0 descargas y 0 likes en el momento de la consulta; no hay soporte documentado.

## Enlaces

- Hugging Face (espejo): https://huggingface.co/vlmurthylab/1dvit_base_patch50_5000.ssl_mimic
- Hugging Face (original): https://huggingface.co/4dm-labs/1dvit_base_patch50_5000.ssl_mimic
- Repositorio ECGFlow de 4dm-labs: https://github.com/4dm-labs/ecgflow
- Repositorio ECGFlow de vlmurthylab: https://github.com/vlmurthylab/ecgflow
- Artículo NEJM AI: https://doi.org/10.1056/AIoa2500164
