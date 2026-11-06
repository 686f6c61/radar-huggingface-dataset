# Yusin/TokenGS-Loop-notable-gam

## Resumen

TokenGS-Loop `notable-gam` es un checkpoint de investigación (época 396) de la rama `notable-gam` del proyecto TokenGS-Loop, una variante de LocusGS basada en un bucle de bloques compartidos ("shared-block loop") sin tablas de tokens por elemento. El autor, Yusin, lo publica como material reproducible para reanudar entrenamiento, no como modelo listo para inferencia general. Los tokens y anclas se generan mediante una fórmula basada en puntos de Sobol, y el modelo se entrenó desde cero a partir del codificador de imagen de TokenGS.

El checkpoint contiene 359.609.663 parámetros en formato safetensors (2,9 GB de repositorio) e incluye además los momentos de AdamW (`optimizer.pth`) y el estado del planificador (`scheduler.pth`), lo que confirma su naturaleza de artefacto de entrenamiento. La métrica reportada es PSNR de evaluación de 20,09 (media de las últimas 10 épocas sobre el conjunto de evaluación en tiempo de entrenamiento) y PSNR de entrenamiento de 19,41.

Su relevancia es acotada: no hay pipeline declarado, ni idiomas, ni benchmarks públicos, ni descargas. Resulta útil para quien quiera reproducir o continuar la línea de investigación de representaciones gaussianas con bloques compartidos, pero no constituye un modelo de lenguaje o multimodal desplegable en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LocusGS con bucle de bloques compartidos (TokenGS-Loop); tokens y anclas generados por fórmula con puntos de Sobol; sin tablas de tokens por elemento |
| Parametros totales | 359.609.663 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje; no aplica ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors sin variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (`model.safetensors`), más `optimizer.pth`, `scheduler.pth` y `metadata.json` |

## Arquitectura y entrenamiento

La arquitectura descrita en la model card es TokenGS-Loop, una variante de LocusGS que emplea un bucle de bloques compartidos en lugar de tablas de tokens por elemento. Los tokens y las anclas no se aprenden como tablas independientes, sino que se derivan de una fórmula basada en puntos de Sobol, una secuencia de baja discrepancia habitual en muestreo cuasi-aleatorio. El entrenamiento parte desde cero del codificador de imagen de TokenGS, lo que sitúa el checkpoint en la estirpe de modelos de representación de escenas (campos gaussianos) más que en la de modelos generativos de texto.

El checkpoint corresponde a la época 396 de la rama `notable-gam`. Se publican junto a los pesos los momentos de AdamW y el estado del planificador, lo que permite reanudar el entrenamiento exactamente donde se dejó. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; tampoco se describen innovaciones como decodificación especulativa o atención lineal, que no aplican al paradigma descrito.

## Capacidades

- Reconstrucción y representación de escenas mediante gaussianas: el modelo se entrena con una métrica PSNR, lo que indica una tarea de reconstrucción de imagen o escena.
- Generación de tokens y anclas por fórmula (puntos de Sobol) sin tablas aprendidas por elemento, lo que reduce el estado asociado a tokens.
- Reanudación de entrenamiento: al incluir `optimizer.pth` y `scheduler.pth`, permite continuar el entrenamiento con el estado de AdamW y el planificador intactos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingües, visión general, audio ni modo de pensamiento.
- No se documenta ninguna capacidad de generación de texto, código o matemáticas.

## Casos de uso

- Reproducción de experimentos de investigación: cargar los cuatro ficheros en `<workspace>/checkpoints/checkpoint_latest/` y reanudar el entrenamiento en la época 396 con los momentos de AdamW y el planificador restaurados, tal como indica la model card.
- Estudio de representaciones sin tablas de tokens: comparar esta rama (`notable-gam`) con otras variantes de TokenGS-Loop para medir el efecto de sustituir tablas por puntos de Sobol en la calidad de reconstrucción (PSNR).
- Ablación de inicialización geométrica: usar los puntos de Sobol como inicialización determinista de tokens y anclas y evaluar su impacto frente a inicializaciones aleatorias en tareas de reconstrucción.
- Base para ajuste fino en nuevas escenas: al partir del codificador de imagen de TokenGS y de un estado de entrenamiento completo, sirve como punto de partida para adaptar el modelo a dominios concretos de captura.
- Docencia y divulgación técnica: el par de métricas (PSNR de entrenamiento 19,41 frente a PSNR de evaluación 20,09) permite ilustrar dinámicas de generalización en modelos de reconstrucción.
- Auditoría de recetas de entrenamiento: el documento `NOTABLE_GAM.md` de la rama de código recoge la receta y las mediciones, útil para replicar el pipeline de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas internas de entrenamiento:

| Metrica | Valor | Conjunto |
|---|---|---|
| PSNR de evaluacion | 20,09 | Media de las ultimas 10 epocas, conjunto de evaluacion en tiempo de entrenamiento |
| PSNR de entrenamiento | 19,41 | Conjunto de entrenamiento |

No se proporcionan comparaciones con otros modelos ni resultados en MMLU, HumanEval, GSM8K u otros benchmarks estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 359,6 M de parámetros en safetensors (2,9 GB de repositorio, que incluyen pesos, optimizador y planificador), los pesos en precisión original ocuparían del orden de 1,4 GB en fp32 o 0,7 GB en fp16; el repositorio completo requiere más espacio por los estados del optimizador.
- GPU recomendadas: no disponible. No se documenta ningún requisito de hardware ni configuración de referencia.
- Compatibilidad con GPU de consumo: no confirmada. Por tamaño de parámetros cabría en GPUs de consumo con suficiente VRAM, pero no hay datos publicados que lo verifiquen.
- Opciones de despliegue: no disponible. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; el flujo descrito es de reanudación de entrenamiento, no de servicio de inferencia.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros checkpoints de TokenGS-Loop ni modelos de representación gaussiana comparables con especificaciones publicadas (parámetros, contexto, rendimiento y licencia) que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo multimodal general: no hay evidencia de generación de texto, código, matemáticas, tool calling ni agentes.
- El PSNR reportado (20,09 en evaluación) es una métrica interna sobre el conjunto de evaluación en tiempo de entrenamiento, no un resultado validado de forma independiente; no debe interpretarse como rendimiento de producción.
- El PSNR de entrenamiento (19,41) es inferior al de evaluación (20,09), lo que sugiere posibles diferencias entre conjuntos y complica extrapolar el rendimiento a datos nuevos.
- Riesgo de sobreajuste a la receta y al conjunto de entrenamiento originales; no se documenta la composición del dataset.
- Sin información sobre sesgos: no se han publicado análisis de sesgo ni evaluaciones de robustez.
- Sin información sobre idiomas: la ficha de Hugging Face no declara idiomas soportados.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero el modelo se distribuye como checkpoint de investigación sin garantías de idoneidad para producción.
- El repositorio incluye estados de optimizador y planificador, lo que aumenta el tamaño de descarga respecto a los pesos solos y exige gestionar los cuatro ficheros de forma conjunta para reanudar correctamente.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de comunidad, validación externa ni mantenimiento.

## Enlaces

- Hugging Face: https://huggingface.co/Yusin/TokenGS-Loop-notable-gam
- Documento de receta y mediciones: `NOTABLE_GAM.md` en la rama de código del proyecto (no se proporciona URL directa en la información disponible)
- Paper, blog, repositorio o demo: no disponibles en la información proporcionada
