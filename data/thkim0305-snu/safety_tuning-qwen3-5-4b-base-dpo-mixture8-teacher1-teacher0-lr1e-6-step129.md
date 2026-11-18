# thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step129

## Resumen

El modelo `Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step129`, publicado por el usuario thkim0305-SNU, es un ajuste fino por preferencias (DPO, *Direct Preference Optimization*) sobre el modelo base Qwen/Qwen3.5-4B-Base. Se trata de un checkpoint intermedio: concretamente, el estado del entrenamiento tras 129 actualizaciones del optimizador, equivalentes a 1,5 épocas sobre una mezcla de ocho conjuntos de datos de preferencias. El objetivo declarado es el *safety tuning*: alinear las respuestas del modelo hacia comportamientos considerados seguros mediante pares de respuestas etiquetadas de forma binaria.

El modelo conserva la naturaleza multimodal del base, ya que el pipeline declarado es `image-text-to-text` y el export preserva los pesos de visión y de MTP (*multi-token prediction*) del modelo original, además de los pesos de lenguaje entrenados. Con 4.659.865.088 parámetros totales y un repositorio de 9,3 GB en safetensors, se posiciona en la gama de modelos de ~4B con capacidades de imagen y texto, lo que lo hace desplegable en hardware de consumo con cuantización.

La relevancia de esta ficha es doble: por un lado, documenta una receta reproducible de DPO para seguridad sobre un modelo Qwen 3.5; por otro, advierte de que se trata de un artefacto de investigación con cero descargas y sin datos publicados de benchmarks ni de idiomas soportados, por lo que su uso en producción exigiría una evaluación propia exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.5), con torre de visión y cabezas MTP; pesos de lenguaje ajustados por DPO |
| Parametros totales | 4.659.865.088 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base en la revisión `1001bb4d826a52d1f399e183466143f4da7b741b` y aplica DPO con beta 0,1, tamaño de lote de 64 pares y tasa de aprendizaje máxima de 1e-6. El entrenamiento se detuvo en la actualización 129 del optimizador (1,5 épocas). La mezcla de datos comprende ocho conjuntos de preferencias con un total de 5.493 pares sobre 1.755 prompts. Para cada prompt, ambas respuestas (elegida y rechazada) fueron generadas por Qwen3.8-27B, y una puntuación binaria asignó 1 a la respuesta elegida y 0 a la rechazada.

El export incluye los pesos de lenguaje entrenados y preserva los pesos de visión y de MTP del modelo base, de modo que la arquitectura subyacente sigue siendo la del Qwen3.5-4B-Base multimodal. No se documentan innovaciones adicionales como decodificación especulativa o atención lineal más allá de lo que aporte el propio base, ni se detalla la composición exacta de los ocho datasets ni el número total de tokens vistos.

## Capacidades

- Generación de texto conversacional en formato multi-turno, heredada del base Qwen3.5-4B-Base.
- Procesamiento de imagen y texto (`image-text-to-text`), al conservarse la torre de visión del modelo original.
- Razonamiento y generación de código y matemáticas en la medida en que lo soporte el modelo base; no se aportan evaluaciones específicas tras el DPO.
- Ajuste orientado a seguridad: el DPO se entrenó con pares de respuestas puntuadas binariamente, lo que busca favorecer respuestas consideradas seguras frente a las rechazadas.
- Soporte de *tool calling* / *function calling*: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Modo *thinking* explícito: no disponible en la información proporcionada.

## Casos de uso

- Investigación en alineación y seguridad: el checkpoint permite estudiar el efecto de 129 pasos de DPO sobre un base de 4B con una mezcla de ocho datasets, comparando respuestas antes y después del ajuste en un entorno controlado.
- Evaluación de recetas de DPO: sirve como punto de referencia para reproducir hiperparámetros (beta 0,1, lote de 64 pares, lr 1e-6) y medir su impacto en la tasa de respuestas inseguras.
- Filtrado y moderación de contenido en prototipos: al haberse entrenado con pares etiquetados por seguridad, puede emplearse como generador de respuestas candidatas que luego se validen con un clasificador externo.
- Experimentos multimodales de bajo coste: al conservar la torre de visión, permite probar flujos imagen-texto en una GPU de consumo con cuantización, útil para prototipos de descripción de imágenes o respuesta a preguntas visuales.
- Generación de datos sintéticos para *safety tuning*: el modelo puede producir pares de respuestas que un anotador o un juez automático puntúe, alimentando nuevas iteraciones de DPO.
- Despliegue en entornos de investigación con requisitos de licencia permisiva: la licencia apache-2.0 facilita su uso en laboratorios y proyectos internos sin las restricciones de licencias copyleft o de uso limitado.
- *Baseline* en comparativas de modelos pequeños: por su tamaño de ~4,6B parámetros, es adecuado como referencia en estudios que comparen modelos de la misma escala en tareas de seguridad y multimodalidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: en torno a 9,3 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda un mínimo de 16-20 GB para contexto moderado.
- VRAM estimada en cuantización de 8 bits: aproximadamente 5-6 GB de pesos, viable en GPUs de 12 GB con contexto corto.
- VRAM estimada en cuantización de 4 bits: aproximadamente 3 GB de pesos, aunque no se publican pesos GGUF ni AWQ/GPTQ oficiales, por lo que habría que generarlos.
- GPU recomendadas para fp16: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para contextos amplios.
- GPU de consumo: cabe en RTX 4090, RTX 4080, RTX 3090 y, con cuantización agresiva, en GPUs de 12 GB como RTX 3060 o RTX 4070.
- Opciones de despliegue: transformers (librería declarada), y potencialmente vLLM o TGI si se confirma compatibilidad con la arquitectura qwen3_5; llama.cpp/Ollama requerirían convertir los pesos a GGUF, algo no documentado por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Safety_Tuning-Qwen3.5-4B-Base-DPO (este) | 4,66B | no disponible | imagen-texto | apache-2.0 | Checkpoint DPO de 129 pasos, sin benchmarks publicados |
| Qwen/Qwen3.5-4B-Base | ~4B | no disponible en esta ficha | imagen-texto | apache-2.0 (según base) | Modelo base sin ajuste de preferencias |
| Alternativas de ~4B con DPO | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento con alternativas concretas; la comparación se limita a parámetros, licencia y modalidad.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al derivar de Qwen3.5-4B-Base, hereda los sesgos del base y de los datos de preferencias generados por Qwen3.8-27B.
- Riesgo de alucinación: no evaluado; el DPO no elimina la tendencia del base a generar contenido factualmente incorrecto.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se declaran, lo que impide garantizar un comportamiento multilingüe o contextos largos.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni evaluación de seguridad; el uso en producción exige auditoría propia.
- Checkpoint intermedio: 129 pasos y 1,5 épocas no constituyen un entrenamiento completo; el modelo puede estar infraajustado respecto a recetas de DPO más largas.
- Datos de preferencias sintéticos: las respuestas elegidas y rechazadas provienen de otro modelo (Qwen3.8-27B) y de una puntuación binaria, lo que puede introducir sesgos del profesor y ruido en el etiquetado.
- Cero descargas y cero likes: no hay evidencia de uso comunitario ni validación externa; la reproducibilidad depende de la revisión del base citada.
- Compatibilidad de despliegue: al ser una arquitectura qwen3_5 reciente, puede requerir versiones específicas de transformers y no estar soportada aún por todos los motores de inferencia.

## Enlaces

- Hugging Face: https://huggingface.co/thkim0305-SNU/Safety_Tuning-Qwen3.5-4B-Base-DPO-Mixture8-Teacher1-Teacher0-lr1e-6-step129
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Revisión del base citada: `1001bb4d826a52d1f399e183466143f4da7b741b`
- Paper de DPO (referencia del método): no disponible en la información proporcionada
- Repositorio de código o demo: no disponible en la información proporcionada
