# visumania2/RoBERTa-DeepSexist

## Resumen

El modelo `visumania2/RoBERTa-DeepSexist` es un clasificador de texto basado en la arquitectura RoBERTa, adaptado para el idioma español. Su nombre sugiere que está orientado a la detección de contenido sexista en textos, aunque la información pública disponible no especifica la tarea exacta ni el conjunto de datos de entrenamiento. El modelo cuenta con 124,6 millones de parámetros y un tamaño de repositorio de 0,5 GB, lo que lo sitúa en la gama de modelos transformer de tamaño medio, similar a otros fine-tunings de RoBERTa.

A pesar de que la ficha de HuggingFace es mínima (solo indica idioma y pipeline), el modelo se presenta como una herramienta potencial para tareas de moderación de contenido, análisis de sesgos de género o investigación en detección de discurso de odio. Sin embargo, la ausencia de documentación detallada, licencia y benchmarks limita su evaluación objetiva y su adopción en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa (transformer encoder) |
| Parametros totales | 124.647.170 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (probablemente 512 tokens, típico de RoBERTa) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | es (español) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

RoBERTa es una variante de BERT que mejora el preentrenamiento mediante enmascaramiento dinámico, empaquetado de frases, lotes más grandes y un tokenizador BPE a nivel de bytes. El modelo `RoBERTa-DeepSexist` es un fine-tuning de un checkpoint de RoBERTa preentrado en español, aunque no se especifica qué checkpoint base se utilizó ni el proceso de entrenamiento (épocas, datos, función de pérdida, etc.). No hay información sobre si se aplicaron técnicas como RLHF o DPO; probablemente se trata de un ajuste fino supervisado estándar para clasificación de texto.

## Capacidades

- Clasificación de texto en español, probablemente binaria o multiclase para detectar contenido sexista.
- Procesamiento de secuencias de hasta 512 tokens (suposición basada en la arquitectura RoBERTa, no confirmada).
- Salida de logits para clasificación, utilizable con softmax para obtener probabilidades.
- No se han documentado capacidades adicionales como generación de texto, tool calling o soporte multimodal.

## Casos de uso

- Moderación de comentarios en redes sociales: el modelo podría integrarse en pipelines de moderación para filtrar mensajes sexistas, aunque su eficacia no está validada públicamente.
- Análisis de sesgos de género en textos periodísticos o literarios: permitiría etiquetar automáticamente fragmentos con lenguaje discriminatorio.
- Investigación académica en lingüística computacional: como herramienta de anotación automática para corpus de discurso de odio.
- Auditoría de contenido en plataformas de empleo o foros: para detectar lenguaje excluyente en ofertas o interacciones.
- Filtrado de contenido en aplicaciones de citas o redes sociales: para reducir experiencias de acoso.
- Evaluación de políticas de igualdad: análisis de documentos institucionales para identificar sesgos de género.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de precisión, recall, F1 ni comparaciones con otros modelos en tareas de detección de sexismo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en FP32 (124M parámetros), menos de 0,3 GB en cuantización de 8 bits.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También puede ejecutarse en CPU con latencia aceptable para inferencia por lotes.
- Compatible con consumer GPUs: sí, incluso en tarjetas de gama baja.
- Opciones de despliegue: Hugging Face Transformers, ONNX Runtime, TorchServe, o mediante contenedores Docker con FastAPI.
- Latencia estimada: en una GPU moderna (RTX 3090), la inferencia de una secuencia de 512 tokens tarda unos pocos milisegundos; en CPU puede ser de 50-200 ms.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable. Modelos como `dccuchile/bert-base-spanish-wwm-uncased` o `PlanTL-GOB-ES/roberta-base-bne` son alternativas comunes para clasificación de texto en español, pero no se conocen sus resultados específicos en detección de sexismo. Se recomienda evaluar el modelo en un conjunto de validación propio antes de elegirlo.

## Limitaciones y advertencias

- No se ha publicado la licencia, lo que impide conocer las restricciones de uso comercial o modificación.
- No hay documentación sobre el conjunto de datos de entrenamiento, por lo que se desconocen posibles sesgos (por ejemplo, dominio específico, desequilibrio de clases, o cobertura limitada de variantes dialectales del español).
- Riesgo de alucinación o falsos positivos/negativos en la clasificación, especialmente si el modelo no fue entrenado con datos representativos de todos los contextos.
- Longitud de contexto limitada a 512 tokens (si se confirma la arquitectura RoBERTa), lo que impide procesar documentos largos de una sola pasada.
- Sin benchmarks publicados, no se puede garantizar su rendimiento en producción.
- El nombre "DeepSexist" sugiere una tarea específica, pero no hay evidencia de que el modelo haya sido evaluado externamente.

## Enlaces

- [HuggingFace - visumania2/RoBERTa-DeepSexist](https://huggingface.co/visumania2/RoBERTa-DeepSexist)
- [GitHub - visumania/DeepSexist](https://github.com/visumania/DeepSexist)
- [Documentación de RoBERTa en Hugging Face](https://huggingface.co/docs/transformers/model_doc/roberta)
