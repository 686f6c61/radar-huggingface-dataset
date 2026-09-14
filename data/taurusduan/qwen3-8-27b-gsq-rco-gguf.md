# taurusduan/Qwen3.8-27B-GSQ-RCO-GGUF

## Resumen

El repositorio `taurusduan/Qwen3.8-27B-GSQ-RCO-GGUF` contiene una colección de cuantizaciones GGUF del modelo multimodal Qwen/Qwen3.8-27B, generadas con los métodos GSQ (Gumbel-Softmax Quantization) y RCO (Riemannian Constrained Optimization) desarrollados en el Deep Algorithms and Systems Lab (DASLab) del Institute of Science and Technology Austria. A diferencia de la cuantización uniforme, que aplica el mismo tipo a todos los tensores, aquí cada tensor recibe su propio tipo de cuantización, asignado mediante una búsqueda basada en gradientes que reparte la precisión según la sensibilidad por tensor y sujeto a un presupuesto de tamaño total.

El modelo base tiene 26.895.998.464 parámetros (~26,9 B) y es multimodal (pipeline `image-text-to-text`): el repositorio incluye el proyector de visión `mmproj` en BF16, compartido por todas las cuantizaciones. Se publican cuatro niveles de compresión (2,50, 2,75, 3,00 y 3,50 bits por peso) que ocupan entre 8,4 GB y 11,8 GB, lo que permite ejecutar un modelo de casi 27.000 millones de parámetros en GPU de consumo. Cada cuantización tiene además una variante opcional `-mtp` que incorpora la cabecera de Multi-Token Prediction para decodificación especulativa en `llama.cpp`.

Su relevancia práctica está en que el punto de operación IQ3_S (3,50 bpw) se declara «task-lossless»: iguala exactamente al modelo BF16 en AIME25 (100,00) y LiveCodeBench v6 (85,71) y queda a 0,51 puntos en GPQA-Diamond, con aproximadamente una quinta parte del tamaño original. Los ficheros son GGUF estándar y funcionan sin modificaciones en `llama.cpp`, Ollama y LM Studio, bajo licencia Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible en detalle; el modelo base es multimodal `image-text-to-text` con codificador de visión y proyector (`mmproj`) |
| Parámetros totales | 26.895.998.464 (~26,9 B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF no uniforme GSQ-RCO: IQ2_XS (2,50 bpw), IQ2_S (2,75 bpw), IQ3_XXS (3,00 bpw), IQ3_S (3,50 bpw); proyector de visión en BF16 (16 bpw); variantes `-mtp` opcionales |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (compatible con `llama.cpp`); el modelo base original se distribuye en safetensors |
| Modelo base | Qwen/Qwen3.8-27B (relación: quantized) |
| Pipeline | image-text-to-text (multimodal, visión) |
| Tamaño del repositorio | 81,4 GB |
| Método de cuantización | GSQ + RCO, con imatrix |

## Arquitectura y entrenamiento

No se proporciona información sobre la arquitectura interna del modelo base (tipo de transformer, mecanismo de atención, si es denso o MoE) ni sobre su proceso de entrenamiento, número de tokens, composición del dataset o fases de alineamiento (RLHF/DPO). Lo que sí se documenta es la naturaleza multimodal del modelo: el repositorio incluye un proyector de visión (`mmproj-Qwen3.8-27B-BF16.gguf`, 0,9 GB) que se combina con cualquiera de las cuantizaciones para habilitar la entrada de imagen y texto.

La innovación técnica destacable está en el pipeline de cuantización, no en el entrenamiento. GSQ es una cuantización escalar de post-entrenamiento que aprende conjuntamente las asignaciones de rejilla por coordenada y las escalas por grupo mediante una relajación Gumbel-Softmax, cerrando buena parte de la brecha entre cuantización escalar y vectorial en 2-3 bits y manteniéndose desplegable en formatos escalares estándar como GGUF. RCO asigna uno de K tipos de cuantización a cada uno de los N tensores bajo un presupuesto de tamaño total; la restricción de presupuesto se reformula como una variedad riemanniana suave en el espacio de logits, lo que permite optimizar directamente sobre la pérdida de tarea imponiendo el presupuesto de forma exacta y sin hiperparámetros específicos de restricción. Como resultado, cada tensor del modelo tiene un tipo de cuantización distinto según su sensibilidad.

Adicionalmente, las variantes `-mtp` (unas 0,35 GB más grandes) incorporan la cabecera de Multi-Token Prediction del modelo para decodificación especulativa en `llama.cpp`; los pesos del modelo son idénticos, por lo que la calidad no cambia.

## Capacidades

- Generación de texto y conversación multi-turno (etiqueta `conversational`).
- Comprensión multimodal de imagen y texto (`image-text-to-text`) mediante el proyector de visión en BF16.
- Razonamiento matemático y de dominio científico: evaluado en AIME25 y GPQA-Diamond.
- Generación de código: evaluado en LiveCodeBench v6 (85,71 en el punto de operación IQ3_S).
- Decodificación especulativa mediante la cabecera MTP en las variantes `-mtp` (aceleración de la inferencia en `llama.cpp`).
- Ejecución local con cuantizaciones de 2,50 a 3,50 bpw, incluyendo hardware de consumo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles; las capacidades multimodales documentadas se limitan a visión.

## Casos de uso

- Asistente multimodal en local: combinar cualquiera de los GGUF con el `mmproj` BF16 permite describir imágenes, responder preguntas sobre capturas o extraer información de documentos escaneados sin enviar datos a servicios externos.
- Razonamiento matemático asistido: el punto IQ3_S mantiene 100,00 en AIME25, por lo que es adecuado para tutoría o verificación de demostraciones donde el presupuesto de VRAM es limitado.
- Generación y revisión de código: con 85,71 en LiveCodeBench v6 en IQ3_S, puede integrarse en entornos de desarrollo local (asistentes de IDE, revisión de parches) conservando el rendimiento del modelo BF16 en esa tarea.
- Despliegue en estaciones de trabajo con GPU de 12 GB: la variante IQ2_XS (8,4 GB) permite servir un modelo de ~26,9 B en hardware modesto, con resultados zero-shot por encima del propio BF16 según el autor.
- Procesamiento por lotes de documentación técnica: los ficheros GGUF se cargan en `llama.cpp` o LM Studio, lo que facilita pipelines de resumen y clasificación de documentos con control total sobre la infraestructura.
- Inferencia de baja latencia con decodificación especulativa: usar los builds `-mtp` en `llama.cpp` para reducir el coste por token en aplicaciones interactivas, sin pérdida de calidad respecto a los pesos equivalentes sin MTP.
- Distribución en entornos sin conectividad: el formato GGUF y el tamaño reducido (8,4-11,8 GB) permiten empaquetar el modelo en equipos aislados o en el borde, algo inviable con los ~54 GB que ocuparía el modelo en BF16.
- Evaluación y comparación de técnicas de cuantización: el repositorio sirve como referencia práctica para estudiar el impacto de la asignación no uniforme de precisión por tensor frente a cuantizaciones uniformes o dinámicas.

## Benchmarks y rendimiento

La model card describe la evaluación frente al modelo base en BF16 y frente a las cuantizaciones Unsloth Dynamic (UD) del mismo modelo base, con perplejidad en wikitext2, C4 y FineWeb-Edu, media de cinco tareas zero-shot (arc_easy, arc_challenge, hellaswag, winogrande, piqa), recuperación relativa al BF16 y tres benchmarks de razonamiento y generación (AIME25, GPQA-Diamond, LiveCodeBench v6). Sin embargo, solo se detallan cifras concretas para algunos puntos.

| Modelo | bpw | Tamaño | AIME25 | GPQA-Diamond | LiveCodeBench v6 |
|---|---|---|---|---|---|
| BF16 (base) | 16 | no indicado | 100,00 | referencia | 85,71 |
| GSQ-RCO IQ3_S | 3,50 | 11,8 GB | 100,00 (igual que el base) | dentro de 0,51 puntos del base | 85,71 (igual que el base) |
| GSQ-RCO IQ3_XXS | 3,00 | 10,1 GB | no disponible | no disponible | no disponible |
| GSQ-RCO IQ2_S | 2,75 | 9,3 GB | iguala al modelo base | no disponible | no disponible |
| GSQ-RCO IQ2_XS | 2,50 | 8,4 GB | no disponible | no disponible | no disponible |
| Unsloth Dynamic (UD) | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: el autor indica que IQ2_XS queda por encima del baseline BF16 en la media de tareas zero-shot, pero no se incluyen en la información disponible las tablas completas de perplejidad ni los valores de recuperación. No se han publicado en la información disponible los resultados restantes de benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia: los tamaños de fichero son 8,4 GB (IQ2_XS), 9,3 GB (IQ2_S), 10,1 GB (IQ3_XXS) y 11,8 GB (IQ3_S); a ellos se suman 0,9 GB del proyector de visión si se usa el modo multimodal y el espacio de caché KV, que crece con la longitud de contexto. Como referencia orientativa, se necesitan del orden de 10-14 GB de VRAM para las variantes pequeñas con contexto corto y 16-24 GB para IQ3_S con contexto largo.
- GPU recomendadas: RTX 3060 12 GB o RTX 4070 para IQ2_XS e IQ2_S; RTX 4080 / RTX 4090 (16-24 GB) para IQ3_XXS e IQ3_S; A100, H100 o L40S si se requiere servir varias instancias o contextos muy largos.
- ¿Cabe en GPU de consumo? Sí: las cuatro cuantizaciones están diseñadas para ello, desde 8,4 GB. El modelo en BF16 (~54 GB solo de pesos) no cabría en una GPU de consumo.
- Opciones de despliegue: `llama.cpp`, Ollama y LM Studio de forma explícita según la model card. La compatibilidad con vLLM o TGI no está confirmada en la información disponible; la decodificación especulativa con la cabecera MTP está soportada en `llama.cpp`.
- Latencia y throughput: no disponibles; dependerán de la GPU, del contexto y de si se activa la decodificación especulativa con los builds `-mtp`.
- Almacenamiento: los ficheros individuales ocupan entre 8,4 GB y 11,8 GB; el repositorio completo declara 81,4 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Tamaño en disco | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GSQ-RCO IQ3_S (este repositorio) | ~26,9 B | 11,8 GB (3,50 bpw) | no disponible | Apache-2.0 | GGUF en HuggingFace |
| GSQ-RCO IQ2_XS (este repositorio) | ~26,9 B | 8,4 GB (2,50 bpw) | no disponible | Apache-2.0 | GGUF en HuggingFace |
| Qwen3.8-27B BF16 (base) | 26.895.998.464 | ~54 GB estimados | no disponible | no disponible en la información | safetensors |
| Unsloth Dynamic (UD) del mismo base | ~26,9 B | no disponible | no disponible | no disponible | mencionado como baseline, sin cifras |

No se dispone de datos de otros modelos comparables de la misma categoría en la información proporcionada, ni de los resultados de las cuantizaciones UD con las que el autor compara, por lo que la comparación cuantitativa con alternativas queda como no disponible.

## Limitaciones y advertencias

- Este repositorio es una publicación del usuario `taurusduan`; la model card y los enlaces apuntan al repositorio original de ISTA-DASLab. Conviene verificar la procedencia de los ficheros antes de usarlos en producción.
- El tamaño del repositorio (81,4 GB) es muy superior a la suma de los ficheros listados en la model card (aproximadamente 42 GB incluyendo los builds `-mtp`), lo que sugiere la presencia de ficheros adicionales o duplicados; revisar el listado real antes de descargar.
- Estado de validación de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin señal de validación independiente.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones de veracidad ni de seguridad.
- Sesgos: no se documenta ningún análisis de sesgos ni de comportamiento en dominios sensibles.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento fuera del inglés.
- Longitud de contexto: no disponible; afecta directamente a los requisitos de VRAM por el crecimiento de la caché KV.
- Degradación por cuantización: los puntos de 2,50 y 2,75 bpw priorizan el tamaño sobre la fidelidad; el propio autor describe IQ3_S como el punto «task-lossless», lo que implica que las variantes inferiores no lo son.
- Restricciones de licencia: los pesos se publican bajo Apache-2.0, que permite uso comercial, pero el modelo base Qwen/Qwen3.8-27B tiene su propia licencia que no se detalla en la información disponible; conviene comprobarla antes de un despliegue comercial. El proyector de visión `mmproj` se distribuye en BF16 y debe respetar la licencia del modelo original.
- Compatibilidad de despliegue: confirmada para `llama.cpp`, Ollama y LM Studio; otras pilas de servicio (vLLM, TGI) no están verificadas en la documentación.
- Las cifras de benchmark proceden exclusivamente del autor del método de cuantización; no hay reproducción independiente en la información disponible.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/taurusduan/Qwen3.8-27B-GSQ-RCO-GGUF
- Repositorio original referenciado en la model card: https://huggingface.co/ISTA-DASLab/Qwen3.8-27B-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Paper de GSQ (Gumbel-Softmax Quantization): https://arxiv.org/abs/2604.18556
- Paper de RCO (Riemannian Constrained Optimization): https://arxiv.org/abs/2605.00649
- Código de GSQ: https://github.com/IST-DASLab/GSQ
- Código de RCO: https://github.com/IST-DASLab/RCO
- Laboratorio (DASLab, IST Austria): https://github.com/IST-DASLab
