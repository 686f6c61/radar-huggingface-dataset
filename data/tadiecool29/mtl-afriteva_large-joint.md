# tadiecool29/MTL-afriteva_large-joint

## Resumen

MTL-afriteva_large-joint es un adaptador LoRA publicado por el usuario tadiecool29, obtenido mediante fine-tuning del modelo base castorini/afriteva_large, perteneciente a la familia AfriTeVA orientada a lenguas africanas. El adaptador se entrenó con la librería PEFT sobre un dataset no especificado, y los resultados reportados en evaluación incluyen una pérdida de 0,0633 y un Exact Match de 0,5349, lo que sugiere que fue optimizado para tareas de question answering extractivo.

La ficha se construye a partir de la información disponible en HuggingFace y la model card del autor. No se han publicado detalles sobre licencia, idiomas soportados, arquitectura interna del modelo base ni benchmarks comparativos, por lo que gran parte de los datos técnicos no están disponibles. El adaptador se distribuye en formato safetensors y está diseñado para ser cargado junto con el modelo base mediante la integración de PEFT en Transformers.

La relevancia de este modelo radica en su potencial aplicación a tareas de procesamiento de lenguaje natural en lenguas africanas, aunque su utilidad práctica no puede evaluarse sin una documentación más completa y sin pruebas adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre castorini/afriteva_large (modelo encoder-decoder) |
| Parametros totales | No disponible (tamano del adaptador no especificado; el modelo base tampoco se detalla) |
| Parametros activos | No disponible (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No aplica (adaptador LoRA en precision original) |
| Idiomas soportados | No disponible (el modelo base AfriTeVA esta orientado a lenguas africanas, pero no se confirma) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base castorini/afriteva_large. Este modelo base pertenece a la familia AfriTeVA, una serie de modelos de lenguaje preentrenados para lenguas africanas, aunque no se dispone de detalles sobre su arquitectura interna (número de capas, dimensiones, etc.) en la información proporcionada. El adaptador se entrena con la librería PEFT 0.20.0 y Transformers 5.16.1.

El entrenamiento se realizó durante 5 épocas con un tamaño de lote de 8, una tasa de aprendizaje de 0,0003, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-08, y un scheduler lineal. El dataset de entrenamiento no está especificado. Los resultados de validación muestran una pérdida decreciente de 0,0718 a 0,0633 y un Exact Match que alcanza un máximo de 0,5599 en la época 4, descendiendo ligeramente en la época 5. No se mencionan técnicas adicionales como RLHF o DPO.

## Capacidades

- Generacion de texto: no se documentan capacidades específicas más allá de la tarea de question answering extractivo, inferida por la métrica Exact Match.
- Razonamiento: no hay información sobre capacidades de razonamiento complejo.
- Codigo: no hay evidencia de soporte para generación de código.
- Matematicas: no hay evidencia de capacidades matemáticas.
- Vision: no aplica, es un modelo de texto.
- Tool calling / function calling: no disponible.
- Agentes y multi-step reasoning: no disponible.
- Capacidades multilingues: el modelo base AfriTeVA está diseñado para lenguas africanas, pero no se confirma qué idiomas cubre el adaptador.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- No se han documentado casos de uso específicos para este adaptador. Dado que el modelo base está orientado a lenguas africanas y el entrenamiento se centró en una tarea de question answering (por la métrica Exact Match), podría explorarse su uso en sistemas de respuesta a preguntas en dichos idiomas, pero se requiere una evaluación previa.
- En entornos de investigación, podría utilizarse como punto de partida para fine-tuning adicional en tareas de comprensión de lectura en lenguas africanas, siempre que se disponga de datos etiquetados.
- En aplicaciones de extracción de información en dominios específicos (por ejemplo, documentos legales o médicos en lenguas africanas), el adaptador podría integrarse en pipelines de procesamiento de texto, aunque su rendimiento fuera del conjunto de validación es desconocido.
- Para desarrolladores que trabajen con el ecosistema PEFT, el adaptador puede servir como ejemplo de fine-tuning eficiente sobre modelos grandes, aunque la falta de documentación limita su reutilización directa.
- En proyectos de preservación lingüística o herramientas de asistencia digital para hablantes de lenguas africanas, el modelo podría incorporarse a asistentes virtuales o chatbots, siempre que se valide su precisión.
- No se recomienda su uso en producción sin una evaluación exhaustiva y sin conocer la licencia y los términos de uso.

## Benchmarks y rendimiento

La model card no incluye resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.). Solo se reportan los resultados del entrenamiento en el conjunto de evaluación:

| Metrica | Valor |
|---|---|
| Loss (validacion) | 0,0633 |
| Exact Match | 0,5349 |

| Training Loss | Epoch | Step | Validation Loss | Exact Match |
|:-------------:|:-----:|:----:|:---------------:|:-----------:|
| 0,0649 | 1.0 | 753 | 0,0718 | 0,4576 |
| 0,0646 | 2.0 | 1506 | 0,0716 | 0,4863 |
| 0,0543 | 3.0 | 2259 | 0,0660 | 0,5262 |
| 0,0519 | 4.0 | 3012 | 0,0634 | 0,5599 |
| 0,0488 | 5.0 | 3765 | 0,0633 | 0,5349 |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Al ser un adaptador LoRA, la inferencia requiere cargar el modelo base completo (castorini/afriteva_large). El tamaño de este modelo no se especifica en la información proporcionada, por lo que no se puede estimar la VRAM necesaria.
- No se dispone de datos sobre GPUs recomendadas, latencia o throughput.
- El despliegue puede realizarse mediante la integración de PEFT en Transformers, cargando el adaptador sobre el modelo base. También podría usarse con vLLM u otras herramientas que soporten LoRA, pero no hay confirmación.
- Dado que el adaptador es muy pequeño (tamaño del repo 0.0 GB), el consumo adicional de memoria es mínimo, pero el modelo base domina los requisitos.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El modelo base AfriTeVA tiene variantes (base, large, etc.), pero no se conocen los detalles de esta versión fine-tuneada ni los resultados de modelos comparables en las mismas tareas. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La documentación es extremadamente escasa: no se especifica el dataset de entrenamiento, la licencia, los idiomas soportados ni las capacidades exactas del modelo.
- El modelo se evaluó únicamente con Exact Match y pérdida en un conjunto de validación desconocido; no hay evidencia de rendimiento en datos reales o en otras tareas.
- Al estar entrenado sobre un modelo base orientado a lenguas africanas, es probable que tenga un rendimiento deficiente en otros idiomas, pero no se puede confirmar.
- Existe riesgo de alucinación y sesgos no evaluados, especialmente porque el dataset de entrenamiento no está documentado.
- La licencia no está especificada, lo que impide conocer si se permite el uso comercial o la redistribución. Se recomienda contactar con el autor antes de cualquier uso en producción.
- La falta de benchmarks comparativos impide situar el modelo frente a alternativas existentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tadiecool29/MTL-afriteva_large-joint
- Modelo base: https://huggingface.co/castorini/afriteva_large
