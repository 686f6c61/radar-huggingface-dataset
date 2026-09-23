# sr5434/universal_classifier

## Resumen

sr5434/universal_classifier es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado de google/embeddinggemma-300m, el modelo de embeddings de Google derivado de la familia Gemma 3 con aproximadamente 300 millones de parámetros. El autor (sr5434) lo publica bajo licencia Gemma y con la etiqueta generated_from_trainer, lo que indica que se entrenó con el Trainer de Hugging Face y que la model card se generó de forma automática. Se trata, por tanto, de un modelo pequeño, orientado a clasificación de secuencias, no a generación de texto libre.

El problema que resuelve es acotar embeddinggemma-300m a una tarea concreta de clasificación. El modelo base está diseñado para producir representaciones densas de frases y párrafos, pero no para emitir etiquetas directamente; este fine-tuning añade la cabeza de clasificación necesaria y ajusta los pesos del encoder sobre un conjunto de datos que el autor no documenta. El resultado declarado en la model card es una pérdida de validación de 0,1127 y una accuracy de 0,685, alcanzada tras 22 500 pasos de entrenamiento distribuido en 2 GPU.

Su relevancia práctica es limitada pero real: demuestra el patrón de reutilización de un encoder multilingüe compacto para clasificación, algo habitual en pipelines de moderación de contenido, enrutamiento de tickets o etiquetado de documentos donde el coste de inferencia importa más que la calidad absoluta. El principal caveat es que el repositorio está prácticamente vacío (0,0 GB declarados, 0 descargas, 0 likes), la card no documenta ni el dataset ni las clases de salida, y no hay benchmarks publicados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (base: google/embeddinggemma-300m, derivado de Gemma 3); con cabeza de clasificación de secuencias añadida en el fine-tuning |
| Parametros totales | ~300 M en el modelo base (no confirmado para el checkpoint fine-tuneado; no disponible en la información proporcionada) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base EmbeddingGemma-300M trabaja con secuencias de hasta 2048 tokens |
| Tipos de cuantizacion | No disponible (el modelo base admite cuantización int8 y variantes como QAT, pero el repositorio no publica versiones cuantizadas) |
| Idiomas soportados | No disponible en la model card; el modelo base EmbeddingGemma-300M declara soporte para más de 100 idiomas |
| Licencia | gemma (términos de uso de Gemma, con las restricciones de uso comercial asociadas) |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de google/embeddinggemma-300m, un encoder de ~300 M de parámetros construido sobre Gemma 3 y orientado a la generación de embeddings de texto, con representaciones de 768 dimensiones y pooling sobre la secuencia. El fine-tuning publicado aquí reutiliza ese tronco y lo adapta a una tarea de clasificación; la model card no especifica si se añadió una cabeza lineal sobre el embedding pooled, sobre el token CLS o mediante GemmaForSequenceClassification, ni cuántas clases tiene la tarea objetivo. Tampoco se documenta la composición del dataset, su idioma ni su dominio: la card indica literalmente "unknown dataset" y deja las secciones de descripción, usos previstos y datos de entrenamiento como "More information needed".

Los hiperparámetros sí están documentados y permiten reconstruir parte del proceso. El entrenamiento usó learning rate 2e-05 con scheduler lineal, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08 en su variante fused de PyTorch, semilla 42 y 2 dispositivos en modo multi-GPU. El batch por dispositivo fue de 16, con batch total de 32, y se ejecutaron 22 500 pasos. Dado que el log registra 45 validaciones a intervalos de 500 pasos y el último epoch alcanzado es 0,5934, se deduce que el conjunto de entrenamiento contenía del orden de 1,2 millones de ejemplos, una cifra coherente con una tarea de clasificación a gran escala pero que no puede verificarse con la información aportada. No se menciona ningún uso de RLHF, DPO ni técnicas de alineación; es un fine-tuning supervisado puro sobre entropía cruzada. El entrenamiento muestra un patrón de sobreajuste moderado: la pérdida de entrenamiento cae de 0,3060 a 0,1089 mientras la de validación se estabiliza alrededor de 0,112-0,114 a partir del paso 20 000.

## Capacidades

- Clasificación de secuencias: es la única capacidad confirmada. El modelo emite una etiqueta por entrada de texto, con la cabeza entrenada por el autor.
- Representaciones de texto: hereda del modelo base la capacidad de producir embeddings densos de 768 dimensiones, aunque este checkpoint esté optimizado para la clasificación y no necesariamente para similitud semántica.
- Capacidad multilingüe: potencialmente alta por herencia de EmbeddingGemma-300M (más de 100 idiomas), pero no verificada ni declarada por el autor en este checkpoint.
- Generación de texto: no disponible. El fine-tuning es de clasificación, no instructivo ni generativo.
- Razonamiento, matemáticas y código: no disponible. No hay evidencia de que estas capacidades se hayan preservado tras el ajuste.
- Tool calling y function calling: no soportado.
- Soporte de agentes y razonamiento multi-paso: no soportado.
- Modo thinking, visión o audio: no soportado.

## Casos de uso

- Moderación de contenido a escala: un clasificador de ~300 M de parámetros permite etiquetar grandes volúmenes de texto con un coste de cómputo bajo por petición, muy inferior al de un LLM generativo, aunque la accuracy declarada de 0,685 obliga a usarlo como filtro de primera fase con revisión humana posterior.
- Enrutamiento de tickets de soporte: clasificar la consulta entrante por categoría o departamento antes de asignarla, con latencia de milisegundos en GPU y posibilidad de ejecución en CPU.
- Etiquetado de documentos para búsqueda: asignar categorías temáticas a artículos, contratos o informes en pipelines de indexación por lotes, aprovechando el tronco de embeddings del modelo base.
- Detección de spam o abuso en formularios: clasificación binaria o multiclase de envíos de usuario en tiempo real, integrable como microservicio detrás de un API.
- Análisis de sentimiento y clasificación de reseñas: útil en escenarios donde el dominio y las etiquetas coincidan con los del dataset de entrenamiento, que no está documentado y por tanto debe validarse antes de desplegar.
- Clasificación de intenciones en asistentes conversacionales: predecir la intención antes de invocar un LLM mayor, reduciendo el coste por interacción en sistemas de diálogo con enrutado jerárquico.
- Filtrado previo en pipelines de anotación: preetiquetar datos para que un anotador humano solo revise los casos de baja confianza, acelerando la construcción de datasets.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El model-index del repositorio declara una entrada con la lista de resultados vacía. Los únicos datos numéricos son las métricas de validación del propio entrenamiento, recogidas en la model card:

| Metrica | Valor final |
|---|---|
| Accuracy (evaluación) | 0,685 |
| Loss (evaluación) | 0,1127 |

Evolución de las métricas de validación a lo largo del entrenamiento (subconjunto de los 45 puntos registrados):

| Paso | Epoch | Loss de validación | Accuracy |
|---|---|---|---|
| 500 | 0,0132 | 0,2985 | 0,175 |
| 5000 | 0,1319 | 0,1433 | 0,607 |
| 10000 | 0,2637 | 0,1243 | 0,652 |
| 15000 | 0,3956 | 0,1177 | 0,672 |
| 20000 | 0,5275 | 0,1139 | 0,685 |
| 21000 | 0,5539 | 0,1128 | 0,698 |
| 22500 | 0,5934 | 0,1127 | 0,685 |

La accuracy máxima registrada en el log es 0,698 en el paso 21 000, ligeramente superior al 0,685 del último checkpoint. No hay comparación con otros modelos ni desglose por clase, dominio o idioma.

## Requisitos de hardware

- VRAM para inferencia en fp32: en torno a 1,2-1,3 GB solo para pesos, más las activaciones, que son pequeñas dado el contexto corto.
- VRAM en fp16/bf16: aproximadamente 0,6-0,7 GB de pesos; el modelo completo cabe holgadamente en cualquier GPU con más de 2 GB.
- VRAM en int8: del orden de 0,3-0,4 GB, si se cuantiza manualmente, ya que el repositorio no publica pesos cuantizados.
- GPU recomendadas: cualquier GPU de consumo reciente sirve. Una RTX 3060 (12 GB), RTX 4060, RTX 4090, incluso una GTX 1650 de 4 GB son suficientes. Para lotes grandes en producción, una T4 o L4 de 16-24 GB permite un throughput muy alto.
- Ejecución en CPU: viable. Con 300 M de parámetros, una clasificación por petición se resuelve en decenas de milisegundos en CPU moderna, lo que habilita despliegues sin GPU.
- Opciones de despliegue: transformers con pipeline de clasificación de texto; Text Embeddings Inference (TEI) para la parte de embeddings; vLLM con soporte de modelos de embedding; ONNX Runtime para exportación y cuantización; llama.cpp/Ollama solo si se convierte el modelo a GGUF, algo no publicado por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones en la información proporcionada. Como referencia de orden de magnitud, un encoder de ~300 M suele procesar cientos o miles de secuencias cortas por segundo en una GPU moderna con lotes de tamaño medio, pero esta cifra no está verificada para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| sr5434/universal_classifier | ~300 M (base) | No disponible (base: 2048) | Clasificación de secuencias | Gemma | Repositorio publicado; 0 descargas, 0 likes, 0,0 GB declarados |
| google/embeddinggemma-300m (modelo base) | ~300 M | 2048 tokens | Embeddings de texto | Gemma | Ampliamente disponible y documentado |
| sentence-transformers/all-MiniLM-L6-v2 | 22,7 M | 256 tokens | Embeddings y clasificación vía fine-tuning | Apache 2.0 | Muy extendido, con versiones ONNX y GGUF |
| BAAI/bge-small-en-v1.5 | 33 M | 512 tokens | Embeddings orientados a recuperación | MIT | Ampliamente disponible |

Comparado con el modelo base, este checkpoint pierde generalidad en similitud semántica a cambio de una tarea de clasificación concreta y no documentada, por lo que no puede evaluarse frente a otras alternativas sin conocer el dataset. Frente a MiniLM-L6 o bge-small-en-v1.5, la ventaja sería la cobertura multilingüe heredada de Gemma y un mayor tamaño, a costa de un coste de inferencia entre 9 y 13 veces superior por parámetro y de una licencia más restrictiva que Apache 2.0 o MIT. No hay datos de rendimiento comparativo publicados en la información disponible.

## Limitaciones y advertencias

- Dataset de entrenamiento desconocido: la model card indica explícitamente "unknown dataset". No se puede saber qué clases predice el modelo, en qué dominio se entrenó ni con qué distribución de etiquetas.
- Accuracy moderada: 0,685 en validación implica un 31,5 % de error si la tarea es binaria o de pocas clases. No es un modelo apto para decisiones automatizadas sin supervisión en contextos sensibles.
- Riesgo de sobreajuste: la pérdida de entrenamiento (0,1089) es inferior a la de validación (0,1127) al final, con una curva de validación ya plana desde el paso 20 000, lo que sugiere que más entrenamiento no aportaría mejoras y que puede haber memorización parcial.
- Sesgos: no se han publicado análisis de sesgo ni de equidad. Al derivar de Gemma 3, hereda los sesgos de los datos de preentrenamiento de esa familia, que no son públicos en detalle.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre, pero sí existe riesgo de clasificaciones erróneas con confianza alta, especialmente fuera de la distribución de entrenamiento.
- Limitaciones de idioma: aunque el modelo base declara más de 100 idiomas, el fine-tuning puede haber degradado el rendimiento en idiomas no presentes en el dataset, que se desconoce. No hay ninguna métrica por idioma.
- Licencia Gemma: el uso comercial está sujeto a los términos de uso de Gemma de Google, que incluyen obligaciones de atribución y una política de uso prohibido. No es una licencia permisiva tipo Apache 2.0 o MIT.
- Repositorio sin mantenimiento aparente: 0 descargas, 0 likes, tamaño declarado de 0,0 GB (lo que sugiere que los pesos podrían no estar efectivamente subidos), creado y actualizado el mismo día. La fiabilidad de la publicación es baja.
- Sin versión cuantizada ni formato GGUF: cualquier despliegue en CPU o en entornos con recursos limitados requiere una conversión manual.
- Sin evaluación independiente: ninguna de las métricas procede de una evaluación externa; todas son declaradas por el autor en el propio log de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sr5434/universal_classifier
- Modelo base: https://huggingface.co/google/embeddinggemma-300m

Nota: la búsqueda web realizada no devolvió ningún enlace relevante sobre este modelo, su autor, su dataset o benchmarks asociados. No se dispone de papers, blogs, repositorios de código ni demos adicionales que documenten este checkpoint.
