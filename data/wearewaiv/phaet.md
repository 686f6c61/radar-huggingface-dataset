# wearewaiv/phaet

## Resumen
Phaet es un modelo de extracción de características visuales especializado en patología digital, desarrollado por el equipo de WeAreWaiv. Se trata de un ajuste fino (fine-tuning) del modelo base Owkin Phikon-v2, un encoder de visión preentrenado sobre imágenes histopatológicas. Phaet hereda la arquitectura y los pesos del encoder original y los adapta mediante entrenamiento supervisado para tareas de representación de imágenes médicas, manteniendo la interfaz de extracción de features de Hugging Face Transformers.

Con aproximadamente 303 millones de parámetros, Phaet se posiciona como un encoder de tamaño medio (equivalente a un ViT-L) orientado a la generación de embeddings densos para imágenes de tejidos. Su relevancia actual radica en el creciente interés por pipelines de patología computacional que requieren representaciones robustas para clasificación de tejidos, detección de tumores o recuperación de imágenes similares, sin necesidad de entrenar desde cero sobre datasets histológicos de gran escala.

El modelo se distribuye con acceso restringido (gated) en Hugging Face y bajo licencia "other", lo que obliga a revisar las condiciones de uso antes de cualquier despliegue comercial. No se dispone de información pública sobre idiomas, benchmarks ni detalles del dataset de ajuste fino en la información proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de visión (transformers), fine-tuning de owkin/phikon-v2 |
| Parametros totales | 303.351.808 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, sin contexto textual declarado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de imagen, sin procesamiento de lenguaje) |
| Licencia | other (acceso restringido, requiere aceptar condiciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento
Phaet es un encoder de visión basado en transformer, derivado directamente de Owkin Phikon-v2 mediante fine-tuning. El modelo base Phikon-v2 es un encoder preentrenado sobre imágenes histopatológicas con objetivos de representación autosupervisada, y Phaet lo adapta para tareas específicas de extracción de características. El pipeline declarado en Hugging Face es `image-feature-extraction`, lo que confirma que su salida principal son embeddings de imagen y no predicciones textuales.

No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset de ajuste fino, el uso de RLHF/DPO (no aplicable a un encoder de visión) ni innovaciones técnicas específicas como decodificación especulativa o atención lineal. El repositorio incluye código personalizado (`custom_code`) y está etiquetado con `finetuned_encoder`, lo que sugiere que la carga del modelo puede requerir `trust_remote_code=True` en Transformers.

## Capacidades
- Extracción de características (embeddings) de imágenes histopatológicas para tareas downstream.
- Generación de representaciones densas adecuadas para clasificación, clustering y recuperación de imágenes.
- Integración con el ecosistema Hugging Face Transformers mediante el pipeline `image-feature-extraction`.
- Soporte de inferencia en GPU y CPU a través de PyTorch (formato safetensors).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-step.
- No soporta visión generalista (no es un VLM); está especializado en imágenes médicas de patología.
- Capacidades multilingües no aplicables (modelo sin componente textual).

## Casos de uso
- Clasificación de tejidos en patología digital: se extraen embeddings de parches histológicos y se entrena un clasificador ligero (regresión logística o MLP) sobre ellos para distinguir tipos de tejido o subtipos tumorales.
- Recuperación de imágenes similares (image retrieval): los embeddings permiten construir índices vectoriales para buscar parches morfológicamente parecidos en grandes archivos de biopsias.
- Detección de regiones de interés: los features se usan como entrada a modelos de segmentación o detección para localizar áreas tumorales en portaobjetos de patología computacional.
- Preentrenamiento de pipelines de múltiples instancias (MIL): los embeddings de parches alimentan agregadores tipo attention-MIL para diagnóstico a nivel de portaobjetos.
- Control de calidad de datasets histológicos: agrupamiento de parches por similitud para detectar duplicados, artefactos o outliers en colecciones de imágenes médicas.
- Investigación traslacional: generación de representaciones para estudios de asociación entre morfología y variables clínicas, reduciendo la necesidad de entrenar encoders desde cero.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia en FP32: aproximadamente 1,2 GB solo para pesos (303 M de parámetros), más overhead de activaciones; en la práctica, 2-4 GB para lotes pequeños de parches.
- VRAM estimada en FP16/BF16: alrededor de 0,6 GB para pesos, con overhead adicional; cabe holgadamente en GPUs consumer.
- GPU recomendadas: RTX 3060/4060 o superiores para inferencia; A100/H100 solo necesarias para procesar grandes volúmenes de parches en paralelo.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM para lotes moderados.
- Opciones de despliegue: Transformers con PyTorch (requiere `trust_remote_code=True` por el `custom_code`), exportación a ONNX no confirmada, integración en pipelines propios con `AutoModel`.
- Latencia y throughput estimados: no disponibles; dependerán del tamaño de parche y del lote, pero al ser un ViT-L se esperan decenas a cientos de parches por segundo en una RTX 4090.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Especialidad |
|---|---|---|---|---|---|
| wearewaiv/phaet | 303 M | no disponible | other (gated) | Restringido | Patología (fine-tune de Phikon-v2) |
| owkin/phikon-v2 | no disponible en la información | no disponible | no disponible | no disponible | Patología (encoder base) |
| Otros encoders de patología (p. ej. UNI, Virchow) | no disponible en la información | no disponible | no disponible | no disponible | Patología |

No se dispone de datos de benchmarks ni de especificaciones detalladas de los modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias
- Acceso restringido: requiere aceptar condiciones en Hugging Face antes de descargar los pesos.
- Licencia "other": es imprescindible revisar los términos exactos para uso comercial, ya que pueden imponer restricciones adicionales heredadas del modelo base.
- Especialización limitada: no es un modelo de propósito general; su uso fuera de imágenes histopatológicas probablemente degrade la calidad de los embeddings.
- Riesgo de sesgo: al derivar de un dataset histológico concreto, puede heredar sesgos de representación demográfica, de tinción o de equipamiento de los datos originales.
- Sin información sobre el dataset de ajuste fino: no se puede evaluar la cobertura de tejidos, tipos de tinción ni distribución geográfica.
- No apto para diagnóstico clínico directo sin validación regulatoria; su salida son embeddings, no predicciones clínicas.
- Requiere `trust_remote_code=True` por el código personalizado, lo que implica revisar el código antes de ejecutarlo en producción.
- No hay benchmarks publicados que permitan comparar su rendimiento frente a otros encoders de patología.

## Enlaces
- Hugging Face: https://huggingface.co/wearewaiv/phaet
- Modelo base: https://huggingface.co/owkin/phikon-v2
- Paper referenciado en tags (arXiv:2607.22861): https://arxiv.org/abs/2607.22861
