# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step301

## Resumen

Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step301 es un checkpoint de ajuste fino por preferencias (DPO) publicado por el usuario thkim0305-SNU sobre el modelo base Qwen/Qwen3.5-4B-Base. El objetivo declarado es el *safety tuning*: alinear las respuestas del modelo hacia comportamientos más seguros mediante pares de preferencia etiquetados de forma binaria. El checkpoint corresponde al paso 301 de optimización, tras aproximadamente 3,5 épocas de entrenamiento.

El modelo conserva la naturaleza multimodal del base (pipeline `image-text-to-text`) y sus 4.659.865.088 parámetros totales, con licencia Apache 2.0. Se distribuye en formato safetensors para la librería transformers, con un repositorio de 9,3 GB. No se han publicado datos de benchmarks, idiomas soportados ni detalles sobre la composición exacta del dataset más allá del recuento de pares.

Su relevancia es acotada y experimental: se trata de un artefacto de investigación con cero descargas y cero *likes* en el momento de la consulta, sin documentación de evaluación. Resulta útil como referencia para estudiar recetas de DPO aplicadas a modelos multimodales pequeños, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de Qwen3.5-4B-Base; familia Qwen3.5) |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base (revisión `1001bb4d826a52d1f399e183466143f4da7b741b`) y aplica DPO (Direct Preference Optimization) con beta 0,1, tamaño de lote de 64 pares y tasa de aprendizaje máxima de 1e-6. El entrenamiento se detuvo en el paso 301 de optimización, equivalente a unas 3,5 épocas sobre la mezcla de datos. La exportación incluye los pesos de lenguaje entrenados y preserva los pesos de visión y MTP del modelo base.

Los pares de preferencia se generaron con Qwen3.8-27B como modelo profesor: para cada prompt se produjeron dos respuestas y una puntuación binaria (1 = elegida, 0 = rechazada). La mezcla de entrenamiento abarca ocho conjuntos de datos con 5.493 pares sobre 1.755 prompts. No se especifican la composición temática de esos ocho conjuntos, la longitud de contexto usada durante el entrenamiento ni si se aplicaron etapas adicionales de RLHF o SFT.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Qwen3.5-4B-Base.
- Procesamiento de imagen y texto de entrada (pipeline `image-text-to-text`), al conservarse los pesos de visión.
- Comportamiento alineado hacia respuestas más seguras gracias al ajuste DPO sobre pares etiquetados.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el autor no declara idiomas.
- Modo *thinking*, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación en alineación: servir como punto de comparación entre el modelo base y su versión ajustada con DPO para medir el efecto del *safety tuning* en las respuestas, dado que se publica el paso exacto y los hiperparámetros.
- Estudio de recetas DPO: replicar la configuración (beta 0,1, lr 1e-6, lote de 64 pares, 301 pasos) sobre otros modelos de 4B para evaluar la transferibilidad de la mezcla de ocho datasets.
- Evaluación de destilación de preferencias: analizar cómo se comporta un modelo de 4B entrenado con pares generados por un profesor de 27B, útil para investigar la brecha entre profesor y alumno en tareas de seguridad.
- Prototipado multimodal interno: al conservar los pesos de visión, puede usarse en entornos de laboratorio para tareas de descripción de imágenes o respuesta a consultas sobre imágenes, siempre con validación previa.
- Filtrado de contenido en pipelines de datos: experimentar con el modelo como clasificador generativo de respuestas seguras frente a no seguras en conjuntos de prueba controlados.
- Base para *red teaming* académico: emplear el checkpoint como sujeto de pruebas de robustez ante *jailbreaks* y comparar con el base para cuantificar la mejora en resistencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 9,3 GB solo para pesos (4,66B × 2 bytes), más overhead de activaciones y caché KV; se recomienda al menos 16 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 4,7 GB de pesos; en 4 bits, en torno a 2,4 GB. No obstante, el autor no publica versiones cuantizadas.
- GPU recomendadas: A100 40/80 GB, H100 para despliegues de mayor lote; RTX 4090 (24 GB) y RTX 3090 (24 GB) suficientes en FP16.
- GPU de consumo: cabe en GPUs con 16 GB o más en FP16; en cuantización 4/8 bits podría ejecutarse en tarjetas de 8-12 GB, aunque sin pesos GGUF publicados requiere conversión manual.
- Opciones de despliegue: transformers (formato nativo); vLLM, TGI, llama.cpp u Ollama no están confirmados por el autor y requerirían conversión previa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO (este) | 4,66B | no disponible | Apache 2.0 | safetensors | Checkpoint DPO experimental, sin benchmarks |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible | Apache 2.0 | safetensors | Modelo base sin ajuste de preferencias |
| Qwen3.8-27B (profesor) | ~27B | no disponible | no disponible | no disponible | Usado para generar los pares de preferencia |

No se dispone de datos de rendimiento comparado entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado evaluaciones de seguridad, sesgo ni robustez; el etiquetado de seguridad depende enteramente del criterio del modelo profesor Qwen3.8-27B.
- Riesgo de alucinación no cuantificado; al ser un ajuste DPO sobre un modelo de 4B, persisten las limitaciones del base.
- El ajuste DPO puede degradar capacidades generales (fenómeno de *alignment tax*); no hay datos que lo confirmen o descarten.
- Idiomas soportados no declarados; no se garantiza un comportamiento correcto fuera del inglés o chino del base.
- Longitud de contexto no especificada; no debe asumirse la del modelo base sin verificación.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación hace desaconsejable su despliegue en producción sin auditoría propia.
- Repositorio con cero descargas y sin mantenimiento aparente; posible falta de soporte a largo plazo.
- El nombre del modelo incluye referencias a configuraciones internas (Mixture8, Teacher1, Teacher0) no documentadas en la model card.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step301
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Paper de DPO (referencia del método): https://arxiv.org/abs/2305.18290
